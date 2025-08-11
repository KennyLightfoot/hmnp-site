// lib/notifications/real-time-status.ts

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { NotificationService } from '@/lib/notifications';
import { NotificationType, NotificationMethod } from '@prisma/client';
import { realTimeStatusUpdateEmail } from '@/lib/email/templates';
import { logger } from '@/lib/monitoring';

export interface StatusUpdateData {
  bookingId: string;
  status: 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'delayed';
  notaryName?: string;
  estimatedArrival?: string;
  delayReason?: string;
  notes?: string;
}

export interface RealTimeStatusConfig {
  enableEmail: boolean;
  enableSMS: boolean;
  enablePush: boolean;
  enableInApp: boolean;
  customerPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export class RealTimeStatusService {
  private static instance: RealTimeStatusService;
  
  private constructor() {}
  
  static getInstance(): RealTimeStatusService {
    if (!RealTimeStatusService.instance) {
      RealTimeStatusService.instance = new RealTimeStatusService();
    }
    return RealTimeStatusService.instance;
  }

  /**
   * Send real-time status update to customer
   */
  async sendStatusUpdate(
    data: StatusUpdateData,
    config: RealTimeStatusConfig = {
      enableEmail: true,
      enableSMS: true,
      enablePush: false,
      enableInApp: true
    }
  ): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let sentCount = 0;
    let failedCount = 0;

    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          User_Booking_signerIdToUser: true,
          service: true
        }
      });

      if (!booking) {
        throw new Error(`Booking ${data.bookingId} not found`);
      }

      // Prepare notification data
      const client = {
        firstName: booking.User_Booking_signerIdToUser?.name?.split(' ')[0] || 'there',
        lastName: booking.User_Booking_signerIdToUser?.name?.split(' ').slice(1).join(' '),
        email: booking.customerEmail || booking.User_Booking_signerIdToUser?.email,
        phone: undefined
      };

      const bookingDetails = {
        serviceName: booking.service.name,
        date: booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : 'TBD',
        time: booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }) : 'TBD',
        address: booking.addressCity || 'TBD',
        notaryName: data.notaryName || booking.User_Booking_notaryIdToUser?.name,
        status: data.status,
        bookingId: booking.id
      };

      // Send email notification
      if (config.enableEmail && client.email) {
        try {
          const emailContent = realTimeStatusUpdateEmail(client, bookingDetails, data.status);
          
          await NotificationService.sendNotification({
            bookingId: data.bookingId,
            type: NotificationType.APPOINTMENT_REMINDER_NOW,
            recipient: { email: client.email },
            content: {
              subject: emailContent.subject,
              message: emailContent.html
            },
            methods: [NotificationMethod.EMAIL]
          });
          
          sentCount++;
          logger.info(`Real-time status email sent for booking ${data.bookingId}`, 'REAL_TIME_STATUS');
        } catch (error) {
          failedCount++;
          errors.push(`Email failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
          logger.error(`Failed to send real-time status email for booking ${data.bookingId}`, 'REAL_TIME_STATUS', { error });
        }
      }

      // Send SMS notification
      if (config.enableSMS && client.phone) {
        try {
          const smsMessage = this.generateStatusSMS(data.status, bookingDetails, data);
          
          await NotificationService.sendNotification({
            bookingId: data.bookingId,
            type: NotificationType.APPOINTMENT_REMINDER_NOW,
            recipient: { phone: client.phone },
            content: {
              message: smsMessage
            },
            methods: [NotificationMethod.SMS]
          });
          
          sentCount++;
          logger.info(`Real-time status SMS sent for booking ${data.bookingId}`, 'REAL_TIME_STATUS');
        } catch (error) {
          failedCount++;
          errors.push(`SMS failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
          logger.error(`Failed to send real-time status SMS for booking ${data.bookingId}`, 'REAL_TIME_STATUS', { error });
        }
      }

      // Send push notification
      if (config.enablePush) {
        try {
          await this.sendPushNotification(data, bookingDetails, client);
          sentCount++;
          logger.info(`Real-time status push notification sent for booking ${data.bookingId}`, 'REAL_TIME_STATUS');
        } catch (error) {
          failedCount++;
          errors.push(`Push notification failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
          logger.error(`Failed to send real-time status push notification for booking ${data.bookingId}`, 'REAL_TIME_STATUS', { error });
        }
      }

      // Update booking status in database
      await this.updateBookingStatus(data);

      // Log status update
      await this.logStatusUpdate(data, sentCount, failedCount);

    } catch (error) {
      failedCount++;
      errors.push(`General error: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
      logger.error(`Failed to send real-time status update for booking ${data.bookingId}`, 'REAL_TIME_STATUS', { error });
    }

    return {
      success: failedCount === 0,
      sentCount,
      failedCount,
      errors
    };
  }

  /**
   * Generate SMS message for status update
   */
  private generateStatusSMS(
    status: StatusUpdateData['status'],
    bookingDetails: any,
    data: StatusUpdateData
  ): string {
    const statusMessages = {
      on_way: `🚗 HMNP: Your notary is on the way! Service: ${bookingDetails.serviceName}. Be ready at ${bookingDetails.address}.`,
      arrived: `✅ HMNP: Your notary has arrived! Please meet at the entrance. Service: ${bookingDetails.serviceName}.`,
      in_progress: `📝 HMNP: Notarization in progress. Please follow your notary's instructions.`,
      completed: `🎉 HMNP: Service completed successfully! You'll receive a summary shortly.`,
      delayed: `⏰ HMNP: Slight delay with your appointment. We'll keep you updated. ${data.delayReason ? `Reason: ${data.delayReason}` : ''}`
    };

    return statusMessages[status] || 'HMNP: Status update received.';
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    data: StatusUpdateData,
    bookingDetails: any,
    client: any
  ): Promise<void> {
    // Import push notification service
    const { PushNotificationService } = await import('@/lib/notifications/push-notification-service');
    const pushService = PushNotificationService.getInstance();

    const notification = {
      title: this.getPushNotificationTitle(data.status),
      body: this.getPushNotificationBody(data.status, bookingDetails),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `status-${data.bookingId}`,
      requireInteraction: data.status === 'arrived',
      data: {
        bookingId: data.bookingId,
        status: data.status,
        url: `/booking/${data.bookingId}`
      }
    };

    await pushService.sendNotification({
      notification,
      targets: {
        customerEmails: client.email ? [client.email] : []
      }
    });
  }

  /**
   * Get push notification title
   */
  private getPushNotificationTitle(status: StatusUpdateData['status']): string {
    const titles = {
      on_way: '🚗 Notary On the Way!',
      arrived: '✅ Notary Has Arrived!',
      in_progress: '📝 Service in Progress',
      completed: '🎉 Service Completed!',
      delayed: '⏰ Service Update'
    };
    return titles[status] || 'Status Update';
  }

  /**
   * Get push notification body
   */
  private getPushNotificationBody(status: StatusUpdateData['status'], bookingDetails: any): string {
    const bodies = {
      on_way: `Your notary is en route for ${bookingDetails.serviceName}. Be ready at ${bookingDetails.address}.`,
      arrived: `Your notary has arrived! Please meet at the entrance.`,
      in_progress: `Your notarization service is currently in progress.`,
      completed: `Your service has been completed successfully!`,
      delayed: `There's a slight delay with your appointment. We'll keep you updated.`
    };
    return bodies[status] || 'You have a status update for your appointment.';
  }

  /**
   * Update booking status in database
   */
  private async updateBookingStatus(data: StatusUpdateData): Promise<void> {
    const statusMap = {
      on_way: 'IN_PROGRESS',
      arrived: 'IN_PROGRESS',
      in_progress: 'IN_PROGRESS',
      completed: 'COMPLETED',
      delayed: 'IN_PROGRESS'
    };

    await prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        status: statusMap[data.status],
        updatedAt: new Date(),
        notes: data.notes ? `${data.notes}\n[Status Update: ${data.status}]` : `[Status Update: ${data.status}]`
      }
    });
  }

  /**
   * Log status update for tracking
   */
  private async logStatusUpdate(
    data: StatusUpdateData,
    sentCount: number,
    failedCount: number
  ): Promise<void> {
    await prisma.notificationLog.create({
      data: {
        bookingId: data.bookingId,
        notificationType: NotificationType.APPOINTMENT_REMINDER_NOW,
        method: NotificationMethod.EMAIL, // Primary method
        subject: `Status Update: ${data.status}`,
        message: `Real-time status update sent for booking ${data.bookingId}`,
        status: failedCount === 0 ? 'SENT' : 'FAILED',
        metadata: {
          status: data.status,
          sentCount,
          failedCount,
          notaryName: data.notaryName,
          estimatedArrival: data.estimatedArrival,
          delayReason: data.delayReason
        }
      }
    });
  }

  /**
   * Get current status for a booking
   */
  async getCurrentStatus(bookingId: string): Promise<StatusUpdateData | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        User_Booking_notaryIdToUser: true,
        NotificationLog: {
          where: {
            notificationType: NotificationType.APPOINTMENT_REMINDER_NOW
          },
          orderBy: {
            sentAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!booking) return null;

    const lastStatusUpdate = booking.NotificationLog[0];
    const status = lastStatusUpdate?.metadata?.status as StatusUpdateData['status'] || 'scheduled';

    return {
      bookingId,
      status,
      notaryName: booking.User_Booking_notaryIdToUser?.name,
      estimatedArrival: lastStatusUpdate?.metadata?.estimatedArrival,
      delayReason: lastStatusUpdate?.metadata?.delayReason,
      notes: booking.notes || undefined
    };
  }

  /**
   * Get status history for a booking
   */
  async getStatusHistory(bookingId: string): Promise<Array<StatusUpdateData & { timestamp: Date }>> {
    const statusUpdates = await prisma.notificationLog.findMany({
      where: {
        bookingId,
        notificationType: NotificationType.APPOINTMENT_REMINDER_NOW
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    return statusUpdates.map(update => ({
      bookingId,
      status: update.metadata?.status as StatusUpdateData['status'] || 'unknown',
      notaryName: update.metadata?.notaryName,
      estimatedArrival: update.metadata?.estimatedArrival,
      delayReason: update.metadata?.delayReason,
      notes: update.metadata?.notes,
      timestamp: update.sentAt
    }));
  }
}

// Export convenience functions
export const sendRealTimeStatusUpdate = async (
  data: StatusUpdateData,
  config?: RealTimeStatusConfig
) => {
  const service = RealTimeStatusService.getInstance();
  return await service.sendStatusUpdate(data, config);
};

export const getBookingStatus = async (bookingId: string) => {
  const service = RealTimeStatusService.getInstance();
  return await service.getCurrentStatus(bookingId);
};

export const getBookingStatusHistory = async (bookingId: string) => {
  const service = RealTimeStatusService.getInstance();
  return await service.getStatusHistory(bookingId);
}; 
