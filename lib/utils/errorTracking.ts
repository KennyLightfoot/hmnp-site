import { getErrorMessage } from '@/lib/utils/error-utils';

interface ErrorContext {
  component?: string;
  userId?: string;
  sessionId?: string;
  step?: string | number;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  name?: string;
  cause?: unknown;
  timestamp: string;
  url: string;
  userAgent: string;
  context: ErrorContext;
}

class ErrorTracker {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorInfo[] = [];
  private flushTimeout?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        component: 'global',
        action: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        event.reason instanceof Error 
          ? event.reason 
          : new Error(`Unhandled promise rejection: ${event.reason}`),
        {
          component: 'global',
          action: 'unhandled_promise_rejection',
        }
      );
    });

    // Handle network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.trackError(new Error(`HTTP ${response.status}: ${response.statusText}`), {
            component: 'network',
            action: 'fetch_error',
            metadata: {
              url: args[0]?.toString(),
              status: response.status,
              statusText: response.statusText,
            }
          });
        }
        
        return response;
      } catch (error) {
        this.trackError(error as Error, {
          component: 'network',
          action: 'fetch_failure',
          metadata: {
            url: args[0]?.toString(),
          }
        });
        throw error;
      }
    };
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  trackError(error: Error | unknown, context: ErrorContext = {}) {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? getErrorMessage(error) : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError',
      cause: error instanceof Error ? error.cause : undefined,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      context: {
        ...context,
        sessionId: this.sessionId,
        userId: this.userId,
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR_TRACKER]', {
        error: errorInfo,
        originalError: error,
      });
    }

    // Add to queue
    this.errorQueue.push(errorInfo);

    // Flush immediately for critical errors
    const isCritical = this.isCriticalError(error, context);
    if (isCritical) {
      this.flush();
    } else {
      // Debounced flush for non-critical errors
      this.scheduleFlush();
    }

    // Track in analytics
    this.trackInAnalytics(errorInfo);
  }

  private isCriticalError(error: Error | unknown, context: ErrorContext): boolean {
    const message = error instanceof Error ? getErrorMessage(error) : String(error);
    const criticalPatterns = [
      'payment',
      'stripe',
      'booking.*failed',
      'database.*error',
      'auth.*error',
      'security'
    ];

    return criticalPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(message) || 
      new RegExp(pattern, 'i').test(context.component || '') ||
      new RegExp(pattern, 'i').test(context.action || '')
    );
  }

  private scheduleFlush() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, 5000); // Flush every 5 seconds
  }

  private async flush() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Send to error tracking service
      await fetch('/api/errors/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      });
    } catch (error) {
      console.error('[ERROR_TRACKER] Failed to send errors:', getErrorMessage(error));
      // Re-queue errors if sending failed
      this.errorQueue.unshift(...errors);
    }
  }

  private trackInAnalytics(errorInfo: ErrorInfo) {
    if (typeof window === 'undefined') return;

    try {
      // Google Analytics 4
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: errorInfo.message,
          fatal: this.isCriticalError(errorInfo, errorInfo.context),
          component: errorInfo.context.component,
          step: errorInfo.context.step,
          action: errorInfo.context.action,
        });
      }

      // Custom analytics
      if ((window as any).analytics) {
        (window as any).analytics.track('Error Occurred', {
          errorMessage: errorInfo.message,
          errorName: errorInfo.name,
          component: errorInfo.context.component,
          userId: errorInfo.context.userId,
          sessionId: errorInfo.context.sessionId,
          step: errorInfo.context.step,
          action: errorInfo.context.action,
          timestamp: errorInfo.timestamp,
        });
      }
    } catch (analyticsError) {
      console.warn('[ERROR_TRACKER] Failed to track in analytics:', analyticsError);
    }
  }

  // Utility methods for common error scenarios
  trackBookingError(error: Error | unknown, step: string | number, additionalContext?: Record<string, any>) {
    this.trackError(error, {
      component: 'booking',
      step,
      action: 'booking_error',
      metadata: additionalContext,
    });
  }

  trackPaymentError(error: Error | unknown, paymentMethod?: string, additionalContext?: Record<string, any>) {
    this.trackError(error, {
      component: 'payment',
      action: 'payment_error',
      metadata: {
        paymentMethod,
        ...additionalContext,
      },
    });
  }

  trackApiError(error: Error | unknown, endpoint: string, method: string = 'GET', additionalContext?: Record<string, any>) {
    this.trackError(error, {
      component: 'api',
      action: 'api_error',
      metadata: {
        endpoint,
        method,
        ...additionalContext,
      },
    });
  }

  trackFormError(error: Error | unknown, formName: string, fieldName?: string, additionalContext?: Record<string, any>) {
    this.trackError(error, {
      component: 'form',
      action: 'form_error',
      metadata: {
        formName,
        fieldName,
        ...additionalContext,
      },
    });
  }

  // Performance and user experience tracking
  trackPerformanceIssue(metric: string, value: number, threshold: number, context?: Record<string, any>) {
    if (value > threshold) {
      this.trackError(new Error(`Performance issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`), {
        component: 'performance',
        action: 'performance_issue',
        metadata: {
          metric,
          value,
          threshold,
          ...context,
        },
      });
    }
  }

  // User feedback and experience issues
  trackUserFeedback(type: 'bug' | 'suggestion' | 'complaint', message: string, context?: Record<string, any>) {
    this.trackError(new Error(`User feedback (${type}): ${message}`), {
      component: 'user_feedback',
      action: 'user_feedback',
      metadata: {
        type,
        message,
        ...context,
      },
    });
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Utility functions for easier usage
export function trackError(error: Error | unknown, context?: ErrorContext) {
  errorTracker.trackError(error, context);
}

export function trackBookingError(error: Error | unknown, step: string | number, context?: Record<string, any>) {
  errorTracker.trackBookingError(error, step, context);
}

export function trackPaymentError(error: Error | unknown, paymentMethod?: string, context?: Record<string, any>) {
  errorTracker.trackPaymentError(error, paymentMethod, context);
}

export function trackApiError(error: Error | unknown, endpoint: string, method?: string, context?: Record<string, any>) {
  errorTracker.trackApiError(error, endpoint, method, context);
}

export function trackFormError(error: Error | unknown, formName: string, fieldName?: string, context?: Record<string, any>) {
  errorTracker.trackFormError(error, formName, fieldName, context);
}

export function setUserId(userId: string) {
  errorTracker.setUserId(userId);
}

// React hook for error tracking
export function useErrorTracking(component: string) {
  return {
    trackError: (error: Error | unknown, action?: string, metadata?: Record<string, any>) => {
      errorTracker.trackError(error, { component, action, metadata });
    },
    trackBookingError: (error: Error | unknown, step: string | number, metadata?: Record<string, any>) => {
      errorTracker.trackBookingError(error, step, { component, ...metadata });
    },
    trackFormError: (error: Error | unknown, fieldName?: string, metadata?: Record<string, any>) => {
      errorTracker.trackFormError(error, component, fieldName, metadata);
    },
  };
}