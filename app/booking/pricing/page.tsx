"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, MapPin, FileText, Users, CheckCircle, Edit3, ArrowLeft } from "lucide-react"
import { format } from "date-fns"

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
  estimatedPrice: number
}

const services = {
  "quick-stamp": {
    name: "Quick-Stamp Local",
    basePrice: 50,
    radius: 10,
    maxDocs: 1,
    maxSigners: 2,
    docOverageFee: 25,
    signerOverageFee: 15,
  },
  standard: {
    name: "Standard Mobile",
    basePrice: 75,
    radius: 20,
    maxDocs: 4,
    maxSigners: 2,
    docOverageFee: 15,
    signerOverageFee: 15,
  },
  extended: {
    name: "Extended Hours",
    basePrice: 100,
    radius: 30,
    maxDocs: 4,
    maxSigners: 2,
    docOverageFee: 15,
    signerOverageFee: 15,
  },
  "loan-signing": {
    name: "Loan Signing",
    basePrice: 150,
    radius: 30,
    maxDocs: 999,
    maxSigners: 4,
    docOverageFee: 0,
    signerOverageFee: 25,
  },
  ron: {
    name: "RON Services",
    basePrice: 25,
    radius: 999,
    maxDocs: 999,
    maxSigners: 999,
    docOverageFee: 0,
    signerOverageFee: 0,
    sealFee: 5,
  },
}

