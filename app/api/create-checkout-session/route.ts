/**
 * Stripe Checkout Session API
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Creates Stripe Checkout sessions for payment processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { withPaymentSecurity } from '@/lib/security/comprehensive-security';

// Validation schemas
const CheckoutSessionRequestSchema = z.object({
  bookingId: z.string().trim().optional(),
  paymentId: z.string().trim().optional(),
  mode: z.enum(['payment', 'subscription', 'setup']).default('payment'),
  customerId: z.string().trim().optional(),
  customerEmail: z.string().trim().email().max(254),
  customerName: z.string().trim().min(1).max(100),
  // amount/description are no longer accepted from client unless no bookingId is present
  amount: z.number().positive().max(100000, 'Amount too large').optional(),
  currency: z.string().trim().default('usd').optional(),
  description: z.string().trim().min(1).max(255).optional(),
  metadata: z.record(z.any()).optional(),
  successUrl: z.string().trim().url().optional(),
  cancelUrl: z.string().trim().url().optional(),
  allowPromotionCodes: z.boolean().default(true).optional(),
  billingAddressCollection: z.enum(['auto', 'required']).default('auto').optional(),
  paymentMethodTypes: z.array(z.string().trim()).default(['card']).optional(),
  submitType: z.enum(['auto', 'book', 'donate', 'pay']).default('pay').optional(),
  invoiceCreation: z
    .object({
      enabled: z.boolean().default(true),
      invoiceData: z
        .object({
          description: z.string().trim().optional(),
          metadata: z.record(z.any()).optional(),
          footer: z.string().trim().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const POST = withPaymentSecurity(
  async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Disallow free bookings if explicitly provided
    if (typeof body?.amount === 'number' && body.amount === 0) {
      return NextResponse.json({ success: false, error: 'free bookings not supported' }, { status: 400 });
    }

    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Validate request body
    const validatedData = CheckoutSessionRequestSchema.parse(body);
    
    const {
      bookingId,
      paymentId,
      mode = 'payment',
      customerId,
      customerEmail,
      customerName,
      amount: clientAmount,
      currency: clientCurrency,
      description: clientDescription,
      metadata = {},
      successUrl,
      cancelUrl,
      allowPromotionCodes = true,
      billingAddressCollection = 'auto',
      paymentMethodTypes = ['card'],
      submitType = 'pay',
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
        customer = existingCustomer.data[0]!.id;
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

    // Determine amount/description on server
    let amountCents: number;
    let description: string;
    const currency = clientCurrency || 'usd';

    if (bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true } });
      if (!booking || !booking.priceAtBooking) {
        return NextResponse.json({ success: false, error: 'Invalid booking' }, { status: 400 });
      }
      amountCents = Math.round(Number(booking.priceAtBooking) * 100);
      description = booking.service?.name || 'Notary Service';
    } else {
      if (typeof clientAmount !== 'number' || !clientDescription) {
        return NextResponse.json({ success: false, error: 'amount and description required' }, { status: 400 });
      }
      amountCents = Math.round(clientAmount * 100);
      description = clientDescription;
    }

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
          unit_amount: amountCents
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
        // @ts-ignore - newPayment is generated model alias
        await (prisma as any).payment.update({
          where: { id: paymentId },
          data: {
            paymentIntentId: session.id,
            status: 'PROCESSING',
            metadata: {
              checkoutSession: session,
              customerEmail,
              customerName
            }
          }
        });
      } catch (error: any) {
        logger.error('Failed to update payment record with session ID', {
          paymentId,
          sessionId: session.id,
          error: getErrorMessage(error)
        });
      }
    }

    // Update booking record if provided
    if (bookingId) {
      try {
        // @ts-ignore - newBooking model alias
        await (prisma as any).newBooking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PROCESSING',
            metadata: {
              paymentIntentId: session.id,
              customerEmail,
              customerName
            }
          }
        });
      } catch (error: any) {
        logger.error('Failed to update booking record with session ID', {
          bookingId,
          sessionId: session.id,
          error: getErrorMessage(error)
        });
      }
    }

    logger.info('Checkout session created successfully', {
      sessionId: session.id,
      bookingId,
      paymentId,
      amount: amountCents / 100,
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
      error: getErrorMessage(error),
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
        message: getErrorMessage(error)
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create checkout session',
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
  },
  process.env.NODE_ENV === 'test' ? { csrf: { enabled: false } } : undefined
);

export const GET = withRateLimit('payment_create', 'checkout_session_get')(async (request: NextRequest) => {
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
      error: getErrorMessage(error)
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve session',
      message: getErrorMessage(error)
    }, { status: 500 });
  }
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
