import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { hasPermission, Actions, Resources } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';

// User creation schema
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['ADMIN', 'STAFF', 'NOTARY', 'CLIENT']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  sendInvite: z.boolean().default(true),
});

// User update schema
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'NOTARY', 'CLIENT']).optional(),
});

/**
 * GET /api/auth/users
 * List all users (Admin/Staff only)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check permission to view users
    if (!hasPermission(user, Actions.READ, Resources.USER)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const role = searchParams.get('role') as Role | null;
      const search = searchParams.get('search');

      // Build where clause
      const whereClause: any = {};
      
      if (role) {
        whereClause.role = role;
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            emailVerified: true,
            // Don't include password in response
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          role,
          search,
        }
      });

    } catch (error) {
      console.error('User list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  }, AuthConfig.staffOrAdmin());
}

/**
 * POST /api/auth/users
 * Create new user (Admin only)
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check permission to create users
    if (!hasPermission(user, Actions.CREATE, Resources.USER)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = createUserSchema.parse(body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Prepare user data
      const userData: any = {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role as Role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Hash password if provided
      if (validatedData.password) {
        userData.password = await bcrypt.hash(validatedData.password, 12);
      }

      // Create user
      const newUser = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailVerified: true,
        }
      });

      // TODO: Send invitation email if sendInvite is true
      if (validatedData.sendInvite) {
        console.log(`TODO: Send invitation email to ${newUser.email}`);
      }

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: newUser,
      }, { status: 201 });

    } catch (error) {
      console.error('User creation error:', error);

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
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
  }, AuthConfig.adminOnly());
} 