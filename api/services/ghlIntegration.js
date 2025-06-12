/**
 * GoHighLevel Integration Service
 * Houston Mobile Notary Pros API
 */

import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/ghl-integration.log' })
  ]
});

class GHLIntegration {
  constructor() {
    this.baseURL = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';
    this.apiKey = process.env.GHL_API_KEY;
    this.locationId = process.env.GHL_LOCATION_ID;
    
    if (!this.apiKey || !this.locationId) {
      logger.warn('GHL API key or location ID not configured');
    }

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('GHL API Request', {
          method: config.method,
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('GHL API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('GHL API Response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('GHL API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          error: error.response?.data || error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get contact information
   */
  async getContact(contactId) {
    try {
      const response = await this.client.get(`/contacts/${contactId}`);
      return response.data.contact;
    } catch (error) {
      logger.error('Failed to get contact', {
        contactId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update contact information
   */
  async updateContact(contactId, updateData) {
    try {
      const response = await this.client.put(`/contacts/${contactId}`, updateData);
      return response.data.contact;
    } catch (error) {
      logger.error('Failed to update contact', {
        contactId,
        updateData,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Add tag to contact
   */
  async addTag(contactId, tag) {
    try {
      const response = await this.client.post(`/contacts/${contactId}/tags`, {
        tags: [tag]
      });
      
      logger.info('Tag added to contact', {
        contactId,
        tag
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to add tag', {
        contactId,
        tag,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Remove tag from contact
   */
  async removeTag(contactId, tag) {
    try {
      const response = await this.client.delete(`/contacts/${contactId}/tags`, {
        data: { tags: [tag] }
      });
      
      logger.info('Tag removed from contact', {
        contactId,
        tag
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to remove tag', {
        contactId,
        tag,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update custom field
   */
  async updateCustomField(contactId, fieldKey, fieldValue) {
    try {
      const updateData = {
        customFields: {
          [fieldKey]: fieldValue
        }
      };

      const response = await this.client.put(`/contacts/${contactId}`, updateData);
      
      logger.info('Custom field updated', {
        contactId,
        fieldKey,
        fieldValue
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to update custom field', {
        contactId,
        fieldKey,
        fieldValue,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Trigger workflow for contact
   */
  async triggerWorkflow(contactId, workflowId) {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/trigger`, {
        contactId: contactId
      });
      
      logger.info('Workflow triggered', {
        contactId,
        workflowId
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to trigger workflow', {
        contactId,
        workflowId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send SMS to contact
   */
  async sendSMS(contactId, message, mediaUrl = null) {
    try {
      const smsData = {
        contactId,
        message,
        ...(mediaUrl && { mediaUrl })
      };

      const response = await this.client.post('/conversations/messages', smsData);
      
      logger.info('SMS sent', {
        contactId,
        messageLength: message.length,
        hasMedia: !!mediaUrl
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to send SMS', {
        contactId,
        message: message.substring(0, 50) + '...',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send email to contact
   */
  async sendEmail(contactId, subject, body, templateId = null) {
    try {
      const emailData = {
        contactId,
        subject,
        body,
        ...(templateId && { templateId })
      };

      const response = await this.client.post('/conversations/messages', emailData);
      
      logger.info('Email sent', {
        contactId,
        subject,
        bodyLength: body.length,
        templateId
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to send email', {
        contactId,
        subject,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create task for contact
   */
  async createTask(contactId, title, description, dueDate, priority = 'medium') {
    try {
      const taskData = {
        contactId,
        title,
        description,
        dueDate,
        priority,
        status: 'open'
      };

      const response = await this.client.post('/tasks', taskData);
      
      logger.info('Task created', {
        contactId,
        title,
        dueDate,
        priority
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create task', {
        contactId,
        title,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create appointment/calendar event
   */
  async createAppointment(contactId, title, startDateTime, endDateTime, description = '') {
    try {
      const appointmentData = {
        contactId,
        title,
        startDateTime,
        endDateTime,
        description,
        status: 'confirmed'
      };

      const response = await this.client.post('/appointments', appointmentData);
      
      logger.info('Appointment created', {
        contactId,
        title,
        startDateTime,
        endDateTime
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create appointment', {
        contactId,
        title,
        startDateTime,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Schedule workflow to run at specific time
   */
  async scheduleWorkflow(contactId, workflowId, scheduleDateTime) {
    try {
      const scheduleData = {
        contactId,
        workflowId,
        scheduleDateTime
      };

      const response = await this.client.post('/workflows/schedule', scheduleData);
      
      logger.info('Workflow scheduled', {
        contactId,
        workflowId,
        scheduleDateTime
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to schedule workflow', {
        contactId,
        workflowId,
        scheduleDateTime,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Sync booking data to GHL contact
   */
  async syncBookingToGHL(booking) {
    try {
      const contactId = booking.customer.ghlContactId;
      
      // Update custom fields with booking information
      const customFields = {
        booking_id: booking.bookingId,
        service_type: booking.service.name,
        appointment_date: booking.scheduling.scheduledDateTime.toISOString().split('T')[0],
        appointment_time: booking.scheduling.scheduledDateTime.toTimeString().split(' ')[0],
        appointment_address: booking.location.fullAddress,
        service_price: booking.service.price.toString(),
        payment_amount: booking.payment.amount.toString(),
        payment_status: booking.payment.status,
        payment_url: booking.payment.paymentUrl
      };

      await this.updateContact(contactId, { customFields });

      // Add appropriate tags
      const tags = ['status:booking_created'];
      
      if (booking.payment.status === 'pending') {
        tags.push('status:booking_pendingpayment');
      }
      
      if (booking.source.leadSource) {
        tags.push(`source:${booking.source.leadSource.toLowerCase()}`);
      }

      for (const tag of tags) {
        await this.addTag(contactId, tag);
      }

      // Create appointment in GHL calendar
      await this.createAppointment(
        contactId,
        `${booking.service.name} - ${booking.customer.fullName}`,
        booking.scheduling.scheduledDateTime,
        new Date(booking.scheduling.scheduledDateTime.getTime() + (booking.scheduling.duration * 60 * 1000)),
        `Service: ${booking.service.name}\nLocation: ${booking.location.fullAddress}\nAmount: $${booking.payment.amount}`
      );

      logger.info('Booking synced to GHL successfully', {
        bookingId: booking.bookingId,
        contactId,
        serviceName: booking.service.name
      });

      return { success: true, contactId };

    } catch (error) {
      logger.error('Failed to sync booking to GHL', {
        bookingId: booking.bookingId,
        contactId: booking.customer.ghlContactId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Evaluate contact for workflow qualification
   */
  async evaluateContactForWorkflows(contactId) {
    try {
      const contact = await this.getContact(contactId);
      
      // Check lead quality score
      const hasEmail = !!contact.email;
      const hasPhone = !!contact.phone;
      const hasAddress = !!(contact.address1 || contact.city);
      
      let qualificationScore = 0;
      if (hasEmail) qualificationScore += 30;
      if (hasPhone) qualificationScore += 30;
      if (hasAddress) qualificationScore += 20;
      if (contact.source) qualificationScore += 20;

      // Trigger appropriate workflows based on score
      if (qualificationScore >= 70) {
        await this.addTag(contactId, 'lead:qualified');
        await this.triggerWorkflow(contactId, 'smart-lead-qualification-and-booking');
      } else if (qualificationScore >= 50) {
        await this.addTag(contactId, 'lead:medium_qualified');
        await this.triggerWorkflow(contactId, 'lead-nurturing-sequence');
      } else {
        await this.addTag(contactId, 'lead:low_qualified');
        await this.triggerWorkflow(contactId, 'basic-lead-nurturing');
      }

      logger.info('Contact evaluated for workflows', {
        contactId,
        qualificationScore,
        hasEmail,
        hasPhone,
        hasAddress
      });

      return { qualificationScore, qualified: qualificationScore >= 70 };

    } catch (error) {
      logger.error('Failed to evaluate contact for workflows', {
        contactId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get contact list with filters
   */
  async getContacts(filters = {}) {
    try {
      const params = {
        locationId: this.locationId,
        ...filters
      };

      const response = await this.client.get('/contacts', { params });
      return response.data.contacts;
    } catch (error) {
      logger.error('Failed to get contacts', {
        filters,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Health check for GHL API
   */
  async healthCheck() {
    try {
      // Simple API call to check connectivity
      const response = await this.client.get('/locations/current');
      
      return {
        status: 'healthy',
        message: 'GHL API connection successful',
        locationId: this.locationId,
        apiKeyConfigured: !!this.apiKey
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'GHL API connection failed',
        error: error.message,
        locationId: this.locationId,
        apiKeyConfigured: !!this.apiKey
      };
    }
  }
}

// Create singleton instance
const ghlIntegration = new GHLIntegration();

export { ghlIntegration, GHLIntegration }; 