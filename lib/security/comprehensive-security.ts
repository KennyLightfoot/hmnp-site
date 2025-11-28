/**
 * Comprehensive Security Middleware
 * Combines all security measures into a single middleware chain
 * Provides different security levels for different endpoint types
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RateLimitType } from './rate-limiting';
import { withAPISecurity, withSecurityValidation } from './headers';
import { withEnhancedCSRF } from './csrf';
import { withErrorHandling } from '@/lib/monitoring/api-error-handler';
import { withValidation, ValidationConfig } from '@/lib/validation/middleware';
import { UnifiedAuth, Auth } from '@/lib/auth/unified-auth';

export interface SecurityConfig {
  // Rate limiting
  rateLimit?: {
    type: RateLimitType;
    endpoint?: string;
  };
  
  // CORS settings
  cors?: {
    origin?: string[] | string | boolean;
    methods?: string[];
    credentials?: boolean;
  };
  
  // CSRF protection
  csrf?: {
    enabled: boolean;
    methods?: string[];
    skipRoutes?: string[];
  };
  
  // Security validation
  securityValidation?: boolean;
  
  // Request validation
  validation?: ValidationConfig;
  
  // Error handling
  errorHandling?: boolean;
}

/**
 * Security levels for different endpoint types
 */
export const SecurityLevels = {
  /**
   * Public endpoints (minimal security)
   * - Basic rate limiting
   * - Security headers
   * - Request validation
   */
  PUBLIC: {
    rateLimit: { type: 'public' as RateLimitType },
    cors: { origin: true, credentials: false },
    csrf: { enabled: false },
    securityValidation: true,
    errorHandling: true,
  } as SecurityConfig,

  /**
   * API endpoints (standard security)
   * - Standard rate limiting
   * - CORS protection
   * - Security headers
   * - Request validation
   */
  API: {
    rateLimit: { type: 'api_general' as RateLimitType },
    cors: {
      origin: [
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      ],
      credentials: true,
    },
    csrf: { enabled: false }, // CSRF handled separately for state-changing operations
    securityValidation: true,
    errorHandling: true,
  } as SecurityConfig,

  /**
   * Authentication endpoints (high security)
   * - Strict rate limiting
   * - CORS protection
   * - Security headers
   * - Request validation
   */
  AUTH: {
    rateLimit: { type: 'auth_login' as RateLimitType },
    cors: {
      origin: [
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      ],
      credentials: true,
    },
    csrf: { enabled: false }, // Next-Auth handles its own CSRF
    securityValidation: true,
    errorHandling: true,
  } as SecurityConfig,

  /**
   * Payment endpoints (maximum security)
   * - Strict rate limiting
   * - CORS protection
   * - CSRF protection
   * - Security headers
   * - Request validation
   */
  PAYMENT: {
    rateLimit: { type: 'payment_create' as RateLimitType },
    cors: {
      origin: [
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      ],
      credentials: true,
    },
    csrf: { 
      enabled: true,
      methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
    },
    securityValidation: true,
    errorHandling: true,
  } as SecurityConfig,

  /**
   * Booking endpoints (high security)
   * - Booking-specific rate limiting
   * - CORS protection
   * - CSRF protection for creation
   * - Security headers
   * - Request validation
   */
  BOOKING: {
    rateLimit: { type: 'booking_create' as RateLimitType },
    cors: {
      origin: [
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      ],
      credentials: true,
    },
    csrf: { 
      enabled: true,
      methods: ['POST', 'PUT', 'DELETE'],
      // Allow deploy previews and localhost during development/preview
      // Production domain stays enforced inside withEnhancedCSRF (expanded variants already handled)
      // Skip list managed in CSRF middleware for webhooks only
    },
    securityValidation: true,
    errorHandling: true,
  } as SecurityConfig,

  /**
   * Admin endpoints (maximum security)
   * - Admin rate limiting
   * - Strict CORS
   * - CSRF protection
   * - Security headers
   * - Request validation
   */
  ADMIN: {
    rateLimit: { type: 'admin' as RateLimitType },
    cors: {
      origin: [
        process.env.NEXTAUTH_URL || 'http://localhost:3000',
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      ],
      credentials: true,
    },
    csrf: { 
      enabled: true,
      methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
    },
    securityValidation: true,
    errorHandling: true,
  } as SecurityConfig,

  /**
   * Webhook endpoints (specialized security)
   * - No rate limiting (handled by provider)
   * - Specific origin validation
   * - No CSRF (webhooks are server-to-server)
   * - Security headers
   * - Request validation
   */
  WEBHOOK: {
    rateLimit: undefined, // Webhooks handle their own rate limiting
    cors: { origin: false }, // Webhooks usually don't need CORS
    csrf: { enabled: false },
    securityValidation: true,
    errorHandling: true,
  } as SecurityConfig,
};

