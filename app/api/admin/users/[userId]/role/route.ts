import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

// PUT /api/admin/users/[userId]/role
export async function PUT(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params;
  const userId = params.userId;
  const session = await getServerSession(authOptions);

  // 1. Authorization Check: Only Admins can change roles
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Prevent admin from changing their own role via this endpoint?
  // if (session.user.id === userId) {
  //   return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  // }

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 2. Parse Request Body for new role
  let newRole: Role;
  try {
    const body = await request.json();
    newRole = body.role;

    // Validate the role
    if (!newRole || !Object.values(Role).includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 3. Update User Role in Database
  try {
    const updatedUser = await prisma.User.update({
      where: {
        id: userId,
      },
      data: {
        role: newRole,
      },
      select: { // Return only necessary fields
        id: true,
        role: true,
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error: any) {
    // Handle potential errors, e.g., user not found
    if (error.code === 'P2025') { // Prisma code for record not found
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error(`Failed to update role for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
} 