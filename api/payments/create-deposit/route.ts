import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { calculateDepositAmount } from "@/lib/stripe-integration"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { serviceType, amount, customerEmail, customerName, scheduledDateTime, metadata } = await request.json()

    if (!serviceType || !amount || !customerEmail) {
      return NextResponse.json({ error: "Service type, amount, and customer email are required" }, { status: 400 })
    }

    const depositAmount = calculateDepositAmount(serviceType, amount)

    if (depositAmount === 0) {
      return NextResponse.json({
        message: "No deposit required for this service",
        depositAmount: 0,
      })
    }

    // Create payment intent for deposit
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount * 100, // Convert to cents
      currency: "usd",
      description: `Security deposit for ${serviceType.replace("-", " ")} service`,
      metadata: {
        type: "deposit",
        serviceType,
        totalAmount: amount.toString(),
        customerName,
        customerEmail,
        scheduledDateTime,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
    })

    console.log("[v0] Deposit payment intent created:", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      serviceType,
      customerEmail,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      depositAmount,
    })
  } catch (error) {
    console.error("Deposit payment creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create deposit payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
