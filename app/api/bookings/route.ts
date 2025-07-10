/**
 * CONSOLIDATED BOOKING API ENDPOINT
 * This file has been updated to use the unified booking logic
 * Combines functionality from /api/booking and /api/bookings/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withAuth, AuthConfig } from '@/lib/auth/unified-middleware';
import { Booking, Service, BookingStatus, LocationType, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { trackBookingConfirmation, trackLoanSigningBooked, trackRONCompleted, trackSameDayServiceRequested, trackAfterHoursServiceRequested } from '@/lib/tracking';
import { sendGHLMessage } from '../../../lib/ghl-messaging';
import { GoogleCalendarService } from '../../../lib/google-calendar';
import { createGHLIntegration } from '@/lib/ghl/booking-integration';
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
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' }) : null;

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
    try {
      const { searchParams } = new URL(request.url);
      const locationType = searchParams.get('locationType') as LocationType | null;
      const status = searchParams.get('status') as BookingStatus | null;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

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
            PromoCode: true,
                    User_Booking_signerIdToUser: context.canViewAllBookings ? {
          select: { id: true, name: true, email: true }
        } : false,
            NotarizationDocument: true, // Include RON documents
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

export async function POST(request: NextRequest) {
  return withAuth(request, async ({ user, context }) => {
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
    
    // Handle field mapping for simple booking form compatibility
    const customerName = (body as any).customerName || `${body.firstName || ''} ${body.lastName || ''}`.trim();
    const customerEmail = (body as any).customerEmail || body.email;
    const customerPhone = (body as any).customerPhone || body.phone;
    
    // Extract email from request body - required for all bookings
    signerUserEmail = customerEmail;
    
    if (!signerUserEmail) {
      return NextResponse.json({ error: 'Email is required for booking' }, { status: 400 });
    }

    // If authenticated, use user data and verify user exists
    if (context.isAuthenticated && user.isAuthenticated) {
      signerUserId = user.id;
      // If logged in, prefer user email over form email for security
      signerUserEmail = user.email || customerEmail;
      signerUserName = user.name ?? customerName;
      
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
      // For guest bookings, use form data
      signerUserName = customerName || null;
      console.log("Guest booking with data:", {
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
    const phone = customerPhone;

    let discountAmount = 0;
    const appliedPromoCodeNormalized = promoCode?.trim().toUpperCase();
    const referralProvidedNormalized = referredBy?.trim();
    let isFirstTimeClient = false; // To track if the client is genuinely new
    let isFirstTimeDiscountApplied = false;
    let isReferralDiscountApplied = false;

    // Check if client is new for FIRST25 discount eligibility
    try {
      const existingGhlContact = await ghl.getContactByEmail(signerUserEmail);
      // getContactByEmail returns the contact object directly, or null if not found or if the API call was successful but no matching contact.
      if (!existingGhlContact) { // If null, it means no contact was found with that email for the location
        isFirstTimeClient = true;
      }
    } catch (ghlError) {
      console.warn(`GHL: Could not verify if ${signerUserEmail} is a new client:`, ghlError);
      // Proceed cautiously, maybe don't apply first-time discount if check fails.
// Current behavior: isFirstTimeClient remains false, so discount won't apply if this check fails.
    }

    if (isFirstTimeClient) {
      if (appliedPromoCodeNormalized === "FIRST25") {
        discountAmount = 25;
        isFirstTimeDiscountApplied = true;
      } else if (referralProvidedNormalized && referralProvidedNormalized.length > 0) {
        discountAmount = 25;
        isReferralDiscountApplied = true;
      }
    }

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId, isActive: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Selected service is not available or not found' }, { status: 404 });
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
    
    // For guest bookings, we'll only store email/contact info in GHL, not linked to a user
    let newBooking: any = await prisma.booking.create({
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
    
    // For guest bookings, add client info to the response
    if (!signerUserId) {
      newBooking.guestBooking = true;
      newBooking.guestEmail = signerUserEmail;
      console.log("!!!!!!!!!! BOOKING CREATED SUCCESSFULLY !!!!!!!!!!", JSON.stringify(newBooking, null, 2));
    }

    let checkoutUrl: string | null = null;

    if (initialStatus === BookingStatus.PAYMENT_PENDING && stripe && finalAmountDueAfterDiscount > 0) {
      try {
        const amountToChargeInCents = Math.round(finalAmountDueAfterDiscount * 100);
        // Ensure NEXTAUTH_URL is set in your .env for correct redirect URLs
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const success_url = `${baseUrl}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`;
        const cancel_url = `${baseUrl}/booking-payment-canceled`;

        const stripeSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Booking for ${service.name}`,
                description: `Service: ${service.name} on ${newBooking.scheduledDateTime ? new Date(newBooking.scheduledDateTime).toLocaleDateString() : 'Date TBD'}`,
                // images: [service.imageUrl || 'your_default_service_image_url'], // Optional: Add a service image URL
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
          },
          // Conditionally add customer_email if signerUserEmail is available
          ...(signerUserEmail && { customer_email: signerUserEmail }),
        });
        checkoutUrl = stripeSession.url;
        console.log("!!!!!!!!!! STRIPE CHECKOUT SESSION CREATED !!!!!!!!!! URL:", checkoutUrl);

        // Update booking with Stripe payment URL
        await prisma.booking.update({
          where: { id: newBooking.id },
          data: { stripePaymentUrl: checkoutUrl }
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Continue with booking creation even if Stripe fails
        checkoutUrl = null;
      }
    }

    // GHL Contact Management and Workflow Integration
    try {
      if (signerUserEmail) {
        // Prepare customer data for GHL
        const customerData = {
          firstName: signerUserName?.split(' ')[0] || '',
          lastName: signerUserName?.split(' ').slice(1).join(' ') || '',
          fullName: signerUserName || signerUserEmail,
        };

        // Create or update GHL contact
        const ghlContact = await createGHLIntegration(
          newBooking,
          customerData,
          service,
          {
            basePrice: Number(service.basePrice),
            promoDiscount: discountAmount,
            finalPrice: finalAmountDueAfterDiscount,
            depositAmount: service.requiresDeposit ? Number(service.depositAmount) : 0,
          },
          checkoutUrl
        );

        const contactId = ghlContact?.id || ghlContact?.contact?.id;
        if (contactId) {
          // Update booking with GHL contact ID
          await prisma.booking.update({
            where: { id: newBooking.id },
            data: { ghlContactId: contactId }
          });

          // Apply tags based on booking status and service type
          const tagsToApply = [
            'Status:New_Booking',
            `Service:${service.serviceType}`,
            `Booking:${initialStatus}`,
          ];

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

          // Add tags and trigger workflows
          try {
            await ghl.addTagsToContact(contactId, tagsToApply);
            console.log(`GHL: Contact ${contactId} upserted and tags applied: ${tagsToApply.join(', ')}`);
            
            // Trigger specific workflows based on booking status
            await triggerGHLWorkflows(contactId, newBooking.status, service?.name);
            
          } catch (tagError) {
            console.error('GHL: Error adding tags to contact:', tagError);
            // Don't throw here, continue with booking creation
          }
        } else {
          console.warn('GHL: Contact upsertion did not return a valid contact ID. Response:', ghlContact);
        }
      } else {
        console.warn('GHL: Signer email is missing, skipping GHL contact creation.');
      }
    } catch (ghlOverallError) {
      console.error("Error in overall GHL integration block:", ghlOverallError);
      // Log the error but continue with booking creation
    }

      // Return the created booking and checkoutUrl (which may be null if payment not needed or Stripe failed)
      const newBookingWithRelations = newBooking as BookingWithRelations;
      // Add guestName to the response if it was a guest booking for easier frontend display
      if (!signerUserId && signerUserName) {
        (newBookingWithRelations as any).guestName = signerUserName;
      }
      
      console.log("!!!!!!!!!! FINAL API RESPONSE CHECKOUT URL:", checkoutUrl);
      console.log("!!!!!!!!!! FINAL API RESPONSE BOOKING ID:", newBookingWithRelations.id);
      
      return NextResponse.json({ booking: newBookingWithRelations, checkoutUrl }, { status: 201 });
  }
  catch (errorUnknown) {
    let errorMessage = 'An unexpected error occurred while creating the booking.';
    let statusCode = 500;

    if (errorUnknown instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Database error: ${errorUnknown.message}`;
      statusCode = 409; 
      console.error('Prisma Error creating booking:', errorUnknown.code, errorUnknown.message);
    } else if (errorUnknown instanceof SyntaxError) {
      errorMessage = 'Invalid request body: Malformed JSON.';
      statusCode = 400;
      console.error('SyntaxError creating booking:', errorUnknown.message);
    } else if (errorUnknown instanceof Error) {
      errorMessage = `Failed to create booking: ${errorUnknown.message}`;
      console.error('Error creating booking:', errorUnknown.message, errorUnknown.stack);
    } else if (typeof errorUnknown === 'string') {
      errorMessage = `Failed to create booking: ${errorUnknown}`;
      console.error('Error creating booking (string):', errorUnknown);
    } else {
      console.error('Unknown error creating booking:', errorUnknown);
    }

    console.log(`[API /api/bookings ERROR] Status: ${statusCode}, Message: ${errorMessage}`);
    return NextResponse.json(
      { error: errorMessage },
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
          bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.Service.durationMinutes);
    
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
  Service: any, 
  promoCodeStr?: string
): Promise<BookingPricing> {
  let price = Number(Service.basePrice);
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
          promoCode.applicableServices.includes(Service.id)
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
  const depositAmount = Service.requiresDeposit ? Number(Service.depositAmount) : 0;
  
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
