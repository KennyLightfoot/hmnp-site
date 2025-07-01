/**
 * Centralized Stripe Client Configuration
 * 
 * This module provides a singleton Stripe client instance to ensure consistent
 * configuration across the application and prevent Authorization header corruption.
 */

import Stripe from 'stripe';
import { validateStripeEnvironment, getCleanStripeEnvironment } from './env-validation-enhanced';

// Environment variable validation with cleanup
function getCleanStripeSecretKey(): string {
  const validation = validateStripeEnvironment();
  
  if (!validation.isValid) {
    throw new Error(`Stripe environment validation failed: ${validation.errors.join(', ')}`);
  }
  
  const { secretKey } = getCleanStripeEnvironment();
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  
  return secretKey;
}

// Singleton Stripe client instance
let stripeInstance: Stripe | null = null;

/**
 * Get a properly configured Stripe client instance
 * Ensures consistent configuration and prevents header corruption issues
 */
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = getCleanStripeSecretKey();
    
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
      // Explicitly prevent any header manipulation
      httpAgent: undefined,
      timeout: 30000, // 30 second timeout
    });
    
    console.log('[STRIPE] Client initialized successfully');
  }
  
  return stripeInstance;
}

/**
 * Create a Stripe checkout session with standardized configuration
 */
export async function createCheckoutSession(params: {
  amount: number;
  bookingId: string;
  paymentId: string;
  serviceName: string;
  scheduledDate?: Date;
  customerEmail?: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  
  const { amount, bookingId, paymentId, serviceName, scheduledDate, customerEmail } = params;
  
  // Validate amount
  if (amount <= 0) {
    throw new Error(`Invalid payment amount: $${amount}. Amount must be greater than 0.`);
  }
  
  const amountInCents = Math.round(amount * 100);
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Booking for ${serviceName}`,
            description: scheduledDate 
              ? `Service: ${serviceName} on ${scheduledDate.toLocaleDateString()}` 
              : `Service: ${serviceName}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking-payment-canceled`,
      metadata: {
        bookingId,
        paymentId,
      },
      // Only add customer_email if provided
      ...(customerEmail && { customer_email: customerEmail }),
    });
    
    console.log('[STRIPE] Checkout session created successfully:', session.id);
    return session;
    
  } catch (error) {
    console.error('[STRIPE] Checkout session creation failed:', error);
    throw new Error(`Stripe session creation failed: ${error.message}`);
  }
}

/**
 * Validate Stripe webhook signature
 */
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret?: string
): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = secret || process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook validation');
  }
  
  const cleanSecret = webhookSecret.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '');
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, cleanSecret);
  } catch (error) {
    console.error('[STRIPE] Webhook signature validation failed:', error);
    throw new Error(`Webhook signature validation failed: ${error.message}`);
  }
}

export default getStripeClient;