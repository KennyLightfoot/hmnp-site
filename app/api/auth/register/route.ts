import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, name } = body;

    // 1. Validate input
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (role === Role.ADMIN) {
        return NextResponse.json({ error: 'Cannot register as ADMIN via this route' }, { status: 403 });
    }

    if (![Role.STAFF, Role.PARTNER].includes(role)) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role,
        name: name || null, // Optional name field
        emailVerified: new Date(), // Mark email as verified immediately
      },
      select: { // Only return essential, non-sensitive fields
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    // Differentiate between known errors and unexpected ones
    if (error instanceof SyntaxError) { // Catches errors from request.json() if body is not valid JSON
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 