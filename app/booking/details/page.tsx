"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, MapPin, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { format, addDays, isAfter, isBefore } from "date-fns"
import { cn } from "@/lib/utils"

const services = {
  "quick-stamp": { name: "Quick-Stamp Local", price: 50, radius: 10, maxDocs: 1 },
  standard: { name: "Standard Mobile", price: 75, radius: 20, maxDocs: 4 },
  extended: { name: "Extended Hours", price: 100, radius: 30, maxDocs: 4 },
  "loan-signing": { name: "Loan Signing", price: 150, radius: 30, maxDocs: 999 },
  ron: { name: "RON Services", price: 25, radius: 999, maxDocs: 999 },
}

const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
]

const extendedTimeSlots = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
]

export default function BookingDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceType = searchParams.get("service") as keyof typeof services

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    zipCode: "",
    date: undefined as Date | undefined,
    time: "",
    signerCount: 1,
    documentCount: 1,
    specialInstructions: "",
  })

  const [distance, setDistance] = useState<number | null>(null)
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [addressError, setAddressError] = useState("")
  const [isWithinServiceArea, setIsWithinServiceArea] = useState<boolean | null>(null)

  const service = services[serviceType]
  const availableTimeSlots = serviceType === "extended" ? extendedTimeSlots : timeSlots

  // Calculate distance when address changes
  useEffect(() => {
    const calculateDistance = async () => {
      if (!formData.address || !formData.city || !formData.zipCode) {
        setDistance(null)
        setIsWithinServiceArea(null)
        return
      }

      setIsCalculatingDistance(true)
      setAddressError("")

      try {
        const fullAddress = `${formData.address}, ${formData.city}, TX ${formData.zipCode}`

        // Mock distance calculation - replace with actual Google Maps API call
        const mockDistance = Math.random() * 40 + 5 // 5-45 miles

        setTimeout(() => {
          setDistance(mockDistance)
          setIsWithinServiceArea(mockDistance <= service.radius)
          setIsCalculatingDistance(false)
        }, 1000)
      } catch (error) {
        setAddressError("Unable to verify address. Please check and try again.")
        setIsCalculatingDistance(false)
      }
    }

    const debounceTimer = setTimeout(calculateDistance, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.address, formData.city, formData.zipCode, service.radius])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    if (!isFormValid()) return

    const bookingData = {
      service: serviceType,
      ...formData,
      distance,
      estimatedPrice: calculateEstimatedPrice(),
    }

    // Store booking data and continue to pricing/payment
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData))
    router.push("/booking/pricing")
  }

  const calculateEstimatedPrice = () => {
    const basePrice = service.price
    let travelFee = 0

    if (distance && distance > 10) {
      travelFee = Math.ceil((distance - 10) / 5) * 10 // $10 per 5-mile increment beyond 10 miles
    }

    return basePrice + travelFee
  }

  const isFormValid = () => {
    return (
      formData.address &&
      formData.city &&
      formData.zipCode &&
      formData.date &&
      formData.time &&
      isWithinServiceArea === true &&
      formData.documentCount <= service.maxDocs
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Service Not Found</CardTitle>
            <CardDescription>Please select a valid service type.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/booking")}>Back to Service Selection</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                Step 2 of 4
              </Badge>
              <h1 className="text-2xl font-bold">Location & Scheduling</h1>
            </div>
            <p className="text-primary-foreground/90">
              Selected: <strong>{service.name}</strong> - ${service.price}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Service Location
                  </CardTitle>
                  <CardDescription>Where should we meet you for the notary service?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Houston"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="77001"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Distance Calculation */}
                  {isCalculatingDistance && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Calculating distance and verifying service area...</AlertDescription>
                    </Alert>
                  )}

                  {distance !== null && !isCalculatingDistance && (
                    <Alert
                      className={isWithinServiceArea ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                    >
                      {isWithinServiceArea ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={isWithinServiceArea ? "text-green-800" : "text-red-800"}>
                        {isWithinServiceArea
                          ? `✓ Within service area (${distance.toFixed(1)} miles from our location)`
                          : `✗ Outside service area (${distance.toFixed(1)} miles - max ${service.radius} miles for ${service.name})`}
                      </AlertDescription>
                    </Alert>
                  )}

                  {addressError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{addressError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Preferred Date & Time
                  </CardTitle>
                  <CardDescription>
                    {serviceType === "extended"
                      ? "Extended hours available 7am-9pm daily"
                      : "Standard hours 8am-7pm daily"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div>
                      <Label>Select Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => handleInputChange("date", date)}
                            disabled={(date) => isBefore(date, new Date()) || isAfter(date, addDays(new Date(), 30))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <Label>Select Time</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={formData.time === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleInputChange("time", time)}
                            className="text-xs"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signerCount">Number of Signers</Label>
                      <Input
                        id="signerCount"
                        type="number"
                        min="1"
                        max={serviceType === "loan-signing" ? "4" : "2"}
                        value={formData.signerCount}
                        onChange={(e) => handleInputChange("signerCount", Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentCount">Number of Documents</Label>
                      <Input
                        id="documentCount"
                        type="number"
                        min="1"
                        max={service.maxDocs === 999 ? "50" : service.maxDocs.toString()}
                        value={formData.documentCount}
                        onChange={(e) => handleInputChange("documentCount", Number.parseInt(e.target.value))}
                      />
                      {formData.documentCount > service.maxDocs && service.maxDocs !== 999 && (
                        <p className="text-sm text-red-600 mt-1">
                          Exceeds limit for {service.name} (max {service.maxDocs})
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any special requirements or instructions for the notary..."
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">Base Price: ${service.price}</p>
                  </div>

                  {distance !== null && isWithinServiceArea && (
                    <div>
                      <h4 className="font-semibold">Travel Distance</h4>
                      <p className="text-sm text-muted-foreground">{distance.toFixed(1)} miles</p>
                      {distance > 10 && (
                        <p className="text-sm text-muted-foreground">
                          Travel fee: ${Math.ceil((distance - 10) / 5) * 10}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.date && formData.time && (
                    <div>
                      <h4 className="font-semibold">Appointment</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(formData.date, "PPP")} at {formData.time}
                      </p>
                    </div>
                  )}

                  {distance !== null && isWithinServiceArea && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Estimated Total:</span>
                        <span className="text-lg font-bold text-primary">${calculateEstimatedPrice()}</span>
                      </div>
                    </div>
                  )}

                  <Button className="w-full" onClick={handleContinue} disabled={!isFormValid()}>
                    Continue to Pricing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
