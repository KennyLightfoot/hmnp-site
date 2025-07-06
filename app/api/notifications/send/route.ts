/**
 * Notification Send API Endpoint
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Provides API access to send notifications programmatically
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { NotificationService } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { z } from 'zod';

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

export async function POST(request: NextRequest) {
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
      error: error.message,
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
}

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

    // Queue for scheduled delivery
    const result = await NotificationService.getInstance().scheduleNotification({
      type,
      method,
      bookingId,
      recipientEmail,
      recipientPhone,
      customMessage,
      customSubject,
      scheduledAt: scheduledTime,
      metadata: {
        ...metadata,
        priority,
        source: 'api',
        userAgent
      }
    });

    return NextResponse.json({
      success: true,
      scheduled: true,
      scheduledAt: scheduleAt,
      notificationId: result.id,
      message: 'Notification scheduled successfully'
    });
  }

  // Send immediately
  let result;
  const notificationService = NotificationService.getInstance();
  
  if (bookingId) {
    // Booking-based notification
    result = await notificationService.sendNotification(
      bookingId,
      type,
      method,
      customMessage,
      {
        ...metadata,
        priority,
        source: 'api',
        userAgent,
        customSubject
      }
    );
  } else if (recipientEmail || recipientPhone) {
    // Direct recipient notification
    result = await notificationService.sendDirectNotification({
      type,
      method: method || 'EMAIL',
      recipientEmail,
      recipientPhone,
      subject: customSubject,
      message: customMessage || '',
      metadata: {
        ...metadata,
        priority,
        source: 'api',
        userAgent
      }
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Either bookingId or recipient information is required'
    }, { status: 400 });
  }

  if (result.success) {
    logger.info('API notification sent successfully', {
      type,
      method,
      bookingId,
      priority,
      notificationId: result.notificationId
    });

    return NextResponse.json({
      success: true,
      notificationId: result.notificationId,
      method: result.method,
      status: result.status,
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
          error: error.message
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';