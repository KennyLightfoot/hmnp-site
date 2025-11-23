/**
 * Database Query Optimization
 * Provides optimized queries with proper indexing, selective loading, and caching
 */

import { prisma } from '@/lib/database-connection';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { cache } from '@/lib/cache';
import type { Prisma } from '@/lib/prisma-types';
import { BookingStatus, ServiceType } from '@/lib/prisma-types';

// ============================================================================
// OPTIMIZED SERVICE QUERIES
// ============================================================================

/**
 * Get all active services with optimized field selection
 */
export async function getActiveServices(useCache = true) {
  const cacheKey = 'services:active:optimized';
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const services = await prisma.service.findMany({
    where: { 
      isActive: true 
    },
    select: {
      id: true,
      name: true,
      description: true,
      serviceType: true,
      durationMinutes: true,
      basePrice: true,
      requiresDeposit: true,
      depositAmount: true,
      externalCalendarId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { serviceType: 'asc' },
      { name: 'asc' }
    ],
  });

  if (useCache) {
    await cache.set(cacheKey, services, {
      ttl: 300, // 5 minutes
      tags: ['services', 'public-data']
    });
  }

  return services;
}

/**
 * Get single service by ID with caching
 */
export async function getServiceById(serviceId: string, useCache = true) {
  const cacheKey = `service:${serviceId}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const service = await prisma.service.findUnique({
    where: { 
      id: serviceId,
      isActive: true 
    },
    select: {
      id: true,
      name: true,
      description: true,
      serviceType: true,
      durationMinutes: true,
      basePrice: true,
      requiresDeposit: true,
      depositAmount: true,
      externalCalendarId: true,
      isActive: true,
    },
  });

  if (useCache && service) {
    await cache.set(cacheKey, service, {
      ttl: 600, // 10 minutes
      tags: ['services', `service:${serviceId}`]
    });
  }

  return service;
}

// ============================================================================
// OPTIMIZED BOOKING QUERIES
// ============================================================================

/**
 * Get bookings for availability checking (minimal fields)
 */
export async function getBookingsForAvailability(
  dateRange: { start: Date; end: Date },
  useCache = true
) {
  const cacheKey = `bookings:availability:${dateRange.start.toISOString().split('T')[0]}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      scheduledDateTime: {
        gte: dateRange.start,
        lt: dateRange.end,
      },
      status: {
        in: ['CONFIRMED', 'SCHEDULED', 'PAYMENT_PENDING', 'READY_FOR_SERVICE', 'IN_PROGRESS']
      }
    },
    select: {
      id: true,
      scheduledDateTime: true,
      status: true,
      service: {
        select: {
          durationMinutes: true
        }
      }
    },
    orderBy: {
      scheduledDateTime: 'asc'
    }
  });

  if (useCache) {
    await cache.set(cacheKey, bookings, {
      ttl: 300, // 5 minutes
      tags: ['bookings', 'availability', 'time-sensitive']
    });
  }

  return bookings;
}

/**
 * Get user bookings with pagination and filtering
 */
export async function getUserBookings(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
    useCache?: boolean;
  } = {}
) {
  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    useCache = true
  } = options;

  const cacheKey = `user-bookings:${userId}:${page}:${limit}:${status || 'all'}:${startDate?.toISOString() || 'none'}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const where: Prisma.BookingWhereInput = {
    signerId: userId
  };

  if (status) {
    where.status = status;
  }

  if (startDate && endDate) {
    where.scheduledDateTime = {
      gte: startDate,
      lte: endDate
    };
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      select: {
        id: true,
        status: true,
        scheduledDateTime: true,
        priceAtBooking: true,
        depositAmount: true,
        locationType: true,
        addressStreet: true,
        addressCity: true,
        addressState: true,
        createdAt: true,
        service: {
          select: {
            name: true,
            serviceType: true,
            durationMinutes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where })
  ]);

  const result = {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };

  if (useCache) {
    await cache.set(cacheKey, result, {
      ttl: 600, // 10 minutes
      tags: ['bookings', `user:${userId}`]
    });
  }

  return result;
}

/**
 * Get booking details with full relations (for admin/detailed views)
 */
export async function getBookingDetails(bookingId: string, useCache = true) {
  const cacheKey = `booking:details:${bookingId}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          serviceType: true,
          durationMinutes: true,
          basePrice: true
        }
      },
      User_Booking_signerIdToUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      promoCode: {
        select: {
          id: true,
          code: true,
          discountType: true,
          discountValue: true
        }
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          provider: true,
          createdAt: true,
          paidAt: true
        }
      },
      NotarizationDocument: {
        select: {
          id: true,
          originalFilename: true,
          isSigned: true
        }
      }
    },
  });

  if (useCache && booking) {
    await cache.set(cacheKey, booking, {
      ttl: 900, // 15 minutes
      tags: ['bookings', `booking:${bookingId}`]
    });
  }

  return booking;
}

