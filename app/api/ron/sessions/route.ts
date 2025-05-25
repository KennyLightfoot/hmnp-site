import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { Role, NotarizationStatus } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authorization Check: Only authenticated SIGNERS can create sessions
  // We cast session.user to `any` to access the custom `role` and `id` property
  if (!session?.user || (session.user as any).role !== Role.SIGNER) {
    return NextResponse.json({ error: 'Forbidden: Only signers can create sessions.' }, { status: 403 });
  }

  const signerId = (session.user as any).id;

  try {
    // 2. Create new Notarization Session
    // For MVP, we're not taking any specific booking details like preferred time yet.
    // The session is created, and further details (scheduling, document upload) will follow.
    const newNotarizationSession = await prisma.notarizationSession.create({
      data: {
        signerId: signerId,
        status: NotarizationStatus.PENDING_CONFIRMATION,
        // notaryId can be assigned later by an admin or a system process
        // scheduledDateTime can be set when the session is confirmed/scheduled
      },
      include: { // Include signer details in the response
        signer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newNotarizationSession, { status: 201 });

  } catch (error) {
    console.error('Failed to create notarization session:', error);
    return NextResponse.json({ error: 'Failed to create notarization session.' }, { status: 500 });
  }
}
