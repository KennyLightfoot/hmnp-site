/**
 * Payment Retry Service
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Advanced payment failure handling and retry logic with exponential backoff
 */

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { addJob } from '@/lib/queue/queue-config';
import { PaymentStatus } from '@prisma/client';

export interface PaymentRetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  immediateRetryReasons: string[];
  permanentFailureReasons: string[];
}

export interface PaymentRetryAttempt {
  attempt: number;
  scheduledAt: Date;
  reason?: string;
  paymentMethodId?: string;
  metadata?: any;
}

export interface PaymentFailureAnalysis {
  isRetryable: boolean;
  retryDelay: number;
  alternativeActions: string[];
  customerMessage: string;
  requiresCustomerAction: boolean;
}

export class PaymentRetryService {
  private config: PaymentRetryConfig = {
    maxRetries: 5,
    baseDelayMs: 5 * 60 * 1000, // 5 minutes
    maxDelayMs: 24 * 60 * 60 * 1000, // 24 hours
    backoffMultiplier: 2,
    immediateRetryReasons: [
      'network_error',
      'temporary_decline',
      'rate_limited',
      'service_unavailable'
    ],
    permanentFailureReasons: [
      'card_declined',
      'insufficient_funds',
      'expired_card',
      'invalid_card_number',
      'invalid_expiry_date',
      'invalid_cvc',
      'processing_error',
      'card_not_supported',
      'currency_not_supported'
    ]
  };

