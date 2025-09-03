import { type NextRequest, NextResponse } from "next/server"
import { ghlApi } from "@/lib/ghl-api"

export async function POST(request: NextRequest) {
  try {
    const { bookingData, customerInfo, paymentIntentId } = await request.json()

    // Generate a unique booking ID
    const bookingId = `HMNP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    console.log("[v0] Creating booking:", bookingId)

    let ghlContactId = null
    let ghlEventId = null

    try {
      // Create contact in GHL with custom fields
      const ghlContact = await ghlApi.createContact({
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address1: bookingData.address,
        city: bookingData.city,
        state: "TX",
        postalCode: bookingData.zipCode,
        customFields: {
          [process.env.GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_TYPE!]: bookingData.service,
          [process.env.GHL_CUSTOM_FIELD_ID_BOOKING_APPOINTMENT_DATETIME!]: `${bookingData.date} ${bookingData.time}`,
          [process.env.GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_ADDRESS!]:
            `${bookingData.address}, ${bookingData.city}, TX ${bookingData.zipCode}`,
          [process.env.GHL_CUSTOM_FIELD_ID_BOOKING_SPECIAL_INSTRUCTIONS!]: bookingData.specialInstructions || "",
          [process.env.GHL_CUSTOM_FIELD_ID_NUMBER_OF_SIGNERS!]: bookingData.signerCount.toString(),
          [process.env.GHL_CUSTOM_FIELD_ID_DOCUMENT_COUNT!]: bookingData.documentCount.toString(),
          [process.env.GHL_CUSTOM_FIELD_ID_TRAVEL_MILEAGE!]: bookingData.distance.toString(),
          [process.env.GHL_CUSTOM_FIELD_ID_TRAVEL_FEE!]: bookingData.pricing.travelFee.toString(),
          [process.env.GHL_CUSTOM_FIELD_ID_ADDITIONAL_CHARGES!]: (
            bookingData.pricing.rushFee + bookingData.pricing.witnessFee
          ).toString(),
          [process.env.GHL_CUSTOM_FIELD_ID_CLIENT_TYPE!]: "Individual",
          [process.env.GHL_CUSTOM_FIELD_ID_URGENCY_LEVEL!]: bookingData.rushService ? "Rush" : "Standard",
          [process.env.GHL_CUSTOM_FIELD_ID_SMS_NOTIFICATIONS_CONSENT!]: customerInfo.agreeToSMS ? "Yes" : "No",
          [process.env.GHL_CUSTOM_FIELD_ID_EMAIL_UPDATES_CONSENT!]: "Yes",
          [process.env.GHL_CUSTOM_FIELD_ID_CONSENT_TERMS_CONDITIONS!]: customerInfo.agreeToTerms ? "Yes" : "No",
          [process.env.GHL_CUSTOM_FIELD_ID_PROMO_CODE_USED!]: bookingData.promoCode || "",
          [process.env.GHL_CUSTOM_FIELD_ID_BOOKING_DISCOUNT_APPLIED!]: bookingData.pricing.discountAmount.toString(),
        },
        tags: [
          "New Booking",
          `Service: ${bookingData.service}`,
          bookingData.rushService ? "Rush Service" : "Standard Service",
          `Payment: $${bookingData.finalTotal}`,
        ],
      })

      ghlContactId = ghlContact.contact?.id || ghlContact.id
      console.log("[v0] GHL contact created:", ghlContactId)

      // Create calendar event
      if (ghlContactId && bookingData.service !== "ron") {
        const appointmentStart = new Date(`${bookingData.date}T${convertTo24Hour(bookingData.time)}:00`)
        const appointmentEnd = new Date(
          appointmentStart.getTime() + (bookingData.service === "loan-signing" ? 120 : 60) * 60000,
        )

        const calendarId = ghlApi.getCalendarIdForService(bookingData.service)

        const ghlEvent = await ghlApi.createCalendarEvent({
          calendarId,
          startTime: appointmentStart.toISOString(),
          endTime: appointmentEnd.toISOString(),
          title: `${bookingData.service.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} - ${customerInfo.firstName} ${customerInfo.lastName}`,
          address: `${bookingData.address}, ${bookingData.city}, TX ${bookingData.zipCode}`,
          contactId: ghlContactId,
        })

        ghlEventId = ghlEvent.id
        console.log("[v0] GHL calendar event created:", ghlEventId)
      }

      // Trigger booking confirmation workflow
      if (ghlContactId && process.env.GHL_NEW_BOOKING_WORKFLOW_ID) {
        await ghlApi.triggerWorkflow(ghlContactId, process.env.GHL_NEW_BOOKING_WORKFLOW_ID)
        console.log("[v0] GHL booking workflow triggered")
      }

      // Trigger booking confirmation workflow
      if (ghlContactId && process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID) {
        await ghlApi.triggerWorkflow(ghlContactId, process.env.GHL_BOOKING_CONFIRMATION_WORKFLOW_ID)
        console.log("[v0] GHL confirmation workflow triggered")
      }
    } catch (ghlError) {
      console.error("[v0] GHL integration error:", ghlError)
      // Continue with booking creation even if GHL fails
    }

    // Create booking record
    const booking = {
      id: bookingId,
      service: bookingData.service,
      customer: customerInfo,
      appointment: {
        date: bookingData.date,
        time: bookingData.time,
        address: `${bookingData.address}, ${bookingData.city}, TX ${bookingData.zipCode}`,
      },
      pricing: bookingData.pricing,
      paymentIntentId,
      ghlContactId,
      ghlEventId,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }

    console.log("[v0] Booking created successfully:", bookingId)

    return NextResponse.json({
      success: true,
      bookingId,
      booking,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(" ")
  let [hours, minutes] = time.split(":")

  if (hours === "12") {
    hours = "00"
  }

  if (modifier === "PM") {
    hours = (Number.parseInt(hours, 10) + 12).toString()
  }

  return `${hours.padStart(2, "0")}:${minutes || "00"}`
}
