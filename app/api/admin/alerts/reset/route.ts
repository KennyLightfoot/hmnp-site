import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, AlertStatus } from '@prisma/client';

export async function POST() {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    // Update all active alerts to resolved
    const updateResult = await prisma.SystemAlert.updateMany({
      where: {
        status: AlertStatus.ACTIVE,
      },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy: (session.user as any).email || 'admin',
      }
    }).catch(error => {
      // If the table doesn't exist yet, this will error
      console.log('Error updating systemAlert table:', error);
      return { count: 0 };
    });

    // Create a system log entry
    await prisma.SystemLog.create({
      data: {
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
