/**
 * Promotional Campaign Performance Analytics API
 * Phase 3: Detailed campaign performance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ============================================================================
// 🎯 VALIDATION SCHEMAS
// ============================================================================

const PerformanceQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '6m', '1y', 'all']).default('30d'),
  granularity: z.enum(['day', 'week', 'month']).default('day')
});

// ============================================================================
// 🚀 API HANDLERS
// ============================================================================

/**
 * GET /api/admin/promotional-campaigns/[id]/performance
 * Get detailed performance analytics for a specific campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Note: await is now required
    const { searchParams } = new URL(request.url);
    const query = PerformanceQuerySchema.parse(Object.fromEntries(searchParams));

    // Validate campaign exists
    const campaign = await prisma.promotionalCampaign.findUnique({
      where: { id },
      include: {
        promo_code_usage: {
          orderBy: { used_at: 'desc' }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (query.timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = campaign.validFrom;
    }

    // Get usage data for the time range
    const usageData = await prisma.promoCodeUsageTracking.findMany({
      where: {
        campaign_id: id,
        used_at: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: { used_at: 'asc' }
    });

    // Calculate overall metrics
    const totalUsage = usageData.length;
    const totalDiscount = usageData.reduce((sum, usage) => sum + Number(usage.discount_amount), 0);
    const averageDiscount = totalUsage > 0 ? totalDiscount / totalUsage : 0;
    const uniqueCustomers = new Set(usageData.map(u => u.customer_email)).size;

    // Group usage by time period
    const timeSeriesData = groupUsageByTime(usageData, query.granularity);

    // Calculate conversion metrics
    const conversionRate = campaign.maxUses 
      ? (((campaign.currentUses ?? 0) / campaign.maxUses) * 100).toFixed(2)
      : 'N/A';

    // Get recent usage details
    const recentUsage = usageData.slice(-10).reverse();

    // Calculate daily/weekly/monthly trends
    const trends = calculateTrends(usageData, query.granularity);

    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          code: campaign.code,
          name: campaign.name,
          type: campaign.type,
          value: campaign.value,
          maxUses: campaign.maxUses,
          currentUses: campaign.currentUses,
          validFrom: campaign.validFrom,
          validUntil: campaign.validUntil,
          isActive: campaign.isActive
        },
        metrics: {
          totalUsage,
          totalDiscount,
          averageDiscount,
          uniqueCustomers,
          conversionRate,
          usageRate: campaign.maxUses 
            ? `${campaign.currentUses ?? 0}/${campaign.maxUses}`
            : `${campaign.currentUses ?? 0}/∞`,
          remainingUses: campaign.maxUses 
            ? campaign.maxUses - (campaign.currentUses ?? 0)
            : 'Unlimited'
        },
        timeSeriesData,
        trends,
        recentUsage: recentUsage.map(usage => ({
          customerEmail: usage.customer_email,
          discountAmount: usage.discount_amount,
          usedAt: usage.used_at
        })),
        timeRange: query.timeRange,
        granularity: query.granularity
      }
    });

  } catch (error) {
    console.error('Error fetching campaign performance:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaign performance'
    }, { status: 500 });
  }
}

// ============================================================================
// 🛠️ HELPER FUNCTIONS
// ============================================================================

function groupUsageByTime(usageData: any[], granularity: string) {
  const grouped: { [key: string]: { count: number; discount: number } } = {};

  usageData.forEach(usage => {
    const date = new Date(usage.used_at);
    let key: string;

    switch (granularity) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = { count: 0, discount: 0 };
    }

    grouped[key].count++;
    grouped[key].discount += Number(usage.discount_amount);
  });

  return Object.entries(grouped)
    .map(([date, data]) => ({
      date,
      count: data.count,
      discount: data.discount
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateTrends(usageData: any[], granularity: string) {
  if (usageData.length < 2) {
    return {
      usage: { trend: 'stable', percentage: 0 },
      discount: { trend: 'stable', percentage: 0 }
    };
  }

  const timeSeriesData = groupUsageByTime(usageData, granularity);
  
  if (timeSeriesData.length < 2) {
    return {
      usage: { trend: 'stable', percentage: 0 },
      discount: { trend: 'stable', percentage: 0 }
    };
  }

  const recent = timeSeriesData.slice(-2);
  const [previous, current] = recent;

  // Calculate usage trend
  const usageTrend = previous.count === 0 
    ? (current.count > 0 ? 'up' : 'stable')
    : current.count > previous.count ? 'up' : current.count < previous.count ? 'down' : 'stable';
  
  const usagePercentage = previous.count === 0 
    ? (current.count > 0 ? 100 : 0)
    : ((current.count - previous.count) / previous.count) * 100;

  // Calculate discount trend
  const discountTrend = previous.discount === 0 
    ? (current.discount > 0 ? 'up' : 'stable')
    : current.discount > previous.discount ? 'up' : current.discount < previous.discount ? 'down' : 'stable';
  
  const discountPercentage = previous.discount === 0 
    ? (current.discount > 0 ? 100 : 0)
    : ((current.discount - previous.discount) / previous.discount) * 100;

  return {
    usage: { trend: usageTrend, percentage: Math.round(usagePercentage) },
    discount: { trend: discountTrend, percentage: Math.round(discountPercentage) }
  };
} 