import { NextResponse } from "next/server";
import { startOfDay, endOfDay, parseISO, format, addMinutes } from 'date-fns';

// GHL API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_API_VERSION_HEADER = "2021-04-15";

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

// Helper function to fetch free slots from GHL API for a specific day
async function fetchFreeSlotsForSingleDay(
  calendarId: string,
  date: Date,
  timezone: string,
) {
  try {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const url = `${GHL_API_BASE_URL}/calendars/${calendarId}/free-slots`;
    const queryParams = new URLSearchParams({
      startDate: dayStart.getTime().toString(),
      endDate: dayEnd.getTime().toString(),
      timezone,
    });

    console.log(`Fetching time slots from: ${url}?${queryParams.toString()}`);

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION_HEADER,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GHL Time Slot API Status: ${response.status}`);
      console.error(`GHL Time Slot API Body: ${errorText}`);
      throw new Error(`Failed to fetch time slots: Status ${response.status}`);
    }

    return response.json();

  } catch (error) {
    console.error(`Error fetching time slots for ${format(date, 'yyyy-MM-dd')}:`, error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const dateStr = searchParams.get("date");
    const duration = Number.parseInt(searchParams.get("duration") || "30", 10);
    const timezone = searchParams.get("timezone") || "America/Chicago";

    if (!serviceType || !dateStr) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: serviceType, date (as YYYY-MM-DD)" },
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

    console.log(`Fetching time slots for ${dateStr}, Calendar: ${calendarId}, Service: ${serviceType}, Duration: ${duration}`);

    const targetDate = parseISO(dateStr);

    // Mock data for development
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock time slots for development");
      const mockSlots = generateMockTimeSlotsForDay(dateStr, duration);
      return NextResponse.json({ success: true, data: { slots: mockSlots } });
    }

    // Production: Fetch real slots
    const freeSlotsData = await fetchFreeSlotsForSingleDay(calendarId, targetDate, timezone);

    let finalSlots: { startTime: string; endTime: string }[] = [];
    if (freeSlotsData && freeSlotsData[dateStr] && Array.isArray(freeSlotsData[dateStr].slots)) {
      const timeStrings: string[] = freeSlotsData[dateStr].slots;

      finalSlots = timeStrings.map((timeStr) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hour, minute, 0, 0);

        const endTime = addMinutes(startTime, duration);

        return {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        };
      }).filter(slot => new Date(slot.startTime) > new Date());
    } else {
      console.warn(`No slots found or unexpected format in response for date ${dateStr}:`, freeSlotsData);
    }

    return NextResponse.json({ success: true, data: { slots: finalSlots } });

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