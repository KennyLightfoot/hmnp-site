/**
 * Retry Utility
 * Provides robust error recovery and retry capabilities for API calls and critical operations
 */

import { logger } from '@/lib/logger';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Whether to use exponential backoff for retry delays */
  useExponentialBackoff?: boolean;
  /** Optional function to determine if error is retryable */
  isRetryable?: (error: any) => boolean;
  /** Optional callback to execute before retry */
  onRetry?: (error: any, attemptNumber: number) => void;
}

/**
 * Default retry options
 */
const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  useExponentialBackoff: true,
  isRetryable: () => true, // By default, retry all errors
  onRetry: (error, attemptNumber) => {
    logger.warn(`Retry attempt ${attemptNumber} after error: ${error instanceof Error ? error.message : String(error)}`, 'RETRY');
  },
};

/**
 * Execute a function with retry logic
 * 
 * @param fn Function to execute with retry capability
 * @param options Retry configuration options
 * @returns Promise with the result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      const isLastAttempt = attempt > config.maxRetries;
      const isRetryable = config.isRetryable(error);
      
      if (isLastAttempt || !isRetryable) {
        logger.error(`Operation failed after ${attempt} attempts: ${error instanceof Error ? error.message : String(error)}`, 'RETRY', error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
      
      // Calculate delay with exponential backoff if enabled
      let delay = config.retryDelay;
      if (config.useExponentialBackoff) {
        delay = config.retryDelay * Math.pow(2, attempt - 1);
      }
      
      // Execute onRetry callback
      config.onRetry(error, attempt);
      
      // Log retry attempt
      logger.info(`Retrying operation (${attempt}/${config.maxRetries}) after ${delay}ms delay`, 'RETRY');
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen due to the throw in the loop above
  throw lastError;
}

/**
 * Creates a version of a function that automatically retries on failure
 * 
 * @param fn Function to wrap with retry logic
 * @param options Retry configuration options
 * @returns A new function with built-in retry capability
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), options);
  }) as T;
}
