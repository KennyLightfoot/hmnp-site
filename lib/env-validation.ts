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
  
  // Agents service (Next.js -> agents integration)
  AGENTS_BASE_URL: z.string().url().optional(),
  AGENTS_ADMIN_SECRET: z.string().optional(),
  AGENTS_WEBHOOK_SECRET: z.string().optional(),
  AGENTS_HEALTH_ENDPOINT: z.string().optional(),
  AGENTS_HEALTH_TIMEOUT_MS: z.string().optional(),
  AGENTS_HEALTH_REQUIRED: z.enum(['true', 'false']).optional(),

  // Deployment environment
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  
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
  N8N_BASE_URL: z.string().url().optional(),
  N8N_HEALTH_ENDPOINT: z.string().optional(),
  N8N_HEALTH_TIMEOUT_MS: z.string().optional(),
  N8N_HEALTH_REQUIRED: z.enum(['true', 'false']).optional(),
  N8N_BASIC_AUTH_USER: z.string().optional(),
  N8N_BASIC_AUTH_PASSWORD: z.string().optional(),
  N8N_BASIC_AUTH_ACTIVE: z.string().optional(),
  
  // Development
  ANALYZE: z.string().optional(),
  SKIP_ENV_VALIDATION: z.string().optional(),

  // Marketing / analytics (optional-by-design)
  // GHL custom UTM fields used for campaign attribution
  GHL_CF_ID_UTM_SOURCE: z.string().optional(),
  GHL_CF_ID_UTM_MEDIUM: z.string().optional(),
  GHL_CF_ID_UTM_CAMPAIGN: z.string().optional(),
  GHL_CF_ID_UTM_TERM: z.string().optional(),
  GHL_CF_ID_UTM_CONTENT: z.string().optional(),

  // GMB posting controls
  GMB_POSTING_ENABLED: z.enum(['true', 'false']).optional(),
  GOOGLE_MY_BUSINESS_LOCATION_ID: z.string().optional(),
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

  if (!process.env.AGENTS_WEBHOOK_SECRET && !process.env.NEXTJS_API_SECRET) {
    warnings.push('⚠️ SECURITY: Agents webhooks are not protected by AGENTS_WEBHOOK_SECRET/NEXTJS_API_SECRET');
  }

  if (process.env.N8N_BASIC_AUTH_ACTIVE !== 'true') {
    warnings.push('⚠️ SECURITY: n8n basic auth is disabled. Set N8N_BASIC_AUTH_ACTIVE=true with user/password.');
  }
  
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

    // Agents service base URL is required in production so the web app can
    // talk to the external agents pipeline for content, analytics, and chat.
    if (!process.env.AGENTS_BASE_URL) {
      errors.push('❌ CRITICAL: AGENTS_BASE_URL is required in production for agents service integration');
    }

    // Admin secret is strongly recommended when AGENTS_BASE_URL is set.
    if (process.env.AGENTS_BASE_URL && !process.env.AGENTS_ADMIN_SECRET) {
      errors.push('❌ CRITICAL: AGENTS_ADMIN_SECRET is required in production so the admin review UI can authenticate to the agents service');
    }
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
    
    const nodeEnv = requiredEnv.NODE_ENV;
    const vercelEnv = optionalEnv.VERCEL_ENV;
    const isProductionStage =
      nodeEnv === 'production' || vercelEnv === 'production';

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

    // Marketing / analytics fields (UTM + GMB). These are explicitly optional:
    // missing values should never break the app, only reduce attribution depth.
    const marketingFields: Array<{ key: keyof typeof optionalEnv; label: string }> = [
      { key: 'GHL_CF_ID_UTM_SOURCE', label: 'GHL UTM source custom field' },
      { key: 'GHL_CF_ID_UTM_MEDIUM', label: 'GHL UTM medium custom field' },
      { key: 'GHL_CF_ID_UTM_CAMPAIGN', label: 'GHL UTM campaign custom field' },
      { key: 'GHL_CF_ID_UTM_TERM', label: 'GHL UTM term custom field' },
      { key: 'GHL_CF_ID_UTM_CONTENT', label: 'GHL UTM content custom field' },
    ];

    marketingFields.forEach(({ key, label }) => {
      if (!optionalEnv[key]) {
        warnings.push(
          `${String(key)} not set - ${label} tracking is disabled. This is safe but reduces marketing analytics depth.`
        );
      }
    });

    // GMB posting: treated as an optional, feature-flag style capability.
    // When disabled, log a clear message so ops know it's intentional.
    if (optionalEnv.GMB_POSTING_ENABLED !== 'true') {
      warnings.push(
        'GMB posting is disabled by config (GMB_POSTING_ENABLED !== "true"). ' +
          'This is expected unless you are actively running GMB posting campaigns. ' +
          'See GMB docs for enabling and required GOOGLE_MY_BUSINESS_* credentials.'
      );
    } else {
      // If GMB posting is explicitly enabled, surface missing credentials as warnings
      const gmbCreds = [
        'GOOGLE_MY_BUSINESS_CLIENT_ID',
        'GOOGLE_MY_BUSINESS_CLIENT_SECRET',
        'GOOGLE_MY_BUSINESS_REFRESH_TOKEN',
        'GOOGLE_MY_BUSINESS_LOCATION_ID',
        'GOOGLE_MY_BUSINESS_ACCOUNT_ID',
      ] as const;

      const missingCreds = gmbCreds.filter((cred) => !process.env[cred]);
      if (missingCreds.length > 0) {
        warnings.push(
          `GMB_POSTING_ENABLED=true but some GOOGLE_MY_BUSINESS_* credentials are missing: ${missingCreds.join(
            ', '
          )}. GMB posting may be partially or fully disabled.`
        );
      }
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