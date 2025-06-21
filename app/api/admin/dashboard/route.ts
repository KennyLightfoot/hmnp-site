import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { cache, cacheTTL } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { testRunner } from '@/lib/test-runner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = 'admin:dashboard:stats';
    
    // Try to get from cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Admin dashboard data served from cache', 'ADMIN_DASHBOARD');
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Generating fresh admin dashboard data', 'ADMIN_DASHBOARD');

    // Parallel data fetching for better performance
    const [
      bookingStats,
      revenueStats,
      systemHealth,
      recentActivity,
      performanceMetrics
    ] = await Promise.all([
      getBookingStatistics(),
      getRevenueStatistics(),
      getSystemHealth(),
      getRecentActivity(),
      getPerformanceMetrics()
    ]);

    const dashboardData = {
      bookings: bookingStats,
      revenue: revenueStats,
      system: systemHealth,
      activity: recentActivity,
      performance: performanceMetrics,
      generatedAt: new Date().toISOString()
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, dashboardData, { 
      ttl: cacheTTL.short,
      tags: ['admin', 'dashboard', 'analytics']
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
      cached: false
    });

  } catch (error) {
    logger.error('Admin dashboard API error', 'ADMIN_DASHBOARD', error as Error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get comprehensive booking statistics
 */
async function getBookingStatistics() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay.getTime() - (startOfDay.getDay() * 24 * 60 * 60 * 1000));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get current status distribution
  const statusCounts = await prisma.booking.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  });

  // Get time-based statistics
  const [todayCount, weekCount, monthCount, yearCount] = await Promise.all([
    prisma.booking.count({
      where: { createdAt: { gte: startOfDay } }
    }),
    prisma.booking.count({
      where: { createdAt: { gte: startOfWeek } }
    }),
    prisma.booking.count({
      where: { createdAt: { gte: startOfMonth } }
    }),
    prisma.booking.count({
      where: { createdAt: { gte: startOfYear } }
    })
  ]);

  // Get service popularity
  const serviceGrouped = await prisma.booking.groupBy({
    by: ['serviceId'],
    _count: {
      serviceId: true
    },
    orderBy: {
      _count: {
        serviceId: 'desc'
      }
    },
    take: 5
  });

  // Get service names for the top services
  const serviceIds = serviceGrouped.map(item => item.serviceId);
  const services = await prisma.service.findMany({
    where: {
      id: { in: serviceIds }
    },
    select: {
      id: true,
      name: true
    }
  });

  // Combine the data
  const serviceStats = serviceGrouped.map(item => ({
    serviceId: item.serviceId,
    _count: item._count,
    service: services.find(service => service.id === item.serviceId)
  }));

  // Get upcoming bookings
  const upcomingBookings = await prisma.booking.count({
    where: {
      status: BookingStatus.CONFIRMED,
      scheduledDateTime: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    }
  });

  // Calculate completion rate
  const completedBookings = await prisma.booking.count({
    where: {
      status: BookingStatus.COMPLETED,
      createdAt: { gte: startOfMonth }
    }
  });

  const totalBookingsThisMonth = await prisma.booking.count({
    where: { createdAt: { gte: startOfMonth } }
  });

  const completionRate = totalBookingsThisMonth > 0 
    ? Math.round((completedBookings / totalBookingsThisMonth) * 100)
    : 0;

  return {
    statusDistribution: statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>),
    timeStats: {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      thisYear: yearCount
    },
    servicePopularity: serviceStats,
    upcomingBookings,
    completionRate,
    trends: {
      weekOverWeek: await calculateBookingTrend(startOfWeek, 7),
      monthOverMonth: await calculateBookingTrend(startOfMonth, 30)
    }
  };
}

/**
 * Get revenue statistics
 */
