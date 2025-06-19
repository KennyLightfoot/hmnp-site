import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import * as ghl from '@/lib/ghl';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

// Webhook endpoint secret from Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('🎯 Stripe webhook received');
  
  try {
    // Get the raw body as text for signature verification
    const body = await request.text();
    
    // Get the signature from headers
    const sig = headers().get('stripe-signature');
    
    if (!sig) {
      console.error('❌ No stripe-signature header found');
      return NextResponse.json(
        { error: 'No signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`✅ Webhook verified. Event type: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Processing checkout.session.completed');
  
  // Get booking ID from metadata
  const bookingId = session.metadata?.bookingId;
  
  if (!bookingId) {
    console.error('❌ No bookingId in session metadata');
    return;
  }

  try {
    // Update booking status to CONFIRMED
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        depositStatus: 'COMPLETED',
        stripePaymentIntentId: session.payment_intent as string,
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
      }
    });

    console.log(`✅ Booking ${bookingId} updated to CONFIRMED`);

    // Update GHL contact if we have a contact ID
    if (booking.ghlContactId) {
      try {
        // Remove pending payment tag and add confirmed tag
        await ghl.removeTagsFromContact(booking.ghlContactId, ['status:booking_pendingpayment']);
        await ghl.addTagsToContact(booking.ghlContactId, [
          'status:payment_completed',
          'status:booking_confirmed'
        ]);
        
        // Update custom fields
        const customFields = {
          cf_payment_date: new Date().toLocaleDateString('en-US'),
          cf_booking_status: 'CONFIRMED',
          cf_payment_status: 'COMPLETED',
        };
        
        await ghl.updateContact({
          id: booking.ghlContactId,
          customField: customFields,
          locationId: process.env.GHL_LOCATION_ID!,
        });
        
        console.log(`✅ GHL contact ${booking.ghlContactId} updated`);
      } catch (ghlError) {
        console.error('❌ Failed to update GHL contact:', ghlError);
        // Don't fail the webhook - booking is still confirmed
      }
    }

    // Send internal notification
    console.log(`🔔 Payment confirmed for booking ${bookingId}`);
    
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💳 Processing payment_intent.succeeded');
  
  // This might be triggered for various payment scenarios
  // Check if we have a booking ID in metadata
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (bookingId) {
    // Similar logic to checkout session completed
    console.log(`✅ Payment intent succeeded for booking ${bookingId}`);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Processing payment_intent.payment_failed');
  
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (!bookingId) {
    console.error('❌ No bookingId in payment intent metadata');
    return;
  }

  try {
    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
      }
    });

    if (!booking) {
      console.error(`❌ Booking ${bookingId} not found`);
      return;
    }

    // Update payment failed attempts
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositStatus: 'FAILED',
      }
    });

    // Update GHL contact if we have a contact ID
    if (booking.ghlContactId) {
      try {
        // Add failed payment tag
        await ghl.addTagsToContact(booking.ghlContactId, ['payment:failed']);
        
        // Update custom fields
        const customFields = {
          cf_payment_status: 'FAILED',
          cf_payment_failed_attempts: ((parseInt(booking.User_Booking_signerIdToUser?.email || '0') || 0) + 1).toString(),
        };
        
        await ghl.updateContact({
          id: booking.ghlContactId,
          customField: customFields,
          locationId: process.env.GHL_LOCATION_ID!,
        });
        
        console.log(`✅ GHL contact ${booking.ghlContactId} updated with payment failure`);
      } catch (ghlError) {
        console.error('❌ Failed to update GHL contact:', ghlError);
      }
    }

    console.log(`⚠️ Payment failed for booking ${bookingId}`);
    
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
    throw error;
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('💸 Processing charge.refunded');
  
  // Find the booking by payment intent ID
  if (!charge.payment_intent) {
    console.error('❌ No payment intent in charge object');
    return;
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: charge.payment_intent as string,
      },
      include: {
        service: true,
      }
    });

    if (!booking) {
      console.error(`❌ No booking found for payment intent ${charge.payment_intent}`);
      return;
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED_BY_CLIENT,
        depositStatus: 'REFUNDED',
      }
    });

    // Update GHL contact if we have a contact ID
    if (booking.ghlContactId) {
      try {
        await ghl.addTagsToContact(booking.ghlContactId, [
          'payment:refunded',
          'status:booking_cancelled'
        ]);
        
        const customFields = {
          cf_refund_status: 'PROCESSED',
          cf_refund_processed_amount: (charge.amount_refunded / 100).toFixed(2),
          cf_payment_status: 'REFUNDED',
        };
        
        await ghl.updateContact({
          id: booking.ghlContactId,
          customField: customFields,
          locationId: process.env.GHL_LOCATION_ID!,
        });
        
        console.log(`✅ GHL contact ${booking.ghlContactId} updated with refund`);
      } catch (ghlError) {
        console.error('❌ Failed to update GHL contact:', ghlError);
      }
    }

    console.log(`💸 Refund processed for booking ${booking.id}`);
    
  } catch (error) {
    console.error('❌ Error handling refund:', error);
    throw error;
  }
}

// Disable body parsing for webhook endpoints
export const config = {
  api: {
    bodyParser: false,
  },
};
