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
const BOOKING_ID_REGEX = /^[a-zA-Z0-9\-_]{1,50}$/; // Alphanumeric with hyphens/underscores
const CUSTOMER_ID_REGEX = /^[a-zA-Z0-9\-_]{1,50}$/; // Stripe customer ID format
const NAME_REGEX = /^[a-zA-Z\s\-'\.]{1,100}$/; // Names with common characters
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Stricter email pattern
const DESCRIPTION_REGEX = /^[\s\S]{1,255}$/; // Description with any printable chars
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/; // Basic URL validation

const EnhancedPaymentRequestSchema = z.object({
  bookingId: z
    .string()
    .trim()
    .min(1, 'Booking ID is required')
    .max(50, 'Booking ID must be 50 characters or less')
    .regex(BOOKING_ID_REGEX, 'Booking ID contains invalid characters'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .min(0.50, 'Minimum amount is $0.50')
    .max(10000, 'Maximum amount is $10,000')
    .refine((val) => Number.isFinite(val), 'Amount must be a valid number')
    .refine((val) => Number((val * 100).toFixed(0)) / 100 === val, 'Amount must have at most 2 decimal places'),
  currency: z.literal('usd', {
    errorMap: () => ({ message: 'Only USD currency is supported' })
  }).default('usd'),
  paymentMethod: z.enum(['card', 'ach', 'apple_pay', 'google_pay', 'cash', 'check'], {
    errorMap: () => ({ message: 'Please select a valid payment method' })
  }),
  paymentMethodId: z
    .string()
    .trim()
    .min(1, 'Payment method ID is required when provided')
    .max(100, 'Payment method ID is too long')
    .optional(),
  customerId: z
    .string()
    .trim()
    .min(1, 'Customer ID is required when provided')
    .max(50, 'Customer ID must be 50 characters or less')
    .regex(CUSTOMER_ID_REGEX, 'Customer ID contains invalid characters')
    .optional(),
  customerEmail: z
    .string()
    .trim()
    .min(1, 'Customer email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .regex(EMAIL_REGEX, 'Email address format is invalid')
    .refine((email) => !email.includes('..'), 'Email address format is invalid')
    .refine((email) => !email.startsWith('.') && !email.endsWith('.'), 'Email address format is invalid'),
  customerName: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name must be 100 characters or less')
    .regex(NAME_REGEX, 'Customer name contains invalid characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(255, 'Description must be 255 characters or less')
    .regex(DESCRIPTION_REGEX, 'Description contains invalid characters'),
  metadata: z.record(z.string().max(500, 'Metadata value too long')).optional(),
  returnUrl: z
    .string()
    .trim()
    .url('Please enter a valid URL')
    .max(2048, 'URL is too long')
    .regex(URL_REGEX, 'URL format is invalid')
    .optional(),
  savePaymentMethod: z.boolean().default(false),
  
  // ACH specific fields
  bankAccountToken: z
    .string()
    .trim()
    .min(1, 'Bank account token is required when provided')
    .max(100, 'Bank account token is too long')
    .optional(),
  mandateData: z
    .object({
      customerAcceptance: z.object({
        type: z.literal('online', {
          errorMap: () => ({ message: 'Only online customer acceptance is supported' })
        }),
        online: z.object({
          ipAddress: z
            .string()
            .trim()
            .min(1, 'IP address is required')
            .regex(IP_REGEX, 'Please enter a valid IP address'),
          userAgent: z
            .string()
            .trim()
            .min(1, 'User agent is required')
            .max(500, 'User agent is too long'),
        }),
      }),
    })
    .optional(),
  
  // Wallet specific fields
  walletToken: z
    .string()
    .trim()
    .min(1, 'Wallet token is required when provided')
    .max(100, 'Wallet token is too long')
    .optional(),
  
  // Payment option
  paymentOption: z.enum(['full', 'deposit'], {
    errorMap: () => ({ message: 'Please select either full payment or deposit' })
  }).default('full'),
  depositAmount: z
    .number()
    .positive('Deposit amount must be greater than 0')
    .min(0.50, 'Minimum deposit amount is $0.50')
    .max(5000, 'Maximum deposit amount is $5,000')
    .refine((val) => Number.isFinite(val), 'Deposit amount must be a valid number')
    .refine((val) => Number((val * 100).toFixed(0)) / 100 === val, 'Deposit amount must have at most 2 decimal places')
    .optional(),
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