/**
 * Validation Middleware
 * Automatically validates requests and responses using Zod schemas
 * Provides type safety and prevents invalid data from entering the system
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '@/lib/monitoring/api-error-handler';

export interface ValidationConfig<TBody = any, TQuery = any, TParams = any> {
  body?: z.ZodSchema<TBody>;
  query?: z.ZodSchema<TQuery>;
  params?: z.ZodSchema<TParams>;
  response?: z.ZodSchema<any>;
}

export interface ValidatedRequest<TBody = any, TQuery = any, TParams = any> extends NextRequest {
  validatedBody?: TBody;
  validatedQuery?: TQuery;
  validatedParams?: TParams;
}

/**
 * Higher-order function to add validation to API routes
 */
export function withValidation<TBody = any, TQuery = any, TParams = any>(
  config: ValidationConfig<TBody, TQuery, TParams>
) {
  return function <T extends any[]>(
    handler: (request: ValidatedRequest<TBody, TQuery, TParams>, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const validatedRequest = request as ValidatedRequest<TBody, TQuery, TParams>;

      try {
        // Validate query parameters
        if (config.query) {
          const { searchParams } = new URL(request.url);
          const queryObject = Object.fromEntries(searchParams.entries());
          
          const queryResult = config.query.safeParse(queryObject);
          if (!queryResult.success) {
            throw new ValidationError(
              'Invalid query parameters',
              {
                errors: queryResult.error.errors.map(err => ({
                  field: err.path.join('.'),
                  message: err.message,
                  value: (err as any).input,
                })),
              }
            );
          }
          validatedRequest.validatedQuery = queryResult.data;
        }

        // Validate request body
        if (config.body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
          let body;
          try {
            body = await request.json();
          } catch (error) {
            throw new ValidationError('Invalid JSON in request body');
          }

          if (body === null || body === undefined) {
            throw new ValidationError('Request body is required');
          }

          const bodyResult = config.body.safeParse(body);
          if (!bodyResult.success) {
            throw new ValidationError(
              'Invalid request body',
              {
                errors: bodyResult.error.errors.map(err => ({
                  field: err.path.join('.'),
                  message: err.message,
                  value: (err as any).input,
                })),
              }
            );
          }
          validatedRequest.validatedBody = bodyResult.data;
        }

        // Validate route parameters (if provided)
        if (config.params && args.length > 0) {
          const paramsResult = config.params.safeParse(args[0]);
          if (!paramsResult.success) {
            throw new ValidationError(
              'Invalid route parameters',
              {
                errors: paramsResult.error.errors.map(err => ({
                  field: err.path.join('.'),
                  message: err.message,
                  value: (err as any).input,
                })),
              }
            );
          }
          validatedRequest.validatedParams = paramsResult.data;
        }

        // Call the handler with validated data
        const response = await handler(validatedRequest, ...args);

        // Validate response (optional, mainly for development)
        if (config.response && process.env.NODE_ENV === 'development') {
          try {
            const responseData = await response.clone().json();
            const responseResult = config.response.safeParse(responseData);
            if (!responseResult.success) {
              console.warn('[VALIDATION] Response validation failed:', responseResult.error.errors);
            }
          } catch (error) {
            // Response might not be JSON, that's okay
          }
        }

        return response;
      } catch (error) {
        // Re-throw validation errors to be handled by error middleware
        throw error;
      }
    };
  };
}

/**
 * Validate request body only
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return withValidation({ body: schema });
}

/**
 * Validate query parameters only
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return withValidation({ query: schema });
}

/**
 * Validate route parameters only
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return withValidation({ params: schema });
}

/**
 * Input sanitization utilities
 */
export const sanitizers = {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  sanitizeString: (input: string): string => {
    return input
      .replace(/[<>\"']/g, '') // Remove dangerous characters
      .trim()
      .slice(0, 1000); // Limit length
  },

  /**
   * Sanitize HTML content (strip all tags)
   */
  stripHtml: (input: string): string => {
    return input.replace(/<[^>]*>/g, '').trim();
  },

  /**
   * Sanitize SQL-like patterns (basic protection)
   */
  sanitizeSql: (input: string): string => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi, // OR 1=1, AND 1=1
    ];
    
    let sanitized = input;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  },

  /**
   * Sanitize file paths to prevent directory traversal
   */
  sanitizeFilePath: (input: string): string => {
    return input
      .replace(/\.\./g, '') // Remove ../ patterns
      .replace(/[\/\\]/g, '_') // Replace path separators
      .replace(/[^a-zA-Z0-9._-]/g, '') // Allow only safe characters
      .slice(0, 255); // Limit length
  },
};

/**
 * Rate limiting validation
 */
export function createRateLimitKey(request: NextRequest, identifier?: string): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const path = new URL(request.url).pathname;
  
  return `${identifier || ip}:${path}:${userAgent.slice(0, 50)}`;
}

/**
 * Content Security Policy validation
 */
export function validateCSP(content: string): boolean {
  const dangerousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * File upload validation
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed`,
    };
  }

  // Check file extension
  const extension = '.' + ((file?.name || '').split('.').pop()?.toLowerCase() || '');
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} not allowed`,
    };
  }

  // Check for potential malicious filenames
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Invalid filename',
    };
  }

  return { valid: true };
}

/**
 * IP address validation and rate limiting helpers
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  
  if (forwarded && forwarded !== 'null') {
    return forwarded?.split(',')[0]?.trim() || 'unknown';
  }
  
  return realIP || remoteAddr || 'unknown';
}

/**
 * Request fingerprinting for fraud detection
 */
export function createRequestFingerprint(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // Create a hash of the combination
  const fingerprint = Buffer.from(
    `${ip}:${userAgent}:${acceptLanguage}:${acceptEncoding}`
  ).toString('base64');
  
  return fingerprint.slice(0, 32); // Limit length
}