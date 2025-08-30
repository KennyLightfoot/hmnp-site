"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import type { BookingData } from "./booking-form"
import { getAvailableSlots, isWithinBusinessHours, isHoliday, type AvailabilitySlot } from "@/lib/calendar-integration"

interface DateTimeSelectionProps {
  bookingData: BookingData
  updateBookingData: (updates: Partial<BookingData>) => void
}

export function DateTimeSelection({ bookingData, updateBookingData }: DateTimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(bookingData.scheduledDateTime || undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)

  // Load available slots when date or service changes
  useEffect(() => {
    if (selectedDate && bookingData.serviceId) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate, bookingData.serviceId])

  const loadAvailableSlots = async (date: Date) => {
    setIsLoadingSlots(true)
    setSlotsError(null)

    try {
      const slots = await getAvailableSlots(bookingData.serviceId, date, 60)
      setAvailableSlots(slots)
    } catch (error) {
      console.error("Failed to load available slots:", error)
      setSlotsError("Unable to load available time slots. Please try again.")
      setAvailableSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime("") // Reset time selection when date changes

    if (date && selectedTime) {
      const [hours, minutes] = selectedTime.split(":")
      const dateTime = new Date(date)
      dateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))
      updateBookingData({ scheduledDateTime: dateTime })
    } else {
      updateBookingData({ scheduledDateTime: null })
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDate && time) {
      const [hours, minutes] = time.split(":")
      const dateTime = new Date(selectedDate)
      dateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))
      updateBookingData({ scheduledDateTime: dateTime })
    }
  }

  const handleUrgencyChange = (urgency: "standard" | "priority" | "emergency") => {
    const urgencyFees = {
      standard: 0,
      priority: 25,
      emergency: 50,
    }

    updateBookingData({
      urgencyLevel: urgency,
      urgencyFee: urgencyFees[urgency],
      totalPrice: bookingData.basePrice + bookingData.travelFee + urgencyFees[urgency],
    })
  }

  // Filter available time slots
  const availableTimeSlots = availableSlots
    .filter((slot) => slot.available)
    .map((slot) => ({
      value: slot.time,
      display: new Date(`2000-01-01T${slot.time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      slot,
    }))

  // Disable dates based on business rules
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Disable past dates
    if (date < today) return true

    // Check if within business hours for the service
    if (!isWithinBusinessHours(date, bookingData.serviceId)) {
      return true
    }

    // Check for holidays (optional - you might still serve on holidays with premium pricing)
    if (isHoliday(date) && bookingData.serviceId !== "extended-hours") {
      return true
    }

    return false
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Your Appointment</h2>

      <div className="grid gap-6">
        <div>
          <Label className="text-base font-medium mb-4 block">Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border"
          />

          {selectedDate && isHoliday(selectedDate) && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>This is a holiday. Additional fees may apply for holiday service.</AlertDescription>
            </Alert>
          )}
        </div>

        {selectedDate && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="time-select">Available Times</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAvailableSlots(selectedDate)}
                disabled={isLoadingSlots}
              >
                {isLoadingSlots ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </Button>
            </div>

            {isLoadingSlots && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Loading available time slots...</AlertDescription>
              </Alert>
            )}

            {slotsError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{slotsError}</AlertDescription>
              </Alert>
            )}

            {!isLoadingSlots && !slotsError && (
              <>
                {availableTimeSlots.length > 0 ? (
                  <Select value={selectedTime} onValueChange={handleTimeSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose appointment time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No available time slots for this date. Please select a different date or contact us directly.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="urgency-select">Service Priority</Label>
          <Select value={bookingData.urgencyLevel} onValueChange={handleUrgencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">
                <div className="flex justify-between items-center w-full">
                  <span>Standard (No rush)</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </SelectItem>
              <SelectItem value="priority">
                <div className="flex justify-between items-center w-full">
                  <span>Priority (Same day)</span>
                  <span className="text-orange-600 font-medium">+$25</span>
                </div>
              </SelectItem>
              <SelectItem value="emergency">
                <div className="flex justify-between items-center w-full">
                  <span>Emergency (ASAP)</span>
                  <span className="text-red-600 font-medium">+$50</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {bookingData.urgencyLevel !== "standard" && (
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {bookingData.urgencyLevel === "priority"
                ? "Priority service includes same-day scheduling when available."
                : "Emergency service prioritizes your appointment and includes expedited processing."}
            </AlertDescription>
          </Alert>
        )}

        {bookingData.scheduledDateTime && (
          <Alert className="border-green-200 bg-green-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Appointment scheduled for:</strong>
              <br />
              {bookingData.scheduledDateTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {bookingData.scheduledDateTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
