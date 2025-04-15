"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfDay, endOfDay, parseISO } from "date-fns"
import { CalendarIcon, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface CalendarSelectorProps {
  serviceType: string
  onTimeSelected: (startTime: string, endTime: string, formattedTime: string) => void
  className?: string
}

interface TimeSlot {
  startTime: string
  endTime: string
  formattedTime: string
}

export default function CalendarSelector({ serviceType, onTimeSelected, className }: CalendarSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine appointment duration based on service type
  const getDuration = () => {
    switch (serviceType) {
      case "loan-signing":
      case "reverse-mortgage":
        return 90 // 90 minutes for loan signings
      case "priority":
        return 60 // 60 minutes for priority service
      default:
        return 30 // 30 minutes for other services
    }
  }

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (!selectedDate || !serviceType) return

    const fetchAvailableSlots = async () => {
      setIsLoading(true)
      setError(null)
      setAvailableTimeSlots([])

      try {
        const startDate = format(startOfDay(selectedDate), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        const endDate = format(endOfDay(selectedDate), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        const duration = getDuration()
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        console.log(`Fetching slots for ${serviceType} on ${startDate} with duration ${duration}`)

        const response = await fetch(
          `/api/calendar/available-slots?serviceType=${serviceType}&startDate=${startDate}&endDate=${endDate}&duration=${duration}&timezone=${timezone}`,
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch available time slots")
        }

        const data = await response.json()
        console.log("API Response:", data)

        if (data.success && data.data && Array.isArray(data.data.slots)) {
          // Format the time slots for display
          const formattedSlots = data.data.slots.map((slot: any) => {
            const start = parseISO(slot.startTime)
            const end = parseISO(slot.endTime)

            return {
              startTime: slot.startTime,
              endTime: slot.endTime,
              formattedTime: format(start, "h:mm a"),
            }
          })

          setAvailableTimeSlots(formattedSlots)
        } else {
          setAvailableTimeSlots([])
          if (!data.success) {
            throw new Error(data.message || "Failed to retrieve available slots")
          }
        }
      } catch (error) {
        console.error("Error fetching available slots:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch available time slots")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [selectedDate, serviceType])

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    onTimeSelected(timeSlot.startTime, timeSlot.endTime, timeSlot.formattedTime)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Select Appointment Date</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                // Disable past dates and dates more than 60 days in the future
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const maxDate = addDays(today, 60)
                return date < today || date > maxDate
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Select Appointment Time</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#002147]" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-600">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setError(null)
                  setSelectedDate(undefined)
                }}
              >
                Try Another Date
              </Button>
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-800">No available time slots for this date. Please select another date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableTimeSlots.map((timeSlot, index) => (
                <Button
                  key={index}
                  variant={selectedTimeSlot?.startTime === timeSlot.startTime ? "default" : "outline"}
                  className={cn(
                    "flex items-center justify-center",
                    selectedTimeSlot?.startTime === timeSlot.startTime
                      ? "bg-[#002147] hover:bg-[#001a38]"
                      : "hover:bg-gray-100",
                  )}
                  onClick={() => handleTimeSlotSelect(timeSlot)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {timeSlot.formattedTime}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
