/**
 * Webhook Security and Signature Verification
 * Provides secure webhook handling with signature verification for GHL and Stripe
 */

import crypto from 'crypto';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger, logSecurityEvent } from './logger';

/**
 * Enhanced webhook security with advanced features
 * Combines general webhook support (GHL + Stripe) with advanced security features
 */

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

/**
 * Advanced webhook rate limiter class (from GHL-specific implementation)
 */
export class WebhookRateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: Date }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 100, windowMs = 60000) { // 100 requests per minute default
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = new Date();
    const existing = this.attempts.get(identifier);

    if (!existing) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return true;
    }

    // Check if window has expired
    if (now.getTime() - existing.firstAttempt.getTime() > this.windowMs) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return true;
    }

    // Check if under limit
    if (existing.count >= this.maxAttempts) {
      return false;
    }

    existing.count++;
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const existing = this.attempts.get(identifier);
    if (!existing) return this.maxAttempts;
    
    const now = new Date();
    if (now.getTime() - existing.firstAttempt.getTime() > this.windowMs) {
      return this.maxAttempts;
    }
    
    return Math.max(0, this.maxAttempts - existing.count);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  cleanup(): void {
    const now = new Date();
    for (const [key, value] of this.attempts.entries()) {
      if (now.getTime() - value.firstAttempt.getTime() > this.windowMs) {
        this.attempts.delete(key);
      }
    }
  }
}

/**
 * Webhook security logger for auditing
 */
export interface WebhookSecurityLog {
  timestamp: Date;
  endpoint: string;
  sourceIP?: string;
  signature?: string;
  isValid: boolean;
  eventType?: string;
  error?: string;
  rateLimited?: boolean;
}

export class WebhookSecurityLogger {
  private logs: WebhookSecurityLog[] = [];
  private readonly maxLogs: number;

  constructor(maxLogs = 1000) {
    this.maxLogs = maxLogs;
  }

  log(logEntry: Omit<WebhookSecurityLog, 'timestamp'>): void {
    this.logs.push({
      timestamp: new Date(),
      ...logEntry
    });

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log security events
    console.log('🔐 Webhook Security Log:', {
      timestamp: new Date().toISOString(),
      ...logEntry
    });
  }

  getRecentLogs(limit = 50): WebhookSecurityLog[] {
    return this.logs.slice(-limit);
  }

  getFailedAttempts(since?: Date): WebhookSecurityLog[] {
    const filterDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    return this.logs.filter(log => 
      !log.isValid && 
      log.timestamp >= filterDate
    );
  }

  clear(): void {
    this.logs = [];
  }
}

// Create default instances
export const defaultRateLimiter = new WebhookRateLimiter();
export const defaultSecurityLogger = new WebhookSecurityLogger();

/**
 * Enhanced webhook verification with replay protection (from GHL implementation)
 */
export function verifyGHLWebhookEnhanced(
  payload: string,
  signature: string,
  secret: string,
  options: {
    tolerance?: number; // Time tolerance in seconds for replay attack prevention
    requestId?: string;
  } = {}
): WebhookVerificationResult & { timestamp?: Date } {
  const { tolerance = 300, requestId } = options; // 5 minutes default tolerance

  if (!signature || !secret || !payload) {
    return {
      isValid: false,
      source: 'GHL',
      error: 'Missing required parameters (signature, secret, or payload)',
      requestId
    };
  }

  try {
    // Remove header prefix if present
    const cleanSignature = signature.startsWith('sha256=') 
      ? signature.substring(7)
      : signature;

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Perform timing-safe comparison
    const receivedBuf = Buffer.from(cleanSignature, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    if (receivedBuf.length !== expectedBuf.length) {
      return {
        isValid: false,
        source: 'GHL',
        error: 'Signature length mismatch',
        requestId
      };
    }

    const isSignatureValid = crypto.timingSafeEqual(
      receivedBuf as unknown as NodeJS.ArrayBufferView,
      expectedBuf as unknown as NodeJS.ArrayBufferView
    );

    if (!isSignatureValid) {
      return {
        isValid: false,
        source: 'GHL',
        error: 'Invalid webhook signature',
        requestId
      };
    }

    // Extract timestamp from payload for replay attack prevention
    try {
      const parsed = JSON.parse(payload);
      if (parsed.timestamp && tolerance > 0) {
        const webhookTime = new Date(parsed.timestamp);
        const currentTime = new Date();
        const timeDifference = Math.abs(currentTime.getTime() - webhookTime.getTime()) / 1000;

        if (timeDifference > tolerance) {
          return {
            isValid: false,
            source: 'GHL',
            error: `Webhook timestamp too old. Difference: ${timeDifference}s, tolerance: ${tolerance}s`,
            requestId,
            timestamp: webhookTime
          };
        }
      }
    } catch (parseError) {
      // If we can't parse timestamp, continue without time-based verification
      console.warn('Could not parse webhook timestamp for replay protection:', parseError);
    }

    return {
      isValid: true,
      source: 'GHL',
      requestId,
      timestamp: new Date()
    };

  } catch (error) {
    return {
      isValid: false,
      source: 'GHL',
      error: `Signature verification failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`,
      requestId
    };
  }
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
