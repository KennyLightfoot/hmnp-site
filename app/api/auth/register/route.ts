import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { RateLimitService } from '@/lib/auth/rate-limit';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const SALT_ROUNDS = 10;

// Enhanced validation schema
const registerSchema = z.object({
  email: z.string().trim().email('Valid email is required').max(254),
  // At least 8 chars, 1 letter, 1 number
  password: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/,
      'Password must be at least 8 characters and contain letters and numbers'),
  role: z.enum(['STAFF', 'NOTARY', 'PARTNER', 'SIGNER']),
  name: z.string().trim().min(1, 'Name is required').max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for registration
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimitResult = await RateLimitService.checkLimit(
      clientIP,
      'register'
    );

    if (!rateLimitResult.success) {
      return NextResponse.json({
        error: 'Too many registration attempts',
        message: 'Please try again later',
        retryAfter: rateLimitResult.resetTime
      }, { status: 429 });
    }

    const body = await request.json();
    const { email, password, role, name } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role as Role,
        name: name || null,
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 