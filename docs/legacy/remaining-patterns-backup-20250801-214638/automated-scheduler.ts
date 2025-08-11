/**
 * Automated Notification Scheduler
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Intelligent scheduling system for automated notifications
 */

import { logger } from '../logger';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '../prisma';
import { notificationService } from '../notifications';
import { addJob } from '../queue/queue-config';
import { z } from 'zod';

// Scheduling rule schema
const SchedulingRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean().default(true),
  trigger: z.object({
    event: z.enum([
      'booking_created',
      'booking_confirmed', 
      'payment_received',
      'appointment_approaching',
      'appointment_completed',
      'no_show_detected',
      'payment_failed',
      'document_ready'
    ]),
    timing: z.object({
      delay: z.number().optional(), // minutes after trigger
      before: z.number().optional(), // minutes before appointment
      at: z.string().optional() // specific time "14:00"
    })
  }),
  conditions: z.array(z.object({
    field: z.string(), // booking.serviceType, booking.status, etc.
    operator: z.enum(['equals', 'not_equals', 'contains', 'in', 'not_in', 'greater_than', 'less_than']),
    value: z.any()
  })).optional(),
  notification: z.object({
    type: z.string(),
    method: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']),
    template: z.string().optional(),
    customMessage: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
  }),
  frequency: z.object({
    maxCount: z.number().optional(), // max times this rule can trigger per booking
    cooldown: z.number().optional(), // minutes between triggers
    onlyBusinessHours: z.boolean().default(false)
  }).optional()
});

// Notification schedule entry
export interface ScheduledNotification {
  id: string;
  bookingId: string;
  ruleId: string;
  scheduledAt: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastAttemptAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Automated Notification Scheduler
 */
export class AutomatedNotificationScheduler {
  private readonly defaultRules: z.infer<typeof SchedulingRuleSchema>[] = [
    {
      id: 'booking_confirmation',
      name: 'Booking Confirmation',
      description: 'Send confirmation immediately after booking is created',
      isActive: true,
      trigger: {
        event: 'booking_created',
        timing: { delay: 0 }
      },
      notification: {
        type: 'BOOKING_CONFIRMATION',
        method: 'EMAIL',
        priority: 'high'
      }
    },
    {
      id: 'payment_confirmation',
      name: 'Payment Confirmation',
      description: 'Send confirmation when payment is received',
      isActive: true,
      trigger: {
        event: 'payment_received',
        timing: { delay: 5 }
      },
      notification: {
        type: 'PAYMENT_CONFIRMATION',
        method: 'EMAIL',
        priority: 'high'
      }
    },
    {
      id: 'reminder_24hr',
      name: '24-Hour Reminder',
      description: 'Remind customer 24 hours before appointment',
      isActive: true,
      trigger: {
        event: 'appointment_approaching',
        timing: { before: 1440 } // 24 hours = 1440 minutes
      },
      notification: {
        type: 'APPOINTMENT_REMINDER_24HR',
        method: 'EMAIL',
        priority: 'normal'
      },
      frequency: {
        maxCount: 1,
        onlyBusinessHours: true
      }
    },
    {
      id: 'reminder_2hr',
      name: '2-Hour Reminder',
      description: 'Remind customer 2 hours before appointment',
      isActive: true,
      trigger: {
        event: 'appointment_approaching',
        timing: { before: 120 } // 2 hours = 120 minutes
      },
      notification: {
        type: 'APPOINTMENT_REMINDER_2HR',
        method: 'SMS',
        priority: 'high'
      },
      frequency: {
        maxCount: 1
      }
    },
    {
      id: 'reminder_30min',
      name: '30-Minute Reminder',
      description: 'Final reminder 30 minutes before appointment',
      isActive: true,
      trigger: {
        event: 'appointment_approaching',
        timing: { before: 30 }
      },
      notification: {
        type: 'APPOINTMENT_REMINDER_NOW',
        method: 'PUSH',
        priority: 'urgent'
      },
      frequency: {
        maxCount: 1
      }
    },
    {
      id: 'ron_services_reminder',
      name: 'RON Services Special Reminder',
      description: 'Special reminder for RON services with technical requirements',
      isActive: true,
      trigger: {
        event: 'appointment_approaching',
        timing: { before: 60 } // 1 hour
      },
      conditions: [
        {
          field: 'booking.serviceType',
          operator: 'equals',
          value: 'RON_SERVICES'
        }
      ],
      notification: {
        type: 'APPOINTMENT_REMINDER_1HR',
        method: 'EMAIL',
        template: 'ron_technical_requirements',
        priority: 'high'
      },
      frequency: {
        maxCount: 1
      }
    },
    {
      id: 'followup_standard',
      name: 'Standard Follow-up',
      description: 'Follow up 24 hours after service completion',
      isActive: true,
      trigger: {
        event: 'appointment_completed',
        timing: { delay: 1440 } // 24 hours later
      },
      notification: {
        type: 'POST_SERVICE_FOLLOWUP',
        method: 'EMAIL',
        priority: 'low'
      },
      frequency: {
        maxCount: 1,
        onlyBusinessHours: true
      }
    },
    {
      id: 'payment_failed_retry',
      name: 'Payment Failed Retry',
      description: 'Notify customer of payment failure and provide retry options',
      isActive: true,
      trigger: {
        event: 'payment_failed',
        timing: { delay: 15 } // 15 minutes after failure
      },
      notification: {
        type: 'PAYMENT_FAILED',
        method: 'EMAIL',
        priority: 'urgent'
      },
      frequency: {
        maxCount: 3,
        cooldown: 240 // 4 hours between attempts
      }
    }
  ];

