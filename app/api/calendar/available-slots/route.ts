import { NextResponse } from "next/server"
import { eachDayOfInterval, format, startOfDay, endOfDay, parseISO } from 'date-fns'

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

// Helper function to fetch available slots from GHL API for a SINGLE day
async function fetchAvailableSlotsForDay(
  calendarId: string,
  date: Date,
  duration: number,
  timezone: string,
) {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const startDate = dayStart.toISOString()
  const endDate = dayEnd.toISOString()

  try {
    // The correct endpoint might be different - check GHL API documentation
    const url = `${GHL_API_BASE_URL}/v2/calendars/${calendarId}/available-slots`

    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      duration: duration.toString(),
      timezone,
    })

    // console.log(`Attempting to fetch from: ${url}?${queryParams.toString()}`)

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Response Status: ${response.status}`)
      // console.error(`API Response Headers:`, Object.fromEntries(response.headers.entries()))
      console.error(`API Response Body: ${errorText}`)
      // Return null or an empty array to indicate failure for this day, don't throw
      // to allow the loop to continue for other days.
      // throw new Error(`Failed to fetch available slots for ${format(date, 'yyyy-MM-dd')}: ${errorText}`)
      return null // Indicate failure to fetch for this specific day
    }

    // Assuming the response structure is { slots: [...] } or similar
    return response.json()
  } catch (error) {
    console.error(`Error fetching available slots for ${format(date, 'yyyy-MM-dd')}:`, error)
    // throw error // Don't throw, let the loop continue
    return null // Indicate failure
  }
}

export async function GET(request: Request) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get("serviceType")
    const rangeStart = searchParams.get("startDate") // Represents the start of the range (e.g., month start)
    const rangeEnd = searchParams.get("endDate") // Represents the end of the range (e.g., month end)
    const duration = Number.parseInt(searchParams.get("duration") || "30", 10) // Default duration
    const timezone = searchParams.get("timezone") || "America/Chicago"

    // Validate required parameters
    if (!serviceType || !rangeStart || !rangeEnd) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters: serviceType, startDate (range start), endDate (range end)",
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

    console.log(`Checking availability for calendar ID: ${calendarId} (Service: ${serviceType})`)
    console.log(`Range: ${rangeStart} to ${rangeEnd}, Duration: ${duration}, Timezone: ${timezone}`)
    // console.log(`API Base URL: ${GHL_API_BASE_URL}`)
    // console.log(`API Version: ${GHL_API_VERSION}`)

    const availableDates: string[] = []
    const startDate = parseISO(rangeStart)
    const endDate = parseISO(rangeEnd)
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate })

    // For testing, return mock data if we're in development
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock available dates for development")
      const mockDates = getMockAvailableDates(startDate, endDate)
      return NextResponse.json({
        success: true,
        // Return dates in YYYY-MM-DD format
        data: { availableDates: mockDates.map(d => format(d, 'yyyy-MM-dd')) },
      })
    }

    // Production: Fetch real availability for each day in the range
    console.log(`Fetching real availability for ${daysInRange.length} days...`)
    for (const day of daysInRange) {
      const result = await fetchAvailableSlotsForDay(calendarId, day, duration, timezone)
      // Check if the result is valid and contains slots
      // Adjust this check based on the actual GHL API response structure
      if (result && result.slots && result.slots.length > 0) {
        availableDates.push(format(day, 'yyyy-MM-dd'))
      } else if (result === null) {
        // Log if fetch failed for a specific day, but continue checking others
        console.warn(`Failed to fetch slots for ${format(day, 'yyyy-MM-dd')}`)
      }
      // Optional: Add a small delay if hitting rate limits
      // await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Return success response with the list of dates that have available slots
    return NextResponse.json({
      success: true,
      data: { availableDates },
    })
  } catch (error) {
    console.error("Error checking available dates:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred while checking date availability",
      },
      { status: 500 },
    )
  }
}

// Helper function to generate mock available dates for testing
function getMockAvailableDates(startDate: Date, endDate: Date): Date[] {
  const availableDates: Date[] = []
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Simulate availability: e.g., available every other day
  days.forEach((day, index) => {
    // Example logic: Make weekdays available, skip weekends, maybe skip some random ones
    const dayOfWeek = day.getDay() // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Make roughly 70% of weekdays available for variety
      if (Math.random() < 0.7) {
        availableDates.push(day)
      }
    }

    // Simpler logic: every other day
    // if (index % 2 === 0) {
    //   availableDates.push(day);
    // }
  })
  return availableDates
}

// Remove or comment out the old single-day mock slot generator if no longer needed
/*
function generateMockTimeSlots(startDate: string, duration: number) {
  // ... old implementation ...
}
*/
