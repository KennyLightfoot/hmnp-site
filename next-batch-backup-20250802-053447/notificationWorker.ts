import { NotificationJob, JobResult } from '../types';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { NotificationService } from '@/lib/notifications';
import { logger } from '@/lib/logger';

/**
 * Worker to process notification jobs from the queue
 */
export async function processNotificationJob(job: NotificationJob): Promise<JobResult> {
  logger.info(`Processing notification job: ${job.id}`, { jobType: job.type, notificationType: job.notificationType });
  
  try {
    const notificationService = NotificationService.getInstance();
    const jobId = job.id || `notification-${Date.now()}`;
    
    // Handle different notification types
    switch (job.notificationType) {
      case 'email':
        if (!job.subject || !job.message || !job.recipientId) {
          throw new Error('Missing required email notification data');
        }
        
        logger.info(`Sending email notification to ${job.recipientId}`);
        const emailResult = await notificationService.sendEmailWithRetry(
          job.recipientId,
          job.subject,
          job.message
        );
        
        if (!emailResult.success) {
          throw new Error(emailResult.error || 'Failed to send email notification');
        }
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { sent: true, recipient: job.recipientId }
        };
        
      case 'sms':
        if (!job.message || !job.recipientId) {
          throw new Error('Missing required SMS notification data');
        }
        
        logger.info(`Sending SMS notification to ${job.recipientId}`);
        const smsResult = await notificationService.sendSmsWithRetry(
          job.recipientId,
          job.message
        );
        
        if (!smsResult.success) {
          throw new Error(smsResult.error || 'Failed to send SMS notification');
        }
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { sent: true, recipient: job.recipientId }
        };
        
      case 'appointment_reminder':
        if (!job.bookingId) {
          throw new Error('Missing bookingId for appointment reminder');
        }
        
        logger.info(`Sending appointment reminder notification for booking ${job.bookingId}`);
        await notificationService.sendAppointmentReminder(job.bookingId);
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { reminderSent: true, bookingId: job.bookingId }
        };
        
      default:
        throw new Error(`Unsupported notification type: ${job.notificationType}`);
    }
  } catch (error) {
    logger.error(`Error processing notification job ${job.id || 'unknown'}:`, { 
      error: error instanceof Error ? getErrorMessage(error) : String(error),
      jobDetails: job,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      success: false,
      jobId: job.id || `notification-${Date.now()}`,
      processedAt: new Date(),
      error: error instanceof Error ? getErrorMessage(error) : String(error)
    };
  }
}
