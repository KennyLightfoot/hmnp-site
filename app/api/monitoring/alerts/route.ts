import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { alertManager } from '@/lib/monitoring/alert-manager';
import { z } from 'zod';

const recordMetricSchema = z.object({
  metric: z.string().min(1, 'Metric name is required'),
  value: z.any(),
  context: z.record(z.any()).optional()
});

const reportThreatSchema = z.object({
  ip: z.string().ip('Valid IP address required'),
  type: z.string().min(1, 'Threat type is required'),
  severity: z.enum(['low', 'medium', 'high']),
  details: z.record(z.any()).optional()
});

const acknowledgeAlertSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  acknowledgedBy: z.string().min(1, 'Acknowledged by is required')
});

/**
 * GET /api/monitoring/alerts
 * Get active alerts (Admin only)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only admins can view alerts
    if (context.userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
      const activeAlerts = await alertManager.getActiveAlerts();
      
      return NextResponse.json({
        success: true,
        alerts: activeAlerts,
        count: activeAlerts.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve alerts' },
        { status: 500 }
      );
    }
  }, AuthConfig.adminOnly());
}

/**
 * POST /api/monitoring/alerts/metric
 * Record a metric for monitoring
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    try {
      const body = await request.json();
      
      // Handle different alert actions
      if (body.action === 'record_metric') {
        const { metric, value, context: metricContext } = recordMetricSchema.parse(body);
        
        await alertManager.recordMetric(metric, value, metricContext);
        
        return NextResponse.json({
          success: true,
          message: 'Metric recorded successfully'
        });
      }
      
      if (body.action === 'report_threat') {
        const { ip, type, severity, details } = reportThreatSchema.parse(body);
        
        await alertManager.reportThreat({
          ip,
          type,
          severity,
          details: details || {}
        });
        
        return NextResponse.json({
          success: true,
          message: 'Threat reported successfully'
        });
      }
      
      if (body.action === 'acknowledge') {
        if (!context.isAuthenticated || context.userRole !== 'ADMIN') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const { alertId, acknowledgedBy } = acknowledgeAlertSchema.parse(body);
        
        await alertManager.acknowledgeAlert(alertId, acknowledgedBy);
        
        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully'
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid action specified' },
        { status: 400 }
      );
      
    } catch (error) {
      console.error('Alert action error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors
        }, { status: 400 });
      }
      
      return NextResponse.json(
        { error: 'Failed to process alert action' },
        { status: 500 }
      );
    }
  }, AuthConfig.public());
} 