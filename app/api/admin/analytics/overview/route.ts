import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

// GET /api/admin/analytics/overview - Dashboard overview analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin authentication
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get daily metrics for the period
    const dailyMetrics = await prisma.dailyMetric.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get real-time data from current tables
    const [
      totalBookings,
      totalRevenue,
      totalPayments,
      activeServices,
      totalClients,
      recentBookings
    ] = await Promise.all([
      // Total bookings in period
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Total revenue from completed payments
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Payment breakdown by status
      prisma.payment.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          status: true
        },
        _sum: {
          amount: true
        }
      }),

      // Active services count
      prisma.service.count({
        where: {
          active: true
        }
      }),

      // Total unique clients
      prisma.user.count({
        where: {
          role: 'SIGNER'
        }
      }),

      // Recent bookings for trends
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          service: {
            select: {
              name: true,
              serviceType: true,
              price: true
            }
          },
          payments: {
            select: {
              amount: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })
    ]);

    // Calculate metrics from daily_metrics table
    const totalDailyRevenue = dailyMetrics.reduce((sum, day) => sum + (Number(day.totalRevenue) || 0), 0);
    const totalProofCosts = dailyMetrics.reduce((sum, day) => sum + (Number(day.proofCosts) || 0), 0);
    const totalMileageCosts = dailyMetrics.reduce((sum, day) => sum + (Number(day.mileageCosts) || 0), 0);
    const totalStripeFees = dailyMetrics.reduce((sum, day) => sum + (Number(day.stripeFees) || 0), 0);

    // Calculate real-time revenue from payments table
    const realtimeRevenue = Number(totalRevenue._sum.amount) || 0;
    
    // Use the higher of the two revenue calculations (daily metrics vs real-time)
    const finalRevenue = Math.max(totalDailyRevenue, realtimeRevenue);
    
    // Calculate margin and costs
    const totalCosts = totalProofCosts + totalMileageCosts + totalStripeFees;
    const netRevenue = finalRevenue - totalCosts;
    const marginPercentage = finalRevenue > 0 ? (netRevenue / finalRevenue) * 100 : 0;

    // Calculate booking trends
    const bookingsByType = recentBookings.reduce((acc, booking) => {
      const type = booking.locationType === 'REMOTE_ONLINE_NOTARIZATION' ? 'RON' : 'Mobile';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate service performance
    const servicePerformance = recentBookings.reduce((acc, booking) => {
      if (booking.service) {
        const serviceName = booking.service.name;
        if (!acc[serviceName]) {
          acc[serviceName] = {
            bookings: 0,
            revenue: 0,
            serviceType: booking.service.serviceType
          };
        }
        acc[serviceName].bookings += 1;
        acc[serviceName].revenue += booking.payments.reduce((sum, p) => 
          p.status === 'COMPLETED' ? sum + Number(p.amount) : sum, 0
        );
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate conversion rate (assuming visitors data would come from analytics)
    const avgConversionRate = dailyMetrics.length > 0 
      ? dailyMetrics.reduce((sum, day) => sum + (Number(day.conversionRate) || 0), 0) / dailyMetrics.length
      : 0;

    // Calculate average booking value
    const avgBookingValue = totalBookings > 0 ? finalRevenue / totalBookings : 0;

    // Prepare time series data
    const timeSeries = dailyMetrics.map(day => ({
      date: day.date.toISOString().split('T')[0],
      revenue: Number(day.totalRevenue) || 0,
      bookings: day.totalBookings || 0,
      mobileBookings: day.mobileBookings || 0,
      ronBookings: day.ronBookings || 0,
      margin: Number(day.marginPercentage) || 0
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue: finalRevenue,
          totalBookings,
          totalCosts,
          netRevenue,
          marginPercentage: Math.round(marginPercentage * 100) / 100,
          avgBookingValue: Math.round(avgBookingValue * 100) / 100,
          conversionRate: Math.round(avgConversionRate * 100) / 100,
          activeServices,
          totalClients
        },
        costs: {
          proofCosts: totalProofCosts,
          mileageCosts: totalMileageCosts,
          stripeFees: totalStripeFees,
          total: totalCosts
        },
        bookings: {
          total: totalBookings,
          byType: bookingsByType,
          trend: timeSeries.map(d => ({ date: d.date, bookings: d.bookings }))
        },
        revenue: {
          total: finalRevenue,
          trend: timeSeries.map(d => ({ date: d.date, revenue: d.revenue })),
          byPaymentStatus: totalPayments.map(p => ({
            status: p.status,
            count: p._count.status,
            amount: Number(p._sum.amount) || 0
          }))
        },
        services: {
          active: activeServices,
          performance: Object.entries(servicePerformance)
            .map(([name, data]: [string, any]) => ({
              name,
              ...data,
              avgValue: data.bookings > 0 ? data.revenue / data.bookings : 0
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10) // Top 10 services
        },
        timeSeries,
        period: {
          days: parseInt(period),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
} 