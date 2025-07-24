import Bull from 'bull';

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

// Queue configuration with connection info
const createQueue = (name: string) => {
  try {
    const redisOptions = { url: process.env.REDIS_URL || "redis://localhost:6379", maxRetriesPerRequest: null, enableReadyCheck: false };
    return new Bull(name, {
      redis: redisOptions,
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
