/**
 * Payment Retry API Endpoint
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Handles manual payment retries and provides retry status information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentRetryService } from '@/lib/payments/payment-retry-service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const PaymentRetryRequestSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().optional(),
  forceRetry: z.boolean().default(false)
});

const PaymentRetryStatusSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required')
});

/**
 * Manual payment retry
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId, bookingId, reason, forceRetry } = PaymentRetryRequestSchema.parse(body);

    // Check if user has permission to retry payments
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    const isCustomerOwner = session.user.id === body.customerId; // Would need to validate this properly

    if (!isAdmin && !isCustomerOwner) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get current retry status
    const retryStatus = await paymentRetryService.getPaymentRetryStatus(paymentId);

    if (!retryStatus.canRetry && !forceRetry) {
      return NextResponse.json({
        success: false,
        error: 'Payment cannot be retried',
        details: {
          currentStatus: retryStatus.currentStatus,
          retryCount: retryStatus.retryCount,
          maxRetriesReached: retryStatus.retryCount >= 5
        }
      }, { status: 400 });
    }

    // Execute payment retry
    const retryResult = await paymentRetryService.executePaymentRetry({
      paymentId,
      bookingId,
      attempt: retryStatus.retryCount + 1,
      originalReason: reason
    });

    if (retryResult.success) {
      logger.info('Manual payment retry initiated', {
        paymentId,
        bookingId,
        userId: session.user.id,
        attempt: retryStatus.retryCount + 1,
        newPaymentIntentId: retryResult.newPaymentIntentId
      });

      return NextResponse.json({
        success: true,
        message: 'Payment retry initiated successfully',
        data: {
          paymentId,
          newPaymentIntentId: retryResult.newPaymentIntentId,
          requiresAction: retryResult.requiresAction,
          attempt: retryStatus.retryCount + 1
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Payment retry failed',
        details: {
          reason: retryResult.error,
          canRetryAgain: retryStatus.retryCount + 1 < 5
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    logger.error('Payment retry API error', {
      error: error.message,
      stack: error.stack
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Get payment retry status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    const retryStatus = await paymentRetryService.getPaymentRetryStatus(paymentId);

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        currentStatus: retryStatus.currentStatus,
        retryCount: retryStatus.retryCount,
        nextRetryAt: retryStatus.nextRetryAt?.toISOString(),
        canRetry: retryStatus.canRetry,
        retryHistory: retryStatus.retryHistory.map(attempt => ({
          attempt: attempt.attempt,
          timestamp: attempt.timestamp,
          reason: attempt.reason,
          wasSuccessful: false // Would be determined by subsequent payment status
        }))
      }
    });

  } catch (error: any) {
    logger.error('Payment retry status API error', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get payment retry status'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';