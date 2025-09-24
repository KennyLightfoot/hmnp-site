/**
 * TypeScript type definitions for notification service
 */

import { NotificationType, NotificationMethod } from '@prisma/client';
import { NotificationRecipient, NotificationContent } from './prisma';

/**
 * Request parameters for sending a notification
 */
export interface SendNotificationRequest {
  bookingId: string;
  type: NotificationType;
  recipient: NotificationRecipient;
  content?: NotificationContent;
  methods?: NotificationMethod[];
  skipDuplicateCheck?: boolean;
  forceResend?: boolean;
}

/**
 * Response from sending a notification
 */
export interface NotificationResult {
  success: boolean;
  results: {
    method: NotificationMethod;
    sent: boolean;
    notificationId?: string;
    error?: string;
  }[];
  notificationIds?: string[];
}

/**
 * Notification service interface
 */
export interface NotificationServiceInterface {
  sendNotification(params: SendNotificationRequest): Promise<NotificationResult>;
  getNotificationStatus(notificationId: string): Promise<any>;
  sendBookingConfirmation(bookingId: string): Promise<NotificationResult>;
  sendBookingCancellation(bookingId: string, reason?: string): Promise<NotificationResult>;
  sendPaymentConfirmation(paymentId: string): Promise<NotificationResult>;
}
