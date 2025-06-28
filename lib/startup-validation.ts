/**
 * Startup Validation System
 * Comprehensive validation of environment, database, and security configuration
 * Ensures application is ready for production deployment
 */

import { validateEnvironmentOrThrow, ENV_VALIDATION } from './env-validation';
import { EnvironmentSecurity } from './security/environment-security';
import { Logger } from './logger';
import { prisma } from './db';

const logger = new Logger('StartupValidation');

export interface StartupValidationResult {
  success: boolean;
  environment: {
    valid: boolean;
    warnings: string[];
  };
  security: {
    score: number;
    isSecure: boolean;
    criticalIssues: number;
  };
  database: {
    connected: boolean;
    migrationStatus: 'up-to-date' | 'pending' | 'error';
  };
  services: {
    redis: boolean;
    s3: boolean;
    stripe: boolean;
    email: boolean;
  };
  readinessLevel: 'production' | 'staging' | 'development' | 'unsafe';
}

export class StartupValidator {
  
  /**
   * Run comprehensive startup validation
   */
  static async validateStartup(): Promise<StartupValidationResult> {
    logger.info('Starting comprehensive startup validation...');
    
    const result: StartupValidationResult = {
      success: false,
      environment: { valid: false, warnings: [] },
      security: { score: 0, isSecure: false, criticalIssues: 0 },
      database: { connected: false, migrationStatus: 'error' },
      services: { redis: false, s3: false, stripe: false, email: false },
      readinessLevel: 'unsafe',
    };

    try {
      // 1. Validate Environment Variables
      result.environment = await this.validateEnvironmentConfiguration();
      
      // 2. Security Validation
      result.security = this.validateSecurityConfiguration();
      
      // 3. Database Connectivity and Migration Status
      result.database = await this.validateDatabaseConfiguration();
      
      // 4. External Service Connectivity
      result.services = await this.validateServiceConnectivity();
      
      // 5. Determine Overall Readiness
      result.readinessLevel = this.determineReadinessLevel(result);
      result.success = result.readinessLevel !== 'unsafe';
      
      // Log results
      this.logValidationResults(result);
      
      return result;
      
    } catch (error) {
      logger.error('Startup validation failed with exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return {
        ...result,
        success: false,
        readinessLevel: 'unsafe',
      };
    }
  }

  /**
   * Validate environment configuration
   */
  private static async validateEnvironmentConfiguration(): Promise<{
    valid: boolean;
    warnings: string[];
  }> {
    try {
      const envResult = ENV_VALIDATION;
      
      if (!envResult.success) {
        logger.error('Environment validation failed', {
          errors: envResult.errors,
        });
        return { valid: false, warnings: [] };
      }
      
      return {
        valid: true,
        warnings: envResult.warnings || [],
      };
      
    } catch (error) {
      logger.error('Environment validation error', { error });
      return { valid: false, warnings: [] };
    }
  }

  /**
   * Validate security configuration
   */
  private static validateSecurityConfiguration(): {
    score: number;
    isSecure: boolean;
    criticalIssues: number;
  } {
    try {
      const securityResult = EnvironmentSecurity.validateSecurityConfiguration();
      
      const criticalIssues = securityResult.vulnerabilities.filter(
        v => v.severity === 'critical'
      ).length;
      
      if (criticalIssues > 0) {
        logger.error('Critical security vulnerabilities detected', {
          criticalVulnerabilities: securityResult.vulnerabilities.filter(v => v.severity === 'critical'),
        });
      }
      
      return {
        score: securityResult.securityScore,
        isSecure: securityResult.isSecure,
        criticalIssues,
      };
      
    } catch (error) {
      logger.error('Security validation error', { error });
      return { score: 0, isSecure: false, criticalIssues: 1 };
    }
  }

