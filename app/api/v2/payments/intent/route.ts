import { NextRequest, NextResponse } from 'next/server';
import { stripe, StripeService } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = 'usd',
      customerId,
      paymentMethodId,
      description,
      metadata,
      receiptEmail,
    } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    const paymentIntent = await StripeService.createPaymentIntent({
      amount: Math.round(Number(amount)),
      currency,
      customerId,
      paymentMethodId,
      description,
      metadata,
      receiptEmail,
    });

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('V2 create payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Payment intent id is required' },
      { status: 400 }
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    return NextResponse.json({ paymentIntent });
  } catch (error) {
    console.error('V2 get payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    );
  }
} 