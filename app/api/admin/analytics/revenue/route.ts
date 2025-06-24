import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

// GET /api/admin/analytics/revenue - Detailed revenue analytics
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
    const period = searchParams.get('period') || '30';
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get daily metrics for analysis
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

    const totalRevenue = dailyMetrics.reduce((sum, day) => sum + (Number(day.totalRevenue) || 0), 0);
    const totalCosts = dailyMetrics.reduce((sum, day) => 
      sum + (Number(day.proofCosts) || 0) + (Number(day.mileageCosts) || 0) + (Number(day.stripeFees) || 0), 0);

    return NextResponse.json({
      success: true,
      revenue: {
        summary: {
          totalRevenue,
          totalCosts,
          netRevenue: totalRevenue - totalCosts,
          marginPercentage: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}

// Helper function to group data by period
function groupDataByPeriod(dailyMetrics: any[], groupBy: string) {
  if (groupBy === 'day') {
    return dailyMetrics.map(day => ({
      date: day.date.toISOString().split('T')[0],
      revenue: Number(day.totalRevenue) || 0,
      bookings: day.totalBookings || 0,
      costs: (Number(day.proofCosts) || 0) + (Number(day.mileageCosts) || 0) + (Number(day.stripeFees) || 0),
      margin: Number(day.marginPercentage) || 0
    }));
  }

  // For week/month grouping, aggregate the daily data
  const grouped = new Map();
  
  dailyMetrics.forEach(day => {
    let key;
    const date = new Date(day.date);
    
    if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        date: key,
        revenue: 0,
        bookings: 0,
        costs: 0,
        days: 0
      });
    }
    
    const group = grouped.get(key);
    group.revenue += Number(day.totalRevenue) || 0;
    group.bookings += day.totalBookings || 0;
    group.costs += (Number(day.proofCosts) || 0) + (Number(day.mileageCosts) || 0) + (Number(day.stripeFees) || 0);
    group.days += 1;
  });

  return Array.from(grouped.values()).map(group => ({
    ...group,
    margin: group.revenue > 0 ? ((group.revenue - group.costs) / group.revenue) * 100 : 0
  }));
}

// Simple linear forecast based on recent trends
function calculateForecast(dailyMetrics: any[], days: number) {
  if (dailyMetrics.length < 7) return null; // Need at least a week of data
  
  const recentData = dailyMetrics.slice(-14); // Last 2 weeks
  const revenues = recentData.map(day => Number(day.totalRevenue) || 0);
  
  // Simple linear regression for trend
  const n = revenues.length;
  const x = revenues.map((_, i) => i);
  const y = revenues;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Project forward 7 days
  const forecastDays = Math.min(7, Math.floor(days / 4)); // Forecast 1/4 of the period ahead
  const forecast = [];
  
  for (let i = 1; i <= forecastDays; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const projectedRevenue = Math.max(0, intercept + slope * (n + i));
    
    forecast.push({
      date: futureDate.toISOString().split('T')[0],
      projectedRevenue: Math.round(projectedRevenue * 100) / 100,
      confidence: Math.max(0.1, 1 - (i / forecastDays) * 0.5) // Decreasing confidence
    });
  }
  
  return forecast;
} 