'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, MapPin, Clock, FileText, Zap, CheckCircle, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PricingBreakdown {
  base: number
  travel: number
  documents: number
  urgency: number
  total: number
}

export default function SimplePricingCalculator() {
  const [zip, setZip] = useState('')
  const [documents, setDocuments] = useState(1)
  const [urgency, setUrgency] = useState<'standard' | 'same-day' | 'urgent'>('standard')
  const [distanceBand, setDistanceBand] = useState<'0-20' | '21-30' | '31-40' | '41-50'>('0-20')
  const [pricing, setPricing] = useState<PricingBreakdown>({ base: 75, travel: 0, documents: 0, urgency: 0, total: 75 })
  const [isCalculating, setIsCalculating] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const calculatePricing = () => {
    if (!zip || zip.length !== 5) return
    setIsCalculating(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const base = 75
      let travel = 0
      if (distanceBand === '21-30') travel = 25
      if (distanceBand === '31-40') travel = 45
      if (distanceBand === '41-50') travel = 65

      const extraDocs = Math.max(0, documents - 1) * 10
      const urgencyFee = urgency === 'same-day' ? 25 : urgency === 'urgent' ? 50 : 0
      
      const newPricing = {
        base,
        travel,
        documents: extraDocs,
        urgency: urgencyFee,
        total: base + travel + extraDocs + urgencyFee
      }
      
      setPricing(newPricing)
      setShowBreakdown(true)
      setIsCalculating(false)
    }, 1000)
  }

  useEffect(() => {
    if (zip && zip.length === 5) {
      calculatePricing()
    }
  }, [zip, documents, urgency, distanceBand])

  const urgencyOptions = [
    { key: 'standard', label: 'Standard (2-3 hours)', fee: 0, color: 'bg-green-100 text-green-800' },
    { key: 'same-day', label: 'Same-day (1-2 hours)', fee: 25, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'urgent', label: 'Urgent (30-60 min)', fee: 50, color: 'bg-red-100 text-red-800' }
  ]

  return (
    <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#002147]/5 to-[#A52A2A]/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#002147]/10 rounded-lg">
            <Calculator className="h-6 w-6 text-[#002147]" />
          </div>
          <div>
            <CardTitle className="text-xl text-[#002147]">Get Instant Pricing</CardTitle>
            <p className="text-sm text-gray-600">Transparent, no hidden fees</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="space-y-4">
          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1 text-[#A52A2A]" />
              ZIP Code
            </label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="Enter your ZIP code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002147] focus:border-transparent"
              maxLength={5}
            />
          </div>

          {/* Approximate Distance from 77591 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1 text-[#A52A2A]" />
              Approximate distance from 77591
            </label>
            <select
              value={distanceBand}
              onChange={(e) => setDistanceBand(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002147] focus:border-transparent"
            >
              <option value="0-20">0–20 miles (included)</option>
              <option value="21-30">21–30 miles (+$25)</option>
              <option value="31-40">31–40 miles (+$45)</option>
              <option value="41-50">41–50 miles (+$65)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              We use simple travel zones to estimate your fee. Final pricing follows the same tiers shown on our Extras & Fees page.
            </p>
          </div>

          {/* Document Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1 text-[#A52A2A]" />
              Number of Documents
            </label>
            <select
              value={documents}
              onChange={(e) => setDocuments(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002147] focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} document{num !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1 text-[#A52A2A]" />
              Service Urgency
            </label>
            <div className="grid grid-cols-1 gap-2">
              {urgencyOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setUrgency(option.key as any)}
                  className={`p-3 text-left rounded-lg border transition-all duration-200 ${
                    urgency === option.key 
                      ? 'border-[#A52A2A] bg-[#A52A2A]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{option.label}</span>
                    <Badge className={option.color}>
                      {option.fee > 0 ? `+$${option.fee}` : 'No fee'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <Button 
          onClick={calculatePricing}
          disabled={!zip || zip.length !== 5 || isCalculating}
          className="w-full bg-[#002147] hover:bg-[#001a38] h-12"
        >
          {isCalculating ? (
            <>
              <Clock className="h-5 w-5 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-5 w-5 mr-2" />
              Calculate Price
            </>
          )}
        </Button>

        {/* Results */}
        {showBreakdown && !isCalculating && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {/* Total Price */}
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-[#A52A2A]">
                <DollarSign className="inline h-6 w-6" />
                {pricing.total}
              </div>
              <p className="text-gray-600 text-sm">Total estimated cost</p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Base service</span>
                <span>${pricing.base}</span>
              </div>
              
              {pricing.travel > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Travel fee</span>
                  <span>${pricing.travel}</span>
                </div>
              )}
              
              {pricing.documents > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Additional documents</span>
                  <span>${pricing.documents}</span>
                </div>
              )}
              
              {pricing.urgency > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Urgency fee</span>
                  <span>${pricing.urgency}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-4">
              <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000] h-12" asChild>
                <a href="/booking">
                  <Zap className="h-5 w-5 mr-2" />
                  Book This Service
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>4.9★ Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-blue-500" />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}









