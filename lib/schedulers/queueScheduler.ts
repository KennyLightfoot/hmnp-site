import { logger } from '../logger';
import { getQueueClient, getQueueWorker } from '../queue';
import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';

/**
 * QueueScheduler manages the scheduled execution of queue processing
 * This scheduler runs in the background to process any queued jobs
 */
export class QueueScheduler {
  private static instance: QueueScheduler;
  private cronJobs: Map<string, ScheduledTask> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): QueueScheduler {
    if (!QueueScheduler.instance) {
      QueueScheduler.instance = new QueueScheduler();
    }
    return QueueScheduler.instance;
  }

  /**
   * Initialize the queue scheduler
   */
  public initialize(): boolean {
    if (this.isInitialized) {
      logger.info('Queue scheduler already initialized');
      return true;
    }

    try {
      logger.info('Initializing Queue Scheduler...');

      // Schedule job for processing queues every minute
      this.scheduleQueueProcessing();

      this.isInitialized = true;
      logger.info('Queue scheduler initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize queue scheduler:', error);
      return false;
    }
  }

  /**
   * Schedule queue processing to run regularly
   */
  private scheduleQueueProcessing(): void {
    // Process queues every minute
    const queueProcessingJob = cron.schedule('*/1 * * * *', async () => {
      logger.info('Running scheduled queue processing...');
      try {
        const queueWorker = getQueueWorker();
        const result = await queueWorker.processPendingJobs();
        logger.info(`Queue processing completed: ${result.processed} jobs processed, ${result.errors} errors`);
      } catch (error) {
        logger.error('Error during scheduled queue processing:', error);
      }
    });

    this.cronJobs.set('queue-processing', queueProcessingJob);
    logger.info('Queue processing scheduled to run every minute');
  }

  /**
   * Process queues immediately
   */
  public async processQueuesNow(): Promise<{ processed: number; errors: number }> {
    logger.info('Processing queues immediately...');
    try {
      const queueWorker = getQueueWorker();
      const result = await queueWorker.processPendingJobs();
      logger.info(`Queue processing completed: ${result.processed} jobs processed, ${result.errors} errors`);
      return result;
    } catch (error) {
      logger.error('Error during immediate queue processing:', error);
      return { processed: 0, errors: 0 };
    }
  }

  /**
   * Get status of the scheduler
   */
  public getStatus(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      activeCronJobs: Array.from(this.cronJobs.keys()),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Stop all scheduled jobs
   */
  public stop(): void {
    logger.info('Stopping queue scheduler...');
    
    for (const [name, job] of this.cronJobs.entries()) {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
    
    this.cronJobs.clear();
    this.isInitialized = false;
    logger.info('Queue scheduler stopped');
  }
}
