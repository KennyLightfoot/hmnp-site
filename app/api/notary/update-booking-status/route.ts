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
    const { bookingId, status, notes } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate that status is a valid BookingStatus
    if (!Object.values(BookingStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        signer: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify notary has permission to update this booking
    if (userRole === Role.NOTARY && booking.notaryId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'You can only update bookings assigned to you' },
        { status: 403 }
      );
    }

    // Define valid status transitions for notaries
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.NO_SHOW, BookingStatus.CANCELLED_BY_STAFF],
      [BookingStatus.SCHEDULED]: [BookingStatus.IN_PROGRESS, BookingStatus.NO_SHOW, BookingStatus.CANCELLED_BY_STAFF],
      [BookingStatus.READY_FOR_SERVICE]: [BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED, BookingStatus.NO_SHOW],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.REQUIRES_RESCHEDULE],
      [BookingStatus.REQUIRES_RESCHEDULE]: [BookingStatus.SCHEDULED, BookingStatus.CANCELLED_BY_STAFF],
      // Add other transitions as needed
      [BookingStatus.REQUESTED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED_BY_STAFF],
      [BookingStatus.PAYMENT_PENDING]: [BookingStatus.CONFIRMED],
      [BookingStatus.AWAITING_CLIENT_ACTION]: [BookingStatus.READY_FOR_SERVICE, BookingStatus.CANCELLED_BY_STAFF],
      [BookingStatus.COMPLETED]: [], // No transitions from completed
      [BookingStatus.CANCELLED_BY_CLIENT]: [], // No transitions from cancelled
      [BookingStatus.CANCELLED_BY_STAFF]: [], // No transitions from cancelled
      [BookingStatus.ARCHIVED]: [], // No transitions from archived
      [BookingStatus.NO_SHOW]: [BookingStatus.REQUIRES_RESCHEDULE, BookingStatus.ARCHIVED],
    };

    // Check if transition is valid
    const allowedTransitions = validTransitions[booking.status] || [];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status transition from ${booking.status} to ${status}`,
          allowedTransitions 
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add notes if provided
    if (notes) {
      updateData.notes = booking.notes 
        ? `${booking.notes}\n\nStatus Update (${new Date().toLocaleString()}): ${notes}`
        : `Status Update (${new Date().toLocaleString()}): ${notes}`;
    }

    // Set specific timestamps based on status
    switch (status) {
      case BookingStatus.IN_PROGRESS:
        updateData.actualStartDateTime = new Date();
        break;
      case BookingStatus.COMPLETED:
        updateData.actualEndDateTime = new Date();
        break;
      case BookingStatus.NO_SHOW:
        updateData.noShowCheckPerformedAt = new Date();
        break;
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Booking status updated from ${booking.status} to ${status}`,
      booking: {
        id: updatedBooking.id,
        previousStatus: booking.status,
        newStatus: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
} 