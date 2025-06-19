/**
 * Advanced Rate Limiting Middleware
 * Houston Mobile Notary Pros API
 * 
 * This middleware implements granular rate limiting for different types of API endpoints
 * with separate limits for authenticated/unauthenticated users and different routes.
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Configure Redis client if REDIS_URL is provided
let redisClient;
let store;

try {
  if (process.env.REDIS_URL) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.on('error', (err) => {
      console.warn('Redis rate limiter error:', err);
      // Will fall back to memory store
    });
    
    // Create Redis store for rate limiting
    store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
  }
} catch (error) {
  console.warn('Failed to initialize Redis store for rate limiting:', error.message);
  // Will fall back to memory store
}

/**
 * Handler to customize rate limit based on request
 */
const keyGenerator = (req) => {
  // For authenticated requests, use user ID
  if (req.user && req.user.id) {
    return `user_${req.user.id}`;
  }
  
  // For API key requests
  if (req.apiKey) {
    return `apikey_${req.apiKey.id}`;
  }
  
  // For unauthenticated requests, use IP
  return `ip_${req.ip}`;
};

/**
 * Custom response for rate limit exceeded
 */
const handler = (req, res) => {
  // Log the rate limit event
  console.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });
  
  res.status(429).json({
    success: false,
    error: 'Rate Limit Exceeded',
    message: 'Too many requests, please try again later',
    retryAfter: res.getHeader('Retry-After') || 60,
    timestamp: new Date().toISOString()
  });
};

/**
 * Skip function for trusted IPs and whitelists
 */
const skipFn = (req) => {
  // Skip for local development/testing
  if (req.ip === '127.0.0.1' || req.ip === '::1') {
    return process.env.NODE_ENV !== 'production';
  }
  
  // Skip for trusted webhook sources
  if (req.path.startsWith('/webhooks/') && req.headers['x-ghl-signature']) {
    return true;
  }
  
  // Don't skip by default
  return false;
};

/**
 * Rate limiter configurations
 */
const limiters = {
  // General API rate limit (100 requests per minute)
  general: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler,
    skip: skipFn,
    store
  }),
  
  // Auth endpoint rate limit (stricter - 20 per minute)
  auth: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler,
    skip: skipFn,
    store
  }),
  
  // Booking creation rate limit (5 per minute)
  bookingCreation: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 booking creation requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler,
    skip: skipFn,
    store
  }),
  
  // Admin endpoints (higher limit for authenticated admins)
  admin: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: (req) => {
      // Higher limits for admin users
      if (req.user && req.user.roles && req.user.roles.includes('ADMIN')) {
        return 300;
      }
      
      // Default limit for others (shouldn't reach here due to auth)
      return 30;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler,
    skip: skipFn,
    store
  }),
  
  // Calendar/availability lookup (higher limit - 200 per minute)
  calendar: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler,
    skip: skipFn,
    store
  }),
  
  // API key based access - higher limits with monitoring
  apiAccess: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: (req) => {
      // If it's a valid API key request
      if (req.apiKey) {
        // Can customize based on API key tier/role
        return req.apiKey.rateLimit || 300;
      }
      
      // Default for non-API key requests
      return 100;
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler,
    skip: skipFn,
    store
  }),
  
  // Login attempts (10 per minute from same IP)
  login: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 login attempts per minute
    standardHeaders: true,
    legacyHeaders: false,
    // For login, always use IP to prevent brute force on a user
    keyGenerator: (req) => `login_${req.ip}`,
    handler,
    skip: skipFn,
    store
  }),
  
  // Stricter login limits after failures (5 per 15 minutes)
  loginStrict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    standardHeaders: true, 
    legacyHeaders: false,
    keyGenerator: (req) => `login_strict_${req.ip}`,
    handler,
    skip: skipFn,
    store
  })
};

/**
 * Apply appropriate rate limiters based on route
 */
const applyRateLimit = (req, res, next) => {
  const path = req.path.toLowerCase();
  
  // Authentication related endpoints
  if (path.includes('/auth/login')) {
    return limiters.login(req, res, next);
  }
  
  if (path.includes('/auth/refresh') || path.includes('/auth/register')) {
    return limiters.auth(req, res, next);
  }
  
  // Booking creation endpoints
  if (path.includes('/bookings') && req.method === 'POST') {
    return limiters.bookingCreation(req, res, next);
  }
  
  // Admin endpoints
  if (path.includes('/admin')) {
    return limiters.admin(req, res, next);
  }
  
  // Calendar/availability endpoints
  if (path.includes('/calendar')) {
    return limiters.calendar(req, res, next);
  }
  
  // API key access
  if (req.apiKey) {
    return limiters.apiAccess(req, res, next);
  }
  
  // Default for all other routes
  return limiters.general(req, res, next);
};

export { applyRateLimit, limiters };
