import { z } from 'zod';

/**
 * Vercel Environment Configuration
 * Validates and provides type-safe access to environment variables
 * for production deployment
 */

// Environment variable validation schema
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid database URL'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  
  // Email Service
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Payment Processing
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  
  // Go High Level Integration
  GHL_API_KEY: z.string().optional(),
  GHL_API_BASE_URL: z.string().url().optional(),
  GHL_LOCATION_ID: z.string().optional(),
  GHL_WEBHOOK_SECRET: z.string().optional(),
  
  // GHL Workflow IDs
  GHL_PAYMENT_PENDING_WORKFLOW_ID: z.string().optional(),
  GHL_BOOKING_CONFIRMED_WORKFLOW_ID: z.string().optional(),
  GHL_NEW_BOOKING_WORKFLOW_ID: z.string().optional(),
  
  // File Storage (AWS S3 or Vercel Blob)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(), // Vercel Blob
  
  // External Integrations
  GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional(),
  
  // Analytics & Monitoring
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
  
  // Security
  ALLOWED_ORIGINS: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).optional(),
  
  // Feature Flags
  ENABLE_GUEST_BOOKINGS: z.string().regex(/^(true|false)$/).optional(),
  ENABLE_PAYMENT_PROCESSING: z.string().regex(/^(true|false)$/).optional(),
  ENABLE_GHL_INTEGRATION: z.string().regex(/^(true|false)$/).optional(),
  ENABLE_SMS_NOTIFICATIONS: z.string().regex(/^(true|false)$/).optional(),
  
  // Vercel Specific
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  
  // Development
  DEVELOPMENT_MODE: z.string().regex(/^(true|false)$/).optional(),
});

// Parsed and validated environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid environment configuration');
  }
  throw error;
}

/**
 * Type-safe environment configuration
 */
export const vercelConfig = {
  // App
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isStaging: env.NODE_ENV === 'staging',
  
  // URLs
  nextAuthUrl: env.NEXTAUTH_URL || (
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:3000'
  ),
  
  // Database
  database: {
    url: env.DATABASE_URL,
  },
  
  // Authentication
  auth: {
    nextAuthSecret: env.NEXTAUTH_SECRET,
    jwtSecret: env.JWT_SECRET,
  },
  
  // Email
  email: {
    resendApiKey: env.RESEND_API_KEY,
    fromEmail: env.FROM_EMAIL || 'notifications@houstonmobilenotarypros.com',
    enabled: !!env.RESEND_API_KEY,
  },
  
  // Payments
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    enabled: !!env.STRIPE_SECRET_KEY,
  },
  
  // Go High Level
  ghl: {
    apiKey: env.GHL_API_KEY,
    apiBaseUrl: env.GHL_API_BASE_URL,
    locationId: env.GHL_LOCATION_ID,
    webhookSecret: env.GHL_WEBHOOK_SECRET,
    enabled: !!env.GHL_API_KEY && !!env.GHL_LOCATION_ID,
    workflows: {
      paymentPending: env.GHL_PAYMENT_PENDING_WORKFLOW_ID,
      bookingConfirmed: env.GHL_BOOKING_CONFIRMED_WORKFLOW_ID,
      newBooking: env.GHL_NEW_BOOKING_WORKFLOW_ID,
    },
  },
  
  // File Storage
  storage: {
    // AWS S3
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_S3_BUCKET,
      enabled: !!env.AWS_ACCESS_KEY_ID && !!env.AWS_SECRET_ACCESS_KEY,
    },
    // Vercel Blob
    vercelBlob: {
      token: env.BLOB_READ_WRITE_TOKEN,
      enabled: !!env.BLOB_READ_WRITE_TOKEN,
    },
  },
  
  // Security
  security: {
    allowedOrigins: env.ALLOWED_ORIGINS?.split(',') || [],
    rateLimit: {
      maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS || '100'),
      windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    },
  },
  
  // Feature Flags
  features: {
    guestBookings: env.ENABLE_GUEST_BOOKINGS !== 'false', // Default true
    payments: env.ENABLE_PAYMENT_PROCESSING !== 'false', // Default true
    ghlIntegration: env.ENABLE_GHL_INTEGRATION !== 'false', // Default true
    smsNotifications: env.ENABLE_SMS_NOTIFICATIONS !== 'false', // Default true
  },
  
  // Monitoring
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
    vercelAnalyticsId: env.VERCEL_ANALYTICS_ID,
  },
  
  // Vercel-specific
  vercel: {
    url: env.VERCEL_URL,
    env: env.VERCEL_ENV,
    isPreview: env.VERCEL_ENV === 'preview',
  },
  
  // Development
  development: {
    enabled: env.DEVELOPMENT_MODE === 'true' || env.NODE_ENV === 'development',
  },
} as const;

