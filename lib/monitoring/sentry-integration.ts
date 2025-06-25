/**
 * Sentry Error Tracking Integration - Phase 4 Implementation
 * Houston Mobile Notary Pros
 * 
 * Features:
 * - Real-time error tracking and reporting
 * - Performance monitoring
 * - User session tracking
 * - Custom error boundaries
 * - Release tracking
 * - Business context enrichment
 */

import * as Sentry from '@sentry/nextjs';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logging/logger';

const prisma = new PrismaClient();

// Sentry Configuration
const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  beforeSend: (event: Sentry.Event) => {
    // Filter out non-critical errors in development
    if (SENTRY_CONFIG.environment === 'development') {
      if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
        return null;
      }
    }
    return event;
  }
};

/**
 * Initialize Sentry with Enhanced Configuration
 */
export function initializeSentry(): void {
  if (!SENTRY_CONFIG.dsn) {
    logger.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_CONFIG.dsn,
    environment: SENTRY_CONFIG.environment,
    release: SENTRY_CONFIG.release,
    tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
    profilesSampleRate: SENTRY_CONFIG.profilesSampleRate,
    beforeSend: SENTRY_CONFIG.beforeSend,
    
    // Performance monitoring
    integrations: [
      new Sentry.BrowserTracing({
        tracingOrigins: ['localhost', /^\/api/, /^https:\/\/houstonmobilenotarypros\.com/],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Enhanced error context
    initialScope: {
      tags: {
        component: 'hmnp-platform',
        version: process.env.npm_package_version || 'unknown'
      }
    },

    // Security and privacy
    beforeSendTransaction(event) {
      // Remove sensitive data from transactions
      if (event.request?.url?.includes('/api/auth/')) {
        delete event.request.data;
      }
      return event;
    }
  });

  logger.info('Sentry initialized successfully', {
    environment: SENTRY_CONFIG.environment,
    release: SENTRY_CONFIG.release
  });
}

/**
 * Enhanced Error Tracking with Business Context
 */
export function trackError(
  error: Error,
  context?: {
    user?: { id: string; email?: string; role?: string };
    booking?: { id: string; status?: string; amount?: number };
    notary?: { id: string; name?: string };
    extra?: Record<string, any>;
  }
): void {
  Sentry.withScope((scope) => {
    // Set user context
    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        role: context.user.role
      });
    }

    // Set booking context
    if (context?.booking) {
      scope.setTag('booking.id', context.booking.id);
      scope.setTag('booking.status', context.booking.status || 'unknown');
      scope.setExtra('booking.amount', context.booking.amount);
    }

    // Set notary context
    if (context?.notary) {
      scope.setTag('notary.id', context.notary.id);
      scope.setTag('notary.name', context.notary.name || 'unknown');
    }

    // Set additional context
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    // Set fingerprint for grouping similar errors
    scope.setFingerprint([error.name, error.message]);

    Sentry.captureException(error);
  });

  // Also log to our internal system
  logger.error('Error tracked by Sentry', {
    error: error.message,
    context
  });
}

/**
 * Track Business Events for Analytics
 */
export function trackBusinessEvent(
  eventName: string,
  properties: {
    bookingId?: string;
    notaryId?: string;
    amount?: number;
    serviceType?: string;
    location?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): void {
  Sentry.addBreadcrumb({
    category: 'business',
    message: eventName,
    data: properties,
    level: 'info'
  });

  // Send as custom event for business intelligence
  Sentry.withScope((scope) => {
    scope.setTag('event.type', 'business');
    scope.setTag('event.name', eventName);
    
    if (properties.bookingId) {
      scope.setTag('booking.id', properties.bookingId);
    }
    
    if (properties.notaryId) {
      scope.setTag('notary.id', properties.notaryId);
    }

    if (properties.serviceType) {
      scope.setTag('service.type', properties.serviceType);
    }

    Sentry.captureMessage(`Business Event: ${eventName}`, 'info');
  });
}

/**
 * Performance Monitoring for Critical Operations
 */
export function trackPerformance<T>(
  operationName: string,
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return Sentry.startSpan(
    {
      name: operationName,
      op: 'business.operation'
    },
    async (span) => {
      const startTime = Date.now();
      
      try {
        // Set context on span
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            span.setData(key, value);
          });
        }

        const result = await operation();
        
        const duration = Date.now() - startTime;
        span.setData('duration', duration);
        span.setStatus({ code: 1 }); // OK

        // Track performance metrics
        trackBusinessEvent('performance.operation.completed', {
          operationName,
          duration,
          ...context
        });

        return result;

      } catch (error) {
        const duration = Date.now() - startTime;
        span.setData('duration', duration);
        span.setStatus({ code: 2, message: error.message }); // ERROR

        // Track performance failures
        trackBusinessEvent('performance.operation.failed', {
          operationName,
          duration,
          error: error.message,
          ...context
        });

        throw error;
      }
    }
  );
}

/**
 * Booking-Specific Error Tracking
 */
