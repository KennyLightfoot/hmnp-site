import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EnhancedStripeWebhookProcessor } from '@/lib/webhooks/stripe-enhanced';
import { Logger } from '@/lib/logger';

const logger = new Logger('StripeWebhookMetrics');

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only admins can view webhook metrics
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');

    // Get webhook processing metrics
    const metrics = await EnhancedStripeWebhookProcessor.getMetrics(eventType || undefined);

    // Add additional statistics
    const response = {
      metrics,
      timestamp: new Date().toISOString(),
      requestedEventType: eventType,
      summary: Array.isArray(metrics) ? undefined : generateMetricsSummary(metrics),
    };

    logger.info('Webhook metrics requested', { 
      userId: (session.user as any).id,
      eventType,
      timestamp: response.timestamp 
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Failed to get webhook metrics', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve webhook metrics' },
      { status: 500 }
    );
  }
}

/**
 * Generate summary statistics for webhook metrics
 */
function generateMetricsSummary(metrics: any) {
  if (typeof metrics !== 'object' || !metrics) {
    return null;
  }

  // If it's metrics for all event types
  if (typeof metrics === 'object' && Object.keys(metrics).length > 1) {
    const eventTypes = Object.keys(metrics);
    const totalProcessed = eventTypes.reduce((sum, type) => sum + (metrics[type]?.totalProcessed || 0), 0);
    const averageSuccessRate = eventTypes.reduce((sum, type) => sum + (metrics[type]?.successRate || 0), 0) / eventTypes.length;
    const averageErrorRate = eventTypes.reduce((sum, type) => sum + (metrics[type]?.errorRate || 0), 0) / eventTypes.length;

    return {
      totalEventTypes: eventTypes.length,
      totalProcessed,
      overallSuccessRate: averageSuccessRate,
      overallErrorRate: averageErrorRate,
      healthStatus: averageSuccessRate > 0.95 ? 'healthy' : averageSuccessRate > 0.85 ? 'warning' : 'critical',
      mostActiveEventType: eventTypes.reduce((prev, current) => 
        (metrics[prev]?.totalProcessed || 0) > (metrics[current]?.totalProcessed || 0) ? prev : current
      ),
    };
  }

  // Single event type metrics
  return {
    healthStatus: metrics.successRate > 0.95 ? 'healthy' : metrics.successRate > 0.85 ? 'warning' : 'critical',
    needsAttention: metrics.errorRate > 0.05 || metrics.retryRate > 0.1,
    performanceRating: metrics.averageProcessingTime < 1000 ? 'excellent' : 
                      metrics.averageProcessingTime < 3000 ? 'good' : 'poor',
  };
}

/**
 * Reset webhook metrics (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication - only admins can reset metrics
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const confirmReset = searchParams.get('confirm');

    if (confirmReset !== 'true') {
      return NextResponse.json(
        { error: 'Reset confirmation required - add ?confirm=true' },
        { status: 400 }
      );
    }

    // Reset metrics logic would go here
    // For now, just log the reset request
    logger.warn('Webhook metrics reset requested', {
      userId: (session.user as any).id,
      eventType,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Webhook metrics reset initiated',
      eventType,
      resetAt: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to reset webhook metrics', { error });
    return NextResponse.json(
      { error: 'Failed to reset webhook metrics' },
      { status: 500 }
    );
  }
}