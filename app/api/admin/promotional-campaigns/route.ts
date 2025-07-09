/**
 * Admin API for Promotional Campaigns Management
 * Phase 3: Database-driven promotional campaign system
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database-connection';
import { Prisma } from '@prisma/client';

// ============================================================================
// 🎯 VALIDATION SCHEMAS
// ============================================================================

const CreateCampaignSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed_amount', 'first_time', 'referral', 'loyalty', 'seasonal']),
  value: z.number().min(0),
  maxDiscount: z.number().min(0).optional(),
  minOrderValue: z.number().min(0).default(0),
  maxUses: z.number().min(1).optional(),
  serviceTypes: z.array(z.string()).default([]),
  customerTypes: z.array(z.enum(['new', 'returning', 'loyalty'])).default([]),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().default(true)
});

const UpdateCampaignSchema = CreateCampaignSchema.partial().extend({
  id: z.string().uuid()
});

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sortBy: z.enum(['createdAt', 'name', 'code', 'validFrom', 'validUntil']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ============================================================================
// 🚀 API HANDLERS
// ============================================================================

/**
 * GET /api/admin/promotional-campaigns
 * Get all promotional campaigns with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    // Build filters
    const where: Prisma.PromotionalCampaignWhereInput = {};
    
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status !== 'all') {
      where.isActive = query.status === 'active';
    }

    // Build sorting
    const orderBy: Prisma.PromotionalCampaignOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder
    };

    // Execute queries
    const [campaigns, totalCount] = await Promise.all([
      prisma.promotionalCampaign.findMany({
        where,
        orderBy,
        take: query.limit,
        skip: (query.page - 1) * query.limit,
        include: {
          performance: {
            take: 1,
            orderBy: { date: 'desc' }
          },
          usage: {
            take: 5,
            orderBy: { usedAt: 'desc' }
          }
        }
      }),
      prisma.promotionalCampaign.count({ where })
    ]);

    // Calculate performance metrics
    const campaignsWithMetrics = await Promise.all(
      campaigns.map(async (campaign) => {
        const [totalUsage, totalRevenue] = await Promise.all([
          prisma.promoCodeUsageTracking.count({
            where: { campaignId: campaign.id }
          }),
          prisma.promoCodeUsageTracking.aggregate({
            where: { campaignId: campaign.id },
            _sum: { discountAmount: true }
          })
        ]);

        return {
          ...campaign,
          metrics: {
            totalUsage,
            totalRevenue: totalRevenue._sum.discountAmount || 0,
            conversionRate: campaign.maxUses 
              ? ((totalUsage / campaign.maxUses) * 100).toFixed(2)
              : 'N/A',
            remainingUses: campaign.maxUses ? campaign.maxUses - campaign.currentUses : 'Unlimited'
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaignsWithMetrics,
        pagination: {
          page: query.page,
          limit: query.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / query.limit),
          hasNext: query.page < Math.ceil(totalCount / query.limit),
          hasPrev: query.page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching promotional campaigns:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaigns'
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/promotional-campaigns
 * Create a new promotional campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const campaignData = CreateCampaignSchema.parse(body);

    // Check if code already exists
    const existingCampaign = await prisma.promotionalCampaign.findUnique({
      where: { code: campaignData.code }
    });

    if (existingCampaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign code already exists'
      }, { status: 400 });
    }

    // Validate date range
    const validFrom = new Date(campaignData.validFrom);
    const validUntil = new Date(campaignData.validUntil);
    
    if (validFrom >= validUntil) {
      return NextResponse.json({
        success: false,
        error: 'Valid from date must be before valid until date'
      }, { status: 400 });
    }

    // Create campaign
    const campaign = await prisma.promotionalCampaign.create({
      data: {
        ...campaignData,
        validFrom,
        validUntil,
        createdBy: 'admin' // TODO: Get from session
      }
    });

    // Log the creation
    console.log(`🎫 New promotional campaign created: ${campaign.code} (${campaign.name})`);

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('Error creating promotional campaign:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create campaign'
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/promotional-campaigns
 * Update an existing promotional campaign
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = UpdateCampaignSchema.parse(body);

    // Check if campaign exists
    const existingCampaign = await prisma.promotionalCampaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    // Check if code is being changed and conflicts
    if (updateData.code && updateData.code !== existingCampaign.code) {
      const codeExists = await prisma.promotionalCampaign.findUnique({
        where: { code: updateData.code }
      });

      if (codeExists) {
        return NextResponse.json({
          success: false,
          error: 'Campaign code already exists'
        }, { status: 400 });
      }
    }

    // Validate date range if dates are being updated
    if (updateData.validFrom || updateData.validUntil) {
      const validFrom = new Date(updateData.validFrom || existingCampaign.validFrom);
      const validUntil = new Date(updateData.validUntil || existingCampaign.validUntil);
      
      if (validFrom >= validUntil) {
        return NextResponse.json({
          success: false,
          error: 'Valid from date must be before valid until date'
        }, { status: 400 });
      }
    }

    // Update campaign
    const updatedCampaign = await prisma.promotionalCampaign.update({
      where: { id },
      data: {
        ...updateData,
        validFrom: updateData.validFrom ? new Date(updateData.validFrom) : undefined,
        validUntil: updateData.validUntil ? new Date(updateData.validUntil) : undefined,
        updatedAt: new Date()
      }
    });

    console.log(`🎫 Promotional campaign updated: ${updatedCampaign.code}`);

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error('Error updating promotional campaign:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update campaign'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/promotional-campaigns
 * Delete a promotional campaign
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    // Check if campaign exists
    const existingCampaign = await prisma.promotionalCampaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 });
    }

    // Check if campaign has been used
    const usageCount = await prisma.promoCodeUsageTracking.count({
      where: { campaignId: id }
    });

    if (usageCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete campaign that has been used. Consider deactivating it instead.'
      }, { status: 400 });
    }

    // Delete campaign
    await prisma.promotionalCampaign.delete({
      where: { id }
    });

    console.log(`🗑️ Promotional campaign deleted: ${existingCampaign.code}`);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting promotional campaign:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete campaign'
    }, { status: 500 });
  }
} 