export async function trackBookingError(
  error: Error,
  bookingData?: {
    id?: string;
    customerEmail?: string;
    serviceType?: string;
    amount?: number;
    step?: string;
  }
): Promise<void> {
  try {
    // Enrich with booking context from database if available
    let bookingContext = bookingData;
    
    if (bookingData?.id) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingData.id },
        include: {
          service: true,
          notaryAssignment: {
            include: {
              notary: true
            }
          }
        }
      });

      if (booking) {
        bookingContext = {
          ...bookingData,
          serviceType: booking.service?.name,
          amount: booking.totalAmount || undefined
        };
      }
    }

    trackError(error, {
      booking: {
        id: bookingContext?.id || 'unknown',
        status: 'error',
        amount: bookingContext?.amount
      },
      extra: {
        bookingStep: bookingContext?.step,
        customerEmail: bookingContext?.customerEmail,
        serviceType: bookingContext?.serviceType
      }
    });

    // Store booking error for business analysis
    if (bookingContext?.id) {
      await prisma.notaryJournal.create({
        data: {
          notaryId: 'system',
          action: 'BOOKING_ERROR_TRACKED',
          details: JSON.stringify({
            bookingId: bookingContext.id,
            errorName: error.name,
            errorMessage: error.message,
            step: bookingContext.step,
            timestamp: new Date()
          }),
          createdAt: new Date()
        }
      });
    }

  } catch (trackingError) {
    logger.error('Failed to track booking error', { 
      originalError: error, 
      trackingError 
    });
  }
}

/**
 * Payment-Specific Error Tracking
 */
export function trackPaymentError(
  error: Error,
  paymentData: {
    bookingId?: string;
    amount?: number;
    paymentMethod?: string;
    stripePaymentIntentId?: string;
    step?: 'creation' | 'processing' | 'confirmation';
  }
): void {
  trackError(error, {
    booking: {
      id: paymentData.bookingId || 'unknown',
      status: 'payment_error',
      amount: paymentData.amount
    },
    extra: {
      paymentMethod: paymentData.paymentMethod,
      stripePaymentIntentId: paymentData.stripePaymentIntentId,
      paymentStep: paymentData.step
    }
  });

  // Track as business event for payment analytics
  trackBusinessEvent('payment.error', {
    bookingId: paymentData.bookingId,
    amount: paymentData.amount,
    metadata: {
      paymentMethod: paymentData.paymentMethod,
      step: paymentData.step,
      error: error.message
    }
  });
}

/**
 * User Experience Monitoring
 */
export function trackUserExperience(
  event: {
    type: 'page_load' | 'interaction' | 'error' | 'conversion';
    page?: string;
    action?: string;
    duration?: number;
    userId?: string;
    metadata?: Record<string, any>;
  }
): void {
  Sentry.addBreadcrumb({
    category: 'user.experience',
    message: `${event.type}: ${event.page || event.action}`,
    data: event,
    level: event.type === 'error' ? 'error' : 'info'
  });

  // Track user experience metrics
  if (event.duration && event.duration > 3000) {
    trackBusinessEvent('ux.slow_operation', {
      metadata: event
    });
  }
}

/**
 * Security Event Tracking
 */
export function trackSecurityEvent(
  event: {
    type: 'failed_login' | 'suspicious_activity' | 'rate_limit' | 'unauthorized_access';
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }
): void {
  Sentry.withScope((scope) => {
    scope.setTag('security.event', event.type);
    scope.setLevel('warning');
    
    if (event.userId) {
      scope.setTag('user.id', event.userId);
    }

    if (event.ip) {
      scope.setTag('request.ip', event.ip);
    }

    scope.setExtra('userAgent', event.userAgent);
    scope.setExtra('details', event.details);

    Sentry.captureMessage(`Security Event: ${event.type}`, 'warning');
  });
}

/**
 * Release Tracking
 */
export function trackRelease(releaseInfo: {
  version: string;
  environment: string;
  features?: string[];
  fixes?: string[];
}): void {
  Sentry.setTag('release.version', releaseInfo.version);
  Sentry.setTag('release.environment', releaseInfo.environment);

  Sentry.addBreadcrumb({
    category: 'release',
    message: `Deployed version ${releaseInfo.version}`,
    data: releaseInfo,
    level: 'info'
  });
}

/**
 * Custom Error Boundary Component Helper
 */
export function createErrorBoundaryProps(
  componentName: string,
  fallbackComponent?: React.ComponentType<any>
) {
  return {
    onError: (error: Error, errorInfo: any) => {
      trackError(error, {
        extra: {
          component: componentName,
          errorInfo: errorInfo.componentStack
        }
      });
    },
    beforeCapture: (scope: Sentry.Scope) => {
      scope.setTag('errorBoundary', componentName);
    },
    fallback: fallbackComponent
  };
}

/**
 * API Route Error Handler
 */
export function handleApiError(
  error: Error,
  request: {
    method?: string;
    url?: string;
    body?: any;
    headers?: Record<string, string>;
  }
) {
  trackError(error, {
    extra: {
      apiRoute: request.url,
      method: request.method,
      hasBody: !!request.body,
      userAgent: request.headers?.['user-agent']
    }
  });
}

export default {
  initializeSentry,
  trackError,
  trackBusinessEvent,
  trackPerformance,
  trackBookingError,
  trackPaymentError,
  trackUserExperience,
  trackSecurityEvent,
  trackRelease,
  createErrorBoundaryProps,
  handleApiError
}; 