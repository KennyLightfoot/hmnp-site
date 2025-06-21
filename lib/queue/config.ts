import { Queue } from '@upstash/queue';
import { Redis } from '@upstash/redis';

// Environment variables will be needed for production
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Queue instances - each handles a specific type of job
export const createQueues = () => {
  // Validate environment variables in production
  if (process.env.NODE_ENV === 'production' && (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN)) {
    console.error('Missing Upstash Redis credentials in production environment');
    // We'll fall back to local processing in this case
    return null;
  }

  try {
    // Create Redis instance for queues
    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL || 'redis://localhost:6379',
      token: UPSTASH_REDIS_REST_TOKEN || 'dev-token',
    });

    // Create queues for different job types
    const notificationsQueue = new Queue({
      redis,
      queueName: 'notifications',
    });

    const bookingProcessingQueue = new Queue({
      redis,
      queueName: 'booking-processing',
    });

    const paymentProcessingQueue = new Queue({
      redis,
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
