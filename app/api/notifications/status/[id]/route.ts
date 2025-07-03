/**
 * Notification Status API Endpoint
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Provides real-time status tracking for notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'Notification ID is required'
      }, { status: 400 });
    }

    // Get notification from new notifications table
    const notification = await prisma.newNotification.findUnique({
      where: { id: notificationId },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            customerEmail: true,
            customerName: true,
            status: true,
            scheduledDateTime: true
          }
        }
      }
    });

    // Fallback to legacy notification table
    if (!notification) {
      const legacyNotification = await prisma.notificationLog.findUnique({
        where: { id: notificationId },
        include: {
          Booking: {
            select: {
              id: true,
              customerEmail: true,
              customerFirstName: true,
              customerLastName: true,
              status: true,
              scheduledDateTime: true
            }
          }
        }
      });

      if (legacyNotification) {
        return NextResponse.json({
          success: true,
          notification: {
            id: legacyNotification.id,
            type: legacyNotification.notificationType,
            method: legacyNotification.method,
            status: legacyNotification.status,
            recipientEmail: legacyNotification.recipientEmail,
            recipientPhone: legacyNotification.recipientPhone,
            subject: legacyNotification.subject,
            message: legacyNotification.message,
            sentAt: legacyNotification.sentAt,
            errorMessage: legacyNotification.errorMessage,
            metadata: legacyNotification.metadata,
            booking: legacyNotification.Booking ? {
              id: legacyNotification.Booking.id,
              customerName: `${legacyNotification.Booking.customerFirstName} ${legacyNotification.Booking.customerLastName}`,
              customerEmail: legacyNotification.Booking.customerEmail,
              status: legacyNotification.Booking.status,
              scheduledDateTime: legacyNotification.Booking.scheduledDateTime
            } : null,
            createdAt: legacyNotification.createdAt
          },
          source: 'legacy'
        });
      }
    }

    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }

    // Get delivery analytics if available
    const deliveryAnalytics = await getDeliveryAnalytics(notificationId, notification.method);

    // Calculate delivery time
    const deliveryTime = notification.sentAt 
      ? Math.round((notification.sentAt.getTime() - notification.createdAt.getTime()) / 1000)
      : null;

    // Determine current status
    const currentStatus = determineNotificationStatus(notification, deliveryAnalytics);

    const response = {
      success: true,
      notification: {
        id: notification.id,
        type: notification.notificationType,
        method: notification.method,
        status: currentStatus,
        recipientEmail: notification.recipientEmail,
        recipientPhone: notification.recipientPhone,
        subject: notification.subject,
        message: notification.message,
        sentAt: notification.sentAt,
        errorMessage: notification.errorMessage,
        metadata: notification.metadata,
        deliveryTime,
        booking: notification.booking ? {
          id: notification.booking.id,
          bookingNumber: notification.booking.bookingNumber,
          customerName: notification.booking.customerName,
          customerEmail: notification.booking.customerEmail,
          status: notification.booking.status,
          scheduledDateTime: notification.booking.scheduledDateTime
        } : null,
        createdAt: notification.createdAt
      },
      analytics: deliveryAnalytics,
      source: 'new'
    };

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error('Failed to get notification status', {
      notificationId: params.id,
      error: error.message
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve notification status'
    }, { status: 500 });
  }
}

/**
 * Update notification status (for webhooks or manual updates)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id;
    const body = await request.json();
    
    const { status, errorMessage, deliveryMetadata } = body;

    if (!status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required for update'
      }, { status: 400 });
    }

    // Update notification status
    const updatedNotification = await prisma.newNotification.update({
      where: { id: notificationId },
      data: {
        status,
        errorMessage,
        metadata: deliveryMetadata ? {
          ...deliveryMetadata,
          updatedAt: new Date().toISOString()
        } : undefined
      }
    });

    logger.info('Notification status updated', {
      notificationId,
      oldStatus: updatedNotification.status,
      newStatus: status
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: updatedNotification.id,
        status: updatedNotification.status,
        errorMessage: updatedNotification.errorMessage,
        updatedAt: updatedNotification.createdAt
      }
    });

  } catch (error: any) {
    logger.error('Failed to update notification status', {
      notificationId: params.id,
      error: error.message
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to update notification status'
    }, { status: 500 });
  }
}

/**
 * Get delivery analytics for the notification
 */
async function getDeliveryAnalytics(notificationId: string, method: string): Promise<any> {
  try {
    // This would integrate with email/SMS provider APIs to get detailed analytics
    // For now, return basic analytics based on status
    
    switch (method) {
      case 'EMAIL':
        // Would integrate with Resend analytics
        return {
          delivered: true,
          opened: null, // Would track email opens
          clicked: null, // Would track link clicks
          bounced: false,
          complained: false
        };
        
      case 'SMS':
        // Would integrate with GHL/Twilio analytics
        return {
          delivered: true,
          read: null, // SMS read receipts if available
          responded: null // If customer replied
        };
        
      default:
        return null;
    }
  } catch (error) {
    logger.error('Failed to get delivery analytics', { notificationId, error });
    return null;
  }
}

/**
 * Determine current notification status based on data
 */
function determineNotificationStatus(notification: any, analytics: any): string {
  if (notification.errorMessage) {
    return 'FAILED';
  }
  
  if (!notification.sentAt) {
    return 'PENDING';
  }
  
  if (analytics?.bounced) {
    return 'BOUNCED';
  }
  
  if (analytics?.delivered) {
    return 'DELIVERED';
  }
  
  return notification.status || 'SENT';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';