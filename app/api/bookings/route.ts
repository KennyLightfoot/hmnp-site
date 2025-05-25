import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BookingStatus, LocationType, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';

interface BookingRequestBody {
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
  
  // New fields from plan
  booking_number_of_signers?: number;
  consent_terms_conditions?: boolean;
  // Optional: phone?: string if we want to collect it on the form for GHL standard field
}

// --- Stripe and GHL Integration Imports ---
import Stripe from 'stripe';
import * as ghl from '../../../lib/ghl'; // Import GHL helper utility
import type { GhlContact, GhlCustomField } from '../../../lib/ghl'; // Import GHL types

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-04-30.basil' as const }) : null;

export async function POST(request: Request) {
  console.log("!!!!!!!!!! /api/bookings POST handler WAS HIT !!!!!!!!!!");
  try {
    // Attempt to clone the request to log its body, as request.json() consumes the body
    const clonedRequest = request.clone();
    const requestBodyForLog = await clonedRequest.json().catch(() => ({ error: 'Could not parse body for logging' }));
    console.log("!!!!!!!!!! /api/bookings REQUEST BODY (raw):", JSON.stringify(requestBodyForLog, null, 2));
  } catch (logError) {
    console.error("!!!!!!!!!! Error logging request body:", logError);
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized or user email missing' }, { status: 401 });
  }

  const signerUserId = session.user.id;
  const signerUserEmail = session.user.email;
  const signerUserName = session.user.name;

  try {
    const body = await request.json() as BookingRequestBody;
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
      booking_number_of_signers,
      consent_terms_conditions,
    } = body;

    let discountAmount = 0;
    const appliedPromoCodeNormalized = promoCode?.trim().toUpperCase();
    const referralProvidedNormalized = referredBy?.trim();
    let isFirstTimeClient = false; // To track if the client is genuinely new
    let isFirstTimeDiscountApplied = false;
    let isReferralDiscountApplied = false;

    // Check if client is new for FIRST25 discount eligibility
    try {
      const existingGhlContact = await ghl.getContactByEmail(signerUserEmail);
      // Assuming getContactByEmail returns null or an object with a 'contacts' array or similar indicator
      if (!existingGhlContact || (Array.isArray(existingGhlContact.contacts) && existingGhlContact.contacts.length === 0)) {
        isFirstTimeClient = true;
      }
    } catch (ghlError) {
      console.warn(`GHL: Could not verify if ${signerUserEmail} is a new client:`, ghlError);
      // Proceed cautiously, maybe don't apply first-time discount if check fails
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

    let initialStatus: BookingStatus = BookingStatus.REQUESTED;
    let paymentIntentIdForResponse: string | null = null;
    let paymentClientSecretForResponse: string | null = null;
    
    const originalDepositAmount = (service.requiresDeposit && service.depositAmount && service.depositAmount.toNumber() > 0) 
                               ? service.depositAmount.toNumber() 
                               : 0;
    
    const chargeableDepositAmount = Math.max(0, originalDepositAmount - discountAmount);
    
    if (originalDepositAmount > 0) {
      initialStatus = BookingStatus.PAYMENT_PENDING; 
    }

    const priceAtBooking = service.basePrice;

    type BookingWithRelations = Prisma.BookingGetPayload<{
      include: {
        service: true;
        User_Booking_signerIdToUser: { select: { id: true; name: true; email: true } };
      };
    }>;
    
    let newBooking: BookingWithRelations = await prisma.booking.create({
      data: {
        signerId: signerUserId,
        serviceId: service.id,
        scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime) : null,
        status: initialStatus,
        locationType: locationType,
        addressStreet: addressStreet,
        addressCity: addressCity,
        addressState: addressState,
        addressZip: addressZip,
        locationNotes: locationNotes,
        priceAtBooking: priceAtBooking,
        notes: notes,
      },
      include: {
        service: true, 
        User_Booking_signerIdToUser: { select: { id: true, name: true, email: true } },
      }
    });

    if (originalDepositAmount > 0 && chargeableDepositAmount > 0 && stripe && service.depositAmount) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(chargeableDepositAmount * 100),
          currency: 'usd',
          metadata: {
            bookingId: newBooking.id,
            signerUserId: signerUserId,
            serviceId: service.id,
          },
          receipt_email: newBooking.User_Booking_signerIdToUser.email || undefined,
          description: `Deposit for booking #${newBooking.id} (${service.name})`,
        });
        
        paymentIntentIdForResponse = paymentIntent.id;
        paymentClientSecretForResponse = paymentIntent.client_secret || null;

        const charge = paymentIntent.latest_charge;
        const chargeId = typeof charge === 'string' ? charge : (charge && typeof charge.id === 'string' ? charge.id : null);
        
        const depositAmountForPayment = service.depositAmount!;

        const paymentData: Prisma.PaymentCreateInput = {
          Booking: { connect: { id: newBooking.id } },
          amount: depositAmountForPayment,
          status: PaymentStatus.PENDING,
          provider: PaymentProvider.STRIPE,
          paymentIntentId: paymentIntent.id,
          transactionId: chargeId,
        };

        await prisma.payment.create({ data: paymentData });

      } catch (err) {
        console.error('Stripe PaymentIntent or Payment record creation failed:', err);
        return NextResponse.json({ error: 'Failed to initiate deposit payment or record payment.' }, { status: 500 });
      }
    }

    // --- GHL API Integration: Upsert Contact & Apply Tags/Fields ---
    try {
      if (newBooking.User_Booking_signerIdToUser.email) {
        // Fetch all GHL custom fields to map keys to IDs
        const ghlLocationCustomFields = await ghl.getLocationCustomFields();
        const ghlCustomFieldMap = new Map<string, string>();
        ghlLocationCustomFields.forEach(field => {
          if (field.key) ghlCustomFieldMap.set(field.key, field.id);
        });

        let firstName = 'Client';
        let lastName = '';
        if (newBooking.User_Booking_signerIdToUser.name) {
          const nameParts = newBooking.User_Booking_signerIdToUser.name.trim().split(' ');
          firstName = nameParts[0];
          if (nameParts.length > 1) {
            lastName = nameParts.slice(1).join(' ');
          }
        }

        const serviceAddressForGhl = [addressStreet, addressCity, addressState, addressZip].filter(Boolean).join(', ');

        const customFieldsPayload: GhlCustomField[] = [];
        const fieldMappings: { [key: string]: string | number | boolean | undefined } = {
          'cf_booking_service_type': service.name,
          'cf_booking_appointment_datetime': scheduledDateTime || newBooking.scheduledDateTime?.toISOString() || '',
          'cf_booking_service_address': serviceAddressForGhl,
          'cf_booking_special_instructions': notes || '',
          'cf_consent_terms_conditions': consent_terms_conditions || false,
          'cf_lead_source_detail': "HMNP Website - Service Booking",
          'cf_promo_code_used': promoCode || '',
          'cf_referred_by_name_or_email': referredBy || '',
          'cf_booking_number_of_signers': booking_number_of_signers || 1,
          'cf_booking_discount_applied': discountAmount > 0,
        };

        for (const [key, value] of Object.entries(fieldMappings)) {
          if (value === undefined || value === '') continue; // Don't send empty or undefined values unless intended
          const fieldId = ghlCustomFieldMap.get(key);
          if (fieldId) {
            customFieldsPayload.push({ id: fieldId, value });
          } else {
            console.warn(`GHL Custom Field ID for key '${key}' not found. Skipping.`);
          }
        }

        const contactPayload: GhlContact = {
          firstName,
          lastName,
          email: newBooking.User_Booking_signerIdToUser.email,
          phone: undefined, // Add body.phone here if collected
          address1: addressStreet,
          city: addressCity,
          state: addressState,
          postalCode: addressZip,
          country: 'US', // Assuming US, or make dynamic if needed
          source: "HMNP Website - Service Booking",
          customFields: customFieldsPayload,
        };

        const ghlContact = await ghl.upsertContact(contactPayload);

        if (ghlContact && ghlContact.id) {
          const tagsToApply: string[] = ['Source:Website_Service_Booking_Form'];
          const serviceTagName = `Service:${service.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
          tagsToApply.push(serviceTagName);

          if (newBooking.status === BookingStatus.PAYMENT_PENDING) {
            tagsToApply.push('Status:Payment_Pending');
          } else if (newBooking.status === BookingStatus.REQUESTED) {
            tagsToApply.push('Status:Booking_Requested');
          } else if (newBooking.status === BookingStatus.CONFIRMED) {
            tagsToApply.push('Status:Booking_Confirmed');
          }

          if (isFirstTimeDiscountApplied) {
            tagsToApply.push('Discount:FirstTime_Applied');
          }
          if (isReferralDiscountApplied) {
            tagsToApply.push('Discount:Referral_NewClient_Applied');
            tagsToApply.push('Status:Referred_Client');
          }
          
          await ghl.addTagsToContact(ghlContact.id, tagsToApply);
          console.log(`GHL: Contact ${ghlContact.id} upserted and tags applied: ${tagsToApply.join(', ')}`);
        } else {
          console.warn('GHL: Contact upsertion did not return a contact ID or failed. Tags not applied.');
        }
      } else {
        console.warn('GHL: Signer email is missing, skipping GHL contact creation.');
      }
    } catch (errUnknown) {
      let errorMessage = 'GHL API contact/tag sync failed with an unknown error.';
      if (errUnknown instanceof Error) {
        errorMessage = `GHL API contact/tag sync failed: ${errUnknown.message}`;
      } else if (typeof errUnknown === 'string') {
        errorMessage = `GHL API contact/tag sync failed: ${errUnknown}`;
      } else if (errUnknown && typeof errUnknown === 'object' && 'message' in errUnknown) {
        errorMessage = `GHL API contact/tag sync failed: ${String((errUnknown as { message: unknown }).message)}`;
      }
      console.error(errorMessage, errUnknown);
      // Do not return error to client for GHL sync failure, consider it a background task failure
    }

    return NextResponse.json({
      booking: newBooking,
      payment: originalDepositAmount > 0 && paymentIntentIdForResponse && service.depositAmount ? { 
        paymentIntentId: paymentIntentIdForResponse,
        clientSecret: paymentClientSecretForResponse,
        amount: new Prisma.Decimal(chargeableDepositAmount),
        currency: 'usd',
      } : null,
    }, { status: 201 });

  } catch (errorUnknown) {
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

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
