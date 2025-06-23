/**
 * Database Optimization and Performance Monitoring
 */

import { prisma } from './prisma';
import { logger } from './logger';
import { cache, cacheTTL } from './cache';

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  cached: boolean;
  error?: string;
}

class DatabaseOptimizer {
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold = 1000; // 1 second

  /**
   * Optimized booking queries with caching
   */
  async getActiveBookings(useCache = true) {
    const cacheKey = 'bookings:active';
    
    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        this.recordMetric('getActiveBookings', 0, true);
        return cached;
      }
    }

    const startTime = Date.now();
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          status: {
            in: ['CONFIRMED', 'PAYMENT_PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              price: true
            }
          },
          signer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          scheduledDateTime: 'asc'
        }
      });

      const duration = Date.now() - startTime;
      this.recordMetric('getActiveBookings', duration, false);

      if (useCache) {
        await cache.set(cacheKey, bookings, { 
          ttl: cacheTTL.short,
          tags: ['bookings']
        });
      }

      return bookings;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('getActiveBookings', duration, false, error as Error);
      throw error;
    }
  }

  /**
   * Optimized user bookings with pagination
   */
  async getUserBookings(userId: string, page = 1, limit = 10) {
    const cacheKey = `user:${userId}:bookings:${page}:${limit}`;
    
    const cached = await cache.get(cacheKey);
    if (cached) {
      this.recordMetric('getUserBookings', 0, true);
      return cached;
    }

    const startTime = Date.now();
    try {
      const skip = (page - 1) * limit;
      
      const [bookings, totalCount] = await Promise.all([
        prisma.booking.findMany({
          where: { signerId: userId },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.booking.count({
          where: { signerId: userId }
        })
      ]);

      const result = {
        bookings,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };

      const duration = Date.now() - startTime;
      this.recordMetric('getUserBookings', duration, false);

      await cache.set(cacheKey, result, { 
        ttl: cacheTTL.medium,
        tags: ['bookings', `user:${userId}`]
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('getUserBookings', duration, false, error as Error);
      throw error;
    }
  }

  /**
   * Bulk operations with transaction optimization
   */
  async bulkUpdateBookingStatuses(updates: Array<{ id: string; status: string; reason?: string }>) {
    const startTime = Date.now();
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        const updatePromises = updates.map(update => 
          tx.booking.update({
            where: { id: update.id },
            data: {
              status: update.status as any,
              notes: update.reason,
              updatedAt: new Date()
            }
          })
        );

        return await Promise.all(updatePromises);
      });

      const duration = Date.now() - startTime;
      this.recordMetric('bulkUpdateBookingStatuses', duration, false);

      await cache.invalidateByTags(['bookings']);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordMetric('bulkUpdateBookingStatuses', duration, false, error as Error);
      throw error;
    }
  }

  /**
   * Cache invalidation helpers
   */
  async invalidateUserCache(userId: string) {
    await cache.invalidateByTags([`user:${userId}`]);
  }

  async invalidateBookingCache() {
    await cache.invalidateByTags(['bookings']);
  }

  /**
   * Record query performance metrics
   */
  private recordMetric(query: string, duration: number, cached: boolean, error?: Error) {
    const metric: QueryMetrics = {
      query,
      duration,
      timestamp: new Date(),
      cached,
      error: error?.message
    };

    this.queryMetrics.push(metric);

    // Keep only recent metrics (last 1000)
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics.shift();
    }

    // Log slow queries
    if (!cached && duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected', 'DATABASE', {
        query,
        duration
      });
    }

    if (error) {
      logger.error('Database query error', 'DATABASE', error, { query, duration });
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const recentMetrics = this.queryMetrics.filter(
      m => m.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    const byQuery = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.query]) {
        acc[metric.query] = {
          count: 0,
          totalDuration: 0,
          errors: 0,
          cacheHits: 0
        };
      }

      acc[metric.query].count++;
      acc[metric.query].totalDuration += metric.duration;
      if (metric.error) acc[metric.query].errors++;
      if (metric.cached) acc[metric.query].cacheHits++;

      return acc;
    }, {} as Record<string, any>);

    return Object.entries(byQuery).map(([query, stats]) => ({
      query,
      count: stats.count,
      avgDuration: stats.totalDuration / stats.count,
      errorRate: stats.errors / stats.count,
      cacheHitRate: stats.cacheHits / stats.count
    }));
  }

  /**
   * Database health check
   */
  async healthCheck() {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;

      return {
        status: 'healthy' as const,
        responseTime: duration,
        connections: 'active'
      };
    } catch (error) {
      logger.error('Database health check failed', 'DATABASE', error as Error);
      return {
        status: 'unhealthy' as const,
        error: (error as Error).message
      };
    }
  }
}

export const dbOptimizer = new DatabaseOptimizer(); 