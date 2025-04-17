import { NextResponse } from "next/server"

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_API_VERSION = process.env.GHL_API_VERSION || "V2"
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

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
  const response = await fetch(`${GHL_API_BASE_URL}/contacts`, {
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
    const errorData = await response.json()
    throw new Error(`Failed to create contact: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// Helper function to create an appointment in GHL
async function createAppointment(appointmentData: any) {
  try {
    // The correct endpoint might be different - check GHL API documentation
    const url = `${GHL_API_BASE_URL}/v2/appointments`
    // Or it might be:
    // const url = `${GHL_API_BASE_URL}/appointments/create`

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

    // Create or update contact in GHL
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

    const contactResponse = await createContact(contactData)
    const contactId = contactResponse.id

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
Number of Signers: ${numberOfSigners}
Signing Location: ${signingLocation}
Special Instructions: ${specialInstructions || "None"}
SMS Notifications: ${smsNotifications ? "Yes" : "No"}
Email Updates: ${emailUpdates ? "Yes" : "No"}
      `,
      locationId: GHL_LOCATION_ID,
    }

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
