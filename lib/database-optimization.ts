/**
 * Database Optimization and Performance Monitoring
 * Provides query optimization, connection pooling, and performance tracking
 */

import { prisma } from './prisma';
import { logger } from './logger';
import { cache, cacheKeys, cacheTTL } from './cache';

export interface QueryPerformanceMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  params?: any;
  cached: boolean;
  error?: string;
}

export interface DatabaseHealth {
  connectionCount: number;
  activeQueries: number;
  avgResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
}

class DatabaseOptimizer {
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private maxMetricsHistory = 1000;
  private slowQueryThreshold = 1000; // 1 second
  
  constructor() {
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring() {
    // Cleanup old metrics every 5 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 5 * 60 * 1000);
  }

  private cleanupOldMetrics() {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000); // Keep last hour
    this.queryMetrics = this.queryMetrics.filter(metric => metric.timestamp > cutoff);
  }

  /**
   * Optimized booking queries with caching
   */
  async getActiveBookings(useCache = true) {
    const cacheKey = 'bookings:active';
    
    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        this.recordQueryMetric('getActiveBookings', 0, true);
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
              basePrice: true,
              durationMinutes: true
            }
          },
          User_Booking_signerIdToUser: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          appointmentDateTime: 'asc'
        }
      });

      const duration = Date.now() - startTime;
      this.recordQueryMetric('getActiveBookings', duration, false);

      // Cache for 5 minutes
      if (useCache) {
        await cache.set(cacheKey, bookings, { 
          ttl: cacheTTL.short,
          tags: ['bookings']
        });
      }

      return bookings;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQueryMetric('getActiveBookings', duration, false, error as Error);
      throw error;
    }
  }

  /**
   * Optimized service availability with intelligent caching
   */
  async getServiceAvailability(date: string, serviceId: string, useCache = true) {
    const cacheKey = `availability:${date}:${serviceId}`;
    
    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        this.recordQueryMetric('getServiceAvailability', 0, true);
        return cached;
      }
    }

    const startTime = Date.now();
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // Use raw query for better performance on large datasets
      const bookings = await prisma.$queryRaw`
        SELECT 
          "appointmentDateTime",
          "service"."durationMinutes"
        FROM "Booking" b
        INNER JOIN "Service" service ON b."serviceId" = service.id
        WHERE 
          b."appointmentDateTime" >= ${startOfDay} 
          AND b."appointmentDateTime" <= ${endOfDay}
          AND b."status" IN ('CONFIRMED', 'IN_PROGRESS')
          AND (${serviceId}::text = 'all' OR b."serviceId" = ${serviceId})
        ORDER BY b."appointmentDateTime"
      `;

      const duration = Date.now() - startTime;
      this.recordQueryMetric('getServiceAvailability', duration, false);

      // Cache for 30 minutes (availability changes less frequently)
      if (useCache) {
        await cache.set(cacheKey, bookings, { 
          ttl: cacheTTL.medium,
          tags: ['availability', 'bookings']
        });
      }

      return bookings;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQueryMetric('getServiceAvailability', duration, false, error as Error);
      throw error;
    }
  }

  /**
   * Optimized user bookings with pagination and caching
   */
  async getUserBookings(userId: string, page = 1, limit = 10, useCache = true) {
    const cacheKey = `user:${userId}:bookings:${page}:${limit}`;
    
    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        this.recordQueryMetric('getUserBookings', 0, true);
        return cached;
      }
    }

    const startTime = Date.now();
    try {
      const skip = (page - 1) * limit;
      
      const [bookings, totalCount] = await Promise.all([
        prisma.booking.findMany({
          where: { signerUserId: userId },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                basePrice: true
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
          where: { signerUserId: userId }
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
      this.recordQueryMetric('getUserBookings', duration, false);

      // Cache for 15 minutes
      if (useCache) {
        await cache.set(cacheKey, result, { 
          ttl: cacheTTL.medium / 2,
          tags: ['bookings', `user:${userId}`]
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQueryMetric('getUserBookings', duration, false, error as Error);
      throw error;
    }
  }

  /**
   * Optimized revenue analytics with aggregation and caching
   */
  async getRevenueAnalytics(startDate: Date, endDate: Date, useCache = true) {
    const cacheKey = `analytics:revenue:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`;
    
    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        this.recordQueryMetric('getRevenueAnalytics', 0, true);
        return cached;
      }
    }

    const startTime = Date.now();
    try {
      // Use aggregation for better performance
      const analytics = await prisma.$queryRaw`
        SELECT 
          DATE(b."createdAt") as date,
          COUNT(*) as "totalBookings",
          COUNT(CASE WHEN b."status" = 'COMPLETED' THEN 1 END) as "completedBookings",
          SUM(CASE WHEN b."status" = 'COMPLETED' THEN b."totalAmount" ELSE 0 END) as "totalRevenue",
          AVG(CASE WHEN b."status" = 'COMPLETED' THEN b."totalAmount" ELSE NULL END) as "avgBookingValue",
          s."name" as "serviceName",
          COUNT(CASE WHEN b."status" = 'COMPLETED' THEN 1 END) as "serviceBookings"
        FROM "Booking" b
        INNER JOIN "Service" s ON b."serviceId" = s.id
        WHERE 
          b."createdAt" >= ${startDate} 
          AND b."createdAt" <= ${endDate}
        GROUP BY DATE(b."createdAt"), s."name"
        ORDER BY date DESC, "serviceBookings" DESC
      `;

      const duration = Date.now() - startTime;
      this.recordQueryMetric('getRevenueAnalytics', duration, false);

      // Cache for 1 hour (analytics data changes less frequently)
      if (useCache) {
        await cache.set(cacheKey, analytics, { 
          ttl: cacheTTL.long,
          tags: ['analytics', 'bookings']
        });
      }

      return analytics;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQueryMetric('getRevenueAnalytics', duration, false, error as Error);
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
              notes: update.reason ? 
                `Status updated: ${update.status} - ${update.reason}` : 
                undefined,
              updatedAt: new Date()
            }
          })
        );

        return await Promise.all(updatePromises);
      });

      const duration = Date.now() - startTime;
      this.recordQueryMetric('bulkUpdateBookingStatuses', duration, false);

      // Invalidate related caches
      await cache.invalidateByTags(['bookings']);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQueryMetric('bulkUpdateBookingStatuses', duration, false, error as Error);
      throw error;
    }
  }

  /**
   * Connection pool optimization
   */
  async optimizeConnectionPool() {
    try {
      // Check current connection metrics
      const metrics = await this.getDatabaseHealth();
      
      if (metrics.connectionCount > 80) { // 80% of pool
        logger.warn('Database connection pool usage high', {
          connectionCount: metrics.connectionCount,
          activeQueries: metrics.activeQueries
        });
      }

      if (metrics.avgResponseTime > this.slowQueryThreshold) {
        logger.warn('Database average response time high', {
          avgResponseTime: metrics.avgResponseTime
        });
      }

      return metrics;
    } catch (error) {
      logger.error('Failed to optimize connection pool', error as Error);
      throw error;
    }
  }

  /**
   * Database health monitoring
   */
  async getDatabaseHealth(): Promise<DatabaseHealth> {
    try {
      const recentMetrics = this.queryMetrics.filter(
        metric => metric.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      );

      const avgResponseTime = recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
        : 0;

      const errorRate = recentMetrics.length > 0
        ? recentMetrics.filter(m => m.error).length / recentMetrics.length
        : 0;

      const cacheHitRate = recentMetrics.length > 0
        ? recentMetrics.filter(m => m.cached).length / recentMetrics.length
        : 0;

      // Get connection info (this would need to be implemented based on your database)
      const connectionCount = 0; // Placeholder
      const activeQueries = recentMetrics.filter(
        m => !m.cached && m.timestamp > new Date(Date.now() - 1000)
      ).length;

      let status: DatabaseHealth['status'] = 'healthy';
      if (errorRate > 0.1 || avgResponseTime > this.slowQueryThreshold * 2) {
        status = 'unhealthy';
      } else if (errorRate > 0.05 || avgResponseTime > this.slowQueryThreshold) {
        status = 'degraded';
      }

      return {
        connectionCount,
        activeQueries,
        avgResponseTime,
        errorRate,
        cacheHitRate,
        status
      };
    } catch (error) {
      logger.error('Failed to get database health', error as Error);
      return {
        connectionCount: 0,
        activeQueries: 0,
        avgResponseTime: 0,
        errorRate: 1,
        cacheHitRate: 0,
        status: 'unhealthy'
      };
    }
  }

  /**
   * Cache invalidation helpers
   */
  async invalidateUserCache(userId: string) {
    await cache.invalidateByTags([`user:${userId}`]);
  }

  async invalidateBookingCache(bookingId?: string) {
    const tags = ['bookings', 'availability'];
    if (bookingId) {
      tags.push(`booking:${bookingId}`);
    }
    await cache.invalidateByTags(tags);
  }

  async invalidateAnalyticsCache() {
    await cache.invalidateByTags(['analytics']);
  }

  /**
   * Query performance monitoring
   */
  private recordQueryMetric(
    query: string, 
    duration: number, 
    cached: boolean, 
    error?: Error,
    params?: any
  ) {
    const metric: QueryPerformanceMetrics = {
      query,
      duration,
      timestamp: new Date(),
      params,
      cached,
      error: error?.message
    };

    this.queryMetrics.push(metric);

    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics.shift();
    }

    // Log slow queries
    if (!cached && duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected', {
        query,
        duration,
        params
      });
    }

    // Log errors
    if (error) {
      logger.error('Database query error', error, {
        query,
        duration,
        params
      });
    }
  }

  /**
   * Get query performance metrics
   */
  getPerformanceMetrics(minutes = 60) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.queryMetrics.filter(m => m.timestamp > cutoff);

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
      cacheHitRate: stats.cacheHits / stats.count,
      ...stats
    }));
  }
}

// Export singleton instance
export const dbOptimizer = new DatabaseOptimizer();

// Query builder helpers for common patterns
export const queryHelpers = {
  /**
   * Build optimized date range query
   */
  dateRange(field: string, start: Date, end: Date) {
    return {
      [field]: {
        gte: start,
        lte: end
      }
    };
  },

  /**
   * Build optimized pagination query
   */
  pagination(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  },

  /**
   * Build optimized search query
   */
  search(fields: string[], term: string) {
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: term,
          mode: 'insensitive' as const
        }
      }))
    };
  },

  /**
   * Build optimized status filter
   */
  statusFilter(statuses: string[]) {
    return {
      status: {
        in: statuses
      }
    };
  }
}; 