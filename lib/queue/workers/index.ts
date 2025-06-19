import { getQueues } from '../config';
import { QueueJob, JobResult } from '../types';
import { processNotificationJob } from './notificationWorker';
import { processBookingJob } from './bookingWorker';
import { processPaymentJob } from './paymentWorker';
import { logger } from '@/lib/logger';

/**
 * Main worker class to process jobs from all queues
 */
export class QueueWorker {
  private static instance: QueueWorker | null = null;
  private initialized = false;
  private running = false;
  private pollingIntervals: NodeJS.Timeout[] = [];
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): QueueWorker {
    if (!QueueWorker.instance) {
      QueueWorker.instance = new QueueWorker();
    }
    return QueueWorker.instance;
  }
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  /**
   * Initialize and start the worker
   */
  public initialize(): boolean {
    if (this.initialized) {
      logger.warn('QueueWorker already initialized');
      return false;
    }
    
    logger.info('Initializing QueueWorker');
    
    const queues = getQueues();
    if (!queues) {
      logger.error('Failed to initialize QueueWorker: No queue access');
      return false;
    }
    
    this.initialized = true;
    
    // Automatically start processing
    this.startProcessing();
    return true;
  }
  
  /**
   * Start processing jobs from all queues
   */
  public startProcessing(): boolean {
    if (!this.initialized) {
      logger.error('Cannot start queue processing: Worker not initialized');
      return false;
    }
    
    if (this.running) {
      logger.warn('Queue processing already running');
      return false;
    }
    
    logger.info('Starting queue processing');
    
    const queues = getQueues();
    if (!queues) {
      logger.error('Failed to start processing: No queue access');
      return false;
    }
    
    this.running = true;
    
    // Start polling each queue
    this.startPollingQueue(queues.notificationsQueue, 'notification', 10000); // Every 10 seconds
    this.startPollingQueue(queues.bookingProcessingQueue, 'booking', 15000); // Every 15 seconds
    this.startPollingQueue(queues.paymentProcessingQueue, 'payment', 20000); // Every 20 seconds
    
    logger.info('Queue processing started');
    return true;
  }
  
  /**
   * Stop processing jobs
   */
  public stopProcessing(): void {
    if (!this.running) {
      logger.warn('Queue processing is not running');
      return;
    }
    
    logger.info('Stopping queue processing');
    
    // Clear all polling intervals
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals = [];
    
    this.running = false;
    logger.info('Queue processing stopped');
  }
  
  /**
   * Start polling a specific queue
   */
  private startPollingQueue(queue: any, queueType: string, intervalMs: number): void {
    // Process a single job from the queue
    const processQueueItem = async () => {
      try {
        // Skip processing if we're somehow not running anymore
        if (!this.running) return;
        
        // Attempt to get a job from the queue
        const job = await queue.dequeue<QueueJob>();
        
        if (!job) {
          // Queue is empty, nothing to do
          return;
        }
        
        logger.info(`Processing ${queueType} job from queue`, { jobId: job.id });
        
        // Process the job based on type
        let result: JobResult;
        
        switch (job.type) {
          case 'notification':
            result = await processNotificationJob(job);
            break;
          case 'booking-processing':
            result = await processBookingJob(job);
            break;
          case 'payment-processing':
            result = await processPaymentJob(job);
            break;
          default:
            logger.error(`Unknown job type: ${job.type}`);
            result = {
              success: false,
              jobId: job.id || `unknown-${Date.now()}`,
              processedAt: new Date(),
              error: `Unknown job type: ${job.type}`
            };
        }
        
        // Log results
        if (result.success) {
          logger.info(`Successfully processed ${queueType} job`, { 
            jobId: job.id, 
            result: result.result 
          });
        } else {
          logger.error(`Failed to process ${queueType} job`, { 
            jobId: job.id,
            error: result.error
          });
          
          // If the job failed but has retries remaining, requeue it
          if (job.retryCount && job.maxRetries && job.retryCount < job.maxRetries) {
            job.retryCount++;
            logger.info(`Requeueing job for retry ${job.retryCount}/${job.maxRetries}`, { jobId: job.id });
            await queue.enqueue(job);
          }
        }
      } catch (error) {
        logger.error(`Error in queue processing for ${queueType}:`, { 
          error: error.message,
          stack: error.stack
        });
      }
    };
    
    // Set up interval to regularly check for new jobs
    const intervalId = setInterval(async () => {
      await processQueueItem();
    }, intervalMs);
    
    this.pollingIntervals.push(intervalId);
    
    // Also process immediately for the first time
    processQueueItem().catch(error => {
      logger.error(`Error in initial queue processing for ${queueType}:`, { 
        error: error.message,
        stack: error.stack
      });
    });
  }
  
  /**
   * Check status of the worker
   */
  public getStatus(): { initialized: boolean; running: boolean } {
    return {
      initialized: this.initialized,
      running: this.running
    };
  }
}
