import { NextResponse } from "next/server"
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

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract contact and opportunity data from the form submission
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
