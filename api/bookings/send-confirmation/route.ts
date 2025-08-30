import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { ConfirmationEmailTemplate } from "@/components/booking/confirmation-email-template"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    // Fetch booking details
    const supabase = await createClient()
    const { data: booking, error: dbError } = await supabase.from("Booking").select("*").eq("id", bookingId).single()

    if (dbError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Get service display name
    const serviceNames = {
      "quick-stamp": "Quick-Stamp Local",
      "mobile-notary": "Standard Mobile Notary",
      "extended-hours": "Extended Hours Mobile",
      "loan-signing": "Loan Signing Specialist",
      "ron-service": "Remote Online Notarization",
    }

    const emailData = {
      id: booking.id,
      customerName: booking.customerName,
      serviceName: serviceNames[booking.serviceId as keyof typeof serviceNames] || booking.serviceId,
      scheduledDateTime: booking.scheduledDateTime,
      addressStreet: booking.addressStreet,
      addressCity: booking.addressCity,
      addressState: booking.addressState,
      addressZip: booking.addressZip,
      totalPaid: booking.totalPaid || booking.priceAtBooking,
      urgencyLevel: booking.urgency_level,
      notes: booking.notes,
      locationNotes: booking.locationNotes,
    }

    // Send confirmation email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Houston Mobile Notary Pros <noreply@houstonmobilenotarypros.com>",
      to: [booking.customerEmail],
      subject: `Appointment Confirmed - ${emailData.serviceName}`,
      react: ConfirmationEmailTemplate({ booking: emailData }),
    })

    if (emailError) {
      console.error("Email sending error:", emailError)
      return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
    }

    console.log("[v0] Confirmation email sent:", {
      bookingId,
      emailId: emailResult?.id,
      customerEmail: booking.customerEmail,
    })

    return NextResponse.json({
      success: true,
      emailId: emailResult?.id,
      message: "Confirmation email sent successfully",
    })
  } catch (error) {
    console.error("Confirmation email error:", error)
    return NextResponse.json(
      {
        error: "Failed to send confirmation email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
