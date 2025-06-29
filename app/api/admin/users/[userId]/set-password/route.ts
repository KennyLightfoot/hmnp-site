import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Standard recommendation for bcrypt

// PUT /api/admin/users/[userId]/set-password
export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const userId = params.userId;

  // 1. Authorization Check: Only Admins can set passwords
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Prevent Admin from locking themselves out (optional but good practice)
  // if (session.user.id === targetUserId) {
  //   return NextResponse.json({ error: 'Admin cannot change their own password via this endpoint.' }, { status: 400 });
  // }

  // 3. Parse Request Body for the new password
  let password: string;
  try {
    const body = await request.json();
    password = body.password;

    // Basic password validation (e.g., minimum length)
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    // 4. Check if target user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }, // Only select necessary field
    });

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 5. Hash the new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 6. Update the user's password in the database
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error("Failed to set user password:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 