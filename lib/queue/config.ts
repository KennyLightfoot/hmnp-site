import { Queue } from '@upstash/queue';
import { Redis } from '@upstash/redis';

// Use the standard REDIS_URL for broader compatibility
const REDIS_URL = process.env.REDIS_URL;

// Queue instances - each handles a specific type of job
export const createQueues = () => {
  // Validate environment variables in production
  if (process.env.NODE_ENV === 'production' && !REDIS_URL) {
    console.error('Missing REDIS_URL in production environment');
    // We'll fall back to local processing in this case
    return null;
  }

  try {
    // Create Redis instance for queues
    // No token is needed when using the combined Redis URL format
    const redis = new Redis({
      url: REDIS_URL || 'redis://localhost:6379',
    });

    // Create queues for different job types
    const notificationsQueue = new Queue({
      redis: redis as any,
      queueName: 'notifications',
    });

    const bookingProcessingQueue = new Queue({
      redis: redis as any,
      queueName: 'booking-processing',
    });

    const paymentProcessingQueue = new Queue({
      redis: redis as any,
      queueName: 'payment-processing',
    });

    return {
      notificationsQueue,
      bookingProcessingQueue,
      paymentProcessingQueue,
    };
  } catch (error) {
    console.error('Error initializing queues:', error);
    return null;
  }
};

// Singleton pattern for queue instances
let queueInstances: ReturnType<typeof createQueues> | null = null;

export const getQueues = () => {
  if (!queueInstances) {
    queueInstances = createQueues();
  }
  return queueInstances;
};
