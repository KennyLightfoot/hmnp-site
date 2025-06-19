/**
 * Comprehensive Logging System for HMNP Application
 * Provides structured logging with different levels and monitoring integration
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  bookingId?: string;
  contactId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface MonitoringAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  service: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class Logger {
  private currentLogLevel: LogLevel;
  private requestId: string | null = null;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;

  constructor() {
    this.currentLogLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase();
    switch (level) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      case 'critical': return LogLevel.CRITICAL;
      default: return LogLevel.INFO;
    }
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  clearRequestId() {
    this.requestId = null;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    service: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service,
      requestId: this.requestId || undefined,
      metadata
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    return entry;
  }

  private writeLog(entry: LogEntry) {
    // Add to buffer for potential monitoring
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Remove oldest entry
    }

    // Format for console output
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const prefix = `[${timestamp}] [${levelName}] [${entry.service}]`;
    
    let logMessage = `${prefix} ${entry.message}`;
    
    if (entry.requestId) {
      logMessage += ` (RequestID: ${entry.requestId})`;
    }

    // Console output based on level
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logMessage, entry.metadata, entry.error);
        break;
    }

    // In production, you would also send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(entry);
    }
  }

  private async sendToExternalLogger(entry: LogEntry) {
    // Placeholder for external logging service integration
    // Examples: Winston, Datadog, Sentry, CloudWatch, etc.
    try {
      // Example for Sentry
      if (entry.level >= LogLevel.ERROR && process.env.SENTRY_DSN) {
        // Sentry integration would go here
      }
      
      // Example for custom webhook
      if (process.env.LOGGING_WEBHOOK_URL) {
        // Send to webhook
      }
    } catch (error) {
      // Don't let logging errors break the application
      console.error('Failed to send log to external service:', error);
    }
  }

  debug(message: string, service: string, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, service, metadata);
      this.writeLog(entry);
    }
  }

  info(message: string, service: string, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, service, metadata);
      this.writeLog(entry);
    }
  }

  warn(message: string, service: string, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, service, metadata);
      this.writeLog(entry);
    }
  }

  error(message: string, service: string, error?: Error, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, service, metadata, error);
      this.writeLog(entry);
      
      // Send monitoring alert for errors
      this.sendMonitoringAlert({
        severity: 'HIGH',
        title: 'Application Error',
        message,
        service,
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, error: error?.message }
      });
    }
  }

  critical(message: string, service: string, error?: Error, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      const entry = this.createLogEntry(LogLevel.CRITICAL, message, service, metadata, error);
      this.writeLog(entry);
      
      // Send critical monitoring alert
      this.sendMonitoringAlert({
        severity: 'CRITICAL',
        title: 'Critical System Error',
        message,
        service,
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, error: error?.message }
      });
    }
  }

  private async sendMonitoringAlert(alert: MonitoringAlert) {
    try {
      // In production, integrate with monitoring services
      if (process.env.NODE_ENV === 'production') {
        
        // Example: Send to Slack webhook for critical alerts
        if (alert.severity === 'CRITICAL' && process.env.SLACK_WEBHOOK_URL) {
          await this.sendSlackAlert(alert);
        }
        
        // Example: Send to email for high severity
        if (['HIGH', 'CRITICAL'].includes(alert.severity) && process.env.ADMIN_EMAIL) {
          await this.sendEmailAlert(alert);
        }
      } else {
        // Development: Just log to console
        console.warn('🚨 MONITORING ALERT:', alert);
      }
    } catch (error) {
      console.error('Failed to send monitoring alert:', error);
    }
  }

  private async sendSlackAlert(alert: MonitoringAlert) {
    // Placeholder for Slack integration
    const slackPayload = {
      text: `🚨 ${alert.title}`,
      attachments: [{
        color: alert.severity === 'CRITICAL' ? 'danger' : 'warning',
        fields: [
          { title: 'Service', value: alert.service, short: true },
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Message', value: alert.message, short: false },
          { title: 'Time', value: alert.timestamp, short: true }
        ]
      }]
    };

    // Would send to Slack webhook here
    console.log('Slack alert payload:', slackPayload);
  }

  private async sendEmailAlert(alert: MonitoringAlert) {
    // Placeholder for email integration
    console.log('Email alert would be sent:', alert);
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel, count = 50): LogEntry[] {
    return this.logBuffer
      .filter(log => log.level === level)
      .slice(-count);
  }

  // Get error logs for monitoring dashboard
  getErrorLogs(since?: Date): LogEntry[] {
    const sinceTime = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    return this.logBuffer.filter(log => 
      log.level >= LogLevel.ERROR && 
      new Date(log.timestamp) >= sinceTime
    );
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Convenience functions for common use cases
export const logGHLRequest = (endpoint: string, method: string, metadata?: Record<string, any>) => {
  logger.info(`GHL API Request: ${method} ${endpoint}`, 'GHL_API', metadata);
};

export const logGHLResponse = (endpoint: string, success: boolean, metadata?: Record<string, any>) => {
  if (success) {
    logger.info(`GHL API Response: Success ${endpoint}`, 'GHL_API', metadata);
  } else {
    logger.error(`GHL API Response: Failed ${endpoint}`, 'GHL_API', undefined, metadata);
  }
};

export const logBookingEvent = (event: string, bookingId: string, metadata?: Record<string, any>) => {
  logger.info(`Booking Event: ${event}`, 'BOOKING', { bookingId, ...metadata });
};

export const logPaymentEvent = (event: string, paymentId: string, metadata?: Record<string, any>) => {
  logger.info(`Payment Event: ${event}`, 'PAYMENT', { paymentId, ...metadata });
};

export const logWebhookReceived = (source: string, event: string, metadata?: Record<string, any>) => {
  logger.info(`Webhook Received: ${source} - ${event}`, 'WEBHOOK', metadata);
};

export const logSecurityEvent = (event: string, metadata?: Record<string, any>) => {
  logger.warn(`Security Event: ${event}`, 'SECURITY', metadata);
};

// Request ID middleware helper
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const withRequestId = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    const requestId = generateRequestId();
    logger.setRequestId(requestId);
    
    try {
      const result = await fn(...args);
      return result;
    } finally {
      logger.clearRequestId();
    }
  };
}; 