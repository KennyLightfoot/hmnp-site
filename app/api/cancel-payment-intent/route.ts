import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    console.log('[PAYMENT INTENT CLEANUP] Cancelling payment intent:', paymentIntentId);

    // Try to cancel the payment intent to prevent memory leaks
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      console.log('[PAYMENT INTENT CLEANUP] Successfully cancelled:', paymentIntent.id);
      
      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      });
    } catch (stripeError: any) {
      // Payment intent might already be confirmed, expired, or in a non-cancellable state
      if (stripeError.code === 'payment_intent_unexpected_state') {
        console.log('[PAYMENT INTENT CLEANUP] Payment intent not cancellable (already processed):', paymentIntentId);
        return NextResponse.json({
          success: true,
          message: 'Payment intent already processed',
          paymentIntentId
        });
      }
      
      console.error('[PAYMENT INTENT CLEANUP] Stripe error:', stripeError);
      throw stripeError;
    }

  } catch (error) {
    console.error('[PAYMENT INTENT CLEANUP] Error cancelling payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Payment cancellation error: ' + error.message,
          code: error.code
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}