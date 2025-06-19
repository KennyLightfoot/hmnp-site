/**
 * Advanced Input Validation and Sanitization Middleware
 * Houston Mobile Notary Pros API
 * 
 * This middleware provides enhanced validation and sanitization for API requests
 * to prevent injection attacks and ensure data integrity.
 */

import { validationResult, matchedData } from 'express-validator';
import xss from 'xss';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Validates request against validation rules and sanitizes input
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation failures
    console.warn('Validation failed:', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      ip: req.ip
    });
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        value: error.value,
        message: error.msg
      }))
    });
  }
  
  // Get validated data
  req.validatedData = matchedData(req);
  
  // Continue to next middleware
  next();
};

/**
 * Sanitizes request body to prevent XSS attacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const sanitizeInputs = (req, res, next) => {
  // Skip sanitization for certain paths like webhooks that need raw data
  if (req.path.startsWith('/webhooks') || 
      req.path.includes('/stripe-webhook') || 
      req.path.includes('/ghl-callback')) {
    return next();
  }
  
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Recursively sanitizes an object's string values
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const result = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        // Apply XSS filtering to string values
        result[key] = xss(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        result[key] = sanitizeObject(value);
      } else {
        // Non-string values pass through unchanged
        result[key] = value;
      }
    }
  }
  
  return result;
};

/**
 * Specialized sanitization for SQL queries to prevent SQL injection
 * @param {String} str - String to sanitize 
 * @returns {String} Sanitized string
 */
export const sanitizeSql = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Remove SQL injection patterns
  return str
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/--.*$/gm, '')           // Remove single line comments
    .replace(/;\s*$/g, '');           // Remove trailing semicolons
};

/**
 * Custom validators for common domain objects
 */
export const customValidators = {
  /**
   * Validates that a booking ID exists
   */
  isValidBookingId: async (bookingId) => {
    if (!bookingId) return false;
    
    const booking = await prisma.apiBooking.findUnique({
      where: { bookingId }
    });
    
    return !!booking;
  },
  
  /**
   * Validates date ranges for appointments
   */
  isValidDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Ensure dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }
    
    // Ensure end date is after start date
    return end > start;
  },
  
  /**
   * Validates timezones
   */
  isValidTimezone: (timezone) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      // Invalid timezone will throw an error
      return false;
    }
  },
  
  /**
   * Validates email addresses with stricter rules than express-validator
   */
  isStrictEmail: (email) => {
    // RFC 5322 compliant regex for email validation
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  },
  
  /**
   * Validates phone numbers in various formats
   */
  isPhoneNumber: (phone) => {
    // Accept various formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
    const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    return phoneRegex.test(phone);
  }
};

const validatorModule = { validate, sanitizeInputs, sanitizeSql, customValidators };
export default validatorModule;
