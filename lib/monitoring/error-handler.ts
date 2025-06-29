/**
 * Comprehensive Error Handling and Monitoring System
 * 
 * Provides centralized error handling, logging, and monitoring
 * for the booking system with proper retry logic and alerting.
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Initialize Prisma client
const prisma = new PrismaClient();

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  INTEGRATION = 'integration',
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_API = 'external_api'
}

// Error context interface
export interface ErrorContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  method?: string;
  timestamp?: Date;
  additionalData?: Record<string, any>;
}

// Enhanced error class
class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.BOOKING,
    statusCode: number = 500,
    context: ErrorContext = {},
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.statusCode = statusCode;
    this.context = { ...context, timestamp: new Date() };
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error monitoring class
class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorReset: Date = new Date();

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  /**
   * Log error to database and external services
   */
  async logError(error: Error | AppError, context: ErrorContext = {}): Promise<string> {
    const errorId = randomUUID();
    
    try {
      // Enhance context with request ID
      const enhancedContext = {
        ...context,
        requestId: context.requestId || errorId,
        timestamp: new Date()
      };

      // Determine error details
      const isAppError = error instanceof AppError;
      const errorDetails = {
        id: errorId,
        message: error.message,
        stack: error.stack || '',
        code: isAppError ? error.code : 'UNKNOWN_ERROR',
        severity: isAppError ? error.severity : ErrorSeverity.MEDIUM,
        category: isAppError ? error.category : ErrorCategory.BOOKING,
        statusCode: isAppError ? error.statusCode : 500,
        context: enhancedContext,
        isOperational: isAppError ? error.isOperational : false
      };

      // Log to console for immediate debugging
      console.error(`[ERROR ${errorDetails.severity.toUpperCase()}] ${errorDetails.code}:`, {
        message: errorDetails.message,
        requestId: enhancedContext.requestId,
        category: errorDetails.category,
        context: enhancedContext
      });

      // Save to database for persistence
      await this.saveErrorToDatabase(errorDetails);

      // Update error counters
      this.updateErrorCounts(errorDetails.code);

      // Send to external monitoring services
      await this.sendToExternalServices(errorDetails);

      // Check for critical error patterns
      await this.checkCriticalPatterns(errorDetails);

      return errorId;

    } catch (loggingError) {
      console.error('[ERROR MONITOR] Failed to log error:', loggingError);
      console.error('[ERROR MONITOR] Original error:', error);
      return errorId;
    }
  }

  /**
   * Save error to database
   */
  private async saveErrorToDatabase(errorDetails: any): Promise<void> {
    try {
      await prisma.backgroundError.create({
        data: {
          id: errorDetails.id,
          source: `${errorDetails.category}:${errorDetails.code}`,
          message: errorDetails.message,
          stack: errorDetails.stack,
          createdAt: errorDetails.context.timestamp || new Date()
        }
      });
    } catch (dbError) {
      console.error('[ERROR MONITOR] Failed to save to database:', dbError);
    }
  }

  /**
   * Send error to external monitoring services
   */
  private async sendToExternalServices(errorDetails: any): Promise<void> {
    // Send to Better Stack (if configured)
    if (process.env.BETTER_STACK_SOURCE_TOKEN) {
      try {
        await fetch(`${process.env.BETTER_STACK_URL || 'https://in.logs.betterstack.com'}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BETTER_STACK_SOURCE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dt: errorDetails.context.timestamp,
            level: this.getSeverityLevel(errorDetails.severity),
            message: errorDetails.message,
            error_code: errorDetails.code,
            category: errorDetails.category,
            request_id: errorDetails.context.requestId,
            stack_trace: errorDetails.stack,
            context: errorDetails.context
          })
        });
      } catch (monitoringError) {
        console.error('[ERROR MONITOR] Failed to send to Better Stack:', monitoringError);
      }
    }

    // Send to Sentry (if configured)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(errorDetails.message), {
        tags: {
          error_code: errorDetails.code,
          category: errorDetails.category,
          severity: errorDetails.severity
        },
        contexts: {
          error_details: errorDetails.context
        }
      });
    }
  }

  /**
   * Update error counters for pattern detection
   */
  private updateErrorCounts(errorCode: string): void {
    const current = this.errorCounts.get(errorCode) || 0;
    this.errorCounts.set(errorCode, current + 1);

    // Reset counters every hour
    const now = new Date();
    if (now.getTime() - this.lastErrorReset.getTime() > 60 * 60 * 1000) {
      this.errorCounts.clear();
      this.lastErrorReset = now;
    }
  }

  /**
   * Check for critical error patterns
   */
  private async checkCriticalPatterns(errorDetails: any): Promise<void> {
    const errorCode = errorDetails.code;
    const count = this.errorCounts.get(errorCode) || 0;

    // Critical thresholds
    const criticalThresholds = {
      'BOOKING_FAILURE': 5,
      'PAYMENT_FAILURE': 3,
      'DATABASE_ERROR': 10,
      'API_TIMEOUT': 15
    };

    const threshold = criticalThresholds[errorCode as keyof typeof criticalThresholds] || 20;

    if (count >= threshold) {
      await this.sendCriticalAlert(errorCode, count, errorDetails);
    }
  }

  /**
   * Send critical error alert
   */
  private async sendCriticalAlert(errorCode: string, count: number, errorDetails: any): Promise<void> {
    const alertMessage = `CRITICAL: ${errorCode} occurred ${count} times in the last hour`;
    
    console.error('[CRITICAL ALERT]', alertMessage, {
      errorCode,
      count,
      lastError: errorDetails
    });

    // Send alert via webhook or email service
    try {
      if (process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY) {
        // Send email alert (implementation would depend on email service)
        console.log('[ALERT] Would send email to:', process.env.ADMIN_EMAIL);
      }
    } catch (alertError) {
      console.error('[ERROR MONITOR] Failed to send critical alert:', alertError);
    }
  }

  /**
   * Get severity level for external services
   */
  private getSeverityLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW: return 'info';
      case ErrorSeverity.MEDIUM: return 'warn';
      case ErrorSeverity.HIGH: return 'error';
      case ErrorSeverity.CRITICAL: return 'fatal';
      default: return 'error';
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { [errorCode: string]: number } {
    return Object.fromEntries(this.errorCounts);
  }
}

// Global error monitor instance
export const errorMonitor = ErrorMonitor.getInstance();

/**
 * Error handler for API routes
 */
export async function handleAPIError(
  error: Error,
  context: ErrorContext = {}
): Promise<{ error: string; requestId: string; statusCode: number }> {
  const errorId = await errorMonitor.logError(error, context);
  
  if (error instanceof AppError) {
    return {
      error: error.message,
      requestId: errorId,
      statusCode: error.statusCode
    };
  }

  return {
    error: 'Internal server error',
    requestId: errorId,
    statusCode: 500
  };
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  context: ErrorContext = {}
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Log retry attempt
      if (attempt < maxAttempts) {
        console.log(`[RETRY] Attempt ${attempt}/${maxAttempts} failed, retrying in ${baseDelay * attempt}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, baseDelay * attempt));
      }
    }
  }
  
  // Log final failure
  await errorMonitor.logError(
    new AppError(
      `Operation failed after ${maxAttempts} attempts: ${lastError?.message}`,
      'RETRY_EXHAUSTED',
      ErrorSeverity.HIGH,
      ErrorCategory.EXTERNAL_API,
      500,
      context
    )
  );
  
  throw lastError;
}

