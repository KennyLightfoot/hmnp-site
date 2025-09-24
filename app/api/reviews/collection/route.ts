import { NextRequest, NextResponse } from 'next/server';
import { ReviewCollectionAutomation } from '@/lib/reviews/collection-automation';
import { z } from 'zod';

/**
 * 🎯 Review Collection API - Phase 4 Enhancement
 * Houston Mobile Notary Pros - Automated Review Collection Triggers
 * 
 * API endpoint for triggering and managing automated review collection campaigns.
 */

// Validation schemas
const TriggerCollectionSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  trigger: z.enum(['manual', 'booking_completed', 'webhook', 'scheduled']).default('manual'),
  metadata: z.record(z.any()).optional()
});

const ProcessScheduledSchema = z.object({
  adminKey: z.string().min(1, 'Admin key is required'),
  dryRun: z.boolean().default(false)
});

/**
 * POST /api/reviews/collection - Trigger review collection for a booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = TriggerCollectionSchema.parse(body);

    console.log(`🎯 Review collection triggered:`, {
      bookingId: validatedData.bookingId,
      trigger: validatedData.trigger,
      timestamp: new Date().toISOString()
    });

    // Trigger the review collection automation
    await ReviewCollectionAutomation.triggerReviewCollection(validatedData.bookingId);

    return NextResponse.json({
      success: true,
      message: 'Review collection triggered successfully',
      bookingId: validatedData.bookingId,
      trigger: validatedData.trigger,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error triggering review collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger review collection' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/collection - Process scheduled review requests (cron job)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ProcessScheduledSchema.parse(body);

    // Verify admin access
    const expectedAdminKey = process.env.ADMIN_API_KEY || process.env.INTERNAL_API_KEY;
    if (!expectedAdminKey || validatedData.adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    console.log(`🔄 Processing scheduled review requests...`, {
      dryRun: validatedData.dryRun,
      timestamp: new Date().toISOString()
    });

    // Process scheduled requests
    await ReviewCollectionAutomation.processScheduledRequests();

    return NextResponse.json({
      success: true,
      message: validatedData.dryRun ? 'Dry run completed' : 'Scheduled requests processed',
      processedAt: new Date().toISOString(),
      dryRun: validatedData.dryRun
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing scheduled requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process scheduled requests' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews/collection - Get campaign statistics and status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    console.log(`📊 Fetching review collection stats...`);

    // Get campaign performance statistics
    const stats = await ReviewCollectionAutomation.getCampaignStats();

    return NextResponse.json({
      success: true,
      data: {
        campaigns: stats?.campaigns || [],
        ...(includeStats && {
          statistics: {
            totalReviews: stats?.totalReviews || 0,
            recentReviews: stats?.recentReviews || 0,
            averageRating: stats?.averageRating || 0
          }
        }),
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign statistics' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reviews/collection - Mark review as submitted
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    const schema = z.object({
      bookingId: z.string().min(1, 'Booking ID is required'),
      reviewId: z.string().min(1, 'Review ID is required'),
      action: z.enum(['mark_submitted', 'cancel_campaign']).default('mark_submitted')
    });

    const validatedData = schema.parse(body);

    console.log(`✅ Marking review as submitted:`, {
      bookingId: validatedData.bookingId,
      reviewId: validatedData.reviewId,
      action: validatedData.action
    });

    if (validatedData.action === 'mark_submitted') {
      await ReviewCollectionAutomation.markReviewSubmitted(
        validatedData.bookingId,
        validatedData.reviewId
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review status updated successfully',
      bookingId: validatedData.bookingId,
      reviewId: validatedData.reviewId,
      action: validatedData.action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating review status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review status' },
      { status: 500 }
    );
  }
} 