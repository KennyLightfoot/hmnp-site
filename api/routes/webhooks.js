/**
 * Webhook Routes
 * Houston Mobile Notary Pros API
 */

import express from 'express';
import BookingService from '../models/Booking.js';
import { APIError, asyncHandler } from '../middleware/errorHandler.js';
import { ghlWebhookSecurity, stripeWebhookSecurity } from '../middleware/webhookSecurity.js';
import { webhookRequestLogger } from '../middleware/requestLogger.js';
import { ghlIntegration } from '../services/ghlIntegration.js';
import winston from 'winston';
import { getPrismaClient } from '../config/database.js';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/webhooks.log' })
  ]
});

const prisma = getPrismaClient();

// Apply webhook request logging to all routes
router.use(webhookRequestLogger);

/**
 * POST /webhooks/ghl
 * Handle GoHighLevel webhooks
 */
router.post('/ghl', ghlWebhookSecurity, asyncHandler(async (req, res) => {
  const { body } = req;
  const traceId = req.webhookSecurity?.traceId;

  try {
    logger.info('GHL webhook received', {
      traceId,
      type: body.type,
      contactId: body.contactId,
      eventData: body
    });

    // Handle different GHL webhook types
    switch (body.type) {
      case 'ContactCreate':
        await handleContactCreate(body, traceId);
        break;
      
      case 'ContactUpdate':
        await handleContactUpdate(body, traceId);
        break;
      
      case 'TagAdd':
        await handleTagAdd(body, traceId);
        break;
      
      case 'TagRemove':
        await handleTagRemove(body, traceId);
        break;
      
      case 'FormSubmit':
        await handleFormSubmit(body, traceId);
        break;
      
      case 'CustomFieldUpdate':
        await handleCustomFieldUpdate(body, traceId);
        break;
      
      case 'WorkflowComplete':
        await handleWorkflowComplete(body, traceId);
        break;
      
      default:
        logger.warn('Unknown GHL webhook type', {
          traceId,
          type: body.type,
          contactId: body.contactId
        });
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      traceId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('GHL webhook processing error', {
      traceId,
      error: error.message,
      stack: error.stack,
      webhookData: body
    });

    // Don't throw error - return 200 to prevent webhook retries
    res.json({
      success: false,
      error: 'Webhook processing failed',
      traceId,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * POST /webhooks/stripe
 * Handle Stripe webhooks for payment events
 */
router.post('/stripe', stripeWebhookSecurity, asyncHandler(async (req, res) => {
  const { body } = req;
  const traceId = req.webhookSecurity?.traceId;

  try {
    logger.info('Stripe webhook received', {
      traceId,
      type: body.type,
      objectId: body.data?.object?.id
    });

    // Handle different Stripe events
    switch (body.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(body.data.object, traceId);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(body.data.object, traceId);
        break;
      
      case 'payment_intent.processing':
        await handlePaymentProcessing(body.data.object, traceId);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(body.data.object, traceId);
        break;
      
      case 'charge.dispute.created':
        await handleChargeDispute(body.data.object, traceId);
        break;
      
      default:
        logger.info('Unhandled Stripe webhook type', {
          traceId,
          type: body.type
        });
    }

    res.json({
      success: true,
      message: 'Stripe webhook processed',
      traceId
    });

  } catch (error) {
    logger.error('Stripe webhook processing error', {
      traceId,
      error: error.message,
      stack: error.stack,
      webhookData: body
    });

    res.json({
      success: false,
      error: 'Webhook processing failed',
      traceId
    });
  }
}));

/**
 * GHL Webhook Handlers
 */

async function handleContactCreate(data, traceId) {
  const { contactId, firstName, lastName, email, phone, source } = data;

  logger.info('New contact created', {
    traceId,
    contactId,
    email,
    source
  });

  // Trigger lead nurturing workflow based on source
  if (source === 'facebook_ads' || source === 'google_ads') {
    await ghlIntegration.triggerWorkflow(contactId, 'facebook-google-ad-lead-automation');
  } else if (source === 'website_form') {
    await ghlIntegration.triggerWorkflow(contactId, 'lead-magnet-automation');
  } else {
    await ghlIntegration.triggerWorkflow(contactId, 'lead-nurturing-sequence');
  }
}

async function handleContactUpdate(data, traceId) {
  const { contactId, changes } = data;

  logger.info('Contact updated', {
    traceId,
    contactId,
    changes
  });

  // Handle specific field updates that might trigger workflows
  if (changes.email || changes.phone) {
    // Re-evaluate contact for workflow qualification
    await ghlIntegration.evaluateContactForWorkflows(contactId);
  }
}

async function handleTagAdd(data, traceId) {
  const { contactId, tag } = data;

  logger.info('Tag added to contact', {
    traceId,
    contactId,
    tag
  });

  // Handle workflow trigger tags
  const workflowTriggers = {
    'status:booking_pendingpayment': 'enhanced-payment-followup-automation',
    'status:payment_failed': 'failed-payment-recovery',
    'status:booking_abandoned': 'abandoned-booking-recovery',
    'status:reschedule_requested': 'rescheduling-automation',
    'status:no_show': 'no-show-recovery-system',
    'service:emergency': 'emergency-service-response',
    'service:completed': 'post-service-followup',
    'lead:new': 'lead-qualification-and-booking',
    'source:facebook_ads': 'facebook-google-ad-lead-automation',
    'source:google_ads': 'facebook-google-ad-lead-automation'
  };

  const workflowName = workflowTriggers[tag];
  if (workflowName) {
    await ghlIntegration.triggerWorkflow(contactId, workflowName);
  }

  // Update booking records if relevant
  if (tag.startsWith('status:')) {
    await updateBookingFromTag(contactId, tag, traceId);
  }
}

async function handleTagRemove(data, traceId) {
  const { contactId, tag } = data;

  logger.info('Tag removed from contact', {
    traceId,
    contactId,
    tag
  });

  // Handle status changes
  if (tag === 'status:booking_pendingpayment') {
    // Payment might have been completed
    await checkPaymentCompletionFromGHL(contactId, traceId);
  }
}

async function handleFormSubmit(data, traceId) {
  const { contactId, formId, formData } = data;

  logger.info('Form submitted', {
    traceId,
    contactId,
    formId
  });

  // Handle quote request forms
  if (formId === 'quote-request-form') {
    await ghlIntegration.addTag(contactId, 'status:quote_requested');
    await ghlIntegration.triggerWorkflow(contactId, 'quote-request-automation');
  }
  
  // Handle contact forms with booking intent
  if (formData.serviceType) {
    await ghlIntegration.addTag(contactId, 'lead:qualified');
    await ghlIntegration.triggerWorkflow(contactId, 'form-to-booking-automation');
  }
}

async function handleCustomFieldUpdate(data, traceId) {
  const { contactId, fieldName, fieldValue } = data;

  logger.info('Custom field updated', {
    traceId,
    contactId,
    fieldName,
    fieldValue
  });

  // Handle appointment date changes
  if (fieldName === 'appointment_date' && fieldValue) {
    await scheduleAppointmentReminders(contactId, fieldValue, traceId);
  }
}

async function handleWorkflowComplete(data, traceId) {
  const { contactId, workflowId, workflowName } = data;

  logger.info('Workflow completed', {
    traceId,
    contactId,
    workflowId,
    workflowName
  });

  // Track workflow completion for analytics
  await updateBookingWorkflowStatus(contactId, workflowName, 'completed', traceId);
}

/**
 * Stripe Webhook Handlers
 */

async function handlePaymentSuccess(paymentIntent, traceId) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    logger.warn('Payment success but no bookingId in metadata', {
      traceId,
      paymentIntentId: paymentIntent.id
    });
    return;
  }

  try {
    const booking = await findBooking({ bookingId });
    if (!booking) {
      logger.error('Booking not found for payment success', {
        traceId,
        bookingId,
        paymentIntentId: paymentIntent.id
      });
      return;
    }

    // Update booking payment status
    await updateBookingPaymentStatus(bookingId, {
      paymentStatus: 'completed',
      paymentCompletedAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
      status: 'confirmed',
    });

    // Update GHL contact
    await ghlIntegration.removeTag(booking.customer.ghlContactId, 'status:booking_pendingpayment');
    await ghlIntegration.addTag(booking.customer.ghlContactId, 'status:payment_completed');
    await ghlIntegration.addTag(booking.customer.ghlContactId, 'status:service_scheduled');

    // Trigger booking confirmation workflow
    await ghlIntegration.triggerWorkflow(booking.customer.ghlContactId, 'booking-confirmation-system');

    logger.info('Payment completed successfully', {
      traceId,
      bookingId,
      customerEmail: booking.customer.email,
      amount: paymentIntent.amount_received / 100
    });

  } catch (error) {
    logger.error('Error handling payment success', {
      traceId,
      error: error.message,
      bookingId,
      paymentIntentId: paymentIntent.id
    });
  }
}

async function handlePaymentFailed(paymentIntent, traceId) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    logger.warn('Payment failed but no bookingId in metadata', {
      traceId,
      paymentIntentId: paymentIntent.id
    });
    return;
  }

  try {
    const booking = await findBooking({ bookingId });
    if (!booking) {
      logger.error('Booking not found for payment failure', {
        traceId,
        bookingId
      });
      return;
    }

    // Update booking payment status
    await updateBookingPaymentStatus(bookingId, {
      paymentStatus: 'failed',
    });

    // Update GHL contact and trigger failed payment workflow
    await ghlIntegration.addTag(booking.customer.ghlContactId, 'status:payment_failed');
    await ghlIntegration.triggerWorkflow(booking.customer.ghlContactId, 'failed-payment-recovery');

    logger.info('Payment failed - triggered recovery workflow', {
      traceId,
      bookingId,
      customerEmail: booking.customer.email,
      failureReason: paymentIntent.last_payment_error?.message
    });

  } catch (error) {
    logger.error('Error handling payment failure', {
      traceId,
      error: error.message,
      bookingId
    });
  }
}

async function handlePaymentProcessing(paymentIntent, traceId) {
  logger.info('Payment processing', {
    traceId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100
  });
}

async function handlePaymentCanceled(paymentIntent, traceId) {
  const bookingId = paymentIntent.metadata?.bookingId;

  logger.info('Payment canceled', {
    traceId,
    bookingId,
    paymentIntentId: paymentIntent.id
  });

  if (bookingId) {
    // Trigger abandoned booking recovery
    const booking = await findBooking({ bookingId });
    if (booking) {
      await ghlIntegration.addTag(booking.customer.ghlContactId, 'status:booking_abandoned');
    }
  }
}

async function handleChargeDispute(charge, traceId) {
  logger.warn('Charge dispute created', {
    traceId,
    chargeId: charge.id,
    amount: charge.amount / 100,
    reason: charge.dispute_reason
  });

  // Handle dispute - potentially notify admin
}

/**
 * Helper Functions
 */

async function findBooking(filter) {
  if (filter.bookingId) {
    return await prisma.apiBooking.findFirst({ where: { bookingId: filter.bookingId } });
  }
  if (filter['customer.ghlContactId']) {
    return await prisma.apiBooking.findFirst({ where: { ghlContactId: filter['customer.ghlContactId'] } });
  }
  return null;
}

async function updateBookingPaymentStatus(bookingId, data) {
  const booking = await prisma.apiBooking.findFirst({ where: { bookingId } });
  if (!booking) return null;
  return prisma.apiBooking.update({ where: { id: booking.id }, data });
}

async function updateBookingFromTag(contactId, tag, traceId) {
  try {
    const booking = await findBooking({ 'customer.ghlContactId': contactId });
    if (!booking) return;

    const statusMap = {
      'status:payment_completed': 'completed',
      'status:payment_failed': 'failed',
      'status:payment_expired': 'expired',
      'status:booking_abandoned': 'abandoned'
    };

    const newStatus = statusMap[tag];
    if (newStatus && booking.payment.status !== newStatus) {
      await updateBookingPaymentStatus(booking.bookingId, {
        paymentStatus: newStatus,
      });

      logger.info('Booking status updated from tag', {
        traceId,
        bookingId: booking.bookingId,
        oldStatus: booking.payment.status,
        newStatus,
        tag
      });
    }
  } catch (error) {
    logger.error('Error updating booking from tag', {
      traceId,
      error: error.message,
      contactId,
      tag
    });
  }
}

async function checkPaymentCompletionFromGHL(contactId, traceId) {
  // Check if payment was completed in GHL
  const contact = await ghlIntegration.getContact(contactId);
  if (contact.tags.includes('status:payment_completed')) {
    await updateBookingFromTag(contactId, 'status:payment_completed', traceId);
  }
}

async function scheduleAppointmentReminders(contactId, appointmentDate, traceId) {
  // Schedule reminder workflows based on appointment date
  const reminderDate24h = new Date(appointmentDate);
  reminderDate24h.setHours(reminderDate24h.getHours() - 24);

  const reminderDate2h = new Date(appointmentDate);
  reminderDate2h.setHours(reminderDate2h.getHours() - 2);

  // Use GHL scheduling API to set up reminders
  await ghlIntegration.scheduleWorkflow(contactId, 'automated-appointment-reminders-24h', reminderDate24h);
  await ghlIntegration.scheduleWorkflow(contactId, 'automated-appointment-reminders-2h', reminderDate2h);

  logger.info('Appointment reminders scheduled', {
    traceId,
    contactId,
    appointmentDate,
    reminder24h: reminderDate24h,
    reminder2h: reminderDate2h
  });
}

async function updateBookingWorkflowStatus(contactId, workflowName, status, traceId) {
  try {
    const booking = await findBooking({ 'customer.ghlContactId': contactId });
    if (!booking) return;

    const workflow = booking.automation.workflowsTriggered.find(w => w.workflowName === workflowName);
    if (workflow) {
      workflow.status = status;
    } else {
      booking.automation.workflowsTriggered.push({
        workflowName,
        status
      });
    }

    await updateBookingPaymentStatus(booking.bookingId, {
      paymentStatus: status,
    });

    logger.info('Booking workflow status updated', {
      traceId,
      bookingId: booking.bookingId,
      workflowName,
      status
    });
  } catch (error) {
    logger.error('Error updating booking workflow status', {
      traceId,
      error: error.message,
      contactId,
      workflowName
    });
  }
}

export default router; 