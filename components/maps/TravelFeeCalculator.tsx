'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Calculator, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { DistanceService } from '@/lib/maps/distance'

interface TravelFeeCalculatorProps {
  onFeeCalculated?: (data: {
    distance: number
    travelFee: number
    isWithinServiceArea: boolean
    address: string
  }) => void
  className?: string
}

export default function TravelFeeCalculator({ 
  onFeeCalculated, 
  className = '' 
}: TravelFeeCalculatorProps) {
  const [address, setAddress] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<{
    distance: number
    travelFee: number
    isWithinServiceArea: boolean
    warnings: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateFee = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setIsCalculating(true)
    setError(null)
    setResult(null)

    try {
      const distanceResult = await DistanceService.calculateDistance(address.trim())
      const travelFee = DistanceService.calculateTravelFee(distanceResult.distance.miles)
      
      const calculationResult = {
        distance: distanceResult.distance.miles,
        travelFee,
        isWithinServiceArea: distanceResult.isWithinServiceArea,
        warnings: distanceResult.warnings
      }
      
      setResult(calculationResult)
      
      if (onFeeCalculated) {
        onFeeCalculated({
          distance: calculationResult.distance,
          travelFee: calculationResult.travelFee,
          isWithinServiceArea: calculationResult.isWithinServiceArea,
          address: address.trim()
        })
      }
    } catch (error) {
      console.error('Error calculating travel fee:', error)
      setError('Unable to calculate travel fee. Please check the address and try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      calculateFee()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Travel Fee Calculator
        </CardTitle>
        <CardDescription>
          Calculate travel fees for locations beyond our 20-mile service area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter address (e.g., 123 Main St, Houston, TX 77001)"
            className="flex-1"
            aria-label="Enter address for travel fee calculation"
          />
          <Button 
            onClick={calculateFee}
            disabled={isCalculating || !address.trim()}
            aria-label={isCalculating ? "Calculating travel fee" : "Calculate travel fee"}
          >
            {isCalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            Calculate
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3">
            <Alert className={result.isWithinServiceArea ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
              {result.isWithinServiceArea ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Distance from Texas City (77591):</span>
                    <span>{result.distance.toFixed(1)} miles</span>
                  </div>
                  
                  {result.travelFee > 0 ? (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Travel Fee:</span>
                      <span className="text-lg font-bold">${result.travelFee.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="text-green-700 font-medium">
                      ✅ No travel fee - within 20-mile service area
                    </div>
                  )}
                  
                  {result.warnings.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <ul className="text-sm space-y-1">
                        {result.warnings.map((warning, index) => (
                          <li key={index} className="text-gray-600">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>How travel fees work:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Free service within 20 miles of Texas City, TX 77591</li>
                <li>• $0.50 per mile for distances beyond 20 miles</li>
                <li>• Maximum service area: 50 miles (special arrangements for longer distances)</li>
                <li>• Travel fee covers round-trip distance</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}