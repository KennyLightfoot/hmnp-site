/**
 * Enhanced Payment API
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Features:
 * - Multiple payment method support (Card, ACH, Apple Pay, Google Pay)
 * - Enhanced error handling and recovery
 * - Payment method detection and optimization
 * - Security and compliance features
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnhancedStripeService, getEnhancedStripeErrorMessage } from '@/lib/stripe-enhanced';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Enhanced validation schemas
const EnhancedPaymentRequestSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive().max(10000, 'Amount too large'),
  currency: z.literal('usd').default('usd'),
  paymentMethod: z.enum(['card', 'ach', 'apple_pay', 'google_pay', 'cash', 'check']),
  paymentMethodId: z.string().optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.string()).optional(),
  returnUrl: z.string().url().optional(),
  savePaymentMethod: z.boolean().default(false),
  
  // ACH specific fields
  bankAccountToken: z.string().optional(),
  mandateData: z.object({
    customerAcceptance: z.object({
      type: z.literal('online'),
      online: z.object({
        ipAddress: z.string(),
        userAgent: z.string()
      })
    })
  }).optional(),
  
  // Wallet specific fields
  walletToken: z.string().optional(),
  
  // Payment option
  paymentOption: z.enum(['full', 'deposit']).default('full'),
  depositAmount: z.number().optional()
});

const PaymentRecoveryRequestSchema = z.object({
  paymentIntentId: z.string().min(1),
  newPaymentMethodId: z.string().optional(),
  failureReason: z.string().optional(),
  retryCount: z.number().min(0).max(5)
});

const PaymentMethodAttachSchema = z.object({
  paymentMethodId: z.string().min(1),
  customerId: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await request.headers;
    const origin = headersList.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Validate request body
    const validatedData = EnhancedPaymentRequestSchema.parse(body);
    
    const {
      bookingId,
      amount,
      currency,
      paymentMethod,
      paymentMethodId,
      customerId,
      customerEmail,
      customerName,
      description,
      metadata = {},
      returnUrl,
      savePaymentMethod,
      bankAccountToken,
      mandateData,
      walletToken,
      paymentOption,
      depositAmount
    } = validatedData;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        customer: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Calculate payment amount based on option
    const paymentAmount = paymentOption === 'deposit' && depositAmount 
      ? depositAmount 
      : amount;

    // Prepare metadata
    const enhancedMetadata = {
      bookingId,
      serviceType: booking.service?.type || 'unknown',
      customerEmail,
      paymentMethod,
      paymentOption,
      source: 'hmnp_enhanced_payment_system',
      ...metadata
    };

    // Create or get customer
    let stripeCustomerId = customerId;
    if (!stripeCustomerId) {
      const existingCustomer = await EnhancedStripeService.getCustomerPaymentMethods(customerEmail);
      if (existingCustomer.length > 0) {
        stripeCustomerId = existingCustomer[0].customer as string;
      } else {
        const customer = await EnhancedStripeService.createEnhancedSetupIntent(customerEmail);
        stripeCustomerId = customer.customer as string;
      }
    }

    let paymentIntent: any;

    // Create payment intent based on payment method
    switch (paymentMethod) {
      case 'ach':
        if (!bankAccountToken || !mandateData) {
          return NextResponse.json(
            { error: 'Bank account token and mandate data required for ACH payments' },
            { status: 400 }
          );
        }
        paymentIntent = await EnhancedStripeService.createACHPaymentIntent({
          amount: Math.round(paymentAmount * 100),
          currency,
          customerId: stripeCustomerId,
          description,
          receiptEmail: customerEmail,
          metadata: enhancedMetadata,
          returnUrl: returnUrl || `${origin}/payment/success`,
          bankAccountToken,
          mandateData
        });
        break;

      case 'apple_pay':
        if (!walletToken) {
          return NextResponse.json(
            { error: 'Apple Pay token required' },
            { status: 400 }
          );
        }
        paymentIntent = await EnhancedStripeService.createApplePayPaymentIntent({
          amount: Math.round(paymentAmount * 100),
          currency,
          customerId: stripeCustomerId,
          description,
          receiptEmail: customerEmail,
          metadata: enhancedMetadata,
          returnUrl: returnUrl || `${origin}/payment/success`,
          applePayToken: walletToken
        });
        break;

      case 'google_pay':
        if (!walletToken) {
          return NextResponse.json(
            { error: 'Google Pay token required' },
            { status: 400 }
          );
        }
        paymentIntent = await EnhancedStripeService.createGooglePayPaymentIntent({
          amount: Math.round(paymentAmount * 100),
          currency,
          customerId: stripeCustomerId,
          description,
          receiptEmail: customerEmail,
          metadata: enhancedMetadata,
          returnUrl: returnUrl || `${origin}/payment/success`,
          googlePayToken: walletToken
        });
        break;

      case 'card':
      default:
        paymentIntent = await EnhancedStripeService.createEnhancedPaymentIntent({
          amount: Math.round(paymentAmount * 100),
          currency,
          customerId: stripeCustomerId,
          paymentMethodId,
          description,
          receiptEmail: customerEmail,
          metadata: enhancedMetadata,
          returnUrl: returnUrl || `${origin}/payment/success`,
          setupFutureUsage: savePaymentMethod ? 'off_session' : undefined
        });
        break;
    }

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: paymentAmount,
        status: 'PENDING',
        provider: 'STRIPE',
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: paymentMethod,
        metadata: enhancedMetadata
      }
    });

    // Update booking with payment info
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PENDING',
        stripePaymentIntentId: paymentIntent.id
      }
    });

    logger.info('Enhanced payment intent created successfully', {
      paymentIntentId: paymentIntent.id,
      bookingId,
      amount: paymentAmount,
      paymentMethod,
      customerEmail
    });

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      paymentId: payment.id,
      amount: paymentAmount,
      currency,
      requiresAction: paymentIntent.status === 'requires_action',
      nextAction: paymentIntent.next_action
    });

  } catch (error) {
    logger.error('Enhanced payment creation failed', {
      error: error.message,
      stack: error.stack
    });

    const errorMessage = getEnhancedStripeErrorMessage(error);
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: error.code || 'unknown_error'
      },
      { status: 400 }
    );
  }
}

// Handle payment recovery
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PaymentRecoveryRequestSchema.parse(body);
    
    const { paymentIntentId, newPaymentMethodId, failureReason, retryCount } = validatedData;

    // Handle payment recovery
    const paymentIntent = await EnhancedStripeService.handlePaymentRecovery(
      paymentIntentId,
      newPaymentMethodId
    );

    // Update payment record
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: {
        status: paymentIntent.status === 'succeeded' ? 'PAID' : 'PENDING',
        updatedAt: new Date(),
        ...(paymentIntent.status === 'succeeded' && { paidAt: new Date() })
      }
    });

    // Update booking if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      await prisma.booking.updateMany({
        where: { stripePaymentIntentId: paymentIntentId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED'
        }
      });
    }

    logger.info('Payment recovery processed', {
      paymentIntentId,
      status: paymentIntent.status,
      retryCount
    });

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
      requiresAction: paymentIntent.status === 'requires_action',
      nextAction: paymentIntent.next_action
    });

  } catch (error) {
    logger.error('Payment recovery failed', {
      error: error.message,
      stack: error.stack
    });

    const errorMessage = getEnhancedStripeErrorMessage(error);
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: error.code || 'unknown_error'
      },
      { status: 400 }
    );
  }
}

// Handle payment method attachment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PaymentMethodAttachSchema.parse(body);
    
    const { paymentMethodId, customerId } = validatedData;

    // Attach payment method to customer
    const paymentMethod = await EnhancedStripeService.attachPaymentMethod(
      paymentMethodId,
      customerId
    );

    logger.info('Payment method attached successfully', {
      paymentMethodId,
      customerId,
      type: paymentMethod.type
    });

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        } : undefined,
        billingDetails: paymentMethod.billing_details
      }
    });

  } catch (error) {
    logger.error('Payment method attachment failed', {
      error: error.message,
      stack: error.stack
    });

    const errorMessage = getEnhancedStripeErrorMessage(error);
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: error.code || 'unknown_error'
      },
      { status: 400 }
    );
  }
} 