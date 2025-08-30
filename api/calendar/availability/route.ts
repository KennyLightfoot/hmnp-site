import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { calendarId, date, duration, serviceType } = await request.json()

    if (!calendarId || !date) {
      return NextResponse.json({ error: "Calendar ID and date are required" }, { status: 400 })
    }

    // In a real implementation, this would call GHL API
    // For now, we'll simulate the API response
    const mockAvailability = await simulateGHLAvailability(calendarId, date, duration, serviceType)

    return NextResponse.json(mockAvailability)
  } catch (error) {
    console.error("Calendar availability error:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

async function simulateGHLAvailability(calendarId: string, date: string, duration: number, serviceType: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const slots = []
  const requestDate = new Date(date)

  // Business hours based on service type
  let startHour = 9
  let endHour = 17

  if (serviceType === "extended-hours") {
    startHour = 7
    endHour = 21
  } else if (serviceType === "ron-service") {
    startHour = 0
    endHour = 24
  }

  // Generate time slots
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      // Simulate some unavailable slots (existing bookings)
      const isAvailable = Math.random() > 0.25 // 75% availability

      // Don't show past time slots for today
      const slotDateTime = new Date(requestDate)
      slotDateTime.setHours(hour, minute, 0, 0)
      const now = new Date()

      if (slotDateTime <= now) {
        continue // Skip past slots
      }

      slots.push({
        date,
        time: timeStr,
        available: isAvailable,
        duration: duration || 60,
        calendarId,
        serviceType,
      })
    }
  }

  return slots
}
