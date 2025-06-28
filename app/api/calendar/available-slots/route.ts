import { NextResponse } from "next/server"
import { parseISO, getUnixTime } from 'date-fns'; // Import date-fns functions

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_API_VERSION = process.env.GHL_API_VERSION || "V2"

// Calendar IDs for different service types
const CALENDAR_IDS: Record<string, string | undefined> = {
  essential: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
  priority: process.env.GHL_EXTENDED_HOURS_CALENDAR_ID,
  "loan-signing-specialist": process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID,
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
  startDateISO: string, // Renamed for clarity
  endDateISO: string,   // Renamed for clarity
  timezone: string // Keep timezone for potential logging/debugging if needed, but don't send to GHL
) {
  try {
    // Convert ISO strings to Unix timestamps (milliseconds)
    const startDateTimestampMs = getUnixTime(parseISO(startDateISO)) * 1000;
    const endDateTimestampMs = getUnixTime(parseISO(endDateISO)) * 1000;

    // Updated endpoint based on GHL API documentation
    const url = `${GHL_API_BASE_URL}/calendars/${calendarId}/free-slots`

    // Corrected query parameters for the /free-slots endpoint (using milliseconds)
    const queryParams = new URLSearchParams({
      startDate: startDateTimestampMs.toString(),
      endDate: endDateTimestampMs.toString(),
      // Removed duration and timezone as they are not accepted/needed by this endpoint
    })

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // Read the response body as text first in case it's not JSON
      const errorText = await response.text();
      console.error(`GHL API Error Response Status: ${response.status}`)
      console.error(`GHL API Error Response Headers:`, Object.fromEntries(response.headers.entries()))
      console.error(`GHL API Error Response Body: ${errorText}`);
      // Try to parse as JSON for more structured logging if possible, but don't fail if it's not JSON
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // Ignore parsing error if the body wasn't JSON
      }
      throw new Error(`Failed to fetch available slots from GHL. Status: ${response.status}, Body: ${errorText}`);
    }

    // If response is ok, parse as JSON
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
    // Read calendarId directly, remove serviceType logic
    const calendarId = searchParams.get("calendarId") 
    const startDate = searchParams.get("startDate") 
    const endDate = searchParams.get("endDate")
    // Duration is fetched but no longer passed to fetchAvailableSlots (GHL endpoint doesn't use it)
    const duration = Number.parseInt(searchParams.get("duration") || "60", 10) // Keep for potential future use or logging
    const timezone = searchParams.get("timezone") || "America/Chicago"

    // Validate required parameters - now including calendarId
    if (!calendarId || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters: calendarId, startDate, endDate",
        },
        { status: 400 },
      )
    }

    // Remove the logic that gets calendarId from serviceType
    /* 
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
    */

    // Fetch available slots from GHL API - pass validated calendarId and original date strings
    const availableSlots = await fetchAvailableSlots(calendarId, startDate, endDate, timezone)

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
