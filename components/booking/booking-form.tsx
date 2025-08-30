"use client"

import { useState } from "react"
import { ServiceSelection } from "./service-selection"
import { CustomerDetails } from "./customer-details"
import { LocationDetails } from "./location-details"
import { DateTimeSelection } from "./datetime-selection"
import { BookingSummary } from "./booking-summary"
import { PaymentSection } from "./payment-section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Shield, Lock, CheckCircle, Award } from "lucide-react"

interface BookingFormProps {
  initialService?: string
}

export interface BookingData {
  serviceId: string
  serviceName: string
  basePrice: number
  customerName: string
  customerEmail: string
  customerPhone: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressZip: string
  locationNotes?: string
  scheduledDateTime: Date | null
  urgencyLevel: "standard" | "priority" | "emergency"
  numberOfSigners: number
  numberOfDocuments: number
  specialInstructions?: string
  travelFee: number
  urgencyFee: number
  totalPrice: number
}

const STEPS = [
  { id: 1, name: "Service", component: ServiceSelection },
  { id: 2, name: "Details", component: CustomerDetails },
  { id: 3, name: "Location", component: LocationDetails },
  { id: 4, name: "Schedule", component: DateTimeSelection },
  { id: 5, name: "Review", component: BookingSummary },
  { id: 6, name: "Payment", component: PaymentSection },
]

export function BookingForm({ initialService }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: initialService === "mobile" ? "mobile-notary" : initialService === "loan-signing" ? "loan-signing" : "",
    serviceName: "",
    basePrice: 0,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressStreet: "",
    addressCity: "",
    addressState: "TX",
    addressZip: "",
    locationNotes: "",
    scheduledDateTime: null,
    urgencyLevel: "standard",
    numberOfSigners: 1,
    numberOfDocuments: 1,
    specialInstructions: "",
    travelFee: 0,
    urgencyFee: 0,
    totalPrice: 0,
  })

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.serviceId && bookingData.serviceName
      case 2:
        return bookingData.customerName && bookingData.customerEmail && bookingData.customerPhone
      case 3:
        return bookingData.addressStreet && bookingData.addressCity && bookingData.addressZip
      case 4:
        return bookingData.scheduledDateTime
      case 5:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep ? "bg-[#A52A2A] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.id}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${step.id <= currentStep ? "text-[#A52A2A]" : "text-gray-500"}`}
              >
                {step.name}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${step.id < currentStep ? "bg-[#A52A2A]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-primary/10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">Licensed & Insured</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-muted-foreground">Secure Booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">100% Satisfaction</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-purple-600" />
            <span className="text-muted-foreground">NNA Certified</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-6">
        <CurrentStepComponent bookingData={bookingData} updateBookingData={updateBookingData} />

        {/* Navigation Buttons */}
        {currentStep < STEPS.length && (
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center bg-[#A52A2A] hover:bg-[#8B1A1A]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Your information is protected with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  )
}
