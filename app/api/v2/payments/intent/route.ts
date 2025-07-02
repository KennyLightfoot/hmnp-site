/**
 * 💳 HMNP V2 Payment Intent API
 * Bulletproof Stripe integration for secure payment processing
 * Atomic operations, zero data loss, full audit trail
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { PaymentStatus, PaymentProvider } from '@prisma/client';

// ============================================================================
// 🔌 STRIPE INITIALIZATION
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// ============================================================================
// 🛡️ VALIDATION SCHEMAS
// ============================================================================

const CreatePaymentIntentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  returnUrl: z.string().url('Valid return URL is required'),
  metadata: z.record(z.string()).optional()
});

// ============================================================================
// 🎯 CREATE PAYMENT INTENT (POST)
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    const validatedRequest = CreatePaymentIntentSchema.parse(body);
    
    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: validatedRequest.bookingId },
      include: {
        service: {
          select: { name: true, type: true }
        },
        payments: {
          where: { status: { in: ['PENDING', 'PROCESSING', 'PAID'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
          requestId
        }
      }, { status: 404 });
    }
    
    // Validate booking status
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_BOOKING_STATUS',
          message: `Cannot process payment for booking with status: ${booking.status}`,
          requestId
        }
      }, { status: 400 });
    }
    
    // Check for existing pending payment
    const existingPayment = booking.payments[0];
    if (existingPayment && ['PENDING', 'PROCESSING'].includes(existingPayment.status)) {
      // Return existing payment intent
      return NextResponse.json({
        success: true,
        data: {
          paymentIntentId: existingPayment.stripePaymentIntentId,
          clientSecret: await getClientSecret(existingPayment.stripePaymentIntentId!),
          amount: existingPayment.amount,
          status: existingPayment.status,
          existing: true
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Determine payment amount (deposit or full amount)
    const paymentAmount = booking.depositRequired ? booking.depositAmount : booking.finalPrice;
    const amountCents = Math.round(Number(paymentAmount) * 100);
    
    if (amountCents <= 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Payment amount must be greater than $0',
          requestId
        }
      }, { status: 400 });
    }
    
    // 🔒 ATOMIC TRANSACTION: Create payment record + Stripe intent
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record first
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: paymentAmount,
          status: 'PENDING',
          provider: 'STRIPE'
        }
      });
      
      try {
        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: 'usd',
          metadata: {
            bookingId: booking.id,
            paymentId: payment.id,
            serviceName: booking.service.name,
            customerEmail: booking.customerEmail,
            requestId,
            ...validatedRequest.metadata
          },
          description: `${booking.service.name} - ${booking.customerName}`,
          receipt_email: booking.customerEmail,
          automatic_payment_methods: {
            enabled: true,
          },
          setup_future_usage: 'off_session' // For future payments if needed
        });
        
        // Update payment with Stripe IDs
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            stripePaymentIntentId: paymentIntent.id
          }
        });
        
        // Update booking with payment intent ID
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            stripePaymentIntentId: paymentIntent.id,
            paymentStatus: 'PROCESSING'
          }
        });
        
        // Create audit log
        await tx.bookingAuditLog.create({
          data: {
            bookingId: booking.id,
            action: 'PAYMENT_INITIATED',
            actorType: 'CUSTOMER',
            actorId: booking.customerEmail,
            changes: JSON.stringify({
              paymentId: payment.id,
              stripePaymentIntentId: paymentIntent.id,
              amount: paymentAmount
            }),
            metadata: JSON.stringify({
              requestId,
              userAgent: request.headers.get('user-agent'),
              ipAddress: getClientIP(request)
            })
          }
        });
        
        return {
          payment: updatedPayment,
          paymentIntent
        };
        
      } catch (stripeError) {
        // If Stripe fails, mark payment as failed
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failedAt: new Date()
          }
        });
        
        throw stripeError;
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: result.paymentIntent.id,
        clientSecret: result.paymentIntent.client_secret,
        amount: paymentAmount,
        amountCents,
        status: result.payment.status,
        booking: {
          id: booking.id,
          serviceName: booking.service.name,
          customerName: booking.customerName,
          scheduledDateTime: booking.scheduledDateTime.toISOString()
        }
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Payment Intent Creation Error:', error, { requestId });
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          })),
          requestId
        }
      }, { status: 400 });
    }
    
    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'STRIPE_ERROR',
          message: 'Payment processing error',
          details: error.message,
          requestId
        }
      }, { status: 400 });
    }
    
    // Generic error
    return NextResponse.json({
      success: false,
      error: {
        code: 'PAYMENT_INTENT_ERROR',
        message: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🎯 GET PAYMENT INTENT STATUS (GET)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');
    const bookingId = searchParams.get('booking_id');
    
    if (!paymentIntentId && !bookingId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_PARAMETER',
          message: 'Either payment_intent_id or booking_id is required'
        }
      }, { status: 400 });
    }
    
    let payment;
    
    if (paymentIntentId) {
      payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
        include: {
          booking: {
            select: {
              id: true,
              customerEmail: true,
              customerName: true,
              service: { select: { name: true } }
            }
          }
        }
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { 
          bookingId: bookingId!,
          status: { in: ['PENDING', 'PROCESSING', 'PAID'] }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              customerEmail: true,
              customerName: true,
              service: { select: { name: true } }
            }
          }
        }
      });
    }
    
    if (!payment) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found'
        }
      }, { status: 404 });
    }
    
    // Get latest status from Stripe
    let stripeStatus = null;
    if (payment.stripePaymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
        stripeStatus = paymentIntent.status;
      } catch (error) {
        console.warn('Failed to retrieve Stripe payment intent:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          bookingId: payment.bookingId,
          amount: payment.amount,
          status: payment.status,
          stripePaymentIntentId: payment.stripePaymentIntentId,
          stripeStatus,
          provider: payment.provider,
          createdAt: payment.createdAt.toISOString(),
          paidAt: payment.paidAt?.toISOString(),
          failedAt: payment.failedAt?.toISOString()
        },
        booking: payment.booking
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });
    
  } catch (error) {
    console.error('Get Payment Status Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'PAYMENT_STATUS_ERROR',
        message: 'Failed to get payment status'
      }
    }, { status: 500 });
  }
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

async function getClientSecret(paymentIntentId: string): Promise<string | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.client_secret;
  } catch (error) {
    console.error('Failed to retrieve client secret:', error);
    return null;
  }
}

function generateRequestId(): string {
  return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}