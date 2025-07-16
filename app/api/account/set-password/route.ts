import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const SALT_ROUNDS = 10;

const passwordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/,
      'Password must be at least 8 characters and contain letters and numbers'),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id as string;

  let parsed;
  try {
    const body = await request.json();
    parsed = passwordSchema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If user already had a password, require currentPassword match
    if (user.password) {
      if (!parsed.currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      }
      const match = await bcrypt.compare(parsed.currentPassword, user.password);
      if (!match) return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(parsed.newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 