import { NextResponse } from "next/server"
import { createContact, createAppointment } from "@/lib/gohighlevel"

export async function POST() {
  try {
    console.log("Testing GHL appointment creation...")

    // First create a test contact
    const contactData = {
      firstName: "Test",
      lastName: `Appointment-${Date.now()}`,
      email: `test-appointment-${Date.now()}@example.com`,
      phone: "5555555555",
      tags: ["Test", "Appointment Test"],
    }

    console.log(`Creating test contact for appointment: ${JSON.stringify(contactData, null, 2)}`)

    const contact = await createContact(contactData)

    console.log(`Contact created successfully: ${JSON.stringify(contact, null, 2)}`)

    if (!contact.id) {
      throw new Error("Failed to create test contact for appointment - no contact ID returned")
    }

    // Get the first available calendar ID
    const calendarId =
      process.env.GHL_ESSENTIAL_CALENDAR_ID ||
      process.env.GHL_PRIORITY_CALENDAR_ID ||
      process.env.GHL_LOAN_CALENDAR_ID ||
      process.env.GHL_CALLS_CALENDAR_ID

    if (!calendarId) {
      throw new Error("No calendar ID configured for testing")
    }

    // Create a test appointment for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(11, 0, 0, 0)

    const appointmentData = {
      contactId: contact.id,
      calendarId,
      startTime: tomorrow.toISOString(),
      endTime: tomorrowEnd.toISOString(),
      title: "Test Appointment",
      notes: "Created via API test",
      status: "scheduled" as const,
    }

    console.log(`Creating test appointment: ${JSON.stringify(appointmentData, null, 2)}`)

    const appointment = await createAppointment(appointmentData)

    console.log(`Appointment created successfully: ${JSON.stringify(appointment, null, 2)}`)

    return NextResponse.json({
      success: true,
      details: {
        contact,
        appointment,
        calendarId,
      },
    })
  } catch (error) {
    console.error("Error creating test appointment:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

