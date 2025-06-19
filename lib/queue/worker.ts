import { logger } from '../logger';
import { NotificationType, NotificationMethod, BookingStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { getQueues, createQueues } from './config';
import { QueueJob, JobResult, NotificationJob, BookingProcessingJob, PaymentProcessingJob } from './types';
import { NotificationService } from '../notifications';
import { Queue } from '@upstash/queue';

/**
 * Queue worker service for processing background jobs
 */
export class QueueWorker {
  private static instance: QueueWorker;
  private isProcessing = false;
  private queues: ReturnType<typeof createQueues>;

  private constructor() {
    this.queues = getQueues();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): QueueWorker {
    if (!QueueWorker.instance) {
      QueueWorker.instance = new QueueWorker();
    }
    return QueueWorker.instance;
  }

  /**
   * Process a notification job
   */
  private async processNotificationJob(job: NotificationJob): Promise<JobResult> {
    logger.info(`Processing notification job ${job.id} of type ${job.notificationType}`);
    
    try {
      if (job.bookingId) {
        // Process notifications tied to a booking
        const { bookingId, templateId, notificationType, templateData } = job;
        
        let result;
        if (bookingId) {
          // Send notification for this booking
          result = await NotificationService.sendNotification({
            bookingId,
            type: notificationType as NotificationType,
            recipient: { email: job.recipientId || 'unknown' },
            content: job.message ? { message: job.message } : { subject: templateId || '', message: templateId || '' },
            methods: [NotificationMethod.EMAIL],
          });
        } else if (job.message) {
          // Use direct message if provided
          result = await NotificationService.sendNotification({
            type: NotificationType.CUSTOM,
            recipient: { email: job.recipientId || 'unknown' },
            content: { message: job.message },
            methods: [NotificationMethod.EMAIL],
            bookingId: job.bookingId || undefined
          });
        }

        return {
          success: true,
          jobId: job.id || 'unknown',
          processedAt: new Date(),
          result,
        };
      }
      
      throw new Error('Invalid notification job: missing required fields');
    } catch (error: Error | unknown) {
      logger.error(`Error processing notification job: ${error?.message || 'Unknown error'}`, { error, jobId: job.id });
      return {
        success: false,
        jobId: job.id || 'unknown',
        processedAt: new Date(),
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Process a booking processing job
   */
  private async processBookingJob(job: BookingProcessingJob): Promise<JobResult> {
    logger.info(`Processing booking job ${job.id} for booking ${job.bookingId} - action: ${job.action}`);
    
    try {
      const { bookingId, action, metadata } = job;
      
      // Implement booking processing logic based on the action
      // This would likely interact with a booking service
      let result;
      
      switch (action) {
        case 'confirm':
          // Logic for confirming a booking
          // result = await bookingService.confirmBooking(bookingId);
          result = { status: 'confirmed', bookingId };
          break;
          
        case 'cancel':
          // Logic for cancelling a booking
          // result = await bookingService.cancelBooking(bookingId, metadata?.reason);
          result = { status: 'cancelled', bookingId };
          break;
          
        case 'reschedule':
          // Logic for rescheduling
          // result = await bookingService.rescheduleBooking(bookingId, metadata?.newDateTime);
          result = { status: 'rescheduled', bookingId };
          break;
          
        case 'reminder':
          // Logic for sending a reminder
          const bookingDetails = await prisma.booking.findUnique({
            where: { id: job.bookingId },
            include: { User_Booking_signerIdToUser: true }
          });
          
          if (bookingDetails) {
            result = await NotificationService.sendNotification({
              bookingId: job.bookingId,
              type: NotificationType.BOOKING_CONFIRMATION,
              recipient: { 
                email: bookingDetails.User_Booking_signerIdToUser?.email || 'unknown',
                firstName: bookingDetails.User_Booking_signerIdToUser?.name?.split(' ')[0]
              },
              content: {
                subject: 'Booking Confirmed',
                message: `Your booking has been confirmed for ${new Date(bookingDetails.scheduledDateTime).toLocaleString()}`
              },
              methods: [NotificationMethod.EMAIL]
            });
          } else {
            throw new Error(`Booking not found: ${job.bookingId}`);
          }
          break;
          
        case 'follow-up':
          // Logic for sending a follow-up
          const bookingDetails = await prisma.booking.findUnique({
            where: { id: job.bookingId },
            include: { User_Booking_signerIdToUser: true }
          });
          
          if (bookingDetails) {
            result = await NotificationService.sendNotification({
              bookingId: job.bookingId,
              type: NotificationType.BOOKING_UPDATE,
              recipient: { 
                email: bookingDetails.User_Booking_signerIdToUser?.email || 'unknown',
                firstName: bookingDetails.User_Booking_signerIdToUser?.name?.split(' ')[0]
              },
              content: {
                subject: 'Booking Updated',
                message: `Your booking has been updated`
              },
              methods: [NotificationMethod.EMAIL]
            });
          } else {
            throw new Error(`Booking not found: ${job.bookingId}`);
          }
          break;
          
        case 'payment-check':
          // Logic for checking payment status
          // result = await paymentService.checkBookingPaymentStatus(bookingId);
          result = { status: 'checked', bookingId };
          break;
          
        default:
          throw new Error(`Unknown booking action: ${action}`);
      }
      
      return {
        success: true,
        jobId: job.id || 'unknown',
        processedAt: new Date(),
        result,
      };
    } catch (error: Error | unknown) {
      logger.error(`Error processing booking job: ${error?.message || 'Unknown error'}`, { error, jobId: job.id });
      return {
        success: false,
        jobId: job.id || 'unknown',
        processedAt: new Date(),
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Process a payment processing job
   */
  private async processPaymentJob(job: PaymentProcessingJob): Promise<JobResult> {
    logger.info(`Processing payment job ${job.id} - action: ${job.action}`);
    
    try {
      const { paymentId, bookingId, action, amount, currency, metadata } = job;
      
      // Implement payment processing logic
      // This would interact with your payment service/provider
      let result;
      
      switch (action) {
        case 'create':
          // Create a payment intent
          // result = await paymentService.createPaymentIntent(amount, currency, bookingId, metadata);
          result = { status: 'created', paymentId: 'pi_mock123', bookingId };
          break;
          
        case 'capture':
          // Capture a previously authorized payment
          // result = await paymentService.capturePayment(paymentId);
          result = { status: 'captured', paymentId };
          break;
          
        case 'refund':
          // Process a refund
          // result = await paymentService.refundPayment(paymentId, amount);
          result = { status: 'refunded', paymentId, amount };
          break;
          
        case 'check-status':
          // Check payment status
          // result = await paymentService.checkPaymentStatus(paymentId || bookingId);
          result = { status: 'paid', paymentId, bookingId };
          break;
          
        default:
          throw new Error(`Unknown payment action: ${action}`);
      }
      
      return {
        success: true,
        jobId: job.id || 'unknown',
        processedAt: new Date(),
        result,
      };
    } catch (error: Error | unknown) {
      logger.error(`Error processing payment job: ${error?.message || 'Unknown error'}`, { error, jobId: job.id });
      return {
        success: false,
        jobId: job.id || 'unknown',
        processedAt: new Date(),
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Process a job from any queue based on its type
   */
  public async processJob(job: QueueJob): Promise<JobResult> {
    try {
      switch (job.type) {
        case 'notification':
          return await this.processNotificationJob(job as NotificationJob);
          
        case 'booking-processing':
          return await this.processBookingJob(job as BookingProcessingJob);
          
        case 'payment-processing':
          return await this.processPaymentJob(job as PaymentProcessingJob);
          
        default:
          return {
            success: false,
            jobId: job.id || 'unknown',
            processedAt: new Date(),
            error: `Unknown job type: ${job.type}`,
          };
      }
    } catch (error: Error | unknown) {
      logger.error(`Error processing job: ${error?.message || 'Unknown error'}`, { error, jobId: job.id });
      return {
        success: false,
        jobId: job.id || 'unknown',
        processedAt: new Date(),
        error: error.message || 'Unknown error during job processing',
      };
    }
  }

  /**
   * Start processing jobs from the queues
   */
  public async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    logger.info('Starting queue worker processing...');
    
    const queues = this.queues;
    if (!queues) {
      logger.error('Failed to start queue worker: Queue configuration is missing');
      this.isProcessing = false;
      return;
    }
    
    try {
      // Start processing jobs from each queue
      // This will run in the background
      Promise.all([
        this.processQueue(queues.notificationsQueue, 'notifications'),
        this.processQueue(queues.bookingProcessingQueue, 'booking-processing'),
        this.processQueue(queues.paymentProcessingQueue, 'payment-processing'),
      ]).catch((error: Error | unknown) => {
        logger.error('Error in queue processing:', error);
        this.isProcessing = false;
      });
      
      logger.info('Queue worker processing started successfully');
    } catch (error: Error | unknown) {
      logger.error('Error starting queue processing:', error);
      this.isProcessing = false;
    }
  }
  
  /**
   * Stop processing jobs
   */
  public stopProcessing(): void {
    this.isProcessing = false;
    logger.info('Queue worker processing stopped');
  }
  
  /**
   * Process a specific queue
   */
  private async processQueue(queue: Queue<QueueJob>, queueName: string): Promise<void> {
    logger.info(`Started processing ${queueName} queue`);
    
    while (this.isProcessing) {
      try {
        // Try to get a job from the queue
        const job = await queue.dequeue();
        
        if (job) {
          logger.info(`Processing job from ${queueName} queue:`, job.id);
          const result = await this.processJob(job);
          
          if (!result.success && job.retryCount && job.maxRetries && job.retryCount < job.maxRetries) {
            // Retry the job if it failed and has retries left
            const updatedJob = {
              ...job,
              retryCount: (job.retryCount || 0) + 1,
            };
            
            logger.info(`Retrying job ${job.id} (${updatedJob.retryCount}/${job.maxRetries})`);
            await queue.enqueue(updatedJob);
          }
        } else {
          // No jobs in the queue, wait before checking again
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error: Error | unknown) {
        // Safe error handling when job might be undefined
        const jobId = job && 'id' in job ? job.id : 'unknown';
        logger.error(`Error processing ${queueName} queue: ${error?.message || 'Unknown error'}`, { jobId, error });
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  /**
   * Process all pending jobs in all queues once, useful for serverless environments
   */
  public async processPendingJobs(): Promise<{ processed: number; errors: number }> {
    const queues = this.queues;
    if (!queues) {
      logger.error('Failed to process pending jobs: Queue configuration is missing');
      return { processed: 0, errors: 0 };
    }
    
    let processed = 0;
    let errors = 0;
    
    try {
      // Process jobs from each queue once
      const queueItems = [
        { queue: queues.notificationsQueue, name: 'notifications' },
        { queue: queues.bookingProcessingQueue, name: 'booking-processing' },
        { queue: queues.paymentProcessingQueue, name: 'payment-processing' },
      ];
      
      for (const { queue, name } of queueItems) {
        logger.info(`Processing pending jobs from ${name} queue`);
        
        // Process up to 10 jobs from each queue
        for (let i = 0; i < 10; i++) {
          const job = await queue.dequeue();
          
          if (job) {
            logger.info(`Processing job from ${name} queue:`, job.id);
            const result = await this.processJob(job);
            
            if (result.success) {
              processed++;
            } else {
              errors++;
              
              if (job.retryCount && job.maxRetries && job.retryCount < job.maxRetries) {
                // Retry the job if it failed and has retries left
                const updatedJob = {
                  ...job,
                  retryCount: (job.retryCount || 0) + 1,
                };
                
                logger.info(`Retrying job ${job.id} (${updatedJob.retryCount}/${job.maxRetries})`);
                await queue.enqueue(updatedJob);
              }
            }
          } else {
            // No more jobs in this queue
            break;
          }
        }
      }
      
      logger.info(`Finished processing pending jobs. Processed: ${processed}, Errors: ${errors}`);
      return { processed, errors };
    } catch (error) {
      logger.error('Error processing pending jobs:', error);
      return { processed, errors };
    }
  }
}
