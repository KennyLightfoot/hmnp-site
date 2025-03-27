import { NextResponse } from "next/server"
import { getCalendars } from "@/lib/gohighlevel"

export async function GET() {
  try {
    console.log("Testing GHL calendars...")

    // Get all calendars
    const calendars = await getCalendars()
    console.log(`Retrieved ${calendars.length} calendars`)

    // Check if the configured calendar IDs exist
    const calendarIds = {
      essential: process.env.GHL_ESSENTIAL_CALENDAR_ID,
      priority: process.env.GHL_PRIORITY_CALENDAR_ID,
      loan: process.env.GHL_LOAN_CALENDAR_ID,
      specialty: process.env.GHL_SPECIALTY_CALENDAR_ID,
      calls: process.env.GHL_CALLS_CALENDAR_ID,
      booking: process.env.GHL_BOOKING_CALENDAR_ID,
      reverseMortgage: process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID,
    }

    const calendarStatus: Record<string, { exists: boolean; name?: string; id?: string }> = {}

    // Check each calendar ID
    for (const [key, id] of Object.entries(calendarIds)) {
      if (!id) {
        calendarStatus[key] = { exists: false, id: "Not configured" }
        continue
      }

      const calendar = calendars.find((cal: any) => cal.id === id)
      calendarStatus[key] = {
        exists: !!calendar,
        name: calendar?.name || "Not found",
        id: id,
      }
    }

    // Check if all required calendars exist
    const allCalendarsExist = Object.values(calendarStatus).every((status) => status.exists)

    return NextResponse.json({
      success: allCalendarsExist,
      error: allCalendarsExist ? null : "Some calendar IDs are missing or invalid",
      details: {
        calendarStatus,
        allCalendars: calendars.map((cal: any) => ({
          id: cal.id,
          name: cal.name,
        })),
      },
    })
  } catch (error) {
    console.error("Error testing GHL calendars:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: {
        calendarIds: {
          essential: process.env.GHL_ESSENTIAL_CALENDAR_ID ? "Configured" : "Missing",
          priority: process.env.GHL_PRIORITY_CALENDAR_ID ? "Configured" : "Missing",
          loan: process.env.GHL_LOAN_CALENDAR_ID ? "Configured" : "Missing",
          specialty: process.env.GHL_SPECIALTY_CALENDAR_ID ? "Configured" : "Missing",
          calls: process.env.GHL_CALLS_CALENDAR_ID ? "Configured" : "Missing",
          booking: process.env.GHL_BOOKING_CALENDAR_ID ? "Configured" : "Missing",
          reverseMortgage: process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID ? "Configured" : "Missing",
        },
      },
    })
  }
}

