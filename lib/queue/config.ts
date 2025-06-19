import { Queue } from '@upstash/queue';

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
    // Create queues for different job types
    const notificationsQueue = new Queue({
      url: UPSTASH_REDIS_REST_URL || 'https://valid-url-for-dev-mode.upstash.io',
      token: UPSTASH_REDIS_REST_TOKEN || 'token-for-dev-mode',
      name: 'notifications', // Queue name 
    });

    const bookingProcessingQueue = new Queue({
      url: UPSTASH_REDIS_REST_URL || 'https://valid-url-for-dev-mode.upstash.io',
      token: UPSTASH_REDIS_REST_TOKEN || 'token-for-dev-mode',
      name: 'booking-processing', // Queue name
    });

    const paymentProcessingQueue = new Queue({
      url: UPSTASH_REDIS_REST_URL || 'https://valid-url-for-dev-mode.upstash.io',
      token: UPSTASH_REDIS_REST_TOKEN || 'token-for-dev-mode',
      name: 'payment-processing', // Queue name
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
