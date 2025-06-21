import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
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
        service: true,
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

    // Calculate amount using centralized pricing utility
    const { PricingUtils } = await import('@/lib/pricing-utils');
    const paymentAmount = PricingUtils.getBookingAmount({
      priceAtBooking: booking.service.basePrice,
      depositAmount: booking.depositAmount,
      service: {
        requiresDeposit: booking.service.requiresDeposit,
        depositAmount: booking.service.depositAmount
      }
    });
    const amountInCents = PricingUtils.toCents(paymentAmount);

    if (amountInCents <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
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

    // Store payment intent ID in the database
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        // Store payment intent ID in a field if you have one, or create a Payment record
      }
    });

    // Create Payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.depositAmount!,
        status: 'PENDING',
        provider: 'STRIPE',
        paymentIntentId: paymentIntent.id,
        notes: 'Deposit payment'
      }
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