  /**
   * Validate database configuration
   */
  private static async validateDatabaseConfiguration(): Promise<{
    connected: boolean;
    migrationStatus: 'up-to-date' | 'pending' | 'error';
  }> {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection successful');
      
      // Check migration status (simplified check)
      try {
        // Try to query a recent table to verify migrations are up to date
        await prisma.document.findFirst();
        await prisma.documentAccess.findFirst();
        await prisma.documentAuditLog.findFirst();
        
        return {
          connected: true,
          migrationStatus: 'up-to-date',
        };
      } catch (migrationError) {
        logger.warn('Database migrations may be pending', {
          error: migrationError instanceof Error ? migrationError.message : 'Unknown error',
        });
        
        return {
          connected: true,
          migrationStatus: 'pending',
        };
      }
      
    } catch (error) {
      logger.error('Database connection failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        connected: false,
        migrationStatus: 'error',
      };
    }
  }

  /**
   * Validate external service connectivity
   */
  private static async validateServiceConnectivity(): Promise<{
    redis: boolean;
    s3: boolean;
    stripe: boolean;
    email: boolean;
  }> {
    const services = {
      redis: false,
      s3: false,
      stripe: false,
      email: false,
    };

    // Test Redis connectivity
    try {
      if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
        const { redis } = await import('./redis');
        await redis.ping();
        services.redis = true;
        logger.info('Redis connectivity verified');
      } else {
        logger.warn('Redis not configured');
      }
    } catch (error) {
      logger.error('Redis connectivity failed', { error });
    }

    // Test S3 connectivity
    try {
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        // Simple S3 connectivity test would go here
        // For now, just check if credentials are present
        services.s3 = true;
        logger.info('S3 credentials configured');
      } else {
        logger.warn('S3 not configured');
      }
    } catch (error) {
      logger.error('S3 connectivity test failed', { error });
    }

    // Test Stripe connectivity
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        // Simple Stripe API test
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.balance.retrieve();
        services.stripe = true;
        logger.info('Stripe connectivity verified');
      } else {
        logger.warn('Stripe not configured');
      }
    } catch (error) {
      logger.error('Stripe connectivity failed', { error });
    }

    // Test Email service
    try {
      if (process.env.RESEND_API_KEY) {
        // Simple email service test would go here
        services.email = true;
        logger.info('Email service configured');
      } else {
        logger.warn('Email service not configured');
      }
    } catch (error) {
      logger.error('Email service test failed', { error });
    }

    return services;
  }

  /**
   * Determine overall readiness level
   */
  private static determineReadinessLevel(result: StartupValidationResult): 
    'production' | 'staging' | 'development' | 'unsafe' {
    
    // Critical blocking issues
    if (!result.environment.valid || !result.database.connected || result.security.criticalIssues > 0) {
      return 'unsafe';
    }
    
    // Production readiness requirements
    if (
      result.security.score >= 85 &&
      result.database.migrationStatus === 'up-to-date' &&
      result.services.stripe &&
      result.services.redis &&
      process.env.NODE_ENV === 'production'
    ) {
      return 'production';
    }
    
    // Staging readiness
    if (
      result.security.score >= 70 &&
      result.database.migrationStatus === 'up-to-date' &&
      (result.services.stripe || process.env.NODE_ENV !== 'production')
    ) {
      return 'staging';
    }
    
    // Development readiness
    if (result.security.score >= 50 && result.database.connected) {
      return 'development';
    }
    
    return 'unsafe';
  }

  /**
   * Log validation results
   */
  private static logValidationResults(result: StartupValidationResult): void {
    const logLevel = result.success ? 'info' : 'error';
    const emoji = {
      'production': '🚀',
      'staging': '🎭', 
      'development': '🛠️',
      'unsafe': '🚨'
    }[result.readinessLevel];
    
    logger[logLevel](`${emoji} Startup validation completed - Readiness: ${result.readinessLevel.toUpperCase()}`, {
      success: result.success,
      readinessLevel: result.readinessLevel,
      environment: result.environment,
      security: result.security,
      database: result.database,
      services: result.services,
    });
    
    // Log specific warnings and recommendations
    if (result.environment.warnings.length > 0) {
      logger.warn('Environment warnings detected', {
        warnings: result.environment.warnings,
      });
    }
    
    if (result.readinessLevel === 'unsafe') {
      logger.error('APPLICATION IS NOT SAFE TO DEPLOY', {
        reasons: this.getUnsafeReasons(result),
      });
    }
  }

  /**
   * Get reasons why application is marked as unsafe
   */
  private static getUnsafeReasons(result: StartupValidationResult): string[] {
    const reasons: string[] = [];
    
    if (!result.environment.valid) {
      reasons.push('Environment validation failed');
    }
    
    if (!result.database.connected) {
      reasons.push('Database connection failed');
    }
    
    if (result.security.criticalIssues > 0) {
      reasons.push(`${result.security.criticalIssues} critical security vulnerabilities`);
    }
    
    if (result.security.score < 50) {
      reasons.push(`Security score too low: ${result.security.score}/100`);
    }
    
    return reasons;
  }

  /**
   * Validate startup configuration and throw if not ready
   */
  static async validateStartupOrThrow(): Promise<void> {
    const result = await this.validateStartup();
    
    if (!result.success) {
      const reasons = this.getUnsafeReasons(result);
      throw new Error(`Application startup validation failed: ${reasons.join(', ')}`);
    }
    
    logger.info('✅ Startup validation passed - Application ready to serve requests');
  }

  /**
   * Get startup health summary for health check endpoints
   */
  static async getHealthSummary(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    readinessLevel: string;
    uptime: number;
    services: Record<string, boolean>;
  }> {
    try {
      const result = await this.validateStartup();
      
      return {
        status: result.success ? 
          (result.readinessLevel === 'production' ? 'healthy' : 'degraded') : 
          'unhealthy',
        readinessLevel: result.readinessLevel,
        uptime: process.uptime(),
        services: result.services,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        readinessLevel: 'unsafe',
        uptime: process.uptime(),
        services: { redis: false, s3: false, stripe: false, email: false },
      };
    }
  }
}

export default StartupValidator;