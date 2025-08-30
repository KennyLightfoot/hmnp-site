"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Zap } from "lucide-react"

interface SessionSchedulingProps {
  onSchedule: (dateTime: Date) => void
  onNext: () => void
  onBack: () => void
}

export function SessionScheduling({ onSchedule, onNext, onBack }: SessionSchedulingProps) {
  const [selectedOption, setSelectedOption] = useState<"now" | "scheduled" | null>(null)
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)

  const handleScheduleNow = () => {
    const now = new Date()
    setSelectedDateTime(now)
    onSchedule(now)
    setSelectedOption("now")
  }

  const handleScheduleLater = () => {
    // For demo purposes, set to tomorrow at 2 PM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)
    setSelectedDateTime(tomorrow)
    onSchedule(tomorrow)
    setSelectedOption("scheduled")
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your RON Session</h2>
        <p className="text-gray-600">Choose when you'd like to complete your remote notarization session.</p>
      </div>

      {/* Scheduling Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Now Option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedOption === "now" ? "ring-2 ring-[#A52A2A] bg-red-50" : ""
          }`}
          onClick={handleScheduleNow}
        >
          <CardContent className="p-6 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedOption === "now" ? "bg-[#A52A2A] text-white" : "bg-green-100 text-green-600"
              }`}
            >
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Now</h3>
            <p className="text-gray-600 mb-4">Begin your RON session immediately. Perfect for urgent documents.</p>
            <Badge className="bg-green-100 text-green-800 border-green-200">Available 24/7</Badge>
            <div className="mt-4 text-2xl font-bold text-[#A52A2A]">Immediate</div>
          </CardContent>
        </Card>

        {/* Schedule Later Option */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedOption === "scheduled" ? "ring-2 ring-[#A52A2A] bg-red-50" : ""
          }`}
          onClick={handleScheduleLater}
        >
          <CardContent className="p-6 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedOption === "scheduled" ? "bg-[#A52A2A] text-white" : "bg-blue-100 text-blue-600"
              }`}
            >
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule Later</h3>
            <p className="text-gray-600 mb-4">Choose a convenient time for your RON session.</p>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Flexible Timing</Badge>
            <div className="mt-4 text-2xl font-bold text-[#A52A2A]">Your Choice</div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Option Details */}
      {selectedOption && (
        <Card className="border-[#A52A2A] bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedOption === "now" ? "Immediate Session" : "Scheduled Session"}
              </h3>
              <Badge className="bg-[#A52A2A] text-white">Selected</Badge>
            </div>

            {selectedOption === "now" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Session will begin immediately after payment</span>
                </div>
                <div className="bg-white border border-red-200 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>What happens next:</strong> After payment confirmation, you'll be redirected to the secure
                    RON platform where a notary will join you within 2-3 minutes.
                  </p>
                </div>
              </div>
            )}

            {selectedOption === "scheduled" && selectedDateTime && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">
                    Scheduled for: {selectedDateTime.toLocaleDateString()} at {selectedDateTime.toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-white border border-red-200 rounded p-3">
                  <p className="text-sm text-gray-700">
                    <strong>What happens next:</strong> You'll receive email and SMS reminders 24 hours and 1 hour
                    before your scheduled session.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* RON Session Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                Sessions typically last 15-30 minutes
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <Calendar className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                Available 24/7, including weekends
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-gray-700">
                <Zap className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                Immediate document delivery
              </li>
              <li className="flex items-start text-sm text-gray-700">
                <Calendar className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                Session recordings stored for 5 years
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        {selectedOption && (
          <Button onClick={onNext} className="bg-[#A52A2A] hover:bg-[#8B1A1A]">
            Continue to Payment
          </Button>
        )}
      </div>
    </div>
  )
}
