import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response formats across all API endpoints
 * for better error handling, debugging, and client integration.
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
  path?: string;
}

export interface ApiValidationErrorResponse extends ApiErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      field: string;
      message: string;
      value?: any;
    }[];
  };
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Success response with consistent format
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200,
  requestId?: string
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Error response with consistent format and logging
 */
export function apiError(
  code: string,
  message: string,
  status: number = 500,
  details?: any,
  requestId?: string,
  path?: string
): NextResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
    path,
  };

  // Log error for monitoring
  logger.error('API Error', {
    code,
    message,
    status,
    details,
    requestId: response.requestId,
    path,
  });

  return NextResponse.json(response, { status });
}

/**
 * Validation error response
 */
export function apiValidationError(
  validationErrors: { field: string; message: string; value?: any }[],
  requestId?: string,
  path?: string
): NextResponse {
  const response: ApiValidationErrorResponse = {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: validationErrors,
    },
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
    path,
  };

  logger.warn('API Validation Error', {
    validationErrors,
    requestId: response.requestId,
    path,
  });

  return NextResponse.json(response, { status: 400 });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  // Authentication & Authorization
  unauthorized: (requestId?: string, path?: string) =>
    apiError('UNAUTHORIZED', 'Authentication required', 401, undefined, requestId, path),
    
  forbidden: (requestId?: string, path?: string) =>
    apiError('FORBIDDEN', 'Insufficient permissions', 403, undefined, requestId, path),
    
  invalidToken: (requestId?: string, path?: string) =>
    apiError('INVALID_TOKEN', 'Invalid or expired authentication token', 401, undefined, requestId, path),

  // Client Errors
  badRequest: (message: string = 'Bad request', requestId?: string, path?: string) =>
    apiError('BAD_REQUEST', message, 400, undefined, requestId, path),
    
  notFound: (resource: string = 'Resource', requestId?: string, path?: string) =>
    apiError('NOT_FOUND', `${resource} not found`, 404, undefined, requestId, path),
    
  conflict: (message: string = 'Resource already exists', requestId?: string, path?: string) =>
    apiError('CONFLICT', message, 409, undefined, requestId, path),
    
  unprocessableEntity: (message: string, requestId?: string, path?: string) =>
    apiError('UNPROCESSABLE_ENTITY', message, 422, undefined, requestId, path),
    
  tooManyRequests: (requestId?: string, path?: string) =>
    apiError('TOO_MANY_REQUESTS', 'Rate limit exceeded', 429, undefined, requestId, path),

  // Server Errors
  internalServerError: (message: string = 'Internal server error', requestId?: string, path?: string) =>
    apiError('INTERNAL_SERVER_ERROR', message, 500, undefined, requestId, path),
    
  serviceUnavailable: (service: string, requestId?: string, path?: string) =>
    apiError('SERVICE_UNAVAILABLE', `${service} is currently unavailable`, 503, undefined, requestId, path),
    
  databaseError: (requestId?: string, path?: string) =>
    apiError('DATABASE_ERROR', 'Database operation failed', 500, undefined, requestId, path),

  // Business Logic Errors
  paymentRequired: (requestId?: string, path?: string) =>
    apiError('PAYMENT_REQUIRED', 'Payment is required to complete this action', 402, undefined, requestId, path),
    
  bookingConflict: (requestId?: string, path?: string) =>
    apiError('BOOKING_CONFLICT', 'The requested time slot is no longer available', 409, undefined, requestId, path),
    
  invalidBookingStatus: (currentStatus: string, requestId?: string, path?: string) =>
    apiError('INVALID_BOOKING_STATUS', `Cannot perform this action on booking with status: ${currentStatus}`, 422, undefined, requestId, path),
} as const;

/**
 * Extract request information for consistent logging
 */
export function getRequestInfo(request: Request): {
  requestId: string;
  path: string;
  method: string;
  userAgent?: string;
  ip?: string;
} {
  const url = new URL(request.url);
  const requestId = generateRequestId();
  
  return {
    requestId,
    path: url.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('cf-connecting-ip') || 
        undefined,
  };
}

/**
 * Async wrapper for API route handlers with consistent error handling
 */
export function withApiHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const requestId = generateRequestId();
      
      // Log unexpected errors
      logger.error('Unhandled API error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
      });

      // Return standardized error response
      return apiError(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        500,
        process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.stack : error) : undefined,
        requestId
      );
    }
  };
}

/**
 * Middleware to add request ID to all responses
 */
export function withRequestId<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const response = await handler(...args);
    
    // Add request ID to response headers
    response.headers.set('X-Request-ID', requestId);
    
    return response;
  };
}

/**
 * Type guard to check if response is an API error
 */
export function isApiError(response: any): response is ApiErrorResponse {
  return response && !response.success && response.error;
}

/**
 * Type guard to check if response is an API success
 */
export function isApiSuccess(response: any): response is ApiSuccessResponse {
  return response && response.success === true && response.data !== undefined;
} 