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
      this.scheduleCancelUnpaidDeposits();

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
   * Schedule automated slot release for unpaid deposits
   * Phase 0-B: Runs every 15 minutes to find bookings in PAYMENT_PENDING older than 2 hrs 
   * and sets status to CANCELLED_BY_SYSTEM
   */
  private scheduleCancelUnpaidDeposits(): void {
    // Run every 15 minutes
    const job = cron.schedule('*/15 * * * *', async () => {
      logger.info('Running scheduled unpaid deposit cancellation check...');
      
      try {
        // Find bookings in PAYMENT_PENDING status older than 2 hours
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        
        const unpaidBookings = await prisma.booking.findMany({
          where: {
            status: 'PAYMENT_PENDING',
            createdAt: {
              lt: twoHoursAgo
            }
          },
          include: {
            signer: true,
            Service: true
          }
        });
        
        logger.info(`Found ${unpaidBookings.length} unpaid bookings to cancel`);
        
        let cancelledCount = 0;
        
        // Cancel each unpaid booking
        for (const booking of unpaidBookings) {
          try {
            await prisma.booking.update({
              where: { id: booking.id },
              data: { 
                status: 'CANCELLED_BY_SYSTEM',
                notes: booking.notes ? 
                  `${booking.notes}\n\nAuto-cancelled: Payment not received within 2 hours` :
                  'Auto-cancelled: Payment not received within 2 hours'
              }
            });
            
            // Cancel any pending payments for this booking
            await prisma.payment.updateMany({
              where: { 
                bookingId: booking.id,
                status: 'PENDING'
              },
              data: { 
                status: 'VOIDED',
                notes: 'Auto-cancelled due to non-payment',
                updatedAt: new Date()
              }
            });
            
            cancelledCount++;
            
            // Send slot released notification to ops
            await this.queueClient.enqueueNotification({
              notificationType: 'slot_released',
              recipientId: 'ops@houstonmobilenotary.com', // Replace with actual ops email
              templateId: 'slot-released-ops',
              templateData: {
                bookingId: booking.id,
                serviceName: booking.Service?.name || 'Unknown Service',
                customerName: booking.signer?.name || 'Unknown',
                customerEmail: booking.signer?.email || 'Unknown',
                scheduledDateTime: booking.scheduledDateTime?.toISOString() || 'TBD',
                cancelledAt: new Date().toISOString(),
                reason: 'Payment not received within 2 hours'
              },
              metadata: {
                reason: 'automated_slot_release',
                originalStatus: 'PAYMENT_PENDING'
              }
            });
            
            logger.info(`Cancelled booking ${booking.id} due to unpaid deposit`);
            
          } catch (error) {
            logger.error(`Error cancelling booking ${booking.id}:`, error as Error);
          }
        }
        
        if (cancelledCount > 0) {
          logger.info(`Successfully cancelled ${cancelledCount} unpaid bookings`);
        }
        
      } catch (error) {
        logger.error('Error during unpaid deposit cancellation', 'BULL_SCHEDULER', error as Error);
      }
    });

    this.cronJobs.set('cancel-unpaid-deposits', job);
    logger.info('Unpaid deposit cancellation scheduled to run every 15 minutes');
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
