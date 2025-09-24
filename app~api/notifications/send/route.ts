/**
 * Notification Send API Endpoint
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Provides API access to send notifications programmatically
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { headers } from 'next/headers';
import { NotificationService } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { withAdminSecurity } from '@/lib/security/comprehensive-security';

// Validation schema for notification requests
const NotificationRequestSchema = z.object({
  type: z.enum([
    'BOOKING_CONFIRMATION',
    'PAYMENT_CONFIRMATION', 
    'APPOINTMENT_REMINDER_24HR',
    'APPOINTMENT_REMINDER_2HR',
    'APPOINTMENT_REMINDER_1HR',
    'APPOINTMENT_REMINDER_NOW',
    'BOOKING_CANCELLED',
    'BOOKING_RESCHEDULED',
    'PAYMENT_FAILED',
    'PAYMENT_REMINDER',
    'NO_SHOW_CHECK',
    'POST_SERVICE_FOLLOWUP',
    'REVIEW_REQUEST',
    'DOCUMENT_READY',
    'DOCUMENT_REMINDER',
    'NOTARY_ASSIGNMENT',
    'EMERGENCY_NOTIFICATION',
    'LEAD_NURTURING',
    'PAYMENT_UPDATE'
  ]),
  method: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']).optional(),
  bookingId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  customMessage: z.string().optional(),
  customSubject: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  scheduleAt: z.string().datetime().optional(), // For scheduled notifications
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

const BulkNotificationRequestSchema = z.object({
  notifications: z.array(NotificationRequestSchema),
  batchId: z.string().optional()
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAdminSecurity(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const headersList = await headers();
    const apiKey = headersList.get('x-api-key');
    const userAgent = headersList.get('user-agent');

    // API key validation for programmatic access
    if (apiKey && apiKey !== process.env.NOTIFICATIONS_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key'
      }, { status: 401 });
    }

    // Check if this is a bulk notification request
    const isBulkRequest = Array.isArray(body.notifications);
    
    if (isBulkRequest) {
      return await handleBulkNotifications(body);
    } else {
      return await handleSingleNotification(body, userAgent);
    }

  } catch (error: any) {
    logger.error('Notification API error', {
      error: getErrorMessage(error),
      stack: error.stack
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to process notification request'
    }, { status: 500 });
  }
})

/**
 * Handle single notification request
 */
async function handleSingleNotification(body: any, userAgent?: string | null): Promise<NextResponse> {
  const validatedRequest = NotificationRequestSchema.parse(body);
  
  const {
    type,
    method,
    bookingId,
    recipientEmail,
    recipientPhone,
    customMessage,
    customSubject,
    metadata = {},
    scheduleAt,
    priority
  } = validatedRequest;

  // If scheduled, add to queue for later processing
  if (scheduleAt) {
    const scheduledTime = new Date(scheduleAt);
    
    if (scheduledTime <= new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Scheduled time must be in the future'
      }, { status: 400 });
    }

    // For now, we'll return an error since scheduling isn't implemented
    // TODO: Implement scheduled notifications
    return NextResponse.json({
      success: false,
      error: 'Scheduled notifications are not yet implemented'
    }, { status: 501 });

    return NextResponse.json({
      success: true,
      scheduled: true,
      scheduledAt: scheduleAt,
      message: 'Notification scheduled successfully'
    });
  }

  // Send immediately
  let result;
  const notificationService = NotificationService.getInstance();
  
  if (bookingId) {
    // Booking-based notification
    result = await notificationService.sendNotification({
      bookingId,
      type: type as any,
      method: method as any,
      templateData: {
        ...metadata,
        priority,
        source: 'api',
        userAgent,
        customSubject,
        customMessage
      }
    });
  } else {
    // Direct recipient notifications not supported yet
    return NextResponse.json({
      success: false,
      error: 'Direct recipient notifications are not yet implemented. Please provide a bookingId.'
    }, { status: 501 });
  }

  if (result.success) {
    logger.info('API notification sent successfully', {
      type,
      method,
      bookingId,
      priority
    });

    return NextResponse.json({
      success: true,
      method: method || 'EMAIL',
      status: 'sent',
      message: 'Notification sent successfully'
    });
  } else {
    logger.error('API notification failed', {
      type,
      method,
      bookingId,
      error: result.error
    });

    return NextResponse.json({
      success: false,
      error: result.error || 'Failed to send notification'
    }, { status: 500 });
  }
}

/**
 * Handle bulk notification requests
 */
async function handleBulkNotifications(body: any): Promise<NextResponse> {
  const validatedRequest = BulkNotificationRequestSchema.parse(body);
  const { notifications, batchId } = validatedRequest;

  if (notifications.length > 100) {
    return NextResponse.json({
      success: false,
      error: 'Bulk notifications limited to 100 per request'
    }, { status: 400 });
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Process notifications concurrently with rate limiting
  const batchSize = 10;
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (notification, index) => {
      try {
        const response = await handleSingleNotification(notification, 'bulk-api');
        const responseData = await response.json();
        
        if (responseData.success) {
          successCount++;
        } else {
          failureCount++;
        }

        return {
          index: i + index,
          success: responseData.success,
          notificationId: responseData.notificationId,
          error: responseData.error
        };
      } catch (error: any) {
        failureCount++;
        return {
          index: i + index,
          success: false,
          error: getErrorMessage(error)
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Rate limiting - small delay between batches
    if (i + batchSize < notifications.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  logger.info('Bulk notification processing completed', {
    batchId,
    totalNotifications: notifications.length,
    successCount,
    failureCount
  });

  return NextResponse.json({
    success: true,
    batchId,
    summary: {
      total: notifications.length,
      successful: successCount,
      failed: failureCount,
      successRate: Math.round((successCount / notifications.length) * 100)
    },
    results
  });
}

// (runtime/dynamic declared above)
