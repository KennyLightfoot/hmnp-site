/**
 * 🔗 HMNP V2 Stripe Webhook Handler
 * Secure webhook processing for payment events
 * Automatic payment confirmation and booking updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

// ============================================================================
// 🔌 STRIPE INITIALIZATION
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ============================================================================
// 🎯 WEBHOOK HANDLER (POST)
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json({
      success: false,
      error: 'Missing Stripe signature'
    }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Invalid signature'
    }, { status: 400 });
  }

  console.log(`🔔 Stripe webhook received: ${event.type}`, { requestId, eventId: event.id });

  try {
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, requestId);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, requestId);
        break;
        
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent, requestId);
        break;
        
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute, requestId);
        break;
        
      default:
        console.log(`🤷 Unhandled webhook event type: ${event.type}`);
    }

    // Log webhook event to database
    await logWebhookEvent(event, requestId, 'processed');

    return NextResponse.json({
      success: true,
      message: `Webhook ${event.type} processed successfully`,
      eventId: event.id,
      requestId
    });

  } catch (error) {
    console.error('Webhook processing error:', error, { requestId, eventId: event.id });
    
    // Log failed webhook event
    await logWebhookEvent(event, requestId, 'failed', error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed',
      eventId: event.id,
      requestId
    }, { status: 500 });
  }
}

// ============================================================================
// 🎯 PAYMENT EVENT HANDLERS
// ============================================================================

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, requestId: string) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`, { requestId });
  
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) {
    console.error('No booking ID in payment intent metadata', { paymentIntentId: paymentIntent.id });
    return;
  }

  // 🔒 ATOMIC TRANSACTION: Update payment and booking
  await prisma.$transaction(async (tx) => {
    // Find and update payment
    const payment = await tx.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: {
        booking: {
          include: {
            service: { select: { name: true, type: true } }
          }
        }
      }
    });

    if (!payment) {
      console.error('Payment not found for payment intent', { paymentIntentId: paymentIntent.id });
      return;
    }

    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripeChargeId: paymentIntent.charges.data[0]?.id,
        paymentMethod: paymentIntent.payment_method_types[0],
        lastFour: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
        brand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand
      }
    });

    // Update booking status
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        confirmedAt: new Date()
      }
    });

    // Create audit log
    await tx.bookingAuditLog.create({
      data: {
        bookingId: payment.bookingId,
        action: 'PAYMENT_PROCESSED',
        actorType: 'SYSTEM',
        actorId: 'stripe_webhook',
        changes: JSON.stringify({
          paymentId: payment.id,
          stripePaymentIntentId: paymentIntent.id,
          amount: payment.amount,
          stripeChargeId: paymentIntent.charges.data[0]?.id
        }),
        metadata: JSON.stringify({
          requestId,
          stripeEventType: 'payment_intent.succeeded',
          webhookId: paymentIntent.id
        })
      }
    });

    console.log(`📋 Booking confirmed: ${payment.bookingId}`, { requestId });
  });

  // Queue post-payment integrations
  await queuePostPaymentIntegrations(bookingId, {
    sendConfirmationEmail: true,
    sendConfirmationSMS: true,
    updateGHLContact: true,
    createCalendarEvent: true,
    scheduleReminders: true
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, requestId: string) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`, { requestId });
  
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) {
    console.error('No booking ID in payment intent metadata', { paymentIntentId: paymentIntent.id });
    return;
  }

  // 🔒 ATOMIC TRANSACTION: Update payment status
  await prisma.$transaction(async (tx) => {
    // Find and update payment
    const payment = await tx.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) {
      console.error('Payment not found for payment intent', { paymentIntentId: paymentIntent.id });
      return;
    }

    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failedAt: new Date()
      }
    });

    // Update booking payment status
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: 'FAILED'
      }
    });

    // Create audit log
    await tx.bookingAuditLog.create({
      data: {
        bookingId: payment.bookingId,
        action: 'PAYMENT_FAILED',
        actorType: 'SYSTEM',
        actorId: 'stripe_webhook',
        changes: JSON.stringify({
          paymentId: payment.id,
          stripePaymentIntentId: paymentIntent.id,
          lastPaymentError: paymentIntent.last_payment_error?.message
        }),
        metadata: JSON.stringify({
          requestId,
          stripeEventType: 'payment_intent.payment_failed',
          webhookId: paymentIntent.id
        })
      }
    });
  });

  // Queue failure notifications
  await queuePaymentFailureNotifications(bookingId, {
    sendFailureEmail: true,
    scheduleRetryReminder: true
  });
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent, requestId: string) {
  console.log(`🚫 Payment canceled: ${paymentIntent.id}`, { requestId });
  
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (!payment) return;

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failedAt: new Date()
      }
    });

    await tx.bookingAuditLog.create({
      data: {
        bookingId: payment.bookingId,
        action: 'PAYMENT_CANCELLED',
        actorType: 'SYSTEM',
        actorId: 'stripe_webhook',
        changes: JSON.stringify({
          paymentId: payment.id,
          stripePaymentIntentId: paymentIntent.id
        }),
        metadata: JSON.stringify({
          requestId,
          stripeEventType: 'payment_intent.canceled'
        })
      }
    });
  });
}

async function handleChargeDispute(dispute: Stripe.Dispute, requestId: string) {
  console.log(`⚠️ Charge dispute created: ${dispute.id}`, { requestId });
  
  // Find payment by charge ID
  const payment = await prisma.payment.findFirst({
    where: { stripeChargeId: dispute.charge as string },
    include: { booking: true }
  });

  if (!payment) {
    console.error('Payment not found for disputed charge', { chargeId: dispute.charge });
    return;
  }

  // Create audit log for dispute
  await prisma.bookingAuditLog.create({
    data: {
      bookingId: payment.bookingId,
      action: 'PAYMENT_DISPUTED',
      actorType: 'SYSTEM',
      actorId: 'stripe_webhook',
      changes: JSON.stringify({
        paymentId: payment.id,
        disputeId: dispute.id,
        disputeAmount: dispute.amount,
        disputeReason: dispute.reason
      }),
      metadata: JSON.stringify({
        requestId,
        stripeEventType: 'charge.dispute.created'
      })
    }
  });

  // TODO: Queue admin notification for dispute
  console.log(`🚨 ADMIN ALERT: Payment dispute for booking ${payment.bookingId}`);
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

async function logWebhookEvent(event: Stripe.Event, requestId: string, status: string, errorMessage?: string) {
  try {
    await prisma.stripe_webhook_log.create({
      data: {
        stripe_event_id: event.id,
        event_type: event.type,
        processed_at: new Date(),
        status: status,
        booking_id: event.data.object.metadata?.bookingId || null,
        error_message: errorMessage || null,
        metadata: JSON.stringify({
          requestId,
          eventData: event.data.object
        })
      }
    });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

async function queuePostPaymentIntegrations(bookingId: string, options: {
  sendConfirmationEmail: boolean;
  sendConfirmationSMS: boolean;
  updateGHLContact: boolean;
  createCalendarEvent: boolean;
  scheduleReminders: boolean;
}) {
  console.log('🚀 Queuing post-payment integrations:', bookingId, options);
  
  // TODO: Implement actual background job queue
  // For now, just log what would be queued
}

async function queuePaymentFailureNotifications(bookingId: string, options: {
  sendFailureEmail: boolean;
  scheduleRetryReminder: boolean;
}) {
  console.log('📧 Queuing payment failure notifications:', bookingId, options);
  
  // TODO: Implement actual notification queue
}

function generateRequestId(): string {
  return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}