import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus } from '@prisma/client';

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
    const { bookingId, notes } = body;

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

    // Verify notary has permission to complete this booking
    if (userRole === Role.NOTARY && booking.notaryId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'You can only complete bookings assigned to you' },
        { status: 403 }
      );
    }

    // Check if booking is in a state that can be completed
    const validStatuses: BookingStatus[] = [
      BookingStatus.IN_PROGRESS,
      BookingStatus.READY_FOR_SERVICE,
      BookingStatus.SCHEDULED,
      BookingStatus.CONFIRMED,
    ];

    if (!validStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot complete booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Update booking to completed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        actualEndDateTime: new Date(),
        updatedAt: new Date(),
        notes: notes ? `${booking.notes || ''}\n\nCompletion Notes: ${notes}`.trim() : booking.notes,
      },
    });

    // TODO: In a production system, you might want to:
    // 1. Send completion notification to client
    // 2. Update GHL contact status
    // 3. Trigger follow-up workflows
    // 4. Log the completion in audit trail

    return NextResponse.json({
      success: true,
      message: 'Booking completed successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        actualEndDateTime: updatedBooking.actualEndDateTime,
      },
    });

  } catch (error) {
    console.error('Error completing booking:', error);
    return NextResponse.json(
      { error: 'Failed to complete booking' },
      { status: 500 }
    );
  }
} 