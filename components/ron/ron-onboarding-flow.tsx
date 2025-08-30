"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Shield, Video, FileText, User, CreditCard } from "lucide-react"
import { ServiceOverview } from "./service-overview"
import { DocumentUpload } from "./document-upload"
import { IdentityVerification } from "./identity-verification"
import { TechnicalSetup } from "./technical-setup"
import { SessionScheduling } from "./session-scheduling"
import { PaymentSetup } from "./payment-setup"

type OnboardingStep = "overview" | "documents" | "identity" | "technical" | "scheduling" | "payment" | "complete"

interface RONSessionData {
  documents: File[]
  customerName: string
  customerEmail: string
  customerPhone: string
  idVerified: boolean
  technicalTestPassed: boolean
  scheduledDateTime?: Date
  paymentSetup: boolean
  sessionId?: string
}

const STEPS = [
  { id: "overview", title: "Service Overview", icon: FileText },
  { id: "documents", title: "Upload Documents", icon: FileText },
  { id: "identity", title: "Identity Verification", icon: User },
  { id: "technical", title: "Technical Setup", icon: Video },
  { id: "scheduling", title: "Schedule Session", icon: Clock },
  { id: "payment", title: "Payment Setup", icon: CreditCard },
]

export function RONOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("overview")
  const [sessionData, setSessionData] = useState<RONSessionData>({
    documents: [],
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    idVerified: false,
    technicalTestPassed: false,
    paymentSetup: false,
  })

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  const updateSessionData = (updates: Partial<RONSessionData>) => {
    setSessionData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    const stepOrder: OnboardingStep[] = [
      "overview",
      "documents",
      "identity",
      "technical",
      "scheduling",
      "payment",
      "complete",
    ]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const stepOrder: OnboardingStep[] = [
      "overview",
      "documents",
      "identity",
      "technical",
      "scheduling",
      "payment",
      "complete",
    ]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl">RON Session Setup</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              24/7 Available
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between mt-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index < currentStepIndex
              const isCurrent = step.id === currentStep

              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div
                    className={`p-2 rounded-full ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : isCurrent
                          ? "bg-[#A52A2A] text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs text-center ${isCurrent ? "text-[#A52A2A] font-medium" : "text-gray-500"}`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === "overview" && <ServiceOverview onNext={nextStep} />}

          {currentStep === "documents" && (
            <DocumentUpload
              documents={sessionData.documents}
              onDocumentsChange={(documents) => updateSessionData({ documents })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "identity" && (
            <IdentityVerification
              customerName={sessionData.customerName}
              customerEmail={sessionData.customerEmail}
              customerPhone={sessionData.customerPhone}
              onDataChange={(data) => updateSessionData(data)}
              onVerificationComplete={(verified) => updateSessionData({ idVerified: verified })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "technical" && (
            <TechnicalSetup
              onTestComplete={(passed) => updateSessionData({ technicalTestPassed: passed })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "scheduling" && (
            <SessionScheduling
              onSchedule={(dateTime) => updateSessionData({ scheduledDateTime: dateTime })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "payment" && (
            <PaymentSetup
              sessionData={sessionData}
              onPaymentComplete={(sessionId) => {
                updateSessionData({ paymentSetup: true, sessionId })
                setCurrentStep("complete")
              }}
              onBack={prevStep}
            />
          )}

          {currentStep === "complete" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">RON Session Ready!</h3>
                <p className="text-gray-600 mb-4">Your remote notarization session has been set up successfully.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Session Details</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>Session ID:</strong> {sessionData.sessionId}
                    </p>
                    <p>
                      <strong>Documents:</strong> {sessionData.documents.length} uploaded
                    </p>
                    {sessionData.scheduledDateTime && (
                      <p>
                        <strong>Scheduled:</strong> {sessionData.scheduledDateTime.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-[#A52A2A] hover:bg-[#8B1A1A]">Join Session Now</Button>
                  <Button variant="outline">View Session Details</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
          <Shield className="w-8 h-8 text-green-600" />
          <div>
            <h4 className="font-semibold text-gray-900">Texas Compliant</h4>
            <p className="text-sm text-gray-600">Fully compliant with Texas RON laws</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
          <Video className="w-8 h-8 text-blue-600" />
          <div>
            <h4 className="font-semibold text-gray-900">Secure Platform</h4>
            <p className="text-sm text-gray-600">End-to-end encrypted sessions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
          <Clock className="w-8 h-8 text-purple-600" />
          <div>
            <h4 className="font-semibold text-gray-900">24/7 Available</h4>
            <p className="text-sm text-gray-600">Schedule anytime, day or night</p>
          </div>
        </div>
      </div>
    </div>
  )
}
