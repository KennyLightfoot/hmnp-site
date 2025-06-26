/**
 * Automated Follow-up Sequences
 * Manages automated follow-ups for different booking scenarios
 */

import { prisma } from './prisma';
import { BookingStatus } from '@prisma/client';
import { logger, logBookingEvent } from './logger';
import * as ghl from './ghl/api';
import { updateBookingStatus } from './booking-sync';

export interface FollowUpRule {
  id: string;
  name: string;
  trigger: 'STATUS_CHANGE' | 'TIME_BASED' | 'PAYMENT_FAILED' | 'NO_SHOW';
  conditions: {
    status?: BookingStatus[];
    hoursAfter?: number;
    hoursBefore?: number;
    paymentStatus?: string[];
  };
  actions: FollowUpAction[];
  isActive: boolean;
}

export interface FollowUpAction {
  type: 'EMAIL' | 'SMS' | 'GHL_WORKFLOW' | 'STATUS_UPDATE' | 'TAG_UPDATE' | 'NOTIFICATION';
  delay?: number; // Minutes to wait before executing
  data: any;
}

export interface ScheduledFollowUp {
  id: string;
  bookingId: string;
  ruleId: string;
  action: FollowUpAction;
  scheduledFor: Date;
  attempts: number;
  completed: boolean;
  error?: string;
  createdAt: Date;
}

// In-memory storage for follow-ups (in production, use database or Redis)
const scheduledFollowUps: ScheduledFollowUp[] = [];
const followUpRules: FollowUpRule[] = [
  // Payment reminder sequence
  {
    id: 'payment_reminder_1h',
    name: 'Payment Reminder - 1 Hour',
    trigger: 'TIME_BASED',
    conditions: {
      status: [BookingStatus.PAYMENT_PENDING],
      hoursAfter: 1
    },
    actions: [
      {
        type: 'GHL_WORKFLOW',
        data: {
          workflowId: process.env.GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID,
          trigger: 'payment_reminder_1h'
        }
      }
    ],
    isActive: true
  },
  {
    id: 'payment_reminder_24h',
    name: 'Payment Reminder - 24 Hours',
    trigger: 'TIME_BASED',
    conditions: {
      status: [BookingStatus.PAYMENT_PENDING],
      hoursAfter: 24
    },
    actions: [
      {
        type: 'GHL_WORKFLOW',
        data: {
          workflowId: process.env.GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID,
          trigger: 'payment_reminder_24h'
        }
      },
      {
        type: 'TAG_UPDATE',
        data: {
          add: ['follow_up:payment_24h_sent'],
          remove: []
        }
      }
    ],
    isActive: true
  },
  {
    id: 'payment_reminder_48h',
    name: 'Payment Reminder - 48 Hours (Final)',
    trigger: 'TIME_BASED',
    conditions: {
      status: [BookingStatus.PAYMENT_PENDING],
      hoursAfter: 48
    },
    actions: [
      {
        type: 'GHL_WORKFLOW',
        data: {
          workflowId: process.env.GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID,
          trigger: 'payment_reminder_final'
        }
      },
      {
        type: 'TAG_UPDATE',
        data: {
          add: ['follow_up:payment_final_sent', 'risk:payment_overdue'],
          remove: []
        }
      }
    ],
    isActive: true
  },
  
  // Appointment reminders
  {
    id: 'appointment_reminder_24h',
    name: 'Appointment Reminder - 24 Hours',
    trigger: 'TIME_BASED',
    conditions: {
      status: [BookingStatus.CONFIRMED],
      hoursBefore: 24
    },
    actions: [
      {
        type: 'GHL_WORKFLOW',
        data: {
          workflowId: process.env.GHL_24HR_REMINDER_WORKFLOW_ID,
          trigger: 'appointment_reminder_24h'
        }
      }
    ],
    isActive: true
  },
  {
    id: 'appointment_reminder_2h',
    name: 'Appointment Reminder - 2 Hours',
    trigger: 'TIME_BASED',
    conditions: {
      status: [BookingStatus.CONFIRMED],
      hoursBefore: 2
    },
    actions: [
      {
        type: 'GHL_WORKFLOW',
        data: {
          workflowId: process.env.GHL_24HR_REMINDER_WORKFLOW_ID,
          trigger: 'appointment_reminder_2h'
        }
      }
    ],
    isActive: true
  },

  // Post-service follow-up
  {
    id: 'post_service_review',
    name: 'Post-Service Review Request',
    trigger: 'STATUS_CHANGE',
    conditions: {
      status: [BookingStatus.COMPLETED]
    },
    actions: [
      {
        type: 'GHL_WORKFLOW',
        delay: 60, // 1 hour after completion
        data: {
          workflowId: process.env.GHL_POST_SERVICE_WORKFLOW_ID,
          trigger: 'post_service_review'
        }
      },
      {
        type: 'TAG_UPDATE',
        delay: 5,
        data: {
          add: ['status:service_completed', 'follow_up:review_requested'],
          remove: ['status:booking_confirmed', 'status:booking_inprogress']
        }
      }
    ],
    isActive: true
  },

  // No-show follow-up
  {
    id: 'no_show_recovery',
    name: 'No-Show Recovery',
    trigger: 'STATUS_CHANGE',
    conditions: {
      status: [BookingStatus.NO_SHOW]
    },
    actions: [
      {
        type: 'GHL_WORKFLOW',
        delay: 30, // 30 minutes after no-show
        data: {
          workflowId: process.env.GHL_NO_SHOW_RECOVERY_WORKFLOW_ID,
          trigger: 'no_show_recovery'
        }
      },
      {
        type: 'TAG_UPDATE',
        data: {
          add: ['status:no_show', 'follow_up:recovery_initiated'],
          remove: ['status:booking_confirmed']
        }
      }
    ],
    isActive: true
  }
];

