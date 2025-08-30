import { loadStripe } from "@stripe/stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export { stripePromise }

export interface PaymentIntentData {
  bookingId: string
  customerName: string
  customerEmail: string
  amount: number // in cents
  currency: string
  description: string
  metadata: Record<string, string>
}

export interface DepositPaymentData {
  serviceType: string
  amount: number // in cents
  customerEmail: string
  customerName: string
  scheduledDateTime: string
  metadata: Record<string, string>
}

export async function createPaymentIntent(data: PaymentIntentData) {
  try {
    const response = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create payment intent")
    }

    return await response.json()
  } catch (error) {
    console.error("Payment intent creation error:", error)
    throw error
  }
}

export async function createDepositPayment(data: DepositPaymentData) {
  try {
    const response = await fetch("/api/payments/create-deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create deposit payment")
    }

    return await response.json()
  } catch (error) {
    console.error("Deposit payment creation error:", error)
    throw error
  }
}

export function calculateDepositAmount(serviceType: string, totalAmount: number): number {
  // Deposit amounts based on your fee schedule
  const depositRules = {
    "quick-stamp": 25, // $25 for Quick-Stamp Local
    "mobile-notary": 50, // $50 for Standard Mobile
    "extended-hours": 75, // $75 for Extended Hours
    "loan-signing": 75, // $75 for Loan Signing (no weekend/holiday mentioned)
    "ron-service": 0, // No deposit for RON services
  }

  const baseDeposit = depositRules[serviceType as keyof typeof depositRules] || 50

  // Weekend/Holiday additional deposit
  const isWeekendOrHoliday = false // This would be determined by the booking date
  const weekendHolidayDeposit = isWeekendOrHoliday ? 100 : 0

  return Math.max(baseDeposit, weekendHolidayDeposit)
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100)
}
