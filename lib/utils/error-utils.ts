/**
 * Utility functions for safe error handling and type safety
 */

/**
 * Safely extract error message from form errors
 */
export function getErrorMessage(error: any): string {
  if (!error) return '';
  
  if (typeof error === 'string') return error;
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('type' in error && typeof error.type === 'string') {
      return error.type;
    }
  }
  
  return 'An error occurred';
}

/**
 * Safely assign enum values with type checking
 */
export function safeEnum<T extends string>(
  value: string | undefined | null,
  validValues: readonly T[],
  defaultValue: T
): T {
  if (!value) return defaultValue;
  
  if (validValues.includes(value as T)) {
    return value as T;
  }
  
  return defaultValue;
}

/**
 * Safely access nested object properties with fallback
 */
export function safeGet<T>(
  obj: any,
  path: string,
  defaultValue: T
): T {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    
    if (typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current !== undefined ? (current as T) : defaultValue;
}

/**
 * Safely access array length with fallback
 */
export function safeArrayLength(arr: any[] | undefined | null): number {
  return Array.isArray(arr) ? arr.length : 0;
}

/**
 * Safely access array item with fallback
 */
export function safeArrayGet<T>(
  arr: T[] | undefined | null,
  index: number,
  defaultValue: T
): T {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  
  const item = arr[index];
  return item !== undefined ? item : defaultValue;
}

/**
 * Type guard for checking if a value is a valid enum
 */
export function isValidEnum<T extends string>(
  value: any,
  validValues: readonly T[]
): value is T {
  return typeof value === 'string' && validValues.includes(value as T);
}

/**
 * Safe boolean conversion with fallback
 */
export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return defaultValue;
}

/**
 * Safe number conversion with fallback
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

/**
 * Safe string conversion with fallback
 */
export function safeString(value: any, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}