/**
 * Apply comprehensive security to an API handler
 */
export function withComprehensiveSecurity<T extends any[]>(
  config: SecurityConfig,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  let securedHandler = handler;

  // Apply error handling (outermost layer)
  if (config.errorHandling) {
    securedHandler = withErrorHandling(securedHandler);
  }

  // Apply API security (CORS and security headers)
  securedHandler = withAPISecurity({
    cors: config.cors,
  })(securedHandler);

  // Apply security validation
  if (config.securityValidation) {
    securedHandler = withSecurityValidation()(securedHandler);
  }

  // Apply rate limiting
  if (config.rateLimit) {
    securedHandler = withRateLimit(
      config.rateLimit.type,
      config.rateLimit.endpoint
    )(securedHandler);
  }

  // Apply CSRF protection
  if (config.csrf?.enabled) {
    securedHandler = withEnhancedCSRF({
      methods: config.csrf.methods,
      skipRoutes: config.csrf.skipRoutes,
    })(securedHandler);
  }

  // Apply request validation
  if (config.validation) {
    securedHandler = withValidation(config.validation)(securedHandler);
  }

  return securedHandler;
}

/**
 * Convenience functions for common security levels
 */
export const withPublicSecurity = <T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  customConfig?: Partial<SecurityConfig>
) => {
  const config = { ...SecurityLevels.PUBLIC, ...customConfig };
  return withComprehensiveSecurity(config, handler);
};

export const withAPISectionSecurity = <T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  customConfig?: Partial<SecurityConfig>
) => {
  const config = { ...SecurityLevels.API, ...customConfig };
  return withComprehensiveSecurity(config, handler);
};

export const withAuthSecurity = <T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  customConfig?: Partial<SecurityConfig>
) => {
  const config = { ...SecurityLevels.AUTH, ...customConfig };
  return withComprehensiveSecurity(config, handler);
};

export const withPaymentSecurity = <T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  customConfig?: Partial<SecurityConfig>
) => {
  const config = { ...SecurityLevels.PAYMENT, ...customConfig };
  return withComprehensiveSecurity(config, handler);
};

export const withBookingSecurity = <T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  customConfig?: Partial<SecurityConfig>
) => {
  const config = { ...SecurityLevels.BOOKING, ...customConfig };
  return withComprehensiveSecurity(config, handler);
};

export const withAdminSecurity = <T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  customConfig?: Partial<SecurityConfig>
) => {
  const config = { ...SecurityLevels.ADMIN, ...customConfig };

  // Wrap the handler with an admin-only auth check so that ALL admin endpoints
  // using this helper are properly protected by authentication and roles.
  const withAuth = async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { response } = await UnifiedAuth.authenticate(request, Auth.adminOnly());
    if (response) {
      return response;
    }
    return handler(request, ...args);
  };

  return withComprehensiveSecurity(config, withAuth);
};

export const withWebhookSecurity = <T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  customConfig?: Partial<SecurityConfig>
) => {
  const config = { ...SecurityLevels.WEBHOOK, ...customConfig };
  return withComprehensiveSecurity(config, handler);
};

/**
 * Security middleware factory for specific endpoint patterns
 */
export const createSecurityMiddleware = (level: keyof typeof SecurityLevels) => {
  return <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
    customConfig?: Partial<SecurityConfig>
  ) => {
    const config = { ...SecurityLevels[level], ...customConfig };
    return withComprehensiveSecurity(config, handler);
  };
};

/**
 * Get security configuration for an endpoint type
 */
export const getSecurityConfig = (level: keyof typeof SecurityLevels): SecurityConfig => {
  return SecurityLevels[level];
};