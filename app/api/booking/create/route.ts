/**
 * Simple Booking Creation API - Houston Mobile Notary Pros
 * Basic booking: validate → save to database → send email
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    const {
      serviceType,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      bookingTime,
      locationAddress,
      pricing
    } = data;

    if (!serviceType || !customerName || !customerEmail || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (serviceType !== 'RON_SERVICES' && !locationAddress) {
      return NextResponse.json(
        { error: 'Address required for mobile services' },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pricing.totalPrice * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        service_type: serviceType,
        customer_email: customerEmail,
        booking_date: bookingDate,
        booking_time: bookingTime
      }
    });

    // Save booking to database
    const booking = await prisma.booking.create({
      data: {
        serviceType,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        bookingDate: new Date(bookingDate),
        bookingTime,
        locationAddress: locationAddress || null,
        basePrice: pricing.basePrice,
        travelFee: pricing.travelFee,
        totalPrice: pricing.totalPrice,
        paymentStatus: 'pending',
        stripePaymentId: paymentIntent.id,
        status: 'confirmed'
      }
    });

    // Send confirmation email (basic implementation)
    try {
      await sendConfirmationEmail(booking);
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Booking creation failed' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(booking: any) {
  // Simple email implementation
  // In a real app, you'd integrate with your email service here
  console.log('Sending confirmation email to:', booking.customerEmail);
  console.log('Booking details:', {
    id: booking.id,
    service: booking.serviceType,
    date: booking.bookingDate,
    time: booking.bookingTime,
    total: booking.totalPrice
  });
}