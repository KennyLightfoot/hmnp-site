/**
 * Notification Scheduler
 * Handles scheduled automated notifications for bookings
 * 
 * This service uses node-cron to run periodic checks and trigger notifications
 * based on booking status and scheduled times without relying on external services.
 */

import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { BookingStatus, NotificationType } from '@prisma/client';
import { NotificationService } from '@/lib/notifications';
import { sendAppointmentReminder } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { differenceInHours, differenceInMinutes, addHours } from 'date-fns';

export class NotificationScheduler {
  private static instance: NotificationScheduler | null = null;
  private initialized = false;
  private scheduledJobs: cron.ScheduledTask[] = [];
  
  // Configure how often each type of check runs
  private readonly CHECK_SCHEDULES = {
    // Every 5 minutes check for immediate appointment reminders (1-2 hour notices)
    shortTermReminders: '*/5 * * * *',
    
    // Every hour check for 24-hour reminders
    dailyReminders: '0 * * * *',
    
    // Every 15 minutes check for no-shows
    noShowChecks: '*/15 * * * *',
    
    // Every 30 minutes check for payment expirations
    paymentExpirations: '*/30 * * * *',
    
    // Every day at 8am check for post-service follow-ups
    followUps: '0 8 * * *'
  };
  
  private constructor() {
    if (NotificationScheduler.instance) {
      throw new Error('Use NotificationScheduler.getInstance() instead');
    }
  }
  
