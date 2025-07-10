/**
 * Simple Logging System for HMNP Application
 * Provides structured logging with console output (Vercel-compatible)
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

/**
 * Simple Logger Class with Console Output (Vercel-compatible)
 */
class SimpleLogger {
  private requestId: string = '';
  private context: Record<string, any> = {};

  constructor() {
    // Simple console-based logging for Vercel compatibility
  }

  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  clearRequestId(): void {
    this.requestId = '';
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
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatLogEntry('debug', message, service, metadata);
      console.debug(`[DEBUG] ${service}:`, message, metadata || '');
    }
  }

  info(message: string, service: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLogEntry('info', message, service, metadata);
    console.info(`[INFO] ${service}:`, message, metadata || '');
  }

  warn(message: string, service: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLogEntry('warn', message, service, metadata);
    console.warn(`[WARN] ${service}:`, message, metadata || '');
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
      console.error(`[ERROR] ${service}:`, message, error, metadata || '');
    } else {
      console.error(`[ERROR] ${service}:`, message, metadata || '');
    }
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
      console.error(`[CRITICAL] ${service}:`, message, error, metadata || '');
    } else {
      console.error(`[CRITICAL] ${service}:`, message, metadata || '');
    }

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
      // Simple console alert for critical issues
      console.error('[ALERT]', alert);
    } catch (error) {
      console.error('Failed to send monitoring alert:', error);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; transports: string[] }> {
    return {
      status: 'healthy',
      transports: ['console']
    };
  }
}

// Export singleton instance
export const logger = new SimpleLogger();

// Helper function to generate request IDs
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}