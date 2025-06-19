/**
 * This file contains examples of how to use the job queue system.
 * It is meant as a reference for developers and is not meant to be imported directly.
 */

import { NotificationType, BookingStatus, NotificationMethod } from '@prisma/client';
import { getQueueClient } from './index';

/**
 * Example: How to send a notification through the queue system
 */
export async function exampleSendNotification(bookingId: string, recipientEmail: string) {
  const queueClient = getQueueClient();
  
  // Enqueue a notification that will be processed in the background
  await queueClient.enqueueNotification({
    type: 'notification',
    bookingId,
    recipientId: recipientEmail,
    notificationType: NotificationType.BOOKING_CONFIRMATION,
    templateId: 'booking_confirmation',
    // Add any template data needed
    templateData: {
      bookingDate: new Date().toISOString(),
      serviceName: 'Document Notarization',
    }
  });
  
  console.log(`Notification for booking ${bookingId} has been queued`);
}

/**
 * Example: How to handle booking status changes through the queue
 */
export async function exampleProcessBooking(bookingId: string, newStatus: BookingStatus) {
  const queueClient = getQueueClient();
  
  // Enqueue a booking processing job
  await queueClient.enqueueBookingProcessing({
    type: 'booking-processing',
    bookingId,
    action: 'update-status',
    data: {
      status: newStatus,
      updatedAt: new Date().toISOString()
    }
  });
  
  console.log(`Booking ${bookingId} status update to ${newStatus} has been queued`);
}

/**
 * Example: How to schedule a reminder notification for later
 */
export async function exampleScheduleReminder(bookingId: string, recipientEmail: string, delayMs: number) {
  const queueClient = getQueueClient();
  
  // Schedule a reminder to be sent after the specified delay
  await queueClient.enqueueNotification({
    type: 'notification',
    bookingId,
    recipientId: recipientEmail,
    notificationType: NotificationType.APPOINTMENT_REMINDER_24HR,
    templateId: 'booking_reminder',
    // Add any template data needed
    templateData: {
      reminderTime: '24 hours',
    }
  }, { 
    delay: delayMs // Delay in milliseconds before the job is processed
  });
  
  console.log(`Reminder for booking ${bookingId} has been scheduled after ${delayMs}ms`);
}

/**
 * Example: How to process a payment notification
 */
export async function exampleProcessPayment(bookingId: string, paymentId: string) {
  const queueClient = getQueueClient();
  
  await queueClient.enqueuePaymentProcessing({
    type: 'payment-processing',
    bookingId,
    paymentId,
    action: 'confirm',
    amount: 150.0
  });
  
  console.log(`Payment processing for booking ${bookingId} has been queued`);
}

/**
 * Example: Using the job queue for timezone-based notifications
 */
export async function exampleTimezoneAwareNotification(
  bookingId: string, 
  recipientEmail: string,
  scheduledTime: Date,
  businessTimezone: string,
  clientTimezone: string
) {
  const queueClient = getQueueClient();
  
  await queueClient.enqueueNotification({
    type: 'notification',
    bookingId,
    recipientId: recipientEmail,
    notificationType: NotificationType.APPOINTMENT_REMINDER_24HR,
    templateId: 'timezone_reminder',
    templateData: {
      scheduledTime: scheduledTime.toISOString(),
      businessTimezone,
      clientTimezone,
      // The actual formatting of times in client timezone should be done
      // in the notification template using date-fns-tz
    }
  });
  
  console.log(`Timezone-aware notification for booking ${bookingId} has been queued`);
}
