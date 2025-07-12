import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * 🎯 Reviews API - Individual Review Management
 * Houston Mobile Notary Pros - Phase 4 SEO Enhancement
 * 
 * Handles CRUD operations for individual reviews to support
 * rich snippets and enhanced review collection automation.
 */

// Validation schemas
const CreateReviewSchema = z.object({
  reviewerName: z.string().min(1, 'Reviewer name is required').max(200),
  reviewerEmail: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(1, 'Review text is required'),
  serviceType: z.string().optional(),
  platform: z.enum(['google', 'internal', 'yelp', 'facebook']).default('internal'),
  bookingId: z.string().optional(),
  ghlContactId: z.string().optional(),
  isVerified: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

const UpdateReviewSchema = z.object({
  isApproved: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  responseText: z.string().optional(),
  helpfulCount: z.number().int().optional()
});

/**
 * GET /api/reviews - Fetch reviews with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const platform = searchParams.get('platform');
    const featured = searchParams.get('featured') === 'true';
    const approved = searchParams.get('approved') !== 'false'; // Default to approved only
    const minRating = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined;
    const serviceType = searchParams.get('serviceType');
    const includeStats = searchParams.get('includeStats') === 'true';

    // Build where clause
    const where: any = {
      isApproved: approved
    };

    if (platform) where.platform = platform;
    if (featured) where.isFeatured = true;
    if (minRating) where.rating = { gte: minRating };
    if (serviceType) where.serviceType = serviceType;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          booking: {
            select: {
              id: true,
              serviceId: true,
              service: {
                select: {
                  name: true,
                  serviceType: true
                }
              }
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    // Calculate aggregate statistics if requested
    let stats = null;
    if (includeStats) {
      const aggregations = await prisma.review.aggregate({
        where: { isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
        _min: { rating: true },
        _max: { rating: true }
      });

      // Get rating distribution
      const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { isApproved: true },
        _count: { rating: true },
        orderBy: { rating: 'desc' }
      });

      stats = {
        averageRating: aggregations._avg.rating || 0,
        totalReviews: aggregations._count.rating || 0,
        minRating: aggregations._min.rating || 0,
        maxRating: aggregations._max.rating || 0,
        ratingDistribution: ratingDistribution.reduce((acc, curr) => {
          acc[curr.rating] = curr._count.rating;
          return acc;
        }, {} as Record<number, number>)
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1
        },
        ...(stats && { stats })
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews - Create a new review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateReviewSchema.parse(body);

    // Check for duplicate external reviews
    if (validatedData.platform !== 'internal' && body.externalId) {
      const existingReview = await prisma.review.findUnique({
        where: { externalId: body.externalId }
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'Review already exists' },
          { status: 409 }
        );
      }
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        ...validatedData,
        externalId: body.externalId || null,
        externalUrl: body.externalUrl || null,
        // Auto-approve internal reviews, require approval for external
        isApproved: validatedData.platform === 'internal'
      },
      include: {
        booking: {
          select: {
            id: true,
            service: {
              select: {
                name: true,
                serviceType: true
              }
            }
          }
        }
      }
    });

    // If this is from a booking, mark the booking as having a review
    if (validatedData.bookingId) {
      await prisma.booking.update({
        where: { id: validatedData.bookingId },
        data: {
          notes: `Customer review submitted: ${validatedData.rating} stars`
        }
      });

      // 🎯 NEW: Mark review collection campaign as complete
      try {
        const { ReviewCollectionAutomation } = await import('@/lib/reviews/collection-automation');
        await ReviewCollectionAutomation.markReviewSubmitted(validatedData.bookingId, review.id);
        console.log(`✅ Review collection marked complete for booking: ${validatedData.bookingId}`);
      } catch (collectionError) {
        console.error('Error marking review collection complete:', collectionError);
        // Don't fail the review creation if collection marking fails
      }
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/[id] - Update review (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateReviewSchema.parse(body);

    // Add response date if response text is provided
    const updateData: any = { ...validatedData };
    if (validatedData.responseText && !updateData.responseDate) {
      updateData.responseDate = new Date();
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        booking: {
          select: {
            id: true,
            service: {
              select: {
                name: true,
                serviceType: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
} 