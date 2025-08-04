/**
 * Queue Configuration - Bridge Interface
 * This file provides the simple addJob interface that other parts of the system expect
 * Acts as a bridge to the sophisticated QueueClient system
 */

import { QueueClient } from './client';
import { logger } from '../logger';
import type { NotificationJob, BookingProcessingJob, PaymentProcessingJob } from './types';

// Get the queue client instance
const queueClient = QueueClient.getInstance();

/**
 * Simple addJob function that acts as a bridge to the QueueClient
 * This maintains backward compatibility with existing code
 */
export async function addJob(
  queueType: string,
  action: string,
  payload: any,
  options?: { delay?: number }
): Promise<string | null> {
  try {
    // Map the simple interface to the proper queue client methods
    switch (queueType) {
      case 'notification': {
        const notificationJob: Omit<NotificationJob, 'type'> = {
          notificationType: payload.type || action,
          recipientId: payload.recipientId,
          bookingId: payload.bookingId,
          templateId: payload.templateId,
          templateData: payload.templateData || payload,
          subject: payload.subject,
          message: payload.message,
          scheduledFor: payload.scheduledFor,
          maxRetries: payload.maxRetries || 3,
          retryCount: 0,
          createdAt: new Date()
        };
        
        if (options?.delay) {
          const scheduledTime = new Date(Date.now() + options.delay);
          return await queueClient.scheduleJob({ ...notificationJob, type: 'notification' }, scheduledTime);
        }
        
        return await queueClient.enqueueNotification(notificationJob);
      }
      
      case 'payment': {
        const paymentJob: Omit<PaymentProcessingJob, 'type'> = {
          paymentId: payload.paymentId,
          bookingId: payload.bookingId,
          action: action as 'create' | 'capture' | 'refund' | 'check-status',
          amount: payload.amount,
          currency: payload.currency,
          metadata: payload.metadata || payload,
          maxRetries: payload.maxRetries || 3,
          retryCount: 0,
          createdAt: new Date()
        };
        
        if (options?.delay) {
          const scheduledTime = new Date(Date.now() + options.delay);
          return await queueClient.scheduleJob({ ...paymentJob, type: 'payment-processing' }, scheduledTime);
        }
        
        return await queueClient.enqueuePaymentJob(paymentJob);
      }
      
      case 'invoice': {
        // Map invoice actions to booking processing jobs
        const bookingAction = action === 'generate' ? 'confirm' : 
                            action === 'send' ? 'follow-up' : 
                            action === 'generate_pdf' ? 'confirm' : 'confirm';
        
        const bookingJob: Omit<BookingProcessingJob, 'type'> = {
          bookingId: payload.bookingId,
          action: bookingAction as 'confirm' | 'cancel' | 'reschedule' | 'reminder' | 'follow-up' | 'payment-check',
          metadata: {
            originalAction: action,
            invoiceAction: true,
            ...payload
          },
          maxRetries: payload.maxRetries || 3,
          retryCount: 0,
          createdAt: new Date()
        };
        
        if (options?.delay) {
          const scheduledTime = new Date(Date.now() + options.delay);
          return await queueClient.scheduleJob({ ...bookingJob, type: 'booking-processing' }, scheduledTime);
        }
        
        return await queueClient.enqueueBookingJob(bookingJob);
      }
      
      default:
        logger.error(`Unknown queue type: ${queueType}`, { queueType, action, payload });
        return null;
    }
  } catch (error) {
    logger.error('Failed to add job via addJob bridge:', error as Error, {
      queueType,
      action,
      payload: JSON.stringify(payload).substring(0, 200)
    });
    return null;
  }
}

// Export the QueueClient for advanced usage if needed
export { QueueClient } from './client';
export * from './types';
