import { NextResponse } from "next/server"

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_API_VERSION = process.env.GHL_API_VERSION || "V2"
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

// Helper function to search for a contact by email in GHL
async function findContactByEmail(email: string) {
  const query = new URLSearchParams({
    locationId: GHL_LOCATION_ID!,
    query: email,
  }).toString()

  const response = await fetch(`${GHL_API_BASE_URL}/contacts/lookup?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: GHL_API_VERSION, // Use the version from env
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    // Treat 404 or the specific 400 error as 'contact not found'
    if (
      response.status === 404 ||
      (response.status === 400 && errorData.error === "Contact with id lookup not found")
    ) {
      return null // No contact found
    }
    console.error(`Failed to search for contact by email (${email}): ${JSON.stringify(errorData)}`, { status: response.status })
    throw new Error(`Failed to search contact: Status ${response.status}`)
  }

  const data = await response.json()
  if (data.contacts && data.contacts.length > 0) {
    // It's possible the lookup returns multiple contacts, ensure we grab the right one or handle this case
    // For now, assume the first one is correct as per original logic
    return data.contacts[0]
  }

  return null // No contact found in the successful response data either
}

// Calendar IDs for different service types
const CALENDAR_IDS: Record<string, string | undefined> = {
  essential: process.env.GHL_ESSENTIAL_CALENDAR_ID,
  priority: process.env.GHL_PRIORITY_CALENDAR_ID,
  "loan-signing": process.env.GHL_LOAN_CALENDAR_ID,
  "reverse-mortgage": process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID,
  specialty: process.env.GHL_SPECIALTY_CALENDAR_ID,
  calls: process.env.GHL_CALLS_CALENDAR_ID,
  booking: process.env.GHL_BOOKING_CALENDAR_ID,
}

// Helper function to get calendar ID based on service type
function getCalendarId(serviceType: string): string | undefined {
  return CALENDAR_IDS[serviceType]
}

// Helper function to create a contact in GHL
async function createContact(contactData: any) {
  const response = await fetch(`${GHL_API_BASE_URL}/contacts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
      Version: GHL_API_VERSION,
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      ...contactData,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to parse error JSON" }))

    // Check for the specific duplicate contact error
    if (
      response.status === 400 &&
      errorData.message === "This location does not allow duplicated contacts." &&
      errorData.meta?.contactId
    ) {
      console.log(`Attempted to create duplicate contact for ${contactData.email}. Using existing contact ID: ${errorData.meta.contactId}`)
      // Return the existing contact ID as if creation was successful
      return { id: errorData.meta.contactId }
    }

    // If it's a different error, log and throw
    console.error("GHL Create Contact Error:", errorData)
    throw new Error(`Failed to create contact: ${JSON.stringify(errorData)}`)
  }

  // If response is OK, parse and return the created contact data
  return response.json()
}

// Helper function to create an appointment in GHL
async function createAppointment(appointmentData: any) {
  try {
    // Updated endpoint based on common GHL API structure (verify with specific version docs)
    const url = `${GHL_API_BASE_URL}/calendars/events/appointments`

    console.log(`Attempting to create appointment at: ${url}`)
    console.log(`Appointment data:`, JSON.stringify(appointmentData, null, 2))

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
      },
      body: JSON.stringify(appointmentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`API Response Status: ${response.status}`)
      console.error(`API Response Headers:`, Object.fromEntries(response.headers.entries()))
      throw new Error(`Failed to create appointment: ${JSON.stringify(errorData)}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error creating appointment:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract data from the request
    const {
      serviceType,
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
    } = data

    // Validate required parameters
    if (!serviceType || !startTime || !endTime || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters",
        },
        { status: 400 },
      )
    }

    // Get calendar ID based on service type
    const calendarId = getCalendarId(serviceType)
    if (!calendarId) {
      return NextResponse.json(
        {
          success: false,
          message: `No calendar found for service type: ${serviceType}`,
        },
        { status: 400 },
      )
    }

    console.log(`Using calendar ID: ${calendarId} for service type: ${serviceType}`)
    console.log(`API Base URL: ${GHL_API_BASE_URL}`)
    console.log(`API Version: ${GHL_API_VERSION}`)

    /* TEMP: Comment out mock data for local GHL API testing
    // For testing in development, return mock data
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock appointment data for development")
      return NextResponse.json({
        success: true,
        message: "Appointment created successfully (mock)",
        data: {
          appointmentId: `mock-${Date.now()}`,
          contactId: `mock-contact-${Date.now()}`,
          bookingReference: `MOCK${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        },
      })
    }
    */

    let contactId: string
    let contactResponse: any

    // 1. Check if contact already exists by email
    const existingContact = await findContactByEmail(email)

    if (existingContact) {
      console.log(`Existing contact found for ${email} in calendar appointment route: ${existingContact.id}`)
      contactId = existingContact.id
      // Optional: Update existing contact details if needed
    } else {
      // 2. Create contact in GHL if it doesn't exist
      console.log(`No existing contact found for ${email} in calendar appointment route. Creating new contact.`)
      const contactData = {
        firstName,
        lastName,
        email,
        phone,
        address1: address,
        city,
        state,
        postalCode,
        source: "Website Booking", // Or perhaps "Calendar Booking"?
      }
      contactResponse = await createContact(contactData)
      contactId = contactResponse.id
      console.log(`New contact created for ${email} in calendar appointment route: ${contactId}`)
    }

    // Calculate appointment duration based on service type and number of signers
    let durationMinutes = 30 // Default duration
    if (serviceType === "loan-signing" || serviceType === "reverse-mortgage") {
      durationMinutes = 90 // Loan signings take longer
    } else if (numberOfSigners > 2) {
      durationMinutes = 45 // More signers need more time
    }

    // Create appointment in GHL
    const appointmentData = {
      calendarId,
      contactId,
      startTime,
      endTime,
      title: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Notary Service`,
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
      locationId: GHL_LOCATION_ID,
      // Consider if GHL has dedicated address fields for appointments
      // address: address, 
      // city: city,
      // state: state,
      // postalCode: postalCode,
    }

    console.log("Sending Appointment Data to GHL:", JSON.stringify(appointmentData, null, 2))

    const appointmentResponse = await createAppointment(appointmentData)

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
      { status: 500 },
    )
  }
}
