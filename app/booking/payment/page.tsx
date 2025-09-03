"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Shield, Lock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingData {
  service: string
  address: string
  city: string
  zipCode: string
  date: string
  time: string
  signerCount: number
  documentCount: number
  specialInstructions: string
  distance: number
  pricing: any
  promoCode: string
  rushService: boolean
  witnessRequired: boolean
  finalTotal: number
}

function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [clientSecret, setClientSecret] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    agreeToTerms: false,
    agreeToSMS: false,
  })

  useEffect(() => {
    const storedData = sessionStorage.getItem("finalBookingData")
    if (storedData) {
      const data = JSON.parse(storedData)
      setBookingData(data)

      // Create payment intent
      createPaymentIntent(data)
    } else {
      router.push("/booking")
    }
  }, [router])

  const createPaymentIntent = async (data: BookingData) => {
    try {
      const response = await fetch("/api/booking/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: data.finalTotal * 100, // Convert to cents
          bookingData: data,
        }),
      })

      const { clientSecret } = await response.json()
      setClientSecret(clientSecret)
    } catch (error) {
      setPaymentError("Failed to initialize payment. Please try again.")
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    if (!customerInfo.agreeToTerms) {
      setPaymentError("Please agree to the terms and conditions.")
      return
    }

    setIsProcessing(true)
    setPaymentError("")

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setPaymentError("Card information is required.")
      setIsProcessing(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: {
            line1: bookingData?.address,
            city: bookingData?.city,
            state: "TX",
            postal_code: bookingData?.zipCode,
          },
        },
      },
    })

    if (error) {
      setPaymentError(error.message || "Payment failed. Please try again.")
      setIsProcessing(false)
    } else if (paymentIntent.status === "succeeded") {
      // Create the booking record
      await createBooking(paymentIntent.id)
    }
  }

  const createBooking = async (paymentIntentId: string) => {
    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingData,
          customerInfo,
          paymentIntentId,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem("bookingData")
        sessionStorage.removeItem("finalBookingData")

        // Redirect to success page
        router.push(`/booking/success?booking=${result.bookingId}`)
      } else {
        setPaymentError("Booking creation failed. Please contact support.")
        setIsProcessing(false)
      }
    } catch (error) {
      setPaymentError("Booking creation failed. Please contact support.")
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                Step 4 of 4
              </Badge>
              <h1 className="text-2xl font-bold">Secure Payment</h1>
            </div>
            <p className="text-primary-foreground/90">Complete your booking with secure payment processing</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>We'll use this information to confirm your appointment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>Your payment information is encrypted and secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#424770",
                              "::placeholder": {
                                color: "#aab7c4",
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    {paymentError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{paymentError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Terms and Conditions */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={customerInfo.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed">
                          I agree to the{" "}
                          <a href="/terms" className="text-primary hover:underline">
                            Terms and Conditions
                          </a>{" "}
                          and understand that a 50% deposit is required to secure my appointment.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="sms"
                          checked={customerInfo.agreeToSMS}
                          onCheckedChange={(checked) => handleInputChange("agreeToSMS", checked)}
                        />
                        <Label htmlFor="sms" className="text-sm leading-relaxed">
                          I consent to receive SMS notifications about my appointment (optional)
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/booking/pricing")}
                        className="flex-1"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Pricing
                      </Button>

                      <Button
                        type="submit"
                        disabled={!stripe || isProcessing || !customerInfo.agreeToTerms}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Complete Booking (${bookingData.finalTotal})
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">
                      {bookingData.service.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bookingData.date).toLocaleDateString()} at {bookingData.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.address}, {bookingData.city}, TX
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>${bookingData.pricing.basePrice}</span>
                    </div>

                    {bookingData.pricing.travelFee > 0 && (
                      <div className="flex justify-between">
                        <span>Travel Fee</span>
                        <span>${bookingData.pricing.travelFee}</span>
                      </div>
                    )}

                    {bookingData.pricing.rushFee > 0 && (
                      <div className="flex justify-between">
                        <span>Rush Service</span>
                        <span>${bookingData.pricing.rushFee}</span>
                      </div>
                    )}

                    {bookingData.pricing.witnessFee > 0 && (
                      <div className="flex justify-between">
                        <span>Witness Service</span>
                        <span>${bookingData.pricing.witnessFee}</span>
                      </div>
                    )}

                    {bookingData.pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${bookingData.pricing.discountAmount}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${bookingData.finalTotal}</span>
                  </div>

                  {/* Security Indicators */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Licensed & insured notary</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  )
}
