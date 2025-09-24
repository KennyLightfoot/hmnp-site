import * as Sentry from '@sentry/nextjs';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from '@/lib/logger';

/**
 * Production Monitoring & Alerting System
 * 
 * Provides business-critical monitoring for:
 * - Payment failures and successes
 * - Booking flow completion rates
 * - API performance and errors
 * - User engagement metrics
 * - System health alerts
 */

export interface BusinessEvent {
  event: string;
  userId?: string;
  bookingId?: string;
  amount?: number;
  service?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: 'ms' | 'count' | 'percentage' | 'bytes';
  tags?: Record<string, string>;
}

export interface AlertData {
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  context?: Record<string, any>;
  notifyEmail?: boolean;
  notifySlack?: boolean;
}

class MonitoringService {
  private static instance: MonitoringService;
  private isProduction = process.env.NODE_ENV === 'production';

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Track critical business events
   */
  public trackBusinessEvent(event: BusinessEvent): void {
    const eventData = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    // Log for analytics
    logger.info('Business Event', eventData);

    // Send to Sentry for monitoring
    if (this.isProduction) {
      Sentry.addBreadcrumb({
        message: `Business Event: ${event.event}`,
        level: 'info',
        data: eventData,
      });

      // Add custom tags for filtering in Sentry
      Sentry.setTag('business_event', event.event);
      if (event.userId) Sentry.setTag('user_id', event.userId);
      if (event.service) Sentry.setTag('service_type', event.service);
    }

    // Track specific critical events
    this.handleCriticalEvents(eventData);
  }

  /**
   * Track payment events specifically
   */
  public trackPaymentEvent(
    type: 'payment_initiated' | 'payment_success' | 'payment_failed' | 'payment_refunded',
    data: {
      bookingId: string;
      amount: number;
      paymentMethod?: string;
      errorCode?: string;
      errorMessage?: string;
      userId?: string;
    }
  ): void {
    this.trackBusinessEvent({
      event: type,
      bookingId: data.bookingId,
      userId: data.userId,
      amount: data.amount,
      metadata: {
        paymentMethod: data.paymentMethod,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      },
    });

    // Send alert for payment failures
    if (type === 'payment_failed') {
      this.sendAlert({
        level: 'error',
        title: 'Payment Failed',
        message: `Payment failed for booking ${data.bookingId}: ${data.errorMessage}`,
        context: data,
        notifyEmail: true,
      });
    }
  }

  /**
   * Track booking flow completion
   */
  public trackBookingFunnel(
    stage: 'booking_started' | 'service_selected' | 'details_filled' | 'payment_reached' | 'booking_completed',
    data: {
      sessionId?: string;
      userId?: string;
      serviceType?: string;
      dropoffReason?: string;
    }
  ): void {
    this.trackBusinessEvent({
      event: `funnel_${stage}`,
      userId: data.userId,
      service: data.serviceType,
      metadata: {
        sessionId: data.sessionId,
        dropoffReason: data.dropoffReason,
      },
    });
  }

  /**
   * Track API performance metrics
   */
  public trackPerformance(metric: PerformanceMetric): void {
    logger.info('Performance Metric', metric);

    if (this.isProduction) {
      // Send to Sentry as a custom metric
      Sentry.addBreadcrumb({
        message: `Performance: ${metric.metric}`,
        level: 'info',
        data: metric,
      });

      // Alert on slow API responses
      if (metric.metric === 'api_response_time' && metric.value > 5000) {
        this.sendAlert({
          level: 'warning',
          title: 'Slow API Response',
          message: `API response time: ${metric.value}ms exceeds threshold`,
          context: metric,
        });
      }
    }
  }

  /**
   * Track user engagement
   */
  public trackUserEngagement(
    action: 'page_view' | 'button_click' | 'form_submit' | 'service_view' | 'quote_requested',
    data: {
      userId?: string;
      page?: string;
      element?: string;
      value?: string;
    }
  ): void {
    this.trackBusinessEvent({
      event: `engagement_${action}`,
      userId: data.userId,
      metadata: data,
    });
  }

