/**
 * Enhanced Stripe Configuration
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Features:
 * - Multiple payment method support (Card, ACH, Apple Pay, Google Pay)
 * - Enhanced error handling and recovery
 * - Payment method detection and optimization
 * - Security and compliance features
 */

import Stripe from 'stripe';
import { getRequiredCleanEnv, getCleanEnv } from './env-clean';
import { logger } from './logger';

// Environment validation
const stripeSecretKey = getRequiredCleanEnv('STRIPE_SECRET_KEY', 'Required for Stripe payment processing');
const stripePublishableKey = getCleanEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');

if (!stripePublishableKey) {
  logger.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found - client-side features may not work');
}

// Enhanced Stripe configuration
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
  telemetry: false,
  maxNetworkRetries: 3,
  timeout: 15000, // Increased timeout for complex operations
});

// Enhanced payment method types
export const PAYMENT_METHOD_TYPES = {
  CARD: 'card',
  ACH: 'us_bank_account',
  APPLE_PAY: 'card',
  GOOGLE_PAY: 'card',
  CASH: 'cash',
  CHECK: 'check'
} as const;

// Enhanced Stripe configuration
export const ENHANCED_STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: [
    PAYMENT_METHOD_TYPES.CARD,
    PAYMENT_METHOD_TYPES.ACH,
    PAYMENT_METHOD_TYPES.APPLE_PAY,
    PAYMENT_METHOD_TYPES.GOOGLE_PAY
  ] as const,
  captureMethod: 'automatic' as const,
  confirmationMethod: 'automatic' as const,
  setupFutureUsage: 'off_session' as const,
  automaticPaymentMethods: {
    enabled: true,
    allow_redirects: 'never'
  }
} as const;

// Enhanced interfaces
export interface EnhancedCreatePaymentIntentParams {
  amount: number; // Amount in cents
  currency?: string;
  customerId?: string;
  paymentMethodId?: string;
  paymentMethodTypes?: string[];
  metadata?: Record<string, string>;
  description?: string;
  receiptEmail?: string;
  returnUrl?: string;
  confirmationMethod?: 'manual' | 'automatic';
  captureMethod?: 'manual' | 'automatic';
  setupFutureUsage?: 'on_session' | 'off_session';
  applicationFeeAmount?: number;
  transferData?: {
    destination: string;
    amount?: number;
  };
  statementDescriptor?: string;
  statementDescriptorSuffix?: string;
  transferGroup?: string;
}

export interface EnhancedPaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    fingerprint: string;
    country: string;
  };
  usBankAccount?: {
    bankName: string;
    last4: string;
    routingNumber: string;
    accountHolderType: string;
  };
  billingDetails?: {
    name: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  customer?: string;
  created: number;
}

export interface PaymentRecoveryData {
  paymentIntentId: string;
  failureReason: string;
  stripeErrorCode?: string;
  customerMessage: string;
  retryCount: number;
  maxRetries: number;
  lastAttempt: string;
  alternativeMethods: string[];
}

