import Stripe from 'stripe';
import { getValidatedEnv } from './env-validation';

// Singleton Stripe client with proper configuration
let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  const env = getValidatedEnv();
  
  if (!env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not configured');
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil', // Updated to latest supported API version for Stripe 18.x
      typescript: true,
      telemetry: false, // Disable telemetry for better performance
    });
  }

  return stripeInstance;
}

// Client-side Stripe instance
export const stripePromise = typeof window !== 'undefined' 
  ? import('@stripe/stripe-js').then(({ loadStripe }) => 
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
    )
  : null;

// Type-safe webhook signature verification
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe client not available');
  }

  return stripe.webhooks.constructEvent(payload, signature, secret);
}

// Payment intent helpers with built-in retry logic
export async function createPaymentIntent(params: {
  amount: number; // in cents
  currency?: string;
  metadata?: Record<string, string>;
  description?: string;
  automaticPaymentMethods?: boolean;
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  // Built-in retry logic for payment intent creation
  const maxAttempts = 3;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || 'usd',
        metadata: params.metadata,
        description: params.description,
        automatic_payment_methods: params.automaticPaymentMethods ? {
          enabled: true,
        } : undefined,
      });
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except rate limiting
      if (error.statusCode && error.statusCode < 500 && error.statusCode !== 429) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt >= maxAttempts) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      console.warn(`⚠️ Stripe payment intent creation failed (attempt ${attempt}), retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Payment intent creation failed after retries');
}

export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return stripe.paymentIntents.retrieve(paymentIntentId);
} 