"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VideoQualityTest } from "./video-quality-test"

interface TechnicalSetupProps {
  onTestComplete: (passed: boolean) => void
  onNext: () => void
  onBack: () => void
}

export function TechnicalSetup({ onTestComplete, onNext, onBack }: TechnicalSetupProps) {
  const [allTestsPassed, setAllTestsPassed] = useState(false)

  const handleTestComplete = (passed: boolean) => {
    setAllTestsPassed(passed)
    onTestComplete(passed)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical Setup Test</h2>
        <p className="text-gray-600">We'll test your device to ensure it meets the requirements for RON sessions.</p>
      </div>

      <VideoQualityTest onTestComplete={handleTestComplete} />

      {/* Success Message */}
      {allTestsPassed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Tests Passed!</h3>
            <p className="text-gray-600">
              Your device meets all requirements for RON sessions. You're ready to proceed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        {allTestsPassed && (
          <Button onClick={onNext} className="bg-[#A52A2A] hover:bg-[#8B1A1A]">
            Continue to Scheduling
          </Button>
        )}
      </div>
    </div>
  )
}
