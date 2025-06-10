import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BookingStatus, LocationType, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
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
}

// --- Stripe and GHL Integration Imports ---
import Stripe from 'stripe';
import * as ghl from '@/lib/ghl'; // Import GHL helper utility
import { convertCustomFieldsArrayToObject } from '@/lib/ghl'; // Import the new utility function
import type { GhlContact, GhlCustomField } from '@/lib/ghl'; // Import GHL types

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-04-30.basil' as const }) : null;

export async function POST(request: Request) {
  const ghlLocationId = process.env.GHL_LOCATION_ID;
  if (!ghlLocationId) {
    console.error('GHL_LOCATION_ID environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error: GHL Location ID is missing.' }, { status: 500 });
  }

  console.log("!!!!!!!!!! /api/bookings POST handler WAS HIT !!!!!!!!!!");
  try {
    // Attempt to clone the request to log its body, as request.json() consumes the body
    const clonedRequest = request.clone();
    const requestBodyForLog = await clonedRequest.json().catch(() => ({ error: 'Could not parse body for logging' }));
    console.log("!!!!!!!!!! /api/bookings REQUEST BODY (raw):", JSON.stringify(requestBodyForLog, null, 2));
  } catch (logError) {
    console.error("!!!!!!!!!! Error logging request body:", logError);
  }

  // Get session if available, but don't require it (allow guest bookings)
  const session = await getServerSession(authOptions);

  // Log session details for debugging
  console.log("SESSION DETAILS:", JSON.stringify(session, null, 2));
  
  let signerUserId: string | null = null;
  let signerUserEmail: string;
  let signerUserName: string | null = null;
  
  try {
    const body = await request.json() as BookingRequestBody;
    // Extract email from request body - required for all bookings
    signerUserEmail = body.email;
    
    if (!signerUserEmail) {
      return NextResponse.json({ error: 'Email is required for booking' }, { status: 400 });
    }

    // If authenticated, use session data and verify user exists
    if (session?.user?.id) {
      signerUserId = session.user.id;
      // If logged in, prefer session email over form email for security
      signerUserEmail = session.user.email || body.email;
      signerUserName = session.user.name ?? null;
      
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
      signerUserName = `${body.firstName || ''} ${body.lastName || ''}`.trim() || null;
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
      phone,
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
        service: true;
        User_Booking_signerIdToUser: { select: { id: true; name: true; email: true } };
      };
    }>;
    
    // Map the incoming string locationType to the Prisma enum
    let mappedLocationType: LocationType;
    switch (locationType) {
      case "CLIENT_SPECIFIED_ADDRESS":
        mappedLocationType = LocationType.CLIENT_SPECIFIED_ADDRESS;
        break;
      case "OUR_OFFICE":
        mappedLocationType = LocationType.OUR_OFFICE;
        break;
      case "REMOTE_ONLINE_NOTARIZATION":
        mappedLocationType = LocationType.REMOTE_ONLINE_NOTARIZATION;
        break;
      case "PUBLIC_PLACE":
        mappedLocationType = LocationType.PUBLIC_PLACE;
        break;
      default:
        console.error(`Invalid locationType received: ${locationType}`);
        return NextResponse.json({ error: `Invalid location type provided: ${locationType}. Valid types are CLIENT_SPECIFIED_ADDRESS, OUR_OFFICE, REMOTE_ONLINE_NOTARIZATION, PUBLIC_PLACE.` }, { status: 400 });
    }

    // Prepare booking data, handling both authenticated and guest bookings
    const bookingData: any = {
      service: {
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
      priceAtBooking: priceAtBooking,
      notes: notes,
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
        service: true,
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
      } catch (stripeError: any) {
        console.error("!!!!!!!!!! Error creating Stripe session:", stripeError);
        // Log the error but proceed; the booking remains PAYMENT_PENDING.
        // The client will not receive a checkoutUrl and thus cannot pay immediately via this flow.
      } // End catch (stripeError: any)
    } // End if (initialStatus === BookingStatus.PAYMENT_PENDING ...)

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
        } else if (body.locationType === 'REMOTE_ONLINE_NOTARIZATION') {
          serviceAddressForGhl = 'Remote Online Notarization';
        } else {
          // Fallback for any other location types or if body.locationType is undefined
          serviceAddressForGhl = ''; // Or a more descriptive placeholder like 'Location N/A'
        }

        // Using tags-only approach for optimal business operations
        console.log("GHL: Using tags-only approach for streamlined automation");

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
          customField: {}, // Using tags-only approach - no custom fields needed
        };

        console.log("GHL Contact Payload (excluding tags):", JSON.stringify(ghlContactPayload, null, 2));

        try {
          console.log("Attempting to upsert GHL contact with location ID:", ghlLocationId);
          const ghlContact = await ghl.upsertContact(ghlContactPayload);
          console.log("GHL contact successfully upserted:", JSON.stringify(ghlContact, null, 2));
          
          // Fix: Check if ghlContact has an id property, handle different response formats
          const contactId = ghlContact?.id || ghlContact?.contact?.id;
          
          if (contactId) {
            const tagsToApply: string[] = [];
            if (service?.name) {
              tagsToApply.push(`service:${service.name.replace(/\s+/g, '_').toLowerCase()}`);
            }
            if (newBooking.status === BookingStatus.PAYMENT_PENDING) {
              tagsToApply.push('status:booking_pendingpayment');
            } else if (newBooking.status === BookingStatus.CONFIRMED) {
              tagsToApply.push('status:booking_confirmed');
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

            // Only add tags if we have tags to add and a valid contact ID
            if (tagsToApply.length > 0) {
              try {
                await ghl.addTagsToContact(contactId, tagsToApply);
                console.log(`GHL: Contact ${contactId} upserted and tags applied: ${tagsToApply.join(', ')}`);
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
        }
      } else {
        console.warn('GHL: Signer email is missing, skipping GHL contact creation.');
      }
    } catch (ghlOverallError) {
      console.error("Error in overall GHL integration block:", ghlOverallError);
      // Optionally, add more specific error handling or re-throwing if needed
      // For now, logging the error and continuing is consistent with previous intent.
    }

    // ... (rest of the code remains the same)
      // Return the created booking and checkoutUrl (which may be null if payment not needed or Stripe failed)
      const newBookingWithRelations = newBooking as BookingWithRelations;
      // Add guestName to the response if it was a guest booking for easier frontend display
      if (!signerUserId && signerUserName) {
        (newBookingWithRelations as any).guestName = signerUserName;
      }
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
} // End of POST function
