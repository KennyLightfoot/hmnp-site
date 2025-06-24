"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  MapPin, 
  Clock, 
  Users, 
  FileText, 
  CreditCard, 
  Info,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { PricingUtils } from '@/lib/pricing-utils';
import { calculateTotalPrice, calculateTravelFee, RON_FEES, calculateTexasCompliantRONPrice } from '@/lib/pricing';

export interface ServiceData {
  id: string;
  name: string;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
  duration?: number;
}

export interface PricingInputs {
  service?: ServiceData;
  numberOfSigners: number;
  distance: number;
  extraDocuments: number;
  isWeekend: boolean;
  isHoliday: boolean;
  isAfterHours: boolean;
  needsOvernightHandling: boolean;
  needsBilingualService: boolean;
  promoCode?: string;
  urgencyLevel?: 'standard' | 'same-day' | 'emergency';
}

interface RealTimePricingProps {
  inputs: PricingInputs;
  onPricingCalculated?: (pricing: PricingCalculation) => void;
  showBreakdown?: boolean;
  className?: string;
}

export interface PricingCalculation {
  basePrice: number;
  extraSignersFee: number;
  travelFee: number;
  weekendHolidayFee: number;
  afterHoursFee: number;
  extraDocumentsFee: number;
  overnightHandlingFee: number;
  bilingualFee: number;
  urgencyFee: number;
  subtotal: number;
  promoDiscount: number;
  finalPrice: number;
  depositAmount: number;
  paymentDue: number;
  currency: string;
  breakdown: string[];
  paymentType: 'deposit' | 'full' | 'none';
}

