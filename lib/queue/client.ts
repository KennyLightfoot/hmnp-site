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
      
      const jobId = await queues.notificationsQueue.sendMessage(fullJob) as string;
      logger.info(`Enqueued notification job ${jobId}`, 'QUEUE');
      return jobId;
    } catch (error) {
      logger.error('Failed to enqueue notification:', 'QUEUE', error as Error);
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
        logger.warn('Queue not available, skipping booking job enqueue', 'QUEUE');
        return null;
      }
      
      const fullJob: BookingProcessingJob = {
        ...job,
        type: 'booking-processing',
        createdAt: new Date(),
        maxRetries: job.maxRetries || 3,
        retryCount: 0,
      };
      
      const jobId = await queues.bookingProcessingQueue.sendMessage(fullJob) as string;
      logger.info(`Enqueued booking job ${jobId} for booking ${job.bookingId}`, 'QUEUE');
      return jobId;
    } catch (error) {
      logger.error('Failed to enqueue booking job:', 'QUEUE', error as Error);
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
        logger.warn('Queue not available, skipping payment job enqueue', 'QUEUE');
        return null;
      }
      
      const fullJob: PaymentProcessingJob = {
        ...job,
        type: 'payment-processing',
        createdAt: new Date(),
        maxRetries: job.maxRetries || 3,
        retryCount: 0,
      };
      
      const jobId = await queues.paymentProcessingQueue.sendMessage(fullJob) as string;
      logger.info(`Enqueued payment job ${jobId} for action ${job.action}`, 'QUEUE');
      return jobId;
    } catch (error) {
      logger.error('Failed to enqueue payment job:', 'QUEUE', error as Error);
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
          logger.error(`Unknown job type: ${(job as any).type}`, 'QUEUE');
          return null;
      }
    } catch (error) {
      logger.error('Failed to enqueue job:', 'QUEUE', error as Error);
      return null;
    }
  }
  
  /**
   * Schedule a job to run at a specific time
   */
  public async scheduleJob(job: QueueJob, scheduledTime: Date): Promise<string | null> {
    // In Upstash Queue, we can use delay for scheduling
    // Calculate delay in seconds from now
    
    try {
      const delayInSeconds = Math.max(0, Math.floor((scheduledTime.getTime() - Date.now()) / 1000));
      
      const queues = getQueues();
      if (!queues) {
        logger.warn('Queue not available, skipping scheduled job');
        return null;
      }
      
      const scheduledJob = {
        ...job,
        scheduledFor: scheduledTime,
        createdAt: new Date(),
      };
      
      let jobId: string | null = null;
      
             switch (job.type) {
         case 'notification':
           jobId = await queues.notificationsQueue.sendMessage(scheduledJob, delayInSeconds) as string;
           break;
         case 'booking-processing':
           jobId = await queues.bookingProcessingQueue.sendMessage(scheduledJob, delayInSeconds) as string;
           break;
         case 'payment-processing':
           jobId = await queues.paymentProcessingQueue.sendMessage(scheduledJob, delayInSeconds) as string;
           break;
        default:
          logger.error(`Unknown job type: ${(job as any).type}`);
          return null;
      }
      
             logger.info(`Scheduled job ${jobId} to run at ${scheduledTime.toISOString()}`, 'QUEUE');
       return jobId;
    } catch (error) {
      logger.error('Failed to schedule job:', 'QUEUE', error as Error);
      return null;
    }
  }
}
