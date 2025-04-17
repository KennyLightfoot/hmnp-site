import { NextResponse } from "next/server"

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_API_VERSION = process.env.GHL_API_VERSION || "V2"

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

// Helper function to fetch available slots from GHL API
async function fetchAvailableSlots(
  calendarId: string,
  startDate: string,
  endDate: string,
  duration: number,
  timezone: string,
) {
  try {
    // The correct endpoint might be different - check GHL API documentation
    const url = `${GHL_API_BASE_URL}/v2/calendars/${calendarId}/available-slots`
    // Or it might be:
    // const url = `${GHL_API_BASE_URL}/calendars/available-slots/${calendarId}`

    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      duration: duration.toString(),
      timezone,
    })

    console.log(`Attempting to fetch from: ${url}?${queryParams.toString()}`)

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`API Response Status: ${response.status}`)
      console.error(`API Response Headers:`, Object.fromEntries(response.headers.entries()))
      throw new Error(`Failed to fetch available slots: ${JSON.stringify(errorData)}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching available slots:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get("serviceType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const duration = Number.parseInt(searchParams.get("duration") || "60", 10)
    const timezone = searchParams.get("timezone") || "America/Chicago"

    // Validate required parameters
    if (!serviceType || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters: serviceType, startDate, endDate",
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

    // For testing, return mock data if we're in development
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock data for development")
      return NextResponse.json({
        success: true,
        data: {
          slots: generateMockTimeSlots(startDate, duration),
        },
      })
    }

    // Fetch available slots from GHL API
    const availableSlots = await fetchAvailableSlots(calendarId, startDate, endDate, duration, timezone)

    // Return success response with available slots
    return NextResponse.json({
      success: true,
      data: availableSlots,
    })
  } catch (error) {
    console.error("Available slots error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Helper function to generate mock time slots for testing
function generateMockTimeSlots(startDate: string, duration: number) {
  const date = new Date(startDate)
  const slots = []

  // Generate slots from 9 AM to 5 PM with the specified duration
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = new Date(date)
      startTime.setHours(hour, minute, 0, 0)

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + duration)

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
    }
  }

  return slots
}
