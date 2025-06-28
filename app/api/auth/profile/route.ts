import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { hasPermission, Actions, Resources } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// Profile update validation schema
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
  }).optional(),
});

/**
 * GET /api/auth/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const userProfile = await prisma.User.findUnique({
        where: { id: context.userId! },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          // Add any other profile fields you have
        }
      });

      if (!userProfile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        user: userProfile,
        permissions: {
          canUpdateProfile: hasPermission(user, Actions.UPDATE, Resources.USER, userProfile),
          canViewBookings: hasPermission(user, Actions.READ, Resources.BOOKING),
          canAccessAdmin: hasPermission(user, Actions.READ, Resources.ADMIN_PANEL),
        }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }
  }, AuthConfig.authenticated());
}

/**
 * PATCH /api/auth/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const body = await request.json();
      const validatedData = updateProfileSchema.parse(body);

      // Get current user data
      const currentUser = await prisma.User.findUnique({
        where: { id: context.userId! },
        select: { id: true, email: true, password: true }
      });

      if (!currentUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check permission to update profile
      if (!hasPermission(user, Actions.UPDATE, Resources.USER, currentUser)) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Handle name update
      if (validatedData.name) {
        updateData.name = validatedData.name;
      }

      // Handle email update (check for uniqueness)
      if (validatedData.email && validatedData.email !== currentUser.email) {
        const existingUser = await prisma.User.findUnique({
          where: { email: validatedData.email }
        });

        if (existingUser) {
          return NextResponse.json(
            { error: 'Email already in use' },
            { status: 400 }
          );
        }

        updateData.email = validatedData.email;
        updateData.emailVerified = null; // Reset email verification
      }

      // Handle password update
      if (validatedData.newPassword) {
        if (!validatedData.currentPassword) {
          return NextResponse.json(
            { error: 'Current password required to set new password' },
            { status: 400 }
          );
        }

        if (!currentUser.password) {
          return NextResponse.json(
            { error: 'Account does not have a password set' },
            { status: 400 }
          );
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
          validatedData.currentPassword,
          currentUser.password
        );

        if (!isCurrentPasswordValid) {
          return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
          );
        }

        // Hash new password
        updateData.password = await bcrypt.hash(validatedData.newPassword, 12);
      }

      // Update user
      const updatedUser = await prisma.User.update({
        where: { id: context.userId! },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
          emailVerified: true,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      });

    } catch (error) {
      console.error('Profile update error:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        }, { status: 400 });
      }

      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
  }, AuthConfig.authenticated());
} 