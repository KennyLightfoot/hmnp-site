import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, AlertStatus } from '@/lib/prisma-types';

export async function POST() {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    // Lazily import Prisma to avoid initialization during build-time data collection
    const { prisma } = await import('@/lib/db');

    // Update all active alerts to resolved
    const updateResult = await prisma.systemAlert.updateMany({
      where: {
        status: AlertStatus.ACTIVE,
      },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy: (session.user as any).email || 'admin',
      }
    }).catch((error: unknown) => {
      // If the table doesn't exist yet, this will error
      console.log('Error updating systemAlert table:', error);
      return { count: 0 };
    });

    // Create a system log entry
    await prisma.systemLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level: 'INFO',
        component: 'ALERT_MANAGER',
        message: `Admin cleared ${updateResult.count} system alerts`,
      }
    }).catch(() => {
      // If the systemLog table doesn't exist yet, we'll just ignore the error
      console.log('Could not write to system log - table may not exist');
    });

    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${updateResult.count} active alerts`,
      count: updateResult.count
    });
  } catch (error) {
    console.error('Error resetting alerts:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to reset alerts' 
    }, { status: 500 });
  }
}
