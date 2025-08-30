"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, User, FileText, DollarSign } from "lucide-react"
import type { BookingData } from "./booking-form"

interface BookingSummaryProps {
  bookingData: BookingData
  updateBookingData: (updates: Partial<BookingData>) => void
}

export function BookingSummary({ bookingData }: BookingSummaryProps) {
  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    }
  }

  const dateTime = bookingData.scheduledDateTime ? formatDateTime(bookingData.scheduledDateTime) : null

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Booking</h2>

      <div className="grid gap-6">
        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{bookingData.serviceName}</span>
              <Badge variant="secondary">${bookingData.basePrice}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>Signers: {bookingData.numberOfSigners}</div>
              <div>Documents: {bookingData.numberOfDocuments}</div>
            </div>
            {bookingData.specialInstructions && (
              <div className="text-sm">
                <span className="font-medium">Special Instructions:</span>
                <p className="text-gray-600 mt-1">{bookingData.specialInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Name:</strong> {bookingData.customerName}
            </div>
            <div>
              <strong>Email:</strong> {bookingData.customerEmail}
            </div>
            <div>
              <strong>Phone:</strong> {bookingData.customerPhone}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>{bookingData.addressStreet}</div>
            <div>
              {bookingData.addressCity}, {bookingData.addressState} {bookingData.addressZip}
            </div>
            {bookingData.locationNotes && (
              <div className="text-sm text-gray-600">
                <strong>Notes:</strong> {bookingData.locationNotes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Appointment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dateTime && (
              <>
                <div>
                  <strong>Date:</strong> {dateTime.date}
                </div>
                <div>
                  <strong>Time:</strong> {dateTime.time}
                </div>
                <div className="flex items-center">
                  <strong>Priority:</strong>
                  <Badge
                    variant={bookingData.urgencyLevel === "standard" ? "secondary" : "destructive"}
                    className="ml-2"
                  >
                    {bookingData.urgencyLevel.charAt(0).toUpperCase() + bookingData.urgencyLevel.slice(1)}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Base Service Fee</span>
              <span>${bookingData.basePrice}</span>
            </div>
            {bookingData.travelFee > 0 && (
              <div className="flex justify-between">
                <span>Travel Fee</span>
                <span>${bookingData.travelFee}</span>
              </div>
            )}
            {bookingData.urgencyFee > 0 && (
              <div className="flex justify-between">
                <span>Priority Fee</span>
                <span>${bookingData.urgencyFee}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#A52A2A]">${bookingData.totalPrice}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
