/**
 * Environment Variable Validation
 * Ensures all required environment variables are present at startup
 * Prevents runtime failures from missing configuration
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';

// Add build-time safety checks at the top
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                   process.env.NODE_ENV === undefined ||
                   typeof process === 'undefined' ||
                   process.env.NODE_ENV === 'production' && process.env.CI === 'true'

const shouldSkipValidation = process.env.SKIP_ENV_VALIDATION === 'true' || isBuildTime;

// Define required environment variables with enhanced validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),
  
  // NextAuth - Enhanced security validation
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters for security'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // Stripe - Enhanced validation
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
  
  // Go High Level
  GHL_LOCATION_ID: z.string().min(20, 'GHL_LOCATION_ID must be at least 20 characters'),
  GHL_API_KEY: z.string().optional(), // Legacy support
  GHL_PRIVATE_INTEGRATION_TOKEN: z.string().optional(),
  
  // Email (Resend)
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_').optional(),
  
  // SMS (Twilio) - Added for comprehensive validation
  TWILIO_ACCOUNT_SID: z.string().startsWith('AC', 'TWILIO_ACCOUNT_SID must start with AC').optional(),
  TWILIO_AUTH_TOKEN: z.string().min(32, 'TWILIO_AUTH_TOKEN must be at least 32 characters').optional(),
  TWILIO_PHONE_NUMBER: z.string().regex(/^\+1\d{10}$/, 'TWILIO_PHONE_NUMBER must be valid US number (+1xxxxxxxxxx)').optional(),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters').optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url('NEXT_PUBLIC_BASE_URL must be a valid URL').optional(),
});

// Optional environment variables (with defaults)
const optionalEnvSchema = z.object({
  // Redis/Queue
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  // Vertex / Google Cloud
  GOOGLE_PROJECT_ID: z.string().min(3).optional(),
  GOOGLE_REGION: z.string().min(2).optional(),
  VERTEX_MODEL_ID: z.string().optional(),
  VERTEX_RAG_CORPUS: z.string().optional(),
  VERTEX_CHAT_PROMPT_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  
  // Development
  ANALYZE: z.string().optional(),
  SKIP_ENV_VALIDATION: z.string().optional(),
});

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  env?: Record<string, any>;
}

/**
 * Check for security issues in environment configuration
 */
function checkSecurityConfiguration(): string[] {
  const warnings: string[] = [];
  
  // Check for weak secrets
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    warnings.push('NEXTAUTH_SECRET should be at least 32 characters long for security');
  }
  
  // Check for development keys in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
      warnings.push('⚠️ CRITICAL: Using test Stripe keys in production environment');
    }
    
    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      warnings.push('⚠️ CRITICAL: NEXTAUTH_URL points to localhost in production');
    }
    
    if (process.env.NEXT_PUBLIC_BASE_URL?.startsWith('http://')) {
      warnings.push('⚠️ SECURITY: Using HTTP instead of HTTPS in production');
    }
  }
  
  // Check for exposed secrets in client-side variables
  const clientVars = Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'));
  const sensitivePatterns = ['secret', 'key', 'token', 'password'];
  
  clientVars.forEach(varName => {
    if (sensitivePatterns.some(pattern => varName.toLowerCase().includes(pattern))) {
      warnings.push(`⚠️ SECURITY: Potentially sensitive data in client-side variable: ${varName}`);
    }
  });
  
  return warnings;
}

/**
 * Validate production-specific requirements
 */
function validateProductionRequirements(): string[] {
  const errors: string[] = [];
  
  if (process.env.NODE_ENV === 'production') {
    const criticalVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];
    // Vertex criticals in prod
    const vertexCriticals = [
      'GOOGLE_PROJECT_ID',
      'GOOGLE_REGION',
      'GOOGLE_SERVICE_ACCOUNT_JSON'
    ];
    
    criticalVars.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`❌ CRITICAL: ${varName} is required in production`);
      }
    });
    vertexCriticals.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`❌ CRITICAL: ${varName} is required for Vertex AI in production`);
      }
    });
  }
  
  return errors;
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): ValidationResult {
  if (shouldSkipValidation) {
    logger.info('Skipping environment validation (build time)', 'ENV_VALIDATION');
    return {
      success: true,
      errors: [],
      warnings: ['Skipped during build'],
      env: {}
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate required environment variables
    const requiredEnv = envSchema.parse(process.env);
    
    // Validate optional environment variables
    const optionalEnv = optionalEnvSchema.parse(process.env);
    
    // Check for GHL authentication method
    if (!requiredEnv.GHL_API_KEY && !requiredEnv.GHL_PRIVATE_INTEGRATION_TOKEN) {
      errors.push('Either GHL_API_KEY or GHL_PRIVATE_INTEGRATION_TOKEN must be provided');
    }
    
    // Warn about deprecated configurations
    if (requiredEnv.GHL_API_KEY && !requiredEnv.GHL_PRIVATE_INTEGRATION_TOKEN) {
      warnings.push('GHL_API_KEY is deprecated. Consider migrating to GHL_PRIVATE_INTEGRATION_TOKEN');
    }
    
    // Add production-specific validation
    const productionErrors = validateProductionRequirements();
    errors.push(...productionErrors);
    
    // Add security configuration checks
    const securityWarnings = checkSecurityConfiguration();
    warnings.push(...securityWarnings);
    
    // Warn about missing optional but recommended variables
    if (!requiredEnv.RESEND_API_KEY) {
      warnings.push('RESEND_API_KEY not set - email functionality may be limited');
    }
    
    if (!optionalEnv.GOOGLE_MAPS_API_KEY) {
      warnings.push('GOOGLE_MAPS_API_KEY not set - geocoding functionality disabled');
    }
    
    if (!optionalEnv.REDIS_URL && !optionalEnv.UPSTASH_REDIS_REST_URL) {
      warnings.push('No Redis configuration found - queue functionality may be limited');
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      env: { ...requiredEnv, ...optionalEnv }
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      errors.push(...zodErrors);
    } else {
      errors.push(`Environment validation failed: ${error}`);
    }

    return {
      success: false,
      errors,
      warnings,
    };
  }
}

/**
 * Validate and throw if environment is invalid
 */
export function validateEnvironmentOrThrow(): Record<string, any> {
  const result = validateEnvironment();
  
  if (!result.success) {
    logger.error('Environment validation failed', 'ENV_VALIDATION', { errors: result.errors });
    result.errors.forEach(error => logger.error(`  - ${error}`, 'ENV_VALIDATION'));
    throw new Error('Invalid environment configuration');
  }
  
  if (result.warnings.length > 0) {
    logger.warn('Environment warnings', 'ENV_VALIDATION', { warnings: result.warnings });
    result.warnings.forEach(warning => logger.warn(`  - ${warning}`, 'ENV_VALIDATION'));
  }
  
  logger.info('Environment validation passed', 'ENV_VALIDATION');
  return result.env!;
}

/**
 * Get validated environment variables
 */
export function getValidatedEnv() {
  return validateEnvironmentOrThrow();
}

// Export the validation result for use in other modules
export const ENV_VALIDATION = shouldSkipValidation ? { success: true, errors: [], warnings: ['Skipped during build'], env: {} } : validateEnvironment();

// Log validation results on import (in development)
if (process.env.NODE_ENV === 'development' && !shouldSkipValidation) {
  const result = validateEnvironment();
  
  if (!result.success) {
    logger.error('Environment validation failed on import', 'ENV_VALIDATION', { errors: result.errors });
    result.errors.forEach(error => logger.error(`  - ${error}`, 'ENV_VALIDATION'));
  } else if (result.warnings.length > 0) {
    logger.warn('Environment warnings on import', 'ENV_VALIDATION', { warnings: result.warnings });
    result.warnings.forEach(warning => logger.warn(`  - ${warning}`, 'ENV_VALIDATION'));
  } else {
    logger.info('Environment validation passed on import', 'ENV_VALIDATION');
  }
} 