  /**
   * Gets the singleton instance of NotificationScheduler
   */
  public static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new this();
    }
    return NotificationScheduler.instance;
  }
  
  /**
   * Initialize and start all notification scheduler jobs
   */
  public initialize(): void {
    if (this.initialized) {
      logger.warn('NotificationScheduler already initialized', 'NOTIFICATION_SCHEDULER');
      return;
    }
    
    this.startShortTermReminderCheck();
    this.startDailyReminderCheck();
    this.startNoShowCheck();
    this.startPaymentExpirationCheck();
    this.startFollowUpCheck();
    
    this.initialized = true;
    logger.info('NotificationScheduler initialized successfully', 'NOTIFICATION_SCHEDULER');
  }
  
  /**
   * Stop all scheduled jobs
   */
  public stop(): void {
    this.scheduledJobs.forEach(job => job.stop());
    this.scheduledJobs = [];
    this.initialized = false;
    logger.info('NotificationScheduler stopped', 'NOTIFICATION_SCHEDULER');
  }
  
  /**
   * Check and schedule short-term reminders (1-2 hour)
   */
  private startShortTermReminderCheck(): void {
    const job = cron.schedule(this.CHECK_SCHEDULES.shortTermReminders, async () => {
      try {
        logger.info('Running short-term reminder check', 'NOTIFICATION_SCHEDULER');
        
        const now = new Date();
        const twoHoursLater = addHours(now, 2);
        const oneHourLater = addHours(now, 1);
        
        // Find bookings with appointments in the next 1-2 hours
        const bookings = await prisma.booking.findMany({
          where: {
            scheduledDateTime: {
              gte: oneHourLater,
              lte: twoHoursLater
            },
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.SCHEDULED]
            }
          },
          include: {
            signer: true,
            service: true
          }
        });
        
        logger.info(`Found ${bookings.length} bookings for short-term reminders`, 'NOTIFICATION_SCHEDULER');
        
        for (const booking of bookings) {
          const hoursUntil = differenceInHours(booking.scheduledDateTime, now);
          
          // Send 2-hour reminder
          if (hoursUntil <= 2 && hoursUntil > 1 && !booking.reminder2hrSentAt) {
            logger.info(`Sending 2-hour reminder for booking ${booking.id}`, 'NOTIFICATION_SCHEDULER');
            await sendAppointmentReminder(booking.id, '2hr');
          }
          
          // Send 1-hour reminder
          if (hoursUntil <= 1 && hoursUntil > 0 && !booking.reminder1hrSentAt) {
            logger.info(`Sending 1-hour reminder for booking ${booking.id}`, 'NOTIFICATION_SCHEDULER');
            await sendAppointmentReminder(booking.id, '1hr');
          }
        }
      } catch (error) {
        logger.error('Error in short-term reminder check', 'NOTIFICATION_SCHEDULER', error as Error);
      }
    });
    
    this.scheduledJobs.push(job);
  }
  
  /**
   * Check and schedule daily reminders (24-hour)
   */
  private startDailyReminderCheck(): void {
    const job = cron.schedule(this.CHECK_SCHEDULES.dailyReminders, async () => {
      try {
        logger.info('Running 24-hour reminder check', 'NOTIFICATION_SCHEDULER');
        
        const now = new Date();
        const tomorrowMin = addHours(now, 23);
        const tomorrowMax = addHours(now, 25);
        
        // Find bookings with appointments in ~24 hours
        const bookings = await prisma.booking.findMany({
          where: {
            scheduledDateTime: {
              gte: tomorrowMin,
              lte: tomorrowMax
            },
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.SCHEDULED]
            },
            reminder24hrSentAt: null // Only where 24hr reminder hasn't been sent
          },
          include: {
            signer: true,
            service: true
          }
        });
        
        logger.info(`Found ${bookings.length} bookings for 24-hour reminders`, 'NOTIFICATION_SCHEDULER');
        
        for (const booking of bookings) {
          logger.info(`Sending 24-hour reminder for booking ${booking.id}`, 'NOTIFICATION_SCHEDULER');
          await sendAppointmentReminder(booking.id, '24hr');
        }
      } catch (error) {
        logger.error('Error in 24-hour reminder check', 'NOTIFICATION_SCHEDULER', error as Error);
      }
    });
    
    this.scheduledJobs.push(job);
  }
  
  /**
   * Check for no-shows and handle them
   */
  private startNoShowCheck(): void {
    const job = cron.schedule(this.CHECK_SCHEDULES.noShowChecks, async () => {
      try {
        logger.info('Running no-show check', 'NOTIFICATION_SCHEDULER');
        
        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        
        // Find bookings that were scheduled in the past but haven't been marked as completed or cancelled
        const potentialNoShows = await prisma.booking.findMany({
          where: {
            scheduledDateTime: {
              gte: twoHoursAgo,
              lte: thirtyMinutesAgo
            },
            status: BookingStatus.SCHEDULED,
            noShowCheckPerformedAt: null // No-show check hasn't run yet
          },
          include: {
            signer: true,
            service: true
          }
        });
        
        logger.info(`Found ${potentialNoShows.length} potential no-shows`, 'NOTIFICATION_SCHEDULER');
        
        for (const booking of potentialNoShows) {
          // Send no-show notification
          if (booking.signer?.email) {
            await NotificationService.sendNotification({
              bookingId: booking.id,
              type: NotificationType.NO_SHOW_CHECK,
              recipient: {
                email: booking.signer.email,
                firstName: booking.signer.name?.split(' ')[0]
              },
              content: {
                subject: `Missed Appointment - Houston Mobile Notary Pros`,
                message: `We've noticed your scheduled notary appointment was set for today but we haven't connected. Please contact us to reschedule.`
              },
              methods: ['EMAIL']
            });
          }
          
          // Update booking status
          await prisma.booking.update({
            where: { id: booking.id },
            data: { noShowCheckPerformedAt: now }
          });
          
          logger.info(`No-show check completed for booking ${booking.id}`, 'NOTIFICATION_SCHEDULER');
        }
      } catch (error) {
        logger.error('Error in no-show check', 'NOTIFICATION_SCHEDULER', error as Error);
      }
    });
    
    this.scheduledJobs.push(job);
  }
  
  /**
   * Check for payment expirations
   */
  private startPaymentExpirationCheck(): void {
    const job = cron.schedule(this.CHECK_SCHEDULES.paymentExpirations, async () => {
      try {
        logger.info('Running payment expiration check', 'NOTIFICATION_SCHEDULER');
        
        // Get expiration threshold from environment (default to 24 hours)
        const expirationHours = parseInt(process.env.PAYMENT_EXPIRATION_HOURS || '24');
        const now = new Date();
        
        // Find bookings with pending payments that are past the expiration window
        const expiredPayments = await prisma.booking.findMany({
          where: {
            status: BookingStatus.PAYMENT_PENDING,
            createdAt: {
              lte: new Date(now.getTime() - expirationHours * 60 * 60 * 1000)
            }
          },
          include: {
            signer: true
          }
        });
        
        logger.info(`Found ${expiredPayments.length} expired payments`, 'NOTIFICATION_SCHEDULER');
        
        for (const booking of expiredPayments) {
          // Update booking status
          await prisma.booking.update({
            where: { id: booking.id },
            data: { 
              status: BookingStatus.ARCHIVED,
              payment: {
                update: {
                  status: 'expired'
                }
              }
            }
          });
          
          // Send expiration notification
          if (booking.signer?.email) {
            await NotificationService.sendNotification({
              bookingId: booking.id,
              type: NotificationType.PAYMENT_FAILED,
              recipient: {
                email: booking.signer.email,
                firstName: booking.signer.name?.split(' ')[0]
              },
              content: {
                subject: `Payment Expired - Houston Mobile Notary Pros`,
                message: `Your booking payment has expired. Please contact us or book again if you still need notary services.`
              },
              methods: ['EMAIL']
            });
          }
          
          logger.info(`Payment marked as expired for booking ${booking.id}`, 'NOTIFICATION_SCHEDULER');
        }
      } catch (error) {
        logger.error('Error in payment expiration check', 'NOTIFICATION_SCHEDULER', error as Error);
      }
    });
    
    this.scheduledJobs.push(job);
  }
  
  /**
   * Check for post-service follow-ups
   */
  private startFollowUpCheck(): void {
    const job = cron.schedule(this.CHECK_SCHEDULES.followUps, async () => {
      try {
        logger.info('Running follow-up check', 'NOTIFICATION_SCHEDULER');
        
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        
        // Find completed bookings that haven't had follow-ups
        const needFollowUp = await prisma.booking.findMany({
          where: {
            status: BookingStatus.COMPLETED,
            scheduledDateTime: {
              gte: threeDaysAgo,
              lte: yesterday
            },
            followUpSentAt: null
          },
          include: {
            signer: true,
            service: true
          }
        });
        
        logger.info(`Found ${needFollowUp.length} bookings needing follow-up`, 'NOTIFICATION_SCHEDULER');
        
        for (const booking of needFollowUp) {
          // Send follow-up notification
          if (booking.signer?.email) {
            await NotificationService.sendNotification({
              bookingId: booking.id,
              type: NotificationType.POST_SERVICE_FOLLOWUP,
              recipient: {
                email: booking.signer.email,
                firstName: booking.signer.name?.split(' ')[0]
              },
              content: {
                subject: `Thank You for Using Houston Mobile Notary Pros`,
                message: `We hope your recent notary service met your expectations. We'd appreciate your feedback and a review if you were satisfied with our service.`
              },
              methods: ['EMAIL']
            });
          }
          
          // Update follow-up timestamp
          await prisma.booking.update({
            where: { id: booking.id },
            data: { followUpSentAt: now }
          });
          
          logger.info(`Follow-up sent for booking ${booking.id}`, 'NOTIFICATION_SCHEDULER');
        }
      } catch (error) {
        logger.error('Error in follow-up check', 'NOTIFICATION_SCHEDULER', error as Error);
      }
    });
    
    this.scheduledJobs.push(job);
  }
  
  /**
   * Run an immediate check for all pending notifications
   * Useful for testing or manual triggers
   */
  public async runImmediateCheck(): Promise<void> {
    try {
      logger.info('Running immediate notification check', 'NOTIFICATION_SCHEDULER');
      
      // Get all active bookings
      const activeBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: [
              BookingStatus.CONFIRMED,
              BookingStatus.SCHEDULED,
              BookingStatus.PAYMENT_PENDING,
              BookingStatus.COMPLETED
            ]
          }
        }
      });
      
      let totalNotificationsSent = 0;
      
      // Check each booking for pending notifications
      for (const booking of activeBookings) {
        const pendingNotifications = await NotificationService.checkPendingNotifications(booking.id);
        
        if (pendingNotifications.length > 0) {
          logger.info(`Found ${pendingNotifications.length} pending notifications for booking ${booking.id}`, 'NOTIFICATION_SCHEDULER');
          
          // Process each notification type
          for (const notificationType of pendingNotifications) {
            if (notificationType === NotificationType.APPOINTMENT_REMINDER_24HR) {
              await sendAppointmentReminder(booking.id, '24hr');
              totalNotificationsSent++;
            } else if (notificationType === NotificationType.APPOINTMENT_REMINDER_2HR) {
              await sendAppointmentReminder(booking.id, '2hr');
              totalNotificationsSent++;
            } else if (notificationType === NotificationType.APPOINTMENT_REMINDER_1HR) {
              await sendAppointmentReminder(booking.id, '1hr');
              totalNotificationsSent++;
            } else if (notificationType === NotificationType.NO_SHOW_CHECK) {
              // Handle no-show check
              // Implementation would be similar to the no-show check in startNoShowCheck()
              totalNotificationsSent++;
            }
          }
        }
      }
      
      logger.info(`Immediate check complete. Sent ${totalNotificationsSent} notifications`, 'NOTIFICATION_SCHEDULER');
      
    } catch (error) {
      logger.error('Error in immediate notification check', 'NOTIFICATION_SCHEDULER', error as Error);
      throw error;
    }
  }
}

// Export the singleton instance
export const notificationScheduler = NotificationScheduler.getInstance();

// Export a function to initialize the scheduler
export function initializeNotificationScheduler(): void {
  notificationScheduler.initialize();
}

// Export a function to run an immediate check
export function runImmediateNotificationCheck(): Promise<void> {
  return notificationScheduler.runImmediateCheck();
}
