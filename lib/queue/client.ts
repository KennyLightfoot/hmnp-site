import { getQueues } from './config';
import { 
  QueueJob, 
  NotificationJob, 
  BookingProcessingJob, 
  PaymentProcessingJob 
} from './types';
import { logger } from '../logger';

/**
 * QueueClient provides methods to enqueue jobs to the various queues
 */
export class QueueClient {
  private static instance: QueueClient;
  
  private constructor() {}
  
  /**
   * Get singleton instance of the QueueClient
   */
  public static getInstance(): QueueClient {
    if (!QueueClient.instance) {
      QueueClient.instance = new QueueClient();
    }
    return QueueClient.instance;
  }
  
  /**
   * Add a job to the notifications queue
   */
  public async enqueueNotification(job: Omit<NotificationJob, 'type'> & { type?: 'notification' }): Promise<string | null> {
    try {
      const queues = getQueues();
      if (!queues) {
        logger.warn('Queue not available, skipping notification enqueue');
        return null;
      }
      
      const fullJob: NotificationJob = {
        ...job,
        type: 'notification',
        createdAt: new Date(),
        maxRetries: job.maxRetries || 3,
        retryCount: 0,
      };
      
      const jobId = await queues.notificationsQueue.enqueue(fullJob);
      logger.info(`Enqueued notification job ${jobId}`);
      return jobId;
    } catch (error) {
      logger.error('Failed to enqueue notification:', error);
      return null;
    }
  }
  
  /**
   * Add a job to the booking processing queue
   */
  public async enqueueBookingJob(job: Omit<BookingProcessingJob, 'type'> & { type?: 'booking-processing' }): Promise<string | null> {
    try {
      const queues = getQueues();
      if (!queues) {
        logger.warn('Queue not available, skipping booking job enqueue');
        return null;
      }
      
      const fullJob: BookingProcessingJob = {
        ...job,
        type: 'booking-processing',
        createdAt: new Date(),
        maxRetries: job.maxRetries || 3,
        retryCount: 0,
      };
      
      const jobId = await queues.bookingProcessingQueue.enqueue(fullJob);
      logger.info(`Enqueued booking job ${jobId} for booking ${job.bookingId}`);
      return jobId;
    } catch (error) {
      logger.error('Failed to enqueue booking job:', error);
      return null;
    }
  }
  
  /**
   * Add a job to the payment processing queue
   */
  public async enqueuePaymentJob(job: Omit<PaymentProcessingJob, 'type'> & { type?: 'payment-processing' }): Promise<string | null> {
    try {
      const queues = getQueues();
      if (!queues) {
        logger.warn('Queue not available, skipping payment job enqueue');
        return null;
      }
      
      const fullJob: PaymentProcessingJob = {
        ...job,
        type: 'payment-processing',
        createdAt: new Date(),
        maxRetries: job.maxRetries || 3,
        retryCount: 0,
      };
      
      const jobId = await queues.paymentProcessingQueue.enqueue(fullJob);
      logger.info(`Enqueued payment job ${jobId} for action ${job.action}`);
      return jobId;
    } catch (error) {
      logger.error('Failed to enqueue payment job:', error);
      return null;
    }
  }
  
  /**
   * Enqueue any type of job to the appropriate queue based on its type
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
          logger.error(`Unknown job type: ${(job as any).type}`);
          return null;
      }
    } catch (error) {
      logger.error('Failed to enqueue job:', error);
      return null;
    }
  }
  
  /**
   * Schedule a job to run at a specific time
   */
  public async scheduleJob(job: QueueJob, scheduledTime: Date): Promise<string | null> {
    // In Upstash Queue, there's no native scheduling feature
    // We'll implement this by adding a scheduledFor field to the job
    // and our worker will check if it's time to process it
    
    try {
      const scheduledJob = {
        ...job,
        scheduledFor: scheduledTime,
        createdAt: new Date(),
      };
      
      return await this.enqueueJob(scheduledJob);
    } catch (error) {
      logger.error('Failed to schedule job:', error);
      return null;
    }
  }
}
