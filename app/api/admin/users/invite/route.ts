import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

// POST /api/admin/users/invite
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authorization Check: Only Admins can invite users
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Parse Request Body for email and role
  let email: string;
  let role: Role;
  try {
    const body = await request.json();
    email = body.email;
    role = body.role;

    // Validate email format (basic)
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate role
    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 3. Check if user already exists
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true } // Only need to check existence
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 }); // 409 Conflict
    }

    // 4. Create the new user
    // Note: This user won't be able to log in until they set a password via an invite link (not implemented here)
    // or if using an OAuth provider associated with this email.
    // Setting emailVerified to null initially.
    const newUser = await prisma.user.create({
      data: {
        email: email,
        role: role,
        emailVerified: null, // Mark as not verified initially
        // name can be added later during onboarding/profile setup
      },
      select: { // Return the created user's basic info
        id: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // TODO: Implement email sending with an invitation token/link here
    // using Resend or another email service.

    return NextResponse.json(newUser, { status: 201 }); // 201 Created

  } catch (error) {
    console.error(`Failed to invite user ${email}:`, error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 