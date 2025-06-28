/**
 * Unified Scheduler System
 * 
 * Consolidates NotificationScheduler, QueueScheduler, and BullScheduler
 * into a single, enterprise-grade scheduling system with:
 * - Centralized job management
 * - Robust error handling and retry logic
 * - Performance monitoring and health checks
 * - Graceful shutdown and cleanup
 * - Type-safe job definitions
 */

import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { BookingStatus, NotificationType } from '@prisma/client';
import { NotificationService } from '@/lib/notifications';
import { sendAppointmentReminder } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { getBullQueueClient } from '@/lib/bullmq';
import { getQueueClient, getQueueWorker } from '@/lib/queue';
import { differenceInHours, differenceInMinutes, addHours } from 'date-fns';

interface ScheduledJobConfig {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  description: string;
}

interface SchedulerMetrics {
  jobsExecuted: number;
  jobsSucceeded: number;
  jobsFailed: number;
  lastExecutionTime: Date | null;
  averageExecutionTime: number;
  uptime: Date;
}

export class UnifiedScheduler {
  private static instance: UnifiedScheduler | null = null;
  private initialized = false;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private metrics: SchedulerMetrics;
  private queueClient = getBullQueueClient();
  private queueWorker = getQueueWorker();
  
  // Centralized job configurations
  private readonly JOB_CONFIGS: ScheduledJobConfig[] = [
    {
      name: 'appointment-reminders-short-term',
      schedule: '*/5 * * * *', // Every 5 minutes
      handler: this.handleShortTermReminders.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 3,
      description: 'Send 1-2 hour appointment reminders'
    },
    {
      name: 'appointment-reminders-daily',
      schedule: '0 * * * *', // Every hour
      handler: this.handleDailyReminders.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 2,
      description: 'Send 24-hour appointment reminders'
    },
    {
      name: 'no-show-checks',
      schedule: '*/15 * * * *', // Every 15 minutes
      handler: this.handleNoShowChecks.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 2,
      description: 'Check for appointment no-shows'
    },
    {
      name: 'payment-expiration-checks',
      schedule: '*/15 * * * *', // Every 15 minutes
      handler: this.handlePaymentExpirations.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 3,
      description: 'Process expired payments'
    },
    {
      name: 'payment-status-updates',
      schedule: '0 * * * *', // Every hour
      handler: this.handlePaymentStatusUpdates.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 2,
      description: 'Update payment statuses from providers'
    },
    {
      name: 'post-service-followups',
      schedule: '0 8 * * *', // Daily at 8am
      handler: this.handlePostServiceFollowups.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 2,
      description: 'Send post-service follow-up messages'
    },
    {
      name: 'queue-processing',
      schedule: '*/1 * * * *', // Every minute
      handler: this.handleQueueProcessing.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 1,
      description: 'Process pending queue jobs'
    },
    {
      name: 'booking-confirmation-reminders',
      schedule: '0 */4 * * *', // Every 4 hours
      handler: this.handleBookingConfirmationReminders.bind(this),
      enabled: true,
      retryOnFailure: true,
      maxRetries: 2,
      description: 'Send booking confirmation reminders'
    },
    {
      name: 'health-check',
      schedule: '*/10 * * * *', // Every 10 minutes
      handler: this.handleHealthCheck.bind(this),
      enabled: true,
      retryOnFailure: false,
      maxRetries: 0,
      description: 'System health monitoring'
    }
  ];
  
  private constructor() {
    if (UnifiedScheduler.instance) {
      throw new Error('Use UnifiedScheduler.getInstance() instead');
    }
    
    this.metrics = {
      jobsExecuted: 0,
      jobsSucceeded: 0,
      jobsFailed: 0,
      lastExecutionTime: null,
      averageExecutionTime: 0,
      uptime: new Date()
    };
  }
  
  /**
   * Gets the singleton instance of UnifiedScheduler
   */
  public static getInstance(): UnifiedScheduler {
    if (!UnifiedScheduler.instance) {
      UnifiedScheduler.instance = new this();
    }
    return UnifiedScheduler.instance;
  }
  
