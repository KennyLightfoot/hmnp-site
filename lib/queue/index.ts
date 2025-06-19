export * from './types';
export * from './client';
export * from './worker';
export * from './config';

// Re-export singleton methods for convenience
import { QueueClient } from './client';
import { QueueWorker } from './worker';

export const getQueueClient = () => QueueClient.getInstance();
export const getQueueWorker = () => QueueWorker.getInstance();
