import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { trackError } from '@/lib/utils/errorTracking';
import { Prisma } from '@prisma/client';

/**
 * Standardized API error response format
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

/**
 * Error types and their corresponding HTTP status codes
 */
export const ERROR_CODES = {
  // Client errors (4xx)
  VALIDATION_ERROR: { status: 400, code: 'VALIDATION_ERROR' },
  AUTHENTICATION_REQUIRED: { status: 401, code: 'AUTHENTICATION_REQUIRED' },
  FORBIDDEN: { status: 403, code: 'FORBIDDEN' },
  NOT_FOUND: { status: 404, code: 'NOT_FOUND' },
  CONFLICT: { status: 409, code: 'CONFLICT' },
  RATE_LIMITED: { status: 429, code: 'RATE_LIMITED' },
  
  // Server errors (5xx)
  INTERNAL_ERROR: { status: 500, code: 'INTERNAL_ERROR' },
  DATABASE_ERROR: { status: 500, code: 'DATABASE_ERROR' },
  EXTERNAL_SERVICE_ERROR: { status: 502, code: 'EXTERNAL_SERVICE_ERROR' },
  SERVICE_UNAVAILABLE: { status: 503, code: 'SERVICE_UNAVAILABLE' },
} as const;

/**
 * Custom API error class
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    errorType: keyof typeof ERROR_CODES = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = ERROR_CODES[errorType].status;
    this.code = ERROR_CODES[errorType].code;
    this.details = details;
  }
}

/**
 * Handle and categorize different types of errors
 */
export function categorizeError(error: unknown): {
  status: number;
  code: string;
  message: string;
  details?: any;
} {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return {
      status: error.status,
      code: error.code,
      message: getErrorMessage(error),
      details: error.details,
    };
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          status: 409,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'A record with this information already exists',
          details: { field: error.meta?.target },
        };
      case 'P2025':
        return {
          status: 404,
          code: 'RECORD_NOT_FOUND',
          message: 'The requested record was not found',
        };
      case 'P2003':
        return {
          status: 400,
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: 'Invalid reference to related record',
        };
      default:
        return {
          status: 500,
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined,
        };
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
      details: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined,
    };
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error,
    };
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Check for specific error patterns
    if (getErrorMessage(error).includes('Time slot conflict')) {
      return {
        status: 409,
        code: 'BOOKING_CONFLICT',
        message: getErrorMessage(error),
      };
    }

    if (getErrorMessage(error).includes('authentication') || getErrorMessage(error).includes('unauthorized')) {
      return {
        status: 401,
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      };
    }

    if (getErrorMessage(error).includes('permission') || getErrorMessage(error).includes('forbidden')) {
      return {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      };
    }

    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : 'An internal error occurred',
    };
  }

  // Handle unknown errors
  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: unknown,
  request?: NextRequest
): NextResponse<ApiErrorResponse> {
  const categorized = categorizeError(error);
  const requestId = request?.headers.get('x-request-id') || generateRequestId();

  const errorResponse: ApiErrorResponse = {
    error: categorized.message,
    code: categorized.code,
    details: categorized.details,
    timestamp: new Date().toISOString(),
    requestId,
  };

  // Track error in monitoring system
  trackError(error, {
    component: 'api-error-handler',
    action: 'api_error',
    metadata: {
      status: categorized.status,
      code: categorized.code,
      requestId,
      url: request?.url,
      method: request?.method,
    },
  });

  // Log error details for debugging
  console.error(`[API_ERROR] ${categorized.code} (${categorized.status}):`, {
    message: categorized.message,
    requestId,
    url: request?.url,
    method: request?.method,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(errorResponse, { status: categorized.status });
}

/**
 * Higher-order function to wrap API handlers with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return createErrorResponse(error, request);
    }
  };
}

/**
 * Async wrapper for error handling in API routes
 */
export async function handleApiRequest<T>(
  request: NextRequest,
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json(result);
  } catch (error) {
    return createErrorResponse(error, request);
  }
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validation helper that throws ApiError for invalid data
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): asserts value is T {
  if (value === null || value === undefined || value === '') {
    throw new ApiError(
      `${fieldName} is required`,
      'VALIDATION_ERROR',
      { field: fieldName }
    );
  }
}

/**
 * Database operation wrapper with error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Add context to database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      trackError(error, {
        component: 'database',
        action: 'prisma_error',
        metadata: {
          code: error.code,
          context,
        },
      });
    }
    throw error;
  }
}

/**
 * Rate limiting error
 */
export class RateLimitError extends ApiError {
  constructor(resetTime?: number) {
    super('Too many requests', 'RATE_LIMITED', { resetTime });
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_REQUIRED');
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN');
  }
}

/**
 * Validation error
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}
