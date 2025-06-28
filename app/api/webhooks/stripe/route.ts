import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { BookingStatus } from '@prisma/client';
import * as ghl from '@/lib/ghl';
import { getStripeClient, verifyStripeWebhook } from '@/lib/stripe';
import { EnhancedStripeWebhookProcessor } from '@/lib/webhooks/stripe-enhanced';
import { Logger } from '@/lib/logger';
import type Stripe from 'stripe';

const logger = new Logger('StripeWebhookAPI');

// Get Stripe client instance
const stripe = getStripeClient();

// Webhook endpoint secret from Stripe Dashboard with validation
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!endpointSecret) {
  console.error('❌ STRIPE_WEBHOOK_SECRET environment variable is not set');
  throw new Error('Critical: STRIPE_WEBHOOK_SECRET environment variable is required for webhook security');
}

export async function POST(request: NextRequest) {
  logger.info('Stripe webhook received');
  
  // Check if Stripe is configured
  if (!stripe) {
    logger.error('Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  // Check if webhook secret is configured
  if (!endpointSecret) {
    logger.error('Stripe webhook secret not configured');
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
      logger.error('No stripe-signature header found');
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
      logger.error('Webhook signature verification failed', { error: err.message });
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Validate event data
    const validation = EnhancedStripeWebhookProcessor.validateEventData(event);
    if (!validation.valid) {
      logger.error('Invalid webhook event data', { errors: validation.errors });
      return NextResponse.json(
        { error: 'Invalid event data', details: validation.errors },
        { status: 400 }
      );
    }

    logger.info('Webhook verified', { eventType: event.type, eventId: event.id });

    // Process event with enhanced error handling and retry logic
    let result;

    switch (event.type) {
      case 'checkout.session.completed':
        result = await EnhancedStripeWebhookProcessor.processWebhook(
          event,
          handleCheckoutSessionCompleted
        );
        break;
      
      case 'payment_intent.succeeded':
        result = await EnhancedStripeWebhookProcessor.processWebhook(
          event,
          handlePaymentIntentSucceeded
        );
        break;
      
      case 'payment_intent.payment_failed':
        result = await EnhancedStripeWebhookProcessor.processWebhook(
          event,
          handlePaymentIntentFailed
        );
        break;
      
      case 'charge.refunded':
        result = await EnhancedStripeWebhookProcessor.processWebhook(
          event,
          handleChargeRefunded
        );
        break;
      
      default:
        logger.info('Unhandled event type', { eventType: event.type });
        return NextResponse.json({ received: true });
    }

    if (!result.success) {
      logger.error('Failed to process webhook', { 
        error: result.error,
        eventId: result.eventId,
        retryCount: result.retryCount 
      });
      return NextResponse.json(
        { 
          error: result.error || 'Webhook processing failed',
          eventId: result.eventId,
          retryCount: result.retryCount 
        },
        { status: 500 }
      );
    }

    if (result.skipped) {
      logger.info('Webhook processing skipped (already processed)', { eventId: result.eventId });
    }

    return NextResponse.json({ 
      received: true, 
      eventId: result.eventId,
      processed: result.processed,
      processingTimeMs: result.processingTimeMs
    });
  } catch (error) {
    logger.error('Webhook processing error', { error });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string) {
  logger.info('Processing checkout.session.completed', { eventId, sessionId: session.id });
  
  // Get booking ID from metadata
  const bookingId = session.metadata?.bookingId;
  
  if (!bookingId) {
    logger.error('No bookingId in session metadata', { eventId, sessionId: session.id });
    throw new Error('No bookingId in session metadata');
  }

  // Use enhanced database transaction with retry logic
  await EnhancedStripeWebhookProcessor.executeWithDatabaseRetry(async () => {
    await prisma.$transaction(async (tx) => {
      // Get booking with current status check
      const existingBooking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
        Service: true,
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
        Service: true,
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
  });

  logger.info('Payment confirmed for booking', { bookingId, eventId });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, eventId: string) {
  logger.info('Processing payment_intent.succeeded', { eventId, paymentIntentId: paymentIntent.id });
  
  // This might be triggered for various payment scenarios
  // Check if we have a booking ID in metadata
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (bookingId) {
    // Similar logic to checkout session completed
    logger.info('Payment intent succeeded for booking', { bookingId, eventId });
    
    // Update payment status with retry logic
    await EnhancedStripeWebhookProcessor.executeWithDatabaseRetry(async () => {
      await prisma.payment.updateMany({
        where: {
          bookingId: bookingId,
          paymentIntentId: paymentIntent.id,
          status: 'PENDING',
        },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          notes: `Payment intent succeeded: ${paymentIntent.id}`,
        },
      });
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, eventId: string) {
  logger.warn('Processing payment_intent.payment_failed', { eventId, paymentIntentId: paymentIntent.id });
  
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (!bookingId) {
    logger.error('No bookingId in payment intent metadata', { eventId, paymentIntentId: paymentIntent.id });
    return;
  }

  await EnhancedStripeWebhookProcessor.executeWithDatabaseRetry(async () => {
    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        User_Booking_signerIdToUser: true,
      }
    });

    if (!booking) {
      logger.error('Booking not found', { bookingId, eventId });
      throw new Error(`Booking ${bookingId} not found`);
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
        // Update booking record with failed attempt count
        const newFailedAttempts = (booking.paymentFailedAttempts || 0) + 1;
        await prisma.booking.update({
          where: { id: bookingId },
          data: { 
            paymentFailedAttempts: newFailedAttempts,
            lastPaymentFailure: new Date()
          }
        });

        // Add failed payment tag
        await ghl.addTagsToContact(booking.ghlContactId, ['payment:failed']);
        
        // Update custom fields
        const customFields = {
          cf_payment_status: 'FAILED',
          cf_payment_failed_attempts: newFailedAttempts.toString(),
        };
        
        await ghl.updateContact({
          id: booking.ghlContactId,
          customField: customFields,
          locationId: process.env.GHL_LOCATION_ID || "",
        });
        
        logger.info('GHL contact updated with payment failure', { contactId: booking.ghlContactId, bookingId });
      } catch (ghlError) {
        logger.error('Failed to update GHL contact', { error: ghlError, bookingId });
      }
    }

    logger.warn('Payment failed for booking', { bookingId, eventId });
  });
}

async function handleChargeRefunded(charge: Stripe.Charge, eventId: string) {
  logger.info('Processing charge.refunded', { eventId, chargeId: charge.id });
  
  // Find the booking by payment intent ID
  if (!charge.payment_intent) {
    logger.error('No payment intent in charge object', { eventId, chargeId: charge.id });
    return;
  }

  await EnhancedStripeWebhookProcessor.executeWithDatabaseRetry(async () => {
    // Find booking by payment intent ID stored in notes or through Payment records
    const payments = await prisma.payment.findMany({
      where: {
        paymentIntentId: charge.payment_intent as string,
      },
      include: {
        Booking: {
          include: {
            Service: true,
          }
        }
      }
    });

    const booking = payments.length > 0 ? payments[0].Booking : null;

    if (!booking) {
      logger.error('No booking found for payment intent', { 
        paymentIntentId: charge.payment_intent,
        eventId 
      });
      throw new Error(`No booking found for payment intent ${charge.payment_intent}`);
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
        
        logger.info('GHL contact updated with refund', { contactId: booking.ghlContactId, bookingId: booking.id });
      } catch (ghlError) {
        logger.error('Failed to update GHL contact', { error: ghlError, bookingId: booking.id });
      }
    }

    logger.info('Refund processed for booking', { bookingId: booking.id, eventId });
  });
}

// Note: In App Router, raw body access is handled via request.text() or request.arrayBuffer()
// No need for bodyParser configuration like in Pages Router
