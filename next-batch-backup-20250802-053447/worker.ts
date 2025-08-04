import { NotificationType, NotificationMethod, BookingStatus } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { NotificationService } from '../notifications';
import { getQueues } from './config';
import { QueueJob, NotificationJob, BookingProcessingJob, PaymentProcessingJob } from './types';
import { logger } from '../logger';
import { Queue } from '@upstash/queue';

/**
 * QueueWorker processes jobs from the various queues
 */
export class QueueWorker {
  private static instance: QueueWorker | null = null;
  private isRunning = false;
  private notificationManager: NotificationService;
  
  private constructor() {
    this.notificationManager = NotificationService.getInstance();
  }
  
  /**
   * Get singleton instance of QueueWorker
   */
  public static getInstance(): QueueWorker {
    if (!QueueWorker.instance) {
      QueueWorker.instance = new QueueWorker();
    }
    return QueueWorker.instance;
  }
  
  /**
   * Clear the singleton instance (for testing purposes)
   */
  public static clearInstance(): void {
    QueueWorker.instance = null;
  }
  
  /**
   * Start processing jobs from all queues
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Worker is already running', 'QUEUE_WORKER');
      return;
    }
    
    this.isRunning = true;
    logger.info('Starting queue worker', 'QUEUE_WORKER');
    
    try {
      // Start processing each queue concurrently
      await Promise.all([
        this.processNotificationQueue(),
        this.processBookingQueue(), 
        this.processPaymentQueue()
      ]);
    } catch (error) {
      logger.error('Error starting queue processing:', 'QUEUE_WORKER', error as Error);
    }
  }
  
  /**
   * Stop the worker
   */
  public stop(): void {
    this.isRunning = false;
    logger.info('Stopping queue worker', 'QUEUE_WORKER');
  }
  
  /**
   * Process notification jobs
   */
  private async processNotificationQueue(): Promise<void> {
    const queues = getQueues();
    if (!queues) {
      logger.warn('Queue not available for notification processing', 'QUEUE_WORKER');
      return;
    }
    
    await this.processQueue(queues.notificationsQueue, 'notifications');
  }
  
