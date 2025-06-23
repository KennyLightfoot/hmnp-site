/**
 * Admin Monitoring API
 * Provides system health, metrics, and monitoring data for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { monitoring } from '@/lib/comprehensive-monitoring';
import { caches } from '@/lib/intelligent-caching';
import { rateLimiters, rateLimitConfigs } from '@/lib/rate-limiting';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

// Verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Check if user has admin role
  if (!session.user.roles?.includes('ADMIN')) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * GET /api/admin/monitoring
 * Get comprehensive monitoring dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const accessError = await verifyAdminAccess(request);
    if (accessError) return accessError;

    // Check rate limit for admin endpoints
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimiters.admin.checkRateLimit(
      `admin:${clientIP}`,
      rateLimitConfigs.admin
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime,
          remaining: rateLimitResult.remaining
        },
        { status: 429 }
      );
    }

    // Collect monitoring data
    const [
      systemHealth,
      cacheStats,
      recentAlerts,
      rateLimitStats,
      redisStats
    ] = await Promise.all([
      monitoring.getSystemHealth(),
      caches.app.getStats(),
      monitoring.getRecentAlerts(24),
      rateLimiters.api.getStats(),
      redis.getStats()
    ]);

    // Get hot cache keys
    const hotKeys = await caches.app.getHotKeys(10);

    const monitoringData = {
      systemHealth,
      cache: {
        stats: cacheStats,
        hotKeys,
        redisStats
      },
      alerts: {
        recent: recentAlerts,
        count: recentAlerts.length,
        critical: recentAlerts.filter(a => a.level === 'critical').length,
        warnings: recentAlerts.filter(a => a.level === 'warning').length
      },
      rateLimit: {
        stats: rateLimitStats,
        currentWindow: rateLimitResult
      },
      timestamp: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: monitoringData
    });

  } catch (error) {
    logger.error('Monitoring API error', error as Error);
    return NextResponse.json(
      { error: 'Failed to retrieve monitoring data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/monitoring/alerts
 * Send test alert or acknowledge alerts
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const accessError = await verifyAdminAccess(request);
    if (accessError) return accessError;

    const body = await request.json();
    const { action, alertId, testAlert } = body;

    if (action === 'test' && testAlert) {
      // Send test alert
      await monitoring.sendAlert({
        level: testAlert.level || 'info',
        title: testAlert.title || 'Test Alert',
        message: testAlert.message || 'This is a test alert from the admin dashboard',
        context: { test: true, timestamp: new Date() },
        notifyEmail: testAlert.notifyEmail || false,
      });

      return NextResponse.json({
        success: true,
        message: 'Test alert sent successfully'
      });
    }

    if (action === 'acknowledge' && alertId) {
      // Acknowledge alert (mark as read)
      await redis.set(`alert:ack:${alertId}`, 'acknowledged', 24 * 60 * 60);

      return NextResponse.json({
        success: true,
        message: 'Alert acknowledged'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );

  } catch (error) {
    logger.error('Monitoring alert action error', error as Error);
    return NextResponse.json(
      { error: 'Failed to process alert action' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/monitoring/cache
 * Clear cache by tags or keys
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const accessError = await verifyAdminAccess(request);
    if (accessError) return accessError;

    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags')?.split(',');
    const keys = searchParams.get('keys')?.split(',');
    const clearAll = searchParams.get('clearAll') === 'true';

    let clearedCount = 0;

    if (clearAll) {
      // Clear all cache
      await redis.flushdb();
      clearedCount = -1; // Indicate full flush
      
      logger.warn('Admin cleared all cache', 'CACHE', { admin: true });
      
    } else if (tags) {
      // Clear by tags
      clearedCount = await caches.app.invalidateByTags(tags);
      
      logger.info('Admin cleared cache by tags', 'CACHE', { tags, count: clearedCount });
      
    } else if (keys) {
      // Clear specific keys
      for (const key of keys) {
        const deleted = await caches.app.delete(key);
        if (deleted) clearedCount++;
      }
      
      logger.info('Admin cleared cache by keys', 'CACHE', { keys, count: clearedCount });
    }

    return NextResponse.json({
      success: true,
      message: clearAll 
        ? 'All cache cleared successfully'
        : `${clearedCount} cache entries cleared`,
      clearedCount
    });

  } catch (error) {
    logger.error('Cache clearing error', error as Error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
} 