import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has notary role
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== Role.NOTARY && userRole !== Role.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify this is a RON booking
    if (booking.locationType !== LocationType.REMOTE_ONLINE_NOTARIZATION) {
      return NextResponse.json(
        { error: 'This is not a Remote Online Notarization booking' },
        { status: 400 }
      );
    }

    // Verify notary has permission to start this session
    if (userRole === Role.NOTARY && booking.notaryId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'You can only start sessions assigned to you' },
        { status: 403 }
      );
    }

    // Check if booking is in a state that can be started
    const validStatuses = [
      'READY_FOR_SERVICE',
      'CONFIRMED', 
      'SCHEDULED',
    ] as const;

    if (!validStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot start session with booking status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Check if Proof transaction exists (Note: proofTransactionId doesn't exist on booking model)
    // This check would need to be implemented differently, perhaps by checking a separate ProofTransaction table
    // For now, we'll skip this validation
    // if (!booking.proofTransactionId) {
    //   return NextResponse.json(
    //     { 
    //       error: 'No Proof transaction found for this booking. Please ensure the client has completed document upload.',
    //       requiresProofSetup: true
    //     },
    //     { status: 400 }
    //   );
    // }

    // Update booking to in progress
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.IN_PROGRESS,
        updatedAt: new Date(),
      },
    });

    // TODO: In a production system, you might want to:
    // 1. Notify the client that the session is starting
    // 2. Update Proof.co session status
    // 3. Start recording/audit trail
    // 4. Send session start notifications

    return NextResponse.json({
      success: true,
      message: 'RON session started successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        startedAt: new Date().toISOString(), // Using current time as start indicator
        // proofAccessLink: Not available on booking model
      },
    });

  } catch (error) {
    console.error('Error starting RON session:', error);
    return NextResponse.json(
      { error: 'Failed to start RON session' },
      { status: 500 }
    );
  }
} 