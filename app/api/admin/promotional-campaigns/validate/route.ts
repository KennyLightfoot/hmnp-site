/**
 * Promotional Code Validation API
 * Phase 3: Real-time promo code validation for customer bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ============================================================================
// 🎯 VALIDATION SCHEMAS
// ============================================================================

const ValidateCodeSchema = z.object({
  code: z.string().min(1),
  serviceType: z.string(),
  customerType: z.enum(['new', 'returning', 'loyalty']),
  customerEmail: z.string().email().optional(),
  orderValue: z.number().min(0)
});

// ============================================================================
// 🚀 API HANDLERS
// ============================================================================

/**
 * POST /api/admin/promotional-campaigns/validate
 * Validate a promotional code for real-time use
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, serviceType, customerType, customerEmail, orderValue } = ValidateCodeSchema.parse(body);

    // Find the campaign
    const campaign = await prisma.promotionalCampaign.findUnique({
      where: { 
        code: code.toUpperCase(),
        isActive: true
      }
    });

    if (!campaign) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Invalid promotional code'
      });
    }

    // Check if campaign is currently active (date range)
    const now = new Date();
    if (now < campaign.validFrom || now > campaign.validUntil) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Promotional code is not currently active'
      });
    }

    // Check usage limits
    if (campaign.maxUses && campaign.currentUses >= campaign.maxUses) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Promotional code has reached its usage limit'
      });
    }

    // Check service type restrictions
    if (campaign.serviceTypes.length > 0 && !campaign.serviceTypes.includes(serviceType)) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Promotional code is not valid for ${serviceType} service`
      });
    }

    // Check customer type restrictions
    if (campaign.customerTypes.length > 0 && !campaign.customerTypes.includes(customerType)) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Promotional code is not valid for ${customerType} customers`
      });
    }

    // Check minimum order value
    if (orderValue < campaign.minOrderValue) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Promotional code requires a minimum order value of $${campaign.minOrderValue}`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (campaign.type === 'percentage') {
      discountAmount = (orderValue * Number(campaign.value)) / 100;
      if (campaign.maxDiscount && discountAmount > campaign.maxDiscount) {
        discountAmount = campaign.maxDiscount;
      }
    } else {
      discountAmount = Number(campaign.value);
    }

    // Ensure discount doesn't exceed order value
    discountAmount = Math.min(discountAmount, orderValue);

    // Check if customer has already used this code (if email provided)
    let hasUsedBefore = false;
    if (customerEmail) {
      const previousUsage = await prisma.promoCodeUsageTracking.findFirst({
        where: {
          campaignId: campaign.id,
          customerEmail: customerEmail
        }
      });
      hasUsedBefore = !!previousUsage;
    }

    return NextResponse.json({
      success: true,
      valid: true,
      campaign: {
        id: campaign.id,
        code: campaign.code,
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        value: campaign.value
      },
      discount: {
        amount: discountAmount,
        type: campaign.type,
        percentage: campaign.type === 'percentage' ? Number(campaign.value) : undefined,
        maxDiscount: campaign.maxDiscount,
        originalValue: orderValue,
        finalValue: orderValue - discountAmount
      },
      usage: {
        current: campaign.currentUses,
        maximum: campaign.maxUses,
        remaining: campaign.maxUses ? campaign.maxUses - campaign.currentUses : null,
        hasUsedBefore
      },
      restrictions: {
        serviceTypes: campaign.serviceTypes,
        customerTypes: campaign.customerTypes,
        minOrderValue: campaign.minOrderValue,
        validFrom: campaign.validFrom,
        validUntil: campaign.validUntil
      }
    });

  } catch (error) {
    console.error('Error validating promotional code:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      valid: false,
      error: 'Failed to validate promotional code'
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/promotional-campaigns/validate/stats
 * Get validation statistics for monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get usage statistics
    const [totalUsage, totalDiscount, activeCampaigns, expiredCampaigns] = await Promise.all([
      prisma.promoCodeUsageTracking.count({
        where: {
          usedAt: {
            gte: startDate,
            lte: now
          }
        }
      }),
      prisma.promoCodeUsageTracking.aggregate({
        where: {
          usedAt: {
            gte: startDate,
            lte: now
          }
        },
        _sum: {
          discountAmount: true
        }
      }),
      prisma.promotionalCampaign.count({
        where: {
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now }
        }
      }),
      prisma.promotionalCampaign.count({
        where: {
          validUntil: { lt: now }
        }
      })
    ]);

    // Get top performing campaigns
    const topCampaigns = await prisma.promotionalCampaign.findMany({
      take: 5,
      orderBy: {
        currentUses: 'desc'
      },
      include: {
        usage: {
          where: {
            usedAt: {
              gte: startDate,
              lte: now
            }
          },
          select: {
            discountAmount: true
          }
        }
      }
    });

    const topCampaignsWithStats = topCampaigns.map(campaign => ({
      id: campaign.id,
      code: campaign.code,
      name: campaign.name,
      currentUses: campaign.currentUses,
      maxUses: campaign.maxUses,
      recentUsage: campaign.usage.length,
      recentDiscount: campaign.usage.reduce((sum, usage) => sum + Number(usage.discountAmount), 0)
    }));

    return NextResponse.json({
      success: true,
      data: {
        timeRange,
        stats: {
          totalUsage,
          totalDiscount: totalDiscount._sum.discountAmount || 0,
          activeCampaigns,
          expiredCampaigns,
          averageDiscount: totalUsage > 0 ? (totalDiscount._sum.discountAmount || 0) / totalUsage : 0
        },
        topCampaigns: topCampaignsWithStats
      }
    });

  } catch (error) {
    console.error('Error fetching validation stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch validation statistics'
    }, { status: 500 });
  }
} 