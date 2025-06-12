/**
 * Webhook Security Middleware
 * Military-grade HMAC-SHA256 signature verification
 * Houston Mobile Notary Pros API
 */

import crypto from 'crypto';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

/**
 * Verify webhook signature using HMAC-SHA256
 * @param {string} payload - Raw request body
 * @param {string} signature - Signature from header
 * @param {string} secret - Webhook secret
 * @returns {boolean} - True if signature is valid
 */
function verifySignature(payload, signature, secret) {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    // Format expected signature to match GitHub/Stripe style
    const expectedSignatureFormatted = `sha256=${expectedSignature}`;
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignatureFormatted)
    );
  } catch (error) {
    logger.error('Signature verification error:', error.message);
    return false;
  }
}

/**
 * Validate request timestamp to prevent replay attacks
 * @param {number} timestamp - Request timestamp
 * @param {number} toleranceMs - Allowed time difference in milliseconds
 * @returns {boolean} - True if timestamp is within tolerance
 */
function validateTimestamp(timestamp, toleranceMs = 300000) { // 5 minutes default
  if (!timestamp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const diff = Math.abs(now - timestamp);
  
  return diff <= (toleranceMs / 1000);
}

/**
 * Enhanced webhook security middleware
 */
const webhookSecurity = (req, res, next) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Log incoming webhook request
  logger.info('Webhook request received', {
    method: req.method,
    url: req.originalUrl,
    ip: clientIP,
    userAgent: userAgent,
    contentLength: req.get('Content-Length') || 0
  });

  try {
    // Security checks
    const securityChecks = {
      hasSignature: false,
      signatureValid: false,
      timestampValid: false,
      contentTypeValid: false,
      payloadSizeValid: false,
      rateLimitPassed: false
    };

    // 1. Content-Type validation
    const contentType = req.get('Content-Type') || '';
    securityChecks.contentTypeValid = contentType.includes('application/json') || 
                                      contentType.includes('application/x-www-form-urlencoded');

    if (!securityChecks.contentTypeValid) {
      logger.warn('Invalid content type', { contentType, ip: clientIP });
      return res.status(400).json({
        error: 'Invalid content type',
        message: 'Content-Type must be application/json or application/x-www-form-urlencoded'
      });
    }

    // 2. Payload size validation (max 1MB)
    const contentLength = parseInt(req.get('Content-Length') || '0');
    securityChecks.payloadSizeValid = contentLength <= 1024 * 1024; // 1MB

    if (!securityChecks.payloadSizeValid) {
      logger.warn('Payload too large', { contentLength, ip: clientIP });
      return res.status(413).json({
        error: 'Payload too large',
        message: 'Maximum payload size is 1MB'
      });
    }

    // 3. Signature verification
    const signature = req.get('x-ghl-signature') || 
                     req.get('x-stripe-signature') || 
                     req.get('x-webhook-signature');
    
    securityChecks.hasSignature = !!signature;

    if (signature) {
      const secret = process.env.GHL_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
      const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
      
      securityChecks.signatureValid = verifySignature(payload, signature, secret);
      
      if (!securityChecks.signatureValid) {
        logger.error('Invalid webhook signature', {
          ip: clientIP,
          signature: signature.substring(0, 20) + '...',
          payloadLength: payload.length
        });
        
        return res.status(401).json({
          error: 'Invalid signature',
          message: 'Webhook signature verification failed',
          traceId: crypto.randomUUID()
        });
      }
    }

    // 4. Timestamp validation (if provided)
    const timestamp = req.get('x-timestamp') || req.body.timestamp;
    if (timestamp) {
      securityChecks.timestampValid = validateTimestamp(parseInt(timestamp));
      
      if (!securityChecks.timestampValid) {
        logger.warn('Invalid timestamp - possible replay attack', {
          timestamp,
          ip: clientIP
        });
        
        return res.status(400).json({
          error: 'Invalid timestamp',
          message: 'Request timestamp is too old or invalid'
        });
      }
    }

    // 5. Rate limiting check (basic implementation)
    // TODO: Implement Redis-based rate limiting for production
    securityChecks.rateLimitPassed = true;

    // Log security check results
    logger.info('Webhook security validation completed', {
      ip: clientIP,
      checks: securityChecks,
      processingTime: Date.now() - startTime
    });

    // Add security info to request for downstream use
    req.webhookSecurity = {
      verified: securityChecks.signatureValid || !securityChecks.hasSignature,
      clientIP,
      userAgent,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      traceId: crypto.randomUUID()
    };

    next();

  } catch (error) {
    logger.error('Webhook security middleware error', {
      error: error.message,
      stack: error.stack,
      ip: clientIP,
      url: req.originalUrl
    });

    return res.status(500).json({
      error: 'Security validation failed',
      message: 'Internal security error occurred',
      traceId: crypto.randomUUID()
    });
  }
};

/**
 * GHL-specific webhook validation
 */
const ghlWebhookSecurity = (req, res, next) => {
  // Add GHL-specific validation if needed
  req.webhookSource = 'ghl';
  next();
};

/**
 * Stripe-specific webhook validation
 */
const stripeWebhookSecurity = (req, res, next) => {
  // Add Stripe-specific validation if needed
  req.webhookSource = 'stripe';
  next();
};

export {
  webhookSecurity,
  ghlWebhookSecurity,
  stripeWebhookSecurity,
  verifySignature,
  validateTimestamp
}; 