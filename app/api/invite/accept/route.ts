import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // 1. Find the invitation token
    const invitationToken = await prisma.invitationToken.findUnique({
      where: { token },
    });

    if (!invitationToken) {
      return NextResponse.json({ error: 'Invalid or expired invitation token' }, { status: 400 });
    }

    // 2. Check if the token has expired
    if (new Date() > new Date(invitationToken.expiresAt)) {
      // Optionally delete the expired token
      await prisma.invitationToken.delete({ where: { id: invitationToken.id } });
      return NextResponse.json({ error: 'Invitation token has expired' }, { status: 400 });
    }

    // 3. Check if there's a user associated with the token
    if (!invitationToken.userId) {
        // This case should ideally not happen if tokens are created correctly with a userId
        console.error(`Invitation token ${token} has no associated userId.`);
        return NextResponse.json({ error: 'Invalid token: no user associated' }, { status: 400 });
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Update the user's password and mark email as verified in a transaction
    await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
      await tx.user.update({
        where: { id: invitationToken.userId! }, // userId is checked above
        data: {
          password: hashedPassword,
          emailVerified: new Date(), // Mark email as verified
        },
      });

      // 6. Delete the invitation token so it cannot be reused
      await tx.invitationToken.delete({
        where: { id: invitationToken.id },
      });
    });

    return NextResponse.json({ message: 'Password set successfully. You can now log in.' }, { status: 200 });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    if (error instanceof Error && getErrorMessage(error).includes('Password must be at least 8 characters long')) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