export default function PricingPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [rushService, setRushService] = useState(false)
  const [witnessRequired, setWitnessRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedData = sessionStorage.getItem("bookingData")
    if (storedData) {
      const data = JSON.parse(storedData)
      setBookingData(data)
    } else {
      router.push("/booking")
    }
    setIsLoading(false)
  }, [router])

  if (isLoading || !bookingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading pricing details...</p>
        </div>
      </div>
    )
  }

  const service = services[bookingData.service as keyof typeof services]

  // Calculate all pricing components
  const calculatePricing = () => {
    const basePrice = service.basePrice
    let travelFee = 0
    let documentOverageFee = 0
    let signerOverageFee = 0
    let rushFee = 0
    let witnessFee = 0
    let sealFees = 0

    // Travel fee calculation (beyond 10 miles)
    if (bookingData.distance > 10) {
      const extraMiles = bookingData.distance - 10
      travelFee = Math.ceil(extraMiles / 5) * 10 // $10 per 5-mile increment
    }

    // Document overage fees
    if (bookingData.documentCount > service.maxDocs && service.maxDocs !== 999) {
      const extraDocs = bookingData.documentCount - service.maxDocs
      documentOverageFee = extraDocs * service.docOverageFee
    }

    // Signer overage fees
    if (bookingData.signerCount > service.maxSigners && service.maxSigners !== 999) {
      const extraSigners = bookingData.signerCount - service.maxSigners
      signerOverageFee = extraSigners * service.signerOverageFee
    }

    // Rush service fee (same day or next day)
    if (rushService) {
      rushFee = Math.round(basePrice * 0.5) // 50% surcharge
    }

    // Witness fee
    if (witnessRequired) {
      witnessFee = 25
    }

    // RON seal fees
    if (bookingData.service === "ron") {
      sealFees = bookingData.documentCount * (service.sealFee || 5)
    }

    const subtotal = basePrice + travelFee + documentOverageFee + signerOverageFee + rushFee + witnessFee + sealFees
    const discountAmount = Math.round(subtotal * (promoDiscount / 100))
    const total = subtotal - discountAmount

    return {
      basePrice,
      travelFee,
      documentOverageFee,
      signerOverageFee,
      rushFee,
      witnessFee,
      sealFees,
      subtotal,
      discountAmount,
      total,
    }
  }

  const pricing = calculatePricing()

  const applyPromoCode = () => {
    // Mock promo code validation
    const validCodes = {
      FIRST10: 10,
      SAVE15: 15,
      NEWCLIENT: 20,
    }

    if (validCodes[promoCode as keyof typeof validCodes]) {
      setPromoDiscount(validCodes[promoCode as keyof typeof validCodes])
    } else {
      setPromoDiscount(0)
    }
  }

  const handleContinueToPayment = () => {
    const finalBookingData = {
      ...bookingData,
      pricing,
      promoCode: promoDiscount > 0 ? promoCode : "",
      rushService,
      witnessRequired,
      finalTotal: pricing.total,
    }

    sessionStorage.setItem("finalBookingData", JSON.stringify(finalBookingData))
    router.push("/booking/payment")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                Step 3 of 4
              </Badge>
              <h1 className="text-2xl font-bold">Review & Pricing</h1>
            </div>
            <p className="text-primary-foreground/90">Review your booking details and confirm pricing</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Booking Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Booking Details
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/booking/details?service=" + bookingData.service)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">SERVICE</h4>
                        <p className="font-medium">{service.name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">LOCATION</h4>
                        <p className="text-sm">{bookingData.address}</p>
                        <p className="text-sm">
                          {bookingData.city}, TX {bookingData.zipCode}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {bookingData.distance.toFixed(1)} miles from our location
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">DATE & TIME</h4>
                        <p className="font-medium">{format(new Date(bookingData.date), "PPP")}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.time}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">DETAILS</h4>
                        <p className="text-sm flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {bookingData.signerCount} signer{bookingData.signerCount > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {bookingData.documentCount} document{bookingData.documentCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Services</CardTitle>
                  <CardDescription>Optional add-ons to enhance your notary service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rush" checked={rushService} onCheckedChange={setRushService} />
                    <Label htmlFor="rush" className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Rush Service</p>
                          <p className="text-sm text-muted-foreground">Same-day or next-day priority scheduling</p>
                        </div>
                        <span className="font-semibold">+${Math.round(service.basePrice * 0.5)}</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="witness" checked={witnessRequired} onCheckedChange={setWitnessRequired} />
                    <Label htmlFor="witness" className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Witness Service</p>
                          <p className="text-sm text-muted-foreground">Professional witness for document signing</p>
                        </div>
                        <span className="font-semibold">+$25</span>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Promo Code</CardTitle>
                  <CardDescription>Have a discount code? Enter it below</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    />
                    <Button variant="outline" onClick={applyPromoCode}>
                      Apply
                    </Button>
                  </div>
                  {promoDiscount > 0 && (
                    <Alert className="mt-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Promo code applied! {promoDiscount}% discount
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pricing Breakdown */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Pricing Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Base Price */}
                  <div className="flex justify-between">
                    <span>{service.name}</span>
                    <span>${pricing.basePrice}</span>
                  </div>

                  {/* Travel Fee */}
                  {pricing.travelFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Travel fee ({(bookingData.distance - 10).toFixed(1)} extra miles)
                      </span>
                      <span>${pricing.travelFee}</span>
                    </div>
                  )}

                  {/* Document Overage */}
                  {pricing.documentOverageFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Extra documents ({bookingData.documentCount - service.maxDocs})
                      </span>
                      <span>${pricing.documentOverageFee}</span>
                    </div>
                  )}

                  {/* Signer Overage */}
                  {pricing.signerOverageFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Extra signers ({bookingData.signerCount - service.maxSigners})
                      </span>
                      <span>${pricing.signerOverageFee}</span>
                    </div>
                  )}

                  {/* RON Seal Fees */}
                  {pricing.sealFees > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Notary seals ({bookingData.documentCount} × $5)</span>
                      <span>${pricing.sealFees}</span>
                    </div>
                  )}

                  {/* Rush Service */}
                  {pricing.rushFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rush service (50%)</span>
                      <span>${pricing.rushFee}</span>
                    </div>
                  )}

                  {/* Witness Fee */}
                  {pricing.witnessFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Witness service</span>
                      <span>${pricing.witnessFee}</span>
                    </div>
                  )}

                  <Separator />

                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${pricing.subtotal}</span>
                  </div>

                  {/* Discount */}
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promoDiscount}%)</span>
                      <span>-${pricing.discountAmount}</span>
                    </div>
                  )}

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${pricing.total}</span>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button className="w-full" onClick={handleContinueToPayment}>
                      Continue to Payment
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => router.push("/booking/details?service=" + bookingData.service)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Details
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="pt-4 border-t text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Licensed & Insured</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Secure Payment Processing</span>
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