// ============================================================================
// OPTIMIZED USER QUERIES
// ============================================================================

/**
 * Get user by email with caching
 */
export async function getUserByEmail(email: string, useCache = true) {
  const cacheKey = `user:email:${email.toLowerCase()}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  if (useCache && user) {
    await cache.set(cacheKey, user, {
      ttl: 900, // 15 minutes
      tags: ['users', `user:${user.id}`]
    });
  }

  return user;
}

/**
 * Get user by ID with caching
 */
export async function getUserById(userId: string, useCache = true) {
  const cacheKey = `user:id:${userId}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  if (useCache && user) {
    await cache.set(cacheKey, user, {
      ttl: 900, // 15 minutes
      tags: ['users', `user:${userId}`]
    });
  }

  return user;
}

// ============================================================================
// OPTIMIZED DASHBOARD QUERIES
// ============================================================================

/**
 * Get dashboard statistics with caching
 */
export async function getDashboardStats(
  userId: string,
  dateRange: { start: Date; end: Date },
  useCache = true
) {
  const cacheKey = `dashboard:stats:${userId}:${dateRange.start.toISOString().split('T')[0]}:${dateRange.end.toISOString().split('T')[0]}`;
  
  if (useCache) {
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const [
    totalBookings,
    upcomingBookings,
    completedBookings,
    pendingPayments,
    totalRevenue
  ] = await Promise.all([
    // Total bookings count
    prisma.booking.count({
      where: {
        signerId: userId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    
    // Upcoming bookings
    prisma.booking.findMany({
      where: {
        signerId: userId,
        scheduledDateTime: {
          gte: new Date(),
          lte: dateRange.end
        },
        status: {
          in: ['CONFIRMED', 'SCHEDULED', 'READY_FOR_SERVICE']
        }
      },
      select: {
        id: true,
        scheduledDateTime: true,
        service: {
          select: {
            name: true,
            durationMinutes: true
          }
        }
      },
      orderBy: { scheduledDateTime: 'asc' },
      take: 5
    }),
    
    // Completed bookings count
    prisma.booking.count({
      where: {
        signerId: userId,
        status: 'COMPLETED',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    
    // Pending payments
    prisma.booking.count({
      where: {
        signerId: userId,
        status: 'PAYMENT_PENDING',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    }),
    
    // Total revenue
    prisma.booking.aggregate({
      where: {
        signerId: userId,
        status: 'COMPLETED',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      _sum: {
        priceAtBooking: true
      }
    })
  ]);

  const stats = {
    totalBookings,
    upcomingBookings,
    completedBookings,
    pendingPayments,
    totalRevenue: totalRevenue._sum?.priceAtBooking?.toNumber() || 0
  };

  if (useCache) {
    await cache.set(cacheKey, stats, {
      ttl: 300, // 5 minutes
      tags: ['dashboard', `user:${userId}`, 'stats']
    });
  }

  return stats;
}

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate user-related caches
 */
export async function invalidateUserCache(userId: string) {
  await cache.invalidateByTags([`user:${userId}`]);
}

/**
 * Invalidate service-related caches
 */
export async function invalidateServiceCache(serviceId?: string) {
  const tags = ['services'];
  if (serviceId) {
    tags.push(`service:${serviceId}`);
  }
  await cache.invalidateByTags(tags);
}

/**
 * Invalidate booking-related caches
 */
export async function invalidateBookingCache(bookingId?: string, userId?: string) {
  const tags = ['bookings', 'availability'];
  if (bookingId) {
    tags.push(`booking:${bookingId}`);
  }
  if (userId) {
    tags.push(`user:${userId}`);
  }
  await cache.invalidateByTags(tags);
}

/**
 * Invalidate dashboard caches
 */
export async function invalidateDashboardCache(userId: string) {
  await cache.invalidateByTags(['dashboard', `user:${userId}`, 'stats']);
}

// ============================================================================
// QUERY PERFORMANCE MONITORING
// ============================================================================

/**
 * Wrapper for monitoring query performance
 */
export async function withQueryMonitoring<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    if (duration > 1000) { // Log slow queries (> 1 second)
      console.warn(`[SLOW QUERY] ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[QUERY ERROR] ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Database health check with performance metrics
 */
export async function getDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    // Simple connectivity test
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get connection metrics
    const [userCount, serviceCount, bookingCount] = await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.booking.count()
    ]);
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      metrics: {
        userCount,
        serviceCount,
        bookingCount
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}