/**
 * Trigger follow-ups based on booking status change
 */
export async function triggerStatusChangeFollowUps(
  bookingId: string,
  newStatus: BookingStatus,
  previousStatus?: BookingStatus
): Promise<void> {
  const applicableRules = followUpRules.filter(rule => 
    rule.trigger === 'STATUS_CHANGE' && 
    rule.isActive &&
    rule.conditions.status?.includes(newStatus)
  );

  for (const rule of applicableRules) {
    await scheduleFollowUpActions(bookingId, rule);
  }

  logger.info('Status change follow-ups triggered', 'FOLLOW_UP', {
    bookingId,
    newStatus,
    previousStatus,
    rulesTriggered: applicableRules.length
  });
}

/**
 * Check for time-based follow-ups
 */
export async function checkTimeBasedFollowUps(): Promise<void> {
  const now = new Date();
  
  // Get bookings that might need follow-ups
  const bookings = await prisma.booking.findMany({
    where: {
      status: {
        in: [BookingStatus.PAYMENT_PENDING, BookingStatus.CONFIRMED]
      },
      ghlContactId: { not: null }
    },
    include: {
      service: true,
      signer: true
    }
  });

  for (const booking of bookings) {
    const applicableRules = followUpRules.filter(rule => 
      rule.trigger === 'TIME_BASED' && 
      rule.isActive &&
      rule.conditions.status?.includes(booking.status)
    );

    for (const rule of applicableRules) {
      const shouldTrigger = await checkTimeBasedConditions(booking, rule, now);
      
      if (shouldTrigger) {
        // Check if we already scheduled this follow-up
        const alreadyScheduled = scheduledFollowUps.some(followUp => 
          followUp.bookingId === booking.id && 
          followUp.ruleId === rule.id &&
          !followUp.completed
        );

        if (!alreadyScheduled) {
          await scheduleFollowUpActions(booking.id, rule);
          
          logger.info('Time-based follow-up scheduled', 'FOLLOW_UP', {
            bookingId: booking.id,
            ruleId: rule.id,
            ruleName: rule.name
          });
        }
      }
    }
  }
}

/**
 * Check if time-based conditions are met
 */
