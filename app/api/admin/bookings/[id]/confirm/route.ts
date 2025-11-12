import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getQueues } from '@/lib/queue/config';
import { prisma } from '@/lib/db';
import { Role, BookingStatus } from '@prisma/client';
import { triggerStatusChangeFollowUps } from '@/lib/follow-up-automation';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const params = await context.params;
  const bookingId = params.id;

  try {
    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        User_Booking_signerIdToUser: true,
        service: true,
      }
    });

    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    // Update the booking status to CONFIRMED
    const previousStatus = booking.status;
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: BookingStatus.CONFIRMED,
        updatedAt: new Date(),
      }
    });
    
    // Get queue instance
    const queues = getQueues();
    
    // Add confirmation notification task to queue
    if (queues && queues.notificationsQueue) {
      await queues.notificationsQueue.sendMessage({
        type: 'booking-confirmation',
        bookingId: booking.id,
        clientId: booking.User_Booking_signerIdToUser?.id,
        recipientEmail: booking.User_Booking_signerIdToUser?.email,
        recipientName: booking.User_Booking_signerIdToUser?.name,
        serviceName: booking.service?.name,
        scheduledAt: booking.scheduledDateTime,
      });
    }

    try {
      await triggerStatusChangeFollowUps(
        updatedBooking.id,
        BookingStatus.CONFIRMED,
        previousStatus
      );
    } catch (automationError) {
      console.error('Failed to trigger confirmation follow-up automation:', automationError);
    }

    // Create a system log entry
    await prisma.systemLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level: 'INFO',
        component: 'BOOKING_MANAGER',
        message: `Admin confirmed booking ID: ${bookingId} for client: ${booking.User_Booking_signerIdToUser?.name}`,
      }
    }).catch(() => {
      // If the systemLog table doesn't exist yet, we'll just ignore the error
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Booking confirmed successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error(`Error confirming booking ${bookingId}:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to confirm booking' 
    }, { status: 500 });
  }
}
