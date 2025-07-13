/**
 * 🪵 Logger Utility
 * Houston Mobile Notary Pros
 * 
 * Provides environment-aware logging to reduce console noise in production
 * while maintaining debug capabilities in development.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogConfig {
  enableInProduction: boolean;
  enableInDevelopment: boolean;
  prefix?: string;
}

const DEFAULT_CONFIG: LogConfig = {
  enableInProduction: false,
  enableInDevelopment: true,
  prefix: ''
};

class Logger {
  protected config: LogConfig;
  private isDevelopment: boolean;

  constructor(config: Partial<LogConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(): boolean {
    return this.isDevelopment 
      ? this.config.enableInDevelopment 
      : this.config.enableInProduction;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): [string, ...any[]] {
    const prefix = this.config.prefix ? `${this.config.prefix} ` : '';
    const timestamp = new Date().toISOString();
    
    if (this.isDevelopment) {
      // Rich formatting for development
      return [`${prefix}${message}`, ...args];
    } else {
      // Structured logging for production
      return [`[${timestamp}] ${level.toUpperCase()}: ${prefix}${message}`, ...args];
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('info', message, ...args);
      console.log(formattedMessage, ...formattedArgs);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('warn', message, ...args);
      console.warn(formattedMessage, ...formattedArgs);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('error', message, ...args);
      console.error(formattedMessage, ...formattedArgs);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('debug', message, ...args);
      console.debug(formattedMessage, ...formattedArgs);
    }
  }

  // Convenience method for performance logs
  perf(message: string, data?: any): void {
    if (this.shouldLog()) {
      const perfData = data ? ` | ${JSON.stringify(data)}` : '';
      this.info(`⚡ ${message}${perfData}`);
    }
  }

  // Convenience method for optimization logs
  optimization(message: string, data?: any): void {
    if (this.shouldLog()) {
      const optData = data ? ` | ${JSON.stringify(data)}` : '';
      this.info(`🔧 ${message}${optData}`);
    }
  }

  // Convenience method for metrics logs
  metrics(message: string, data?: any): void {
    if (this.shouldLog()) {
      const metricData = data ? ` | ${JSON.stringify(data)}` : '';
      this.info(`📊 ${message}${metricData}`);
    }
  }

  // Public method to update configuration
  updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// =============================================================================
// 🎯 LOGGER INSTANCES
// =============================================================================

// Default logger - silent in production
export const logger = new Logger();

// Performance logger - can be enabled in production for monitoring
export const perfLogger = new Logger({
  enableInProduction: false, // Set to true if you want perf logs in production
  enableInDevelopment: true,
  prefix: '⚡'
});

// Error logger - always enabled
export const errorLogger = new Logger({
  enableInProduction: true,
  enableInDevelopment: true,
  prefix: '❌'
});

// Debug logger - development only
export const debugLogger = new Logger({
  enableInProduction: false,
  enableInDevelopment: true,
  prefix: '🐛'
});

// =============================================================================
// 🚀 CONVENIENCE FUNCTIONS
// =============================================================================

// Legacy console.log replacement
export const log = (...args: any[]) => logger.info(args.join(' '));

// Development-only logging
export const devLog = (...args: any[]) => debugLogger.info(args.join(' '));

// Production-safe performance logging
export const perfLog = (message: string, data?: any) => perfLogger.perf(message, data);

// Always log errors
export const errorLog = (message: string, error?: any) => errorLogger.error(message, error);

// Conditional logging based on environment
export const conditionalLog = (condition: boolean, message: string, ...args: any[]) => {
  if (condition) {
    logger.info(message, ...args);
  }
};

// =============================================================================
// 🎛️ CONFIGURATION HELPERS
// =============================================================================

export function configureLogging(config: {
  enablePerformanceLogsInProduction?: boolean;
  enableDebugLogsInProduction?: boolean;
}) {
  if (config.enablePerformanceLogsInProduction !== undefined) {
    perfLogger.updateConfig({ enableInProduction: config.enablePerformanceLogsInProduction });
  }
  
  if (config.enableDebugLogsInProduction !== undefined) {
    debugLogger.updateConfig({ enableInProduction: config.enableDebugLogsInProduction });
  }
}

// Export types for external use
export type { LogLevel, LogConfig };
export { Logger }; 