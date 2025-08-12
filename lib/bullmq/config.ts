import { Queue, QueueEvents } from 'bullmq';
import Redis, { type Redis as RedisType } from 'ioredis';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from '../logger';

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

// Queue names
export enum QueueName {
  NOTIFICATIONS = 'notifications',
  BOOKING_PROCESSING = 'booking-processing',
  PAYMENT_PROCESSING = 'payment-processing',
}

// Get Redis connection for BullMQ (TCP). Returns null if only REST is available.
const getRedisConnection = (): RedisType | null => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null as any,
      enableReadyCheck: false as any,
    });
  }

  // Upstash REST is HTTP and not compatible with BullMQ TCP connections
  if (process.env.UPSTASH_REDIS_REST_URL) {
    logger.warn('UPSTASH_REDIS_REST_URL detected but BullMQ requires a TCP Redis (REDIS_URL). Queues will be disabled.');
    return null;
  }

  // Local fallback (dev/test)
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const db = parseInt(process.env.REDIS_DB || '0', 10);
  return new Redis({ host, port, password, db, maxRetriesPerRequest: null as any, enableReadyCheck: false as any } as any);
};
// Queue configuration with connection info
const createQueue = (name: string, connection: RedisType) => {
  try {
    return new Queue(name, {
      connection,
      defaultJobOptions,
    });
  } catch (error) {
    logger.error(`Failed to create queue ${name}`, 'BULLMQ_CONFIG', error as Error);
    throw error;
  }
};

// Create all queues
export const createQueues = () => {
  try {
    const connection = getRedisConnection();
    if (!connection) {
      logger.warn('BullMQ queues disabled: no TCP Redis connection available');
      return null;
    }

    const notificationsQueue = createQueue(QueueName.NOTIFICATIONS, connection);
    const bookingProcessingQueue = createQueue(QueueName.BOOKING_PROCESSING, connection);
    const paymentProcessingQueue = createQueue(QueueName.PAYMENT_PROCESSING, connection);

    // Configure event handlers for each queue
    [notificationsQueue, bookingProcessingQueue, paymentProcessingQueue].forEach(queue => {
      queue.on('error', (error) => {
        logger.error(`Queue error in ${queue.name}:`, error);
      });
    });

    // Subscribe to job events using QueueEvents
    const notificationsEvents = new QueueEvents(QueueName.NOTIFICATIONS, { connection });
    const bookingEvents = new QueueEvents(QueueName.BOOKING_PROCESSING, { connection });
    const paymentEvents = new QueueEvents(QueueName.PAYMENT_PROCESSING, { connection });

    ;[notificationsEvents, bookingEvents, paymentEvents].forEach((qe, idx) => {
      const name = [QueueName.NOTIFICATIONS, QueueName.BOOKING_PROCESSING, QueueName.PAYMENT_PROCESSING][idx];
      qe.on('failed', ({ jobId, failedReason }) => {
        logger.error(`Job ${jobId} in queue ${name} failed: ${failedReason}`);
      });
      qe.on('error', (error) => {
        logger.error(`QueueEvents error in ${name}:`, error as any);
      });
    });

    return {
      notificationsQueue,
      bookingProcessingQueue,
      paymentProcessingQueue,
    };
  } catch (error) {
    logger.error('Error initializing Bull queues', 'BULLMQ_CONFIG', error as Error);
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
