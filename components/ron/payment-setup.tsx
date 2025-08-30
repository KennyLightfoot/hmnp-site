"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Shield, CheckCircle, DollarSign } from "lucide-react"

interface PaymentSetupProps {
  sessionData: {
    documents: File[]
    customerName: string
    customerEmail: string
    scheduledDateTime?: Date
  }
  onPaymentComplete: (sessionId: string) => void
  onBack: () => void
}

export function PaymentSetup({ sessionData, onPaymentComplete, onBack }: PaymentSetupProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate pricing based on documents
  const sessionFee = 25
  const sealFee = sessionData.documents.length * 5
  const totalAmount = sessionFee + sealFee

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate session ID
    const sessionId = `RON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    setIsProcessing(false)
    onPaymentComplete(sessionId)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment & Final Review</h2>
        <p className="text-gray-600">Review your RON session details and complete payment to proceed.</p>
      </div>

      {/* Session Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Customer Name</span>
              <span className="font-medium">{sessionData.customerName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Documents</span>
              <span className="font-medium">{sessionData.documents.length} files</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Session Type</span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {sessionData.scheduledDateTime ? "Scheduled" : "Immediate"}
              </Badge>
            </div>
            {sessionData.scheduledDateTime && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Scheduled Time</span>
                <span className="font-medium">
                  {sessionData.scheduledDateTime.toLocaleDateString()} at{" "}
                  {sessionData.scheduledDateTime.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card className="border-[#A52A2A]">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Pricing Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">RON Session Fee</span>
              <span className="font-medium">${sessionFee}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Notarial Seals ({sessionData.documents.length} × $5)</span>
              <span className="font-medium">${sealFee}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-[#A52A2A]">${totalAmount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="space-y-4">
            <div className="border-2 border-[#A52A2A] rounded-lg p-4 bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-[#A52A2A]" />
                  <span className="font-medium text-gray-900">Credit/Debit Card</span>
                </div>
                <Badge className="bg-[#A52A2A] text-white">Recommended</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">Secure payment processing with instant session activation.</p>

              {/* Mock payment form */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <div className="p-2 border rounded bg-white text-gray-500">•••• •••• •••• 4242</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry / CVC</label>
                    <div className="p-2 border rounded bg-white text-gray-500">12/25 / 123</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Stripe Secured</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <input type="checkbox" className="mt-1" defaultChecked />
            <div className="text-sm text-gray-700">
              <p className="mb-2">
                By proceeding, I agree to the{" "}
                <a href="#" className="text-[#A52A2A] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#A52A2A] hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              <p>
                I understand that this RON session will be recorded and stored for 5 years as required by Texas law.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handlePayment} disabled={isProcessing} className="bg-[#A52A2A] hover:bg-[#8B1A1A] px-8">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${totalAmount} & Start Session
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
