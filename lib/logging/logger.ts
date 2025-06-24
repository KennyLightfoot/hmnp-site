/**
 * Comprehensive Logging System for HMNP Application
 * Provides structured logging with different levels and monitoring integration
 */

import winston from 'winston';

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

/**
 * Enhanced Logger Class with Multiple Transport Support
 */
class EnhancedLogger {
  private winston: winston.Logger;
  private requestId: string = '';
  private context: Record<string, any> = {};

  constructor() {
    const transports: winston.transport[] = [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
          winston.format.colorize({ all: true })
        )
      })
    ];

    // File transports for production
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        })
      );
    }

    // Better Stack integration (recommended free option)
    if (process.env.BETTER_STACK_SOURCE_TOKEN) {
      // Better Stack uses a simple HTTP endpoint
      const betterStackTransport = new winston.transports.Http({
        host: 'in.logs.betterstack.com',
        port: 443,
        path: `/sources/${process.env.BETTER_STACK_SOURCE_TOKEN}/entries`,
        ssl: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      });
      transports.push(betterStackTransport);
    }

    // Generic HTTP transport for other logging services
    if (process.env.LOGGING_ENDPOINT && process.env.LOGGING_API_KEY) {
      const httpTransport = new winston.transports.Http({
        host: process.env.LOGGING_ENDPOINT,
        port: 443,
        ssl: true,
        headers: {
          'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`,
          'Content-Type': 'application/json'
        },
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      });
      transports.push(httpTransport);
    }

    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
      exitOnError: false
    });
  }

  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  getRequestId(): string {
    return this.requestId;
  }

  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
  }

  private formatLogEntry(
    level: string,
    message: string,
    service: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO,
      message,
      service,
      requestId: this.requestId,
      metadata: {
        ...this.context,
        ...metadata
      }
    };
  }

  debug(message: string, service: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLogEntry('debug', message, service, metadata);
    this.winston.debug(logEntry);
  }

  info(message: string, service: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLogEntry('info', message, service, metadata);
    this.winston.info(logEntry);
  }

  warn(message: string, service: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLogEntry('warn', message, service, metadata);
    this.winston.warn(logEntry);
  }

  error(message: string, service: string, error?: Error, metadata?: Record<string, any>): void {
    const logEntry = this.formatLogEntry('error', message, service, metadata);
    
    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    this.winston.error(logEntry);
  }

  critical(message: string, service: string, error?: Error, metadata?: Record<string, any>): void {
    const logEntry = this.formatLogEntry('error', message, service, metadata);
    logEntry.level = LogLevel.CRITICAL;
    
    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      };
    }

    this.winston.error(logEntry);

    // Send alert for critical errors
    this.sendAlert({
      severity: 'CRITICAL',
      title: 'Critical Error Occurred',
      message,
      service,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  private async sendAlert(alert: MonitoringAlert): Promise<void> {
    try {
      // You can integrate with your preferred alerting service here
      // For now, we'll just log it as a critical entry
      this.winston.error({
        type: 'MONITORING_ALERT',
        alert,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send monitoring alert:', error);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; transports: string[] }> {
    const transportNames = this.winston.transports.map(t => t.constructor.name);
    
    return {
      status: 'healthy',
      transports: transportNames
    };
  }
}

// Export singleton instance
export const logger = new EnhancedLogger();

// Helper function to generate request IDs
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}