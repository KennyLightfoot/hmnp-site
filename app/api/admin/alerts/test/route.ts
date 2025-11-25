import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST() {
  // Check authentication and authorization
  const [{ authOptions }, { Role, AlertSeverity }, { getQueues }] = await Promise.all([
    import('@/lib/auth'),
    import('@/lib/prisma-types'),
    import('@/lib/queue/config'),
  ]);

  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    // Run comprehensive system health check
    // This would typically involve checking multiple system components

    const healthResults = {
      database: true,
      api: true,
      queueWorkers: true,
      notifications: true,
      storage: true,
      issues: [] as Array<{component: string, message: string, severity: AlertSeverity}>
    };

    // Lazily import Prisma to avoid initialization during build-time data collection
    const { prisma } = await import('@/lib/db');

    // Check database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      healthResults.database = false;
      healthResults.issues.push({
        component: 'Database',
        message: 'Cannot connect to database',
        severity: AlertSeverity.CRITICAL
      });
    }

    // Check queue service
    const queues = getQueues();
    if (!queues) {
      healthResults.queueWorkers = false;
      healthResults.issues.push({
        component: 'QueueService',
        message: 'Queue service is unavailable',
        severity: AlertSeverity.HIGH
      });
    }

    // Log this health check
    await prisma.systemLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level: 'INFO',
        component: 'HEALTH_CHECK',
        message: `Manual health check triggered by admin user ${(session.user as any).email}`,
      }
    }).catch(() => {
      // If the systemLog table doesn't exist yet, we'll just ignore the error
    });

    // Create alerts for any detected issues
    for (const issue of healthResults.issues) {
      await prisma.systemAlert.create({
        data: {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          component: issue.component,
          message: issue.message,
          severity: issue.severity,
          status: 'ACTIVE',
        }
      }).catch(() => {
        // If the systemAlert table doesn't exist yet, we'll just ignore the error
      });
    }

    return NextResponse.json({ 
      success: true, 
      healthStatus: healthResults.issues.length === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
      results: healthResults
    });
  } catch (error) {
    console.error('Error running system health check:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to complete system health check' 
    }, { status: 500 });
  }
}
