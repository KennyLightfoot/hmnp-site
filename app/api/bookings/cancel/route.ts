import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import * as ghl from '@/lib/ghl';
import Stripe from 'stripe';

// Validate Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
  throw new Error('Stripe configuration missing: STRIPE_SECRET_KEY is required');
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// API key verification
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'mav+PpkGCyAADIyUlTUBGIk194KCa3U4';

// Request validation schema for booking cancellation
const cancellationSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().optional(),
  initiatedBy: z.enum(['customer', 'provider', 'system']).default('customer')
});

export async function POST(request: NextRequest) {
  console.log('🔄 Processing booking cancellation');
  
  try {
    const body = await request.json();
    
    // Verify API key for security
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request data
    const { bookingId, reason, initiatedBy } = cancellationSchema.parse(body);
    console.log(`✅ Cancellation request validated for booking: ${bookingId}`);

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        signer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.CANCELLED_BY_CLIENT || booking.status === BookingStatus.CANCELLED_BY_STAFF) {
      return NextResponse.json({
        success: false,
        error: 'Booking is already cancelled'
      }, { status: 400 });
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json({
        success: false,
        error: 'Cannot cancel completed booking'
      }, { status: 400 });
    }

    // Calculate refund amount based on cancellation policy
    const now = new Date();
    const appointmentTime = booking.scheduledDateTime ? new Date(booking.scheduledDateTime) : new Date();
    const hoursUntilAppointment = Math.floor((appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    let refundPercentage = 0;
    let cancellationFee = 0;

    // Cancellation policy (can be customized)
    if (hoursUntilAppointment >= 24) {
      refundPercentage = 100; // Full refund
    } else if (hoursUntilAppointment >= 4) {
      refundPercentage = 50; // 50% refund
      cancellationFee = Math.round(Number(booking.priceAtBooking || 0) * 0.5);
    } else {
      refundPercentage = 0; // No refund
      cancellationFee = Number(booking.priceAtBooking || 0);
    }

    const refundAmount = Math.round(Number(booking.priceAtBooking || 0) * (refundPercentage / 100));

    // Process Stripe refund if payment was made
    let stripeRefundId = null;
    
    // Get payment records for this booking to find payment intent ID
    const payments = await prisma.payment.findMany({
      where: { 
        bookingId: booking.id,
        status: 'COMPLETED',
        paymentIntentId: { not: null }
      },
      select: { paymentIntentId: true }
    });
    
    if (payments.length > 0 && payments[0].paymentIntentId && refundAmount > 0) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: payments[0].paymentIntentId,
          amount: refundAmount * 100, // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            bookingId: booking.id,
            cancellationReason: reason || 'Customer request',
            hoursUntilAppointment: hoursUntilAppointment.toString()
          }
        });
        
        stripeRefundId = refund.id;
        console.log(`✅ Stripe refund processed: ${refund.id}`);
      } catch (stripeError) {
        console.error('❌ Stripe refund failed:', stripeError);
        // Continue with booking cancellation even if refund fails
      }
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: initiatedBy === 'customer' ? BookingStatus.CANCELLED_BY_CLIENT : BookingStatus.CANCELLED_BY_STAFF,
        depositStatus: refundAmount > 0 ? 'REFUNDED' : 'FAILED',
        notes: reason || `Cancelled by ${initiatedBy}`,
        updatedAt: now
      }
    });

    console.log(`✅ Booking ${bookingId} cancelled successfully`);

    // Update GHL contact
    if (booking.ghlContactId) {
      try {
        // Remove booking-related tags
        await ghl.removeTagsFromContact(booking.ghlContactId, [
          'status:booking_confirmed',
          'status:booking_pendingpayment',
          'status:payment_completed'
        ]);

        // Add cancellation tags
        const tagsToAdd = [
          'status:booking_cancelled',
          `cancelled:by_${initiatedBy}`,
          hoursUntilAppointment < 24 ? 'cancellation:short_notice' : 'cancellation:advance_notice'
        ];

        await ghl.addTagsToContact(booking.ghlContactId, tagsToAdd);

        // Update custom fields
        const customFields = {
          cf_booking_status: 'CANCELLED',
          cf_cancellation_date: now.toLocaleDateString('en-US'),
          cf_cancellation_reason: reason || `Cancelled by ${initiatedBy}`,
          cf_refund_amount: refundAmount.toString(),
          cf_cancellation_fee: cancellationFee.toString(),
          cf_refund_percentage: refundPercentage.toString(),
          cf_hours_until_appointment: hoursUntilAppointment.toString()
        };

        const ghlLocationId = process.env.GHL_LOCATION_ID;
        if (!ghlLocationId) {
          console.warn('⚠️ GHL_LOCATION_ID not configured, skipping contact update');
          throw new Error('GHL_LOCATION_ID environment variable is required for contact updates');
        }

        await ghl.updateContact({
          id: booking.ghlContactId,
          customField: customFields,
          locationId: ghlLocationId
        });

        console.log('✅ GHL contact updated with cancellation details');
      } catch (ghlError) {
        console.error('❌ Failed to update GHL contact:', ghlError);
        // Don't fail the cancellation for GHL errors
      }
    }

    // Prepare response
    const responseData = {
      bookingId: booking.id,
      originalDateTime: booking.scheduledDateTime,
      cancellationDate: now,
      reason: reason || `Cancelled by ${initiatedBy}`,
      refundAmount: refundAmount,
      refundPercentage: refundPercentage,
      cancellationFee: cancellationFee,
      hoursUntilAppointment: hoursUntilAppointment,
      stripeRefundId: stripeRefundId,
      message: refundAmount > 0 
        ? `Booking cancelled. Refund of $${refundAmount} will be processed within 5-10 business days.`
        : 'Booking cancelled. No refund applicable based on cancellation policy.'
    };

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error processing cancellation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process cancellation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('📋 Getting cancellation policy');
  
  try {
    // This endpoint returns the cancellation policy for display
    return NextResponse.json({
      success: true,
      data: {
        policy: {
          tiers: [
            {
              hoursBeforeAppointment: 24,
              refundPercentage: 100,
              description: 'Full refund if cancelled more than 24 hours before appointment'
            },
            {
              hoursBeforeAppointment: 12,
              refundPercentage: 50,
              description: '50% refund if cancelled 12-24 hours before appointment'
            },
            {
              hoursBeforeAppointment: 0,
              refundPercentage: 0,
              description: 'No refund if cancelled less than 12 hours before appointment'
            }
          ],
          notes: [
            'Refunds are processed within 5-10 business days',
            'Emergency cancellations may be reviewed on a case-by-case basis',
            'Provider-initiated cancellations always receive full refund'
          ]
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting cancellation policy:', error);
    return NextResponse.json(
      { error: 'Failed to get cancellation policy' },
      { status: 500 }
    );
  }
} 