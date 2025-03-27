"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Phone } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { scheduleCall } from "@/app/actions/submit-form"

export function CallScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime || !name || !phone) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Format date for submission
      const formattedDate = format(selectedDate, "yyyy-MM-dd")

      // Create FormData object
      const formData = new FormData()
      formData.append("name", name)
      formData.append("phone", phone)
      formData.append("date", formattedDate)
      formData.append("time", selectedTime)

      // Submit to server action
      const result = await scheduleCall(formData)

      if (result.success) {
        setSuccess(true)

        // Reset form after 3 seconds
        setTimeout(() => {
          setSelectedDate(undefined)
          setSelectedTime("")
          setName("")
          setPhone("")
          setSuccess(false)
        }, 3000)
      } else {
        setError(result.errors?._form || "Failed to schedule call. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    "9:00",
    "9:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  return (
    <div className="bg-secondary/10 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Phone className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-lg font-semibold text-accent">Schedule a Call</h3>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <p className="text-green-800 font-medium">Call scheduled successfully!</p>
          <p className="text-green-700 text-sm mt-1">
            We'll call you on {format(selectedDate!, "MMMM d, yyyy")} at {selectedTime}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md border border-destructive">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                    className="[&_.rdp-day_button:focus]:bg-primary [&_.rdp-day_button:hover]:bg-primary/10 [&_.rdp-day_button[aria-selected='true']]:bg-primary"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {Number.parseInt(time.split(":")[0]) > 12
                        ? `${Number.parseInt(time.split(":")[0]) - 12}:${time.split(":")[1]} PM`
                        : `${time} AM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedDate || !selectedTime || !name || !phone || loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Scheduling...</span>
              </>
            ) : (
              "Schedule Call"
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

