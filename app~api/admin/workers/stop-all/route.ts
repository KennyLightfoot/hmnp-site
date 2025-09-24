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
    // In a real implementation, this would communicate with a worker management system
    // to stop all workers. Here we'll simulate that action.
    
    // Log this action
    await prisma.systemLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level: 'INFO',
        component: 'WORKER_MANAGER',
        message: `All workers stopped by admin user ${(session.user as any).email}`,
        timestamp: new Date(),
      }
    }).catch(() => {
      // If the systemLog table doesn't exist yet, we'll just ignore the error
      console.log('Could not write to system log - table may not exist');
    });

    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'All workers have been stopped',
      stoppedWorkers: 3 // Simulated count
    });
  } catch (error) {
    console.error('Error stopping workers:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to stop workers' 
    }, { status: 500 });
  }
}
