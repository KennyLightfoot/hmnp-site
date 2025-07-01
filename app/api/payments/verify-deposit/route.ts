/**
 * Verify Deposit Payment API
 * Confirms deposit payment completion and updates booking status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) 
  : null;

// Validation schema
const verifyDepositSchema = z.object({
  sessionId: z.string().optional(),
  bookingId: z.string().uuid(),
  paymentMethod: z.enum(['STRIPE_ONLINE', 'CASH_ON_SERVICE', 'ADMIN_OVERRIDE']),
  adminOverride: z.object({
    reason: z.string(),
    adminId: z.string()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, bookingId, paymentMethod, adminOverride } = verifyDepositSchema.parse(body);

    // Get booking with payment records
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: {
          select: {
            name: true,
            depositAmount: true,
            requiresDeposit: true
          }
        },
        Payment: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (paymentMethod === 'STRIPE_ONLINE' && sessionId) {
      return await verifyStripePayment(sessionId, booking);
    }

    if (paymentMethod === 'CASH_ON_SERVICE') {
      return await verifyCashPayment(booking);
    }

    if (paymentMethod === 'ADMIN_OVERRIDE' && adminOverride) {
      return await processAdminOverride(booking, adminOverride);
    }

    return NextResponse.json(
      { error: 'Invalid verification request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Deposit verification failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to verify deposit payment' },
      { status: 500 }
    );
  }
}

/**
 * Verify Stripe payment completion
 */
async function verifyStripePayment(sessionId: string, booking: any) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    );
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        message: 'Payment not completed',
        paymentStatus: session.payment_status
      }, { status: 400 });
    }

    // Update booking and payment records
    await prisma.$transaction(async (tx) => {
      // Update booking status
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          depositStatus: 'PAID',
          paymentMethod: 'STRIPE_CHECKOUT',
          stripeSessionId: sessionId,
          depositPaidAt: new Date()
        }
      });

      // Update payment record
      if (booking.Payment.length > 0) {
        await tx.payment.update({
          where: { id: booking.Payment[0].id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            transactionId: session.payment_intent as string,
            notes: `Stripe payment completed - Session: ${sessionId}`
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit payment verified and booking confirmed',
      booking: {
        id: booking.id,
        status: 'CONFIRMED',
        depositStatus: 'PAID'
      },
      payment: {
        sessionId,
        paymentIntent: session.payment_intent,
        amountPaid: session.amount_total! / 100
      }
    });

  } catch (stripeError) {
    console.error('Stripe verification failed:', stripeError);
    return NextResponse.json(
      { error: 'Failed to verify Stripe payment' },
      { status: 500 }
    );
  }
}

/**
 * Verify cash payment (marks as confirmed, payment due on service)
 */
async function verifyCashPayment(booking: any) {
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'CONFIRMED',
      depositStatus: 'CASH_ON_SERVICE',
      paymentMethod: 'CASH_ON_SERVICE'
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Booking confirmed - cash payment on service date',
    booking: {
      id: booking.id,
      status: 'CONFIRMED',
      depositStatus: 'CASH_ON_SERVICE'
    }
  });
}

/**
 * Process admin override (skip payment requirement)
 */
async function processAdminOverride(booking: any, adminOverride: any) {
  await prisma.$transaction(async (tx) => {
    // Update booking
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        depositStatus: 'WAIVED_ADMIN',
        paymentMethod: 'ADMIN_OVERRIDE'
      }
    });

    // Log admin action
    await tx.systemLog.create({
      data: {
        level: 'INFO',
        component: 'payment_admin_override',
        message: `Admin ${adminOverride.adminId} waived deposit for booking ${booking.id}`,
        details: {
          bookingId: booking.id,
          adminId: adminOverride.adminId,
          reason: adminOverride.reason,
          originalDepositAmount: booking.Service.depositAmount?.toNumber() || 0
        }
      }
    });
  });

  return NextResponse.json({
    success: true,
    message: 'Booking confirmed - deposit waived by admin',
    booking: {
      id: booking.id,
      status: 'CONFIRMED',
      depositStatus: 'WAIVED_ADMIN'
    }
  });
}

/**
 * GET - Check payment status for a booking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        depositStatus: true,
        paymentMethod: true,
        depositPaidAt: true,
        Service: {
          select: {
            name: true,
            depositAmount: true,
            requiresDeposit: true
          }
        },
        Payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            paidAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        status: booking.status,
        depositStatus: booking.depositStatus,
        paymentMethod: booking.paymentMethod,
        depositPaidAt: booking.depositPaidAt,
        requiresDeposit: booking.Service.requiresDeposit,
        depositAmount: booking.Service.depositAmount?.toNumber() || 0
      },
      payments: booking.Payment
    });

  } catch (error) {
    console.error('Payment status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}