/**
 * Validation helpers for runtime checks
 */
export const validateConfig = {
  /**
   * Validate authentication configuration
   */
  auth(): void {
    if (!vercelConfig.auth.nextAuthSecret) {
      throw new Error('NEXTAUTH_SECRET is required for authentication');
    }
    
    if (vercelConfig.isProduction && !vercelConfig.nextAuthUrl) {
      throw new Error('NEXTAUTH_URL is required in production');
    }
  },
  
  /**
   * Validate payment configuration
   */
  payments(): void {
    if (vercelConfig.features.payments) {
      if (!vercelConfig.stripe.secretKey) {
        throw new Error('STRIPE_SECRET_KEY is required when payments are enabled');
      }
      if (!vercelConfig.stripe.publishableKey) {
        throw new Error('STRIPE_PUBLISHABLE_KEY is required when payments are enabled');
      }
    }
  },
  
  /**
   * Validate GHL integration
   */
  ghl(): void {
    if (vercelConfig.features.ghlIntegration) {
      if (!vercelConfig.ghl.apiKey) {
        throw new Error('GHL_API_KEY is required when GHL integration is enabled');
      }
      if (!vercelConfig.ghl.locationId) {
        throw new Error('GHL_LOCATION_ID is required when GHL integration is enabled');
      }
    }
  },
  
  /**
   * Validate email configuration
   */
  email(): void {
    if (!vercelConfig.email.resendApiKey) {
      console.warn('⚠️  RESEND_API_KEY not configured - email notifications disabled');
    }
  },
  
  /**
   * Validate all configurations
   */
  all(): void {
    this.auth();
    this.payments();
    this.ghl();
    this.email();
  },
};

/**
 * Helper to check if running in Vercel
 */
export const isVercel = !!process.env.VERCEL;

/**
 * Helper to get the current environment
 */
export const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  if (vercelConfig.vercel.env === 'production') return 'production';
  if (vercelConfig.vercel.env === 'preview') return 'staging';
  return 'development';
};

/**
 * Get the correct API base URL for the current environment
 */
export const getApiBaseUrl = (): string => {
  if (vercelConfig.vercel.url) {
    return `https://${vercelConfig.vercel.url}`;
  }
  if (vercelConfig.nextAuthUrl) {
    return vercelConfig.nextAuthUrl;
  }
  return 'http://localhost:3000';
};

/**
 * Log configuration status (safe for production)
 */
export const logConfigStatus = (): void => {
  const status = {
    environment: getCurrentEnvironment(),
    features: {
      authentication: !!vercelConfig.auth.nextAuthSecret,
      payments: vercelConfig.features.payments && !!vercelConfig.stripe.secretKey,
      ghl: vercelConfig.features.ghlIntegration && vercelConfig.ghl.enabled,
      email: vercelConfig.email.enabled,
      storage: vercelConfig.storage.aws.enabled || vercelConfig.storage.vercelBlob.enabled,
    },
    vercel: {
      deployment: isVercel,
      preview: vercelConfig.vercel.isPreview,
    },
  };
  
  console.log('🚀 Configuration Status:', JSON.stringify(status, null, 2));
};

// Export the validated environment for direct access
export { env };

// Validate configuration on import (fail fast)
try {
  validateConfig.all();
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  if (vercelConfig.isProduction) {
    throw error; // Fail hard in production
  }
} 