/**
 * Webhook Security and Signature Verification
 * Provides secure webhook handling with signature verification for GHL and Stripe
 */

import crypto from 'crypto';
import { logger, logSecurityEvent } from './logger';

export interface WebhookVerificationResult {
  isValid: boolean;
  source: 'GHL' | 'STRIPE' | 'UNKNOWN';
  error?: string;
  requestId?: string;
}

export interface WebhookHeaders {
  'x-ghl-signature'?: string;
  'stripe-signature'?: string;
  'user-agent'?: string;
  'content-type'?: string;
  [key: string]: string | undefined;
}

/**
 * Verify GHL webhook signature
 */
export function verifyGHLWebhook(
  payload: string,
  signature: string,
  secret: string,
  requestId?: string
): boolean {
  try {
    if (!signature || !secret) {
      logSecurityEvent('GHL webhook verification failed: Missing signature or secret', {
        requestId,
        hasSignature: !!signature,
        hasSecret: !!secret
      });
      return false;
    }

    // GHL uses HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace(/^sha256=/, '');
    
    // Create buffers for comparison
    const receivedBuf = Buffer.from(cleanSignature, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    // Ensure both digests are same length before secure comparison
    if (receivedBuf.length !== expectedBuf.length) {
      logSecurityEvent('GHL webhook signature length mismatch', {
        requestId,
        expectedLength: expectedBuf.length,
        receivedLength: receivedBuf.length,
        payloadLength: payload.length
      });
      return false;
    }

    const isValid = crypto.timingSafeEqual(
      receivedBuf as unknown as NodeJS.ArrayBufferView,
      expectedBuf as unknown as NodeJS.ArrayBufferView
    );

    if (!isValid) {
      logSecurityEvent('GHL webhook signature verification failed', {
        requestId,
        expectedLength: expectedBuf.length,
        receivedLength: receivedBuf.length,
        payloadLength: payload.length
      });
    } else {
      logger.info('GHL webhook signature verified successfully', 'WEBHOOK_SECURITY', {
        requestId,
        payloadLength: payload.length
      });
    }

    return isValid;
  } catch (error) {
    logSecurityEvent('GHL webhook verification error', {
      requestId,
      error: (error as Error).message
    });
    return false;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string,
  requestId?: string
): boolean {
  try {
    if (!signature || !secret) {
      logSecurityEvent('Stripe webhook verification failed: Missing signature or secret', {
        requestId,
        hasSignature: !!signature,
        hasSecret: !!secret
      });
      return false;
    }

    // Parse Stripe signature format: t=timestamp,v1=signature
    const elements = signature.split(',');
    const signatureElements: { [key: string]: string } = {};
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key && value) {
        signatureElements[key] = value;
      }
    }

    const timestamp = signatureElements.t;
    const v1Signature = signatureElements.v1;

    if (!timestamp || !v1Signature) {
      logSecurityEvent('Stripe webhook signature format invalid', {
        requestId,
        hasTimestamp: !!timestamp,
        hasV1Signature: !!v1Signature
      });
      return false;
    }

    // Check timestamp tolerance (5 minutes)
    const timestampMs = parseInt(timestamp) * 1000;
    const now = Date.now();
    const tolerance = 5 * 60 * 1000; // 5 minutes

    if (Math.abs(now - timestampMs) > tolerance) {
      logSecurityEvent('Stripe webhook timestamp outside tolerance', {
        requestId,
        timestampAge: Math.abs(now - timestampMs),
        tolerance
      });
      return false;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    const v1Buf = Buffer.from(v1Signature, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    if (v1Buf.length !== expectedBuf.length) {
      logSecurityEvent('Stripe webhook signature length mismatch', {
        requestId,
        expectedLength: expectedBuf.length,
        receivedLength: v1Buf.length,
        payloadLength: payload.length
      });
      return false;
    }

    const isValid = crypto.timingSafeEqual(
      v1Buf as unknown as NodeJS.ArrayBufferView,
      expectedBuf as unknown as NodeJS.ArrayBufferView
    );

    if (!isValid) {
      logSecurityEvent('Stripe webhook signature verification failed', {
        requestId,
        timestamp,
        payloadLength: payload.length
      });
    } else {
      logger.info('Stripe webhook signature verified successfully', 'WEBHOOK_SECURITY', {
        requestId,
        timestamp,
        payloadLength: payload.length
      });
    }

    return isValid;
  } catch (error) {
    logSecurityEvent('Stripe webhook verification error', {
      requestId,
      error: (error as Error).message
    });
    return false;
  }
}

/**
 * Comprehensive webhook verification
 */
export function verifyWebhookSignature(
  payload: string,
  headers: WebhookHeaders,
  requestId?: string
): WebhookVerificationResult {
  // Check for GHL webhook
  if (headers['x-ghl-signature']) {
    const secret = process.env.GHL_WEBHOOK_SECRET;
    if (!secret) {
      logSecurityEvent('GHL webhook secret not configured', { requestId });
      return {
        isValid: false,
        source: 'GHL',
        error: 'GHL webhook secret not configured',
        requestId
      };
    }

    const isValid = verifyGHLWebhook(payload, headers['x-ghl-signature'], secret, requestId);
    return {
      isValid,
      source: 'GHL',
      error: isValid ? undefined : 'Signature verification failed',
      requestId
    };
  }

  // Check for Stripe webhook
  if (headers['stripe-signature']) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      logSecurityEvent('Stripe webhook secret not configured', { requestId });
      return {
        isValid: false,
        source: 'STRIPE',
        error: 'Stripe webhook secret not configured',
        requestId
      };
    }

    const isValid = verifyStripeWebhook(payload, headers['stripe-signature'], secret, requestId);
    return {
      isValid,
      source: 'STRIPE',
      error: isValid ? undefined : 'Signature verification failed',
      requestId
    };
  }

  // Unknown webhook source
  logSecurityEvent('Unknown webhook source - no recognized signature headers', {
    requestId,
    headers: Object.keys(headers),
    userAgent: headers['user-agent']
  });

  return {
    isValid: false,
    source: 'UNKNOWN',
    error: 'No recognized signature headers found',
    requestId
  };
}

