/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production
 * Protects against XSS, clickjacking, and other attacks
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: boolean;
  xssProtection?: boolean;
  frameOptions?: boolean;
  contentTypeOptions?: boolean;
  referrerPolicy?: boolean;
  strictTransportSecurity?: boolean;
  permissionsPolicy?: boolean;
  crossOriginPolicies?: boolean;
  customHeaders?: Record<string, string>;
}

/**
 * Default security headers configuration
 */
const DEFAULT_CONFIG: Required<SecurityHeadersConfig> = {
  contentSecurityPolicy: true,
  xssProtection: true,
  frameOptions: true,
  contentTypeOptions: true,
  referrerPolicy: true,
  strictTransportSecurity: true,
  permissionsPolicy: true,
  crossOriginPolicies: true,
  customHeaders: {},
};

/**
 * Content Security Policy configuration
 */
function getCSPHeader(isDevelopment: boolean = false): string {
  const baseCSP = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Next.js requires this for some functionality
      "'unsafe-eval'", // Required for development
      'https://js.stripe.com',
      'https://maps.googleapis.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://connect.facebook.net',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for many CSS frameworks
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'data:',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://www.google-analytics.com',
      'https://www.facebook.com',
      'https://maps.googleapis.com',
      'https://maps.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.stripe.com',
      'https://maps.googleapis.com',
      'https://www.google-analytics.com',
      'https://rest.gohighlevel.com',
      'https://api.openai.com',
    ],
    'frame-src': [
      "'self'",
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://www.google.com',
    ],
    'worker-src': [
      "'self'",
      'blob:',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': [
      "'self'",
      'https://js.stripe.com',
    ],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  // Add development-specific CSP rules
  if (isDevelopment) {
    baseCSP['connect-src'].push('ws://localhost:*', 'http://localhost:*');
    baseCSP['script-src'].push('http://localhost:*');
  }

  // Convert to CSP string
  return Object.entries(baseCSP)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Permissions Policy configuration
 */
function getPermissionsPolicyHeader(): string {
  const policies = {
    'camera': '()',
    'microphone': '()',
    'geolocation': '(self)',
    'accelerometer': '()',
    'ambient-light-sensor': '()',
    'autoplay': '()',
    'battery': '()',
    'display-capture': '()',
    'document-domain': '()',
    'encrypted-media': '()',
    'execution-while-not-rendered': '()',
    'execution-while-out-of-viewport': '()',
    'fullscreen': '(self)',
    'gamepad': '()',
    'gyroscope': '()',
    'layout-animations': '(self)',
    'legacy-image-formats': '(self)',
    'magnetometer': '()',
    'midi': '()',
    'navigation-override': '()',
    'oversized-images': '(self)',
    'payment': '(self)',
    'picture-in-picture': '()',
    'publickey-credentials-get': '(self)',
    'speaker-selection': '()',
    'sync-xhr': '()',
    'unoptimized-images': '(self)',
    'unsized-media': '(self)',
    'usb': '()',
    'screen-wake-lock': '()',
    'web-share': '(self)',
    'xr-spatial-tracking': '()',
  };

  return Object.entries(policies)
    .map(([feature, allowlist]) => `${feature}=${allowlist}`)
    .join(', ');
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = {}
): NextResponse {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Content Security Policy
  if (finalConfig.contentSecurityPolicy) {
    response.headers.set(
      'Content-Security-Policy',
      getCSPHeader(isDevelopment)
    );
  }

  // XSS Protection
  if (finalConfig.xssProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  // Frame Options (prevent clickjacking)
  if (finalConfig.frameOptions) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  // Content Type Options (prevent MIME sniffing)
  if (finalConfig.contentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // Referrer Policy
  if (finalConfig.referrerPolicy) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Strict Transport Security (HTTPS only)
  if (finalConfig.strictTransportSecurity && !isDevelopment) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // Permissions Policy
  if (finalConfig.permissionsPolicy) {
    response.headers.set(
      'Permissions-Policy',
      getPermissionsPolicyHeader()
    );
  }

  // Cross-Origin Policies
  if (finalConfig.crossOriginPolicies) {
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  }

  // Custom headers
  Object.entries(finalConfig.customHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Security-related cache headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
}

/**
 * Security headers middleware for API routes
 */
export function withSecurityHeaders(config: SecurityHeadersConfig = {}) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const response = await handler(request, ...args);
      return applySecurityHeaders(response, config);
    };
  };
}

