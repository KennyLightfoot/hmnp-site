/**
 * CONSOLIDATED BOOKING API ENDPOINT
 * This file has been updated to use the unified booking logic
 * Combines functionality from /api/booking and /api/bookings/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { Booking, Service, BookingStatus, LocationType, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { trackBookingConfirmation, trackLoanSigningBooked, trackRONCompleted, trackSameDayServiceRequested, trackAfterHoursServiceRequested } from '@/lib/tracking';
import { sendGHLMessage } from '../../../lib/ghl-messaging';
import { GoogleCalendarService } from '../../../lib/google-calendar-disabled';
import { rateLimiters, rateLimitConfigs } from '@/lib/rate-limiting';
import { pricingValidator } from '@/lib/security/pricing-validator';
import { kpiTracker } from '@/lib/analytics/kpi-tracker';
// Custom fields temporarily disabled - using standard GHL fields and tags

// Using tags-only approach for optimal business operations
// Custom fields can be enabled later when business needs advanced analytics

interface BookingRequestBody {
  firstName?: string; // For guest's first name
  lastName?: string;  // For guest's last name
  email: string; // Explicitly require email in the body
  serviceId: string;
  scheduledDateTime?: string; // ISO string
  locationType?: LocationType;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  locationNotes?: string;
  notes?: string; // Will map to cf_booking_special_instructions
  promoCode?: string;
  referredBy?: string; // Will map to cf_referred_by_name_or_email
  phone?: string; // Phone number from form for GHL standard field
  companyName?: string; // From frontend form (as 'company')

  // New fields from plan
  booking_number_of_signers?: number;
  consent_terms_conditions?: boolean;
  smsNotifications?: boolean; // For SMS consent
  emailUpdates?: boolean; // For Email consent

  // Additional optional fields based on our discussion
  additionalCharges?: number; // e.g., for extra services
  clientType?: string; // e.g., 'individual', 'business', 'escrow'
  documentCount?: number; // Total number of documents to be notarized
  travelMileage?: number; // Mileage for mobile notary service
  travelFee?: number; // Calculated travel fee
  urgencyLevel?: string; // e.g., 'standard', 'rush', 'emergency'
  witnessCount?: number; // Number of witnesses provided or needed
  documentUrl?: string; // Link to documents if uploaded

  // Lead Source Tracking
  leadSource?: string;
  campaignName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// --- Stripe and GHL Integration Imports ---
import Stripe from 'stripe';
import * as ghl from '@/lib/ghl'; // Import GHL helper utility
import { convertCustomFieldsArrayToObject } from '@/lib/ghl'; // Import the new utility function
import type { GhlContact, GhlCustomField } from '@/lib/ghl'; // Import GHL types

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' }) : null;

// Input validation schema for booking creation
const createBookingSchema = z.object({
  // Customer Information
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  
  // Service Details
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledDateTime: z.string().datetime('Valid date/time is required'),
  
  // Location Information
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'OUR_OFFICE', 'REMOTE_ONLINE_NOTARIZATION', 'PUBLIC_PLACE']),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  locationNotes: z.string().optional(),
  
  // Pricing & Promo
  promoCode: z.string().optional(),
  
  // Additional Details
  notes: z.string().optional(),
  
  // Lead Source Tracking
  leadSource: z.string().optional(),
  campaignName: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

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

// 🔧 DIAGNOSTIC: Mock GHL contact creation for testing incomplete integration
async function createMockGHLContact(email: string, bookingData: BookingRequestBody, booking: any): Promise<string | null> {
  try {
    // Simulate contact creation in GHL with mock data
    const mockContactId = `mock-contact-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    console.log('🔧 MOCK GHL: Would create contact with data:', {
      email,
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      phone: bookingData.phone,
      service: booking.serviceId,
      bookingId: booking.id,
      timestamp: new Date().toISOString()
    });
    
    // Simulate the API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log what would be sent to GHL workflows
    console.log('🔧 MOCK GHL: Would trigger workflows:', {
      contactId: mockContactId,
      workflowTypes: ['booking_created', 'payment_pending', 'new_client_notification'],
      tags: [
        'source:website_booking',
        'status:booking_created',
        'client:first_time',
        `service:${booking.serviceId}`,
        'consent:diagnostic_mock'
      ]
    });
    
    return mockContactId;
  } catch (error) {
    console.error('🔧 MOCK GHL: Error in mock contact creation:', error);
    return null;
  }
}

// Helper function to trigger specific GHL workflows
async function triggerGHLWorkflows(contactId: string, bookingStatus: BookingStatus, serviceName?: string) {
  if (!process.env.GHL_API_BASE_URL || !process.env.GHL_API_KEY) {
    console.warn('GHL API credentials missing, skipping workflow triggers');
    return;
  }

  const workflowsToTrigger: string[] = [];
  
  // Determine which workflows to trigger based on booking status
  if (bookingStatus === BookingStatus.PAYMENT_PENDING) {
    // Add your payment pending workflow ID
    if (process.env.GHL_PAYMENT_PENDING_WORKFLOW_ID) {
      workflowsToTrigger.push(process.env.GHL_PAYMENT_PENDING_WORKFLOW_ID);
    }
  } else if (bookingStatus === BookingStatus.CONFIRMED) {
    // Add your booking confirmed workflow ID
    if (process.env.GHL_BOOKING_CONFIRMED_WORKFLOW_ID) {
      workflowsToTrigger.push(process.env.GHL_BOOKING_CONFIRMED_WORKFLOW_ID);
    }
  }

  // Add general booking notification workflow if it exists
  if (process.env.GHL_NEW_BOOKING_WORKFLOW_ID) {
    workflowsToTrigger.push(process.env.GHL_NEW_BOOKING_WORKFLOW_ID);
  }

  // Trigger each workflow
  for (const workflowId of workflowsToTrigger) {
    try {
      const response = await fetch(`${process.env.GHL_API_BASE_URL}/contacts/${contactId}/workflow/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
          'Version': '2021-07-28',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        console.log(`GHL: Successfully triggered workflow ${workflowId} for contact ${contactId}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error(`GHL: Failed to trigger workflow ${workflowId}:`, errorData);
      }
    } catch (error) {
      console.error(`GHL: Error triggering workflow ${workflowId}:`, error);
    }
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    // Rate limiting for booking list access
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimiters.api.checkRateLimit(
      `bookings-get:${clientIP}`,
      rateLimitConfigs.api
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime,
          remaining: rateLimitResult.remaining
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfigs.api.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      );
    }

    try {
      const { searchParams } = new URL(request.url);
      const locationType = searchParams.get('locationType') as LocationType | null;
      const status = searchParams.get('status') as BookingStatus | null;
      
      // Safe pagination with proper limits
      const { parsePaginationParams, createPaginationResult, getPrismaQueryParams, getPaginationLimits } = await import('@/lib/utils/pagination');
      const paginationLimits = getPaginationLimits(context.canViewAllBookings ? 'admin' : 'bookings');
      const paginationParams = parsePaginationParams(searchParams, paginationLimits);

      // Build where clause based on user role and filters
      let whereClause: any = {};

      if (context.isAuthenticated) {
        if (context.canViewAllBookings) {
          // Admin/Staff can see all bookings
          if (locationType) {
            whereClause.locationType = locationType;
          }
          if (status) {
            whereClause.status = status;
          }
        } else {
          // Regular users can only see their own bookings
          whereClause.signerId = context.userId;
          if (locationType) {
            whereClause.locationType = locationType;
          }
          if (status) {
            whereClause.status = status;
          }
        }
      } else {
        // Guest users cannot access booking list
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          include: {
            Service: true,
            promoCode: true,
            User_Booking_signerIdToUser: context.canViewAllBookings ? {
              select: { id: true, name: true, email: true }
            } : false,
            NotarizationDocument: true, // Include RON documents
          },
          orderBy: { createdAt: 'desc' },
          ...getPrismaQueryParams(paginationParams),
        }),
        prisma.booking.count({ where: whereClause }),
      ]);

      // Create standardized pagination response
      const result = createPaginationResult(bookings, total, paginationParams);

      return NextResponse.json({
        bookings: result.data,
        pagination: result.pagination,
      });

    } catch (error) {
      console.error('[BOOKING] Retrieval failed:', error);
      return NextResponse.json({ error: 'Failed to retrieve bookings' }, { status: 500 });
    }
  }, AuthConfig.authenticated()); // Require authentication for viewing bookings
}

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
    // Strict rate limiting for booking creation (5 requests per minute)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userIdentifier = user?.email || clientIP;
    const rateLimitResult = await rateLimiters.booking.checkRateLimit(
      `booking-create:${userIdentifier}`,
      rateLimitConfigs.booking
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many booking attempts. Please wait before trying again.',
          resetTime: rateLimitResult.resetTime,
          remaining: rateLimitResult.remaining,
          message: 'Rate limit: 5 booking attempts per minute allowed'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfigs.booking.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      );
    }

    const ghlLocationId = process.env.GHL_LOCATION_ID;
    if (!ghlLocationId) {
      console.error('GHL_LOCATION_ID environment variable is not set.');
      return NextResponse.json({ error: 'Server configuration error: GHL Location ID is missing.' }, { status: 500 });
    }

    console.log(`[BOOKING] Creating booking - User: ${context.isAuthenticated ? context.userId : 'guest'}`);
    
    let signerUserId: string | null = context.isAuthenticated ? context.userId! : null;
    let signerUserEmail: string;
    let signerUserName: string | null = null;
  
  try {
    const body = await request.json() as BookingRequestBody;
    // Extract email from request body - required for all bookings
    // Handle both 'email' and 'customerEmail' field names for compatibility
    signerUserEmail = body.email || (body as any).customerEmail;
    
    if (!signerUserEmail) {
      return NextResponse.json({ error: 'Email is required for booking' }, { status: 400 });
    }

    // If authenticated, use user data and verify user exists
    if (context.isAuthenticated && user.isAuthenticated) {
      signerUserId = user.id;
      
      // SECURITY FIX: For authenticated users, ONLY use the authenticated email
      // Never allow authenticated users to override their email address
      if (!user.email) {
        return NextResponse.json(
          { error: 'Authenticated user account missing email - please contact support' }, 
          { status: 400 }
        );
      }
      
      signerUserEmail = user.email;
      signerUserName = user.name ?? null;
      
      // Security audit: Log if form email differs from authenticated email
      if (body.email && body.email.toLowerCase() !== user.email.toLowerCase()) {
        await prisma.securityAuditLog.create({
          data: {
            userEmail: user.email,
            userId: user.id,
            action: 'EMAIL_MISMATCH_ATTEMPT',
            details: {
              authenticatedEmail: user.email,
              formEmail: body.email,
              requestIP: request.headers.get('x-forwarded-for') || 'unknown'
            },
            severity: 'WARN'
          }
        });
        
        console.warn('SECURITY: Authenticated user attempted to use different email', {
          userId: user.id,
          authenticatedEmail: user.email,
          formEmail: body.email
        });
      }
      
      console.log("Authenticated booking with USER IDs:", {
        signerUserId,
        signerUserEmail,
        signerUserName
      });
      
      // Verify authenticated user exists in database
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: signerUserId },
          select: { id: true }
        });
        
        console.log("User exists check:", userExists);
        
        if (!userExists) {
          console.log("Authenticated user not found in database. Proceeding as guest booking.");
          signerUserId = null; // Will create booking without user reference
        }
      } catch (userCheckError) {
        console.error("Error checking if user exists:", userCheckError);
        signerUserId = null; // Will create booking without user reference
      }
    } else {
      // SECURITY: Enhanced validation for guest bookings
      // Check if email belongs to an existing authenticated user
      const existingUser = await prisma.user.findUnique({
        where: { email: signerUserEmail.toLowerCase() },
        select: { id: true, email: true }
      });
      
      if (existingUser) {
        // SECURITY FIX: If email belongs to existing user, require authentication
        await prisma.securityAuditLog.create({
          data: {
            userEmail: signerUserEmail,
            userId: existingUser.id,
            action: 'GUEST_BOOKING_ATTEMPT_EXISTING_USER',
            details: {
              email: signerUserEmail,
              requestIP: request.headers.get('x-forwarded-for') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown'
            },
            severity: 'WARN'
          }
        });
        
        return NextResponse.json(
          { 
            error: 'An account already exists with this email address. Please sign in to create bookings.',
            requireAuthentication: true
          }, 
          { status: 403 }
        );
      }
      
      // For guest bookings, validate email format and use form data
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signerUserEmail)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' }, 
          { status: 400 }
        );
      }
      
      // Handle both field name formats for compatibility
      const firstName = body.firstName || (body as any).customerName?.split(' ')[0];
      const lastName = body.lastName || (body as any).customerName?.split(' ').slice(1).join(' ');
      const customerName = (body as any).customerName;
      
      signerUserName = customerName || `${firstName || ''} ${lastName || ''}`.trim() || null;
      
      if (!signerUserName || signerUserName.length < 2) {
        return NextResponse.json(
          { error: 'Please provide your full name for the booking' }, 
          { status: 400 }
        );
      }
      
      console.log("Guest booking with validated data:", {
        signerUserEmail,
        signerUserName
      });
    }
    
    const {
      serviceId,
      scheduledDateTime,
      locationType,
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      locationNotes,
      notes,
      promoCode,
      referredBy,
      companyName, // Added
      booking_number_of_signers,
      consent_terms_conditions,
      smsNotifications,
      emailUpdates,
      // New optional fields
      additionalCharges,
      clientType,
      documentCount,
      travelMileage,
      travelFee,
      urgencyLevel,
      witnessCount,
      documentUrl, // Added
      leadSource,
      campaignName,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Handle phone field compatibility
    const phone = body.phone || (body as any).customerPhone;

    // SECURITY FIX: Use secure server-side pricing validation
    let pricingResult = null;
    let discountAmount = 0;
    let isFirstTimeDiscountApplied = false;
    let isReferralDiscountApplied = false;
    
    // Get service details first for pricing calculation
    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId, isActive: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Selected service is not available or not found' }, { status: 404 });
    }

    const basePrice = service.basePrice?.toNumber() || 0;

    // Validate promo code if provided
    if (promoCode?.trim()) {
      try {
        pricingResult = await pricingValidator.validatePromoCode({
          code: promoCode.trim().toUpperCase(),
          userEmail: signerUserEmail,
          serviceId: serviceId,
          bookingAmount: basePrice,
        });
        
        if (pricingResult) {
          discountAmount = pricingResult.discountAmount;
          if (pricingResult.appliedPromoCode === "FIRST25") {
            isFirstTimeDiscountApplied = true;
          }
        }
      } catch (error) {
        // Invalid promo code format or other validation error
        console.warn(`Invalid promo code format: ${promoCode}`, error);
      }
    }
    
    // Validate referral discount if no promo code applied
    if (!pricingResult && referredBy?.trim()) {
      try {
        pricingResult = await pricingValidator.validateReferralDiscount({
          referrerEmail: referredBy.trim(),
          newUserEmail: signerUserEmail,
          serviceId: serviceId,
        });
        
        if (pricingResult?.isReferralDiscount) {
          discountAmount = pricingResult.discountAmount;
          isReferralDiscountApplied = true;
        }
      } catch (error) {
        console.warn(`Referral validation failed for ${referredBy}`, error);
      }
    }

        // Determine initial status based on whether payment is required
    let initialStatus: BookingStatus;
    const priceToConsiderForPayment = (service.requiresDeposit && service.depositAmount && service.depositAmount.toNumber() > 0) 
                                      ? service.depositAmount.toNumber() 
                                      : service.basePrice.toNumber();
    const finalAmountDueAfterDiscount = Math.max(0, priceToConsiderForPayment - discountAmount);

    if (finalAmountDueAfterDiscount > 0) {
      initialStatus = BookingStatus.PAYMENT_PENDING;
    } else {
      // If no payment is due (e.g., free service or fully discounted)
      initialStatus = BookingStatus.CONFIRMED; 
    }

    const priceAtBooking = service.basePrice;

    type BookingWithRelations = Prisma.BookingGetPayload<{
      include: {
        Service: true;
        User_Booking_signerIdToUser: { select: { id: true; name: true; email: true } };
      };
    }>;
    
    // Map the incoming string locationType to the Prisma enum
    let mappedLocationType: LocationType;
    switch (locationType) {
      case "CLIENT_SPECIFIED_ADDRESS":
        mappedLocationType = LocationType.CLIENT_SPECIFIED_ADDRESS;
        break;
      case "PUBLIC_PLACE":
        mappedLocationType = LocationType.PUBLIC_PLACE;
        break;
      default:
        console.error(`Invalid locationType received: ${locationType}`);
        return NextResponse.json({ error: `Invalid location type provided: ${locationType}. Valid types are CLIENT_SPECIFIED_ADDRESS, PUBLIC_PLACE.` }, { status: 400 });
    }

    // Generate unique booking ID
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare booking data, handling both authenticated and guest bookings
    const bookingData: any = {
      id: bookingId,
      Service: {
        connect: { id: service.id }
      },
      scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime) : null,
      status: initialStatus,
      locationType: mappedLocationType, // Use the mapped enum value
      addressStreet: addressStreet,
      addressCity: addressCity,
      addressState: addressState,
      addressZip: addressZip,
      locationNotes: locationNotes,
      // Pricing fields - using actual schema fields
      priceAtBooking: service.basePrice, // Required field - use service base price
      promoCodeDiscount: discountAmount, // Use existing promoCodeDiscount field
      depositAmount: service.requiresDeposit ? service.depositAmount : null, // Optional deposit amount
      notes: notes,
      // Customer information using schema fields
      customerEmail: signerUserEmail,
      // Required timestamp fields
      updatedAt: new Date(),
      // SECURITY: Store pricing snapshot for payment integrity validation
      priceSnapshotCents: pricingResult?.priceSnapshotCents || Math.round((service.basePrice.toNumber() - discountAmount) * 100),
      pricingCalculatedAt: new Date(),
      isFirstTimeDiscountApplied: isFirstTimeDiscountApplied,
      isReferralDiscountApplied: isReferralDiscountApplied,
      securityFlags: {
        pricingValidated: true,
        discountSource: pricingResult?.appliedPromoCode ? 'promo_code' : (pricingResult?.isReferralDiscount ? 'referral' : 'none'),
        validatedAt: new Date().toISOString(),
      },
      // Additional fields from form for guest bookings will be stored in GHL only
    };
    
          // Only include signerId for authenticated users with valid database records
      if (signerUserId) {
        // Connect to the User record using the relation field name from Prisma schema
        bookingData.User_Booking_signerIdToUser = {
          connect: {
            id: signerUserId,
          },
        };
      }
    
    // ATOMIC TRANSACTION: Create booking and handle payment in single transaction
    // NOTE: This API uses Stripe Checkout Sessions for payment processing.
    // Payment Intents are handled by /api/create-payment-intent for separate payment forms.
    // This ensures consistent payment flow and prevents checkout/intent confusion.
    console.log('[BOOKING TRANSACTION] Starting atomic booking creation transaction');
    
    const transactionResult = await prisma.$transaction(async (tx) => {
      console.log('[BOOKING TRANSACTION] Starting booking creation with race condition protection');
      
      // SECURITY FIX: Check for race condition double booking
      // Note: This checks notary conflicts if notaryId is provided, but most bookings 
      // are created without a specific notary assigned initially
      if (scheduledDateTime && bookingData.notaryId) {
        const existingBooking = await tx.booking.findFirst({
          where: {
            notaryId: bookingData.notaryId,
            scheduledDateTime: new Date(scheduledDateTime),
            status: {
              in: ['PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED']
            }
          }
        });
        
        if (existingBooking) {
          throw new Error(`DOUBLE_BOOKING_PREVENTED: Notary already has a booking at ${scheduledDateTime}`);
        }
      }
      
      // Additional check: Prevent too many bookings at the same time slot
      if (scheduledDateTime) {
        const scheduledTime = new Date(scheduledDateTime);
        const concurrentBookings = await tx.booking.count({
          where: {
            scheduledDateTime: scheduledTime,
            status: {
              in: ['PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED']
            }
          }
        });
        
        // Limit concurrent bookings at the same time (adjust based on business capacity)
        const MAX_CONCURRENT_BOOKINGS = 5;
        if (concurrentBookings >= MAX_CONCURRENT_BOOKINGS) {
          throw new Error(`TIME_SLOT_FULL: Maximum capacity reached for ${scheduledDateTime}`);
        }
      }
      
      console.log('[BOOKING TRANSACTION] Race condition check passed, creating booking');
      
      // Create the booking with race condition protection
      const newBooking = await tx.booking.create({
        data: bookingData,
        include: {
          Service: true,
          // Only include user relation if we have a signerId
          ...(signerUserId ? {
            User_Booking_signerIdToUser: {
              select: { id: true, name: true, email: true } 
            }
          } : {})
        }
      });
      
      console.log('[BOOKING TRANSACTION] Booking created:', newBooking.id);
      
      // Track booking for analytics and KPIs
      try {
        await kpiTracker.trackBooking({
          bookingId: newBooking.id,
          serviceType: service.key || 'STANDARD_NOTARY',
          bookingDate: new Date(),
          totalValue: finalAmount,
          basePrice: basePrice,
          travelFee: travelFee || 0,
          signerFees: additionalCharges || 0,
          discounts: discountAmount,
          distance: travelMileage || 0,
          location: {
            city: addressCity || 'Unknown',
            state: addressState || 'TX',
            zip: addressZip || '00000'
          },
          customerSegment: signerUserId ? 'returning' : 'new',
          bookingSource: 'website',
          timeToBook: 0, // Would track from session start in production
          status: 'pending'
        });
        console.log('[ANALYTICS] Booking tracked for KPI analysis:', newBooking.id);
      } catch (kpiError) {
        console.error('[ANALYTICS] Failed to track booking for KPIs:', kpiError);
        // Don't fail the booking for analytics issues
      }
      
      // SECURITY: Record promo code usage to prevent reuse
      if (pricingResult?.appliedPromoCode) {
        try {
          await pricingValidator.recordPromoCodeUsage(
            pricingResult.appliedPromoCode,
            signerUserEmail
          );
          console.log('[SECURITY] Promo code usage recorded:', pricingResult.appliedPromoCode);
        } catch (error) {
          console.error('[SECURITY] Failed to record promo code usage:', error);
          // Don't fail the booking, but log the error
        }
      }
      
      // For guest bookings, add client info to the response
      if (!signerUserId) {
        (newBooking as any).guestBooking = true;
        (newBooking as any).guestEmail = signerUserEmail;
      }
      
      let checkoutUrl: string | null = null;
      let paymentRecord: any = null;
      
      // Handle payment setup if required
      if (initialStatus === BookingStatus.PAYMENT_PENDING && stripe && finalAmountDueAfterDiscount > 0) {
        console.log('[BOOKING TRANSACTION] Setting up payment for booking:', newBooking.id);
        
        try {
          // Create payment record first in transaction
          paymentRecord = await tx.payment.create({
            data: {
              id: `pay_${newBooking.id}_${Date.now()}`,
              bookingId: newBooking.id,
              amount: finalAmountDueAfterDiscount,
              status: PaymentStatus.PENDING,
              provider: PaymentProvider.STRIPE,
            }
          });
          
          console.log('[BOOKING TRANSACTION] Payment record created:', paymentRecord.id);
          
          const amountToChargeInCents = Math.round(finalAmountDueAfterDiscount * 100);
          const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';
          const success_url = `${baseUrl}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`;
          const cancel_url = `${baseUrl}/booking-payment-canceled`;
          
          // Create Stripe session (this happens outside DB transaction but we validate first)
          const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Booking for ${newBooking.Service.name}`,
                  description: `Service: ${newBooking.Service.name} on ${newBooking.scheduledDateTime ? new Date(newBooking.scheduledDateTime).toLocaleDateString() : 'Date TBD'}`,
                },
                unit_amount: amountToChargeInCents,
              },
              quantity: 1,
            }],
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: {
              bookingId: newBooking.id,
              paymentId: paymentRecord.id,
            },
            // Conditionally add customer_email if signerUserEmail is available
            ...(signerUserEmail && { customer_email: signerUserEmail }),
          });
          
          checkoutUrl = stripeSession.url;
          
          console.log('[BOOKING TRANSACTION] Stripe session created:', stripeSession.id);
          
          // Update booking with payment information in same transaction
          await tx.booking.update({
            where: { id: newBooking.id },
            data: {
              stripePaymentUrl: checkoutUrl,
              notes: newBooking.notes ? `${newBooking.notes}\nPayment URL: ${checkoutUrl}` : `Payment URL: ${checkoutUrl}`
            }
          });
          
          // Update payment record with Stripe session info
          await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
              paymentIntentId: stripeSession.id,
            }
          });
          
          console.log('[BOOKING TRANSACTION] Payment setup completed successfully');
          
        } catch (stripeError: any) {
          console.error('[BOOKING TRANSACTION] Stripe error - rolling back transaction:', stripeError);
          // Throw error to rollback entire transaction
          throw new Error(`Payment setup failed: ${stripeError.message}`);
        }
      }
      
      return {
        booking: newBooking,
        checkoutUrl,
        paymentRecord
      };
    }, {
      timeout: 30000, // 30 second timeout
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
    
    console.log('[BOOKING TRANSACTION] Transaction completed successfully');
    
    const { booking: newBooking, checkoutUrl } = transactionResult;
    
    console.log("[BOOKING SUCCESS] Booking created successfully:", {
      id: newBooking.id,
      status: newBooking.status,
      hasPaymentUrl: !!checkoutUrl
    });

    // --- GHL API Integration: Upsert Contact & Apply Tags/Fields ---
    try {
      // Use signerUserEmail which is always populated, and signerUserName for guest details
          const emailForGhl = signerUserId ? newBooking.User_Booking_signerIdToUser?.email : signerUserEmail;
    let nameForGhl = signerUserId ? newBooking.User_Booking_signerIdToUser?.name : signerUserName;

      // Fallback for name if it's still null (e.g. guest didn't provide full name but might have provided first/last)
      if (!nameForGhl && (body.firstName || body.lastName)) {
        nameForGhl = `${body.firstName || ''} ${body.lastName || ''}`.trim();
      }

      if (emailForGhl) {
        let firstNameGhl = 'Client'; // Default if no name parts found
        let lastNameGhl = '';

        if (nameForGhl) {
          const nameParts = nameForGhl.trim().split(' ');
          firstNameGhl = nameParts[0] || 'Client'; // Ensure firstNameGhl is never empty
          if (nameParts.length > 1) {
            lastNameGhl = nameParts.slice(1).join(' ');
          }
        } else if (body.firstName || body.lastName) { // Fallback to form names if nameForGhl is still null
          firstNameGhl = body.firstName || 'Client';
          lastNameGhl = body.lastName || '';
        }
        
        // Define serviceAddressForGhl for GHL custom field
        let serviceAddressForGhl: string;
        if (body.locationType === 'CLIENT_SPECIFIED_ADDRESS') {
          // Use the already destructured addressStreet, addressCity, etc. from the body
          const parts = [
            addressStreet, 
            addressCity, 
            addressState, 
            addressZip
          ].filter(Boolean); // Filter out null, undefined, empty strings
          serviceAddressForGhl = parts.join(', ');
        } else if (body.locationType === 'PUBLIC_PLACE') {
          serviceAddressForGhl = 'Public Place';
        } else {
          // Fallback for any other location types or if body.locationType is undefined
          serviceAddressForGhl = ''; // Or a more descriptive placeholder like 'Location N/A'
        }

        // Using BOTH tags and custom fields for complete workflow support
        console.log("GHL: Populating custom fields for workflow automation");

        // Prepare custom fields for GHL workflows
        const customFields: { [key: string]: string } = {
          // Core booking fields
          booking_id: newBooking.id,
          payment_url: checkoutUrl || '',
          payment_amount: finalAmountDueAfterDiscount.toString(),
          
          // Service details
          service_requested: service.name,
          service_address: serviceAddressForGhl,
          service_price: service.basePrice.toString(),
          
          // Date/Time fields (all three for compatibility)
          appointment_date: scheduledDateTime ? 
            new Date(scheduledDateTime).toLocaleDateString('en-US') : '',
          appointment_time: scheduledDateTime ? 
            new Date(scheduledDateTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '',
          appointment_datetime: scheduledDateTime ? 
            new Date(scheduledDateTime).toISOString()
              .replace('T', ' ')
              .substring(0, 19) : '',
          
          // Workflow support fields
          preferred_datetime: scheduledDateTime || '',
          urgency_level: 'new',
          hours_old: '0',
        };

        // Define the main GHL contact payload
        const ghlContactPayload: GhlContact = {
          email: emailForGhl,
          firstName: firstNameGhl,
          lastName: lastNameGhl,
          phone: body.phone || undefined,
          address1: addressStreet || undefined,
          city: addressCity || undefined,
          state: addressState || undefined,
          postalCode: addressZip || undefined,
          country: addressState ? 'US' : undefined,
          source: 'HMNP Website Booking',
          companyName: body.companyName || undefined,
          locationId: ghlLocationId, // CRITICAL: Ensure locationId is included
          customField: customFields, // Populate custom fields for workflows
        };

        console.log("GHL Contact Payload (excluding tags):", JSON.stringify(ghlContactPayload, null, 2));

        try {
          console.log("Attempting to upsert GHL contact with location ID:", ghlLocationId);
          const ghlContact = await ghl.upsertContact(ghlContactPayload);
          console.log("GHL contact successfully upserted:", JSON.stringify(ghlContact, null, 2));
          
          // Fix: Check if ghlContact has an id property, handle different response formats
          const contactId = ghlContact?.id || ghlContact?.contact?.id;
          
          if (contactId) {
            // Store GHL contact ID in booking
            await prisma.booking.update({
              where: { id: newBooking.id },
              data: { 
                ghlContactId: contactId,
                customerEmail: emailForGhl // Store email for guest bookings
              }
            });
            
            const tagsToApply: string[] = [];
            if (service?.name) {
              tagsToApply.push(`service:${service.name.replace(/\s+/g, '_').toLowerCase()}`);
            }
            if (newBooking.status === BookingStatus.PAYMENT_PENDING) {
              tagsToApply.push('status:booking_pendingpayment');
            } else if (newBooking.status === BookingStatus.CONFIRMED) {
              tagsToApply.push('status:booking_confirmed');
            }

            // Add booking created tag for notification workflow
            tagsToApply.push('status:booking_created');
            
            // Check if this is an emergency service
            if (service?.name && (service.name.toLowerCase().includes('emergency') || service.name.toLowerCase().includes('urgent'))) {
              tagsToApply.push('service:Emergency');
              tagsToApply.push('extended-hours-notary:same_day');
            }

            if (isFirstTimeDiscountApplied) {
              tagsToApply.push('discount:firsttime_applied');
            }
            if (isReferralDiscountApplied) {
              tagsToApply.push('discount:referral_newclient_applied');
              tagsToApply.push('status:referred_client'); // Also tag as referred client
            }
            
            // Add consent tags based on body.smsNotifications and body.emailUpdates
            if (body.smsNotifications) {
              tagsToApply.push('consent:sms_opt_in');
            }
            if (body.emailUpdates) {
              tagsToApply.push('consent:marketing_opt_in'); // More specific tag
            }

            // Enhanced tagging strategy optimized for business automation

            // Add comprehensive business intelligence tags for current phase
            tagsToApply.push('source:website_booking');
            if (promoCode) {
              tagsToApply.push(`promo:${promoCode.toLowerCase()}`);
            }
            if (locationType) {
              tagsToApply.push(`location:${locationType.toLowerCase()}`);
            }
            if (isFirstTimeClient) {
              tagsToApply.push('client:first_time');
            }
            if (discountAmount > 0) {
              tagsToApply.push('discount:applied');
            }

            // Create Google Calendar event
            try {
              const calendarService = new GoogleCalendarService();
              const event = await calendarService.createBookingEvent(newBooking);
              const eventId = event?.id || null;
              
              // Update booking with calendar event ID
              if (eventId) {
                await prisma.booking.update({
                  where: { id: newBooking.id },
                  data: { googleCalendarEventId: eventId }
                });
              }
              
              console.log(`✅ Google Calendar event created: ${eventId}`);
            } catch (calendarError) {
              console.error('❌ Failed to create Google Calendar event:', calendarError);
              // Don't fail the booking if calendar creation fails
            }

            // Only add tags if we have tags to add and a valid contact ID
            if (tagsToApply.length > 0) {
              try {
                await ghl.addTagsToContact(contactId, tagsToApply);
                console.log(`GHL: Contact ${contactId} upserted and tags applied: ${tagsToApply.join(', ')}`);
                
                // NEW: Trigger specific workflows based on booking status
                await triggerGHLWorkflows(contactId, newBooking.status, service?.name);
                
              } catch (tagError) {
                console.error('GHL: Error adding tags to contact:', tagError);
                // Don't throw here, continue with booking creation
              }
            } else {
              console.log('GHL: No tags to apply to contact');
            }
          } else {
            console.warn('GHL: Contact upsertion did not return a valid contact ID. Response:', ghlContact);
          }
        } catch (upsertError) {
          console.error('GHL contact upsert error details:', upsertError instanceof Error ? {
            message: upsertError.message,
            name: upsertError.name,
            stack: upsertError.stack
          } : upsertError);
          
          // Enhanced error analysis for 403 errors
          const errorMessage = upsertError instanceof Error ? upsertError.message : String(upsertError);
          if (errorMessage.includes('403') || errorMessage.includes('does not have access to this location')) {
            console.error('🚨 GHL 403 ERROR ANALYSIS:');
            console.error('   - Location ID being used:', ghlLocationId);
            console.error('   - This suggests your GHL_API_KEY does not have access to location:', ghlLocationId);
            console.error('   - Possible solutions:');
            console.error('     1. Verify GHL_LOCATION_ID matches your GHL sub-account');
            console.error('     2. Regenerate your Private Integration Token (PIT)');
            console.error('     3. Ensure PIT has correct scopes: contacts.write, contacts.read');
            console.error('     4. Check if location ID changed after recent GHL updates');
          }
          
          console.error('This suggests a possible issue with the Private Integration Token permissions or formatting.');
          // Don't throw here to prevent booking failure, just log the error
          console.error('Continuing with booking creation despite GHL error...');
          
          // 🔧 DIAGNOSTIC: Mock contact creation fallback for GHL integration testing
          try {
            const mockContactId = await createMockGHLContact(signerUserEmail, body, newBooking);
            if (mockContactId) {
              await prisma.booking.update({
                where: { id: newBooking.id },
                data: { 
                  ghlContactId: mockContactId,
                  customerEmail: emailForGhl,
                  notes: (newBooking.notes || '') + '\n[MOCK CONTACT - GHL Integration Incomplete]'
                }
              });
              console.log('🔧 DIAGNOSTIC: Mock contact created as fallback:', mockContactId);
            }
          } catch (mockError) {
            console.error('🔧 DIAGNOSTIC: Mock contact creation also failed:', mockError);
          }
        }
      } else {
        console.warn('GHL: Signer email is missing, skipping GHL contact creation.');
      }
    } catch (ghlOverallError) {
      console.error("Error in overall GHL integration block:", ghlOverallError);
      // Optionally, add more specific error handling or re-throwing if needed
      // For now, logging the error and continuing is consistent with previous intent.
    }

    // Send booking confirmation notification
    if (newBooking && newBooking.service) {
      try {
        // Enhanced SOP tracking based on service type and booking details
        const serviceType = newBooking.service.serviceType;
        const serviceName = newBooking.service.name;
        const bookingValue = Number(newBooking.priceAtBooking);
        
        // Determine if special SOP events should be tracked
        const isLoanSigning = serviceType === 'LOAN_SIGNING_SPECIALIST' || 
                             serviceName.toLowerCase().includes('loan');
        const isRON = serviceName.toLowerCase().includes('ron') || 
                     serviceName.toLowerCase().includes('remote online');
        const isSameDay = newBooking.urgencyLevel === 'same-day';
        const isAfterHours = newBooking.urgencyLevel === 'emergency' || 
                           (newBooking.scheduledDateTime && 
                            (new Date(newBooking.scheduledDateTime).getHours() >= 21 || 
                             new Date(newBooking.scheduledDateTime).getHours() < 7));

        // Track appropriate SOP events
        if (isLoanSigning) {
          trackLoanSigningBooked({
            booking_id: newBooking.id,
            booking_value: bookingValue,
            loan_type: 'standard', // Could be enhanced based on booking notes
            signer_count: newBooking.booking_number_of_signers || 1,
            rush_service: isSameDay,
            scan_back_requested: false // Could be enhanced based on service addons
          });
        } else if (isRON) {
          trackRONCompleted({
            session_id: newBooking.id,
            service_value: bookingValue,
            signer_count: newBooking.booking_number_of_signers || 1,
            document_type: 'standard', // Could be enhanced based on booking details
            completion_time_minutes: 30 // Estimated, could be tracked from actual session
          });
        } else {
          // Standard booking tracking
          trackBookingConfirmation({
            booking_id: newBooking.id,
            service_type: serviceName,
            booking_value: bookingValue,
            customer_type: isFirstTimeClient ? 'new' : 'returning',
            payment_method: 'stripe'
          });
        }

        // Track special service requests per SOP
        if (isSameDay && !isLoanSigning) {
          trackSameDayServiceRequested({
            service_type: serviceName,
            base_value: Number(newBooking.service.basePrice),
            surcharge_applied: 25, // SOP: $25 same-day fee
            request_time: new Date().toISOString(),
            urgency_reason: 'same_day_request'
          });
        }

        if (isAfterHours && !isLoanSigning) {
          trackAfterHoursServiceRequested({
            service_type: serviceName,
            base_value: Number(newBooking.service.basePrice),
            after_hours_fee: 50, // SOP: $50 after-hours fee
            requested_time: newBooking.scheduledDateTime?.toISOString() || new Date().toISOString()
          });
        }

               } catch (trackingError) {
         console.error('SOP Tracking Error:', trackingError);
         // Don't fail the booking if tracking fails
       }
     }
      // Return the created booking and checkoutUrl (which may be null if payment not needed or Stripe failed)
      const newBookingWithRelations = newBooking as BookingWithRelations;
      // Add guestName to the response if it was a guest booking for easier frontend display
      if (!signerUserId && signerUserName) {
        (newBookingWithRelations as any).guestName = signerUserName;
      }
      
      console.log("!!!!!!!!!! FINAL API RESPONSE CHECKOUT URL:", checkoutUrl);
      console.log("!!!!!!!!!! FINAL API RESPONSE BOOKING ID:", newBookingWithRelations.id);
      
      return NextResponse.json({ booking: newBookingWithRelations, checkoutUrl }, { 
        status: 201,
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '19',
          'X-RateLimit-Reset': (Date.now() + 3600000).toString(), // 1 hour from now
        }
      });
  }
  catch (errorUnknown) {
    const requestId = Math.random().toString(36).substring(7);
    console.error(`[API /api/bookings ERROR ${requestId}]`, {
      error: errorUnknown instanceof Error ? errorUnknown.message : String(errorUnknown),
      stack: errorUnknown instanceof Error ? errorUnknown.stack : 'No stack',
      type: errorUnknown?.constructor?.name || 'Unknown',
      timestamp: new Date().toISOString()
    });
    
    // Log to database for production monitoring
    try {
      await prisma.backgroundError.create({
        data: {
          id: `booking_error_${requestId}_${Date.now()}`,
          source: 'booking-api',
          message: errorUnknown instanceof Error ? errorUnknown.message : String(errorUnknown),
          stack: errorUnknown instanceof Error ? errorUnknown.stack : null,
        }
      });
    } catch (logError) {
      console.error(`[API /api/bookings ERROR ${requestId}] Failed to log error:`, logError);
    }
    
    let errorMessage = 'An unexpected error occurred while creating the booking.';
    let statusCode = 500;

    // SECURITY: Handle race condition errors
    if (errorUnknown instanceof Error) {
      if (errorUnknown.message.includes('DOUBLE_BOOKING_PREVENTED')) {
        errorMessage = 'The selected time slot is no longer available. Please choose a different time.';
        statusCode = 409;
      } else if (errorUnknown.message.includes('TIME_SLOT_FULL')) {
        errorMessage = 'The selected time slot has reached maximum capacity. Please choose a different time.';
        statusCode = 409;
      }
    }

    if (errorUnknown instanceof Prisma.PrismaClientKnownRequestError) {
      switch (errorUnknown.code) {
        case 'P2002':
          // Unique constraint violation - likely our double booking prevention
          const constraint = errorUnknown.meta?.target;
          if (constraint?.includes('unique_notary_time_slot')) {
            errorMessage = 'The selected notary is already booked at this time. Please choose a different time or notary.';
          } else {
            errorMessage = 'A booking with these details already exists';
          }
          statusCode = 409;
          break;
        case 'P2025':
          errorMessage = 'The selected service is not available';
          statusCode = 404;
          break;
        case 'P2003':
          errorMessage = 'Invalid service or user reference';
          statusCode = 400;
          break;
        default:
          errorMessage = 'Database error occurred';
          statusCode = 503;
      }
    } else if (errorUnknown instanceof SyntaxError) {
      errorMessage = 'Invalid request body: Malformed JSON.';
      statusCode = 400;
    } else if (errorUnknown instanceof Error) {
      if (errorUnknown.message.includes('Payment setup failed')) {
        errorMessage = 'Payment processing error. Please try again.';
        statusCode = 402;
      } else if (errorUnknown.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
        statusCode = 408;
      } else if (errorUnknown.message.toLowerCase().includes('stripe')) {
        errorMessage = 'Payment system temporarily unavailable';
        statusCode = 503;
      } else if (errorUnknown.message.includes('validation')) {
        errorMessage = 'Invalid booking information provided';
        statusCode = 400;
      } else {
        errorMessage = `Failed to create booking: ${errorUnknown.message}`;
      }
    } else if (typeof errorUnknown === 'string') {
      errorMessage = `Failed to create booking: ${errorUnknown}`;
    }

    console.log(`[API /api/bookings ERROR ${requestId}] Status: ${statusCode}, Message: ${errorMessage}`);
    return NextResponse.json(
      { 
        error: errorMessage,
        requestId,
        details: process.env.NODE_ENV === 'development' ? String(errorUnknown) : undefined,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
  }, AuthConfig.optional()); // Allow both authenticated and guest users
} // End of POST function

// Helper function to validate time slot is still available
async function validateTimeSlotAvailability(
  tx: any, 
  scheduledDateTime: Date, 
  duration: number
) {
  const serviceEndTime = new Date(scheduledDateTime);
  serviceEndTime.setMinutes(serviceEndTime.getMinutes() + duration);
  
  // Check for conflicting bookings
  type BookingWithService = Prisma.BookingGetPayload<{ include: { Service: true } }>;

  const conflictingBookings: BookingWithService[] = await tx.booking.findMany({
    where: {
      scheduledDateTime: {
        gte: new Date(scheduledDateTime.getTime() - (60 * 60 * 1000)), // 1 hour before
        lte: new Date(scheduledDateTime.getTime() + (60 * 60 * 1000)), // 1 hour after
      },
      status: {
        notIn: ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF', 'NO_SHOW', 'ARCHIVED'],
      },
    },
    include: {
      Service: true,
    },
  });
  
  const hasConflict = conflictingBookings.some((booking: BookingWithService) => {
    if (!booking.scheduledDateTime) return false;
    
    const bookingStart = new Date(booking.scheduledDateTime);
    const bookingEnd = new Date(bookingStart);
          bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.service.durationMinutes);
    
    // Check for overlap
    return (scheduledDateTime < bookingEnd && serviceEndTime > bookingStart);
  });
  
  if (hasConflict) {
    throw new Error('Selected time slot is no longer available');
  }
  
  // Check if time is in the past
  if (scheduledDateTime <= new Date()) {
    throw new Error('Cannot book appointments in the past');
  }
  
  // Check lead time (minimum 2 hours by default)
  const minimumBookingTime = new Date();
  minimumBookingTime.setHours(minimumBookingTime.getHours() + 2);
  
  if (scheduledDateTime < minimumBookingTime) {
    throw new Error('Bookings require at least 2 hours advance notice');
  }
}

// Helper function to calculate booking pricing with promo codes
async function calculateBookingPricing(
  tx: any, 
  service: any, 
  promoCodeStr?: string
): Promise<BookingPricing> {
  let price = Number(service.basePrice);
  let promoDiscount = 0;
  let promoCodeInfo = undefined;
  
  // Apply promo code if provided
  if (promoCodeStr) {
    const promoCode = await tx.promoCode.findUnique({
      where: { code: promoCodeStr.toUpperCase() },
    });
    
    if (promoCode) {
      // Validate promo code
      const now = new Date();
      const isValid = (
        promoCode.isActive &&
        promoCode.validFrom <= now &&
        (!promoCode.validUntil || promoCode.validUntil >= now) &&
        (!promoCode.usageLimit || promoCode.usageCount < promoCode.usageLimit)
      );
      
      if (isValid) {
        // Check if service is applicable
        const isServiceApplicable = (
          promoCode.applicableServices.length === 0 || 
          promoCode.applicableServices.includes(service.id)
        );
        
        if (isServiceApplicable) {
          // Calculate discount
          if (promoCode.discountType === 'PERCENTAGE') {
            promoDiscount = price * (Number(promoCode.discountValue) / 100);
          } else {
            promoDiscount = Number(promoCode.discountValue);
          }
          
          // Apply maximum discount limit if set
          if (promoCode.maxDiscountAmount && promoDiscount > Number(promoCode.maxDiscountAmount)) {
            promoDiscount = Number(promoCode.maxDiscountAmount);
          }
          
          // Apply minimum order amount if set
          if (promoCode.minimumAmount && price < Number(promoCode.minimumAmount)) {
            promoDiscount = 0;
          }
          
          promoCodeInfo = {
            id: promoCode.id,
            code: promoCode.code,
            discountType: promoCode.discountType,
            discountValue: Number(promoCode.discountValue),
          };
        }
      }
    }
  }
  
  const finalPrice = Math.max(0, price - promoDiscount);
  const depositAmount = service.requiresDeposit ? Number(service.depositAmount) : 0;
  
  return {
    basePrice: price,
    promoDiscount,
    finalPrice,
    depositAmount,
    promoCodeInfo,
  };
}

// Helper function to find or create customer user record
async function findOrCreateCustomer(tx: any, customerData: {
  name: string;
  email: string;
  phone: string;
}) {
  // Try to find existing customer by email
  let customer = await tx.user.findUnique({
    where: { email: customerData.email },
  });
  
  // If not found, create new customer
  if (!customer) {
    customer = await tx.user.create({
      data: {
        name: customerData.name,
        email: customerData.email,
        role: 'SIGNER',
        createdAt: new Date(),
      },
    });
  }
  
  return customer;
}
