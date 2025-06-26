/**
 * Unified Scheduler Initialization Module
 * 
 * This module provides centralized initialization of the unified scheduler system.
 * It replaces the previous separate NotificationScheduler, QueueScheduler, and BullScheduler
 * with a single, enterprise-grade scheduler.
 */

import { initializeUnifiedScheduler, stopUnifiedScheduler, getSchedulerStatus } from './unified-scheduler';
import { logger } from '../logger';

// Flag to track if scheduler is initialized
let isInitialized = false;

/**
 * Initialize the unified scheduler system
 */
export async function initializeSchedulers(): Promise<boolean> {
  if (isInitialized) {
    logger.warn('Scheduler already initialized, skipping');
    return true;
  }

  try {
    logger.info('Initializing unified scheduler system...');
    
    const success = await initializeUnifiedScheduler();
    
    if (!success) {
      logger.error('Failed to initialize unified scheduler');
      return false;
    }
    
    isInitialized = true;
    logger.info('Unified scheduler system initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing unified scheduler:', error as Error);
    return false;
  }
}

/**
 * Gets the initialization status and metrics of the scheduler
 */
export function getSchedulersStatus(): Record<string, any> {
  return {
    ...getSchedulerStatus(),
    initialized: isInitialized
  };
}

/**
 * Shutdown the unified scheduler cleanly
 * Should be called during application shutdown or restart
 */
export async function shutdownSchedulers(): Promise<boolean> {
  try {
    logger.info('Shutting down unified scheduler...');
    
    if (isInitialized) {
      await stopUnifiedScheduler();
    }
    
    isInitialized = false;
    logger.info('Unified scheduler shut down successfully');
    return true;
  } catch (error) {
    logger.error('Error shutting down unified scheduler:', error as Error);
    return false;
  }
}

// Re-export unified scheduler functions for convenience
export { 
  initializeUnifiedScheduler, 
  stopUnifiedScheduler, 
  getSchedulerStatus,
  runImmediateSchedulerCheck 
} from './unified-scheduler';