async function checkTimeBasedConditions(
  booking: any,
  rule: FollowUpRule,
  now: Date
): Promise<boolean> {
  const { hoursAfter, hoursBefore } = rule.conditions;

  if (hoursAfter) {
    const hoursFromCreation = (now.getTime() - booking.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursFromCreation >= hoursAfter;
  }

      if (hoursBefore && booking.scheduledDateTime) {
      const hoursUntilAppointment = (booking.scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilAppointment <= hoursBefore && hoursUntilAppointment > 0;
  }

  return false;
}

/**
 * Schedule follow-up actions for a booking
 */
async function scheduleFollowUpActions(bookingId: string, rule: FollowUpRule): Promise<void> {
  for (const action of rule.actions) {
    const scheduledFor = new Date(Date.now() + (action.delay || 0) * 60 * 1000);
    
    const followUp: ScheduledFollowUp = {
      id: `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId,
      ruleId: rule.id,
      action,
      scheduledFor,
      attempts: 0,
      completed: false,
      createdAt: new Date()
    };

    scheduledFollowUps.push(followUp);
  }
}

/**
 * Process scheduled follow-ups
 */
export async function processScheduledFollowUps(): Promise<void> {
  const now = new Date();
  const readyFollowUps = scheduledFollowUps.filter(followUp => 
    followUp.scheduledFor <= now && 
    !followUp.completed && 
    followUp.attempts < 3
  );

  if (readyFollowUps.length === 0) {
    return;
  }

  logger.info(`Processing ${readyFollowUps.length} scheduled follow-ups`, 'FOLLOW_UP');

  for (const followUp of readyFollowUps) {
    try {
      followUp.attempts++;
      
      await executeFollowUpAction(followUp);
      
      followUp.completed = true;
      
      logger.info(`Follow-up completed: ${followUp.id}`, 'FOLLOW_UP', {
        bookingId: followUp.bookingId,
        actionType: followUp.action.type
      });

    } catch (error) {
      followUp.error = (error as Error).message;
      
      logger.error(`Follow-up failed: ${followUp.id}`, 'FOLLOW_UP', error as Error, {
        bookingId: followUp.bookingId,
        actionType: followUp.action.type,
        attempts: followUp.attempts
      });

      if (followUp.attempts >= 3) {
        followUp.completed = true; // Mark as completed to stop retrying
      }
    }
  }
}

/**
 * Execute a follow-up action
 */
async function executeFollowUpAction(followUp: ScheduledFollowUp): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: followUp.bookingId },
    include: {
      service: true,
      signer: true
    }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  switch (followUp.action.type) {
    case 'GHL_WORKFLOW':
      await triggerGHLWorkflow(booking, followUp.action.data);
      break;
      
    case 'TAG_UPDATE':
      await updateGHLTags(booking, followUp.action.data);
      break;
      
    case 'STATUS_UPDATE':
      await updateBookingStatus(
        booking.id, 
        followUp.action.data.status, 
        followUp.action.data.reason
      );
      break;
      
    case 'NOTIFICATION':
      await sendNotification(booking, followUp.action.data);
      break;
      
    default:
      throw new Error(`Unknown follow-up action type: ${followUp.action.type}`);
  }
}

/**
 * Trigger GHL workflow
 */
async function triggerGHLWorkflow(booking: any, data: any): Promise<void> {
  if (!booking.ghlContactId) {
    throw new Error('No GHL contact ID available');
  }

  // Add custom fields to trigger workflow
  const customFields = {
    cf_follow_up_trigger: data.trigger,
    cf_follow_up_timestamp: new Date().toISOString(),
    cf_booking_id: booking.id
  };

  await ghl.updateContactCustomFields(booking.ghlContactId, customFields);

  // Add trigger tag if specified
  if (data.trigger) {
    await ghl.addTagsToContact(booking.ghlContactId, [`trigger:${data.trigger}`]);
  }

  logger.info('GHL workflow triggered', 'FOLLOW_UP', {
    bookingId: booking.id,
    contactId: booking.ghlContactId,
    trigger: data.trigger
  });
}

/**
 * Update GHL tags
 */
async function updateGHLTags(booking: any, data: any): Promise<void> {
  if (!booking.ghlContactId) {
    throw new Error('No GHL contact ID available');
  }

  if (data.add?.length > 0) {
    await ghl.addTagsToContact(booking.ghlContactId, data.add);
  }

  if (data.remove?.length > 0) {
    await ghl.removeTagsFromContact(booking.ghlContactId, data.remove);
  }

  logger.info('GHL tags updated', 'FOLLOW_UP', {
    bookingId: booking.id,
    contactId: booking.ghlContactId,
    added: data.add,
    removed: data.remove
  });
}

/**
 * Send notification
 */
async function sendNotification(booking: any, data: any): Promise<void> {
  // Implementation depends on notification system
  logger.info('Notification sent', 'FOLLOW_UP', {
    bookingId: booking.id,
    type: data.type,
    recipient: data.recipient
  });
}

/**
 * Get follow-up status for a booking
 */
export function getFollowUpStatus(bookingId: string): {
  scheduled: number;
  completed: number;
  failed: number;
  upcoming: ScheduledFollowUp[];
} {
  const bookingFollowUps = scheduledFollowUps.filter(f => f.bookingId === bookingId);
  
  return {
    scheduled: bookingFollowUps.length,
    completed: bookingFollowUps.filter(f => f.completed && !f.error).length,
    failed: bookingFollowUps.filter(f => f.error).length,
    upcoming: bookingFollowUps.filter(f => !f.completed && !f.error)
  };
}

// Auto-process follow-ups every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(processScheduledFollowUps, 2 * 60 * 1000);
  setInterval(checkTimeBasedFollowUps, 5 * 60 * 1000); // Check every 5 minutes
} 