/**
 * Booking Routes - Prisma/PostgreSQL Implementation
 * Houston Mobile Notary Pros GHL Integration
 */

import express from 'express';
import { body, query, validationResult } from 'express-validator';
import BookingModel from '../models/Booking.js';

const router = express.Router();

/**
 * Validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/bookings/pending-payments
 * Get pending payments with intelligence data
 */
router.get('/pending-payments', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('contactId').optional().isString().trim(),
  query('includeExpired').optional().isBoolean(),
  query('urgencyLevel').optional().isIn(['new', 'medium', 'high', 'critical']),
  handleValidationErrors
], async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 50,
      contactId: req.query.contactId || null,
      includeExpired: req.query.includeExpired === 'true',
      urgencyLevel: req.query.urgencyLevel || null
    };

    const result = await BookingModel.getPendingPayments(options);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Add metadata to response
    const response = {
      ...result,
      metadata: {
        query: options,
        timestamp: new Date().toISOString(),
        endpoint: '/api/bookings/pending-payments'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error getting pending payments:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve pending payments'
    });
  }
});

/**
 * POST /api/bookings/sync
 * Create new booking from GHL workflow
 */
router.post('/sync', [
  body('contactId').notEmpty().withMessage('Contact ID is required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('customerPhone').notEmpty().withMessage('Phone number is required'),
  body('scheduledDateTime').isISO8601().withMessage('Valid scheduled date/time is required'),
  body('serviceName').optional().isString().trim(),
  body('servicePrice').optional().isFloat({ min: 0 }),
  body('addressStreet').optional().isString().trim(),
  body('addressCity').optional().isString().trim(),
  body('addressState').optional().isString().trim(),
  body('addressZip').optional().isString().trim(),
  body('notes').optional().isString().trim(),
  body('leadSource').optional().isString().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const bookingData = {
      contactId: req.body.contactId,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerPhone: req.body.customerPhone,
      serviceName: req.body.serviceName || 'Standard Mobile Notary',
      serviceDescription: req.body.serviceDescription,
      servicePrice: req.body.servicePrice || 85,
      paymentAmount: req.body.paymentAmount || req.body.servicePrice || 85,
      scheduledDateTime: req.body.scheduledDateTime,
      duration: req.body.duration || 30,
      timezone: req.body.timezone || 'America/Chicago',
      locationType: req.body.locationType || 'CLIENT_SPECIFIED_ADDRESS',
      addressStreet: req.body.addressStreet,
      addressCity: req.body.addressCity || 'Houston',
      addressState: req.body.addressState || 'TX',
      addressZip: req.body.addressZip,
      addressFormatted: req.body.addressFormatted,
      locationNotes: req.body.locationNotes,
      paymentUrl: req.body.paymentUrl,
      paymentIntentId: req.body.paymentIntentId,
      leadSource: req.body.leadSource || 'Unknown',
      campaignName: req.body.campaignName,
      referralCode: req.body.referralCode,
      workflowId: req.body.workflowId,
      triggerSource: req.body.triggerSource,
      notes: req.body.notes,
      internalNotes: req.body.internalNotes,
      createdBy: req.body.createdBy || 'ghl_workflow'
    };

    const result = await BookingModel.createBooking(bookingData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Success response for GHL integration
    res.status(201).json({
      ...result,
      message: 'Booking created successfully',
      metadata: {
        endpoint: '/api/bookings/sync',
        timestamp: new Date().toISOString(),
        source: 'ghl_workflow'
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create booking'
    });
  }
});

/**
 * PATCH /api/bookings/pending-payments
 * Update payment action status
 */
router.patch('/pending-payments', [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('action').isIn(['send_reminder', 'mark_contacted', 'mark_expired', 'payment_completed'])
    .withMessage('Valid action is required'),
  body('reminderType').optional().isIn(['email', 'sms', 'call']),
  body('notes').optional().isString().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { bookingId, action, reminderType, notes } = req.body;

    const actionData = {
      action,
      reminderType,
      notes: notes || `Action '${action}' triggered via API`
    };

    const result = await BookingModel.updatePaymentAction(bookingId, actionData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      ...result,
      metadata: {
        endpoint: '/api/bookings/pending-payments',
        timestamp: new Date().toISOString(),
        action: action
      }
    });

  } catch (error) {
    console.error('Error updating payment action:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update payment action'
    });
  }
});

/**
 * GET /api/bookings/:bookingId
 * Get specific booking details
 */
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await BookingModel.getBookingById(bookingId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      ...result,
      metadata: {
        endpoint: `/api/bookings/${bookingId}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve booking'
    });
  }
});

/**
 * GET /api/bookings/business-intelligence
 * Get business intelligence dashboard data
 */
router.get('/business-intelligence', [
  query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90'),
  handleValidationErrors
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const result = await BookingModel.getBusinessIntelligence(days);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      ...result,
      metadata: {
        endpoint: '/api/bookings/business-intelligence',
        timestamp: new Date().toISOString(),
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Error getting business intelligence:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve business intelligence'
    });
  }
});

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  console.error('Booking route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.message
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid data format',
      message: 'Invalid booking ID or data format'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

export default router; 