import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = await createClient()

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("[v0] Payment succeeded:", paymentIntent.id)

        // Update booking status in database
        if (paymentIntent.metadata.bookingId) {
          const { error } = await supabase
            .from("Booking")
            .update({
              paymentStatus: "paid",
              paidAt: new Date().toISOString(),
              stripePaymentIntentId: paymentIntent.id,
              totalPaid: paymentIntent.amount / 100, // Convert from cents
            })
            .eq("id", paymentIntent.metadata.bookingId)

          if (error) {
            console.error("Failed to update booking payment status:", error)
          }
        }

        // Handle deposit payments
        if (paymentIntent.metadata.type === "deposit") {
          const { error } = await supabase.from("Payment").insert({
            bookingId: paymentIntent.metadata.bookingId,
            amount: paymentIntent.amount / 100,
            status: "completed",
            provider: "stripe",
            transactionId: paymentIntent.id,
            paymentIntentId: paymentIntent.id,
            paidAt: new Date().toISOString(),
            notes: "Security deposit payment",
          })

          if (error) {
            console.error("Failed to record deposit payment:", error)
          }
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("[v0] Payment failed:", paymentIntent.id)

        // Update booking status
        if (paymentIntent.metadata.bookingId) {
          const { error } = await supabase
            .from("Booking")
            .update({
              paymentStatus: "failed",
              stripePaymentIntentId: paymentIntent.id,
            })
            .eq("id", paymentIntent.metadata.bookingId)

          if (error) {
            console.error("Failed to update booking payment status:", error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
