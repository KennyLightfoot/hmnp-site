/**
 * Push Notification Service
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Comprehensive push notification system for web and mobile
 */

import { logger } from '../logger';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '../prisma';
import { z } from 'zod';

// Push subscription schema
const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

// Push notification request schema
const PushNotificationRequestSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().url().optional()
  })).optional(),
  data: z.record(z.any()).optional(),
  ttl: z.number().min(0).max(2419200).default(86400), // 24 hours default, max 28 days
  urgency: z.enum(['very-low', 'low', 'normal', 'high']).default('normal')
});

// Push notification result
export interface PushNotificationResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  results: Array<{
    subscriptionId: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Push Notification Service
 */
export class PushNotificationService {
  private readonly vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
    subject: process.env.VAPID_SUBJECT || 'mailto:notifications@houstonmobilenotary.com'
  };

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    if (!this.vapidKeys.publicKey || !this.vapidKeys.privateKey) {
      throw new Error('VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
    }

    logger.info('Push notification service initialized', {
      vapidSubject: this.vapidKeys.subject,
      hasPublicKey: !!this.vapidKeys.publicKey,
      hasPrivateKey: !!this.vapidKeys.privateKey
    });
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(params: {
    userId?: string;
    customerEmail?: string;
    subscription: z.infer<typeof PushSubscriptionSchema>;
    deviceInfo?: {
      userAgent: string;
      platform: string;
      language: string;
    };
  }): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const { userId, customerEmail, subscription, deviceInfo } = params;
      
      // Validate subscription
      const validatedSubscription = PushSubscriptionSchema.parse(subscription);
      
      // Check if subscription already exists
      const existingSubscription = await prisma.pushSubscription.findFirst({
        where: {
          endpoint: validatedSubscription.endpoint
        }
      });

      if (existingSubscription) {
        // Update existing subscription
        const updated = await prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            userId,
            customerEmail,
            keys: validatedSubscription.keys,
            deviceInfo: deviceInfo || existingSubscription.deviceInfo,
            isActive: true,
            lastUsedAt: new Date()
          }
        });

        logger.info('Push subscription updated', {
          subscriptionId: updated.id,
          userId,
          customerEmail: customerEmail ? this.maskEmail(customerEmail) : undefined
        });

        return { success: true, subscriptionId: updated.id };
      }

      // Create new subscription
      const newSubscription = await prisma.pushSubscription.create({
        data: {
          userId,
          customerEmail,
          endpoint: validatedSubscription.endpoint,
          keys: validatedSubscription.keys,
          deviceInfo,
          isActive: true,
          subscribedAt: new Date(),
          lastUsedAt: new Date()
        }
      });

      logger.info('Push subscription created', {
        subscriptionId: newSubscription.id,
        userId,
        customerEmail: customerEmail ? this.maskEmail(customerEmail) : undefined
      });

      return { success: true, subscriptionId: newSubscription.id };

    } catch (error: any) {
      logger.error('Failed to create push subscription', {
        error: getErrorMessage(error),
        userId: params.userId,
        customerEmail: params.customerEmail ? this.maskEmail(params.customerEmail) : undefined
      });

      return { success: false, error: getErrorMessage(error) };
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(params: {
    subscriptionId?: string;
    endpoint?: string;
    userId?: string;
    customerEmail?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { subscriptionId, endpoint, userId, customerEmail } = params;

      let whereClause: any = {};

      if (subscriptionId) {
        whereClause.id = subscriptionId;
      } else if (endpoint) {
        whereClause.endpoint = endpoint;
      } else if (userId) {
        whereClause.userId = userId;
      } else if (customerEmail) {
        whereClause.customerEmail = customerEmail;
      } else {
        return { success: false, error: 'No identifier provided for unsubscription' };
      }

      const result = await prisma.pushSubscription.updateMany({
        where: whereClause,
        data: {
          isActive: false,
          unsubscribedAt: new Date()
        }
      });

      logger.info('Push subscription(s) deactivated', {
        count: result.count,
        subscriptionId,
        userId,
        customerEmail: customerEmail ? this.maskEmail(customerEmail) : undefined
      });

      return { success: true };

    } catch (error: any) {
      logger.error('Failed to unsubscribe from push notifications', {
        error: getErrorMessage(error),
        subscriptionId: params.subscriptionId,
        userId: params.userId
      });

      return { success: false, error: getErrorMessage(error) };
    }
  }

  /**
   * Send push notification to specific users
   */
  async sendNotification(params: {
    notification: z.infer<typeof PushNotificationRequestSchema>;
    targets: {
      userIds?: string[];
      customerEmails?: string[];
      subscriptionIds?: string[];
      tags?: string[];
    };
    metadata?: Record<string, any>;
  }): Promise<PushNotificationResult> {
    try {
      // Validate notification
      const validatedNotification = PushNotificationRequestSchema.parse(params.notification);
      
      // Get target subscriptions
      const subscriptions = await this.getTargetSubscriptions(params.targets);
      
      if (subscriptions.length === 0) {
        logger.warn('No active subscriptions found for push notification', {
          targets: params.targets
        });
        
        return {
          success: true,
          sentCount: 0,
          failedCount: 0,
          results: []
        };
      }

      // Send notifications concurrently
      const sendPromises = subscriptions.map(subscription => 
        this.sendToSubscription(subscription, validatedNotification, params.metadata)
      );

      const results = await Promise.all(sendPromises);
      
      const sentCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      // Log notification attempt
      await this.logNotification({
        notification: validatedNotification,
        targets: params.targets,
        sentCount,
        failedCount,
        metadata: params.metadata
      });

      logger.info('Push notification batch completed', {
        totalSubscriptions: subscriptions.length,
        sentCount,
        failedCount,
        successRate: Math.round((sentCount / subscriptions.length) * 100)
      });

      return {
        success: true,
        sentCount,
        failedCount,
        results
      };

    } catch (error: any) {
      logger.error('Failed to send push notification', {
        error: getErrorMessage(error),
        targets: params.targets
      });

      return {
        success: false,
        sentCount: 0,
        failedCount: 1,
        results: [{ subscriptionId: 'unknown', success: false, error: getErrorMessage(error) }]
      };
    }
  }

  /**
   * Send notification for booking events
   */
  async sendBookingNotification(params: {
    bookingId: string;
    type: 'confirmation' | 'reminder' | 'update' | 'cancellation';
    customMessage?: string;
  }): Promise<PushNotificationResult> {
    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: params.bookingId }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Generate notification content based on type
      const notification = this.generateBookingNotification(booking, params.type, params.customMessage);
      
      // Send to customer
      return await this.sendNotification({
        notification,
        targets: {
          customerEmails: [booking.customerEmail]
        },
        metadata: {
          bookingId: params.bookingId,
          type: params.type,
          source: 'booking_system'
        }
      });

    } catch (error: any) {
      logger.error('Failed to send booking push notification', {
        bookingId: params.bookingId,
        type: params.type,
        error: getErrorMessage(error)
      });

      return {
        success: false,
        sentCount: 0,
        failedCount: 1,
        results: [{ subscriptionId: 'unknown', success: false, error: getErrorMessage(error) }]
      };
    }
  }

  // Private helper methods
  private async getTargetSubscriptions(targets: any): Promise<any[]> {
    const whereConditions: any[] = [];

    if (targets.userIds?.length > 0) {
      whereConditions.push({ userId: { in: targets.userIds } });
    }

    if (targets.customerEmails?.length > 0) {
      whereConditions.push({ customerEmail: { in: targets.customerEmails } });
    }

    if (targets.subscriptionIds?.length > 0) {
      whereConditions.push({ id: { in: targets.subscriptionIds } });
    }

    if (targets.tags?.length > 0) {
      whereConditions.push({
        tags: {
          hasSome: targets.tags
        }
      });
    }

    if (whereConditions.length === 0) {
      return [];
    }

    return await prisma.pushSubscription.findMany({
      where: {
        AND: [
          { isActive: true },
          { OR: whereConditions }
        ]
      }
    });
  }

  private async sendToSubscription(
    subscription: any, 
    notification: any, 
    metadata?: Record<string, any>
  ): Promise<{ subscriptionId: string; success: boolean; error?: string }> {
    try {
      // This would use the Web Push protocol
      // For MVP, we'll simulate the send and log
      
      const payload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        tag: notification.tag,
        requireInteraction: notification.requireInteraction,
        silent: notification.silent,
        actions: notification.actions,
        data: {
          ...notification.data,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      };

      // In production, this would use webpush library:
      // const webpush = require('web-push');
      // await webpush.sendNotification(subscription, JSON.stringify(payload), options);
      
      logger.info('Push notification sent (simulated)', {
        subscriptionId: subscription.id,
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        title: notification.title
      });

      // Update last used timestamp
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { lastUsedAt: new Date() }
      });

      return { subscriptionId: subscription.id, success: true };

    } catch (error: any) {
      logger.error('Failed to send push to subscription', {
        subscriptionId: subscription.id,
        error: getErrorMessage(error)
      });

      // Handle subscription errors (410 = gone, 400 = invalid)
      if (error.statusCode === 410) {
        await this.unsubscribe({ subscriptionId: subscription.id });
      }

      return { 
        subscriptionId: subscription.id, 
        success: false, 
        error: getErrorMessage(error) 
      };
    }
  }

  private generateBookingNotification(booking: any, type: string, customMessage?: string): any {
    const baseNotification = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `booking-${booking.id}`,
      requireInteraction: type === 'reminder',
      data: {
        bookingId: booking.id,
        type,
        url: `/booking/${booking.bookingNumber}`
      }
    };

    switch (type) {
      case 'confirmation':
        return {
          ...baseNotification,
          title: 'Booking Confirmed! 📋',
          body: customMessage || `Your notary appointment is confirmed for ${new Date(booking.scheduledDateTime).toLocaleDateString()}`
        };
        
      case 'reminder':
        return {
          ...baseNotification,
          title: 'Appointment Reminder ⏰',
          body: customMessage || `Your notary appointment is coming up soon`,
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'reschedule', title: 'Reschedule' }
          ]
        };
        
      case 'update':
        return {
          ...baseNotification,
          title: 'Booking Updated 📝',
          body: customMessage || 'Your booking has been updated'
        };
        
      case 'cancellation':
        return {
          ...baseNotification,
          title: 'Booking Cancelled ❌',
          body: customMessage || 'Your booking has been cancelled'
        };
        
      default:
        return {
          ...baseNotification,
          title: 'Houston Mobile Notary Pros',
          body: customMessage || 'You have a new notification'
        };
    }
  }

  private async logNotification(params: any): Promise<void> {
    try {
      // Log push notification attempt for analytics
      await prisma.pushNotificationLog.create({
        data: {
          title: params.notification.title,
          body: params.notification.body,
          targets: params.targets,
          sentCount: params.sentCount,
          failedCount: params.failedCount,
          metadata: params.metadata,
          createdAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to log push notification', { error });
    }
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();