  /**
   * Initialize scheduler with default rules
   */
  async initialize(): Promise<void> {
    try {
      // Load or create default scheduling rules
      for (const rule of this.defaultRules) {
        await this.upsertSchedulingRule(rule);
      }
      
      logger.info('Automated notification scheduler initialized', {
        ruleCount: this.defaultRules.length
      });
    } catch (error: any) {
      logger.error('Failed to initialize notification scheduler', {
        error: getErrorMessage(error)
      });
      throw error;
    }
  }

  /**
   * Process booking event and schedule appropriate notifications
   */
  async processBookingEvent(params: {
    event: string;
    bookingId: string;
    eventData?: Record<string, any>;
    triggeredAt?: Date;
  }): Promise<void> {
    try {
      const { event, bookingId, eventData = {}, triggeredAt = new Date() } = params;
      
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) {
        logger.error('Booking not found for event processing', { bookingId, event });
        return;
      }

      // Get active scheduling rules for this event
      const rules = await this.getActiveRulesForEvent(event);
      
      logger.info('Processing booking event', {
        event,
        bookingId,
        rulesCount: rules.length,
        serviceType: booking.serviceType,
        status: booking.status
      });

      // Process each applicable rule
      for (const rule of rules) {
        try {
          // Check if conditions are met
          if (!this.evaluateConditions(rule.conditions || [], booking, eventData)) {
            continue;
          }

          // Check frequency limits
          if (!await this.checkFrequencyLimits(rule, bookingId)) {
            continue;
          }

          // Calculate when to send notification
          const scheduledAt = this.calculateScheduledTime(
            rule.trigger.timing,
            triggeredAt,
            booking.scheduledDateTime
          );

          // Schedule the notification
          await this.scheduleNotification({
            bookingId,
            ruleId: rule.id,
            scheduledAt,
            notification: rule.notification,
            metadata: {
              event,
              ruleId: rule.id,
              eventData,
              booking: {
                serviceType: booking.serviceType,
                status: booking.status,
                customerEmail: booking.customerEmail
              }
            }
          });

        } catch (error: any) {
          logger.error('Failed to process scheduling rule', {
            ruleId: rule.id,
            bookingId,
            error: getErrorMessage(error)
          });
        }
      }

    } catch (error: any) {
      logger.error('Failed to process booking event', {
        event: params.event,
        bookingId: params.bookingId,
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Schedule a specific notification
   */
  async scheduleNotification(params: {
    bookingId: string;
    ruleId: string;
    scheduledAt: Date;
    notification: any;
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      const { bookingId, ruleId, scheduledAt, notification, metadata } = params;
      
      // Create scheduled notification record
      const scheduled = await prisma.scheduledNotification.create({
        data: {
          bookingId,
          ruleId,
          scheduledAt,
          notificationType: notification.type,
          method: notification.method,
          priority: notification.priority,
          template: notification.template,
          customMessage: notification.customMessage,
          status: 'scheduled',
          attempts: 0,
          metadata: metadata || {}
        }
      });

      // Queue the notification for delivery at scheduled time
      const delay = Math.max(0, scheduledAt.getTime() - Date.now());
      
      await addJob('notification', 'send_scheduled', {
        scheduledNotificationId: scheduled.id,
        bookingId,
        notificationType: notification.type,
        method: notification.method,
        priority: notification.priority
      }, {
        delay
      });

      logger.info('Notification scheduled', {
        scheduledId: scheduled.id,
        bookingId,
        ruleId,
        scheduledAt,
        type: notification.type,
        method: notification.method,
        delayMs: delay
      });

      return scheduled.id;

    } catch (error: any) {
      logger.error('Failed to schedule notification', {
        bookingId: params.bookingId,
        ruleId: params.ruleId,
        error: getErrorMessage(error)
      });
      throw error;
    }
  }

  /**
   * Process scheduled notifications that are due
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      // Get due notifications
      const dueNotifications = await prisma.scheduledNotification.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: {
            lte: new Date()
          }
        },
        include: {
          booking: true
        },
        orderBy: {
          scheduledAt: 'asc'
        },
        take: 50 // Process in batches
      });

      if (dueNotifications.length === 0) {
        return;
      }

      logger.info('Processing scheduled notifications', {
        count: dueNotifications.length
      });

      // Process each notification
      for (const scheduled of dueNotifications) {
        try {
          await this.sendScheduledNotification(scheduled);
        } catch (error: any) {
          logger.error('Failed to send scheduled notification', {
            scheduledId: scheduled.id,
            bookingId: scheduled.bookingId,
            error: getErrorMessage(error)
          });
        }
      }

    } catch (error: any) {
      logger.error('Failed to process scheduled notifications', {
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Send a scheduled notification
   */
  private async sendScheduledNotification(scheduled: any): Promise<void> {
    try {
      // Update attempt count
      await prisma.scheduledNotification.update({
        where: { id: scheduled.id },
        data: {
          attempts: scheduled.attempts + 1,
          lastAttemptAt: new Date()
        }
      });

      // Send the notification
      const result = await notificationService.sendNotification(
        scheduled.bookingId,
        scheduled.notificationType,
        scheduled.method,
        scheduled.customMessage,
        {
          ...scheduled.metadata,
          scheduledId: scheduled.id,
          ruleId: scheduled.ruleId,
          template: scheduled.template
        }
      );

      if (result.success) {
        // Mark as sent
        await prisma.scheduledNotification.update({
          where: { id: scheduled.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            notificationId: result.notificationId
          }
        });

        logger.info('Scheduled notification sent successfully', {
          scheduledId: scheduled.id,
          bookingId: scheduled.bookingId,
          type: scheduled.notificationType,
          notificationId: result.notificationId
        });
      } else {
        // Mark as failed or retry
        const shouldRetry = scheduled.attempts < 3;
        
        await prisma.scheduledNotification.update({
          where: { id: scheduled.id },
          data: {
            status: shouldRetry ? 'scheduled' : 'failed',
            scheduledAt: shouldRetry ? 
              new Date(Date.now() + (scheduled.attempts * 30 * 60 * 1000)) : // Exponential backoff
              scheduled.scheduledAt,
            errorMessage: result.error
          }
        });

        logger.error('Scheduled notification failed', {
          scheduledId: scheduled.id,
          bookingId: scheduled.bookingId,
          attempts: scheduled.attempts,
          willRetry: shouldRetry,
          error: result.error
        });
      }

    } catch (error: any) {
      logger.error('Error processing scheduled notification', {
        scheduledId: scheduled.id,
        error: getErrorMessage(error)
      });
    }
  }

  // Helper methods
  private async getActiveRulesForEvent(event: string): Promise<any[]> {
    // In production, this would query a database table
    // For now, return filtered default rules
    return this.defaultRules.filter(rule => 
      rule.isActive && rule.trigger.event === event
    );
  }

  private evaluateConditions(conditions: any[], booking: any, eventData: any): boolean {
    if (!conditions.length) return true;

    return conditions.every(condition => {
      const value = this.getFieldValue(condition.field, booking, eventData);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  private getFieldValue(field: string, booking: any, eventData: any): any {
    if (field.startsWith('booking.')) {
      const bookingField = field.substring(8);
      return booking[bookingField];
    }
    if (field.startsWith('event.')) {
      const eventField = field.substring(6);
      return eventData[eventField];
    }
    return null;
  }

  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals': return value === expectedValue;
      case 'not_equals': return value !== expectedValue;
      case 'contains': return String(value).includes(String(expectedValue));
      case 'in': return Array.isArray(expectedValue) && expectedValue.includes(value);
      case 'not_in': return Array.isArray(expectedValue) && !expectedValue.includes(value);
      case 'greater_than': return Number(value) > Number(expectedValue);
      case 'less_than': return Number(value) < Number(expectedValue);
      default: return false;
    }
  }

  private async checkFrequencyLimits(rule: any, bookingId: string): Promise<boolean> {
    if (!rule.frequency) return true;

    const sentCount = await prisma.scheduledNotification.count({
      where: {
        bookingId,
        ruleId: rule.id,
        status: 'sent'
      }
    });

    if (rule.frequency.maxCount && sentCount >= rule.frequency.maxCount) {
      return false;
    }

    if (rule.frequency.cooldown) {
      const lastSent = await prisma.scheduledNotification.findFirst({
        where: {
          bookingId,
          ruleId: rule.id,
          status: 'sent'
        },
        orderBy: { sentAt: 'desc' }
      });

      if (lastSent && lastSent.sentAt) {
        const cooldownMs = rule.frequency.cooldown * 60 * 1000;
        const timeSinceLastSent = Date.now() - lastSent.sentAt.getTime();
        if (timeSinceLastSent < cooldownMs) {
          return false;
        }
      }
    }

    return true;
  }

  private calculateScheduledTime(timing: any, triggeredAt: Date, appointmentTime: Date): Date {
    if (timing.delay) {
      return new Date(triggeredAt.getTime() + (timing.delay * 60 * 1000));
    }
    
    if (timing.before) {
      return new Date(appointmentTime.getTime() - (timing.before * 60 * 1000));
    }
    
    if (timing.at) {
      const [hours, minutes] = timing.at.split(':').map(Number);
      const scheduled = new Date(triggeredAt);
      scheduled.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduled <= triggeredAt) {
        scheduled.setDate(scheduled.getDate() + 1);
      }
      
      return scheduled;
    }
    
    return triggeredAt; // Send immediately
  }

  private async upsertSchedulingRule(rule: z.infer<typeof SchedulingRuleSchema>): Promise<void> {
    // In production, this would upsert to a database table
    // For now, we'll just validate the rule
    SchedulingRuleSchema.parse(rule);
    logger.debug('Scheduling rule validated', { ruleId: rule.id, ruleName: rule.name });
  }
}

// Singleton instance
export const automatedNotificationScheduler = new AutomatedNotificationScheduler();