export default function RealTimePricing({ 
  inputs, 
  onPricingCalculated,
  showBreakdown = true,
  className = ""
}: RealTimePricingProps) {
  const [promoValidation, setPromoValidation] = useState<{
    isValid: boolean;
    discount: number;
    error?: string;
  } | null>(null);

  // Calculate travel fee based on distance
  const calculateTravelFee = (distance: number): number => {
    const freeRadius = 15; // 15 miles free
    const ratePerMile = 0.50;
    return distance > freeRadius ? (distance - freeRadius) * ratePerMile : 0;
  };

  // Calculate pricing based on inputs
  const pricing = useMemo((): PricingCalculation => {
    if (!inputs.service) {
      return {
        basePrice: 0,
        extraSignersFee: 0,
        travelFee: 0,
        weekendHolidayFee: 0,
        afterHoursFee: 0,
        extraDocumentsFee: 0,
        overnightHandlingFee: 0,
        bilingualFee: 0,
        urgencyFee: 0,
        subtotal: 0,
        promoDiscount: 0,
        finalPrice: 0,
        depositAmount: 0,
        paymentDue: 0,
        currency: 'USD',
        breakdown: [],
        paymentType: 'none'
      };
    }

    const service = inputs.service;
    
    // Check if this is a RON service
    const isRONService = service.name.toLowerCase().includes('ron') || 
                        service.name.toLowerCase().includes('remote online');
    
    let basePrice = service.price;
    let extraSignersFee = 0;
    let breakdown: string[] = [];
    
    if (isRONService) {
      // Use Texas-compliant RON pricing
      const ronPricing = calculateTexasCompliantRONPrice(1, 'acknowledgment', inputs.numberOfSigners);
      basePrice = ronPricing.totalFee;
      extraSignersFee = 0; // Already included in RON calculation
      
      // Add RON-specific breakdown
      breakdown.push(`${service.name}: $${basePrice.toFixed(2)} (TX Compliant)`);
      breakdown.push(`  - RON Service Fee: $${ronPricing.ronServiceFee.toFixed(2)}`);
      breakdown.push(`  - Notarial Act Fee: $${ronPricing.notarialActFee.toFixed(2)}`);
      if (inputs.numberOfSigners > 1) {
        breakdown.push(`  - Includes ${inputs.numberOfSigners} signers`);
      }
    } else {
      // Use standard mobile notary pricing
      extraSignersFee = Math.max(0, inputs.numberOfSigners - 1) * 10;
      if (basePrice > 0) breakdown.push(`${service.name}: $${basePrice}`);
      if (extraSignersFee > 0) breakdown.push(`Additional signers (${inputs.numberOfSigners - 1}): $${extraSignersFee}`);
    }

    // Calculate additional fees (RON services don't have travel fees)
    const travelFee = isRONService ? 0 : calculateTravelFee(inputs.distance);
    const weekendHolidayFee = (inputs.isWeekend || inputs.isHoliday) ? 40 : 0;
    const afterHoursFee = inputs.isAfterHours ? 30 : 0;
    const extraDocumentsFee = isRONService ? 0 : inputs.extraDocuments * 5; // RON docs handled separately
    const overnightHandlingFee = inputs.needsOvernightHandling ? 35 : 0;
    const bilingualFee = inputs.needsBilingualService ? 20 : 0;
    
    // Urgency fee
    let urgencyFee = 0;
    if (inputs.urgencyLevel === 'same-day') urgencyFee = 25;
    if (inputs.urgencyLevel === 'emergency') urgencyFee = 50;

    const subtotal = basePrice + extraSignersFee + travelFee + weekendHolidayFee + 
                     afterHoursFee + extraDocumentsFee + overnightHandlingFee + 
                     bilingualFee + urgencyFee;

    const promoDiscount = promoValidation?.isValid ? promoValidation.discount : 0;
    const finalPrice = Math.max(0, subtotal - promoDiscount);

    const depositAmount = service.requiresDeposit ? service.depositAmount : 0;
    const paymentType: 'deposit' | 'full' | 'none' = 
      finalPrice === 0 ? 'none' : 
      service.requiresDeposit ? 'deposit' : 'full';
    const paymentDue = paymentType === 'deposit' ? depositAmount : finalPrice;

    // Continue with existing breakdown logic for non-RON fees
    if (!isRONService && extraSignersFee > 0) {
      breakdown.push(`Additional signers (${inputs.numberOfSigners - 1}): $${extraSignersFee}`);
    }
    if (travelFee > 0) breakdown.push(`Travel (${inputs.distance.toFixed(1)} miles): $${travelFee.toFixed(2)}`);
    if (weekendHolidayFee > 0) breakdown.push(`Weekend/Holiday: $${weekendHolidayFee}`);
    if (afterHoursFee > 0) breakdown.push(`After hours: $${afterHoursFee}`);
    if (extraDocumentsFee > 0) breakdown.push(`Extra documents (${inputs.extraDocuments}): $${extraDocumentsFee}`);
    if (overnightHandlingFee > 0) breakdown.push(`Overnight handling: $${overnightHandlingFee}`);
    if (bilingualFee > 0) breakdown.push(`Bilingual service: $${bilingualFee}`);
    if (urgencyFee > 0) breakdown.push(`${inputs.urgencyLevel} service: $${urgencyFee}`);
    if (promoDiscount > 0) breakdown.push(`Promo discount: -$${promoDiscount.toFixed(2)}`);

    return {
      basePrice,
      extraSignersFee,
      travelFee: Number(travelFee.toFixed(2)),
      weekendHolidayFee,
      afterHoursFee,
      extraDocumentsFee,
      overnightHandlingFee,
      bilingualFee,
      urgencyFee,
      subtotal,
      promoDiscount,
      finalPrice,
      depositAmount,
      paymentDue,
      currency: 'USD',
      breakdown,
      paymentType
    };
  }, [inputs, promoValidation]);

  // Validate promo code when it changes
  useEffect(() => {
    if (inputs.promoCode && inputs.promoCode.trim() && inputs.service) {
      validatePromoCode(inputs.promoCode.trim());
    } else {
      setPromoValidation(null);
    }
  }, [inputs.promoCode, inputs.service]);

  // Notify parent of pricing changes
  useEffect(() => {
    onPricingCalculated?.(pricing);
  }, [pricing, onPricingCalculated]);

  const validatePromoCode = async (code: string) => {
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          serviceId: inputs.service?.id,
          originalAmount: pricing.subtotal,
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPromoValidation(result);
      } else {
        const errorData = await response.json();
        setPromoValidation({ 
          isValid: false, 
          discount: 0, 
          error: errorData.error || 'Invalid promo code' 
        });
      }
    } catch (error) {
      setPromoValidation({ 
        isValid: false, 
        discount: 0, 
        error: 'Failed to validate promo code' 
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTravelWarning = () => {
    if (inputs.distance > 25) {
      return {
        type: 'error' as const,
        message: `Service area exceeded. We typically serve within 25 miles of Houston. Additional coordination may be required for ${inputs.distance.toFixed(1)} mile distance.`
      };
    }
    if (inputs.distance > 15) {
      return {
        type: 'warning' as const,
        message: `Travel fee applies for distances beyond 15 miles. ${formatCurrency(pricing.travelFee)} added for ${inputs.distance.toFixed(1)} mile distance.`
      };
    }
    return null;
  };

  const travelWarning = getTravelWarning();

  if (!inputs.service) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Calculator className="h-5 w-5" />
            <span>Select a service to see pricing</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#A52A2A]" />
            <CardTitle className="text-lg">Live Quote</CardTitle>
          </div>
          {pricing.finalPrice > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Updated
            </Badge>
          )}
        </div>
        <CardDescription>
          Pricing updates automatically as you enter details
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Travel Warning */}
        {travelWarning && (
          <Alert className={`${
            travelWarning.type === 'error' 
              ? 'border-red-200 bg-red-50' 
              : 'border-orange-200 bg-orange-50'
          }`}>
            {travelWarning.type === 'error' ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <Info className="h-4 w-4 text-orange-600" />
            )}
            <AlertDescription className={`${
              travelWarning.type === 'error' ? 'text-red-800' : 'text-orange-800'
            }`}>
              {travelWarning.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Promo Code Validation */}
        {inputs.promoCode && promoValidation && (
          <Alert className={`${
            promoValidation.isValid 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            {promoValidation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={`${
              promoValidation.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {promoValidation.isValid 
                ? `Promo code applied! Save ${formatCurrency(promoValidation.discount)}`
                : promoValidation.error
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Breakdown */}
        {showBreakdown && pricing.breakdown.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Pricing Breakdown</h4>
            <div className="space-y-1">
              {pricing.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.split(':')[0]}</span>
                  <span className="text-gray-900">{item.split(':')[1]}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
          </div>
        )}

        {/* Total and Payment Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-medium">Total:</span>
            <span className="text-xl font-bold text-[#A52A2A]">
              {formatCurrency(pricing.finalPrice)}
            </span>
          </div>

          {pricing.paymentType === 'deposit' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Deposit Required
                </span>
              </div>
              <div className="space-y-1 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>Pay now (deposit):</span>
                  <span className="font-medium">{formatCurrency(pricing.depositAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining balance:</span>
                  <span className="font-medium">
                    {formatCurrency(pricing.finalPrice - pricing.depositAmount)}
                  </span>
                </div>
                <p className="text-xs mt-2">
                  Remaining balance due at time of service
                </p>
              </div>
            </div>
          )}

          {pricing.paymentType === 'full' && pricing.finalPrice > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Full Payment
                </span>
              </div>
              <p className="text-sm text-green-700">
                Complete payment due: {formatCurrency(pricing.finalPrice)}
              </p>
            </div>
          )}
        </div>

        {/* Service Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{inputs.numberOfSigners} signer{inputs.numberOfSigners !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{inputs.distance.toFixed(1)} miles</span>
            </div>
            {inputs.service.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>~{inputs.service.duration} min</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 