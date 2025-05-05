import { NextResponse } from "next/server"
import {
  findContactByEmail,
  createContact,
  createAppointment,
} from "@/lib/ghl/api" // Import shared functions

// Remove GHL API configuration constants (now handled in lib/ghl/api.ts)
// const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
// const GHL_API_KEY = process.env.GHL_API_KEY
// const GHL_API_VERSION = process.env.GHL_API_VERSION || "V2"
// const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

// Remove duplicated helper functions (findContactByEmail, createContact, createAppointment)
// ... (code for helper functions removed) ...

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract data from the request, including calendarId
    const {
      calendarId, // Expect calendarId directly
      startTime,
      endTime,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      numberOfSigners,
      signingLocation,
      specialInstructions,
      smsNotifications,
      emailUpdates,
      serviceType, // Keep serviceType for title/notes logic
      locationId, // Allow explicit locationId to be passed
    } = data

    // Validate required parameters, including calendarId
    if (
      !calendarId ||
      !startTime ||
      !endTime ||
      !firstName ||
      !lastName ||
      !email ||
      !phone
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters (calendarId, startTime, endTime, name, email, phone)",
        },
        { status: 400 }
      )
    }

    // Extract the locationId from environment variables based on calendarId if not provided
    // This assumes calendarId might match one of our defined calendar IDs
    let locationIdToUse = locationId || process.env.GHL_LOCATION_ID;
    
    // Get calendar mappings from environment for troubleshooting
    console.log("Calendar API: Using calendarId:", calendarId);
    console.log("Calendar API: Using locationId:", locationIdToUse);

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
        source: "Website Calendar Booking", // Specific source
      }
      const contactResponse = await createContact(contactData, locationIdToUse)
      contactId = contactResponse.id
    }

    // Calculate appointment duration based on service type and number of signers
    let durationMinutes = 30 // Default duration
    if (calendarId === "loan-signing" || calendarId === "reverse-mortgage") {
      durationMinutes = 90 // Loan signings take longer
    } else if (serviceType === 'priority') {
        durationMinutes = 60;
    } else if (serviceType === 'essential' && numberOfSigners > 1) {
        // Maybe adjust essential duration based on signers? e.g., 45 for 2, 60 for 3+
        durationMinutes = numberOfSigners === 2 ? 45 : 60;
    }
    // Note: The GHL /appointments endpoint might not use duration directly, but rather rely on startTime and endTime.
    // Ensure endTime provided by the frontend accurately reflects the duration.

    // Create appointment in GHL using the provided calendarId and imported function
    const appointmentData = {
      calendarId, // Use the ID passed from the frontend
      contactId,
      startTime,
      endTime,
      title: serviceType ? `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Notary Service` : "Notary Service",
      notes: `
Service Details:
  Number of Signers: ${numberOfSigners}
  Signing Location Type: ${signingLocation}
  Special Instructions: ${specialInstructions || "None"}

Location Address:
  ${address}
  ${city}, ${state} ${postalCode}

Communication Preferences:
  SMS Notifications: ${smsNotifications ? "Yes" : "No"}
  Email Updates: ${emailUpdates ? "Yes" : "No"}
      `.trim(), // Use trim() to remove leading/trailing whitespace
      // Include locationId if we have it
      ...(locationIdToUse ? { locationId: locationIdToUse } : {}),
    }

    const appointmentResponse = await createAppointment(appointmentData, locationIdToUse)

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Appointment created successfully",
      data: {
        appointmentId: appointmentResponse.id,
        contactId,
        bookingReference: appointmentResponse.id.substring(0, 8).toUpperCase(),
      },
    })
  } catch (error) {
    console.error("Appointment creation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    )
  }
}
