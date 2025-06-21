import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getQueues } from '@/lib/queue/config';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function POST() {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    // Get queue instance
    const queues = getQueues();
    if (!queues || !queues.bookingProcessingQueue) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: 'Queue service unavailable' 
      }), { status: 503 });
    }

    // Find all pending bookings that need processing
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['REQUESTED', 'PAYMENT_PENDING'] }
      },
      take: 50,
      include: {
        User_Booking_signerIdToUser: true,
        service: true,
      }
    });

    // Add each booking to the queue for processing
    for (const booking of pendingBookings) {
      await queues.bookingProcessingQueue.sendMessage({
        type: 'process-booking',
        bookingId: booking.id,
        action: 'process',
      });
    }

    // Create a system log entry
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        component: 'BOOKING_PROCESSOR',
        message: `Admin requested processing of ${pendingBookings.length} pending bookings`,
        timestamp: new Date(),
      }
    }).catch(() => {
      // If the systemLog table doesn't exist yet, we'll just ignore the error
      console.log('Could not write to system log - table may not exist');
    });

    return NextResponse.json({ 
      success: true, 
      message: `Added ${pendingBookings.length} booking(s) to processing queue`,
      count: pendingBookings.length
    });
  } catch (error) {
    console.error('Error processing bookings:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process bookings' 
    }, { status: 500 });
  }
}
