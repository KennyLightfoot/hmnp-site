import { logger } from '../logger';
import { getBullQueueClient } from './index';
import { QueueName } from './config';
import { prisma } from '../prisma';
import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';

/**
 * BullScheduler manages the scheduled execution of jobs using Bull queues
 * This provides a more reliable way to handle payment expirations and status updates
 */
export class BullScheduler {
  private static instance: BullScheduler;
  private cronJobs: Map<string, ScheduledTask> = new Map();
  private isInitialized: boolean = false;
  private queueClient = getBullQueueClient();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): BullScheduler {
    if (!BullScheduler.instance) {
      BullScheduler.instance = new BullScheduler();
    }
    return BullScheduler.instance;
  }

  /**
   * Initialize the Bull scheduler
   */
  public initialize(): boolean {
    if (this.isInitialized) {
      logger.info('Bull scheduler already initialized');
      return true;
    }

    try {
      logger.info('Initializing Bull Scheduler...');

      // Schedule various recurring jobs
      this.schedulePaymentExpirationChecks();
      this.schedulePaymentStatusUpdates();
      this.scheduleBookingConfirmationReminders();

      this.isInitialized = true;
      logger.info('Bull scheduler initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Bull scheduler', 'BULL_SCHEDULER', error as Error);
      return false;
    }
  }

  /**
   * Schedule checks for payment expirations
   * Runs every 15 minutes to identify payments that have expired and need action
   */
  private schedulePaymentExpirationChecks(): void {
    // Run every 15 minutes
    const job = cron.schedule('*/15 * * * *', async () => {
      logger.info('Running scheduled payment expiration check...');
      
      try {
        // Find bookings with pending payments that are expired (created over 30 minutes ago)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        const expiredPayments = await prisma.payment.findMany({
          where: {
            status: 'PENDING',
            createdAt: {
              lt: thirtyMinutesAgo
            }
          },
          include: {
            Booking: true
          }
        });
        
        logger.info(`Found ${expiredPayments.length} expired pending payments`);
        
        // Process each expired payment by adding to the Bull payment queue
        for (const payment of expiredPayments) {
          await this.queueClient.enqueuePaymentJob({
            paymentId: payment.id,
            bookingId: payment.bookingId,
            action: 'check-status',
            metadata: {
              reason: 'expired_pending_payment',
              expirationThreshold: '30_minutes'
            }
          });
        }
        
      } catch (error) {
        logger.error('Error during payment expiration check', 'BULL_SCHEDULER', error as Error);
      }
    });

    this.cronJobs.set('payment-expiration-check', job);
    logger.info('Payment expiration checks scheduled to run every 15 minutes');
  }

  /**
   * Schedule regular payment status updates for pending payments
   * This keeps the payment status in sync with the payment provider
   */
  private schedulePaymentStatusUpdates(): void {
    // Run every hour
    const job = cron.schedule('0 * * * *', async () => {
      logger.info('Running scheduled payment status updates...');
      
      try {
        // Find payments that need status updates (still pending or recently failed)
        const payments = await prisma.payment.findMany({
          where: {
            status: {
              in: ['PENDING', 'FAILED']
            },
            // Only check payments created in the last 24 hours
            createdAt: {
              gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        });
        
        logger.info(`Found ${payments.length} payments needing status updates`);
        
        // Queue status check jobs with different priorities based on status
        for (const payment of payments) {
          const priority = payment.status === 'FAILED' ? 5 : 10;
          
          await this.queueClient.enqueuePaymentJob({
            paymentId: payment.id,
            action: 'check-status',
            priority,
            metadata: {
              reason: 'scheduled_status_update',
              currentStatus: payment.status
            }
          });
        }
        
      } catch (error) {
        logger.error('Error during payment status updates', 'BULL_SCHEDULER', error as Error);
      }
    });

    this.cronJobs.set('payment-status-updates', job);
    logger.info('Payment status updates scheduled to run every hour');
  }

  /**
   * Schedule booking confirmation reminders
   * Identifies bookings that need confirmation and sends reminders
   */
  private scheduleBookingConfirmationReminders(): void {
    // Run every 4 hours
    const job = cron.schedule('0 */4 * * *', async () => {
      logger.info('Running scheduled booking confirmation reminders...');
      
      try {
        // Find bookings awaiting confirmation that are 24h old
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        
        const bookingsNeedingReminders = await prisma.booking.findMany({
          where: {
            status: 'AWAITING_CLIENT_ACTION',
            createdAt: {
              lt: twentyFourHoursAgo,
              gt: fortyEightHoursAgo // Only send reminders for bookings created in the last 24-48 hours
            },
            // Check if we haven't sent a reminder in the last 24 hours
            NotificationLog: {
              none: {
                notificationType: 'APPOINTMENT_REMINDER_24HR',
                createdAt: {
                  gt: twentyFourHoursAgo
                }
              }
            }
          },
          include: {
            signer: true
          }
        });
        
        logger.info(`Found ${bookingsNeedingReminders.length} bookings needing confirmation reminders`);
        
        // Queue notification jobs for each booking
        for (const booking of bookingsNeedingReminders) {
          await this.queueClient.enqueueNotification({
            notificationType: 'confirmation_reminder',
            bookingId: booking.id,
            recipientId: booking.signer?.email ?? '',
            templateId: 'booking-confirmation-reminder',
            templateData: {
              customerName: booking.signer?.name ?? '',
              bookingId: booking.id,
              bookingDate: booking.scheduledDateTime
            }
          });
        }
        
      } catch (error) {
        logger.error('Error during booking confirmation reminders', 'BULL_SCHEDULER', error as Error);
      }
    });

    this.cronJobs.set('booking-confirmation-reminders', job);
    logger.info('Booking confirmation reminders scheduled to run every 4 hours');
  }

  /**
   * Get status of the scheduler
   */
  public getStatus(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      activeCronJobs: Array.from(this.cronJobs.keys()),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Stop all scheduled jobs
   */
  public stop(): void {
    logger.info('Stopping Bull scheduler...');
    
    for (const [name, job] of this.cronJobs.entries()) {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
    
    this.cronJobs.clear();
    this.isInitialized = false;
    logger.info('Bull scheduler stopped');
  }
}
