/**
 * Create Deposit Payment API
 * Handles Stripe payment creation for booking deposits
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) 
  : null;

// Validation schema
const createDepositSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  paymentMethod: z.enum(['STRIPE_ONLINE', 'CASH_ON_SERVICE']),
  promoCode: z.string().optional(),
  returnUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const { bookingId, paymentMethod, promoCode, returnUrl } = createDepositSchema.parse(body);

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: {
          select: {
            name: true,
            basePrice: true,
            depositAmount: true,
            requiresDeposit: true
          }
        }
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

    // Check if service requires deposit
    if (!booking.Service.requiresDeposit) {
      // Auto-confirm booking if no deposit required
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'CONFIRMED',
          depositStatus: 'NOT_REQUIRED'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Booking confirmed - no deposit required',
        paymentRequired: false,
        booking: { id: bookingId, status: 'CONFIRMED' }
      });
    }

    // Check promo code for deposit skip
    if (promoCode) {
      const promoValidation = await validatePromoCodeForDepositSkip(promoCode, bookingId);
      if (promoValidation.skipDeposit) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { 
            status: 'CONFIRMED',
            depositStatus: 'WAIVED_PROMO',
            appliedPromoCode: promoCode
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Booking confirmed - deposit waived by promo code',
          paymentRequired: false,
          promoApplied: promoCode,
          booking: { id: bookingId, status: 'CONFIRMED' }
        });
      }
    }

    const depositAmount = booking.Service.depositAmount?.toNumber() || 0;

    if (paymentMethod === 'CASH_ON_SERVICE') {
      // Handle cash payment option
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'CONFIRMED',
          depositStatus: 'CASH_ON_SERVICE',
          paymentMethod: 'CASH_ON_SERVICE'
        }
      });

      // Create payment record for tracking
      await prisma.payment.create({
        data: {
          bookingId: bookingId,
          amount: new Prisma.Decimal(depositAmount),
          status: 'PENDING',
          paymentMethod: 'CASH_ON_SERVICE',
          notes: 'Customer will pay cash deposit on service date'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Booking confirmed - cash payment on service date',
        paymentRequired: false,
        paymentMethod: 'CASH_ON_SERVICE',
        depositAmount,
        booking: { id: bookingId, status: 'CONFIRMED' }
      });
    }

    // Handle Stripe online payment
    if (paymentMethod === 'STRIPE_ONLINE') {
      if (!stripe) {
        return NextResponse.json(
          { error: 'Online payment not available' },
          { status: 503 }
        );
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit for ${booking.Service.name}`,
              description: `Booking deposit - Service: ${booking.Service.name}`,
            },
            unit_amount: Math.round(depositAmount * 100), // Convert to cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: returnUrl || `${process.env.NEXTAUTH_URL}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: returnUrl || `${process.env.NEXTAUTH_URL}/booking-payment-cancelled?booking_id=${bookingId}`,
        metadata: { 
          bookingId: bookingId,
          paymentType: 'deposit',
          depositAmount: depositAmount.toString()
        },
        customer_email: booking.customerEmail || undefined,
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          bookingId: bookingId,
          amount: new Prisma.Decimal(depositAmount),
          status: 'PENDING',
          paymentMethod: 'STRIPE_CHECKOUT',
          paymentIntentId: session.payment_intent as string || null,
          notes: `Stripe checkout session: ${session.id}`
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Stripe checkout session created',
        paymentRequired: true,
        paymentMethod: 'STRIPE_ONLINE',
        depositAmount,
        checkoutUrl: session.url,
        sessionId: session.id,
        booking: { id: bookingId, status: 'PAYMENT_PENDING' }
      });
    }

    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Deposit payment creation failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create deposit payment' },
      { status: 500 }
    );
  }
}

/**
 * Validate promo code for deposit skip capability
 */
async function validatePromoCodeForDepositSkip(promoCode: string, bookingId: string) {
  try {
    // Check if promo code exists and allows deposit skip
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: promoCode.toUpperCase(),
        isActive: true,
        OR: [
          { validFrom: { lte: new Date() } },
          { validFrom: null }
        ],
        OR: [
          { validUntil: { gte: new Date() } },
          { validUntil: null }
        ]
      }
    });

    if (!promo) {
      return { skipDeposit: false, message: 'Invalid or expired promo code' };
    }

    // Check if promo code specifically allows deposit skip
    if (promo.skipDeposit) {
      // Check usage limits
      if (promo.maxUses && promo.usageCount >= promo.maxUses) {
        return { skipDeposit: false, message: 'Promo code usage limit exceeded' };
      }

      // Increment usage count
      await prisma.promoCode.update({
        where: { id: promo.id },
        data: { 
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });

      return { 
        skipDeposit: true, 
        message: 'Deposit waived by promo code',
        promoCode: promo 
      };
    }

    return { skipDeposit: false, message: 'Promo code does not waive deposit' };

  } catch (error) {
    console.error('Promo code validation failed:', error);
    return { skipDeposit: false, message: 'Promo code validation failed' };
  }
}