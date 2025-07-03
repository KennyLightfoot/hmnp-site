/**
 * Championship Booking System - Booking Creation API
 * Houston Mobile Notary Pros
 * 
 * Main booking creation endpoint that orchestrates the entire booking process
 * with Stripe payments, GHL integration, and all the championship features.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';
import { 
  CreateBookingSchema, 
  validateBookingData,
  formatValidationError,
  BookingTriageSchema,
  ServiceTypeSchema,
  LocationTypeSchema,
  CustomerInfoSchema,
  LocationSchema,
  ServiceDetailsSchema,
  SchedulingSchema,
  PaymentInfoSchema
} from '@/lib/booking-validation';
import { calculateBookingPrice } from '@/lib/pricing-engine';
import { slotReservationEngine } from '@/lib/slot-reservation';
import { RONService } from '@/lib/proof/api';
import { headers } from 'next/headers';

// Enhanced request schema with additional metadata - using safer schema composition
const BookingCreationSchema = z.object({
  // Base CreateBookingSchema fields
  triageResults: BookingTriageSchema.optional(),
  serviceType: ServiceTypeSchema,
  locationType: LocationTypeSchema,
  customer: CustomerInfoSchema,
  location: LocationSchema.optional(),
  serviceDetails: ServiceDetailsSchema,
  scheduling: SchedulingSchema,
  payment: PaymentInfoSchema,
  promoCode: z.string().max(20).optional(),
  referralCode: z.string().max(50).optional(),
  bookingSource: z.string().default('website'),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  utmParameters: z.record(z.string()).optional(),
  
  // Additional fields for creation
  reservationId: z.string().optional(),
  paymentMethodId: z.string().optional(), // Stripe payment method ID
  savePaymentMethod: z.boolean().default(false),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to terms and conditions'),
  marketingConsent: z.boolean().default(false),
  source: z.string().default('website')
});

type BookingCreationRequest = z.infer<typeof BookingCreationSchema>;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let bookingData: any;
  let bookingId: string | undefined;
  
  try {
    // Get client information
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
                headersList.get('x-real-ip') || 
                'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Parse and validate request
    const body = await request.json();
    bookingData = body;
    
    const validatedBooking = BookingCreationSchema.parse(body);
    
    // Type assertion to help TypeScript understand the validated structure
    const booking = validatedBooking as any;
    
    logger.info('Booking creation started', {
      serviceType: booking.serviceType,
      customerEmail: booking.customer.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      reservationId: booking.reservationId,
      ip: ip.substring(0, 10) + '...'
    });

    // Step 1: Calculate final pricing
    const pricingParams = {
      serviceType: booking.serviceType,
      location: booking.location ? {
        address: `${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode}`,
        latitude: booking.location.latitude,
        longitude: booking.location.longitude
      } : undefined,
      scheduledDateTime: new Date(
        `${booking.scheduling.preferredDate.split('T')[0]}T${booking.scheduling.preferredTime}`
      ).toISOString(),
      documentCount: booking.serviceDetails.documentCount,
      signerCount: booking.serviceDetails.signerCount,
      options: {
        priority: booking.scheduling.priority,
        sameDay: booking.scheduling.sameDay,
        weatherAlert: false
      },
      customerEmail: booking.customer.email,
      promoCode: booking.promoCode,
      referralCode: booking.referralCode
    };

    const pricingResult = await calculateBookingPrice(pricingParams);
    
    // Step 2: Create booking record in database
    const scheduledDateTime = new Date(
      `${booking.scheduling.preferredDate.split('T')[0]}T${booking.scheduling.preferredTime}`
    );

    // Generate unique booking number
    const bookingNumber = `HMN${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    const newBooking = await prisma.newBooking.create({
      data: {
        bookingNumber,
        serviceType: booking.serviceType,
        customerEmail: booking.customer.email,
        customerName: booking.customer.name,
        customerPhone: booking.customer.phone,
        companyName: booking.customer.companyName,
        
        scheduledDateTime,
        estimatedDuration: booking.scheduling.estimatedDuration,
        timeZone: booking.scheduling.timeZone,
        
        locationType: booking.locationType,
        locationAddress: booking.location ? 
          `${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode}` : 
          null,
        locationLatitude: booking.location?.latitude,
        locationLongitude: booking.location?.longitude,
        locationNotes: booking.location?.accessInstructions,
        
        documentCount: booking.serviceDetails.documentCount,
        documentTypes: booking.serviceDetails.documentTypes,
        signerCount: booking.serviceDetails.signerCount,
        specialInstructions: booking.serviceDetails.specialInstructions,
        accessInstructions: booking.location?.accessInstructions,
        
        basePrice: pricingResult.basePrice,
        travelFee: pricingResult.travelFee,
        surcharges: pricingResult.surcharges,
        discounts: pricingResult.discounts,
        totalPrice: pricingResult.total,
        
        paymentStatus: 'PENDING',
        status: 'PENDING',
        
        bookingSource: booking.source,
        referralCode: booking.referralCode,
        promoCode: booking.promoCode,
        clientNotes: booking.serviceDetails.clientNotes
      }
    });

    bookingId = newBooking.id;
    
    logger.info('Booking record created', {
      bookingId,
      bookingNumber,
      totalPrice: pricingResult.total
    });

    // Step 3: Handle payment processing
    let paymentIntent: any = null;
    let requiresPayment = pricingResult.total > 0;
    
    if (requiresPayment && booking.payment.paymentMethod === 'credit-card') {
      // Determine payment amount (full or deposit)
      const paymentAmount = booking.payment.payFullAmount ? 
        pricingResult.total : 
        (pricingResult.total > 100 ? pricingResult.total * 0.5 : pricingResult.total);

      // Create Stripe payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(paymentAmount * 100), // Convert to cents
        currency: 'usd',
        payment_method: booking.paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          bookingId: newBooking.id,
          bookingNumber: newBooking.bookingNumber,
          customerEmail: booking.customer.email,
          serviceType: booking.serviceType
        },
        description: `Houston Mobile Notary - ${booking.serviceType} - ${newBooking.bookingNumber}`,
        receipt_email: booking.customer.email,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation/${newBooking.id}`
      });

      // Update booking with payment info
      await prisma.newBooking.update({
        where: { id: newBooking.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          depositAmount: paymentAmount,
          depositPaid: paymentIntent.status === 'succeeded',
          balanceDue: pricingResult.total - paymentAmount,
          paymentStatus: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
          status: paymentIntent.status === 'succeeded' ? 'CONFIRMED' : 'PAYMENT_PENDING'
        }
      });

      // Create payment record
      await prisma.newPayment.create({
        data: {
          bookingId: newBooking.id,
          amount: paymentAmount,
          currency: 'usd',
          paymentMethod: 'CREDIT_CARD',
          stripePaymentIntentId: paymentIntent.id,
          status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
          paidAt: paymentIntent.status === 'succeeded' ? new Date() : null
        }
      });
    }

    // Step 4: Convert slot reservation to booking
    if (validatedBooking.reservationId) {
      await slotReservationEngine.convertToBooking(validatedBooking.reservationId, newBooking.id);
    }

    // Step 5: Create RON session if applicable
    let ronSessionUrl: string | null = null;
    let proofTransactionId: string | null = null;
    
    if (validatedBooking.serviceType === 'RON_SERVICES') {
      try {
        const ronSession = await RONService.createRONSession({
          id: newBooking.id,
          customerName: validatedBooking.customer.name,
          customerEmail: validatedBooking.customer.email,
          customerPhone: validatedBooking.customer.phone,
          documentTypes: validatedBooking.serviceDetails.documentTypes || ['General Document'],
          scheduledDateTime
        });
        
        if (ronSession) {
          proofTransactionId = ronSession.id;
          ronSessionUrl = ronSession.sessionUrl;
          
          // Update booking with RON session info
          await prisma.newBooking.update({
            where: { id: newBooking.id },
            data: {
              proofTransactionId,
              ronSessionUrl
            }
          });
          
          logger.info('RON session created for booking', {
            bookingId: newBooking.id,
            proofTransactionId,
            hasSessionUrl: !!ronSessionUrl
          });
        }
      } catch (ronError: any) {
        logger.error('Failed to create RON session', {
          bookingId: newBooking.id,
          error: ronError.message
        });
        // Don't fail the booking if RON setup fails - continue without it
      }
    }
    
    // Step 6: Create audit log
    await prisma.newBookingAuditLog.create({
      data: {
        bookingId: newBooking.id,
        action: 'BOOKING_CREATED',
        newValues: {
          bookingNumber: newBooking.bookingNumber,
          serviceType: validatedBooking.serviceType,
          totalPrice: pricingResult.total,
          source: validatedBooking.source,
          paymentStatus: newBooking.paymentStatus,
          proofTransactionId
        },
        timestamp: new Date()
      }
    });

    const processingTime = Date.now() - startTime;
    
    logger.info('Booking creation completed', {
      bookingId,
      bookingNumber,
      processingTime,
      paymentStatus: paymentIntent?.status || 'no-payment-required'
    });

    // Return success response
    const response = {
      success: true,
      booking: {
        id: newBooking.id,
        bookingNumber: newBooking.bookingNumber,
        status: newBooking.status,
        totalPrice: pricingResult.total,
        scheduledDateTime: scheduledDateTime.toISOString(),
        serviceType: validatedBooking.serviceType
      },
      payment: paymentIntent ? {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        requiresAction: paymentIntent.status === 'requires_action',
        clientSecret: paymentIntent.client_secret
      } : null,
      ron: ronSessionUrl ? {
        sessionUrl: ronSessionUrl,
        transactionId: proofTransactionId
      } : null,
      ronSessionUrl, // Include for backward compatibility
      pricing: pricingResult,
      metadata: {
        processingTime,
        timestamp: new Date().toISOString(),
        bookingCreated: true,
        ronEnabled: !!ronSessionUrl
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      logger.warn('Booking creation validation error', {
        errors: error.errors,
        processingTime,
        customerEmail: bookingData?.customer?.email ? 
          bookingData.customer.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined
      });
      
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: formatValidationError(error)
      }, { status: 400 });
    }

    // Handle Stripe errors
    if ((error as any).type && (error as any).type.startsWith('Stripe')) {
      logger.error('Stripe payment error during booking creation', {
        bookingId,
        error: (error as any).message,
        type: (error as any).type,
        code: (error as any).code,
        processingTime
      });

      // If booking was created but payment failed, update status
      if (bookingId) {
        try {
          await prisma.newBooking.update({
            where: { id: bookingId },
            data: { 
              status: 'CANCELLED',
              internalNotes: `Payment failed: ${error.message}`
            }
          });
        } catch (updateError: any) {
          logger.error('Failed to update booking status after payment error', {
            bookingId,
            error: updateError.message
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Payment processing failed',
        code: 'PAYMENT_ERROR',
        details: {
          type: (error as any).type,
          message: (error as any).message
        }
      }, { status: 402 });
    }

    // General error handling
    logger.error('Booking creation failed', {
      bookingId,
      error: (error as any).message,
      stack: (error as any).stack,
      processingTime,
      customerEmail: bookingData?.customer?.email ? 
        bookingData.customer.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined
    });

    return NextResponse.json({
      success: false,
      error: 'Booking creation failed. Please try again.',
      code: 'BOOKING_CREATION_ERROR'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}