  /**
   * Track HTTP request performance
   */
  public trackHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    logger.info('HTTP Request', { method, route, statusCode, duration });

    if (this.isProduction) {
      Sentry.addBreadcrumb({
        message: `HTTP ${method} ${route}`,
        level: 'info',
        data: { statusCode, duration },
      });

      if (duration > 5000) {
        this.sendAlert({
          level: 'warning',
          title: 'Slow HTTP Request',
          message: `${method} ${route} took ${duration}ms`,
          context: { method, route, statusCode, duration },
        });
      }
    }
  }

  /**
   * Track database query performance
   */
  public trackDatabaseQuery(
    operation: string,
    table: string,
    duration: number
  ): void {
    logger.info('Database Query', { operation, table, duration });

    if (this.isProduction) {
      Sentry.addBreadcrumb({
        message: `DB ${operation} ${table}`,
        level: 'info',
        data: { operation, table, duration },
      });

      if (duration > 1000) {
        this.sendAlert({
          level: 'warning',
          title: 'Slow Database Query',
          message: `${operation} on ${table} took ${duration}ms`,
          context: { operation, table, duration },
        });
      }
    }
  }

  /**
   * Track booking metrics
   */
  public trackBooking(status: string, serviceType: string): void {
    logger.info('Booking Metric', { status, serviceType });

    if (this.isProduction) {
      Sentry.addBreadcrumb({
        message: `Booking ${status}`,
        level: 'info',
        data: { serviceType },
      });
    }
  }

  /**
   * Track application errors
   */
  public trackError(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    logger.error('Application Error', { type, severity });

    if (this.isProduction && (severity === 'high' || severity === 'critical')) {
      this.sendAlert({
        level: severity === 'critical' ? 'critical' : 'error',
        title: `${severity.toUpperCase()} Error Detected`,
        message: `Error type: ${type}`,
        context: { type, severity },
        notifyEmail: severity === 'critical',
      });
    }
  }

  /**
   * Get basic system health information
   */
  public async getSystemHealth() {
    try {
      const services = {
        database: 'ok',
        cache: 'ok',
      };

      const metrics = {
        memoryUsage: process.memoryUsage().heapUsed,
        uptime: process.uptime(),
      };

      return { services, metrics };
    } catch (error) {
      logger.error('Failed to get system health', error as Error);
      return { services: {}, metrics: {} };
    }
  }

  /**
   * Send production alerts
   */
  public sendAlert(alert: AlertData): void {
    const alertData = {
      ...alert,
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
    };

    const logMethod = alert.level === 'critical' ? 'error' : alert.level;
    (logger as any)[logMethod]('Production Alert', alertData);

    if (this.isProduction) {
      // Send to Sentry
      const sentryLevel = alert.level === 'critical' ? 'fatal' : alert.level;
      Sentry.captureMessage(alert.message, sentryLevel);

      // Add context to Sentry
      Sentry.setContext('alert', alertData);

      // TODO: Implement email/Slack notifications if needed
      if (alert.notifyEmail || alert.notifySlack) {
        this.sendExternalNotification(alertData);
      }
    }
  }

  /**
   * Track system health metrics
   */
  public trackSystemHealth(metrics: {
    dbConnectionTime?: number;
    redisConnectionTime?: number;
    memoryUsage?: number;
    activeConnections?: number;
    errorRate?: number;
  }): void {
    Object.entries(metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        this.trackPerformance({
          metric: `system_${key}`,
          value,
          unit: key.includes('time') ? 'ms' : 
                key.includes('memory') ? 'bytes' : 
                key.includes('rate') ? 'percentage' : 'count',
        });
      }
    });

    // Alert on high error rates
    if (metrics.errorRate && metrics.errorRate > 5) {
      this.sendAlert({
        level: 'error',
        title: 'High Error Rate',
        message: `Error rate: ${metrics.errorRate}% exceeds 5% threshold`,
        context: metrics,
        notifyEmail: true,
      });
    }

    // Alert on high memory usage
    if (metrics.memoryUsage && metrics.memoryUsage > 0.9) {
      this.sendAlert({
        level: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}% exceeds 90%`,
        context: metrics,
      });
    }
  }

  /**
   * Track GHL integration health
   */
  public trackGHLHealth(status: {
    apiCallSuccess: boolean;
    responseTime: number;
    operation: string;
    errorMessage?: string;
  }): void {
    this.trackPerformance({
      metric: 'ghl_api_response_time',
      value: status.responseTime,
      unit: 'ms',
      tags: {
        operation: status.operation,
        success: status.apiCallSuccess.toString(),
      },
    });

    if (!status.apiCallSuccess) {
      this.sendAlert({
        level: 'error',
        title: 'GHL Integration Error',
        message: `GHL ${status.operation} failed: ${status.errorMessage}`,
        context: status,
        notifyEmail: true,
      });
    }
  }

  /**
   * Handle critical business events that need immediate attention
   */
  private handleCriticalEvents(event: BusinessEvent & { timestamp: Date }): void {
    const criticalEvents = [
      'payment_failed',
      'booking_system_error',
      'database_connection_failed',
      'ghl_integration_failed',
      'stripe_webhook_failed',
    ];

    if (criticalEvents.includes(event.event)) {
      this.sendAlert({
        level: 'critical',
        title: `Critical Event: ${event.event}`,
        message: `Critical business event occurred: ${event.event}`,
        context: event,
        notifyEmail: true,
        notifySlack: true,
      });
    }
  }

  /**
   * Send external notifications (email/Slack)
   */
  private async sendExternalNotification(alert: AlertData & { timestamp: Date }): Promise<void> {
    try {
      // TODO: Implement actual email/Slack notification
      // This could integrate with services like:
      // - Resend for email notifications
      // - Slack webhooks for team notifications
      // - Discord webhooks
      // - SMS via Twilio for critical alerts

      logger.info('External notification would be sent', {
        alert: alert.title,
        level: alert.level,
        timestamp: alert.timestamp,
      });

      // For now, just ensure it's logged for manual monitoring
      if (alert.level === 'critical') {
        console.error('🚨 CRITICAL ALERT:', alert.title, alert.message);
      }
    } catch (error) {
      logger.error('Failed to send external notification', {
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
        alert: alert.title,
      });
    }
  }

  /**
   * Create a monitoring wrapper for API routes
   */
  public wrapApiRoute<T extends any[]>(
    routeName: string,
    handler: (...args: T) => Promise<any>
  ) {
    return async (...args: T) => {
      const startTime = Date.now();
      
      try {
        const result = await handler(...args);
        
        // Track successful API call
        this.trackPerformance({
          metric: 'api_response_time',
          value: Date.now() - startTime,
          unit: 'ms',
          tags: {
            route: routeName,
            status: 'success',
          },
        });

        return result;
      } catch (error) {
        // Track API error
        this.trackPerformance({
          metric: 'api_error',
          value: 1,
          unit: 'count',
          tags: {
            route: routeName,
            error: error instanceof Error ? error.name : 'UnknownError',
          },
        });

        this.sendAlert({
          level: 'error',
          title: `API Error: ${routeName}`,
          message: `API route ${routeName} failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`,
          context: {
            route: routeName,
            error: error instanceof Error ? error.stack : error,
            responseTime: Date.now() - startTime,
          },
        });

        throw error;
      }
    };
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Convenience functions for common use cases
export const trackPayment = monitoring.trackPaymentEvent.bind(monitoring);
export const trackBookingFunnel = monitoring.trackBookingFunnel.bind(monitoring);
export const trackPerformance = monitoring.trackPerformance.bind(monitoring);
export const trackUserEngagement = monitoring.trackUserEngagement.bind(monitoring);
export const sendAlert = monitoring.sendAlert.bind(monitoring);
export const wrapApiRoute = monitoring.wrapApiRoute.bind(monitoring);

// Initialize monitoring on import
if (typeof window === 'undefined') {
  // Server-side initialization
  logger.info('Monitoring system initialized', {
    environment: process.env.NODE_ENV,
    timestamp: new Date(),
  });
} 