  /**
   * Process notification job
   */
  private async processNotificationJob(job: NotificationJob): Promise<void> {
    logger.info(`Processing notification job ${job.id} of type ${job.notificationType}`, 'QUEUE_WORKER');
    
    try {
      // Extract job data
      const { bookingId, templateId, notificationType, templateData } = job;
      
      // Send notification using NotificationManager
      const result = await this.notificationManager.sendNotification({
        bookingId: bookingId || '',
        templateId,
        type: notificationType as NotificationType,
        templateData,
        method: NotificationMethod.EMAIL, // Default to email, could be configurable
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send notification');
      }
      
      logger.info(`Successfully processed notification job ${job.id}`, 'QUEUE_WORKER');
    } catch (error) {
      logger.error(`Error processing notification job: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`, 'QUEUE_WORKER', { error, jobId: job.id });
      
      // Re-throw to trigger retry mechanism
      throw {
        message: error instanceof Error ? getErrorMessage(error) : 'Unknown error during notification processing',
        jobId: job.id,
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      };
    }
  }
  
  /**
   * Process booking jobs
   */
  private async processBookingQueue(): Promise<void> {
    const queues = getQueues();
    if (!queues) {
      logger.warn('Queue not available for booking processing', 'QUEUE_WORKER');
      return;
    }
    
    await this.processQueue(queues.bookingProcessingQueue, 'booking-processing');
  }
  
  /**
   * Process booking job
   */
  private async processBookingJob(job: BookingProcessingJob): Promise<void> {
    logger.info(`Processing booking job ${job.id} for booking ${job.bookingId}`, 'QUEUE_WORKER');
    
    try {
      // Handle different booking actions
      switch (job.action) {
        case 'confirm':
          await this.handleBookingConfirmation(job);
          break;
        case 'reminder':
          await this.handleBookingReminder(job);
          break;
        case 'cancel':
          await this.handleBookingCancellation(job);
          break;
        case 'reschedule':
        case 'follow-up':
        case 'payment-check':
          // These actions can use the same confirmation flow for now
          await this.handleBookingConfirmation(job);
          break;
        default:
          throw new Error(`Unknown booking action: ${job.action}`);
      }
      
      logger.info(`Successfully processed booking job ${job.id}`, 'QUEUE_WORKER');
    } catch (error) {
      logger.error(`Error processing booking job: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`, 'QUEUE_WORKER', { error, jobId: job.id });
      
      throw {
        message: error instanceof Error ? getErrorMessage(error) : 'Unknown error during booking processing',
        jobId: job.id,
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      };
    }
  }
  
  /**
   * Handle booking confirmation
   */
  private async handleBookingConfirmation(job: BookingProcessingJob): Promise<void> {
        const result = await this.notificationManager.sendNotification({
      bookingId: job.bookingId,
      type: NotificationType.BOOKING_CONFIRMATION,
      method: NotificationMethod.EMAIL,
      templateData: job.metadata,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send booking confirmation');
    }
  }

  /**
   * Handle booking reminder
   */
  private async handleBookingReminder(job: BookingProcessingJob): Promise<void> {
    // Determine reminder type based on job metadata
    const reminderType = job.metadata?.reminderType || '24hr';

    let notificationType: NotificationType;
    switch (reminderType) {
      case '24hr':
        notificationType = NotificationType.APPOINTMENT_REMINDER_24HR;
        break;
      case '2hr':
        notificationType = NotificationType.APPOINTMENT_REMINDER_2HR;
        break;
      case '1hr':
        notificationType = NotificationType.APPOINTMENT_REMINDER_1HR;
        break;
      default:
        notificationType = NotificationType.APPOINTMENT_REMINDER_24HR;
    }

    const result = await this.notificationManager.sendNotification({
      bookingId: job.bookingId,
      type: notificationType,
      method: NotificationMethod.EMAIL,
      templateData: job.metadata,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send booking reminder');
    }
  }

  /**
   * Handle booking cancellation
   */
  private async handleBookingCancellation(job: BookingProcessingJob): Promise<void> {
    const result = await this.notificationManager.sendNotification({
      bookingId: job.bookingId,
      type: NotificationType.BOOKING_CANCELLED,
      method: NotificationMethod.EMAIL,
      templateData: job.metadata,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send cancellation notification');
    }
  }
  
  /**
   * Process payment jobs
   */
  private async processPaymentQueue(): Promise<void> {
    const queues = getQueues();
    if (!queues) {
      logger.warn('Queue not available for payment processing', 'QUEUE_WORKER');
      return;
    }
    
    await this.processQueue(queues.paymentProcessingQueue, 'payment-processing');
  }
  
  /**
   * Process payment job
   */
  private async processPaymentJob(job: PaymentProcessingJob): Promise<void> {
    logger.info(`Processing payment job ${job.id} for action ${job.action}`, 'QUEUE_WORKER');
    
    try {
      // Handle different payment actions
      switch (job.action) {
        case 'create':
          await this.handlePaymentCreate(job);
          break;
        case 'capture':
          await this.handlePaymentCapture(job);
          break;
        case 'refund':
          await this.handlePaymentRefund(job);
          break;
        case 'check-status':
          await this.handlePaymentStatusCheck(job);
          break;
        default:
          throw new Error(`Unknown payment action: ${job.action}`);
      }
      
      logger.info(`Successfully processed payment job ${job.id}`, 'QUEUE_WORKER');
    } catch (error) {
      logger.error(`Error processing payment job: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`, 'QUEUE_WORKER', { error, jobId: job.id });
      
      throw {
        message: error instanceof Error ? getErrorMessage(error) : 'Unknown error during payment processing',
        jobId: job.id,
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      };
    }
  }
  
  /**
   * Handle payment creation
   */
  private async handlePaymentCreate(job: PaymentProcessingJob): Promise<void> {
    const result = await this.notificationManager.sendNotification({
      bookingId: job.bookingId || '',
      type: NotificationType.PAYMENT_CONFIRMATION,
      method: NotificationMethod.EMAIL,
      templateData: job.metadata,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send payment creation notification');
    }
  }
  
  /**
   * Handle payment capture
   */
  private async handlePaymentCapture(job: PaymentProcessingJob): Promise<void> {
    const result = await this.notificationManager.sendNotification({
      bookingId: job.bookingId || '',
      type: NotificationType.PAYMENT_CONFIRMATION,
      method: NotificationMethod.EMAIL,
      templateData: job.metadata,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send payment capture notification');
    }
  }
  
  /**
   * Handle payment refund
   */
  private async handlePaymentRefund(job: PaymentProcessingJob): Promise<void> {
    const result = await this.notificationManager.sendNotification({
      bookingId: job.bookingId || '',
      type: NotificationType.PAYMENT_FAILED,
      method: NotificationMethod.EMAIL,
      templateData: job.metadata,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send payment refund notification');
    }
  }
  
  /**
   * Handle payment status check
   */
  private async handlePaymentStatusCheck(job: PaymentProcessingJob): Promise<void> {
    // For status checks, we might not need to send notifications
    // This is mainly for internal processing
    logger.info(`Payment status check completed for payment ${job.paymentId}`, 'QUEUE_WORKER');
  }
  
  /**
   * Generic queue processor that handles receiving and processing jobs
   */
  private async processQueue(queue: Queue, queueName: string): Promise<void> {
    while (this.isRunning) {
      try {
        // Receive message from queue with 30 second timeout
        const message = await queue.receiveMessage<QueueJob>(30000);
        
        if (!message) {
          // No message received, continue polling
          continue;
        }
        
        const job = message.body;
        const jobId = message.streamId;
        
        try {
          // Process the job based on its type
          switch (job.type) {
            case 'notification':
              await this.processNotificationJob(job as NotificationJob);
              break;
            case 'booking-processing':
              await this.processBookingJob(job as BookingProcessingJob);
              break;
            case 'payment-processing':
              await this.processPaymentJob(job as PaymentProcessingJob);
              break;
            default:
              logger.error(`Unknown job type: ${(job as any).type}`, 'QUEUE_WORKER', {
                jobId: jobId || 'unknown',
                job,
                error: `Unknown job type: ${(job as any).type}`,
              });
              continue;
          }
          
          // Verify the message was processed successfully
          await queue.verifyMessage(jobId);
          logger.info(`Successfully processed and verified job ${jobId}`, 'QUEUE_WORKER');
          
        } catch (error) {
          logger.error(`Error processing job: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`, 'QUEUE_WORKER', { error, jobId });
          
          // Handle retry logic here if needed
          throw {
            jobId,
            error: error instanceof Error ? getErrorMessage(error) : 'Unknown error during job processing',
          };
        }
        
      } catch (error) {
        if (this.isRunning) {
          logger.error('Error in queue processing:', 'QUEUE_WORKER', error as Error);
          // Wait a bit before retrying to avoid tight error loops
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    if (!this.isRunning) {
      logger.error('Error starting queue processing:', 'QUEUE_WORKER', error as Error);
    }
  }

  /**
   * Process all pending jobs from all queues on-demand
   * Used by API endpoints to trigger processing
   */
  public async processPendingJobs(): Promise<{ processed: number; errors: number }> {
    logger.info('Processing pending jobs on-demand', 'QUEUE_WORKER');
    
    let totalProcessed = 0;
    let totalErrors = 0;
    
    const queues = getQueues();
    if (!queues) {
      logger.warn('Queue not available for processing pending jobs', 'QUEUE_WORKER');
      return { processed: 0, errors: 1 };
    }
    
    // Process a limited number of jobs from each queue to avoid timeouts
    const maxJobsPerQueue = 10;
    
    try {
      // Process notification queue
      const notificationResult = await this.processPendingJobsFromQueue(
        queues.notificationsQueue, 
        'notification', 
        maxJobsPerQueue
      );
      totalProcessed += notificationResult.processed;
      totalErrors += notificationResult.errors;
      
      // Process booking queue
      const bookingResult = await this.processPendingJobsFromQueue(
        queues.bookingProcessingQueue, 
        'booking-processing', 
        maxJobsPerQueue
      );
      totalProcessed += bookingResult.processed;
      totalErrors += bookingResult.errors;
      
      // Process payment queue
      const paymentResult = await this.processPendingJobsFromQueue(
        queues.paymentProcessingQueue, 
        'payment-processing', 
        maxJobsPerQueue
      );
      totalProcessed += paymentResult.processed;
      totalErrors += paymentResult.errors;
      
    } catch (error) {
      logger.error('Error during pending jobs processing:', 'QUEUE_WORKER', error as Error);
      totalErrors++;
    }
    
    logger.info(`Completed pending jobs processing: ${totalProcessed} processed, ${totalErrors} errors`, 'QUEUE_WORKER');
    return { processed: totalProcessed, errors: totalErrors };
  }

  /**
   * Process a single job on-demand
   * Used by API endpoints to process specific jobs
   */
  public async processJob(job: QueueJob): Promise<{
    success: boolean;
    jobId: string;
    processedAt: Date;
    error?: string;
    result?: any;
  }> {
    const jobId = job.id || `manual-${Date.now()}`;
    const processedAt = new Date();
    
    logger.info(`Processing single job ${jobId} of type ${job.type}`, 'QUEUE_WORKER');
    
    try {
      // Process the job based on its type
      switch (job.type) {
        case 'notification':
          await this.processNotificationJob(job as NotificationJob);
          break;
        case 'booking-processing':
          await this.processBookingJob(job as BookingProcessingJob);
          break;
        case 'payment-processing':
          await this.processPaymentJob(job as PaymentProcessingJob);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }
      
      logger.info(`Successfully processed single job ${jobId}`, 'QUEUE_WORKER');
      return {
        success: true,
        jobId,
        processedAt,
        result: { jobType: job.type, processed: true }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error during single job processing';
      logger.error(`Error processing single job ${jobId}: ${errorMessage}`, 'QUEUE_WORKER', { error, jobId });
      
      return {
        success: false,
        jobId,
        processedAt,
        error: errorMessage
      };
    }
  }

  /**
   * Helper method to process pending jobs from a specific queue
   */
  private async processPendingJobsFromQueue(
    queue: Queue, 
    queueType: string, 
    maxJobs: number
  ): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;
    
    try {
      for (let i = 0; i < maxJobs; i++) {
        // Try to receive a message with a short timeout
        const message = await queue.receiveMessage<QueueJob>(1000); // 1 second timeout
        
        if (!message) {
          // No more messages in queue
          break;
        }
        
        const job = message.body;
        const jobId = message.streamId;
        
        try {
          // Process the job
          await this.processJobByType(job);
          
          // Verify the message was processed successfully
          await queue.verifyMessage(jobId);
          processed++;
          
          logger.info(`Successfully processed ${queueType} job ${jobId}`, 'QUEUE_WORKER');
          
        } catch (error) {
          errors++;
          logger.error(`Error processing ${queueType} job ${jobId}: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`, 'QUEUE_WORKER', { error, jobId });
        }
      }
    } catch (error) {
      logger.error(`Error processing pending jobs from ${queueType} queue:`, 'QUEUE_WORKER', error as Error);
      errors++;
    }
    
    return { processed, errors };
  }

  /**
   * Helper method to process a job by its type
   */
  private async processJobByType(job: QueueJob): Promise<void> {
    switch (job.type) {
      case 'notification':
        await this.processNotificationJob(job as NotificationJob);
        break;
      case 'booking-processing':
        await this.processBookingJob(job as BookingProcessingJob);
        break;
      case 'payment-processing':
        await this.processPaymentJob(job as PaymentProcessingJob);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }
}
