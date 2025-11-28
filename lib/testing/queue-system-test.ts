import { getQueues, closeQueues, QueueName } from '@/lib/bullmq/config';
import { getErrorMessage } from '@/lib/utils/error-utils';

export interface QueueTestResult {
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

/**
 * Simple BullMQ system test:
 * - Ensures a TCP Redis connection is available.
 * - Enqueues a no-op job into each core queue and waits for it to be stored.
 *
 * This does NOT require workers to be running; it only verifies that
 * queues can connect to Redis and accept jobs.
 */
export async function runQueueSystemTest(): Promise<QueueTestResult> {
  const startedAt = Date.now();

  try {
    const queues = getQueues();
    if (!queues) {
      return {
        status: 'SKIP',
        message:
          'BullMQ queues are disabled (no TCP Redis connection). Set REDIS_URL to enable queue tests.',
      };
    }

    const { notificationsQueue, bookingProcessingQueue, paymentProcessingQueue } =
      queues;

    const jobs = [
      notificationsQueue.add('system-test', { ping: true }, { removeOnComplete: true }),
      bookingProcessingQueue.add('system-test', { ping: true }, { removeOnComplete: true }),
      paymentProcessingQueue.add('system-test', { ping: true }, { removeOnComplete: true }),
    ];

    await Promise.all(jobs);

    const duration = Date.now() - startedAt;

    return {
      status: 'PASS',
      message: `Queues accepted system-test jobs successfully in ${duration}ms.`,
      details: {
        queues: [
          QueueName.NOTIFICATIONS,
          QueueName.BOOKING_PROCESSING,
          QueueName.PAYMENT_PROCESSING,
        ],
        duration,
      },
    };
  } catch (error) {
    return {
      status: 'FAIL',
      message: 'Queue system test failed',
      details: {
        error: error instanceof Error ? getErrorMessage(error) : String(error),
      },
    };
  } finally {
    // Best-effort cleanup
    try {
      await closeQueues();
    } catch {
      // ignore close errors
    }
  }
}