async function getRevenueStatistics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month revenue
  const currentMonthRevenue = await prisma.booking.aggregate({
    where: {
      status: BookingStatus.COMPLETED,
      createdAt: { gte: startOfMonth }
    },
    _sum: {
      priceAtBooking: true
    }
  });

  // Last month revenue for comparison
  const lastMonthRevenue = await prisma.booking.aggregate({
    where: {
      status: BookingStatus.COMPLETED,
      createdAt: { 
        gte: lastMonth,
        lte: endOfLastMonth
      }
    },
    _sum: {
      priceAtBooking: true
    }
  });

  // Daily revenue for the last 30 days
  const dailyRevenue = await prisma.$queryRaw`
    SELECT 
      DATE(created_at) as date,
      SUM(price_at_booking) as revenue,
      COUNT(*) as bookings
    FROM "Booking"
    WHERE 
      status = 'COMPLETED'
      AND created_at >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  ` as Array<{ date: string; revenue: number; bookings: number }>;

  // Average booking value
  const avgBookingValue = await prisma.booking.aggregate({
    where: {
      status: BookingStatus.COMPLETED,
      createdAt: { gte: startOfMonth }
    },
    _avg: {
      priceAtBooking: true
    }
  });

  // Pending revenue (from payment pending bookings)
  const pendingRevenue = await prisma.booking.aggregate({
    where: {
      status: BookingStatus.PAYMENT_PENDING
    },
    _sum: {
      priceAtBooking: true
    }
  });

  const currentRevenue = Number(currentMonthRevenue._sum?.priceAtBooking?.toNumber() || 0);
  const previousRevenue = Number(lastMonthRevenue._sum?.priceAtBooking?.toNumber() || 0);
  const revenueGrowth = previousRevenue > 0 
    ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
    : 0;

  return {
    currentMonth: currentRevenue,
    lastMonth: previousRevenue,
    growth: revenueGrowth,
    avgBookingValue: Number(avgBookingValue._avg?.priceAtBooking?.toNumber() || 0),
    pendingRevenue: Number(pendingRevenue._sum?.priceAtBooking?.toNumber() || 0),
    dailyRevenue: dailyRevenue.slice(0, 30), // Last 30 days
    projectedMonthly: currentRevenue * (new Date().getDate() > 0 ? (30 / new Date().getDate()) : 1)
  };
}

/**
 * Get system health metrics
 */
async function getSystemHealth() {
  try {
    const [
      dbHealth,
      cacheHealth,
      testResults
    ] = await Promise.all([
      checkDatabaseHealth(),
      checkCacheHealth(),
      testRunner.runHealthTests()
    ]);

    const overallHealth = dbHealth.status === 'healthy' && 
                         cacheHealth.status === 'healthy' && 
                         testResults.every(test => test.status === 'PASSED')
                         ? 'healthy' : 'degraded';

    return {
      overall: overallHealth,
      database: dbHealth,
      cache: cacheHealth,
      tests: testResults,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      overall: 'unhealthy',
      error: (error as Error).message,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Get recent activity
 */
async function getRecentActivity() {
  const recentBookings = await prisma.booking.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      service: {
        select: {
          name: true
        }
      },
      User_Booking_signerIdToUser: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return {
    recentBookings: recentBookings.map(booking => ({
      id: booking.id,
      customerName: booking.User_Booking_signerIdToUser?.name || 'Guest',
      serviceName: booking.service?.name || 'Unknown',
      status: booking.status,
      amount: booking.priceAtBooking?.toNumber() || 0,
      createdAt: booking.createdAt
    }))
  };
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  // This would integrate with your monitoring system
  // For now, return mock data
  return {
    averageResponseTime: 250,
    errorRate: 0.5,
    uptime: 99.9,
    cacheHitRate: 85.2,
    lastDeployment: new Date().toISOString()
  };
}

/**
 * Helper functions
 */
async function calculateBookingTrend(startDate: Date, days: number) {
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  const previousStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

  const [current, previous] = await Promise.all([
    prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      }
    }),
    prisma.booking.count({
      where: {
        createdAt: {
          gte: previousStart,
          lt: startDate
        }
      }
    })
  ]);

  const trend = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  return { current, previous, trend };
}

async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy' as const,
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      error: (error as Error).message
    };
  }
}

async function checkCacheHealth() {
  try {
    return await cache.healthCheck();
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      error: (error as Error).message
    };
  }
} 