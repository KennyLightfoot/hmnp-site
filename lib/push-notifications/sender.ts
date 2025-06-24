/**
 * Push Notification Sending Service
 * Handles sending push notifications to subscribed users
 */

import { prisma } from '@/lib/db';
import { getVAPIDDetails } from './vapid';

// Push notification payload interface
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

// Default notification configuration
const DEFAULT_NOTIFICATION: Partial<PushNotificationPayload> = {
  icon: '/icons/icon-192x192.png',
  badge: '/icons/badge-72x72.png',
  tag: 'hmnp-notification',
  requireInteraction: true,
  actions: [
    {
      action: 'view',
      title: 'View Details',
      icon: '/icons/action-view.png'
    },
    {
      action: 'dismiss',
      title: 'Dismiss',
      icon: '/icons/action-dismiss.png'
    }
  ]
};

/**
 * Send push notification using web-push library
 * Note: You'll need to install web-push: npm install web-push
 */
async function sendWebPush(subscription: any, payload: string, options: any) {
  // For now, simulate the web-push call
  // In production, you'd use: webpush.sendNotification(subscription, payload, options)
  
  console.log('📱 Sending push notification:', {
    endpoint: subscription.endpoint.substring(0, 50) + '...',
    payload: JSON.parse(payload),
    timestamp: new Date().toISOString()
  });

  // Simulate successful send
  return Promise.resolve({ statusCode: 200 });
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotificationToUser(
  userId: string,
  notification: PushNotificationPayload
): Promise<{ success: boolean; error?: string; sentCount: number }> {
  try {
    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) {
      return { success: false, error: 'No push subscriptions found for user', sentCount: 0 };
    }

    // Prepare notification payload
    const payload = {
      ...DEFAULT_NOTIFICATION,
      ...notification,
      timestamp: Date.now(),
      data: {
        url: notification.url || '/dashboard',
        ...notification.data
      }
    };

    // Get VAPID details
    const vapidDetails = getVAPIDDetails();
    const options = {
      vapidDetails,
      TTL: 24 * 60 * 60, // 24 hours
      headers: {
        'Urgency': 'normal'
      }
    };

    // Send to all user's subscriptions
    let sentCount = 0;
    const promises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        await sendWebPush(pushSubscription, JSON.stringify(payload), options);
        sentCount++;
      } catch (error) {
        console.error('Failed to send to subscription:', subscription.id, error);
        
        // Remove invalid subscriptions
        if ((error as any)?.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: subscription.id }
          });
        }
      }
    });

    await Promise.all(promises);

    return { success: sentCount > 0, sentCount };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      sentCount: 0 
    };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  notification: PushNotificationPayload
): Promise<{ success: boolean; results: Array<{ userId: string; success: boolean; sentCount: number }> }> {
  const results = await Promise.all(
    userIds.map(async (userId) => {
      const result = await sendPushNotificationToUser(userId, notification);
      return { userId, ...result };
    })
  );

  const totalSuccess = results.some(r => r.success);
  return { success: totalSuccess, results };
}

/**
 * Send booking-related notifications
 */
export class BookingNotifications {
  static async confirmationNotification(userId: string, bookingId: string) {
    return sendPushNotificationToUser(userId, {
      title: 'Booking Confirmed! 🎉',
      body: 'Your notary service has been confirmed. Check your email for details.',
      url: `/portal/${bookingId}`,
      tag: `booking-confirmed-${bookingId}`,
      data: { bookingId, type: 'booking-confirmed' }
    });
  }

  static async reminderNotification(userId: string, bookingId: string, timeUntil: string) {
    return sendPushNotificationToUser(userId, {
      title: `Upcoming Appointment - ${timeUntil}`,
      body: 'Your notary appointment is coming up. Please prepare your documents.',
      url: `/portal/${bookingId}`,
      tag: `booking-reminder-${bookingId}`,
      data: { bookingId, type: 'booking-reminder' },
      actions: [
        {
          action: 'view-details',
          title: 'View Details'
        },
        {
          action: 'reschedule',
          title: 'Reschedule'
        }
      ]
    });
  }

  static async completionNotification(userId: string, bookingId: string) {
    return sendPushNotificationToUser(userId, {
      title: 'Service Complete! ✅',
      body: 'Your documents have been notarized. Download them from your portal.',
      url: `/portal/${bookingId}`,
      tag: `booking-complete-${bookingId}`,
      data: { bookingId, type: 'booking-complete' }
    });
  }

  static async documentReadyNotification(userId: string, bookingId: string) {
    return sendPushNotificationToUser(userId, {
      title: 'Documents Ready! 📄',
      body: 'Your notarized documents are ready for download.',
      url: `/portal/${bookingId}`,
      tag: `documents-ready-${bookingId}`,
      data: { bookingId, type: 'documents-ready' }
    });
  }
}

/**
 * Send system notifications
 */
export class SystemNotifications {
  static async maintenanceNotification(userId: string) {
    return sendPushNotificationToUser(userId, {
      title: 'Scheduled Maintenance',
      body: 'Our system will be briefly unavailable for maintenance tonight.',
      url: '/dashboard',
      tag: 'system-maintenance',
      data: { type: 'system-maintenance' }
    });
  }

  static async newFeatureNotification(userId: string, feature: string) {
    return sendPushNotificationToUser(userId, {
      title: 'New Feature Available! 🚀',
      body: `Check out our new ${feature} feature.`,
      url: '/dashboard',
      tag: 'new-feature',
      data: { type: 'new-feature', feature }
    });
  }
} 