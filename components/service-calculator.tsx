"use client"

import { useState, useEffect } from "react"
import { Calculator, DollarSign, Users, MapPin, Calendar, FileText, Truck, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { PricingEngine } from "@/lib/pricing-engine"

export default function ServiceCalculator() {
  const [serviceType, setServiceType] = useState("standard-notary")
  const [numberOfSigners, setNumberOfSigners] = useState(1)
  const [distance, setDistance] = useState(10)
  const [isWeekend, setIsWeekend] = useState(false)
  const [isHoliday, setIsHoliday] = useState(false)
  const [isAfterHours, setIsAfterHours] = useState(false)
  const [extraDocuments, setExtraDocuments] = useState(0)
  const [needsOvernightHandling, setNeedsOvernightHandling] = useState(false)
  const [needsBilingualService, setNeedsBilingualService] = useState(false)
  const [pricing, setPricing] = useState({
    price: 0,
    discount: 0,
    finalPrice: 0,
    promoCodeDiscount: 0,
    depositAmount: 0,
    depositRequired: false,
  })

  // SOP COMPLIANT: Map service types to API service types
  const mapServiceTypeToAPI = (serviceType: string): "STANDARD_NOTARY" | "EXTENDED_HOURS" | "LOAN_SIGNING" | "RON_SERVICES" | "BUSINESS_ESSENTIALS" | "BUSINESS_GROWTH" => {
    switch (serviceType) {
      case "standard-notary":
        return "STANDARD_NOTARY"
      case "extended-hours-notary":
        return "EXTENDED_HOURS"
      case "loan-signing-specialist":
        return "LOAN_SIGNING"
      case "ron-services":
        return "RON_SERVICES"
      case "specialty-notary-service":
        return "STANDARD_NOTARY" // Map to standard notary
      case "business-solutions":
        return "BUSINESS_ESSENTIALS" // Map to business essentials
      case "support-service":
        return "STANDARD_NOTARY" // Map to standard notary
      default:
        return "STANDARD_NOTARY"
    }
  }

  // Calculate pricing whenever inputs change
  useEffect(() => {
    const apiServiceType = mapServiceTypeToAPI(serviceType)
    const pricingEngine = new PricingEngine()
    
    // Create a mock location for now - in real app this would come from user input
    const mockLocation = {
      address: "Houston, TX",
      latitude: 29.7604,
      longitude: -95.3698
    }
    
    // Create scheduled date time (next business day at 2pm)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)
    const scheduledDateTime = tomorrow.toISOString()
    
    pricingEngine.calculateBookingPrice({
      serviceType: apiServiceType,
      location: mockLocation,
      scheduledDateTime,
      documentCount: extraDocuments + 1, // At least 1 document
      signerCount: numberOfSigners,
      options: {
        priority: isAfterHours,
        sameDay: false,
        weatherAlert: false
      }
    }).then(result => {
      setPricing({
        price: result.basePrice,
        discount: result.discounts,
        finalPrice: result.total,
        promoCodeDiscount: 0, // Would come from promo code input
        depositAmount: Math.round(result.total * 0.25), // 25% deposit
        depositRequired: result.total > 100,
      })
    }).catch(error => {
      console.error('Pricing calculation failed:', error)
      // Set default pricing on error
      setPricing({
        price: 75,
        discount: 0,
        finalPrice: 75,
        promoCodeDiscount: 0,
        depositAmount: 19,
        depositRequired: false,
      })
    })
  }, [
    serviceType,
    numberOfSigners,
    distance,
    isWeekend,
    isHoliday,
    isAfterHours,
    extraDocuments,
    needsOvernightHandling,
    needsBilingualService,
  ])

  const getServiceName = () => {
    switch (serviceType) {
      case "standard-notary":
        return "Standard Notary Services"
      case "extended-hours-notary":
        return "Extended Hours Notary"
      case "loan-signing-specialist":
        return "Loan Signing Specialist"
      case "specialty-notary-service":
        return "Specialty Notary Service"
      case "business-solutions":
        return "Business Solutions"
      case "support-service":
        return "Support Services"
      default:
        return "Notary Service"
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md">
      <CardHeader className="bg-[#002147] text-white">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          <CardTitle>Service Pricing Calculator</CardTitle>
        </div>
        <CardDescription className="text-gray-200">
          Estimate the cost of your notary service based on your specific needs
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#A52A2A]" />
              Service Type
            </Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard-notary">Standard Notary Services</SelectItem>
                <SelectItem value="extended-hours-notary">Extended Hours Notary</SelectItem>
                <SelectItem value="loan-signing-specialist">Loan Signing Specialist</SelectItem>
                <SelectItem value="specialty-notary-service">Specialty Notary Service</SelectItem>
                <SelectItem value="business-solutions">Business Solutions</SelectItem>
                <SelectItem value="support-service">Support Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Signers */}
          <div className="space-y-2">
            <Label htmlFor="numberOfSigners" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#A52A2A]" />
              Number of Signers
            </Label>
            <Select
              value={numberOfSigners.toString()}
              onValueChange={(value: string) => setNumberOfSigners(Number.parseInt(value))}
            >
              <SelectTrigger id="numberOfSigners">
                <SelectValue placeholder="Select number of signers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Signer" : "Signers"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="distance" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#A52A2A]" />
                Distance (miles)
              </Label>
              <span className="text-sm font-medium">{distance} miles</span>
            </div>
            <Slider
              id="distance"
              min={1}
              max={50}
              step={1}
              value={[distance]}
              onValueChange={(value: number[]) => setDistance(value[0] || 10)}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 mile</span>
              <span className="text-[#A52A2A]">20 miles (free service area)</span>
              <span>50 miles</span>
            </div>
          </div>

          {/* Time Options */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#A52A2A]" />
              Scheduling Options
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weekend" className="cursor-pointer">
                  Weekend Service
                </Label>
                <Switch id="weekend" checked={isWeekend} onCheckedChange={setIsWeekend} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="holiday" className="cursor-pointer">
                  Holiday Service
                </Label>
                <Switch id="holiday" checked={isHoliday} onCheckedChange={setIsHoliday} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="afterHours" className="cursor-pointer">
                  After Hours (7-9pm)
                </Label>
                <Switch id="afterHours" checked={isAfterHours} onCheckedChange={setIsAfterHours} />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#A52A2A]" />
              Additional Options
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="extraDocuments" className="cursor-pointer">
                  Extra Documents
                </Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => setExtraDocuments(Math.max(0, extraDocuments - 1))}
                    disabled={extraDocuments === 0}
                  >
                    -
                  </Button>
                  <div className="h-8 px-3 flex items-center justify-center border border-x-0 border-input">
                    {extraDocuments}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => setExtraDocuments(extraDocuments + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="overnightHandling" className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    <span>Overnight Document Handling</span>
                  </div>
                </Label>
                <Switch
                  id="overnightHandling"
                  checked={needsOvernightHandling}
                  onCheckedChange={setNeedsOvernightHandling}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bilingual" className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>Bilingual Service (Spanish)</span>
                  </div>
                </Label>
                <Switch id="bilingual" checked={needsBilingualService} onCheckedChange={setNeedsBilingualService} />
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#A52A2A]" />
            Price Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price ({getServiceName()}):</span>
              <span className="font-medium">${pricing.price.toFixed(2)}</span>
            </div>

            {pricing.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-${pricing.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-lg font-bold">
              <span>Estimated Total:</span>
              <span className="text-[#002147]">${pricing.finalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 bg-gray-50 rounded-b-lg">
        <div className="text-sm text-gray-500 italic w-full">
          <p>This calculator provides an estimate. Final pricing may vary based on specific requirements.</p>
          <p>All services comply with Texas notary fee regulations.</p>
        </div>
        <div className="flex justify-center w-full">
          <Button className="bg-[#A52A2A] hover:bg-[#8B0000]">Book This Service</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
