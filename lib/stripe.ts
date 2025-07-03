/**
 * Stripe Configuration Module
 * Houston Mobile Notary Pros
 * 
 * Production-ready Stripe client with environment validation
 * and TypeScript support for payment processing.
 */

import Stripe from 'stripe';
import { logger } from './logger';

// Environment validation
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!stripePublishableKey) {
  logger.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found - client-side features may not work');
}

// Initialize Stripe with proper configuration
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18', // Latest stable API version
  typescript: true,
  telemetry: false, // Disable telemetry for privacy
  maxNetworkRetries: 3,
  timeout: 10000, // 10 second timeout
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'] as const,
  captureMethod: 'automatic' as const,
  confirmationMethod: 'automatic' as const,
  setupFutureUsage: 'off_session' as const, // For saving payment methods
} as const;

// TypeScript interfaces for Stripe operations
export interface CreatePaymentIntentParams {
  amount: number; // Amount in cents
  currency?: string;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  description?: string;
  receiptEmail?: string;
  returnUrl?: string;
  confirmationMethod?: 'manual' | 'automatic';
  captureMethod?: 'manual' | 'automatic';
  setupFutureUsage?: 'on_session' | 'off_session';
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface PaymentIntentResult {
  paymentIntent: Stripe.PaymentIntent;
  ephemeralKey?: Stripe.EphemeralKey;
  customer?: Stripe.Customer;
  publishableKey: string;
}

// Utility functions for common Stripe operations
export class StripeService {
  /**
   * Create a payment intent for booking payments
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || STRIPE_CONFIG.currency,
        customer: params.customerId,
        payment_method: params.paymentMethodId,
        metadata: params.metadata || {},
        description: params.description,
        receipt_email: params.receiptEmail,
        return_url: params.returnUrl,
        confirmation_method: params.confirmationMethod || STRIPE_CONFIG.confirmationMethod,
        capture_method: params.captureMethod || STRIPE_CONFIG.captureMethod,
        setup_future_usage: params.setupFutureUsage,
        payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });

      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount: params.amount,
        customer: params.customerId
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to create payment intent', {
        error: error.message,
        amount: params.amount,
        customerId: params.customerId
      });
      throw error;
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  static async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: params.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        logger.info('Existing Stripe customer found', {
          customerId: existingCustomers.data[0].id,
          email: params.email
        });
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata || {},
        description: params.description
      });

      logger.info('New Stripe customer created', {
        customerId: customer.id,
        email: params.email
      });

      return customer;
    } catch (error) {
      logger.error('Failed to create/retrieve customer', {
        error: error.message,
        email: params.email
      });
      throw error;
    }
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPaymentIntent(
    paymentIntentId: string, 
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation`
      });

      logger.info('Payment intent confirmed', {
        paymentIntentId,
        status: paymentIntent.status
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to confirm payment intent', {
        error: error.message,
        paymentIntentId
      });
      throw error;
    }
  }

  /**
   * Capture a payment intent (for manual capture)
   */
  static async capturePaymentIntent(
    paymentIntentId: string, 
    amountToCapture?: number
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
        amount_to_capture: amountToCapture
      });

      logger.info('Payment intent captured', {
        paymentIntentId,
        capturedAmount: paymentIntent.amount_received
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to capture payment intent', {
        error: error.message,
        paymentIntentId
      });
      throw error;
    }
  }

  /**
   * Create a refund
   */
  static async createRefund(
    paymentIntentId: string, 
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason: reason as any,
        metadata: {
          refund_reason: reason || 'requested_by_customer'
        }
      });

      logger.info('Refund created', {
        refundId: refund.id,
        paymentIntentId,
        amount: refund.amount
      });

      return refund;
    } catch (error) {
      logger.error('Failed to create refund', {
        error: error.message,
        paymentIntentId,
        amount
      });
      throw error;
    }
  }

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(
    payload: string | Buffer, 
    signature: string, 
    endpointSecret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      logger.error('Webhook signature validation failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get payment method details
   */
  static async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      logger.error('Failed to retrieve payment method', {
        error: error.message,
        paymentMethodId
      });
      throw error;
    }
  }

  /**
   * Create setup intent for saving payment methods
   */
  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
        usage: 'off_session'
      });

      logger.info('Setup intent created', {
        setupIntentId: setupIntent.id,
        customerId
      });

      return setupIntent;
    } catch (error) {
      logger.error('Failed to create setup intent', {
        error: error.message,
        customerId
      });
      throw error;
    }
  }
}

// Export configured stripe instance and utilities
export default stripe;
export { stripe as stripeClient };

// Webhook endpoint secret (if configured)
export const webhookEndpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Publishable key for client-side usage
export const publishableKey = stripePublishableKey;

// Utility function to format amount for Stripe (convert dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Utility function to format amount from Stripe (convert cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

// Common error types
export const STRIPE_ERROR_TYPES = {
  CARD_DECLINED: 'card_declined',
  EXPIRED_CARD: 'expired_card',
  INCORRECT_CVC: 'incorrect_cvc',
  PROCESSING_ERROR: 'processing_error',
  INSUFFICIENT_FUNDS: 'insufficient_funds'
} as const;

// Helper to check if error is a Stripe error
export const isStripeError = (error: any): error is Stripe.StripeError => {
  return error?.type?.startsWith?.('Stripe') || error?.code;
};

// Helper to get user-friendly error message
export const getStripeErrorMessage = (error: any): string => {
  if (!isStripeError(error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  switch (error.code) {
    case STRIPE_ERROR_TYPES.CARD_DECLINED:
      return 'Your card was declined. Please try a different payment method.';
    case STRIPE_ERROR_TYPES.EXPIRED_CARD:
      return 'Your card has expired. Please update your payment information.';
    case STRIPE_ERROR_TYPES.INCORRECT_CVC:
      return 'Your card security code is incorrect. Please check and try again.';
    case STRIPE_ERROR_TYPES.INSUFFICIENT_FUNDS:
      return 'Your card has insufficient funds. Please try a different payment method.';
    case STRIPE_ERROR_TYPES.PROCESSING_ERROR:
      return 'A processing error occurred. Please try again in a few moments.';
    default:
      return error.message || 'Payment processing failed. Please try again.';
  }
};