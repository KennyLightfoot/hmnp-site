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

// Service detection from call stack for better UX
function detectServiceFromCallStack(): string {
  const stack = new Error().stack || '';
  const stackLines = stack.split('\n');
  
  // Look for recognizable patterns in the call stack
  for (const line of stackLines) {
    if (line.includes('/api/')) {
      const match = line.match(/\/api\/([^\/]+)/);
      if (match) return `API_${match[1].toUpperCase()}`;
    }
    if (line.includes('/lib/')) {
      const match = line.match(/\/lib\/([^\/]+)/);
      if (match) return match[1].toUpperCase().replace(/\.(ts|js)$/, '');
    }
    if (line.includes('bullmq')) return 'BULLMQ';
    if (line.includes('queue')) return 'QUEUE';
    if (line.includes('scheduler')) return 'SCHEDULER';
    if (line.includes('notification')) return 'NOTIFICATION';
    if (line.includes('booking')) return 'BOOKING';
    if (line.includes('payment')) return 'PAYMENT';
    if (line.includes('ghl')) return 'GHL';
  }
  
  return 'APP';
}

class Logger {
  private currentLogLevel: LogLevel;
  private requestId: string | null = null;
  private defaultService: string | null = null;

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

  /**
   * Set a default service for this logger instance
   * Useful for creating service-specific loggers
   */
  setDefaultService(service: string) {
    this.defaultService = service;
  }

  /**
   * Create a service-specific logger instance
   */
  forService(service: string): Logger {
    const serviceLogger = new Logger();
    serviceLogger.setDefaultService(service);
    serviceLogger.requestId = this.requestId;
    return serviceLogger;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private resolveService(providedService?: string): string {
    if (providedService) return providedService;
    if (this.defaultService) return this.defaultService;
    return detectServiceFromCallStack();
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

  // Flexible method signatures for better DX
  info(message: string, serviceOrMetadata?: string | Record<string, any>, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.INFO)) {
      let service: string;
      let actualMetadata: Record<string, any> | undefined;

      if (typeof serviceOrMetadata === 'string') {
        service = serviceOrMetadata;
        actualMetadata = metadata;
      } else {
        service = this.resolveService();
        actualMetadata = serviceOrMetadata;
      }

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata: actualMetadata
      };
      this.writeLog(entry);
    }
  }

  error(message: string, serviceOrError?: string | Error | Record<string, any>, errorOrMetadata?: Error | string | Record<string, any>, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.ERROR)) {
      let service: string;
      let actualError: Error | undefined;
      let actualMetadata: Record<string, any> | undefined;

      // Handle different parameter combinations
      if (typeof serviceOrError === 'string') {
        // Case: error(message, service, error?, metadata?)
        service = serviceOrError;
        if (errorOrMetadata instanceof Error) {
          actualError = errorOrMetadata;
          actualMetadata = metadata;
        } else if (typeof errorOrMetadata === 'string') {
          actualError = new Error(errorOrMetadata);
          actualMetadata = metadata;
        } else {
          actualMetadata = errorOrMetadata;
        }
      } else {
        // Case: error(message, error?) or error(message, metadata?)
        service = this.resolveService();
        if (serviceOrError instanceof Error) {
          actualError = serviceOrError;
        } else if (typeof serviceOrError === 'string') {
          actualError = new Error(serviceOrError);
        } else {
          actualMetadata = serviceOrError;
        }
      }

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata: actualMetadata,
        error: actualError ? {
          name: actualError.name,
          message: actualError.message,
          stack: actualError.stack
        } : undefined
      };
      this.writeLog(entry);
    }
  }

  warn(message: string, serviceOrMetadata?: string | Record<string, any>, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.WARN)) {
      let service: string;
      let actualMetadata: Record<string, any> | undefined;

      if (typeof serviceOrMetadata === 'string') {
        service = serviceOrMetadata;
        actualMetadata = metadata;
      } else {
        service = this.resolveService();
        actualMetadata = serviceOrMetadata;
      }

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata: actualMetadata
      };
      this.writeLog(entry);
    }
  }

  debug(message: string, serviceOrMetadata?: string | Record<string, any>, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      let service: string;
      let actualMetadata: Record<string, any> | undefined;

      if (typeof serviceOrMetadata === 'string') {
        service = serviceOrMetadata;
        actualMetadata = metadata;
      } else {
        service = this.resolveService();
        actualMetadata = serviceOrMetadata;
      }

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata: actualMetadata
      };
      this.writeLog(entry);
    }
  }

  critical(message: string, serviceOrError?: string | Error, errorOrMetadata?: Error | Record<string, any>, metadata?: Record<string, any>) {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      let service: string;
      let actualError: Error | undefined;
      let actualMetadata: Record<string, any> | undefined;

      if (typeof serviceOrError === 'string') {
        service = serviceOrError;
        if (errorOrMetadata instanceof Error) {
          actualError = errorOrMetadata;
          actualMetadata = metadata;
        } else {
          actualMetadata = errorOrMetadata;
        }
      } else {
        service = this.resolveService();
        if (serviceOrError instanceof Error) {
          actualError = serviceOrError;
        }
      }

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.CRITICAL,
        message,
        service,
        requestId: this.requestId || undefined,
        metadata: actualMetadata,
        error: actualError ? {
          name: actualError.name,
          message: actualError.message,
          stack: actualError.stack
        } : undefined
      };
      this.writeLog(entry);
    }
  }
}

export const logger = new Logger();

// Create service-specific loggers for better organization
export const ghlLogger = logger.forService('GHL');
export const queueLogger = logger.forService('QUEUE');
export const bookingLogger = logger.forService('BOOKING');
export const paymentLogger = logger.forService('PAYMENT');
export const authLogger = logger.forService('AUTH');
export const apiLogger = logger.forService('API');

// Convenience functions for common use cases
export const logGHLRequest = (endpoint: string, method: string, metadata?: Record<string, any>) => {
  ghlLogger.info(`GHL API Request: ${method} ${endpoint}`, metadata);
};

export const logGHLResponse = (endpoint: string, success: boolean, metadata?: Record<string, any>) => {
  if (success) {
    ghlLogger.info(`GHL API Response: Success ${endpoint}`, metadata);
  } else {
    ghlLogger.error(`GHL API Response: Failed ${endpoint}`, undefined, metadata);
  }
};

export const logBookingEvent = (event: string, bookingId: string, metadata?: Record<string, any>) => {
  bookingLogger.info(`Booking Event: ${event}`, { bookingId, ...metadata });
};

export const logPaymentEvent = (event: string, paymentId: string, metadata?: Record<string, any>) => {
  paymentLogger.info(`Payment Event: ${event}`, { paymentId, ...metadata });
};

export const logWebhookReceived = (source: string, event: string, metadata?: Record<string, any>) => {
  apiLogger.info(`Webhook Received: ${source} - ${event}`, metadata);
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