/**
 * Circuit breaker pattern for external service calls
 */
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime.getTime() > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new AppError(
          'Circuit breaker is OPEN',
          'CIRCUIT_BREAKER_OPEN',
          ErrorSeverity.HIGH,
          ErrorCategory.EXTERNAL_API,
          503
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Create circuit breakers for different services
export const stripeCircuitBreaker = new CircuitBreaker(3, 30000);
export const ghlCircuitBreaker = new CircuitBreaker(5, 60000);

/**
 * Common booking system errors
 */
export const BookingErrors = {
  SERVICE_NOT_FOUND: (serviceId: string) => new AppError(
    `Service not found: ${serviceId}`,
    'SERVICE_NOT_FOUND',
    ErrorSeverity.MEDIUM,
    ErrorCategory.BOOKING,
    404
  ),
  
  INVALID_DATE: (date: string) => new AppError(
    `Invalid booking date: ${date}`,
    'INVALID_DATE',
    ErrorSeverity.LOW,
    ErrorCategory.VALIDATION,
    400
  ),
  
  NO_AVAILABILITY: (date: string) => new AppError(
    `No availability for date: ${date}`,
    'NO_AVAILABILITY',
    ErrorSeverity.LOW,
    ErrorCategory.BOOKING,
    400
  ),
  
  PAYMENT_FAILED: (reason: string) => new AppError(
    `Payment processing failed: ${reason}`,
    'PAYMENT_FAILED',
    ErrorSeverity.HIGH,
    ErrorCategory.PAYMENT,
    402
  ),
  
  DATABASE_CONNECTION: () => new AppError(
    'Database connection failed',
    'DATABASE_CONNECTION',
    ErrorSeverity.CRITICAL,
    ErrorCategory.DATABASE,
    503
  ),
  
  RATE_LIMITED: () => new AppError(
    'Too many requests',
    'RATE_LIMITED',
    ErrorSeverity.MEDIUM,
    ErrorCategory.RATE_LIMIT,
    429
  )
};

export {
  AppError,
  ErrorMonitor
};