/**
 * Rate limiting for webhook endpoints
 */
const webhookRequestCounts = new Map<string, { count: number; windowStart: number }>();

export function checkWebhookRateLimit(
  clientIp: string,
  maxRequests = 100,
  windowMs = 60000, // 1 minute
  requestId?: string
): boolean {
  const now = Date.now();
  const key = `webhook_${clientIp}`;
  
  const current = webhookRequestCounts.get(key);
  
  if (!current || now - current.windowStart > windowMs) {
    // New window or first request
    webhookRequestCounts.set(key, { count: 1, windowStart: now });
    return true;
  }
  
  if (current.count >= maxRequests) {
    logSecurityEvent('Webhook rate limit exceeded', {
      requestId,
      clientIp,
      requests: current.count,
      maxRequests,
      windowMs
    });
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Validate webhook payload structure
 */
export function validateWebhookPayload(
  payload: any,
  source: 'GHL' | 'STRIPE',
  requestId?: string
): boolean {
  try {
    switch (source) {
      case 'GHL':
        return validateGHLPayload(payload, requestId);
      case 'STRIPE':
        return validateStripePayload(payload, requestId);
      default:
        return false;
    }
  } catch (error) {
    logSecurityEvent('Webhook payload validation error', {
      requestId,
      source,
      error: (error as Error).message
    });
    return false;
  }
}

function validateGHLPayload(payload: any, requestId?: string): boolean {
  // Basic GHL payload validation
  if (!payload || typeof payload !== 'object') {
    logSecurityEvent('Invalid GHL payload: not an object', { requestId });
    return false;
  }

  // GHL webhooks should have certain fields
  const requiredFields = ['type', 'contactId', 'locationId'];
  const missingFields = requiredFields.filter(field => !(field in payload));
  
  if (missingFields.length > 0) {
    logSecurityEvent('Invalid GHL payload: missing required fields', {
      requestId,
      missingFields
    });
    return false;
  }

  logger.info('GHL webhook payload validated successfully', 'WEBHOOK_SECURITY', {
    requestId,
    type: payload.type,
    contactId: payload.contactId
  });

  return true;
}

function validateStripePayload(payload: any, requestId?: string): boolean {
  // Basic Stripe payload validation
  if (!payload || typeof payload !== 'object') {
    logSecurityEvent('Invalid Stripe payload: not an object', { requestId });
    return false;
  }

  // Stripe webhooks should have certain fields
  if (!payload.id || !payload.object || !payload.type) {
    logSecurityEvent('Invalid Stripe payload: missing required fields', {
      requestId,
      hasId: !!payload.id,
      hasObject: !!payload.object,
      hasType: !!payload.type
    });
    return false;
  }

  logger.info('Stripe webhook payload validated successfully', 'WEBHOOK_SECURITY', {
    requestId,
    type: payload.type,
    id: payload.id
  });

  return true;
}

/**
 * Webhook security middleware
 */
export interface WebhookSecurityOptions {
  requireSignature?: boolean;
  rateLimitMaxRequests?: number;
  rateLimitWindowMs?: number;
  validatePayload?: boolean;
}

export function createWebhookSecurityCheck(options: WebhookSecurityOptions = {}) {
  const {
    requireSignature = true,
    rateLimitMaxRequests = 100,
    rateLimitWindowMs = 60000,
    validatePayload = true
  } = options;

  return (
    payload: string,
    headers: WebhookHeaders,
    clientIp: string,
    requestId?: string
  ): { isValid: boolean; error?: string; source?: string } => {
    // Check rate limit
    if (!checkWebhookRateLimit(clientIp, rateLimitMaxRequests, rateLimitWindowMs, requestId)) {
      return { isValid: false, error: 'Rate limit exceeded' };
    }

    // Verify signature if required
    if (requireSignature) {
      const verification = verifyWebhookSignature(payload, headers, requestId);
      if (!verification.isValid) {
        return { 
          isValid: false, 
          error: verification.error || 'Signature verification failed',
          source: verification.source
        };
      }
    }

    // Validate payload if required
    if (validatePayload) {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (error) {
        logSecurityEvent('Invalid JSON payload', { requestId });
        return { isValid: false, error: 'Invalid JSON payload' };
      }

      const verification = verifyWebhookSignature(payload, headers, requestId);
      if (verification.source !== 'UNKNOWN') {
        const isValidPayload = validateWebhookPayload(parsedPayload, verification.source, requestId);
        if (!isValidPayload) {
          return { isValid: false, error: 'Invalid payload structure' };
        }
      }
    }

    return { isValid: true };
  };
} 