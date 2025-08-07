/**
 * GHL API Error Handler with Retry Logic
 * Handles all GHL API errors with appropriate retry strategies and logging
 */

import { logger, logGHLRequest, logGHLResponse } from '../logger';
import { getCleanEnv } from '../env-clean';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  retryableStatusCodes: number[];
}

interface GHLError {
  statusCode: number;
  message: string;
  details?: any;
  isRetryable: boolean;
  shouldAlert: boolean;
  category: 'RATE_LIMIT' | 'SERVER_ERROR' | 'CLIENT_ERROR' | 'NETWORK_ERROR' | 'AUTHENTICATION' | 'VALIDATION';
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  exponentialBackoff: true,
  retryableStatusCodes: [429, 500, 502, 503, 504, 520, 521, 522, 523, 524]
};

/**
 * Classifies GHL API errors and determines retry strategy
 */
export function classifyGHLError(response: Response, error?: any): GHLError {
  const statusCode = response.status;
  let category: GHLError['category'];
  let isRetryable = false;
  let shouldAlert = false;
  let message = '';

  switch (statusCode) {
    case 400:
      category = 'VALIDATION';
      message = 'Bad Request - Invalid data sent to GHL';
      isRetryable = false;
      shouldAlert = false;
      break;
    case 401:
      category = 'AUTHENTICATION';
      message = 'Unauthorized - Invalid or expired GHL token';
      isRetryable = false;
      shouldAlert = true;
      break;
    case 403:
      category = 'AUTHENTICATION';
      message = 'Forbidden - Insufficient permissions';
      isRetryable = false;
      shouldAlert = true;
      break;
    case 404:
      category = 'CLIENT_ERROR';
      message = 'Not Found - Resource does not exist';
      isRetryable = false;
      shouldAlert = false;
      break;
    case 429:
      category = 'RATE_LIMIT';
      message = 'Rate Limited - Too many requests';
      isRetryable = true;
      shouldAlert = false;
      break;
    case 500:
      category = 'SERVER_ERROR';
      message = 'Internal Server Error - GHL service issue';
      isRetryable = true;
      shouldAlert = true;
      break;
    case 502:
    case 503:
    case 504:
      category = 'SERVER_ERROR';
      message = 'Service Unavailable - GHL temporary issue';
      isRetryable = true;
      shouldAlert = false;
      break;
    default:
      if (statusCode >= 500) {
        category = 'SERVER_ERROR';
        message = `Server Error (${statusCode})`;
        isRetryable = true;
        shouldAlert = true;
      } else {
        category = 'CLIENT_ERROR';
        message = `Client Error (${statusCode})`;
        isRetryable = false;
        shouldAlert = false;
      }
  }

  return {
    statusCode,
    message,
    details: error,
    isRetryable,
    shouldAlert,
    category
  };
}

/**
 * Enhanced GHL API request with retry logic
 */
