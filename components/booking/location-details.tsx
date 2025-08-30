"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, AlertCircle, Loader2 } from "lucide-react"
import type { BookingData } from "./booking-form"
import { calculateDistance, calculatePricing, validateServiceConstraints } from "@/lib/pricing-engine"

interface LocationDetailsProps {
  bookingData: BookingData
  updateBookingData: (updates: Partial<BookingData>) => void
}

export function LocationDetails({ bookingData, updateBookingData }: LocationDetailsProps) {
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number
    duration: number
    isWithinServiceArea: boolean
    validationErrors: string[]
  } | null>(null)

  useEffect(() => {
    if (bookingData.addressStreet && bookingData.addressCity && bookingData.addressZip && bookingData.serviceId) {
      setIsCalculatingDistance(true)

      const fullAddress = `${bookingData.addressStreet}, ${bookingData.addressCity}, ${bookingData.addressState} ${bookingData.addressZip}`

      calculateDistance("base", fullAddress)
        .then((result) => {
          const pricingResult = calculatePricing({
            serviceId: bookingData.serviceId,
            numberOfSigners: bookingData.numberOfSigners,
            numberOfDocuments: bookingData.numberOfDocuments,
            distanceMiles: result.distance,
            urgencyLevel: bookingData.urgencyLevel,
          })

          const validationErrors = validateServiceConstraints({
            serviceId: bookingData.serviceId,
            numberOfSigners: bookingData.numberOfSigners,
            numberOfDocuments: bookingData.numberOfDocuments,
            distanceMiles: result.distance,
            urgencyLevel: bookingData.urgencyLevel,
          })

          setDistanceInfo({
            distance: result.distance,
            duration: result.duration,
            isWithinServiceArea: pricingResult.isWithinServiceArea,
            validationErrors,
          })

          updateBookingData({
            travelFee: pricingResult.travelFee,
            totalPrice: pricingResult.totalPrice,
          })
        })
        .catch((error) => {
          console.error("Distance calculation failed:", error)
          const estimatedDistance = 15
          const pricingResult = calculatePricing({
            serviceId: bookingData.serviceId,
            numberOfSigners: bookingData.numberOfSigners,
            numberOfDocuments: bookingData.numberOfDocuments,
            distanceMiles: estimatedDistance,
            urgencyLevel: bookingData.urgencyLevel,
          })

          setDistanceInfo({
            distance: estimatedDistance,
            duration: 30,
            isWithinServiceArea: true,
            validationErrors: [],
          })

          updateBookingData({
            travelFee: pricingResult.travelFee,
            totalPrice: pricingResult.totalPrice,
          })
        })
        .finally(() => {
          setIsCalculatingDistance(false)
        })
    }
  }, [bookingData.addressStreet, bookingData.addressCity, bookingData.addressZip, bookingData.serviceId])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Location</h2>

      <div className="grid gap-6">
        <div>
          <Label htmlFor="addressStreet">Street Address *</Label>
          <Input
            id="addressStreet"
            value={bookingData.addressStreet}
            onChange={(e) => updateBookingData({ addressStreet: e.target.value })}
            placeholder="123 Main Street"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="addressCity">City *</Label>
            <Input
              id="addressCity"
              value={bookingData.addressCity}
              onChange={(e) => updateBookingData({ addressCity: e.target.value })}
              placeholder="Houston"
              required
            />
          </div>
          <div>
            <Label htmlFor="addressZip">ZIP Code *</Label>
            <Input
              id="addressZip"
              value={bookingData.addressZip}
              onChange={(e) => updateBookingData({ addressZip: e.target.value })}
              placeholder="77001"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="locationNotes">Location Notes (Optional)</Label>
          <Textarea
            id="locationNotes"
            value={bookingData.locationNotes || ""}
            onChange={(e) => updateBookingData({ locationNotes: e.target.value })}
            placeholder="Apartment number, building entrance, parking instructions, etc."
            rows={3}
          />
        </div>

        {isCalculatingDistance && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Calculating distance and pricing...</AlertDescription>
          </Alert>
        )}

        {distanceInfo && (
          <>
            {distanceInfo.validationErrors.length > 0 ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium text-red-700">Service Restrictions:</div>
                    {distanceInfo.validationErrors.map((error, index) => (
                      <div key={index} className="text-red-700">
                        • {error}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium text-green-700">
                      Distance: {distanceInfo.distance} miles • Travel time: ~{distanceInfo.duration} minutes
                    </div>
                    <div className="text-green-700">
                      ✓ Within our service area
                      {bookingData.travelFee > 0 && <span className="block">Travel fee: ${bookingData.travelFee}</span>}
                      <span className="block font-medium">Total: ${bookingData.totalPrice}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  )
}
