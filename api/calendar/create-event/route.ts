import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { calendarId, title, description, startDateTime, endDateTime, attendees } = await request.json()

    if (!calendarId || !title || !startDateTime) {
      return NextResponse.json({ error: "Calendar ID, title, and start time are required" }, { status: 400 })
    }

    // In a real implementation, this would call GHL API to create the event
    // For now, we'll simulate the API response
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Log the event creation for debugging
    console.log("[v0] Calendar event created:", {
      eventId,
      calendarId,
      title,
      startDateTime,
      endDateTime,
      attendees: attendees?.length || 0,
    })

    return NextResponse.json({
      eventId,
      calendarId,
      status: "confirmed",
      message: "Event created successfully",
    })
  } catch (error) {
    console.error("Calendar event creation error:", error)
    return NextResponse.json(
      { error: "Failed to create calendar event", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
