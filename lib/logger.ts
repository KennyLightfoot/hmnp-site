/**
 * Comprehensive Logging System for HMNP Application
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
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private currentLogLevel: LogLevel;
  private requestId: string | null = null;

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

  private writeLog(entry: LogEntry) {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    const prefix = `[${timestamp}] [${levelName}] [${entry.service}]`;
    
    let logMessage = `${prefix} ${entry.message}`;
    
    if (entry.requestId) {
      logMessage += ` (RequestID: ${entry.requestId})`;
    }

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
  }

  info(message: string, service: string, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata
      };
      this.writeLog(entry);
    }
  }

  error(message: string, service: string, error?: Error, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      };
      this.writeLog(entry);
    }
  }

  warn(message: string, service: string, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata
      };
      this.writeLog(entry);
    }
  }

  debug(message: string, service: string, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata
      };
      this.writeLog(entry);
    }
  }

  critical(message: string, service: string, error?: Error, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.CRITICAL,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      };
      this.writeLog(entry);
    }
  }
}

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

// Request ID utilities
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
