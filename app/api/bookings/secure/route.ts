import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { BookingStatus, LocationType, Role } from '@prisma/client';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) 
  : null;

// Comprehensive booking validation schema
const createBookingSchema = z.object({
  // Customer Information (required for all bookings)
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  
  // Service Details (required)
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledDateTime: z.string().datetime('Valid date/time is required'),
  
  // Location Information (required based on service type)
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'OUR_OFFICE', 'REMOTE_ONLINE_NOTARIZATION', 'PUBLIC_PLACE']),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  locationNotes: z.string().optional(),
  
  // Optional booking details
  notes: z.string().optional(),
  promoCode: z.string().optional(),
  numberOfSigners: z.number().min(1).max(20).optional(),
  documentCount: z.number().min(0).max(100).optional(),
  
  // Consent flags (required for booking)
  consentTermsConditions: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  consentSmsNotifications: z.boolean().optional(),
  consentEmailUpdates: z.boolean().optional(),
  
  // Lead tracking (optional)
  leadSource: z.string().optional(),
  campaignName: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

// Secure booking creation
export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    try {
      // Parse and validate request body
      const body = await request.json();
      const validatedData = createBookingSchema.parse(body);

      console.log(`[BOOKING] Creating booking - User: ${context.isAuthenticated ? context.userId : 'guest'}, Email: ${validatedData.customerEmail}`);

      // Start database transaction
      const booking = await prisma.$transaction(async (tx) => {
        // 1. Validate service exists and is active
        const service = await tx.service.findUnique({
          where: { id: validatedData.serviceId }
        });

        if (!service || !service.active) {
          throw new Error('Service not available');
        }

        // 2. Validate time slot availability
        const scheduledDateTime = new Date(validatedData.scheduledDateTime);
        await validateTimeSlotAvailability(tx, scheduledDateTime, service.duration);

        // 3. Calculate pricing with promo code validation
        const pricing = await calculateBookingPricing(tx, service, validatedData.promoCode);

        // 4. Handle user logic (authenticated vs guest)
        let bookingUserId: string | null = null;
        
        if (context.isAuthenticated) {
          // For authenticated users, use their user ID
          bookingUserId = context.userId!;
          
          // Verify user email matches (security check)
          const dbUser = await tx.user.findUnique({
            where: { id: context.userId! },
            select: { email: true }
          });
          
          if (dbUser?.email !== validatedData.customerEmail) {
            console.warn(`[BOOKING] Email mismatch for user ${context.userId}: ${dbUser?.email} vs ${validatedData.customerEmail}`);
            // Allow booking but log the discrepancy - useful for shared accounts
          }
        } else {
          // For guest users, check if email exists in system
          const existingUser = await tx.user.findUnique({
            where: { email: validatedData.customerEmail },
            select: { id: true }
          });
          
          if (existingUser) {
            // Email exists - recommend login but allow guest booking
            console.log(`[BOOKING] Guest booking with existing user email: ${validatedData.customerEmail}`);
          }
          // bookingUserId remains null for guest bookings
        }

        // 5. Create the booking
        const newBooking = await tx.booking.create({
          data: {
            // Service & Timing
            serviceId: validatedData.serviceId,
            scheduledDateTime: scheduledDateTime,
            
            // Required signer fields (use customer info for guest bookings)
            signerId: bookingUserId,
            signerEmail: validatedData.customerEmail,
            signerName: validatedData.customerName,
            signerPhone: validatedData.customerPhone,
            
            // Location
            locationType: validatedData.locationType,
            addressStreet: validatedData.addressStreet,
            addressCity: validatedData.addressCity,
            addressState: validatedData.addressState,
            addressZip: validatedData.addressZip,
            locationNotes: validatedData.locationNotes,
            
            // Pricing - using new required fields
            basePrice: pricing.price,
            priceAtBooking: pricing.price,
            finalPrice: pricing.finalPrice,
            promoDiscount: pricing.promoDiscount,
            promoCodeId: pricing.promoCodeInfo?.id,
            promoCodeDiscount: pricing.promoDiscount,
            
            // Status
            status: pricing.finalPrice > 0 ? BookingStatus.PAYMENT_PENDING : BookingStatus.CONFIRMED,
            depositStatus: pricing.finalPrice > 0 ? 'PENDING' : 'COMPLETED',
            
            // Customer info for guest bookings (deprecated fields but keeping for compatibility)
            customerEmail: validatedData.customerEmail,
            
            // Additional Details
            notes: validatedData.notes,
            
            // Lead Tracking
            leadSource: validatedData.leadSource,
            campaignName: validatedData.campaignName,
          },
          include: {
            service: true,
            promoCode: true,
            signer: context.canViewAllBookings ? {
              select: { id: true, name: true, email: true }
            } : false,
          }
        });

        // 6. Create Stripe payment intent if payment required
        let paymentClientSecret: string | undefined;
        if (pricing.finalPrice > 0 && stripe) {
          try {
            const { PricingUtils } = await import('@/lib/pricing-utils');
            const paymentAmount = pricing.finalPrice; // Use the calculated final price
            const paymentIntent = await stripe.paymentIntents.create({
              amount: PricingUtils.toCents(paymentAmount), // Use centralized conversion
              currency: 'usd',
              metadata: {
                bookingId: newBooking.id,
                serviceId: service.id,
                customerEmail: validatedData.customerEmail,
                userId: bookingUserId || 'guest',
              },
              description: `Booking for ${service.name} - ${validatedData.customerName}`,
            });

            paymentClientSecret = paymentIntent.client_secret || undefined;

            // Create Payment record instead of storing in notes
            await tx.payment.create({
              data: {
                bookingId: newBooking.id,
                amount: pricing.finalPrice,
                status: 'PENDING',
                provider: 'STRIPE',
                paymentIntentId: paymentIntent.id,
                notes: 'Booking deposit payment'
              }
            });

          } catch (stripeError) {
            console.error('[BOOKING] Stripe payment intent creation failed:', stripeError);
            throw new Error('Payment processing setup failed');
          }
        }

        return { booking: newBooking, paymentClientSecret };
      }, {
        maxWait: 5000,    // Wait up to 5 seconds to acquire transaction
        timeout: 30000,   // Transaction timeout of 30 seconds
        isolationLevel: 'ReadCommitted' // Prevent phantom reads while allowing concurrent access
      });

      // 7. Post-booking actions (outside transaction)
      try {
        // Send notifications (don't let this fail the booking)
        await Promise.allSettled([
          sendBookingConfirmationEmail(booking.booking),
          createGHLContact(booking.booking),
          logBookingEvent(booking.booking, context),
        ]);
      } catch (postBookingError) {
        console.error('[BOOKING] Post-booking actions failed:', postBookingError);
        // Don't fail the booking for notification failures
      }

      // 8. Return success response
      return NextResponse.json({
        success: true,
        booking: {
          id: booking.booking.id,
          status: booking.booking.status,
          scheduledDateTime: booking.booking.scheduledDateTime,
          finalPrice: Number(booking.booking.priceAtBooking) - Number(booking.booking.promoCodeDiscount || 0),
          service: {
            name: booking.booking.service.name,
            duration: booking.booking.service.duration,
          },
          paymentClientSecret: booking.paymentClientSecret,
        },
        message: (Number(booking.booking.priceAtBooking) - Number(booking.booking.promoCodeDiscount || 0)) > 0 
          ? 'Booking created successfully. Please complete payment.'
          : 'Booking confirmed successfully!',
      }, { status: 201 });

    } catch (error) {
      console.error('[BOOKING] Creation failed:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        }, { status: 400 });
      }

      if (error instanceof Error) {
        return NextResponse.json({
          error: error.message,
        }, { status: 400 });
      }

      return NextResponse.json({
        error: 'Booking creation failed',
      }, { status: 500 });
    }
  }, AuthConfig.optional()); // Allow both authenticated and guest users
}