  /**
   * Initialize and start all scheduled jobs
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      logger.warn('UnifiedScheduler already initialized', 'UNIFIED_SCHEDULER');
      return true;
    }
    
    try {
      logger.info('Initializing Unified Scheduler...', 'UNIFIED_SCHEDULER');
      
      // Initialize job schedulers
      for (const config of this.JOB_CONFIGS) {
        if (config.enabled) {
          await this.scheduleJob(config);
        }
      }
      
      this.initialized = true;
      logger.info(`Unified Scheduler initialized with ${this.scheduledJobs.size} active jobs`, 'UNIFIED_SCHEDULER');
      return true;
      
    } catch (error) {
      logger.error('Failed to initialize Unified Scheduler', 'UNIFIED_SCHEDULER', error as Error);
      return false;
    }
  }
  
  /**
   * Schedule a job with error handling and retry logic
   */
  private async scheduleJob(config: ScheduledJobConfig): Promise<void> {
    const job = cron.schedule(config.schedule, async () => {
      await this.executeJobWithRetry(config);
    }, {
      scheduled: false // Don't start immediately
    });
    
    this.scheduledJobs.set(config.name, job);
    job.start();
    
    logger.info(`Scheduled job: ${config.name} (${config.schedule})`, 'UNIFIED_SCHEDULER');
  }
  
  /**
   * Execute job with retry logic and metrics tracking
   */
  private async executeJobWithRetry(config: ScheduledJobConfig): Promise<void> {
    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error | null = null;
    
    this.metrics.jobsExecuted++;
    
    while (attempt <= config.maxRetries) {
      try {
        logger.info(`Executing job: ${config.name} (attempt ${attempt + 1})`, 'UNIFIED_SCHEDULER');
        
        await config.handler();
        
        // Success - update metrics
        this.metrics.jobsSucceeded++;
        this.metrics.lastExecutionTime = new Date();
        
        const executionTime = Date.now() - startTime;
        this.updateAverageExecutionTime(executionTime);
        
        logger.info(`Job completed successfully: ${config.name} (${executionTime}ms)`, 'UNIFIED_SCHEDULER');
        return;
        
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt <= config.maxRetries && config.retryOnFailure) {
          const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Exponential backoff, max 30s
          logger.warn(`Job failed, retrying in ${retryDelay}ms: ${config.name}`, 'UNIFIED_SCHEDULER', lastError);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // All retries failed
    this.metrics.jobsFailed++;
    logger.error(`Job failed after ${attempt} attempts: ${config.name}`, 'UNIFIED_SCHEDULER', lastError);
  }
  
  /**
   * Update average execution time metric
   */
  private updateAverageExecutionTime(executionTime: number): void {
    const totalJobs = this.metrics.jobsSucceeded;
    this.metrics.averageExecutionTime = 
      ((this.metrics.averageExecutionTime * (totalJobs - 1)) + executionTime) / totalJobs;
  }
  
  // ===========================================
  // JOB HANDLERS (Consolidated from all schedulers)
  // ===========================================
  
  /**
   * Handle short-term appointment reminders (1-2 hours)
   */
  private async handleShortTermReminders(): Promise<void> {
    const now = new Date();
    const twoHoursLater = addHours(now, 2);
    const oneHourLater = addHours(now, 1);
    
    const bookings = await prisma.Booking.findMany({
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
        User_Booking_signerIdToUser: true,
        Service: true
      }
    });
    
    logger.info(`Processing ${bookings.length} bookings for short-term reminders`, 'UNIFIED_SCHEDULER');
    
    for (const booking of bookings) {
      const hoursUntil = differenceInHours(booking.scheduledDateTime, now);
      
      if (hoursUntil <= 2 && hoursUntil > 1 && !booking.reminder2hrSentAt) {
        await sendAppointmentReminder(booking.id, '2hr');
      }
      
      if (hoursUntil <= 1 && hoursUntil > 0 && !booking.reminder1hrSentAt) {
        await sendAppointmentReminder(booking.id, '1hr');
      }
    }
  }
  
  /**
   * Handle daily appointment reminders (24 hours)
   */
  private async handleDailyReminders(): Promise<void> {
    const now = new Date();
    const tomorrowMin = addHours(now, 23);
    const tomorrowMax = addHours(now, 25);
    
    const bookings = await prisma.Booking.findMany({
      where: {
        scheduledDateTime: {
          gte: tomorrowMin,
          lte: tomorrowMax
        },
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.SCHEDULED]
        },
        reminder24hrSentAt: null
      },
      include: {
        User_Booking_signerIdToUser: true,
        Service: true
      }
    });
    
