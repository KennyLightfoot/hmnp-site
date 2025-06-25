import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { bookingId, paymentMode = 'deposit' } = body;

    // Enhanced validation
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!['full', 'deposit'].includes(paymentMode)) {
      return NextResponse.json(
        { error: 'Invalid payment mode. Must be "full" or "deposit"' },
        { status: 400 }
      );
    }

    // Fetch booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        bookingSigners: true,
        bookingAddons: {
          include: { addon: true }
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Calculate total amount including add-ons
    const addonTotal = booking.bookingAddons?.reduce(
      (total, addon) => total + Number(addon.totalPrice), 
      0
    ) || 0;
    const totalAmount = Number(booking.finalPrice) + addonTotal;

    // Enhanced payment amount calculation
    let paymentAmount = totalAmount;
    let remainingBalance = 0;
    
    if (paymentMode === 'deposit' && booking.Service.requiresDeposit) {
      paymentAmount = Number(booking.Service.depositAmount);
      remainingBalance = totalAmount - paymentAmount;
      
      // Validate deposit amount doesn't exceed total
      if (paymentAmount >= totalAmount) {
        paymentAmount = totalAmount;
        remainingBalance = 0;
      }
    }

    // Create line items for Stripe with better descriptions
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.Service.name}${paymentMode === 'deposit' ? ' (Deposit)' : ''}`,
            description: `Scheduled for ${booking.scheduledDateTime?.toLocaleDateString() || 'TBD'}${
              paymentMode === 'deposit' && remainingBalance > 0 
                ? ` • Remaining balance: $${remainingBalance.toFixed(2)}` 
                : ''
            }`,
          },
          unit_amount: Math.round(Number(booking.finalPrice) * 100),
        },
        quantity: 1,
      },
    ];

    // Add line items for each add-on
    if (booking.bookingAddons) {
      for (const bookingAddon of booking.bookingAddons) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: bookingAddon.addon.name,
              description: bookingAddon.addon.description || '',
            },
            unit_amount: Math.round(Number(bookingAddon.unitPrice) * 100),
          },
          quantity: bookingAddon.quantity,
        });
      }
    }

    // Enhanced metadata for better tracking
    const metadata: Record<string, string> = {
      bookingId: booking.id,
      serviceId: booking.serviceId,
      totalSigners: (booking.totalSigners || 1).toString(),
      paymentMode,
      totalAmount: totalAmount.toFixed(2),
      paymentAmount: paymentAmount.toFixed(2),
      remainingBalance: remainingBalance.toFixed(2),
      isRONService: booking.locationType === 'REMOTE_ONLINE_NOTARIZATION' ? 'true' : 'false',
    };

    // Add primary signer info
    const primarySigner = booking.bookingSigners?.find(s => s.signerRole === 'PRIMARY');
    if (primarySigner) {
      metadata.primarySignerEmail = primarySigner.signerEmail;
      metadata.primarySignerName = primarySigner.signerName;
    } else if (booking.signerEmail && booking.signerName) {
      // Fallback to booking-level signer info
      metadata.primarySignerEmail = booking.signerEmail;
      metadata.primarySignerName = booking.signerName;
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: primarySigner?.signerEmail || booking.signerEmail,
      metadata,
      success_url: `${process.env.NEXTAUTH_URL}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/booking-payment-canceled?bookingId=${bookingId}`,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bookingId: booking.id,
        amount: paymentAmount,
        status: 'PENDING',
        provider: 'STRIPE',
        providerPaymentId: checkoutSession.id,
        currency: 'USD',
        updatedAt: new Date(),
        notes: paymentMode === 'deposit' ? 'Deposit payment' : 'Full payment',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      paymentAmount,
      totalSigners: booking.totalSigners,
    });

  } catch (error) {
    console.error('Enhanced payment creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}

// GET endpoint for payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const bookingId = searchParams.get('bookingId');

    if (!sessionId && !bookingId) {
      return NextResponse.json(
        { error: 'Session ID or Booking ID is required' },
        { status: 400 }
      );
    }

    let paymentData = null;

    if (sessionId) {
      // Retrieve Stripe session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Find corresponding payment record
      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: sessionId },
        include: {
          Booking: {
            include: {
              bookingSigners: true,
              Service: true,
            }
          }
        },
      });

      paymentData = {
        sessionId: session.id,
        status: session.payment_status,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        customerEmail: session.customer_email,
        paymentIntent: session.payment_intent,
        booking: payment?.Booking,
      };
    } else if (bookingId) {
      // Find all payments for booking
      const payments = await prisma.payment.findMany({
        where: { bookingId },
        include: {
          Booking: {
            include: {
              bookingSigners: true,
              Service: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      paymentData = {
        payments: payments.map(p => ({
          id: p.id,
          amount: Number(p.amount),
          status: p.status,
          provider: p.provider,
          createdAt: p.createdAt,
          notes: p.notes,
        })),
        totalPaid: payments
          .filter(p => p.status === 'COMPLETED')
          .reduce((total, p) => total + Number(p.amount), 0),
      };
    }

    return NextResponse.json({
      success: true,
      payment: paymentData,
    });

  } catch (error) {
    console.error('Payment status retrieval error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve payment status' },
      { status: 500 }
    );
  }
} 