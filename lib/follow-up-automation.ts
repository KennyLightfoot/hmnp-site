/**
 * Automated Follow-up Sequences
 * Manages automated follow-ups for different booking scenarios
 */

import { prisma } from './prisma';
import { BookingStatus } from '@prisma/client';
import { logger, logBookingEvent } from './logger';
import * as ghl from './ghl/api';
import { addContactToWorkflow } from './ghl/management';
import { updateBookingStatus } from './integration-example';
import { sendGHLSMS } from '@/lib/ghl-messaging';
import { sendSms } from './sms';
import { buildBookingLinks } from './ghl/automation-service';

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
  type: 'GHL_WORKFLOW' | 'STATUS_UPDATE' | 'TAG_UPDATE' | 'NOTIFICATION' | 'GHL_SMS';
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

type SmsTemplate =
  | 'DEPOSIT_1H'
  | 'DEPOSIT_24H'
  | 'DEPOSIT_48H'
  | 'APPOINTMENT_24H'
  | 'APPOINTMENT_2H'
  | 'POST_SERVICE_REVIEW';

const SMS_OPTOUT_SUFFIX = ' Reply STOP to opt out.';

function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/[^0-9+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

function decimalToNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === 'object') {
    if (typeof value.toNumber === 'function') {
      return value.toNumber();
    }
    if ('value' in value) {
      return decimalToNumber((value as any).value);
    }
  }
  return null;
}

function getFirstName(name?: string | null): string {
  if (!name) return 'there';
  const parts = name.trim().split(/\s+/);
  return parts[0] ?? 'there';
}

function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return null;
  }
}

function formatTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return null;
  }
}

function getDepositAmount(booking: any): number | null {
  const explicit = decimalToNumber(booking?.depositAmount);
  if (explicit && explicit > 0) return explicit;
  const serviceDeposit = decimalToNumber(booking?.service?.depositAmount);
  if (serviceDeposit && serviceDeposit > 0) return serviceDeposit;
  return booking?.service?.requiresDeposit ? 50 : null;
}

async function ensureBookingContact(booking: any): Promise<{ contactId: string | null; phone: string | null }> {
  if (booking?.ghlContactId) {
    return { contactId: booking.ghlContactId, phone: null };
  }
  const email = booking?.customerEmail;
  if (!email) {
    return { contactId: null, phone: null };
  }

  try {
    const existing = await ghl.findContactByEmail(email);
    const contactId = (existing?.id || existing?.contact?.id) as string | undefined;
    const contactPhone = (existing?.phone || (existing as any)?.phoneNumber || (existing as any)?.phone_number) as string | undefined;

    if (contactId) {
      try {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { ghlContactId: contactId },
        });
      } catch (error) {
        logger.warn('Failed to persist ghlContactId on booking', 'FOLLOW_UP', {
          bookingId: booking.id,
          error: (error as Error).message,
        });
      }
    }

    return {
      contactId: contactId || null,
      phone: contactPhone ? normalizePhone(contactPhone) : null,
    };
  } catch (error) {
    logger.warn('ensureBookingContact lookup failed', 'FOLLOW_UP', error as Error, {
      bookingId: booking?.id,
    });
    return { contactId: null, phone: null };
  }
}