  /**
   * Handle payment failure and initiate retry logic
   */
  async handlePaymentFailure(params: {
    paymentId: string;
    bookingId: string;
    failureReason: string;
    stripeErrorCode?: string;
    attemptNumber?: number;
  }): Promise<{
    success: boolean;
    action: 'retry_scheduled' | 'retry_immediate' | 'customer_action_required' | 'permanent_failure';
    nextRetryAt?: Date;
    customerMessage: string;
  }> {
    const { paymentId, bookingId, failureReason, stripeErrorCode, attemptNumber = 1 } = params;

    try {
      // Get payment and booking details
      const payment = await prisma?.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              customer: true
            }
          }
        }
      });

      if (!payment) {
        throw new Error(`Payment ${paymentId} not found`);
      }

      // Analyze failure and determine retry strategy
      const analysis = this?.analyzePaymentFailure(failureReason, stripeErrorCode, attemptNumber);

      // Update payment record with failure details
      await this?.recordPaymentFailure(paymentId, {
        attempt: attemptNumber,
        reason: failureReason,
        stripeErrorCode,
        analysis,
        timestamp: new Date()
      });

      if (!analysis?.isRetryable || attemptNumber >= this?.config.maxRetries) {
        // Mark as permanent failure
        await this?.markPaymentAsPermanentFailure(paymentId, bookingId, analysis?.customerMessage);
        
        // Trigger customer support notification
        await addJob('notification', 'send', {
          type: 'payment_permanent_failure',
          bookingId,
          paymentId,
          customerMessage: analysis?.customerMessage,
          priority: 'high'
        });

        return {
          success: true,
          action: 'permanent_failure',
          customerMessage: analysis?.customerMessage
        };
      }

      if (analysis?.requiresCustomerAction) {
        // Customer needs to take action (update payment method, etc.)
        await this?.requestCustomerAction(paymentId, bookingId, analysis);
        
        return {
          success: true,
          action: 'customer_action_required',
          customerMessage: analysis?.customerMessage
        };
      }

      // Schedule retry
      const nextRetryAt = new Date(Date?.now() + analysis?.retryDelay);
      
      await this?.schedulePaymentRetry({
        paymentId,
        bookingId,
        attempt: attemptNumber + 1,
        scheduledAt: nextRetryAt,
        reason: failureReason,
        metadata: { 
          stripeErrorCode,
          originalFailureReason: failureReason,
          analysisDetails: analysis
        }
      });

      const action = analysis?.retryDelay === 0 ? 'retry_immediate' : 'retry_scheduled';

      return {
        success: true,
        action,
        nextRetryAt: action === 'retry_scheduled' ? nextRetryAt : undefined,
        customerMessage: analysis?.customerMessage
      };

    } catch (error: any) {
      logger?.error('Payment failure handling failed', {
        paymentId,
        bookingId,
        error: getErrorMessage(error),
        stack: error?.stack
      });

      return {
        success: false,
        action: 'permanent_failure',
        customerMessage: 'We encountered an error processing your payment. Our team has been notified.'
      };
    }
  }

  /**
   * Analyze payment failure to determine retry strategy
   */
  private analyzePaymentFailure(
    failureReason: string,
    stripeErrorCode?: string,
    attemptNumber: number = 1
  ): PaymentFailureAnalysis {
    const reason = failureReason?.toLowerCase();
    const errorCode = stripeErrorCode?.toLowerCase();

    // Check for permanent failures
    if (this?.config.permanentFailureReasons?.some(pfr => reason?.includes(pfr))) {
      return {
        isRetryable: false,
        retryDelay: 0,
        alternativeActions: ['update_payment_method', 'contact_bank'],
        customerMessage: 'Your payment could not be processed. Please check your payment details or try a different payment method.',
        requiresCustomerAction: true
      };
    }

    // Check for immediate retry situations
    if (this?.config.immediateRetryReasons?.some(irr => reason?.includes(irr))) {
      return {
        isRetryable: true,
        retryDelay: 0, // Immediate retry
        alternativeActions: [],
        customerMessage: 'We experienced a temporary issue processing your payment. We\'ll retry shortly.',
        requiresCustomerAction: false
      };
    }

    // Handle specific Stripe error codes
    switch (errorCode) {
      case 'card_declined':
        if (reason?.includes('insufficient_funds')) {
          return {
            isRetryable: false,
            retryDelay: 0,
            alternativeActions: ['add_funds', 'different_card'],
            customerMessage: 'Your card was declined due to insufficient funds. Please check your account balance or use a different payment method.',
            requiresCustomerAction: true
          };
        }
        return {
          isRetryable: false,
          retryDelay: 0,
          alternativeActions: ['contact_bank', 'different_card'],
          customerMessage: 'Your card was declined. Please contact your bank or try a different payment method.',
          requiresCustomerAction: true
        };

      case 'authentication_required':
        return {
          isRetryable: true,
          retryDelay: 10 * 60 * 1000, // 10 minutes
          alternativeActions: ['3ds_authentication'],
          customerMessage: 'Your payment requires additional authentication. Please complete the verification process.',
          requiresCustomerAction: true
        };

      case 'rate_limit_error':
        return {
          isRetryable: true,
          retryDelay: this?.calculateExponentialBackoff(attemptNumber),
          alternativeActions: [],
          customerMessage: 'We\'re experiencing high payment volume. We\'ll retry your payment shortly.',
          requiresCustomerAction: false
        };

      default:
        // Default retry strategy with exponential backoff
        return {
          isRetryable: attemptNumber < this?.config.maxRetries,
          retryDelay: this?.calculateExponentialBackoff(attemptNumber),
          alternativeActions: ['retry_later', 'different_method'],
          customerMessage: 'We encountered an issue processing your payment. We\'ll retry automatically.',
          requiresCustomerAction: false
        };
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateExponentialBackoff(attemptNumber: number): number {
    const delay = this?.config.baseDelayMs * Math?.pow(this?.config.backoffMultiplier, attemptNumber - 1);
    return Math?.min(delay, this?.config.maxDelayMs);
  }

  /**
   * Record payment failure attempt
   */
  private async recordPaymentFailure(paymentId: string, failure: any): Promise<void> {
    await prisma?.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
        metadata: {
          ...failure,
          failureHistory: {
            attempt: failure?.attempt,
            timestamp: failure?.timestamp.toISOString(),
            reason: failure?.reason,
            analysis: failure?.analysis
          }
        }
      }
    });

    // Store retry attempts in Redis for quick access
    const retryKey = `payment_retry:${paymentId}`;
    await (redis as any).zadd(retryKey, failure?.attempt, JSON?.stringify(failure));
    await redis?.expire(retryKey, 7 * 24 * 60 * 60); // 7 days
  }

  /**
   * Schedule payment retry
   */
  private async schedulePaymentRetry(retry: PaymentRetryAttempt & { paymentId: string; bookingId: string }): Promise<void> {
    const { paymentId, bookingId, attempt, scheduledAt, reason, metadata } = retry;

    // Update payment status to indicate retry is scheduled
    await prisma?.payment.update({
      where: { id: paymentId },
      data: {
        status: 'RETRY_SCHEDULED',
        metadata: {
          nextRetryAttempt: attempt,
          nextRetryAt: scheduledAt?.toISOString(),
          retryReason: reason,
          retryMetadata: metadata
        }
      }
    });

    // Schedule the retry job
    const delayMs = scheduledAt?.getTime() - Date?.now();
    
    if (delayMs <= 0) {
      // Immediate retry
      await addJob('payment', 'retry_immediate', {
        paymentId,
        bookingId,
        attempt,
        reason
      });
    } else {
      // Delayed retry
      await addJob('payment', 'retry_delayed', {
        paymentId,
        bookingId,
        attempt,
        reason,
        metadata
      }, {
        delay: delayMs
      });
    }

    logger?.info('Payment retry scheduled', {
      paymentId,
      bookingId,
      attempt,
      scheduledAt: scheduledAt?.toISOString(),
      delayMs
    });
  }

  /**
   * Mark payment as permanent failure
   */
  private async markPaymentAsPermanentFailure(
    paymentId: string, 
    bookingId: string, 
    customerMessage: string
  ): Promise<void> {
    // Update payment status
    await prisma?.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PERMANENTLY_FAILED',
        metadata: {
          permanentFailureReason: customerMessage,
          maxRetriesReached: true,
          finalFailureAt: new Date().toISOString()
        }
      }
    });

    // Update booking status
    await prisma?.booking.update({
      where: { id: bookingId },
      data: {
        status: 'PAYMENT_FAILED',
        paymentStatus: 'PERMANENTLY_FAILED'
      }
    });

    // Clean up retry tracking
    await redis?.del(`payment_retry:${paymentId}`);
  }

  /**
   * Request customer action for payment resolution
   */
  private async requestCustomerAction(
    paymentId: string,
    bookingId: string,
    analysis: PaymentFailureAnalysis
  ): Promise<void> {
    // Update payment status
    await prisma?.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REQUIRES_CUSTOMER_ACTION',
        metadata: {
          customerActionRequired: true,
          possibleActions: analysis?.alternativeActions,
          customerMessage: analysis?.customerMessage,
          actionRequestedAt: new Date().toISOString()
        }
      }
    });

    // Send notification to customer
    await addJob('notification', 'send', {
      type: 'payment_action_required',
      bookingId,
      paymentId,
      message: analysis?.customerMessage,
      alternativeActions: analysis?.alternativeActions,
      priority: 'high'
    });

    // Schedule follow-up if no action taken
    await addJob('payment', 'follow_up_customer_action', {
      paymentId,
      bookingId
    }, {
      delay: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  /**
   * Execute payment retry attempt
   */
  async executePaymentRetry(params: {
    paymentId: string;
    bookingId: string;
    attempt: number;
    originalReason?: string;
  }): Promise<{
    success: boolean;
    newPaymentIntentId?: string;
    requiresAction?: boolean;
    error?: string;
  }> {
    const { paymentId, bookingId, attempt } = params;

    try {
      // Get payment details
      const payment = await prisma?.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              customer: true
            }
          }
        }
      });

      if (!payment) {
        throw new Error(`Payment ${paymentId} not found`);
      }

      // Create new payment intent for retry
      const stripe = require('stripe')(process?.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe?.paymentIntents.create({
        amount: Math?.round(payment?.amount * 100), // Convert to cents
        currency: payment?.currency?.toLowerCase() || 'usd',
        customer: payment?.booking?.customer?.stripeCustomerId,
        metadata: {
          bookingId,
          paymentId,
          retryAttempt: attempt?.toString(),
          originalPaymentId: payment?.stripePaymentIntentId
        },
        description: `Retry attempt ${attempt} for booking ${bookingId}`
      });

      // Update payment record with new payment intent
      await prisma?.payment.update({
        where: { id: paymentId },
        data: {
          stripePaymentIntentId: paymentIntent?.id,
          status: 'PROCESSING',
          metadata: {
            retryAttempt: attempt,
            newPaymentIntentId: paymentIntent?.id,
            retryExecutedAt: new Date().toISOString()
          }
        }
      });

      logger?.info('Payment retry executed successfully', {
        paymentId,
        bookingId,
        attempt,
        newPaymentIntentId: paymentIntent?.id
      });

      return {
        success: true,
        newPaymentIntentId: paymentIntent?.id,
        requiresAction: paymentIntent?.status === 'requires_action'
      };

    } catch (error: any) {
      logger?.error('Payment retry execution failed', {
        paymentId,
        bookingId,
        attempt,
        error: getErrorMessage(error)
      });

      // If this retry fails, schedule the next one or mark as permanent failure
      if (attempt < this?.config.maxRetries) {
        await this?.handlePaymentFailure({
          paymentId,
          bookingId,
          failureReason: getErrorMessage(error),
          attemptNumber: attempt + 1
        });
      } else {
        await this?.markPaymentAsPermanentFailure(
          paymentId,
          bookingId,
          'Payment could not be processed after multiple attempts. Please contact support.'
        );
      }

      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  /**
   * Get payment retry status and history
   */
  async getPaymentRetryStatus(paymentId: string): Promise<{
    currentStatus: PaymentStatus;
    retryCount: number;
    nextRetryAt?: Date;
    retryHistory: any[];
    canRetry: boolean;
  }> {
    const payment = await prisma?.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    // Get retry history from Redis
    const retryKey = `payment_retry:${paymentId}`;
    const retryHistory = await (redis as any).zrange(retryKey, 0, -1);
    
    const parsedHistory = retryHistory?.map(entry => {
      try {
        return JSON?.parse(entry);
      } catch {
        return null;
      }
    }).filter(Boolean);

    const metadata = payment?.metadata as any || {};
    const retryCount = parsedHistory?.length;
    const canRetry = retryCount < this?.config.maxRetries && 
                    !['PAID', 'PERMANENTLY_FAILED'].includes(payment?.status);

    return {
      currentStatus: payment?.status,
      retryCount,
      nextRetryAt: metadata?.nextRetryAt ? new Date(metadata?.nextRetryAt) : undefined,
      retryHistory: parsedHistory,
      canRetry
    };
  }
}

// Singleton instance
export const paymentRetryService = new PaymentRetryService();
