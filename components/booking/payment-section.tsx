"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Shield, CheckCircle, AlertCircle, Lock, Award, Star } from "lucide-react"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import type { BookingData } from "./booking-form"
import { createClient } from "@/lib/supabase/client"
import { createPaymentIntent, calculateDepositAmount, stripePromise, formatCurrency } from "@/lib/stripe-integration"
import { createCalendarEvent } from "@/lib/calendar-integration"

interface PaymentSectionProps {
  bookingData: BookingData
  updateBookingData: (updates: Partial<BookingData>) => void
}

function PaymentForm({ bookingData }: { bookingData: BookingData }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError("Payment system not ready. Please try again.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create booking in database first
      const supabase = createClient()

      const bookingRecord = {
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        addressStreet: bookingData.addressStreet,
        addressCity: bookingData.addressCity,
        addressState: bookingData.addressState,
        addressZip: bookingData.addressZip,
        scheduledDateTime: bookingData.scheduledDateTime?.toISOString(),
        serviceId: bookingData.serviceId,
        priceAtBooking: bookingData.totalPrice,
        status: "pending_payment",
        urgency_level: bookingData.urgencyLevel,
        locationNotes: bookingData.locationNotes,
        notes: bookingData.specialInstructions,
        travelFee: bookingData.travelFee,
        urgencyFee: bookingData.urgencyFee,
        paymentStatus: "pending",
      }

      const { data: booking, error: dbError } = await supabase.from("Booking").insert([bookingRecord]).select().single()

      if (dbError) throw dbError

      setBookingId(booking.id)

      // Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation?booking_id=${booking.id}`,
        },
        redirect: "if_required",
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      // Create calendar event
      try {
        await createCalendarEvent({
          serviceId: bookingData.serviceId,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          scheduledDateTime: bookingData.scheduledDateTime!,
          addressStreet: bookingData.addressStreet,
          addressCity: bookingData.addressCity,
          addressState: bookingData.addressState,
          addressZip: bookingData.addressZip,
          notes: bookingData.specialInstructions,
          totalPrice: bookingData.totalPrice,
        })
      } catch (calendarError) {
        console.error("Calendar event creation failed:", calendarError)
        // Don't fail the booking if calendar creation fails
      }

      // Update booking status
      await supabase
        .from("Booking")
        .update({
          status: "confirmed",
          paymentStatus: "paid",
          paidAt: new Date().toISOString(),
        })
        .eq("id", booking.id)

      setPaymentComplete(true)
    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during payment")
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">
            Your appointment has been confirmed. You'll receive a confirmation email shortly.
          </p>
          {bookingId && (
            <p className="text-sm text-gray-500 mt-2">
              Booking ID: <span className="font-mono">{bookingId}</span>
            </p>
          )}
        </div>
        <div className="flex items-center justify-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Licensed & Insured</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-green-700">NNA Certified</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-green-700">4.9/5 Rating</span>
          </div>
        </div>
        <Card className="text-left">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#A52A2A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-gray-600">Confirmation details sent to {bookingData.customerEmail}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#A52A2A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Prepare your documents</p>
                <p className="text-sm text-gray-600">Have your ID and documents ready for the appointment</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#A52A2A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">We'll contact you</p>
                <p className="text-sm text-gray-600">Our notary will call 30 minutes before arrival</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <PaymentElement />
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-center space-x-6 p-3 bg-muted/30 rounded-lg border border-primary/10">
        <div className="flex items-center space-x-2">
          <Lock className="h-4 w-4 text-green-600" />
          <span className="text-xs text-muted-foreground">256-bit SSL</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-xs text-muted-foreground">PCI Compliant</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-xs text-muted-foreground">Stripe Secured</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#A52A2A] hover:bg-[#8B1A1A] text-white py-3 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay {formatCurrency(bookingData.totalPrice * 100)} & Confirm Booking
          </>
        )}
      </Button>
    </form>
  )
}

export function PaymentSection({ bookingData }: PaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)

  useEffect(() => {
    initializePayment()
  }, [])

  const initializePayment = async () => {
    setIsLoadingPayment(true)
    setPaymentError(null)

    try {
      // Check if deposit is required
      const calculatedDeposit = calculateDepositAmount(bookingData.serviceId, bookingData.totalPrice)
      setDepositAmount(calculatedDeposit)
      setRequiresDeposit(calculatedDeposit > 0)

      // Create payment intent for full amount
      const paymentData = await createPaymentIntent({
        bookingId: "temp", // Will be replaced when booking is created
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        amount: bookingData.totalPrice * 100, // Convert to cents
        currency: "usd",
        description: `${bookingData.serviceName} - ${bookingData.customerName}`,
        metadata: {
          serviceId: bookingData.serviceId,
          serviceName: bookingData.serviceName,
          scheduledDateTime: bookingData.scheduledDateTime?.toISOString() || "",
          urgencyLevel: bookingData.urgencyLevel,
        },
      })

      setClientSecret(paymentData.clientSecret)
    } catch (error) {
      console.error("Payment initialization error:", error)
      setPaymentError("Failed to initialize payment. Please try again.")
    } finally {
      setIsLoadingPayment(false)
    }
  }

  if (isLoadingPayment) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="text-gray-600">Initializing secure payment...</p>
      </div>
    )
  }

  if (paymentError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-700">
          {paymentError}
          <Button variant="outline" size="sm" onClick={initializePayment} className="ml-4 bg-transparent">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!clientSecret) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Unable to initialize payment. Please refresh the page and try again.</AlertDescription>
      </Alert>
    )
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#A52A2A",
      },
    },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
          <Shield className="h-3 w-3 mr-1" />
          Secure Payment
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{bookingData.serviceName}</span>
                <span>{formatCurrency(bookingData.basePrice * 100)}</span>
              </div>
              {bookingData.travelFee > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Travel Fee</span>
                  <span>{formatCurrency(bookingData.travelFee * 100)}</span>
                </div>
              )}
              {bookingData.urgencyFee > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Priority Fee</span>
                  <span>{formatCurrency(bookingData.urgencyFee * 100)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-[#A52A2A]">{formatCurrency(bookingData.totalPrice * 100)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Information */}
        {requiresDeposit && (
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Security Deposit Required</div>
                <div className="text-sm">
                  A {formatCurrency(depositAmount * 100)} security deposit is required for this service type. This
                  amount will be deducted from your final payment.
                </div>
                <Badge variant="secondary" className="text-xs">
                  Total charge today: {formatCurrency(bookingData.totalPrice * 100)}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We use Stripe for
                payment processing with industry-standard security measures.
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Lock className="h-3 w-3 text-green-600" />
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-3 w-3 text-purple-600" />
                  <span>NNA Certified</span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Payment Form */}
        <Elements stripe={stripePromise} options={stripeOptions}>
          <PaymentForm bookingData={bookingData} />
        </Elements>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 text-center">
            By completing this booking, you agree to our Terms of Service and Privacy Policy. You will be charged{" "}
            {formatCurrency(bookingData.totalPrice * 100)} for this appointment.
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Your card information is never stored on our servers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
