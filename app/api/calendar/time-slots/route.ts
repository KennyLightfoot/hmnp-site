import { NextResponse } from "next/server";
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_VERSION = process.env.GHL_API_VERSION || "V2";

// Calendar IDs mapping (ensure this matches the other API route)
const CALENDAR_IDS: Record<string, string | undefined> = {
  essential: process.env.GHL_ESSENTIAL_CALENDAR_ID,
  priority: process.env.GHL_PRIORITY_CALENDAR_ID,
  "loan-signing": process.env.GHL_LOAN_CALENDAR_ID,
  "reverse-mortgage": process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID,
  specialty: process.env.GHL_SPECIALTY_CALENDAR_ID,
  calls: process.env.GHL_CALLS_CALENDAR_ID,
  booking: process.env.GHL_BOOKING_CALENDAR_ID,
};

// Helper function to get calendar ID
function getCalendarId(serviceType: string): string | undefined {
  return CALENDAR_IDS[serviceType];
}

// Helper function to fetch slots from GHL API for a specific day
async function fetchSlotsForDay(
  calendarId: string,
  isoDate: string, // Expecting YYYY-MM-DD
  duration: number,
  timezone: string,
) {
  try {
    const dateObj = parseISO(isoDate);
    const dayStart = startOfDay(dateObj);
    const dayEnd = endOfDay(dateObj);
    const startDate = dayStart.toISOString(); // Required format for GHL API
    const endDate = dayEnd.toISOString(); // Required format for GHL API

    const url = `${GHL_API_BASE_URL}/v2/calendars/${calendarId}/available-slots`;
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      duration: duration.toString(),
      timezone,
    });

    console.log(`Time Slot Fetch: ${url}?${queryParams.toString()}`);

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Time Slot API Status: ${response.status}`);
      console.error(`Time Slot API Body: ${errorText}`);
      throw new Error(`Failed to fetch time slots: Status ${response.status}`);
    }

    return response.json(); // Expecting { slots: [...] } or similar

  } catch (error) {
    console.error(`Error fetching time slots for ${isoDate}:`, error);
    throw error; // Re-throw the error to be caught by the GET handler
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const date = searchParams.get("date"); // Expecting YYYY-MM-DD format
    const duration = Number.parseInt(searchParams.get("duration") || "30", 10);
    const timezone = searchParams.get("timezone") || "America/Chicago";

    if (!serviceType || !date) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: serviceType, date" },
        { status: 400 },
      );
    }

    const calendarId = getCalendarId(serviceType);
    if (!calendarId) {
      return NextResponse.json(
        { success: false, message: `No calendar found for service type: ${serviceType}` },
        { status: 400 },
      );
    }

    console.log(`Fetching time slots for ${date}, Calendar: ${calendarId}, Service: ${serviceType}, Duration: ${duration}`);

    // Mock data for development
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock time slots for development");
      const mockSlots = generateMockTimeSlotsForDay(date, duration);
      return NextResponse.json({ success: true, data: { slots: mockSlots } });
    }

    // Production: Fetch real slots
    const result = await fetchSlotsForDay(calendarId, date, duration, timezone);

    // Assuming the result structure is { slots: [...] }
    if (result && Array.isArray(result.slots)) {
      return NextResponse.json({ success: true, data: { slots: result.slots } });
    } else {
      // Handle cases where slots might be missing or in unexpected format
      console.warn("Unexpected API response structure for time slots:", result);
      return NextResponse.json({ success: true, data: { slots: [] } }); // Return empty slots
    }

  } catch (error) {
    console.error("Get time slots error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred while fetching time slots",
      },
      { status: 500 },
    );
  }
}

// Helper function to generate mock time slots for a specific day (similar to original mock)
function generateMockTimeSlotsForDay(isoDate: string, duration: number) {
  const date = parseISO(isoDate);
  const slots = [];
  const now = new Date(); // To potentially disable past slots on the current day

  // Generate slots from 9 AM to 5 PM
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) { // Assuming 30 min base increment
      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      // Only add future slots if the date is today
      if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        if (startTime > now) {
          slots.push({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          });
        }
      } else if (date > now) {
        // For future dates, add all generated slots
        slots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
      }
    }
  }
  // Simulate some unavailable slots for variety
  return slots.filter(() => Math.random() > 0.2); // Keep ~80% of generated slots
} 