/**
 * CORS configuration for API endpoints
 */
export interface CORSConfig {
  origin?: string[] | string | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_CORS_CONFIG: Required<CORSConfig> = {
  origin: false, // Restrict by default
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: false,
  maxAge: 86400, // 24 hours
};

/**
 * Apply CORS headers
 */
export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse,
  config: CORSConfig = {}
): NextResponse {
  const finalConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  const origin = request.headers.get('origin');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', finalConfig.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', finalConfig.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', finalConfig.maxAge.toString());
  }

  // Set origin header
  if (finalConfig.origin === true) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (typeof finalConfig.origin === 'string') {
    response.headers.set('Access-Control-Allow-Origin', finalConfig.origin);
  } else if (Array.isArray(finalConfig.origin) && origin) {
    if (finalConfig.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  // Set other CORS headers
  if (finalConfig.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (finalConfig.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', finalConfig.exposedHeaders.join(', '));
  }

  // Vary header for proper caching
  response.headers.set('Vary', 'Origin');

  return response;
}

/**
 * CORS middleware
 */
export function withCORS(config: CORSConfig = {}) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      // Handle preflight
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        return applyCORSHeaders(request, response, config);
      }

      const response = await handler(request, ...args);
      return applyCORSHeaders(request, response, config);
    };
  };
}

/**
 * API security middleware combining all security measures
 */
export function withAPISecurity(config: {
  cors?: CORSConfig;
  headers?: SecurityHeadersConfig;
} = {}) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return withSecurityHeaders(config.headers)(
      withCORS(config.cors)(handler)
    );
  };
}

/**
 * Request validation for potential attacks
 */
export function validateRequestSecurity(request: NextRequest): {
  valid: boolean;
  reason?: string;
} {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Check for common attack patterns in URL
  const suspiciousPatterns = [
    /\.\./,                    // Directory traversal
    /<script/i,                // XSS attempts
    /javascript:/i,            // JavaScript injection
    /eval\(/i,                 // Code injection
    /union\s+select/i,         // SQL injection
    /exec\s*\(/i,             // Command injection
    /phpinfo/i,               // PHP probing
    /wp-admin/i,              // WordPress probing
    /\.env/i,                 // Environment file access
    /\/etc\/passwd/i,         // Unix file access
  ];

  // Check URL for suspicious patterns
  const fullUrl = `${url.pathname}${url.search}${url.hash}`;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      return {
        valid: false,
        reason: `Suspicious pattern detected in URL: ${pattern.source}`,
      };
    }
  }

  // Check for suspicious user agents
  const suspiciousUserAgents = [
    /bot/i,
    /crawler/i,
    /scanner/i,
    /nikto/i,
    /sqlmap/i,
    /nmap/i,
  ];

  // Allow legitimate bots but block malicious ones
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
  ];

  const isSuspiciousUA = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
  const isLegitimateBot = legitimateBots.some(pattern => pattern.test(userAgent));

  if (isSuspiciousUA && !isLegitimateBot) {
    return {
      valid: false,
      reason: `Suspicious user agent: ${userAgent}`,
    };
  }

  // Check request size (prevent large payload attacks)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return {
      valid: false,
      reason: 'Request payload too large',
    };
  }

  return { valid: true };
}

/**
 * Security validation middleware
 */
export function withSecurityValidation() {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const validation = validateRequestSecurity(request);
      
      if (!validation.valid) {
        console.warn('[SECURITY] Request blocked:', {
          url: request.url,
          method: request.method,
          reason: validation.reason,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for'),
        });
        
        return new NextResponse('Forbidden', { status: 403 });
      }

      return handler(request, ...args);
    };
  };
}