function renderSmsTemplate(template: SmsTemplate, booking: any): string | null {
  const links = buildBookingLinks(booking);
  const firstName = getFirstName(booking?.customerName);
  const serviceName = booking?.service?.name || 'your notary appointment';
  const scheduledAt = booking?.scheduledDateTime ? new Date(booking.scheduledDateTime) : null;
  const dateLabel = formatDate(scheduledAt);
  const timeLabel = formatTime(scheduledAt);
  const depositAmount = getDepositAmount(booking);
  const depositDisplay = depositAmount ? `$${depositAmount.toFixed(2)}` : '$100';

  switch (template) {
    case 'DEPOSIT_1H': {
      const timing = dateLabel && timeLabel ? ` on ${dateLabel} at ${timeLabel}` : '';
      return `Hi ${firstName}! Thanks for booking ${serviceName}${timing}. Please complete your ${depositDisplay} deposit to lock it in: ${links.paymentLink}.${SMS_OPTOUT_SUFFIX}`;
    }
    case 'DEPOSIT_24H': {
      const timing = dateLabel ? ` for ${dateLabel}${timeLabel ? ` at ${timeLabel}` : ''}` : '';
      return `Reminder: we still need your ${depositDisplay} deposit${timing}. Pay now to keep your notary priority: ${links.paymentLink}.${SMS_OPTOUT_SUFFIX}`;
    }
    case 'DEPOSIT_48H': {
      const timing = dateLabel ? `${dateLabel}${timeLabel ? ` at ${timeLabel}` : ''}` : 'your appointment';
      return `Final notice: deposit is required to keep ${timing}. Complete now: ${links.paymentLink} or request a new time: ${links.rescheduleLink}.${SMS_OPTOUT_SUFFIX}`;
    }
    case 'APPOINTMENT_24H': {
      const when = dateLabel && timeLabel ? `${dateLabel} at ${timeLabel}` : 'your scheduled time';
      return `Hi ${firstName}, we’ll see you ${when} for ${serviceName}. Need to adjust? Reschedule: ${links.rescheduleLink}. Cancel: ${links.cancelLink}.${SMS_OPTOUT_SUFFIX}`;
    }
    case 'APPOINTMENT_2H': {
      const when = timeLabel ? timeLabel : 'later today';
      return `Today’s reminder: ${serviceName} at ${when}. Have IDs ready. Last-minute change? ${links.rescheduleLink}.${SMS_OPTOUT_SUFFIX}`;
    }
    case 'POST_SERVICE_REVIEW': {
      return `Hi ${firstName}, thanks for choosing HMNP! We’d love your quick review: ${links.reviewLink}.${SMS_OPTOUT_SUFFIX}`;
    }
    default:
      return null;
  }
}

async function sendBookingSms(booking: any, template: SmsTemplate): Promise<void> {
  const message = renderSmsTemplate(template, booking);
  if (!message) return;

  const { contactId, phone } = await ensureBookingContact(booking);
  if (contactId) {
    const response = await sendGHLSMS(contactId, message);
    if (response.success) {
      logger.info('GHL SMS sent', 'FOLLOW_UP', {
        bookingId: booking.id,
        template,
        contactId,
      });
      return;
    }
    logger.warn('GHL SMS failed, attempting fallback', 'FOLLOW_UP', {
      bookingId: booking.id,
      template,
      contactId,
      error: response.error,
    });
  }

  const fallbackPhone =
    normalizePhone(phone || booking?.customerPhone) ||
    normalizePhone(booking?.User_Booking_signerIdToUser?.phone);

  if (!fallbackPhone) {
    throw new Error('No contact phone available for SMS delivery');
  }

  const result = await sendSms({ to: fallbackPhone, body: message });
  if (!result.success) {
    throw new Error(result.error || 'Fallback SMS send failed');
  }

  logger.info('Fallback SMS sent', 'FOLLOW_UP', {
    bookingId: booking.id,
    template,
    phone: fallbackPhone,
  });
}
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
        type: 'GHL_SMS',
        data: { template: 'DEPOSIT_1H' }
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
        type: 'GHL_SMS',
        data: { template: 'DEPOSIT_24H' }
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
        type: 'GHL_SMS',
        data: { template: 'DEPOSIT_48H' }
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
        type: 'GHL_SMS',
        data: { template: 'APPOINTMENT_24H' }
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
        type: 'GHL_SMS',
        data: { template: 'APPOINTMENT_2H' }
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
        type: 'GHL_SMS',
        delay: 60,
        data: { template: 'POST_SERVICE_REVIEW' }
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
      User_Booking_signerIdToUser: true
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
      User_Booking_signerIdToUser: true
    }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  switch (followUp.action.type) {
    case 'GHL_WORKFLOW':
      await triggerGHLWorkflow(booking, followUp.action.data);
      break;

    case 'GHL_SMS': {
      const template = followUp.action.data?.template as SmsTemplate | undefined;
      if (!template) {
        throw new Error('Missing SMS template for follow-up action');
      }
      await sendBookingSms(booking, template);
      break;
    }
      
    case 'TAG_UPDATE':
      await updateGHLTags(booking, followUp.action.data);
      break;
      
    case 'STATUS_UPDATE':
      await updateBookingStatus(
        booking.id, 
        followUp.action.data.status
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

  // If a specific workflowId is provided, add contact directly to that workflow
  if (data.workflowId) {
    try {
      await addContactToWorkflow(booking.ghlContactId, data.workflowId);
    } catch (err) {
      logger.warn('Failed to add contact to specified GHL workflow', 'FOLLOW_UP', {
        bookingId: booking.id,
        contactId: booking.ghlContactId,
        workflowId: data.workflowId,
        error: err instanceof Error ? err.message : String(err)
      });
    }
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