/**
 * Scheduler Initialization Module
 * 
 * This module provides centralized initialization of all schedulers.
 * It's designed to be imported once during app startup.
 */

import { NotificationScheduler } from './notificationScheduler';
import { QueueScheduler } from './queueScheduler';
import { logger } from '../logger';
import { initializeBullQueues, shutdownBullQueues } from '../bullmq/startup';

const schedulersInitialized = {
  notifications: false,
  queue: false,
  bullQueue: false
};

// Flag to track if schedulers are initialized
let isInitialized = false;

/**
 * Initialize all schedulers in the system
 */
export async function initializeSchedulers(): Promise<boolean> {
  if (isInitialized) {
    logger.warn('Schedulers already initialized, skipping');
    return true;
  }

  try {
    logger.info('Initializing schedulers...');
    
    // Initialize notification scheduler
    const notificationScheduler = NotificationScheduler.getInstance();
    notificationScheduler.initialize();
    // The initialize method returns void and handles its own logging
    schedulersInitialized.notifications = true;
    
    // Initialize queue scheduler
    const queueScheduler = QueueScheduler.getInstance();
    const queueInitialized = await queueScheduler.initialize();
    
    if (!queueInitialized) {
      logger.error('Failed to initialize queue scheduler');
      return false;
    }
    
    schedulersInitialized.queue = true;
    
    // Initialize Bull queue system
    const bullQueueInitialized = await initializeBullQueues();
    
    if (!bullQueueInitialized) {
      logger.error('Failed to initialize Bull queue system');
      return false;
    }
    
    schedulersInitialized.bullQueue = true;
    
    isInitialized = true;
    logger.info('All schedulers initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing schedulers:', error);
    return false;
  }
}

/**
 * Gets the initialization status of all schedulers
 */
export function getSchedulersStatus(): Record<string, boolean> {
  return {
    ...schedulersInitialized,
    all: isInitialized
  };
}

/**
 * Shutdown all schedulers cleanly
 * Should be called during application shutdown or restart
 */
export async function shutdownSchedulers(): Promise<boolean> {
  try {
    logger.info('Shutting down schedulers...');
    
    // Shutdown notification scheduler if running
    if (schedulersInitialized.notifications) {
      const notificationScheduler = NotificationScheduler.getInstance();
      notificationScheduler.stop();
    }
    
    // Shutdown queue scheduler if running
    if (schedulersInitialized.queue) {
      const queueScheduler = QueueScheduler.getInstance();
      await queueScheduler.stop();
    }
    
    // Shutdown Bull queue system if running
    if (schedulersInitialized.bullQueue) {
      await shutdownBullQueues();
    }
    
    isInitialized = false;
    Object.keys(schedulersInitialized).forEach(key => {
      // Use type assertion to handle the string index
      (schedulersInitialized as Record<string, boolean>)[key] = false;
    });
    
    logger.info('All schedulers shut down successfully');
    return true;
  } catch (error) {
    logger.error('Error shutting down schedulers:', error);
    return false;
  }
}