    logger.info(`Processing ${bookings.length} bookings for 24-hour reminders`, 'UNIFIED_SCHEDULER');
    
    for (const booking of bookings) {
      await sendAppointmentReminder(booking.id, '24hr');
    }
  }
  
  /**
   * Handle no-show checks
   */
  private async handleNoShowChecks(): Promise<void> {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    const potentialNoShows = await prisma.Booking.findMany({
      where: {
        scheduledDateTime: {
          gte: twoHoursAgo,
          lte: thirtyMinutesAgo
        },
        status: BookingStatus.SCHEDULED,
        noShowCheckPerformedAt: null
      },
      include: {
        User_Booking_signerIdToUser: true,
        Service: true
      }
    });
    
    logger.info(`Processing ${potentialNoShows.length} potential no-shows`, 'UNIFIED_SCHEDULER');
    
    for (const booking of potentialNoShows) {
      if (booking.User_Booking_signerIdToUser?.email) {
        await NotificationService.sendNotification({
          bookingId: booking.id,
          type: NotificationType.NO_SHOW_CHECK,
          recipient: {
            email: booking.User_Booking_signerIdToUser.email,
            firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
          },
          content: {
            subject: `Missed Appointment - Houston Mobile Notary Pros`,
            message: `We've noticed your scheduled notary appointment was set for today but we haven't connected. Please contact us to reschedule.`
          },
          methods: ['EMAIL']
        });
      }
      
      await prisma.Booking.update({
        where: { id: booking.id },
        data: { noShowCheckPerformedAt: now }
      });
    }
  }
  
  /**
   * Handle payment expiration checks
   */
  private async handlePaymentExpirations(): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const expiredPayments = await prisma.Payment.findMany({
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
    
    logger.info(`Processing ${expiredPayments.length} expired payments`, 'UNIFIED_SCHEDULER');
    
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
  }
  
  /**
   * Handle payment status updates
   */
  private async handlePaymentStatusUpdates(): Promise<void> {
    const payments = await prisma.Payment.findMany({
      where: {
        status: {
          in: ['PENDING', 'FAILED']
        },
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    
    logger.info(`Processing ${payments.length} payment status updates`, 'UNIFIED_SCHEDULER');
    
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
  }
  
  /**
   * Handle post-service follow-ups
   */
  private async handlePostServiceFollowups(): Promise<void> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const needFollowUp = await prisma.Booking.findMany({
      where: {
        status: BookingStatus.COMPLETED,
        scheduledDateTime: {
          gte: threeDaysAgo,
          lte: yesterday
        },
        followUpSentAt: null
      },
      include: {
        User_Booking_signerIdToUser: true,
        Service: true
      }
    });
    
    logger.info(`Processing ${needFollowUp.length} follow-ups`, 'UNIFIED_SCHEDULER');
    
    for (const booking of needFollowUp) {
      if (booking.User_Booking_signerIdToUser?.email) {
        await NotificationService.sendNotification({
          bookingId: booking.id,
          type: NotificationType.POST_SERVICE_FOLLOWUP,
          recipient: {
            email: booking.User_Booking_signerIdToUser.email,
            firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
          },
          content: {
            subject: `Thank You for Using Houston Mobile Notary Pros`,
            message: `We hope your recent notary service met your expectations. We'd appreciate your feedback and a review if you were satisfied with our service.`
          },
          methods: ['EMAIL']
        });
      }
      
      await prisma.Booking.update({
        where: { id: booking.id },
        data: { followUpSentAt: now }
      });
    }
  }
  
  /**
   * Handle queue processing
   */
  private async handleQueueProcessing(): Promise<void> {
    const result = await this.queueWorker.processPendingJobs();
    logger.info(`Queue processing: ${result.processed} jobs processed, ${result.errors} errors`, 'UNIFIED_SCHEDULER');
  }
  
  /**
   * Handle booking confirmation reminders
   */
  private async handleBookingConfirmationReminders(): Promise<void> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const bookingsNeedingReminders = await prisma.Booking.findMany({
      where: {
        status: 'AWAITING_CLIENT_ACTION',
        createdAt: {
          lt: twentyFourHoursAgo,
          gt: fortyEightHoursAgo
        },
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
        User_Booking_signerIdToUser: true
      }
    });
    
    logger.info(`Processing ${bookingsNeedingReminders.length} confirmation reminders`, 'UNIFIED_SCHEDULER');
    
    for (const booking of bookingsNeedingReminders) {
      await this.queueClient.enqueueNotification({
        notificationType: 'confirmation_reminder',
        bookingId: booking.id,
        recipientId: booking.User_Booking_signerIdToUser?.email ?? '',
        templateId: 'booking-confirmation-reminder',
        templateData: {
          customerName: booking.User_Booking_signerIdToUser?.name ?? '',
          bookingId: booking.id,
          bookingDate: booking.scheduledDateTime
        }
      });
    }
  }
  
  /**
   * Handle system health checks
   */
  private async handleHealthCheck(): Promise<void> {
    try {
      // Check database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      // Check queue health
      const queueStatus = await this.queueWorker.getStatus();
      
      // Log health metrics
      logger.info(`Health check passed - Queue: ${queueStatus.isInitialized ? 'OK' : 'ERROR'}`, 'UNIFIED_SCHEDULER');
      
    } catch (error) {
      logger.error('Health check failed', 'UNIFIED_SCHEDULER', error as Error);
    }
  }
  
  /**
   * Get scheduler status and metrics
   */
  public getStatus(): Record<string, any> {
    return {
      isInitialized: this.initialized,
      activeJobs: Array.from(this.scheduledJobs.keys()),
      metrics: {
        ...this.metrics,
        uptimeMinutes: Math.floor((Date.now() - this.metrics.uptime.getTime()) / 60000)
      },
      jobConfigs: this.JOB_CONFIGS.map(config => ({
        name: config.name,
        schedule: config.schedule,
        enabled: config.enabled,
        description: config.description
      }))
    };
  }
  
  /**
   * Stop all scheduled jobs and cleanup
   */
  public async stop(): Promise<void> {
    logger.info('Stopping Unified Scheduler...', 'UNIFIED_SCHEDULER');
    
    for (const [name, job] of this.scheduledJobs.entries()) {
      job.stop();
      logger.info(`Stopped job: ${name}`, 'UNIFIED_SCHEDULER');
    }
    
    this.scheduledJobs.clear();
    this.initialized = false;
    logger.info('Unified Scheduler stopped', 'UNIFIED_SCHEDULER');
  }
  
  /**
   * Run immediate check for all jobs (useful for testing)
   */
  public async runImmediateCheck(): Promise<void> {
    logger.info('Running immediate check for all jobs', 'UNIFIED_SCHEDULER');
    
    for (const config of this.JOB_CONFIGS) {
      if (config.enabled && config.name !== 'health-check') {
        try {
          await config.handler();
          logger.info(`Immediate check completed: ${config.name}`, 'UNIFIED_SCHEDULER');
        } catch (error) {
          logger.error(`Immediate check failed: ${config.name}`, 'UNIFIED_SCHEDULER', error as Error);
        }
      }
    }
  }
}

// Export singleton instance and helper functions
export const unifiedScheduler = UnifiedScheduler.getInstance();

export async function initializeUnifiedScheduler(): Promise<boolean> {
  return unifiedScheduler.initialize();
}

export function getSchedulerStatus(): Record<string, any> {
  return unifiedScheduler.getStatus();
}

export async function runImmediateSchedulerCheck(): Promise<void> {
  return unifiedScheduler.runImmediateCheck();
}

export async function stopUnifiedScheduler(): Promise<void> {
  return unifiedScheduler.stop();
}