// GET method for retrieving bookings (auth required)
export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    if (!context.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');

      // Build where clause based on user role
      let whereClause: any = {};

      if (context.canViewAllBookings) {
        // Admin/Staff can see all bookings
        if (status) {
          whereClause.status = status as BookingStatus;
        }
      } else {
        // Regular users can only see their own bookings
        whereClause.signerId = context.userId;
        if (status) {
          whereClause.status = status as BookingStatus;
        }
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          include: {
            service: true,
            promoCode: true,
            signer: context.canViewAllBookings ? {
              select: { id: true, name: true, email: true }
            } : false,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.booking.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });

    } catch (error) {
      console.error('[BOOKING] Retrieval failed:', error);
      return NextResponse.json({ error: 'Failed to retrieve bookings' }, { status: 500 });
    }
  }, AuthConfig.authenticated()); // Require authentication for viewing bookings
}

// Helper functions
async function validateTimeSlotAvailability(
  tx: any,
  scheduledDateTime: Date,
  duration: number
) {
  const endTime = new Date(scheduledDateTime.getTime() + duration * 60000);

  const conflictingBookings = await tx.booking.findMany({
    where: {
      AND: [
        {
          scheduledDateTime: {
            lt: endTime,
          },
        },
        {
          // Check if the new booking would end after an existing booking starts
          scheduledDateTime: {
            gte: scheduledDateTime,
          },
        },
        {
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.PAYMENT_PENDING, BookingStatus.IN_PROGRESS],
          },
        },
      ],
    },
  });

  if (conflictingBookings.length > 0) {
    throw new Error('Time slot is not available');
  }
}

async function calculateBookingPricing(tx: any, service: any, promoCodeStr?: string) {
  const price = Number(service.price);
  let pricing = {
          price: price,
    promoDiscount: 0,
    finalPrice: price,
    promoCodeInfo: undefined as any,
  };

  if (promoCodeStr) {
    const promoCode = await tx.promoCode.findFirst({
      where: {
        code: promoCodeStr,
        active: true,
        OR: [
          { validUntil: null },
          { validUntil: { gt: new Date() } },
        ],
      },
    });

    if (promoCode) {
      let discount = 0;
      if (promoCode.discountType === 'PERCENTAGE') {
        discount = (price * Number(promoCode.discountValue)) / 100;
      } else if (promoCode.discountType === 'FIXED_AMOUNT') {
        discount = Number(promoCode.discountValue);
      }

      discount = Math.min(discount, price); // Don't let discount exceed price
      
      pricing.promoDiscount = discount;
      pricing.finalPrice = price - discount;
      pricing.promoCodeInfo = {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: Number(promoCode.discountValue),
      };
    }
  }

  return pricing;
}

async function sendBookingConfirmationEmail(booking: any) {
  // Implement email sending logic
  console.log(`[BOOKING] Sending confirmation email to ${booking.signerEmail}`);
}

async function createGHLContact(booking: any) {
  // Implement GHL contact creation
  console.log(`[BOOKING] Creating GHL contact for ${booking.signerEmail}`);
}

async function logBookingEvent(booking: any, context: any) {
  console.log(`[BOOKING] Event logged - Booking ${booking.id} created by ${context.isAuthenticated ? 'user' : 'guest'}`);
} 