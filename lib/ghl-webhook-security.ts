import crypto from 'crypto';

/**
 * GHL Webhook Security Utilities
 * 
 * Provides centralized webhook signature verification and security functions
 * for Go High Level (GHL) webhook endpoints.
 */

export interface WebhookVerificationOptions {
  secret: string;
  algorithm?: string;
  headerPrefix?: string;
  tolerance?: number; // Time tolerance in seconds for replay attack prevention
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
  timestamp?: Date;
}

/**
 * Verify GHL webhook signature
 * 
 * @param payload - Raw webhook payload as string
 * @param signature - Signature from webhook headers
 * @param secret - Webhook secret from environment
 * @param options - Additional verification options
 * @returns Verification result with validity and error details
 */
export function verifyGHLWebhook(
  payload: string,
  signature: string,
  secret: string,
  options: Partial<WebhookVerificationOptions> = {}
): WebhookVerificationResult {
  const {
    algorithm = 'sha256',
    headerPrefix = 'sha256=',
    tolerance = 300 // 5 minutes default tolerance
  } = options;

  if (!signature || !secret || !payload) {
    return {
      isValid: false,
      error: 'Missing required parameters (signature, secret, or payload)'
    };
  }

  try {
    // Remove header prefix if present
    const cleanSignature = signature.startsWith(headerPrefix) 
      ? signature.substring(headerPrefix.length)
      : signature;

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Perform timing-safe comparison
    const receivedBuf = Buffer.from(cleanSignature, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    // Ensure both buffers are same length to prevent errors
    if (receivedBuf.length !== expectedBuf.length) {
      return {
        isValid: false,
        error: 'Signature length mismatch'
      };
    }

    const isSignatureValid = crypto.timingSafeEqual(
      receivedBuf as unknown as NodeJS.ArrayBufferView,
      expectedBuf as unknown as NodeJS.ArrayBufferView
    );

    if (!isSignatureValid) {
      return {
        isValid: false,
        error: 'Invalid webhook signature'
      };
    }

    // Extract timestamp from payload for replay attack prevention (optional)
    let timestampCheck = true;
    try {
      const parsed = JSON.parse(payload);
      if (parsed.timestamp && tolerance > 0) {
        const webhookTime = new Date(parsed.timestamp);
        const currentTime = new Date();
        const timeDifference = Math.abs(currentTime.getTime() - webhookTime.getTime()) / 1000;

        if (timeDifference > tolerance) {
          return {
            isValid: false,
            error: `Webhook timestamp too old. Difference: ${timeDifference}s, tolerance: ${tolerance}s`,
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
      timestamp: new Date()
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Verify webhook for specific GHL event types
 * Adds additional validation for event-specific requirements
 */
export function verifyGHLEventWebhook(
  payload: string,
  signature: string,
  secret: string,
  expectedEventTypes?: string[]
): WebhookVerificationResult & { eventType?: string } {
  // First verify the basic signature
  const basicVerification = verifyGHLWebhook(payload, signature, secret);
  
  if (!basicVerification.isValid) {
    return basicVerification;
  }

  // Additional event-specific validation
  try {
    const parsed = JSON.parse(payload);
    const eventType = parsed.type;

    if (expectedEventTypes && expectedEventTypes.length > 0) {
      if (!eventType || !expectedEventTypes.includes(eventType)) {
        return {
          isValid: false,
          error: `Unexpected event type: ${eventType}. Expected: ${expectedEventTypes.join(', ')}`
        };
      }
    }

    return {
      ...basicVerification,
      eventType
    };

  } catch (parseError) {
    return {
      isValid: false,
      error: 'Invalid JSON payload'
    };
  }
}

/**
 * Generate a webhook signature for testing purposes
 * DO NOT use in production - only for testing webhook verification
 */
export function generateTestSignature(payload: string, secret: string, algorithm = 'sha256'): string {
  const signature = crypto
    .createHmac(algorithm, secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return `${algorithm}=${signature}`;
}

/**
 * Rate limiting utility for webhook endpoints
 * Helps prevent abuse and excessive webhook calls
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

    // Reset if window has passed
    if (now.getTime() - existing.firstAttempt.getTime() > this.windowMs) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return true;
    }

    // Check if under limit
    if (existing.count < this.maxAttempts) {
      existing.count++;
      return true;
    }

    return false;
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
    for (const [identifier, data] of this.attempts.entries()) {
      if (now.getTime() - data.firstAttempt.getTime() > this.windowMs) {
        this.attempts.delete(identifier);
      }
    }
  }
}

/**
 * Webhook logging utility for security auditing
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
      ...logEntry,
      timestamp: new Date()
    });

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Webhook Security Log:', {
        ...logEntry,
        timestamp: new Date().toISOString()
      });
    }
  }

  getRecentLogs(limit = 50): WebhookSecurityLog[] {
    return this.logs.slice(-limit);
  }

  getFailedAttempts(since?: Date): WebhookSecurityLog[] {
    const sinceTime = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    return this.logs.filter(log => 
      !log.isValid && 
      log.timestamp >= sinceTime
    );
  }

  clear(): void {
    this.logs = [];
  }
}

// Global instances for use across the application
export const defaultRateLimiter = new WebhookRateLimiter();
export const defaultSecurityLogger = new WebhookSecurityLogger();

/**
 * Comprehensive webhook security middleware
 * Combines signature verification, rate limiting, and logging
 */
export interface WebhookSecurityConfig {
  secret: string;
  rateLimiter?: WebhookRateLimiter;
  logger?: WebhookSecurityLogger;
  expectedEventTypes?: string[];
  requireSignature?: boolean;
  maxPayloadSize?: number; // in bytes
}

export function validateWebhookSecurity(
  payload: string,
  headers: { [key: string]: string | null },
  sourceIP: string | null,
  endpoint: string,
  config: WebhookSecurityConfig
): { isValid: boolean; error?: string; eventType?: string } {
  const {
    secret,
    rateLimiter = defaultRateLimiter,
    logger = defaultSecurityLogger,
    expectedEventTypes,
    requireSignature = true,
    maxPayloadSize = 1024 * 1024 // 1MB default
  } = config;

  // Check payload size
  if (payload.length > maxPayloadSize) {
    const error = `Payload too large: ${payload.length} bytes (max: ${maxPayloadSize})`;
    logger.log({
      endpoint,
      sourceIP: sourceIP || undefined,
      isValid: false,
      error
    });
    return { isValid: false, error };
  }

  // Rate limiting check
  const rateLimitKey = sourceIP || 'unknown';
  if (!rateLimiter.isAllowed(rateLimitKey)) {
    const error = 'Rate limit exceeded';
    logger.log({
      endpoint,
      sourceIP: sourceIP || undefined,
      isValid: false,
      error,
      rateLimited: true
    });
    return { isValid: false, error };
  }

  // Signature verification
  const signature = headers['x-ghl-signature'];
  if (requireSignature && !signature) {
    const error = 'Missing webhook signature';
    logger.log({
      endpoint,
      sourceIP: sourceIP || undefined,
      signature: signature || undefined,
      isValid: false,
      error
    });
    return { isValid: false, error };
  }

  if (signature) {
    const verification = verifyGHLEventWebhook(payload, signature, secret, expectedEventTypes);
    
    logger.log({
      endpoint,
      sourceIP: sourceIP || undefined,
      signature: signature || undefined,
      isValid: verification.isValid,
      eventType: verification.eventType,
      error: verification.error
    });

    return {
      isValid: verification.isValid,
      error: verification.error,
      eventType: verification.eventType
    };
  }

  // If signature not required and not provided, just validate payload format
  try {
    const parsed = JSON.parse(payload);
    const eventType = parsed.type;

    logger.log({
      endpoint,
      sourceIP: sourceIP || undefined,
      isValid: true,
      eventType
    });

    return {
      isValid: true,
      eventType
    };

  } catch (parseError) {
    const error = 'Invalid JSON payload';
    logger.log({
      endpoint,
      sourceIP: sourceIP || undefined,
      isValid: false,
      error
    });
    return { isValid: false, error };
  }
}

/**
 * Utility function for Next.js API routes
 * Extracts common webhook security validation logic
 */
export function getWebhookSecurityHeaders(request: Request): {
  signature: string | null;
  sourceIP: string | null;
  userAgent: string | null;
} {
  const headers = request.headers;
  
  return {
    signature: headers.get('x-ghl-signature'),
    sourceIP: headers.get('x-forwarded-for') || headers.get('cf-connecting-ip') || null,
    userAgent: headers.get('user-agent')
  };
} 