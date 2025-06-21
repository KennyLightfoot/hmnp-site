import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import * as ghl from '@/lib/ghl';
import { getStripeClient, verifyStripeWebhook } from '@/lib/stripe';
import { WebhookProcessor } from '@/lib/webhook-processor';
import type Stripe from 'stripe';

// Get Stripe client instance
const stripe = getStripeClient();

// Webhook endpoint secret from Stripe Dashboard with validation
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!endpointSecret) {
  console.error('❌ STRIPE_WEBHOOK_SECRET environment variable is not set');
}

export async function POST(request: NextRequest) {
  console.log('🎯 Stripe webhook received');
  
  // Check if Stripe is configured
  if (!stripe) {
    console.error('❌ Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  // Check if webhook secret is configured
  if (!endpointSecret) {
    console.error('❌ Stripe webhook secret not configured');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }
  
  try {
    // Get the raw body as text for signature verification
    const body = await request.text();
    
    // Get the signature from headers
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');
    
    if (!sig) {
      console.error('❌ No stripe-signature header found');
      return NextResponse.json(
        { error: 'No signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature using our centralized function
    let event: Stripe.Event;
    try {
      event = verifyStripeWebhook(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`✅ Webhook verified. Event type: ${event.type}`);

    // Process event with idempotency and race condition protection
    let result: { success: boolean; skipped: boolean; error?: string };

    switch (event.type) {
      case 'checkout.session.completed':
        result = await WebhookProcessor.processEvent<Stripe.Checkout.Session>(
          event,
          handleCheckoutSessionCompleted
        );
        break;
      
      case 'payment_intent.succeeded':
        result = await WebhookProcessor.processEvent<Stripe.PaymentIntent>(
          event,
          handlePaymentIntentSucceeded
        );
        break;
      
      case 'payment_intent.payment_failed':
        result = await WebhookProcessor.processEvent<Stripe.PaymentIntent>(
          event,
          handlePaymentIntentFailed
        );
        break;
      
      case 'charge.refunded':
        result = await WebhookProcessor.processEvent<Stripe.Charge>(
          event,
          handleChargeRefunded
        );
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
    }

    if (!result.success) {
      console.error(`❌ Failed to process webhook: ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Webhook processing failed' },
        { status: 500 }
      );
    }

    if (result.skipped) {
      console.log(`⏭️ Webhook processing skipped (already processed or concurrent processing)`);
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string) {
  console.log(`💳 Processing checkout.session.completed for event ${eventId}`);
  
  // Get booking ID from metadata
  const bookingId = session.metadata?.bookingId;
  
  if (!bookingId) {
    console.error(`❌ No bookingId in session metadata for event ${eventId}`);
    throw new Error('No bookingId in session metadata');
  }

  // Use transaction to ensure data consistency
  await prisma.$transaction(async (tx) => {
    // Get booking with current status check
    const existingBooking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
        Payment: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    if (!existingBooking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Check if already processed (idempotency at business logic level)
    if (existingBooking.status === BookingStatus.CONFIRMED && existingBooking.depositStatus === 'COMPLETED') {
      console.log(`✅ Booking ${bookingId} already confirmed, skipping`);
      return;
    }

    // Update booking status to CONFIRMED
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        depositStatus: 'COMPLETED',
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
      }
    });

    // Update Payment records
    if (session.payment_intent && existingBooking.Payment.length > 0) {
      await tx.payment.updateMany({
        where: {
          bookingId: bookingId,
          status: 'PENDING',
          paymentIntentId: session.payment_intent as string
        },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          transactionId: session.id,
          notes: `Checkout session completed: ${session.id}`
        }
      });
    }

    console.log(`✅ Booking ${bookingId} updated to CONFIRMED via transaction`);

    // GHL integration (outside critical transaction path but still atomic)
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
          cf_payment_method: 'stripe_checkout',
          cf_checkout_session_id: session.id,
        };
        
        await ghl.updateContact({
          id: booking.ghlContactId,
          customField: customFields,
          locationId: process.env.GHL_LOCATION_ID || "",
        });
        
        console.log(`✅ GHL contact ${booking.ghlContactId} updated`);
      } catch (ghlError) {
        console.error(`❌ Failed to update GHL contact for booking ${bookingId}:`, ghlError);
        // Log but don't fail the transaction - booking confirmation is more critical
      }
    }
  });

  console.log(`🔔 Payment confirmed for booking ${bookingId} via event ${eventId}`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, eventId: string) {
  console.log('💳 Processing payment_intent.succeeded');
  
  // This might be triggered for various payment scenarios
  // Check if we have a booking ID in metadata
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (bookingId) {
    // Similar logic to checkout session completed
    console.log(`✅ Payment intent succeeded for booking ${bookingId}`);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, eventId: string) {
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
          locationId: process.env.GHL_LOCATION_ID || "",
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

async function handleChargeRefunded(charge: Stripe.Charge, eventId: string) {
  console.log('💸 Processing charge.refunded');
  
  // Find the booking by payment intent ID
  if (!charge.payment_intent) {
    console.error('❌ No payment intent in charge object');
    return;
  }

  try {
    // Find booking by payment intent ID stored in notes or through Payment records
    const payments = await prisma.payment.findMany({
      where: {
        paymentIntentId: charge.payment_intent as string,
      },
      include: {
        Booking: {
          include: {
            service: true,
          }
        }
      }
    });

    const booking = payments.length > 0 ? payments[0].Booking : null;

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
          locationId: process.env.GHL_LOCATION_ID || "",
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

// Note: In App Router, raw body access is handled via request.text() or request.arrayBuffer()
// No need for bodyParser configuration like in Pages Router
