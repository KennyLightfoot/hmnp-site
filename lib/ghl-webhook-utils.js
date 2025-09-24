/**
 * GoHighLevel Webhook Utilities
 * Helper functions for handling and validating webhooks from GHL
 */

import crypto from 'crypto';

/**
 * Validates a webhook request from GoHighLevel
 * 
 * @param {Object} req - Next.js/Express request object
 * @returns {boolean} True if webhook is valid
 */
export function validateWebhook(req) {
  try {
    // Get the GoHighLevel signature from headers
    const signature = req.headers['x-ghl-signature'];
    
    // If no signature provided, return false
    if (!signature) {
      console.warn('No webhook signature provided');
      return false;
    }
    
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.GHL_WEBHOOK_SECRET;
    
    // If no secret configured, we can't validate
    if (!webhookSecret) {
      console.warn('No GHL_WEBHOOK_SECRET configured, cannot validate webhook');
      return true; // Return true to allow processing in development
    }
    
    // Get the raw body
    const rawBody = typeof req.body === 'string' 
      ? req.body 
      : JSON.stringify(req.body);
    
    // Create HMAC using webhook secret
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('hex');
    
    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('Error validating webhook:', error);
    return false;
  }
}

/**
 * Processes a webhook event from GoHighLevel
 * 
 * @param {Object} data - Webhook payload
 * @returns {Object} Processed event data
 */
export function processWebhookEvent(data) {
  // Extract the event type
  const eventType = data.event || 'unknown';
  
  // Basic validation
  if (!eventType || eventType === 'unknown') {
    throw new Error('Invalid webhook data: missing event type');
  }
  
  // Process different event types
  switch (eventType) {
    case 'ContactCreate':
    case 'ContactUpdate':
    case 'ContactDelete':
    case 'ContactMerge':
      return processContactEvent(data);
      
    case 'ContactTagUpdate':
    case 'TagCreate':
      return processTagEvent(data);
      
    case 'OpportunityCreate':
    case 'OpportunityStatusUpdate':
    case 'OpportunityUpdate':
    case 'OpportunityDelete':
      return processOpportunityEvent(data);
      
    case 'AppointmentCreate':
    case 'AppointmentUpdate':
    case 'AppointmentDelete':
    case 'AppointmentStatusUpdate':
      return processAppointmentEvent(data);
      
    case 'ContactCustomFieldUpdate':
    case 'CustomFieldCreate':
      return processCustomFieldEvent(data);
      
    case 'FormSubmit':
      return processFormEvent(data);
      
    case 'TaskCreate':
    case 'TaskUpdate':
    case 'TaskComplete':
      return processTaskEvent(data);
      
    case 'ConversationMessageCreate':
    case 'ConversationStatusUpdate':
      return processConversationEvent(data);
      
    default:
      console.log(`Unhandled event type: ${eventType}`);
      return { eventType, data };
  }
}

/**
 * Process Contact-related webhook events
 */
