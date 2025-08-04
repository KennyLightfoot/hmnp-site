import { logger } from '../logger';
import { getBullQueueWorker } from './index';
import { initializeSchedulers, shutdownSchedulers } from '../schedulers';

/**
 * Initialize the Bull queue system
 * This should be called during application startup
 */
export async function initializeBullQueues(): Promise<boolean> {
  try {
    logger.info('Initializing Bull queue system...');
    
    // Start Bull worker for processing jobs
    const worker = getBullQueueWorker();
    await worker.startProcessing();
    
    // Start the unified scheduler for recurring jobs
    await initializeSchedulers();
    
    logger.info('Bull queue system initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize Bull queue system:', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Gracefully shutdown the Bull queue system
 * This should be called during application shutdown
 */
export async function shutdownBullQueues(): Promise<void> {
  try {
    logger.info('Shutting down Bull queue system...');
    
    // Stop the unified scheduler
    await shutdownSchedulers();
    
    // Stop the Bull worker
    const worker = getBullQueueWorker();
    await worker.stopProcessing();
    
    logger.info('Bull queue system shutdown successfully');
  } catch (error) {
    logger.error('Error during Bull queue system shutdown:', error instanceof Error ? error : new Error(String(error)));
  }
}
