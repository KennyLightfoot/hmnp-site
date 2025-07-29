/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 * Implements double submit cookie pattern and SameSite cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '__csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Hash a CSRF token for secure storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify CSRF token against stored hash
 */
function verifyToken(token: string, hashedToken: string): boolean {
  return hashToken(token) === hashedToken;
}

/**
 * Extract CSRF token from request
 */
function extractCSRFToken(request: NextRequest): string | null {
  // Try header first (for AJAX requests)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;

  // Try form data (for traditional form submissions)
  const url = new URL(request.url);
  const formToken = url.searchParams.get('_csrf');
  if (formToken) return formToken;

  return null;
}

/**
 * Get CSRF token from cookie
 */
function getCSRFCookie(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Set CSRF token cookie
 */
function setCSRFCookie(response: NextResponse, token: string): void {
  const hashedToken = hashToken(token);
  
  response.cookies.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

/**
 * CSRF protection middleware
 */
export function withCSRFProtection(options: {
  methods?: string[];
  skipRoutes?: string[];
} = {}) {
  const { 
    methods = ['POST', 'PUT', 'DELETE', 'PATCH'],
    skipRoutes = ['/api/webhooks/'] 
  } = options;

  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const { method, url } = request;
      const pathname = new URL(url).pathname;

      // Skip CSRF protection for certain routes (like webhooks)
      if (skipRoutes.some(route => pathname.startsWith(route))) {
        return handler(request, ...args);
      }

      // Only protect state-changing methods
      if (!methods.includes(method)) {
        return handler(request, ...args);
      }

      // Check for CSRF token
      const submittedToken = extractCSRFToken(request);
      const cookieToken = getCSRFCookie(request);

      if (!submittedToken || !cookieToken) {
        console.warn('[CSRF] Missing CSRF token:', {
          url: pathname,
          method,
          hasSubmittedToken: !!submittedToken,
          hasCookieToken: !!cookieToken,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for'),
        });

        return new NextResponse('CSRF token missing', { status: 403 });
      }

      // Verify token
      if (!verifyToken(submittedToken, cookieToken)) {
        console.warn('[CSRF] Invalid CSRF token:', {
          url: pathname,
          method,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for'),
        });

        return new NextResponse('Invalid CSRF token', { status: 403 });
      }

      // Call original handler
      return handler(request, ...args);
    };
  };
}

/**
 * Generate and set CSRF token for GET requests
 */
export function withCSRFToken() {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const response = await handler(request, ...args);

      // Only set CSRF token for GET requests and if not already set
      if (request.method === 'GET' && !getCSRFCookie(request)) {
        const token = generateCSRFToken();
        setCSRFCookie(response, token);
      }

      return response;
    };
  };
}

/**
 * Get CSRF token for client-side use
 */
export async function getCSRFTokenForClient(request: NextRequest): Promise<{
  token: string;
  response: NextResponse;
}> {
  const token = generateCSRFToken();
  const response = new NextResponse(JSON.stringify({ csrfToken: token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  setCSRFCookie(response, token);
  
  return { token, response };
}

/**
 * Validate request origin for additional CSRF protection
 */
export function validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // For same-origin requests, origin might be null
  if (!origin && !referer) {
    return false;
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);
  
  if (!requestOrigin) {
    return false;
  }

  return allowedOrigins.includes(requestOrigin);
}

/**
 * Enhanced CSRF protection with origin validation
 */
export function withEnhancedCSRF(options: {
  methods?: string[];
  skipRoutes?: string[];
  allowedOrigins?: string[];
} = {}) {
  const { 
    methods = ['POST', 'PUT', 'DELETE', 'PATCH'],
    skipRoutes = ['/api/webhooks/'],
    allowedOrigins = [
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    ]
  } = options;

  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const { method, url } = request;
      const pathname = new URL(url).pathname;

      // Skip CSRF protection for certain routes
      if (skipRoutes.some(route => pathname.startsWith(route))) {
        return handler(request, ...args);
      }

      // Only protect state-changing methods
      if (!methods.includes(method)) {
        return handler(request, ...args);
      }

      // Validate origin
      if (!validateOrigin(request, allowedOrigins)) {
        console.warn('[CSRF] Invalid origin:', {
          url: pathname,
          method,
          origin: request.headers.get('origin'),
          referer: request.headers.get('referer'),
          allowedOrigins,
        });

        return new NextResponse('Invalid request origin', { status: 403 });
      }

      // Standard CSRF token validation
      const submittedToken = extractCSRFToken(request);
      const cookieToken = getCSRFCookie(request);

      if (!submittedToken || !cookieToken) {
        return new NextResponse('CSRF token required', { status: 403 });
      }

      if (!verifyToken(submittedToken, cookieToken)) {
        return new NextResponse('Invalid CSRF token', { status: 403 });
      }

      return handler(request, ...args);
    };
  };
}

/**
 * API endpoint to get CSRF token
 */
export async function getCSRFToken(request: NextRequest): Promise<NextResponse> {
  const { token, response } = await getCSRFTokenForClient(request);
  return response;
}

import crypto from 'crypto';

export function validateCSRFToken(token: string, userAgent: string, forwarded: string): boolean {
  try {
    if (!token) return false;
    
    const parts = token.split(':');
    if (parts.length !== 3) return false;
    
    const [tokenValue, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr);
    
    // Check if token is expired (15 minutes)
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      return false;
    }
    
    // Verify signature
    const payload = `${tokenValue}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CSRF_SECRET || 'fallback-secret')
      .update(`${payload}:${userAgent}:${forwarded}`)
      .digest('hex');
    
    return signature === expectedSignature;
    
  } catch (error) {
    console.error('[CSRF] Token validation failed:', error);
    return false;
  }
}