/**
 * Unified Booking API Route Handler
 * Consolidates functionality from multiple booking endpoints:
 * - /api/booking/route.ts (GHL integration)
 * - /api/bookings/route.ts (full business logic) 
 * - /api/bookings/create/route.ts (simplified creation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { z } from 'zod';
import Stripe from 'stripe';
import * as ghl from '@/lib/ghl';
import { GoogleCalendarService } from '@/lib/google-calendar';
import { promoCodeService } from '@/lib/services/promo-code';
import { settingsService } from '@/lib/services/settings';
import { trackBookingConfirmation, trackLoanSigningBooked, trackRONCompleted } from '@/lib/tracking';
import { addMinutes, startOfDay } from 'date-fns';
import type { 
  Booking, 
  Service, 
  BookingStatus, 
  LocationType, 
  PaymentProvider, 
  PaymentStatus, 
  Prisma 
} from '@prisma/client';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' }) 
  : null;

// Unified validation schema combining all endpoint requirements
const unifiedBookingSchema = z.object({
  // Core service details
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledDateTime: z.string().datetime('Valid date/time is required').optional(),
  
  // Customer information (flexible naming for backward compatibility)
  customerName: z.string().min(1, 'Customer name is required').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required').optional(),
  company: z.string().optional(),
  
  // Location information
  locationType: z.enum([
    'CLIENT_SPECIFIED_ADDRESS', 
    'OUR_OFFICE', 
    'REMOTE_ONLINE_NOTARIZATION', 
    'PUBLIC_PLACE'
  ]).optional(),
  address: z.string().optional(), // Legacy field name
  addressStreet: z.string().optional(),
  city: z.string().optional(), // Legacy field name  
  addressCity: z.string().optional(),
  state: z.string().optional(), // Legacy field name
  addressState: z.string().optional(),
  postalCode: z.string().optional(), // Legacy field name
  addressZip: z.string().optional(),
  addressLatitude: z.string().optional(),
  addressLongitude: z.string().optional(),
  locationNotes: z.string().optional(),
  
  // Service-specific details
  numberOfSigners: z.number().min(1).max(20).optional(),
  signingLocation: z.string().optional(), // Legacy GHL field
  specialInstructions: z.string().optional(), // Legacy GHL field
  notes: z.string().optional(),
  
  // Pricing and promotions
  promoCode: z.string().optional(),
  referredBy: z.string().optional(),
  
  // Booking preferences
  preferredDate: z.string().optional(), // Legacy GHL field
  preferredTime: z.string().optional(), // Legacy GHL field
  urgencyLevel: z.string().optional(),
  
  // Consent and notifications
  smsNotifications: z.boolean().default(false),
  emailUpdates: z.boolean().default(false),
  consent_terms_conditions: z.boolean().optional(),
  
  // Lead tracking
  leadSource: z.string().optional(),
  campaignName: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  locationId: z.string().optional(), // GHL location override
  
  // Advanced booking features
  additionalCharges: z.number().optional(),
  clientType: z.string().optional(),
  documentCount: z.number().optional(),
  travelMileage: z.number().optional(),
  travelFee: z.number().optional(),
  witnessCount: z.number().optional(),
  documentUrl: z.string().optional(),
});

type UnifiedBookingRequest = z.infer<typeof unifiedBookingSchema>;

interface BookingResponse {
  booking: any;
  checkoutUrl?: string | null;
  ghlContact?: any;
  calendarEvent?: any;
}

interface BookingPricing {
  basePrice: number;
  promoDiscount: number;
  finalPrice: number;
  depositAmount: number;
  promoCodeInfo?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
}

// Helper: Normalize customer name from various input formats
function normalizeCustomerName(data: UnifiedBookingRequest): { 
  fullName: string; 
  firstName: string; 
  lastName: string; 
} {
  if (data.customerName) {
    const parts = data.customerName.trim().split(' ');
    return {
      fullName: data.customerName,
      firstName: parts[0] || 'Client',
      lastName: parts.slice(1).join(' ') || ''
    };
  }
  
  if (data.firstName || data.lastName) {
    return {
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      firstName: data.firstName || 'Client',
      lastName: data.lastName || ''
    };
  }
  
  return {
    fullName: 'Guest Client',
    firstName: 'Guest',
    lastName: 'Client'
  };
}

// Helper: Normalize address from various input formats
function normalizeAddress(data: UnifiedBookingRequest): {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
} {
  return {
    street: data.addressStreet || data.address || null,
    city: data.addressCity || data.city || null,
    state: data.addressState || data.state || null,
    zip: data.addressZip || data.postalCode || null
  };
}

// Helper: Calculate booking pricing with unified promo code logic
async function calculateUnifiedPricing(
  service: any,
  promoCode?: string,
  customerEmail?: string,
  referredBy?: string
): Promise<BookingPricing> {
  let basePrice = Number(service.basePrice);
  let promoDiscount = 0;
  let promoCodeInfo = undefined;
  
  // Check if customer is first-time client for FIRST25 discount
  let isFirstTimeClient = false;
  try {
    const existingContact = await ghl.getContactByEmail(customerEmail || '');
    isFirstTimeClient = !existingContact;
  } catch (error) {
    console.warn('Could not verify first-time client status:', error);
  }
  
  // Apply promo code logic
  if (promoCode) {
    const normalizedPromoCode = promoCode.trim().toUpperCase();
    
    if (normalizedPromoCode === 'FIRST25' && isFirstTimeClient) {
      promoDiscount = 25;
      promoCodeInfo = {
        id: 'FIRST25',
        code: 'FIRST25',
        discountType: 'AMOUNT',
        discountValue: 25
      };
    } else {
      // Use existing promo code service for database promo codes
      try {
        const validation = await promoCodeService.validatePromoCode(
          promoCode,
          service.id,
          basePrice,
          customerEmail || ''
        );
        
        if (validation.isValid && validation.promoCode) {
          promoDiscount = validation.discountAmount || 0;
          promoCodeInfo = {
            id: validation.promoCode.id,
            code: validation.promoCode.code,
            discountType: validation.promoCode.discountType,
            discountValue: Number(validation.promoCode.discountValue)
          };
        }
      } catch (error) {
        console.warn('Promo code validation failed:', error);
      }
    }
  } else if (referredBy && isFirstTimeClient) {
    // Apply referral discount
    promoDiscount = 25;
    promoCodeInfo = {
      id: 'REFERRAL25',
      code: 'REFERRAL25',
      discountType: 'AMOUNT',
      discountValue: 25
    };
  }
  
  const finalPrice = Math.max(0, basePrice - promoDiscount);
  const depositAmount = service.requiresDeposit ? Number(service.depositAmount) : finalPrice;
  
  return {
    basePrice,
    promoDiscount,
    finalPrice,
    depositAmount,
    promoCodeInfo
  };
}

// Helper: Create or find customer
async function findOrCreateCustomer(
  email: string,
  name: string,
  phone?: string,
  isAuthenticated: boolean = false,
  userId?: string
) {
  if (isAuthenticated && userId) {
    // For authenticated users, verify they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
    
    if (user) {
      return {
        id: user.id,
        name: user.name || name,
        email: user.email,
        isExisting: true
      };
    }
  }
  
  // For guest users or if authenticated user not found
  let user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'SIGNER',
        phone: phone || null
      },
      select: { id: true, name: true, email: true }
    });
  }
  
  return {
    id: user.id,
    name: user.name || name,
    email: user.email,
    isExisting: !!user
  };
}

// Helper: Validate time slot availability
async function validateTimeSlotAvailability(
  scheduledDateTime: Date,
  serviceId: string,
  serviceDuration: number
): Promise<void> {
  // Get booking settings
  const bookingSettings = await settingsService.getBookingSettings();
  
  // Check business hours
  const dayName = scheduledDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySettings = bookingSettings.businessHours[dayName as keyof typeof bookingSettings.businessHours];
  
  if (!daySettings?.enabled) {
    throw new Error('Selected date is not available for bookings');
  }
  
  // Check for conflicting bookings
  const startOfDay = startOfDay(scheduledDateTime);
  const endOfDay = addMinutes(startOfDay, 24 * 60);
  
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      scheduledDateTime: {
        gte: startOfDay,
        lt: endOfDay
      },
      status: {
        in: ['CONFIRMED', 'SCHEDULED', 'PAYMENT_PENDING', 'READY_FOR_SERVICE', 'IN_PROGRESS']
      }
    },
    include: {
      service: {
        select: { durationMinutes: true }
      }
    }
  });
  
  // Check for time conflicts
  const hasConflict = conflictingBookings.some(booking => {
    if (!booking.scheduledDateTime) return false;
    
    const bookingStart = new Date(booking.scheduledDateTime);
    const bookingEnd = addMinutes(bookingStart, booking.service.durationMinutes + bookingSettings.bufferTimeMinutes);
    const requestedStart = scheduledDateTime;
    const requestedEnd = addMinutes(scheduledDateTime, serviceDuration + bookingSettings.bufferTimeMinutes);
    
    return (
      (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
      (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
      (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
    );
  });
  
  if (hasConflict) {
    throw new Error('Selected time slot is no longer available');
  }
  
  // Check minimum booking notice (2 hours default)
  const minimumBookingTime = new Date();
  minimumBookingTime.setHours(minimumBookingTime.getHours() + 2);
  
  if (scheduledDateTime < minimumBookingTime) {
    throw new Error('Bookings require at least 2 hours advance notice');
  }
}

// Helper: Create GHL contact and apply tags
async function createGHLIntegration(
  booking: any,
  customerData: any,
  service: any,
  pricingData: BookingPricing,
  checkoutUrl?: string | null
): Promise<any> {
  if (!process.env.GHL_LOCATION_ID) {
    console.warn('GHL_LOCATION_ID not configured, skipping GHL integration');
    return null;
  }
  
  try {
    const { firstName, lastName, fullName } = customerData;
    const address = normalizeAddress(booking);
    
    // Prepare GHL contact payload
    const ghlContactPayload = {
      email: booking.signerEmail,
      firstName,
      lastName,
      phone: booking.signerPhone || undefined,
      address1: address.street || undefined,
      city: address.city || undefined,
      state: address.state || undefined,
      postalCode: address.zip || undefined,
      country: address.state ? 'US' : undefined,
      source: 'HMNP Website Booking',
      companyName: booking.companyName || undefined,
      locationId: process.env.GHL_LOCATION_ID,
      customField: {
        booking_id: booking.id,
        payment_url: checkoutUrl || '',
        payment_amount: pricingData.finalPrice.toString(),
        service_requested: service.name,
        service_price: service.price.toString(),
        appointment_date: booking.scheduledDateTime ? 
          new Date(booking.scheduledDateTime).toLocaleDateString('en-US') : '',
        appointment_time: booking.scheduledDateTime ? 
          new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
      }
    };
    
    // Create/update contact
    const ghlContact = await ghl.upsertContact(ghlContactPayload);
    const contactId = ghlContact?.id || ghlContact?.contact?.id;
    
    if (contactId) {
      // Apply tags
      const tags = [
        'source:website_booking',
        `Service:${service.name.replace(/\s+/g, '_').toLowerCase()}`,
        `status:booking_${booking.status.toLowerCase()}`,
        'status:booking_created'
      ];
      
      if (pricingData.promoDiscount > 0) {
        tags.push('discount:applied');
      }
      
      if (pricingData.promoCodeInfo?.code) {
        tags.push(`promo:${pricingData.promoCodeInfo.code.toLowerCase()}`);
      }
      
      await ghl.addTagsToContact(contactId, tags);
      
      // Update booking with GHL contact ID
      await prisma.booking.update({
        where: { id: booking.id },
        data: { ghlContactId: contactId }
      });
      
      return { contactId, tags };
    }
    
    return null;
  } catch (error) {
    console.error('GHL integration failed:', error);
    return null;
  }
}

// GET: List bookings with filtering and pagination
export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const locationType = searchParams.get('locationType') as LocationType | null;
      const status = searchParams.get('status') as BookingStatus | null;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      
      // Build where clause based on user permissions
      let whereClause: any = {};
      
      if (context.isAuthenticated) {
        if (context.canViewAllBookings) {
          // Admin/Staff can see all bookings
          if (locationType) whereClause.locationType = locationType;
          if (status) whereClause.status = status;
        } else {
          // Regular users see only their bookings
          whereClause.signerId = context.userId;
          if (locationType) whereClause.locationType = locationType;
          if (status) whereClause.status = status;
        }
      } else {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          include: {
            service: true,
            promoCode: true,
            User_Booking_signerIdToUser: context.canViewAllBookings ? {
              select: { id: true, name: true, email: true }
            } : false,
            NotarizationDocument: true,
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
      console.error('Booking retrieval failed:', error);
      return NextResponse.json({ error: 'Failed to retrieve bookings' }, { status: 500 });
    }
  }, AuthConfig.authenticated());
}

// POST: Create new booking with unified logic
export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    try {
      const rawData = await request.json();
      const data = unifiedBookingSchema.parse(rawData);
      
      // Normalize customer information
      const customerData = normalizeCustomerName(data);
      const address = normalizeAddress(data);
      
      // Get service details
      const service = await prisma.Service.findUnique({
        where: { id: data.serviceId, isActive: true }
      });
      
      if (!service) {
        return NextResponse.json({ 
          error: 'Selected service is not available or not found' 
        }, { status: 404 });
      }
      
      // Validate time slot if scheduled
      if (data.scheduledDateTime) {
        const scheduledDate = new Date(data.scheduledDateTime);
        await validateTimeSlotAvailability(scheduledDate, service.id, service.durationMinutes);
      }
      
      // Calculate pricing
      const pricingData = await calculateUnifiedPricing(
        service,
        data.promoCode,
        data.email,
        data.referredBy
      );
      
      // Determine initial status
      const finalAmountDue = pricingData.depositAmount > 0 ? pricingData.depositAmount : pricingData.finalPrice;
      const initialStatus: BookingStatus = finalAmountDue > 0 ? 'PAYMENT_PENDING' : 'CONFIRMED';
      
      // Find or create customer
      const customer = await findOrCreateCustomer(
        data.email,
        customerData.fullName,
        data.phone,
        context.isAuthenticated,
        context.userId
      );
      
      // Create booking
      const bookingData: any = {
        service: { connect: { id: service.id } },
        scheduledDateTime: data.scheduledDateTime ? new Date(data.scheduledDateTime) : null,
        status: initialStatus,
        locationType: data.locationType || 'CLIENT_SPECIFIED_ADDRESS',
        addressStreet: address.street,
        addressCity: address.city,
        addressState: address.state,
        addressZip: address.zip,
        locationNotes: data.locationNotes,
        basePrice: pricingData.basePrice,
        priceAtBooking: service.basePrice,
        finalPrice: pricingData.finalPrice,
        promoDiscount: pricingData.promoDiscount,
        depositAmount: pricingData.depositAmount,
        notes: data.notes || data.specialInstructions,
        signerEmail: data.email,
        signerName: customerData.fullName,
        signerPhone: data.phone || null,
      };
      
      // Add user connection if authenticated
      if (context.isAuthenticated && customer.id) {
        bookingData.User_Booking_signerIdToUser = { connect: { id: customer.id } };
      }
      
      // Add promo code if used
      if (pricingData.promoCodeInfo && pricingData.promoCodeInfo.id !== 'FIRST25' && pricingData.promoCodeInfo.id !== 'REFERRAL25') {
        bookingData.promoCode = { connect: { id: pricingData.promoCodeInfo.id } };
      }
      
      const booking = await prisma.booking.create({
        data: bookingData,
        include: {
          Service: true,
          User_Booking_signerIdToUser: context.isAuthenticated ? {
            select: { id: true, name: true, email: true }
          } : false,
          promoCode: true,
        }
      });
      
      // Create Stripe checkout session if payment required
      let checkoutUrl: string | null = null;
      if (initialStatus === 'PAYMENT_PENDING' && stripe && finalAmountDue > 0) {
        try {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Booking for ${service.name}`,
                  description: booking.scheduledDateTime ? 
                    `Service: ${service.name} on ${new Date(booking.scheduledDateTime).toLocaleDateString()}` :
                    `Service: ${service.name}`,
                },
                unit_amount: Math.round(finalAmountDue * 100),
              },
              quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.NEXTAUTH_URL}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/booking-payment-canceled`,
            metadata: { bookingId: booking.id },
            customer_email: data.email,
          });
          
          checkoutUrl = session.url;
        } catch (stripeError) {
          console.error('Stripe session creation failed:', stripeError);
        }
      }
      
      // GHL Integration
      const ghlResult = await createGHLIntegration(
        booking,
        customerData,
        service,
        pricingData,
        checkoutUrl
      );
      
      // Create Google Calendar event
      let calendarEvent = null;
      if (booking.scheduledDateTime) {
        try {
          const calendarService = new GoogleCalendarService();
          calendarEvent = await calendarService.createBookingEvent(booking);
          
          if (calendarEvent?.id) {
            await prisma.booking.update({
              where: { id: booking.id },
              data: { googleCalendarEventId: calendarEvent.id }
            });
          }
        } catch (calendarError) {
          console.error('Calendar event creation failed:', calendarError);
        }
      }
      
      // Apply promo code usage if database promo code was used
      if (pricingData.promoCodeInfo && 
          pricingData.promoCodeInfo.id !== 'FIRST25' && 
          pricingData.promoCodeInfo.id !== 'REFERRAL25') {
        try {
          await promoCodeService.applyPromoCode(pricingData.promoCodeInfo.id, booking.id);
        } catch (promoError) {
          console.warn('Failed to apply promo code usage:', promoError);
        }
      }
      
      // Track booking for analytics
      try {
        trackBookingConfirmation({
          booking_id: booking.id,
          service_type: service.name,
          booking_value: pricingData.finalPrice,
          customer_type: customer.isExisting ? 'returning' : 'new',
          payment_method: 'stripe'
        });
      } catch (trackingError) {
        console.warn('Booking tracking failed:', trackingError);
      }
      
      const response: BookingResponse = {
        booking,
        checkoutUrl,
        ghlContact: ghlResult,
        calendarEvent
      };
      
      return NextResponse.json(response, { status: 201 });
      
    } catch (error) {
      console.error('Booking creation failed:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'Booking creation failed'
      }, { status: 500 });
    }
  }, AuthConfig.optional()); // Allow both authenticated and guest users
}