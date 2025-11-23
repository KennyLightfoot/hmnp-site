/**
 * Stripe Webhook Handler
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Processes Stripe webhook events for automated invoicing and payment management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, StripeService } from '@/lib/stripe';
import { webhookProcessor } from '@/lib/webhook-processor';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { addJob } from '@/lib/queue/queue-config';
import { BookingStatus } from '@/lib/prisma-types';

// Stripe webhook event types we handle
const HANDLED_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.requires_action',
  'payment_intent.canceled',
  'payment_method.attached',
  'customer.created',
  'customer.updated',
  'invoice.created',
  'invoice.finalized',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'checkout.session.completed',
  'checkout.session.expired'
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error('Stripe webhook missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      logger.error('Stripe webhook signature verification failed', { error: getErrorMessage(error) });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check if we handle this event type
    if (!HANDLED_EVENTS.includes(event.type as any)) {
      logger.info('Unhandled Stripe webhook event', { type: event.type });
      return NextResponse.json({ message: 'Event type not handled' }, { status: 200 });
    }

    // Process webhook with idempotency and race condition protection
    const result = await webhookProcessor.processWebhook({
      source: 'stripe',
      eventId: event.id,
      eventType: event.type,
      data: event.data.object,
      rawPayload: body,
      processor: async () => {
        return await processStripeEvent(event);
      }
    });

    if (!result.success) {
      logger.error('Stripe webhook processing failed', { 
        eventId: event.id, 
        eventType: event.type,
        error: result.error 
      });
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }

    logger.info('Stripe webhook processed successfully', { 
      eventId: event.id, 
      eventType: event.type,
      processingTime: result.processingTime 
    });

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      eventId: event.id 
    }, { status: 200 });

  } catch (error: any) {
    logger.error('Stripe webhook endpoint error', { error: getErrorMessage(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Process individual Stripe webhook events
 */
