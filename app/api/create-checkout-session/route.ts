/**
 * Stripe Checkout Session API
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Creates Stripe Checkout sessions for payment processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const CheckoutSessionRequestSchema = z.object({
  bookingId: z.string().optional(),
  paymentId: z.string().optional(),
  mode: z.enum(['payment', 'subscription', 'setup']).default('payment'),
  customerId: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  amount: z.number().min(1),
  currency: z.string().default('usd'),
  description: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  allowPromotionCodes: z.boolean().default(true),
  billingAddressCollection: z.enum(['auto', 'required']).default('auto'),
  paymentMethodTypes: z.array(z.string()).default(['card']),
  submitType: z.enum(['auto', 'book', 'donate', 'pay']).default('pay'),
  invoiceCreation: z.object({
    enabled: z.boolean().default(true),
    invoiceData: z.object({
      description: z.string().optional(),
      metadata: z.record(z.any()).optional(),
      footer: z.string().optional()
    }).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Validate request body
    const validatedData = CheckoutSessionRequestSchema.parse(body);
    
    const {
      bookingId,
      paymentId,
      mode,
      customerId,
      customerEmail,
      customerName,
      amount,
      currency,
      description,
      metadata = {},
      successUrl,
      cancelUrl,
      allowPromotionCodes,
      billingAddressCollection,
      paymentMethodTypes,
      submitType,
      invoiceCreation
    } = validatedData;

    // Set default URLs if not provided
    const defaultSuccessUrl = successUrl || `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = cancelUrl || `${origin}/booking/cancel`;

    // Prepare customer data
    let customer: string | undefined = customerId;
    if (!customer) {
      // Create or retrieve customer
      const existingCustomer = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });

      if (existingCustomer.data.length > 0) {
        customer = existingCustomer.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            source: 'hmnp_booking_system',
            ...metadata
          }
        });
        customer = newCustomer.id;
      }
    }

    // Prepare line items
    const lineItems = [
      {
        price_data: {
          currency,
          product_data: {
            name: description,
            description: `Houston Mobile Notary Pros - ${description}`,
            metadata: {
              bookingId: bookingId || '',
              paymentId: paymentId || '',
              ...metadata
            }
          },
          unit_amount: Math.round(amount * 100) // Convert to cents
        },
        quantity: 1
      }
    ];

    // Prepare checkout session parameters
    const sessionParams: any = {
      customer,
      line_items: lineItems,
      mode,
      payment_method_types: paymentMethodTypes,
      billing_address_collection: billingAddressCollection,
      allow_promotion_codes: allowPromotionCodes,
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      submit_type: submitType,
      metadata: {
        bookingId: bookingId || '',
        paymentId: paymentId || '',
        customerEmail,
        source: 'hmnp_booking_system',
        ...metadata
      }
    };

    // Add invoice creation if enabled
    if (invoiceCreation?.enabled) {
      sessionParams.invoice_creation = {
        enabled: true,
        invoice_data: {
          description: invoiceCreation.invoiceData?.description || description,
          metadata: {
            bookingId: bookingId || '',
            source: 'hmnp_booking_system',
            ...invoiceCreation.invoiceData?.metadata
          },
          footer: invoiceCreation.invoiceData?.footer || 'Thank you for choosing Houston Mobile Notary Pros!'
        }
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update payment record if provided
    if (paymentId) {
      try {
        await prisma.newPayment.update({
          where: { id: paymentId },
          data: {
            stripeSessionId: session.id,
            status: 'PROCESSING',
            metadata: {
              checkoutSession: session,
              customerEmail,
              customerName
            }
          }
        });
      } catch (error) {
        logger.error('Failed to update payment record with session ID', {
          paymentId,
          sessionId: session.id,
          error: error.message
        });
      }
    }

    // Update booking record if provided
    if (bookingId) {
      try {
        await prisma.newBooking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PROCESSING',
            metadata: {
              stripeSessionId: session.id,
              customerEmail,
              customerName
            }
          }
        });
      } catch (error) {
        logger.error('Failed to update booking record with session ID', {
          bookingId,
          sessionId: session.id,
          error: error.message
        });
      }
    }

    logger.info('Checkout session created successfully', {
      sessionId: session.id,
      bookingId,
      paymentId,
      amount,
      customerEmail: customerEmail.replace(/(.{2}).*@/, '$1***@') // Mask email
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      customer: customer,
      message: 'Checkout session created successfully'
    });

  } catch (error: any) {
    logger.error('Checkout session creation failed', {
      error: error.message,
      stack: error.stack
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    if (error.type === 'StripeError') {
      return NextResponse.json({
        success: false,
        error: 'Payment processing error',
        message: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create checkout session',
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    // Return session details
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        payment_intent: session.payment_intent
      }
    });

  } catch (error: any) {
    logger.error('Failed to retrieve checkout session', {
      error: error.message
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve session',
      message: error.message
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';