function processContactEvent(data) {
  const eventType = data.event;
  const contact = data.contact || {};
  
  return {
    eventType,
    contactId: contact.id,
    locationId: contact.locationId,
    contact: {
      id: contact.id,
      email: contact.email,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName,
      // Add other needed contact fields
    },
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Process Tag-related webhook events
 */
function processTagEvent(data) {
  const eventType = data.event;
  
  if (eventType === 'ContactTagUpdate') {
    return {
      eventType,
      contactId: data.contact?.id,
      locationId: data.contact?.locationId,
      tags: {
        added: data.added || [],
        removed: data.removed || []
      },
      meta: {
        timestamp: data.timestamp || new Date().toISOString(),
        source: 'ghl-webhook'
      }
    };
  }
  
  // TagCreate event
  return {
    eventType,
    tagId: data.tag?.id,
    tagName: data.tag?.name,
    locationId: data.tag?.locationId,
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Process Opportunity-related webhook events
 */
function processOpportunityEvent(data) {
  const eventType = data.event;
  const opportunity = data.opportunity || {};
  
  return {
    eventType,
    opportunityId: opportunity.id,
    locationId: opportunity.locationId,
    contactId: opportunity.contactId,
    pipelineId: opportunity.pipelineId,
    stageId: opportunity.stageId,
    stageName: opportunity.stageName,
    status: opportunity.status,
    title: opportunity.title,
    monetaryValue: opportunity.monetaryValue,
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Process Appointment-related webhook events
 */
function processAppointmentEvent(data) {
  const eventType = data.event;
  const appointment = data.appointment || {};
  
  return {
    eventType,
    appointmentId: appointment.id,
    locationId: appointment.locationId,
    contactId: appointment.contactId,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    title: appointment.title,
    status: appointment.status,
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Process CustomField-related webhook events
 */
function processCustomFieldEvent(data) {
  const eventType = data.event;
  
  if (eventType === 'ContactCustomFieldUpdate') {
    return {
      eventType,
      contactId: data.contact?.id,
      locationId: data.contact?.locationId,
      customFields: data.customFields || {},
      meta: {
        timestamp: data.timestamp || new Date().toISOString(),
        source: 'ghl-webhook'
      }
    };
  }
  
  // CustomFieldCreate event
  return {
    eventType,
    customFieldId: data.customField?.id,
    customFieldName: data.customField?.name,
    dataType: data.customField?.dataType,
    locationId: data.customField?.locationId,
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Process Form-related webhook events
 */
function processFormEvent(data) {
  const eventType = data.event;
  const form = data.form || {};
  const submission = data.submission || {};
  
  return {
    eventType,
    formId: form.id,
    formName: form.name,
    locationId: form.locationId,
    submissionId: submission.id,
    submissionData: submission.data || {},
    contactId: submission.contactId,
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Process Task-related webhook events
 */
function processTaskEvent(data) {
  const eventType = data.event;
  const task = data.task || {};
  
  return {
    eventType,
    taskId: task.id,
    locationId: task.locationId,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
    assigneeId: task.assigneeId,
    contactId: task.contactId,
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Process Conversation-related webhook events
 */
function processConversationEvent(data) {
  const eventType = data.event;
  const conversation = data.conversation || {};
  const message = data.message || {};
  
  return {
    eventType,
    conversationId: conversation.id,
    locationId: conversation.locationId,
    contactId: conversation.contactId,
    messageId: message.id,
    messageType: message.type,
    messageBody: message.body,
    sender: message.sender,
    meta: {
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'ghl-webhook'
    }
  };
}

/**
 * Log webhook event to database
 * 
 * @param {Object} eventData - Processed event data
 * @returns {Promise<Object>} Logged event
 */
export async function logWebhookEvent(eventData) {
  // This is a placeholder for your database logging implementation
  // You would implement this based on your database ORM (Prisma, etc.)
  try {
    console.log(`[GHL Webhook Log] ${eventData.eventType}`, eventData);
    
    // Example implementation with Prisma
    // return await prisma.webhookLog.create({
    //   data: {
    //     eventType: eventData.eventType,
    //     payload: eventData,
    //     timestamp: new Date()
    //   }
    // });
    
    return { logged: true, eventData };
  } catch (error) {
    console.error('Error logging webhook event:', error);
    return { logged: false, error: error.message };
  }
}

/**
 * Create a Next.js API route handler for GHL webhooks
 * 
 * @param {Object} options - Handler options
 * @returns {Function} Next.js API route handler
 */
export function createWebhookHandler(options = {}) {
  const {
    validateSignature = true,
    logEvents = true,
    handlers = {}
  } = options;
  
  return async function handler(req, res) {
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      // Validate webhook signature if enabled
      if (validateSignature) {
        const isValid = validateWebhook(req);
        if (!isValid) {
          console.warn('Invalid webhook signature');
          // Return 200 to avoid GHL retries, but don't process
          return res.status(200).json({ success: false, error: 'Invalid signature' });
        }
      }
      
      // Get webhook data
      const data = req.body;
      const eventType = data.event || 'unknown';
      
      console.log(`Received GHL webhook: ${eventType}`);
      
      // Process the webhook data
      const processedData = processWebhookEvent(data);
      
      // Log the event if enabled
      if (logEvents) {
        await logWebhookEvent(processedData);
      }
      
      // Call the appropriate event handler if exists
      if (handlers[eventType]) {
        await handlers[eventType](processedData, req, res);
      } else if (handlers.default) {
        await handlers.default(processedData, req, res);
      }
      
      // Always return 200 success to GHL to acknowledge receipt
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      // Still return 200 to GHL, handle errors internally
      return res.status(200).json({ success: true });
    }
  };
}
