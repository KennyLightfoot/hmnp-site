import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { headers } from 'next/headers';

interface ErrorInfo {
  message: string;
  stack?: string;
  name?: string;
  cause?: unknown;
  timestamp: string;
  url: string;
  userAgent: string;
  context: {
    component?: string;
    userId?: string;
    sessionId?: string;
    step?: string | number;
    action?: string;
    metadata?: Record<string, any>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { errors }: { errors: ErrorInfo[] } = await request.json();
    
    if (!Array.isArray(errors) || errors.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid errors data'
      }, { status: 400 });
    }

    // Get request info
    const requestHeaders = await headers();
    const userAgent = requestHeaders.get('user-agent') || '';
    const forwarded = requestHeaders.get('x-forwarded-for') || '';
    const host = requestHeaders.get('host') || '';

    // Process each error
    for (const error of errors) {
      // Log to console (in production, this would go to a logging service)
      console.error('[ERROR_TRACKING]', {
        timestamp: error.timestamp,
        message: getErrorMessage(error),
        component: error.context.component,
        userId: error.context.userId,
        sessionId: error.context.sessionId,
        step: error.context.step,
        action: error.context.action,
        url: error.url,
        userAgent: error.userAgent,
        requestInfo: {
          userAgent,
          forwarded,
          host,
        },
        stack: error.stack,
        metadata: error.context.metadata,
      });

      // In production, you would:
      // 1. Save to database for analysis
      // 2. Send to error tracking service (Sentry, LogRocket, etc.)
      // 3. Alert for critical errors
      // 4. Update error metrics

      // Example database save (commented out since we don't have an error tracking table)
      /*
      try {
        await prisma.errorLog.create({
          data: {
            message: getErrorMessage(error),
            stack: error.stack,
            name: error.name,
            timestamp: new Date(error.timestamp),
            url: error.url,
            userAgent: error.userAgent,
            component: error.context.component,
            userId: error.context.userId,
            sessionId: error.context.sessionId,
            step: error.context.step?.toString(),
            action: error.context.action,
            metadata: error.context.metadata ? JSON.stringify(error.context.metadata) : null,
            requestUserAgent: userAgent,
            requestForwarded: forwarded,
            requestHost: host,
          }
        });
      } catch (dbError) {
        console.error('[ERROR_TRACKING] Failed to save to database:', dbError);
      }
      */

      // Check if this is a critical error that needs immediate attention
      const isCritical = isCriticalError(error);
      if (isCritical) {
        // In production, send alert to monitoring service
        console.error('[CRITICAL_ERROR]', {
          message: getErrorMessage(error),
          component: error.context.component,
          userId: error.context.userId,
          timestamp: error.timestamp,
        });

        // Example: Send to monitoring service
        /*
        await sendToMonitoringService({
          level: 'critical',
          message: getErrorMessage(error),
          context: error.context,
          stack: error.stack,
        });
        */
      }
    }

    return NextResponse.json({
      success: true,
      processed: errors.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[ERROR_TRACKING_API] Failed to process errors:', getErrorMessage(error));
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process error data'
    }, { status: 500 });
  }
}

function isCriticalError(error: ErrorInfo): boolean {
  const criticalPatterns = [
    /payment.*failed/i,
    /stripe.*error/i,
    /booking.*failed/i,
    /database.*error/i,
    /auth.*error/i,
    /security.*violation/i,
    /unhandled.*rejection/i,
  ];

  const message = getErrorMessage(error);
  const component = error.context.component || '';
  const action = error.context.action || '';

  return criticalPatterns.some(pattern => 
    pattern.test(message) || 
    pattern.test(component) || 
    pattern.test(action)
  );
}

// Utility function for external monitoring services
async function sendToMonitoringService(data: {
  level: 'critical' | 'error' | 'warning';
  message: string;
  context: any;
  stack?: string;
}) {
  // Example integration with external services
  try {
    // Slack webhook for critical errors
    if (process.env.SLACK_WEBHOOK_URL && data.level === 'critical') {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Critical Error in Production`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Critical Error Detected*\n\n*Message:* ${data.message}\n*Component:* ${data.context.component}\n*User:* ${data.context.userId || 'Anonymous'}\n*Time:* ${new Date().toISOString()}`
              }
            }
          ]
        })
      });
    }

    // Sentry integration example
    /*
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(new Error(data.message), {
        level: data.level,
        contexts: {
          booking: data.context
        },
        extra: {
          stack: data.stack
        }
      });
    }
    */

  } catch (notificationError) {
    console.error('[ERROR_TRACKING] Failed to send monitoring alert:', notificationError);
  }
}
