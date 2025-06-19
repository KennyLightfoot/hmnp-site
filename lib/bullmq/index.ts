export * from './config';
export * from './client';
export * from './worker';

// Re-export singleton methods for convenience
import { BullQueueClient } from './client';
import { BullQueueWorker } from './worker';

export const getBullQueueClient = () => BullQueueClient.getInstance();
export const getBullQueueWorker = () => BullQueueWorker.getInstance();