// Enhanced Stripe service class
export class EnhancedStripeService {
  /**
   * Create enhanced payment intent with multiple payment method support
   */
  static async createEnhancedPaymentIntent(
    params: EnhancedCreatePaymentIntentParams
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || ENHANCED_STRIPE_CONFIG.currency,
        customer: params.customerId,
        payment_method: params.paymentMethodId,
        payment_method_types: params.paymentMethodTypes || ENHANCED_STRIPE_CONFIG.paymentMethodTypes,
        metadata: params.metadata || {},
        description: params.description,
        receipt_email: params.receiptEmail,
        return_url: params.returnUrl,
        confirmation_method: params.confirmationMethod || ENHANCED_STRIPE_CONFIG.confirmationMethod,
        capture_method: params.captureMethod || ENHANCED_STRIPE_CONFIG.captureMethod,
        setup_future_usage: params.setupFutureUsage || ENHANCED_STRIPE_CONFIG.setupFutureUsage,
        automatic_payment_methods: ENHANCED_STRIPE_CONFIG.automaticPaymentMethods,
        application_fee_amount: params.applicationFeeAmount,
        transfer_data: params.transferData,
        statement_descriptor: params.statementDescriptor || 'HMNP Notary',
        statement_descriptor_suffix: params.statementDescriptorSuffix,
        transfer_group: params.transferGroup
      });

      logger.info('Enhanced payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount: params.amount,
        customer: params.customerId,
        paymentMethodTypes: params.paymentMethodTypes
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to create enhanced payment intent', {
        error: error.message,
        amount: params.amount,
        customerId: params.customerId
      });
      throw error;
    }
  }

  /**
   * Create setup intent for saving payment methods
   */
  static async createEnhancedSetupIntent(
    customerId: string,
    paymentMethodTypes?: string[]
  ): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: paymentMethodTypes || ENHANCED_STRIPE_CONFIG.paymentMethodTypes,
        usage: 'off_session',
        metadata: {
          source: 'hmnp_enhanced_payment_system'
        }
      });

      logger.info('Enhanced setup intent created', {
        setupIntentId: setupIntent.id,
        customerId,
        paymentMethodTypes
      });

      return setupIntent;
    } catch (error) {
      logger.error('Failed to create enhanced setup intent', {
        error: error.message,
        customerId
      });
      throw error;
    }
  }

  /**
   * Attach payment method to customer
   */
  static async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      logger.info('Payment method attached', {
        paymentMethodId,
        customerId,
        type: paymentMethod.type
      });

      return paymentMethod;
    } catch (error) {
      logger.error('Failed to attach payment method', {
        error: error.message,
        paymentMethodId,
        customerId
      });
      throw error;
    }
  }

  /**
   * Get customer's saved payment methods
   */
  static async getCustomerPaymentMethods(
    customerId: string,
    type?: string
  ): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: type as any
      });

      logger.info('Retrieved customer payment methods', {
        customerId,
        count: paymentMethods.data.length,
        type
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error('Failed to get customer payment methods', {
        error: error.message,
        customerId
      });
      throw error;
    }
  }

  /**
   * Create ACH payment intent
   */
  static async createACHPaymentIntent(
    params: EnhancedCreatePaymentIntentParams & {
      bankAccountToken: string;
      mandateData: {
        customerAcceptance: {
          type: 'online';
          online: {
            ipAddress: string;
            userAgent: string;
          };
        };
      };
    }
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || ENHANCED_STRIPE_CONFIG.currency,
        customer: params.customerId,
        payment_method_types: ['us_bank_account'],
        payment_method_data: {
          type: 'us_bank_account',
          us_bank_account: {
            token: params.bankAccountToken
          },
          billing_details: {
            name: params.metadata?.customerName || '',
            email: params.receiptEmail || ''
          }
        },
        mandate_data: params.mandateData,
        metadata: {
          ...params.metadata,
          payment_type: 'ach'
        },
        description: params.description,
        receipt_email: params.receiptEmail,
        confirmation_method: 'manual',
        capture_method: 'automatic'
      });

      logger.info('ACH payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount: params.amount,
        customer: params.customerId
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to create ACH payment intent', {
        error: error.message,
        amount: params.amount,
        customerId: params.customerId
      });
      throw error;
    }
  }

  /**
   * Handle payment recovery
   */
  static async handlePaymentRecovery(
    paymentIntentId: string,
    newPaymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'requires_payment_method') {
        // Confirm with new payment method
        const updatedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: newPaymentMethodId,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/recovery`
        });

        logger.info('Payment recovery successful', {
          paymentIntentId,
          status: updatedIntent.status
        });

        return updatedIntent;
      }

      return paymentIntent;
    } catch (error) {
      logger.error('Payment recovery failed', {
        error: error.message,
        paymentIntentId
      });
      throw error;
    }
  }

  /**
   * Create Apple Pay payment intent
   */
  static async createApplePayPaymentIntent(
    params: EnhancedCreatePaymentIntentParams & {
      applePayToken: string;
    }
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || ENHANCED_STRIPE_CONFIG.currency,
        customer: params.customerId,
        payment_method_types: ['card'],
        payment_method_data: {
          type: 'card',
          card: {
            token: params.applePayToken
          }
        },
        metadata: {
          ...params.metadata,
          payment_type: 'apple_pay'
        },
        description: params.description,
        receipt_email: params.receiptEmail,
        confirmation_method: 'automatic',
        capture_method: 'automatic'
      });

      logger.info('Apple Pay payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount: params.amount,
        customer: params.customerId
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to create Apple Pay payment intent', {
        error: error.message,
        amount: params.amount,
        customerId: params.customerId
      });
      throw error;
    }
  }

  /**
   * Create Google Pay payment intent
   */
  static async createGooglePayPaymentIntent(
    params: EnhancedCreatePaymentIntentParams & {
      googlePayToken: string;
    }
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || ENHANCED_STRIPE_CONFIG.currency,
        customer: params.customerId,
        payment_method_types: ['card'],
        payment_method_data: {
          type: 'card',
          card: {
            token: params.googlePayToken
          }
        },
        metadata: {
          ...params.metadata,
          payment_type: 'google_pay'
        },
        description: params.description,
        receipt_email: params.receiptEmail,
        confirmation_method: 'automatic',
        capture_method: 'automatic'
      });

      logger.info('Google Pay payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount: params.amount,
        customer: params.customerId
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Failed to create Google Pay payment intent', {
        error: error.message,
        amount: params.amount,
        customerId: params.customerId
      });
      throw error;
    }
  }

  /**
   * Get payment method details
   */
  static async getPaymentMethodDetails(
    paymentMethodId: string
  ): Promise<EnhancedPaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
          fingerprint: paymentMethod.card.fingerprint,
          country: paymentMethod.card.country
        } : undefined,
        usBankAccount: paymentMethod.us_bank_account ? {
          bankName: paymentMethod.us_bank_account.bank_name,
          last4: paymentMethod.us_bank_account.last4,
          routingNumber: paymentMethod.us_bank_account.routing_number,
          accountHolderType: paymentMethod.us_bank_account.account_holder_type
        } : undefined,
        billingDetails: paymentMethod.billing_details ? {
          name: paymentMethod.billing_details.name || '',
          email: paymentMethod.billing_details.email || '',
          phone: paymentMethod.billing_details.phone || '',
          address: {
            line1: paymentMethod.billing_details.address?.line1 || '',
            line2: paymentMethod.billing_details.address?.line2 || '',
            city: paymentMethod.billing_details.address?.city || '',
            state: paymentMethod.billing_details.address?.state || '',
            postalCode: paymentMethod.billing_details.address?.postal_code || '',
            country: paymentMethod.billing_details.address?.country || ''
          }
        } : undefined,
        customer: paymentMethod.customer as string,
        created: paymentMethod.created
      };
    } catch (error) {
      logger.error('Failed to get payment method details', {
        error: error.message,
        paymentMethodId
      });
      throw error;
    }
  }
}

// Enhanced error handling
export const ENHANCED_STRIPE_ERROR_TYPES = {
  CARD_DECLINED: 'card_declined',
  EXPIRED_CARD: 'expired_card',
  INCORRECT_CVC: 'incorrect_cvc',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  PROCESSING_ERROR: 'processing_error',
  RATE_LIMIT_ERROR: 'rate_limit_error',
  AUTHENTICATION_REQUIRED: 'authentication_required',
  ACCOUNT_INVALID: 'account_invalid',
  ACCOUNT_CLOSED: 'account_closed',
  ACCOUNT_FROZEN: 'account_frozen',
  BANK_ACCOUNT_DECLINED: 'bank_account_declined',
  BANK_ACCOUNT_EXISTS: 'bank_account_exists',
  BANK_ACCOUNT_INVALID: 'bank_account_invalid',
  BANK_ACCOUNT_UNVERIFIED: 'bank_account_unverified'
} as const;

// Enhanced error message mapping
export const getEnhancedStripeErrorMessage = (error: any): string => {
  if (!error || !error.code) {
    return 'An unexpected error occurred. Please try again.';
  }

  switch (error.code) {
    case ENHANCED_STRIPE_ERROR_TYPES.CARD_DECLINED:
      return 'Your card was declined. Please try a different payment method.';
    case ENHANCED_STRIPE_ERROR_TYPES.EXPIRED_CARD:
      return 'Your card has expired. Please update your payment information.';
    case ENHANCED_STRIPE_ERROR_TYPES.INCORRECT_CVC:
      return 'Your card security code is incorrect. Please check and try again.';
    case ENHANCED_STRIPE_ERROR_TYPES.INSUFFICIENT_FUNDS:
      return 'Your card has insufficient funds. Please try a different payment method.';
    case ENHANCED_STRIPE_ERROR_TYPES.PROCESSING_ERROR:
      return 'A processing error occurred. Please try again in a few moments.';
    case ENHANCED_STRIPE_ERROR_TYPES.RATE_LIMIT_ERROR:
      return 'Too many payment attempts. Please wait a moment and try again.';
    case ENHANCED_STRIPE_ERROR_TYPES.AUTHENTICATION_REQUIRED:
      return 'Your payment requires additional authentication. Please complete the verification process.';
    case ENHANCED_STRIPE_ERROR_TYPES.BANK_ACCOUNT_DECLINED:
      return 'Your bank account was declined. Please verify your account information.';
    case ENHANCED_STRIPE_ERROR_TYPES.BANK_ACCOUNT_INVALID:
      return 'Your bank account information is invalid. Please check and try again.';
    case ENHANCED_STRIPE_ERROR_TYPES.BANK_ACCOUNT_UNVERIFIED:
      return 'Your bank account needs to be verified. Please complete the verification process.';
    default:
      return error.message || 'Payment processing failed. Please try again.';
  }
};

// Payment method detection utilities
export const detectPaymentMethodSupport = () => {
  if (typeof window === 'undefined') return {};

  return {
    applePay: window.ApplePaySession && ApplePaySession.canMakePayments(),
    googlePay: window.google && window.google.payments,
    card: true, // Always supported
    ach: true // Always supported via Stripe
  };
};

// Export enhanced configuration
export { stripe as enhancedStripe, ENHANCED_STRIPE_CONFIG as STRIPE_CONFIG }; 