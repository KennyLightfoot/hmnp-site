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
    // Get queue instances
    const queues = getQueues();
    if (!queues) {
      return NextResponse.json({ 
        success: false, 
        error: 'Queue service unavailable' 
      }, { status: 503 });
    }

    // In a real app, we would communicate with the worker processes to get their status
    // Here we'll simulate getting status information
    
    // Get queue stats (queue lengths)
    const queueStats = {
      notificationsQueue: 0, // In production, this would be actual queue.size() or similar
      bookingProcessingQueue: 0,
      paymentProcessingQueue: 0,
    };

    // Get worker process status
    const workers = [
      {
        id: 'notifications-worker',
        name: 'Notifications Worker',
        type: 'notifications',
        status: 'RUNNING',
        lastActive: new Date(),
        uptime: 1824500, // in seconds
        processedItems: 1562,
        failedItems: 8,
        queueLength: queueStats.notificationsQueue,
      },
      {
        id: 'booking-worker',
        name: 'Booking Processor',
        type: 'booking-processing',
        status: 'RUNNING',
        lastActive: new Date(),
        uptime: 1051200, // in seconds
        processedItems: 456,
        failedItems: 2,
        queueLength: queueStats.bookingProcessingQueue,
      },
      {
        id: 'payment-worker',
        name: 'Payment Processor',
        type: 'payment-processing',
        status: 'STOPPED',
        lastActive: new Date(Date.now() - 3600000), // 1 hour ago
        uptime: 0,
        processedItems: 782,
        failedItems: 15,
        queueLength: queueStats.paymentProcessingQueue,
      },
      {
        id: 'system-monitor',
        name: 'System Monitor',
        type: 'system',
        status: 'RUNNING',
        lastActive: new Date(),
        uptime: 2629800, // in seconds
        processedItems: 8640,
        failedItems: 0,
        queueLength: 0,
      }
    ];

    // Log this activity
    await prisma.systemLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level: 'INFO',
        component: 'WORKER_MONITOR',
        message: `Worker status refreshed by admin`,
        timestamp: new Date(),
      }
    }).catch(() => {
      // If the systemLog table doesn't exist yet, we'll just ignore the error
      console.log('Could not write to system log - table may not exist');
    });

    return NextResponse.json({ 
      success: true, 
      workers,
      queueStats
    });
  } catch (error) {
    console.error('Error getting worker status:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get worker status' 
    }, { status: 500 });
  }
}
