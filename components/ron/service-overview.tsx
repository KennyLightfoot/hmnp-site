"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, DollarSign, Shield, Video, FileText } from "lucide-react"

interface ServiceOverviewProps {
  onNext: () => void
}

export function ServiceOverview({ onNext }: ServiceOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Remote Online Notarization (RON)</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get your documents notarized securely from anywhere using our Texas-compliant remote notarization platform.
          Available 24/7 with instant session setup.
        </p>
      </div>

      {/* Pricing Card */}
      <Card className="border-2 border-[#A52A2A] bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">RON Service Pricing</h3>
              <p className="text-gray-600">Transparent, all-inclusive pricing</p>
            </div>
            <Badge className="bg-[#A52A2A] text-white">24/7 Available</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">$25 per session</p>
                <p className="text-sm text-gray-600">Base session fee</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">$5 per seal</p>
                <p className="text-sm text-gray-600">Per notarial act</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-700">
              <strong>Example:</strong> 1 signer, 2 documents = $25 (session) + $10 (2 seals) ={" "}
              <strong>$35 total</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Security & Compliance
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Texas RON law compliant
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                End-to-end encryption
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Identity verification & KBA
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                5-year session recording retention
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Video className="w-5 h-5 mr-2 text-blue-600" />
              Session Features
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                HD video & audio recording
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Real-time document collaboration
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Electronic seal application
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Instant document delivery
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Need</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Valid government-issued photo ID
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Computer/device with camera & microphone
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Reliable internet connection
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Documents ready for signing (unsigned)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button onClick={onNext} className="bg-[#A52A2A] hover:bg-[#8B1A1A] text-white px-8 py-3 text-lg">
          Start RON Session Setup
        </Button>
        <p className="text-sm text-gray-500 mt-2">Setup takes 5-10 minutes • Available 24/7</p>
      </div>
    </div>
  )
}
