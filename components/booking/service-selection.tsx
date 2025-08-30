"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Video, FileText, CheckCircle } from "lucide-react"
import type { BookingData } from "./booking-form"
import { calculatePricing } from "@/lib/pricing-engine"

interface ServiceSelectionProps {
  bookingData: BookingData
  updateBookingData: (updates: Partial<BookingData>) => void
}

const SERVICES = [
  {
    id: "quick-stamp",
    name: "Quick-Stamp Local",
    price: 50,
    description: "Perfect for single documents within 10 miles",
    features: ["≤1 document", "≤2 stamps", "10-mile radius", "Standard hours"],
    icon: CheckCircle,
    popular: false,
  },
  {
    id: "mobile-notary",
    name: "Standard Mobile",
    price: 75,
    description: "Most popular choice for general notarization needs",
    features: ["≤4 documents", "≤2 signers", "20-mile radius", "Flexible scheduling"],
    icon: MapPin,
    popular: true,
  },
  {
    id: "extended-hours",
    name: "Extended Hours",
    price: 100,
    description: "Early morning or evening appointments",
    features: ["≤4 documents", "≤2 signers", "30-mile radius", "7am-9pm daily"],
    icon: Clock,
    popular: false,
  },
  {
    id: "loan-signing",
    name: "Loan Signing",
    price: 150,
    description: "Specialized service for real estate transactions",
    features: ["Unlimited documents", "≤4 signers", "2 hours included", "Certified specialists"],
    icon: FileText,
    popular: false,
  },
  {
    id: "ron-service",
    name: "RON Services",
    price: 25,
    description: "Remote online notarization available 24/7",
    features: ["24/7 availability", "$5 per seal", "Secure video platform", "Digital documents"],
    icon: Video,
    popular: false,
  },
]

export function ServiceSelection({ bookingData, updateBookingData }: ServiceSelectionProps) {
  const handleServiceSelect = (service: (typeof SERVICES)[0]) => {
    const initialPricing = calculatePricing({
      serviceId: service.id,
      numberOfSigners: bookingData.numberOfSigners || 1,
      numberOfDocuments: bookingData.numberOfDocuments || 1,
      distanceMiles: 0, // Will be recalculated when location is entered
      urgencyLevel: bookingData.urgencyLevel || "standard",
    })

    updateBookingData({
      serviceId: service.id,
      serviceName: service.name,
      basePrice: initialPricing.basePrice,
      totalPrice: initialPricing.totalPrice,
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Service</h2>
      <div className="grid gap-4">
        {SERVICES.map((service) => {
          const Icon = service.icon
          const isSelected = bookingData.serviceId === service.id

          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-[#A52A2A] bg-red-50" : ""
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isSelected ? "bg-[#A52A2A] text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        {service.popular && <Badge className="bg-[#A52A2A] text-white">Most Popular</Badge>}
                      </div>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#A52A2A]">${service.price}</div>
                    {service.id === "ron-service" && <div className="text-sm text-gray-500">+ $5/seal</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
