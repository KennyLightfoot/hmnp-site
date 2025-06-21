import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { hasPermission, Actions, Resources } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Role } from '@prisma/client';

// User update schema
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'NOTARY', 'CLIENT']).optional(),
});

/**
 * GET /api/auth/users/[id]
 * Get specific user details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async ({ user, context: authContext }) => {
    if (!authContext.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const params = await context.params;
      const userId = params.id;

      // Get target user
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
        }
      });

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check permission to view this user
      const canViewUser = hasPermission(user, Actions.READ, Resources.USER, targetUser) ||
                          (authContext.isAuthenticated && authContext.userId === userId); // Can view own profile

      if (!canViewUser) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      return NextResponse.json({
        user: targetUser,
        permissions: {
          canUpdate: hasPermission(user, Actions.UPDATE, Resources.USER, targetUser),
          canDelete: hasPermission(user, Actions.DELETE, Resources.USER, targetUser),
          canChangeRole: hasPermission(user, Actions.MANAGE, Resources.USER, targetUser),
        }
      });

    } catch (error) {
      console.error('User fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }
  }, AuthConfig.authenticated());
}

/**
 * PATCH /api/auth/users/[id]
 * Update specific user
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async ({ user, context: authContext }) => {
    if (!authContext.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const params = await context.params;
      const targetUserId = params.id;
      const body = await request.json();
      const validatedData = updateUserSchema.parse(body);

      // Get target user
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, role: true }
      });

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check permission to update this user
      const canUpdateUser = hasPermission(user, Actions.UPDATE, Resources.USER, targetUser) ||
                            (authContext.isAuthenticated && authContext.userId === targetUserId); // Can update own profile

      if (!canUpdateUser) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      // Special checks for role changes
      if (validatedData.role && validatedData.role !== targetUser.role) {
        // Only admins can change roles
        if (!hasPermission(user, Actions.MANAGE, Resources.USER, targetUser)) {
          return NextResponse.json(
            { error: 'Only admins can change user roles' },
            { status: 403 }
          );
        }

        // Can't change your own role
        if (authContext.userId === targetUserId) {
          return NextResponse.json(
            { error: 'Cannot change your own role' },
            { status: 400 }
          );
        }
      }

      // Check email uniqueness if changing email
      if (validatedData.email && validatedData.email !== targetUser.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email }
        });

        if (existingUser) {
          return NextResponse.json(
            { error: 'Email already in use' },
            { status: 400 }
          );
        }
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (validatedData.name) updateData.name = validatedData.name;
      if (validatedData.email) {
        updateData.email = validatedData.email;
        updateData.emailVerified = null; // Reset email verification
      }
      if (validatedData.role) updateData.role = validatedData.role as Role;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
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
        message: 'User updated successfully',
        user: updatedUser,
      });

    } catch (error) {
      console.error('User update error:', error);

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
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
  }, AuthConfig.authenticated());
}

/**
 * DELETE /api/auth/users/[id]
 * Delete/deactivate specific user (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async ({ user, context: authContext }) => {
    if (!authContext.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const params = await context.params;
      const targetUserId = params.id;

      // Get target user
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, role: true }
      });

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check permission to delete this user
      if (!hasPermission(user, Actions.DELETE, Resources.USER, targetUser)) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      // Can't delete yourself
      if (authContext.userId === targetUserId) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        );
      }

      // Check if user has active bookings or assignments
      const [activeBookings, activeAssignments] = await Promise.all([
        prisma.booking.count({
          where: {
            signerId: targetUserId,
            status: { in: ['CONFIRMED', 'PAYMENT_PENDING', 'IN_PROGRESS'] }
          }
        }),
        prisma.assignment.count({
          where: {
            partnerAssignedToId: targetUserId,
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
          }
        })
      ]);

      if (activeBookings > 0 || activeAssignments > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete user with active bookings or assignments',
            details: {
              activeBookings,
              activeAssignments
            }
          },
          { status: 400 }
        );
      }

      // Soft delete - modify email to prevent conflicts
      const deletedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          email: `deleted_${Date.now()}_${targetUser.email}`, // Prevent email conflicts
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
        user: deletedUser,
      });

    } catch (error) {
      console.error('User deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  }, AuthConfig.adminOnly());
} 