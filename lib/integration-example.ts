/**
 * Integration Example
 * Shows how to integrate rate limiting, monitoring, and caching into existing API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters, rateLimitConfigs } from './rate-limiting';
import { monitoring } from './comprehensive-monitoring';
import { caches, cacheConfigs } from './intelligent-caching';
import { logger } from './logger';

/**
 * Example: Enhanced Booking API with all Phase 3 features
 */
export async function enhancedBookingAPI(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  let rateLimitResult: any = null;
  
  try {
    // 1. RATE LIMITING
    rateLimitResult = await rateLimiters.booking.checkRateLimit(
      `booking:${clientIP}`,
      rateLimitConfigs.booking
    );

    if (!rateLimitResult.allowed) {
      monitoring.trackRateLimit('booking', 'ip');
      
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      );
    }

    // 2. CACHING - Try to get cached services
    const services = await caches.app.get(
      'services:active',
      async () => {
        // This is the fallback function - only called on cache miss
        logger.info('Cache miss for services, fetching from database');
        
        // Simulate database query with monitoring
        const dbStartTime = Date.now();
        const servicesFromDB = await getServicesFromDatabase();
        monitoring.trackDatabaseQuery('SELECT', 'services', Date.now() - dbStartTime);
        
        return servicesFromDB;
      },
      cacheConfigs.services
    );

    // 3. MONITORING - Track successful request
    const duration = Date.now() - startTime;
    monitoring.trackHttpRequest('POST', '/api/bookings', 200, duration);
    monitoring.trackBooking('PAYMENT_PENDING', 'standard');

    // 4. INTELLIGENT CACHING - Cache user data for future requests
    const userData = { id: 'user123', preferences: 'cached_data' };
    await caches.app.set(`user:user123`, userData, cacheConfigs.user);

    // Update trust score for rate limiting
    await rateLimiters.booking.updateTrustScore(clientIP, true);

    return NextResponse.json({
      success: true,
      services,
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Error monitoring and tracking
    monitoring.trackError('booking_api_error', 'high');
    monitoring.trackHttpRequest('POST', '/api/bookings', 500, duration);
    
    logger.error('Enhanced booking API error', error as Error, {
      clientIP,
      duration,
      rateLimitRemaining: rateLimitResult?.remaining,
    });

    // Update trust score negatively
    await rateLimiters.booking.updateTrustScore(clientIP, false);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Example: Cached Database Query with Monitoring
 */
export async function getCachedUserBookings(userId: string, page = 1, limit = 10) {
  const cacheKey = `user:${userId}:bookings:${page}:${limit}`;
  
  return await caches.database.get(
    cacheKey,
    async () => {
      const startTime = Date.now();
      
      // Simulate database query
      const bookings = await getUserBookingsFromDB(userId, page, limit);
      
      // Track database performance
      monitoring.trackDatabaseQuery('SELECT', 'bookings', Date.now() - startTime);
      
      return bookings;
    },
    {
      ttl: 600, // 10 minutes
      tags: ['bookings', `user:${userId}`],
      priority: 'high',
    }
  );
}

/**
 * Example: Cache Invalidation on Data Update
 */
export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    // Update database
    const booking = await updateBookingInDB(bookingId, status);
    
    // Invalidate related caches
    await caches.app.invalidateByTags([
      'bookings',
      `user:${booking.userId}`,
      `booking:${bookingId}`
    ]);
    
    // Track the update
    monitoring.trackBooking(status, booking.serviceType);
    
    logger.info('Booking updated and cache invalidated', 'CACHE', {
      bookingId,
      status,
      userId: booking.userId,
    });
    
    return booking;
    
  } catch (error) {
    monitoring.trackError('booking_update_error', 'medium');
    throw error;
  }
}

/**
 * Example: Rate Limiting with User Context
 */
export async function rateLimitWithUserContext(
  request: NextRequest,
  userId?: string
) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Use user ID if authenticated, otherwise fall back to IP
  const identifier = userId ? `user:${userId}` : `ip:${clientIP}`;
  
  const rateLimitResult = await rateLimiters.api.checkRateLimit(
    identifier,
    {
      ...rateLimitConfigs.api,
      // Give authenticated users higher limits
      maxRequests: userId ? rateLimitConfigs.api.maxRequests * 2 : rateLimitConfigs.api.maxRequests,
    }
  );
  
  if (!rateLimitResult.allowed) {
    monitoring.trackRateLimit('api', userId ? 'user' : 'ip');
    
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      )
    };
  }
  
  return { allowed: true, rateLimitResult };
}

/**
 * Example: Comprehensive Health Check with All Systems
 */
export async function comprehensiveHealthCheck() {
  const healthData = {
    timestamp: new Date(),
    services: {} as any,
    performance: {} as any,
    cache: {} as any,
    rateLimit: {} as any,
  };
  
  try {
    // Check system health
    const systemHealth = await monitoring.getSystemHealth();
    healthData.services = systemHealth.services;
    healthData.performance = systemHealth.metrics;
    
    // Check cache health
    const cacheStats = await caches.app.getStats();
    healthData.cache = {
      hitRate: cacheStats.hitRate,
      totalKeys: cacheStats.totalKeys,
      memoryUsage: cacheStats.memoryUsage,
    };
    
    // Check rate limiting
    const rateLimitStats = await rateLimiters.api.getStats();
    healthData.rateLimit = {
      activeEndpoints: rateLimitStats.length,
      totalBlocked: rateLimitStats.reduce((sum, stat) => sum + stat.blockedRequests, 0),
    };
    
    return healthData;
    
  } catch (error) {
    monitoring.trackError('health_check_error', 'medium');
    logger.error('Health check failed', error as Error);
    
    return {
      ...healthData,
      error: 'Health check partially failed',
      status: 'degraded',
    };
  }
}

// Mock database functions (replace with your actual database calls)
async function getServicesFromDatabase() {
  // Your actual database query here
  return [
    { id: '1', name: 'Standard Notary', price: 75 },
    { id: '2', name: 'Priority Notary', price: 100 },
  ];
}

async function getUserBookingsFromDB(userId: string, page: number, limit: number) {
  // Your actual database query here
  return {
    bookings: [],
    pagination: { page, limit, total: 0 },
  };
}

async function updateBookingInDB(bookingId: string, status: string) {
  // Your actual database update here
  return {
    id: bookingId,
    status,
    userId: 'user123',
    serviceType: 'standard',
  };
} 