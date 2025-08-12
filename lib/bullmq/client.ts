import { QueueName, getQueues } from './config';
import { 
  QueueJob, 
  NotificationJob, 
  BookingProcessingJob, 
  PaymentProcessingJob 
} from '../queue/types';
import { logger } from '../logger';
import type { JobsOptions } from 'bullmq';

/**
 * BullQueueClient provides methods to enqueue jobs to Bull queues with enhanced
 * reliability, retry logic and monitoring
 */
export class BullQueueClient {
  private static instance: BullQueueClient;
  
  private constructor() {}
  
  /**
   * Get singleton instance of the BullQueueClient
   */
  public static getInstance(): BullQueueClient {
    if (!BullQueueClient.instance) {
      BullQueueClient.instance = new BullQueueClient();
    }
    return BullQueueClient.instance;
  }
  
  /**
   * Add a job to the notifications queue with Bull
   */
  public async enqueueNotification(job: Omit<NotificationJob, 'type'> & { type?: 'notification' }): Promise<string | null> {
    try {
      const queues = getQueues();
      if (!queues) {
        logger.warn('Bull queues not available, skipping notification enqueue');
        return null;
      }
      
      const fullJob: NotificationJob = {
        ...job,
        type: 'notification',
        createdAt: new Date(),
        maxRetries: job.maxRetries || 5,
        retryCount: 0,
      };
      
      // Determine job priority based on type
      let priority = 10; // Default normal priority
      
      // Set priorities: lower number = higher priority
      if (job.notificationType === 'booking_confirmation') priority = 5;
      if (job.notificationType === 'payment_reminder') priority = 3;
      if (job.notificationType === 'emergency') priority = 1;
      
      // Add job to Bull queue with options
      const queuedJob = await queues.notificationsQueue.add('process-notification', fullJob, { 
        priority,
        attempts: fullJob.maxRetries,
        removeOnComplete: true,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1 second
        },
        // Schedule job if scheduledFor is set
        ...(job.scheduledFor && { delay: job.scheduledFor.getTime() - Date.now() }),
      });
      
      logger.info(`Enqueued notification job ${queuedJob.id} with priority ${priority}`);
      return queuedJob.id?.toString() || null;
    } catch (error) {
      logger.error('Failed to enqueue notification to Bull queue', 'BULL_QUEUE_CLIENT', error as Error);
      return null;
    }
  }
  
  /**
   * Add a job to the booking processing queue with Bull
   */
  public async enqueueBookingJob(job: Omit<BookingProcessingJob, 'type'> & { type?: 'booking-processing' }): Promise<string | null> {
    try {
      const queues = getQueues();
      if (!queues) {
        logger.warn('Bull queues not available, skipping booking job enqueue');
        return null;
      }
      
      const fullJob: BookingProcessingJob = {
        ...job,
        type: 'booking-processing',
        createdAt: new Date(),
        maxRetries: job.maxRetries || 3,
        retryCount: 0,
      };
      
      // Set priority based on action type
      let priority = 10; // Default normal priority
      
      // Critical operations get higher priority (lower number)
      if (job.action === 'confirm') priority = 5;
      if (job.action === 'cancel') priority = 3;
      if (job.action === 'payment-check') priority = 7;
      
      // Add job to Bull queue
      const queuedJob = await queues.bookingProcessingQueue.add('process-booking', fullJob, {
        priority,
        attempts: fullJob.maxRetries,
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 100,    // Keep last 100 failed jobs for debugging
        backoff: {
          type: 'exponential',
          delay: 2000, // 2 seconds
        },
      });
      
      logger.info(`Enqueued booking job ${queuedJob.id} for booking ${job.bookingId} with priority ${priority}`);
      return queuedJob.id?.toString() || null;
    } catch (error) {
      logger.error('Failed to enqueue booking job to Bull queue', 'BULL_QUEUE_CLIENT', error as Error);
      return null;
    }
  }
  
  /**
   * Add a job to the payment processing queue with Bull
   */
  public async enqueuePaymentJob(job: Omit<PaymentProcessingJob, 'type'> & { type?: 'payment-processing' }): Promise<string | null> {
    try {
      const queues = getQueues();
      if (!queues) {
        logger.warn('Bull queues not available, skipping payment job enqueue');
        return null;
      }
      
      const fullJob: PaymentProcessingJob = {
        ...job,
        type: 'payment-processing',
        createdAt: new Date(),
        // Payment jobs get more retries due to external API dependencies
        maxRetries: job.maxRetries || 8, 
        retryCount: 0,
      };
      
      // Set priority for different payment operations
      let priority = 5; // Most payment operations are high priority
      if (job.action === 'check-status') priority = 8;
      if (job.action === 'capture') priority = 2; // High priority
      if (job.action === 'refund') priority = 3;
      
      // Configure job options based on the action type
      const jobOptions: JobsOptions = {
        priority,
        attempts: fullJob.maxRetries,
        removeOnComplete: 100,
        removeOnFail: 200,
        backoff: {
          type: 'exponential',
          delay: 5000, // 5 seconds (payment APIs often need more time between retries)
        },
      };
      
      // Add job to Bull queue
      const queuedJob = await queues.paymentProcessingQueue.add('process-payment', fullJob, jobOptions);
      
      logger.info(`Enqueued payment job ${queuedJob.id} for action ${job.action} with priority ${priority}`);
      return queuedJob.id?.toString() || null;
    } catch (error) {
      logger.error('Failed to enqueue payment job to Bull queue', 'BULL_QUEUE_CLIENT', error as Error);
      return null;
    }
  }
  
  /**
   * Enqueue any type of job to the appropriate Bull queue based on its type
   */
  public async enqueueJob(job: QueueJob): Promise<string | null> {
    try {
      switch (job.type) {
        case 'notification':
          return await this.enqueueNotification(job as NotificationJob);
          
        case 'booking-processing':
          return await this.enqueueBookingJob(job as BookingProcessingJob);
          
        case 'payment-processing':
          return await this.enqueuePaymentJob(job as PaymentProcessingJob);
          
        default:
          logger.error(`Unknown job type: ${(job as any).type}`, 'BULL_QUEUE_CLIENT');
          return null;
      }
    } catch (error) {
      logger.error('Failed to enqueue job to Bull queue', 'BULL_QUEUE_CLIENT', error as Error);
      return null;
    }
  }
  
  /**
   * Schedule a job to run at a specific time
   */
  public async scheduleJob(job: QueueJob, scheduledTime: Date): Promise<string | null> {
    try {
      // Calculate delay in milliseconds
      const delay = scheduledTime.getTime() - Date.now();
      
      if (delay < 0) {
        logger.warn('Scheduled time is in the past, running job immediately');
      }
      
      // Use Bull's built-in delay option for scheduling
      const queues = getQueues();
      if (!queues) {
        logger.warn('Bull queues not available, skipping job scheduling');
        return null;
      }
      
      let queue;
      let jobType;
      
      switch (job.type) {
        case 'notification':
          queue = queues.notificationsQueue;
          jobType = 'process-notification';
          break;
        case 'booking-processing':
          queue = queues.bookingProcessingQueue;
          jobType = 'process-booking';
          break;
        case 'payment-processing':
          queue = queues.paymentProcessingQueue;
          jobType = 'process-payment';
          break;
        default:
          logger.error(`Unknown job type for scheduling: ${(job as any).type}`, 'BULL_QUEUE_CLIENT');
          return null;
      }
      
      // Add job with delay
      const queuedJob = await queue.add(jobType, job, {
        delay: Math.max(0, delay),
        attempts: job.maxRetries || 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      
      logger.info(`Scheduled ${job.type} job ${queuedJob.id} for ${scheduledTime.toISOString()}`);
      return queuedJob.id?.toString() || null;
    } catch (error) {
      logger.error('Failed to schedule job with Bull', 'BULL_QUEUE_CLIENT', error as Error);
      return null;
    }
  }

  /**
   * Get counts of jobs by status across all queues
   */
  public async getJobCounts(): Promise<Record<string, any>> {
    try {
      const queues = getQueues();
      if (!queues) {
        return { error: 'Bull queues not available' };
      }

      const { notificationsQueue, bookingProcessingQueue, paymentProcessingQueue } = queues;
      
      const [notificationCounts, bookingCounts, paymentCounts] = await Promise.all([
        notificationsQueue.getJobCounts(),
        bookingProcessingQueue.getJobCounts(),
        paymentProcessingQueue.getJobCounts(),
      ]);

      return {
        notifications: notificationCounts,
        bookingProcessing: bookingCounts,
        paymentProcessing: paymentCounts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get job counts', 'BULL_QUEUE_CLIENT', error as Error);
      return { error: 'Failed to get job counts' };
    }
  }
}
