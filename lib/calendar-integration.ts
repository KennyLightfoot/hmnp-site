export interface AvailabilitySlot {
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
  available: boolean
  duration: number // minutes
  calendarId: string
  serviceType: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  calendarId: string
  status: "confirmed" | "tentative" | "cancelled"
}

// GHL Calendar IDs from environment variables
const CALENDAR_IDS = {
  essential: process.env.GHL_ESSENTIAL_CALENDAR_ID,
  priority: process.env.GHL_PRIORITY_CALENDAR_ID,
  loan: process.env.GHL_LOAN_CALENDAR_ID,
  specialty: process.env.GHL_SPECIALTY_CALENDAR_ID,
  calls: process.env.GHL_CALLS_CALENDAR_ID,
  booking: process.env.GHL_BOOKING_CALENDAR_ID,
  reverseMortgage: process.env.GHL_REVERSE_MORTGAGE_CALENDAR_ID,
  standardNotary: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
}

// Map service types to appropriate calendars
const SERVICE_CALENDAR_MAP = {
  "quick-stamp": CALENDAR_IDS.essential,
  "mobile-notary": CALENDAR_IDS.standardNotary,
  "extended-hours": CALENDAR_IDS.priority,
  "loan-signing": CALENDAR_IDS.loan,
  "ron-service": CALENDAR_IDS.specialty,
}

export async function getAvailableSlots(serviceId: string, date: Date, duration = 60): Promise<AvailabilitySlot[]> {
  try {
    const calendarId = SERVICE_CALENDAR_MAP[serviceId as keyof typeof SERVICE_CALENDAR_MAP]
    if (!calendarId) {
      throw new Error(`No calendar configured for service: ${serviceId}`)
    }

    const response = await fetch("/api/calendar/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        calendarId,
        date: date.toISOString().split("T")[0],
        duration,
        serviceType: serviceId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch availability")
    }

    return await response.json()
  } catch (error) {
    console.error("Availability fetch error:", error)
    // Return mock availability as fallback
    return generateMockAvailability(date, serviceId)
  }
}

export async function createCalendarEvent(bookingData: {
  serviceId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  scheduledDateTime: Date
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  notes?: string
  totalPrice: number
}): Promise<{ eventId: string; calendarId: string }> {
  try {
    const calendarId = SERVICE_CALENDAR_MAP[bookingData.serviceId as keyof typeof SERVICE_CALENDAR_MAP]
    if (!calendarId) {
      throw new Error(`No calendar configured for service: ${bookingData.serviceId}`)
    }

    const response = await fetch("/api/calendar/create-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        calendarId,
        title: `${bookingData.serviceId.replace("-", " ").toUpperCase()} - ${bookingData.customerName}`,
        description: `
Service: ${bookingData.serviceId}
Customer: ${bookingData.customerName}
Phone: ${bookingData.customerPhone}
Email: ${bookingData.customerEmail}
Address: ${bookingData.addressStreet}, ${bookingData.addressCity}, ${bookingData.addressState} ${bookingData.addressZip}
Total: $${bookingData.totalPrice}
${bookingData.notes ? `Notes: ${bookingData.notes}` : ""}
        `.trim(),
        startDateTime: bookingData.scheduledDateTime.toISOString(),
        endDateTime: new Date(bookingData.scheduledDateTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour default
        attendees: [
          {
            email: bookingData.customerEmail,
            name: bookingData.customerName,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create calendar event")
    }

    return await response.json()
  } catch (error) {
    console.error("Calendar event creation error:", error)
    throw error
  }
}

// Generate mock availability for fallback
function generateMockAvailability(date: Date, serviceId: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = []
  const dateStr = date.toISOString().split("T")[0]

  // Business hours: 7am-9pm for extended hours, 9am-5pm for others
  const startHour = serviceId === "extended-hours" ? 7 : 9
  const endHour = serviceId === "extended-hours" ? 21 : 17

  // RON service is 24/7
  const ronStartHour = serviceId === "ron-service" ? 0 : startHour
  const ronEndHour = serviceId === "ron-service" ? 24 : endHour

  const actualStartHour = serviceId === "ron-service" ? ronStartHour : startHour
  const actualEndHour = serviceId === "ron-service" ? ronEndHour : endHour

  for (let hour = actualStartHour; hour < actualEndHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

      // Mock some slots as unavailable (simulate existing bookings)
      const isAvailable = Math.random() > 0.3 // 70% availability rate

      slots.push({
        date: dateStr,
        time: timeStr,
        available: isAvailable,
        duration: 60,
        calendarId: SERVICE_CALENDAR_MAP[serviceId as keyof typeof SERVICE_CALENDAR_MAP] || "default",
        serviceType: serviceId,
      })
    }
  }

  return slots
}

// Business hours validation
export function isWithinBusinessHours(date: Date, serviceId: string): boolean {
  const hour = date.getHours()
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday

  // RON service is 24/7
  if (serviceId === "ron-service") {
    return true
  }

  // Sunday is closed for most services
  if (dayOfWeek === 0 && serviceId !== "extended-hours") {
    return false
  }

  // Extended hours: 7am-9pm daily
  if (serviceId === "extended-hours") {
    return hour >= 7 && hour < 21
  }

  // Standard hours: 9am-5pm weekdays, 9am-3pm Saturday
  if (dayOfWeek === 6) {
    // Saturday
    return hour >= 9 && hour < 15
  }

  // Weekdays
  return hour >= 9 && hour < 17
}

// Check for holidays and special dates
export function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Major holidays when service might be limited
  const holidays = [
    { month: 1, day: 1 }, // New Year's Day
    { month: 7, day: 4 }, // Independence Day
    { month: 12, day: 25 }, // Christmas Day
    { month: 11, day: 28 }, // Thanksgiving (approximate)
  ]

  return holidays.some((holiday) => holiday.month === month && holiday.day === day)
}
