/**
 * GoHighLevel Webhook Handler
 * 
 * This API route handles all incoming webhooks from GoHighLevel.
 * It validates, processes, and routes events to the appropriate handlers.
 * 
 * Endpoint: /api/webhooks/ghl
 */

import { createWebhookHandler } from '../../../lib/ghl-webhook-utils';
import { handleContactCreate, handleContactUpdate } from '../../../lib/handlers/contact-handlers';
import { handleTagUpdate } from '../../../lib/handlers/tag-handlers';
import { handleOpportunityUpdate } from '../../../lib/handlers/opportunity-handlers';
import { handleAppointmentCreate, handleAppointmentStatusUpdate } from '../../../lib/handlers/appointment-handlers';

// Create webhook handler with custom event handlers
const webhookHandler = createWebhookHandler({
  validateSignature: process.env.NODE_ENV === 'production', // Only validate in production
  logEvents: true,
  handlers: {
    // Contact events
    ContactCreate: async (data) => {
      console.log('Processing contact creation:', data.contactId);
      await handleContactCreate(data);
    },
    
    ContactUpdate: async (data) => {
      console.log('Processing contact update:', data.contactId);
      await handleContactUpdate(data);
    },
    
    // Tag events
    ContactTagUpdate: async (data) => {
      console.log('Processing tag update for contact:', data.contactId);
      await handleTagUpdate(data);
    },
    
    // Opportunity events
    OpportunityStatusUpdate: async (data) => {
      console.log('Processing opportunity status update:', data.opportunityId);
      await handleOpportunityUpdate(data);
    },
    
    // Appointment events
    AppointmentCreate: async (data) => {
      console.log('Processing new appointment:', data.appointmentId);
      await handleAppointmentCreate(data);
    },
    
    AppointmentStatusUpdate: async (data) => {
      console.log('Processing appointment status change:', data.appointmentId);
      await handleAppointmentStatusUpdate(data);
    },
    
    // Custom field events
    ContactCustomFieldUpdate: async (data) => {
      console.log('Processing custom field update for contact:', data.contactId);
      
      // Extract the custom field values that were updated
      const customFields = data.customFields || {};
      
      // Process specific custom fields based on business logic
      if (customFields.cf_booking_appointment_datetime) {
        console.log('Booking datetime updated:', customFields.cf_booking_appointment_datetime);
      }
      
      if (customFields.cf_booking_service_type) {
        console.log('Service type updated:', customFields.cf_booking_service_type);
      }
    },
    
    // Default handler for any other events
    default: async (data) => {
      console.log('Received unhandled event type:', data.eventType);
    }
  }
});

export default webhookHandler;

// Increase the body size limit for webhook payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
