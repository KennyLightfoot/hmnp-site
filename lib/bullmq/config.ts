import Bull from 'bull';
import Redis from 'ioredis';
import { logger } from '../logger';

// Redis connection configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Default job options for all queues
const defaultJobOptions = {
  attempts: 5,                // Default retry attempts
  backoff: {
    type: 'exponential',      // Exponential backoff
    delay: 1000,              // Starting at 1 second
  },
  removeOnComplete: 100,      // Keep last 100 completed jobs
  removeOnFail: 200,          // Keep last 200 failed jobs for debugging
};

// Redis client options
const redisOptions: Redis.RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Add password if specified
if (REDIS_PASSWORD) {
  redisOptions.password = REDIS_PASSWORD;
}

// Create Redis instance for Bull
export const createRedisClient = () => {
  try {
    return new Redis(REDIS_URL, redisOptions);
  } catch (error) {
    logger.error('Failed to create Redis client:', error);
    throw error;
  }
};

// Queue names
export enum QueueName {
  NOTIFICATIONS = 'notifications',
  BOOKING_PROCESSING = 'booking-processing',
  PAYMENT_PROCESSING = 'payment-processing',
}

// Queue configuration with connection info
const createQueue = (name: string) => {
  try {
    return new Bull(name, {
      redis: REDIS_URL,
      defaultJobOptions,
    });
  } catch (error) {
    logger.error(`Failed to create queue ${name}:`, error);
    throw error;
  }
};

// Create all queues
export const createQueues = () => {
  try {
    const notificationsQueue = createQueue(QueueName.NOTIFICATIONS);
    const bookingProcessingQueue = createQueue(QueueName.BOOKING_PROCESSING);
    const paymentProcessingQueue = createQueue(QueueName.PAYMENT_PROCESSING);

    // Configure event handlers for each queue
    [notificationsQueue, bookingProcessingQueue, paymentProcessingQueue].forEach(queue => {
      queue.on('error', (error) => {
        logger.error(`Queue error in ${queue.name}:`, error);
      });

      queue.on('failed', (job, error) => {
        logger.error(`Job ${job.id} in queue ${queue.name} failed:`, { error: error.message, jobData: job.data });
      });
    });

    return {
      notificationsQueue,
      bookingProcessingQueue,
      paymentProcessingQueue,
    };
  } catch (error) {
    logger.error('Error initializing Bull queues:', error);
    return null;
  }
};

// Singleton pattern for queue instances
let queueInstances: ReturnType<typeof createQueues> | null = null;

export const getQueues = () => {
  if (!queueInstances) {
    queueInstances = createQueues();
    logger.info('Bull queues initialized');
  }
  return queueInstances;
};

// Close all queue connections gracefully
export const closeQueues = async () => {
  if (queueInstances) {
    const { notificationsQueue, bookingProcessingQueue, paymentProcessingQueue } = queueInstances;
    
    logger.info('Closing Bull queue connections...');
    
    await Promise.all([
      notificationsQueue.close(),
      bookingProcessingQueue.close(),
      paymentProcessingQueue.close(),
    ]);
    
    queueInstances = null;
    logger.info('All Bull queue connections closed');
  }
};