export async function makeGHLRequestWithRetry(
  url: string,
  options: RequestInit,
  retryConfig: Partial<RetryConfig> = {}
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: GHLError | null = null;

  const endpoint = url.replace(process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com', '');
  const method = options.method || 'GET';

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      logGHLRequest(endpoint, method, { attempt, maxRetries: config.maxRetries + 1 });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'HMNP-Integration/1.0',
          ...options.headers
        }
      });

      if (response.ok) {
        logGHLResponse(endpoint, true, { 
          attempt, 
          status: response.status,
          retriesUsed: attempt - 1 
        });
        return response;
      }

      const ghlError = classifyGHLError(response);
      lastError = ghlError;

      logger.error(
        `GHL API Error (Attempt ${attempt})`,
        'GHL_API',
        undefined,
        {
          url: endpoint,
          status: response.status,
          category: ghlError.category,
          message: ghlError.message,
          isRetryable: ghlError.isRetryable,
          attempt,
          maxRetries: config.maxRetries + 1
        }
      );

      if (attempt === config.maxRetries + 1 || !ghlError.isRetryable) {
        break;
      }

      const delay = config.baseDelay * Math.pow(2, attempt - 1);
      const finalDelay = Math.min(delay, config.maxDelay);
      
      logger.info(
        `Retrying GHL request after ${finalDelay}ms`,
        'GHL_API',
        { endpoint, attempt: attempt + 1, delay: finalDelay }
      );
      
      await new Promise(resolve => setTimeout(resolve, finalDelay));

    } catch (networkError) {
      logger.error(
        `Network Error (Attempt ${attempt})`,
        'GHL_API',
        networkError as Error,
        { url: endpoint, attempt, networkError: (networkError as Error).message }
      );
      
      if (attempt < config.maxRetries + 1) {
        const delay = config.baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, Math.min(delay, config.maxDelay)));
        continue;
      }
    }
  }

  if (lastError) {
    // Log final failure
    logGHLResponse(endpoint, false, { 
      error: lastError,
      totalAttempts: config.maxRetries + 1,
      category: lastError.category 
    });

    // Alert for critical errors
    if (lastError.shouldAlert) {
      logger.critical(
        `GHL API Error requires attention`,
        'GHL_API',
        undefined,
        {
          url: endpoint,
          error: lastError,
          totalAttempts: config.maxRetries + 1
        }
      );
    }

    const errorMessage = `GHL API Error after ${config.maxRetries + 1} attempts: ${lastError.message}`;
    const error = new Error(errorMessage);
    (error as any).ghlError = lastError;
    throw error;
  }

  throw new Error(`GHL API request failed after ${config.maxRetries + 1} attempts`);
}

/**
 * Standard GHL API request helper with built-in retry
 */
export async function ghlApiRequest<T = any>(
  endpoint: string,
  options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> } = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
  const url = `${baseUrl}${endpoint}`;
  
  const token = getCleanEnv('GHL_PRIVATE_INTEGRATION_TOKEN') as string;
  const isJWT = token && !token.startsWith('pit_');
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      'Authorization': isJWT ? `Bearer ${token}` : token, // JWT needs Bearer, PIT doesn't
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      'User-Agent': 'HMNP-Integration/1.0',
      ...options.headers
    }
  };

  const response = await makeGHLRequestWithRetry(url, requestOptions, retryConfig);
  
  if (!response.ok) {
    const ghlError = classifyGHLError(response);
    throw new Error(`GHL API Error: ${ghlError.message}`);
  }

  try {
    return await response.json();
  } catch (parseError) {
    logger.error(
      'Failed to parse GHL API response as JSON',
      'GHL_API',
      parseError as Error,
      { endpoint, status: response.status }
    );
    throw new Error('Failed to parse GHL API response as JSON');
  }
}

/**
 * Wraps any GHL API function with retry logic
 */
export function withRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  retryConfig: Partial<RetryConfig> = {}
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a GHL error that should be retried
        const ghlError = (error as any)?.ghlError;
        if (ghlError && !ghlError.isRetryable) {
          throw error;
        }

        // For the last attempt, throw the error
        if (attempt === config.maxRetries + 1) {
          throw error;
        }

        // Wait before retry
        const delay = config.baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Function retry: waiting ${delay}ms before attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, Math.min(delay, config.maxDelay)));
      }
    }

    throw lastError;
  };
}

/**
 * Validates GHL API response and extracts data
 */
export async function validateGHLResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    const ghlError = classifyGHLError(response);
    throw new Error(`GHL API Error: ${ghlError.message}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('GHL API returned non-JSON response');
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error('Failed to parse GHL API response as JSON');
  }
}

/**
 * Helper to create standard GHL API headers
 */
export function createGHLHeaders(includeContentType = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': getCleanEnv('GHL_PRIVATE_INTEGRATION_TOKEN') as string,
    'Version': '2021-07-28',
    'User-Agent': 'HMNP-Integration/1.0'
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
} 