async function processStripeEvent(event: Stripe.Event): Promise<any> {
  const { type, data } = event;
  
  switch (type) {
    case 'payment_intent.succeeded':
      return await handlePaymentIntentSucceeded(data.object as Stripe.PaymentIntent);
      
    case 'payment_intent.payment_failed':
      return await handlePaymentIntentFailed(data.object as Stripe.PaymentIntent);
      
    case 'payment_intent.requires_action':
      return await handlePaymentIntentRequiresAction(data.object as Stripe.PaymentIntent);
      
    case 'payment_intent.canceled':
      return await handlePaymentIntentCanceled(data.object as Stripe.PaymentIntent);
      
    case 'payment_method.attached':
      return await handlePaymentMethodAttached(data.object as Stripe.PaymentMethod);
      
    case 'customer.created':
    case 'customer.updated':
      return await handleCustomerUpdated(data.object as Stripe.Customer);
      
    case 'invoice.created':
      return await handleInvoiceCreated(data.object as Stripe.Invoice);
      
    case 'invoice.finalized':
      return await handleInvoiceFinalized(data.object as Stripe.Invoice);
      
    case 'invoice.payment_succeeded':
      return await handleInvoicePaymentSucceeded(data.object as Stripe.Invoice);
      
    case 'invoice.payment_failed':
      return await handleInvoicePaymentFailed(data.object as Stripe.Invoice);
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription events
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      // Handle subscription deletion
      break;
      
    case 'checkout.session.completed':
      return await handleCheckoutSessionCompleted(data.object as Stripe.Checkout.Session);
      
    case 'checkout.session.expired':
      return await handleCheckoutSessionExpired(data.object as Stripe.Checkout.Session);
      
    default:
      logger.warn('Unhandled Stripe event type', { type });
      return { message: 'Event type not processed' };
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<any> {
  try {
    // Update payment record in database
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: paymentIntent.latest_charge as string
        }
      });

      // Update associated booking status
      if (payment.bookingId) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { 
            status: 'CONFIRMED'
          }
        });

        // Generate and send invoice
        await addJob('invoice', 'generate', {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          type: 'payment_confirmation'
        });

        // Send confirmation notifications
        await addJob('notification', 'send', {
          type: 'payment_confirmation',
          bookingId: payment.bookingId,
          paymentId: payment.id
        });
      }
    }

    logger.info('Payment intent succeeded processed', { 
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount 
    });

    return { success: true, paymentIntentId: paymentIntent.id };

  } catch (error: any) {
    logger.error('Error handling payment intent succeeded', { 
      paymentIntentId: paymentIntent.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<any> {
  try {
    // Update payment record
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transactionId: paymentIntent.latest_charge as string
        }
      });

      // Update booking status
      if (payment.bookingId) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { 
            status: BookingStatus.CANCELLED_BY_CLIENT
          }
        });

        // Trigger enhanced payment retry logic
        const { paymentRetryService } = await import('@/lib/payments/payment-retry-service');
        await paymentRetryService.handlePaymentFailure({
          paymentId: payment.id,
          bookingId: payment.bookingId,
          failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
          stripeErrorCode: paymentIntent.last_payment_error?.code,
          attemptNumber: 1
        });

        // Send failure notification
        await addJob('notification', 'send', {
          type: 'payment_failed',
          bookingId: payment.bookingId,
          paymentId: payment.id,
          reason: paymentIntent.last_payment_error?.message
        });
      }
    }

    logger.info('Payment intent failed processed', { 
      paymentIntentId: paymentIntent.id,
      reason: paymentIntent.last_payment_error?.message 
    });

    return { success: true, paymentIntentId: paymentIntent.id };

  } catch (error: any) {
    logger.error('Error handling payment intent failed', { 
      paymentIntentId: paymentIntent.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle payment intent requiring action
 */
async function handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<any> {
  try {
    // Update payment status to require action
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PENDING'
        }
      });

      // Send action required notification
      await addJob('notification', 'send', {
        type: 'payment_action_required',
        paymentId: payment.id,
        bookingId: payment.bookingId
      });
    }

    return { success: true, paymentIntentId: paymentIntent.id };

  } catch (error: any) {
    logger.error('Error handling payment intent requires action', { 
      paymentIntentId: paymentIntent.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<any> {
  try {
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      if (payment.bookingId) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { 
            status: BookingStatus.CANCELLED_BY_CLIENT
          }
        });
      }
    }

    return { success: true, paymentIntentId: paymentIntent.id };

  } catch (error: any) {
    logger.error('Error handling payment intent canceled', { 
      paymentIntentId: paymentIntent.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle payment method attachment
 */
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<any> {
  try {
    // Update customer record with new payment method
    if (paymentMethod.customer) {
      logger.info('Payment method attached to customer', {
        customerId: paymentMethod.customer,
        paymentMethodId: paymentMethod.id,
        type: paymentMethod.type
      });
    }

    return { success: true, paymentMethodId: paymentMethod.id };

  } catch (error: any) {
    logger.error('Error handling payment method attached', { 
      paymentMethodId: paymentMethod.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle customer created/updated
 */
async function handleCustomerUpdated(customer: Stripe.Customer): Promise<any> {
  try {
    // Sync customer data with local database if needed
    logger.info('Customer updated', { customerId: customer.id });
    
    return { success: true, customerId: customer.id };

  } catch (error: any) {
    logger.error('Error handling customer updated', { 
      customerId: customer.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle invoice created
 */
async function handleInvoiceCreated(invoice: Stripe.Invoice): Promise<any> {
  try {
    // Create local invoice record
    logger.info('Invoice created', { invoiceId: invoice.id });
    
    return { success: true, invoiceId: invoice.id };

  } catch (error: any) {
    logger.error('Error handling invoice created', { 
      invoiceId: invoice.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle invoice finalized
 */
async function handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<any> {
  try {
    // Send invoice to customer
    await addJob('invoice', 'send', {
      stripeInvoiceId: invoice.id,
      customerId: invoice.customer as string
    });
    
    return { success: true, invoiceId: invoice.id };

  } catch (error: any) {
    logger.error('Error handling invoice finalized', { 
      invoiceId: invoice.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<any> {
  try {
    logger.info('Invoice payment succeeded', { invoiceId: invoice.id });
    
    return { success: true, invoiceId: invoice.id };

  } catch (error: any) {
    logger.error('Error handling invoice payment succeeded', { 
      invoiceId: invoice.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<any> {
  try {
    // Trigger dunning management
    await addJob('payment', 'dunning', {
      stripeInvoiceId: invoice.id,
      customerId: invoice.customer as string,
      attempt: 1
    });
    
    return { success: true, invoiceId: invoice.id };

  } catch (error: any) {
    logger.error('Error handling invoice payment failed', { 
      invoiceId: invoice.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<any> {
  try {
    logger.info('Subscription updated', { subscriptionId: subscription.id });
    
    return { success: true, subscriptionId: subscription.id };

  } catch (error: any) {
    logger.error('Error handling subscription updated', { 
      subscriptionId: subscription.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<any> {
  try {
    logger.info('Subscription deleted', { subscriptionId: subscription.id });
    
    return { success: true, subscriptionId: subscription.id };

  } catch (error: any) {
    logger.error('Error handling subscription deleted', { 
      subscriptionId: subscription.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<any> {
  try {
    // Process successful checkout
    if (session.payment_intent) {
      logger.info('Checkout session completed', { 
        sessionId: session.id,
        paymentIntentId: session.payment_intent 
      });
    }
    
    return { success: true, sessionId: session.id };

  } catch (error: any) {
    logger.error('Error handling checkout session completed', { 
      sessionId: session.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

/**
 * Handle checkout session expired
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<any> {
  try {
    logger.info('Checkout session expired', { sessionId: session.id });
    
    return { success: true, sessionId: session.id };

  } catch (error: any) {
    logger.error('Error handling checkout session expired', { 
      sessionId: session.id, 
      error: getErrorMessage(error) 
    });
    throw error;
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
