import { NextResponse } from "next/server"
import { z } from 'zod'
import {
  findContactByEmail,
  createContact,
  createOpportunity,
  updateContactCustomFields,
  updateOpportunityCustomFields,
  getServiceValue,
} from "@/lib/ghl/api"

// Remove GHL API base URL and Key constants (now handled in lib/ghl/api.ts)
// const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
// const GHL_API_KEY = process.env.GHL_API_KEY
// const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

// Remove duplicated helper functions (findContactByEmail, createContact, createOpportunity, updateContactCustomFields, updateOpportunityCustomFields)
// ... (code for helper functions removed) ...

// Input validation schema for booking requests
const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  company: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
  addressLatitude: z.string().optional(),
  addressLongitude: z.string().optional(),
  serviceType: z.string().min(1, 'Service type is required'),
  numberOfSigners: z.number().min(1, 'At least one signer required').max(20, 'Maximum 20 signers allowed'),
  signingLocation: z.string().min(1, 'Signing location is required'),
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  specialInstructions: z.string().optional(),
  smsNotifications: z.boolean().default(false),
  emailUpdates: z.boolean().default(false),
  locationId: z.string().optional(), // Allow explicit locationId to be passed
});

export async function POST(request: Request) {
  try {
    const rawData = await request.json()

    // Validate input data
    const data = bookingSchema.parse(rawData);

    // Extract contact and opportunity data from the validated form submission
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      address,
      city,
      state,
      postalCode,
      addressLatitude,
      addressLongitude,
      serviceType,
      numberOfSigners,
      signingLocation,
      preferredDate,
      preferredTime,
      specialInstructions,
      smsNotifications,
      emailUpdates,
      locationId, // Allow explicit locationId to be passed
    } = data
    
    // Use the provided locationId or fall back to the environment variable
    const locationIdToUse = locationId || process.env.GHL_LOCATION_ID;
    
    console.log("Booking API: Using locationId:", locationIdToUse);

    let contactId: string

    // 1. Check if contact already exists by email using imported function
    const existingContact = await findContactByEmail(email, locationIdToUse)

    if (existingContact) {
      contactId = existingContact.id
      // Optional: Update existing contact details if needed
    } else {
      // 2. Create contact in GHL if it doesn't exist using imported function
      const contactData = {
        firstName,
        lastName,
        email,
        phone,
        address1: address,
        city,
        state,
        postalCode,
        source: "Website Booking",
      }
      const contactResponse = await createContact(contactData, locationIdToUse)
      contactId = contactResponse.id
    }

    // Create opportunity in GHL using imported function
    const opportunityData = {
      name: `${serviceType} - ${firstName} ${lastName}`,
      status: "open",
      source: "Website Booking",
      monetaryValue: getServiceValue(serviceType, numberOfSigners),
    }

    const opportunityResponse = await createOpportunity(contactId, opportunityData, locationIdToUse)
    const opportunityId = opportunityResponse.id

    // Update contact custom fields using imported function
    const contactCustomFields = {
      booking_timestamp: new Date().toISOString(),
      sms_notifications: smsNotifications ? "Yes" : "No",
      email_updates: emailUpdates ? "Yes" : "No",
      company: company || "",
      address_latitude: addressLatitude || "",
      address_longitude: addressLongitude || "",
    }

    await updateContactCustomFields(contactId, contactCustomFields)

    // Update opportunity custom fields using imported function
    const opportunityCustomFields = {
      service_type: serviceType,
      number_of_signers: numberOfSigners.toString(),
      signing_location: signingLocation,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      special_instructions: specialInstructions || "",
      booking_status: "Pending",
      service_status: "Scheduled",
    }

    await updateOpportunityCustomFields(opportunityId, opportunityCustomFields)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: {
        contactId,
        opportunityId,
        bookingReference: opportunityId.substring(0, 8).toUpperCase(),
      },
    })
  } catch (error) {
    console.error("Booking error:", error)
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Remove duplicated getServiceValue helper function
// ... (code for helper function removed) ...
