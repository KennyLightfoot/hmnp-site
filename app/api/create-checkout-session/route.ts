import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) 
  : null;

// Validation schema
const createCheckoutSessionSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().min(0.50, 'Amount must be at least $0.50'),
  mode: z.enum(['payment', 'subscription']).default('payment')
});

export async function POST(request: NextRequest) {
  try {
    console.log('Create checkout session API called');

    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe not configured - STRIPE_SECRET_KEY missing');
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment processing not available' 
        },
        { status: 503 }
      );
    }

    // Validate request body
    const body = await request.json();
    console.log('Request body received:', body);

    const { bookingId, amount, mode } = createCheckoutSessionSchema.parse(body);

    // Fetch booking details
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
      console.error('Booking not found:', bookingId);
      return NextResponse.json(
        { 
          success: false,
          error: 'Booking not found' 
        },
        { status: 404 }
      );
    }

    console.log('Booking found:', {
      id: booking.id,
      status: booking.status,
      customerEmail: booking.customerEmail,
      serviceName: booking.Service?.name
    });

    // Validate booking status
    if (booking.status !== 'PAYMENT_PENDING') {
      console.error('Booking not in PAYMENT_PENDING status:', booking.status);
      return NextResponse.json(
        { 
          success: false,
          error: `Booking is not pending payment (current status: ${booking.status})` 
        },
        { status: 400 }
      );
    }

    // Prepare checkout session data
    const serviceName = booking.Service?.name || 'Notary Service';
    const customerEmail = booking.customerEmail || undefined;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    console.log('Creating Stripe checkout session:', {
      amount: amount,
      amountInCents: amountInCents,
      serviceName: serviceName,
      customerEmail: customerEmail,
      bookingId: bookingId
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${serviceName} - Booking Deposit`,
              description: `Deposit payment for booking ${bookingId}`,
              metadata: {
                bookingId: bookingId,
                serviceType: 'booking_deposit'
              }
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${baseUrl}/booking/confirmation/${bookingId}?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/${bookingId}?payment_status=cancelled`,
      customer_email: customerEmail,
      metadata: {
        bookingId: bookingId,
        amount: amount.toString(),
        type: 'booking_payment',
        serviceName: serviceName
      },
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message: 'Complete your booking payment to confirm your appointment.'
        }
      }
    });

    console.log('Stripe checkout session created successfully:', {
      sessionId: session.id,
      checkoutUrl: session.url,
      expiresAt: new Date(session.expires_at * 1000).toISOString()
    });

    // Update booking with Stripe session information
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          stripeSessionId: session.id,
          updatedAt: new Date()
        }
      });
      console.log('Booking updated with Stripe session ID');
    } catch (updateError) {
      console.error('Failed to update booking with session ID:', updateError);
      // Continue anyway as the session was created successfully
    }

    // Return success response
    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      expiresAt: session.expires_at,
      message: 'Checkout session created successfully'
    });

  } catch (error) {
    console.error('Create checkout session failed:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', {
        type: error.type,
        code: error.code,
        message: error.message
      });
      
      return NextResponse.json({
        success: false,
        error: 'Payment processing error',
        details: error.message
      }, { status: 400 });
    }

    // Handle general errors
    return NextResponse.json({
      success: false,
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve existing session info (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        stripeSessionId: true,
        Service: {
          select: {
            name: true,
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

    return NextResponse.json({
      booking: {
        id: booking.id,
        status: booking.status,
        hasStripeSession: !!booking.stripeSessionId,
        requiresPayment: booking.status === 'PAYMENT_PENDING'
      }
    });

  } catch (error) {
    console.error('Get checkout session info failed:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve checkout session info' },
      { status: 500 }
    );
  }
}