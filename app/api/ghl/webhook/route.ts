import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get("x-ghl-signature")

    // Verify webhook signature if configured
    if (process.env.GHL_WEBHOOK_SECRET && signature) {
      // Add signature verification logic here
      console.log("[v0] GHL webhook signature verification needed")
    }

    console.log("[v0] GHL webhook received:", body.type)

    // Handle different webhook events
    switch (body.type) {
      case "ContactCreate":
        console.log("[v0] Contact created in GHL:", body.contact?.id)
        break

      case "AppointmentCreate":
        console.log("[v0] Appointment created in GHL:", body.appointment?.id)
        break

      case "AppointmentUpdate":
        console.log("[v0] Appointment updated in GHL:", body.appointment?.id)
        // Handle appointment changes, send notifications, etc.
        break

      case "WorkflowComplete":
        console.log("[v0] Workflow completed in GHL:", body.workflow?.id)
        break

      default:
        console.log("[v0] Unhandled GHL webhook type:", body.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] GHL webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
