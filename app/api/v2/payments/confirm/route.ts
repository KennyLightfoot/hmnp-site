import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, paymentMethodId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const paymentIntent = await StripeService.confirmPaymentIntent(
      paymentIntentId,
      paymentMethodId
    );

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('V2 confirm payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment intent' },
      { status: 500 }
    );
  }
} 