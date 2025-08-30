import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const {
      bookingId,
      customerName,
      customerEmail,
      amount,
      currency = "usd",
      description,
      metadata,
    } = await request.json()

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Amount must be at least $0.50" }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata: {
        bookingId,
        customerName,
        customerEmail,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
    })

    console.log("[v0] Payment intent created:", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      bookingId,
      customerEmail,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
