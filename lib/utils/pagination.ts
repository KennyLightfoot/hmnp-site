/**
 * Pagination Utilities
 * Provides safe, consistent pagination across all endpoints
 * Prevents performance issues and memory exhaustion
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
  minLimit?: number;
}

/**
 * Parse and validate pagination parameters from URL search params
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | null,
  options: PaginationOptions = {}
): PaginationParams {
  const {
    defaultLimit = 10,
    maxLimit = 50,
    minLimit = 1
  } = options;

  // Parse page (ensure minimum of 1)
  const page = Math.max(1, parseInt(searchParams?.get('page') || '1') || 1);
  
  // Parse limit with safety constraints
  const requestedLimit = parseInt(searchParams?.get('limit') || defaultLimit.toString()) || defaultLimit;
  const limit = Math.min(Math.max(minLimit, requestedLimit), maxLimit);
  
  // Calculate offset
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create standardized pagination result
 */
export function createPaginationResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    }
  };
}

/**
 * Prisma pagination helper
 */
export function getPrismaQueryParams(params: PaginationParams) {
  return {
    skip: params.offset,
    take: params.limit,
  };
}

/**
 * Endpoint-specific pagination limits
 */
export const PAGINATION_LIMITS = {
  // High-volume endpoints need stricter limits
  bookings: {
    defaultLimit: 10,
    maxLimit: 25,
    minLimit: 1
  },
  
  // Admin endpoints can handle more
  admin: {
    defaultLimit: 20,
    maxLimit: 100,
    minLimit: 1
  },
  
  // Public/guest endpoints are most restrictive
  public: {
    defaultLimit: 5,
    maxLimit: 10,
    minLimit: 1
  },
  
  // Services and static data
  services: {
    defaultLimit: 20,
    maxLimit: 50,
    minLimit: 1
  },
  
  // Reports and analytics
  analytics: {
    defaultLimit: 25,
    maxLimit: 200,
    minLimit: 1
  }
} as const;

/**
 * Get pagination limits by endpoint type
 */
export function getPaginationLimits(endpointType: keyof typeof PAGINATION_LIMITS): PaginationOptions {
  return PAGINATION_LIMITS[endpointType];
}

/**
 * Validate pagination parameters and throw error if invalid
 */
export function validatePaginationParams(params: PaginationParams, options: PaginationOptions = {}): void {
  const { maxLimit = 50, minLimit = 1 } = options;
  
  if (params.page < 1) {
    throw new Error('Page number must be greater than 0');
  }
  
  if (params.limit < minLimit || params.limit > maxLimit) {
    throw new Error(`Limit must be between ${minLimit} and ${maxLimit}`);
  }
  
  if (params.offset < 0) {
    throw new Error('Offset cannot be negative');
  }
}

/**
 * Create pagination links for API responses
 */
export function createPaginationLinks(
  baseUrl: string,
  params: PaginationParams,
  total: number
): Record<string, string | null> {
  const totalPages = Math.ceil(total / params.limit);
  const baseQuery = new URLSearchParams();
  baseQuery.set('limit', params.limit.toString());
  
  const links: Record<string, string | null> = {
    self: `${baseUrl}?${baseQuery.toString()}&page=${params.page}`,
    first: `${baseUrl}?${baseQuery.toString()}&page=1`,
    last: `${baseUrl}?${baseQuery.toString()}&page=${totalPages}`,
    next: null,
    previous: null
  };
  
  if (params.page < totalPages) {
    links.next = `${baseUrl}?${baseQuery.toString()}&page=${params.page + 1}`;
  }
  
  if (params.page > 1) {
    links.previous = `${baseUrl}?${baseQuery.toString()}&page=${params.page - 1}`;
  }
  
  return links;
}