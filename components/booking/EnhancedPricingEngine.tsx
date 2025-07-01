"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  MapPin, 
  Clock, 
  Users, 
  FileText, 
  CreditCard, 
  Info,
  AlertTriangle,
  CheckCircle,
  Loader2,
  DollarSign,
  Navigation,
  Calendar,
  Tag
} from 'lucide-react';
import { EnhancedPricingEngine, type BookingInputs, type EnhancedPricingResult } from '@/lib/pricing/enhanced-pricing';

export interface EnhancedPricingProps {
  serviceType: string;
  numberOfSigners: number;
  numberOfDocuments: number;
  appointmentDateTime: Date;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  promoCode?: string;
  referralDiscount?: number;
  isUrgent?: boolean;
  onPricingUpdate?: (result: EnhancedPricingResult) => void;
  showBreakdown?: boolean;
  showValidation?: boolean;
  className?: string;
}

export function EnhancedPricingComponent({
  serviceType,
  numberOfSigners,
  numberOfDocuments,
  appointmentDateTime,
  location,
  promoCode,
  referralDiscount = 0,
  isUrgent = false,
  onPricingUpdate,
  showBreakdown = true,
  showValidation = true,
  className = ""
}: EnhancedPricingProps) {
  const [pricingResult, setPricingResult] = useState<EnhancedPricingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize inputs to prevent unnecessary recalculations
  const inputs = useMemo((): BookingInputs => ({
    serviceType,
    numberOfSigners,
    numberOfDocuments,
    appointmentDateTime,
    location,
    promoCode,
    referralDiscount,
    isUrgent
  }), [serviceType, numberOfSigners, numberOfDocuments, appointmentDateTime, location, promoCode, referralDiscount, isUrgent]);

  // Calculate pricing when inputs change
  useEffect(() => {
    const calculatePricing = async () => {
      if (!location.address || !location.city || !location.state || !location.zip) {
        return; // Don't calculate without complete address
      }

      setIsCalculating(true);
      setError(null);

      try {
        const result = await EnhancedPricingEngine.calculatePricing(inputs);
        setPricingResult(result);
        onPricingUpdate?.(result);

        if (!result.success) {
          setError('Unable to calculate pricing for this location and service combination');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Pricing calculation failed';
        setError(errorMessage);
        console.error('Pricing calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    calculatePricing();
  }, [inputs, onPricingUpdate]);

  if (isCalculating) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Calculating pricing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !pricingResult) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Please complete all booking details to see pricing'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { pricing, validation, serviceDetails } = pricingResult;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Validation Messages */}
      {showValidation && (validation.blockingIssues.length > 0 || validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.blockingIssues.map((issue, index) => (
            <Alert key={`blocking-${index}`} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{issue}</AlertDescription>
            </Alert>
          ))}
          
          {validation.errors.map((error, index) => (
            <Alert key={`error-${index}`} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
          
          {validation.warnings.map((warning, index) => (
            <Alert key={`warning-${index}`}>
              <Info className="h-4 w-4" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}
          
          {validation.recommendations.map((rec, index) => (
            <Alert key={`rec-${index}`} className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">{rec}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Pricing Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pricing Summary
              </CardTitle>
              <CardDescription>{serviceDetails.name}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${pricing.total.toFixed(2)}
              </div>
              {pricing.depositRequired && (
                <div className="text-sm text-muted-foreground">
                  ${pricing.depositAmount.toFixed(2)} deposit required
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Base Price</div>
                <div className="font-semibold">${pricing.basePrice.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Distance</div>
                <div className="font-semibold">{pricing.locationFees.distance.toFixed(1)} mi</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">Signers</div>
                <div className="font-semibold">{numberOfSigners}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {pricing.timeSurcharges.isWeekend ? 'Weekend' : 
                   pricing.timeSurcharges.isAfterHours ? 'After Hours' : 'Regular Hours'}
                </div>
                <div className="font-semibold">
                  {appointmentDateTime.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {showBreakdown && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Pricing Breakdown</h4>
                
                {/* Base Service */}
                <div className="flex justify-between text-sm">
                  <span>{serviceDetails.name}</span>
                  <span>${pricing.basePrice.toFixed(2)}</span>
                </div>

                {/* Signer Fees */}
                {pricing.signerFees.totalSignerFees > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>
                      Additional Signers ({pricing.signerFees.additionalSigners} × ${pricing.signerFees.additionalSignerFee})
                    </span>
                    <span>${pricing.signerFees.totalSignerFees.toFixed(2)}</span>
                  </div>
                )}

                {/* Time Surcharges */}
                {pricing.timeSurcharges.weekendSurcharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Weekend Surcharge</span>
                    <span>${pricing.timeSurcharges.weekendSurcharge.toFixed(2)}</span>
                  </div>
                )}

                {pricing.timeSurcharges.afterHoursSurcharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>After Hours Surcharge</span>
                    <span>${pricing.timeSurcharges.afterHoursSurcharge.toFixed(2)}</span>
                  </div>
                )}

                {/* Travel Fee */}
                {pricing.locationFees.travelFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>
                      Travel Fee ({pricing.locationFees.distance.toFixed(1)} miles)
                    </span>
                    <span>${pricing.locationFees.travelFee.toFixed(2)}</span>
                  </div>
                )}

                {/* Discounts */}
                {pricing.discounts.totalDiscounts > 0 && (
                  <>
                    <Separator />
                    {pricing.discounts.promoCodeDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promo Code Discount</span>
                        <span>-${pricing.discounts.promoCodeDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.discounts.referralDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Referral Discount</span>
                        <span>-${pricing.discounts.referralDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                <Separator />
                
                {/* Subtotal */}
                <div className="flex justify-between text-sm font-semibold">
                  <span>Subtotal</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>

                {/* Tax */}
                {pricing.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${pricing.tax.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>

                {/* Payment Breakdown */}
                {pricing.depositRequired && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold mb-2">Payment Schedule</div>
                    <div className="flex justify-between text-sm">
                      <span>Deposit (50%)</span>
                      <span>${pricing.depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Balance Due at Service</span>
                      <span>${pricing.balanceDue.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Service Area Status */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              {pricing.locationFees.isWithinServiceArea ? (
                <span className="text-green-600 font-medium">✓ Within Service Area</span>
              ) : (
                <span className="text-orange-600 font-medium">⚠ Extended Service Area</span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedPricingComponent;