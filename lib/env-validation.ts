/**
 * Environment Variable Validation
 * Ensures all required environment variables are present at startup
 * Prevents runtime failures from missing configuration
 */

import { z } from 'zod';

// Define required environment variables with validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_'),
  
  // Go High Level
  GHL_LOCATION_ID: z.string().min(1, 'GHL_LOCATION_ID is required'),
  GHL_API_KEY: z.string().optional(), // Legacy support
  GHL_PRIVATE_INTEGRATION_TOKEN: z.string().optional(),
  
  // Email (Resend)
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_').optional(),
  
  // Optional but commonly used
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
});

// Optional environment variables (with defaults)
const optionalEnvSchema = z.object({
  // Redis/Queue
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  
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
 * Validate environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Skip validation if explicitly disabled (for build processes)
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    return {
      success: true,
      errors: [],
      warnings: ['Environment validation skipped'],
      env: process.env
    };
  }

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
    
    // Warn about missing optional but recommended variables
    if (!optionalEnv.RESEND_API_KEY) {
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
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid environment configuration');
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log('✅ Environment validation passed');
  return result.env!;
}

/**
 * Get validated environment variables
 */
export function getValidatedEnv() {
  return validateEnvironmentOrThrow();
}

// Export the validation result for use in other modules
export const ENV_VALIDATION = validateEnvironment();

// Log validation results on import (in development)
if (process.env.NODE_ENV === 'development' && !process.env.SKIP_ENV_VALIDATION) {
  const result = validateEnvironment();
  
  if (!result.success) {
    console.error('❌ Environment validation failed on import:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  } else if (result.warnings.length > 0) {
    console.warn('⚠️ Environment warnings on import:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  } else {
    console.log('✅ Environment validation passed on import');
  }
} 