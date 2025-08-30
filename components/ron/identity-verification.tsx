"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Shield, CheckCircle, AlertCircle, Camera } from "lucide-react"

interface IdentityVerificationProps {
  customerName: string
  customerEmail: string
  customerPhone: string
  onDataChange: (data: { customerName: string; customerEmail: string; customerPhone: string }) => void
  onVerificationComplete: (verified: boolean) => void
  onNext: () => void
  onBack: () => void
}

export function IdentityVerification({
  customerName,
  customerEmail,
  customerPhone,
  onDataChange,
  onVerificationComplete,
  onNext,
  onBack,
}: IdentityVerificationProps) {
  const [verificationStep, setVerificationStep] = useState<"info" | "id-upload" | "kba" | "complete">("info")
  const [idUploaded, setIdUploaded] = useState(false)
  const [kbaCompleted, setKbaCompleted] = useState(false)

  const handleInfoSubmit = () => {
    if (customerName && customerEmail && customerPhone) {
      setVerificationStep("id-upload")
    }
  }

  const handleIdUpload = () => {
    setIdUploaded(true)
    setVerificationStep("kba")
  }

  const handleKBAComplete = () => {
    setKbaCompleted(true)
    setVerificationStep("complete")
    onVerificationComplete(true)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h2>
        <p className="text-gray-600">We need to verify your identity to comply with Texas RON requirements.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[
            { id: "info", label: "Personal Info", icon: User },
            { id: "id-upload", label: "ID Upload", icon: Camera },
            { id: "kba", label: "Knowledge Check", icon: Shield },
            { id: "complete", label: "Verified", icon: CheckCircle },
          ].map((step, index) => {
            const Icon = step.icon
            const isActive = verificationStep === step.id
            const isCompleted = ["info", "id-upload", "kba"]
              .slice(0, index)
              .every(
                (s) =>
                  (s === "info" && customerName && customerEmail && customerPhone) ||
                  (s === "id-upload" && idUploaded) ||
                  (s === "kba" && kbaCompleted),
              )

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`p-2 rounded-full ${
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : isActive
                        ? "bg-[#A52A2A] text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`ml-2 text-sm ${isActive ? "font-medium" : ""}`}>{step.label}</span>
                {index < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      {verificationStep === "info" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Legal Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => onDataChange({ customerName: e.target.value, customerEmail, customerPhone })}
                  placeholder="Enter your full legal name as it appears on your ID"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email Address</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => onDataChange({ customerName, customerEmail: e.target.value, customerPhone })}
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => onDataChange({ customerName, customerEmail, customerPhone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
              <Button
                onClick={handleInfoSubmit}
                disabled={!customerName || !customerEmail || !customerPhone}
                className="w-full bg-[#A52A2A] hover:bg-[#8B1A1A]"
              >
                Continue to ID Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStep === "id-upload" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Government ID</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Take a clear photo of your government-issued ID</p>
                <div className="space-y-2">
                  <Button className="bg-[#A52A2A] hover:bg-[#8B1A1A]">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                  <p className="text-xs text-gray-500">Accepted: Driver's License, Passport, State ID</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-medium text-blue-900 mb-2">ID Photo Requirements:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Clear, well-lit photo</li>
                  <li>• All text must be readable</li>
                  <li>• No glare or shadows</li>
                  <li>• Current, unexpired ID</li>
                </ul>
              </div>

              <Button onClick={handleIdUpload} className="w-full bg-[#A52A2A] hover:bg-[#8B1A1A]">
                Continue to Knowledge Check
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStep === "kba" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge-Based Authentication</h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">Identity Verification Questions</span>
                </div>
                <p className="text-sm text-yellow-700">
                  We'll ask you a few questions based on your credit history and public records to verify your identity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded">
                  <p className="font-medium text-gray-900 mb-2">Sample Question 1:</p>
                  <p className="text-gray-600 mb-3">Which of the following addresses have you lived at?</p>
                  <div className="space-y-2">
                    {[
                      "123 Main St, Houston TX",
                      "456 Oak Ave, Dallas TX",
                      "789 Pine Rd, Austin TX",
                      "None of the above",
                    ].map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input type="radio" name="q1" className="mr-2" />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={handleKBAComplete} className="w-full bg-[#A52A2A] hover:bg-[#8B1A1A]">
                  Complete Verification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStep === "complete" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Identity Verified!</h3>
            <p className="text-gray-600 mb-4">
              Your identity has been successfully verified and meets Texas RON requirements.
            </p>
            <Badge className="bg-green-100 text-green-800 border-green-200">Verification Complete</Badge>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        {verificationStep === "complete" && (
          <Button onClick={onNext} className="bg-[#A52A2A] hover:bg-[#8B1A1A]">
            Continue to Technical Setup
          </Button>
        )}
      </div>
    </div>
  )
}
