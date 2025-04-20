import { NextResponse } from "next/server"
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_API_VERSION_HEADER = "2021-04-15" // Use the required version

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

// Helper function to fetch free slots for a date RANGE
async function fetchFreeSlotsForRange(
  calendarId: string,
  startDate: Date, // Use Date objects for easier timestamp conversion
  endDate: Date,
  timezone: string,
) {
  try {
    const url = `${GHL_API_BASE_URL}/calendars/${calendarId}/free-slots` // Corrected path

    const queryParams = new URLSearchParams({
      // Convert dates to millisecond timestamps
      startDate: startDate.getTime().toString(),
      endDate: endDate.getTime().toString(),
      timezone, // Keep timezone
      // Removed duration parameter
    })

    console.log(`Fetching available dates from: ${url}?${queryParams.toString()}`)

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION_HEADER, // Use fixed version header
        "Content-Type": "application/json",
        Accept: "application/json", // Often good practice
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`GHL Free Slots API Status: ${response.status}`)
      console.error(`GHL Free Slots API Body: ${errorText}`)
      throw new Error(`Failed to fetch available dates: Status ${response.status}`)
    }

    // Expecting response format like: { "2024-04-20": { slots: [...] }, ... }
    return response.json()

  } catch (error) {
    console.error(`Error fetching free slots for range ${format(startDate, 'yyyy-MM-dd')} - ${format(endDate, 'yyyy-MM-dd')}:`, error)
    throw error // Re-throw to be caught by GET handler
  }
}

export async function GET(request: Request) {
  try {
    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get("serviceType")
    const rangeStartStr = searchParams.get("startDate") // Expect YYYY-MM-DD from client
    const rangeEndStr = searchParams.get("endDate")   // Expect YYYY-MM-DD from client
    const timezone = searchParams.get("timezone") || "America/Chicago"

    // Validate required parameters
    if (!serviceType || !rangeStartStr || !rangeEndStr) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters: serviceType, startDate, endDate (as YYYY-MM-DD)",
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
    console.log(`Range: ${rangeStartStr} to ${rangeEndStr}, Timezone: ${timezone}`)

    // Mock data for development
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock available dates for development")
      // Keep existing mock date generation for now, or update if needed
      const mockDates = getMockAvailableDates(startOfDay(parseISO(rangeStartStr)), endOfDay(parseISO(rangeEndStr))) // Pass Date objects
      return NextResponse.json({
        success: true,
        data: { availableDates: mockDates.map(d => format(d, 'yyyy-MM-dd')) },
      })
    }

    // Production: Fetch real availability using the new range function
    const freeSlotsData = await fetchFreeSlotsForRange(calendarId, startOfDay(parseISO(rangeStartStr)), endOfDay(parseISO(rangeEndStr)), timezone)

    // Process the response: Extract dates with non-empty slots
    const availableDates: string[] = []
    if (freeSlotsData) {
      for (const dateStr in freeSlotsData) {
        // Check if the key is a valid date and has slots
        if (freeSlotsData[dateStr] && Array.isArray(freeSlotsData[dateStr].slots) && freeSlotsData[dateStr].slots.length > 0) {
           // Validate date format if necessary, e.g., using regex /^\\d{4}-\\d{2}-\\d{2}$/
           if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dateStr)) {
                availableDates.push(dateStr)
           }
        }
      }
    }

    // Return success response with the list of dates that have available slots
    return NextResponse.json({
      success: true,
      data: { availableDates }, // Send the array of YYYY-MM-DD strings
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
  // This mock might need adjustment depending on how realistic you want it
  // Example: Make ~70% of weekdays available
  let currentDate = startDate;
  while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
          if (Math.random() < 0.7) { // Randomly make weekdays available
               availableDates.push(new Date(currentDate));
          }
      }
      currentDate.setDate(currentDate.getDate() + 1);
  }
  // Reset start date in case it was mutated
  startDate.setDate(startDate.getDate() - (availableDates.length > 0 ? availableDates.length : 0)); // Simple reset attempt

  return availableDates
}
