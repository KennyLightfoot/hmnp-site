import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';

// Validate Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
  throw new Error('Stripe configuration missing: STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        User_Booking_signerIdToUser: true,
        promoCode: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'PAYMENT_PENDING') {
      return NextResponse.json(
        { error: 'Booking is not pending payment' },
        { status: 400 }
      );
    }

    // SECURITY FIX: Validate payment amount against stored pricing snapshot
    // This prevents client-side tampering with payment amounts
    if (!booking.priceSnapshotCents) {
      return NextResponse.json(
        { error: 'Booking pricing data corrupted - please create a new booking' },
        { status: 400 }
      );
    }

    // Use the validated pricing snapshot stored during booking creation
    const amountInCents = booking.priceSnapshotCents;

    // Additional validation: ensure the amount matches expected calculation
    const depositRequired = booking.Service.requiresDeposit && booking.Service.depositAmount;
    const expectedAmountCents = depositRequired 
      ? Math.round((booking.Service.depositAmount?.toNumber() || 0) * 100)
      : booking.priceSnapshotCents;

    // Allow for promo code discounts already applied in the snapshot
    if (amountInCents < 0 || amountInCents > expectedAmountCents) {
      console.error('Payment amount validation failed', {
        bookingId: booking.id,
        snapshotCents: booking.priceSnapshotCents,
        expectedCents: expectedAmountCents,
        discountApplied: booking.promoCodeDiscount?.toNumber() || 0
      });
      
      return NextResponse.json(
        { error: 'Payment amount validation failed' },
        { status: 400 }
      );
    }

    if (amountInCents <= 0) {
      return NextResponse.json(
        { error: 'No payment required for this booking' },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking.id,
        serviceId: booking.serviceId,
        customerId: booking.signerId || '',
        customerEmail: booking.User_Booking_signerIdToUser?.email || '',
        serviceName: booking.service.name,
        promoCode: booking.promoCode?.code || '',
        originalAmount: booking.service.depositAmount.toString(),
        discountAmount: booking.promoCodeDiscount?.toString() || '0'
      },
      description: `Deposit for ${booking.service.name} - ${booking.User_Booking_signerIdToUser?.name}`,
      receipt_email: booking.User_Booking_signerIdToUser?.email || undefined,
    });

    // Store payment intent ID in the booking record for security tracking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: paymentIntent.id,
        securityFlags: {
          ...booking.securityFlags as any,
          paymentIntentCreated: true,
          paymentIntentValidated: true,
          validatedAmount: amountInCents,
          createdAt: new Date().toISOString()
        }
      }
    });

    // Create Payment record with security validation
    await prisma.payment.create({
      data: {
        id: `pay_${booking.id}_${Date.now()}`,
        bookingId: booking.id,
        amount: amountInCents / 100, // Convert back to decimal for database
        status: 'PENDING',
        provider: 'STRIPE',
        paymentIntentId: paymentIntent.id,
        notes: `Deposit payment - Amount validated: $${(amountInCents / 100).toFixed(2)}`
      }
    });

    // Security audit logging
    await prisma.securityAuditLog.create({
      data: {
        userEmail: booking.User_Booking_signerIdToUser?.email || booking.customerEmail || 'unknown',
        userId: booking.signerId,
        action: 'PAYMENT_INTENT_CREATED',
        details: {
          bookingId: booking.id,
          paymentIntentId: paymentIntent.id,
          validatedAmount: amountInCents,
          originalAmount: booking.service.depositAmount?.toNumber() || booking.service.basePrice.toNumber(),
          discountApplied: booking.promoCodeDiscount?.toNumber() || 0,
          serviceId: booking.serviceId
        },
        severity: 'INFO'
      }
    });

    logger.info('Payment intent created with amount validation', {
      bookingId: booking.id,
      paymentIntentId: paymentIntent.id,
      validatedAmount: amountInCents
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      booking: {
        id: booking.id,
        service: booking.service.name,
        scheduledDateTime: booking.scheduledDateTime,
        customer: booking.User_Booking_signerIdToUser?.name,
        promoCode: booking.promoCode ? {
          code: booking.promoCode.code,
          discountAmount: booking.promoCodeDiscount
        } : null
      }
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: 'Payment processing error: ' + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 