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
import { calculateTotalPrice, calculateTravelFee, RON_FEES, calculateTexasCompliantRONPrice, BASE_PRICES, ADDITIONAL_FEES } from '@/lib/pricing';

export interface ServiceData {
  id: string;
  name: string;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
  duration?: number;
  serviceType?: string;
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

  // Calculate travel fee based on distance (SOP: 15-mile base radius from 77591, $0.50/mile beyond)
  const calculateTravelFee = (distance: number): number => {
    const freeRadius = 15; // 15-mile base radius from ZIP 77591 per SOP
    const ratePerMile = 0.50; // $0.50/mile beyond base radius per SOP
    return distance > freeRadius ? (distance - freeRadius) * ratePerMile : 0;
  };

  // Calculate pricing based on inputs - Updated for SOP v2.0
  const pricing = useMemo((): PricingCalculation => {
    if (!inputs.Service) {
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

    const service = inputs.Service;
    
    // Check if this is a RON service
    const isRONService = service.name.toLowerCase().includes('ron') || 
                        service.name.toLowerCase().includes('remote online');
    
    // Check for Quick-Stamp Local service
    const isQuickStampLocal = service.name.toLowerCase().includes('quick-stamp') ||
                             service.name.toLowerCase().includes('quick stamp');
    
    let basePrice = service.price;
    let extraSignersFee = 0;
    let breakdown: string[] = [];
    
    // Handle RON pricing per SOP
    if (isRONService) {
      // RON: $25/session + $5/seal per SOP
      const sessionFee = 25; // Base session fee per SOP
      const sealFee = inputs.numberOfSigners * 5; // $5 per signer/seal per SOP
      basePrice = sessionFee + sealFee;
      breakdown.push(`RON Session: $${sessionFee}`);
      breakdown.push(`Notary Seals (${inputs.numberOfSigners}): $${sealFee}`);
    }
    // Handle Quick-Stamp Local pricing per SOP  
    else if (isQuickStampLocal) {
      // Quick-Stamp Local: $50 base (1 signer, ≤2 stamps, ≤10 mi travel)
      basePrice = 50;
      breakdown.push(`Quick-Stamp Local Base: $${basePrice}`);
      
      // Extra signers: $10 each (base covers 1 signer)
      if (inputs.numberOfSigners > 1) {
        extraSignersFee = (inputs.numberOfSigners - 1) * 10;
        breakdown.push(`Extra signers (${inputs.numberOfSigners - 1}): $${extraSignersFee}`);
      }
      
      // Note: Stamp count logic would need to be added to inputs interface
      // For now, assuming standard stamp count
    }
    // Handle other services per SOP
    else {
      // Standard Notary: Base covers up to 2 signers, $5 each additional
      // Extended Hours: Base covers up to 2 signers, $5 each additional  
      // Loan Signing: Base covers up to 4 signers, $10 each additional
      
      const serviceName = service.name.toLowerCase();
      
      if (serviceName.includes('standard')) {
        // Standard Notary: $75 base, covers 2 signers, $5 each extra
        if (inputs.numberOfSigners > 2) {
          extraSignersFee = (inputs.numberOfSigners - 2) * 5;
          breakdown.push(`Extra signers (${inputs.numberOfSigners - 2}): $${extraSignersFee}`);
        }
        
        // Extra documents: $10 each beyond 4 docs
        if (inputs.extraDocuments > 0) {
          const extraDocFee = inputs.extraDocuments * 10;
          breakdown.push(`Extra documents (${inputs.extraDocuments}): $${extraDocFee}`);
        }
      }
      else if (serviceName.includes('extended')) {
        // Extended Hours: $100 base, covers 2 signers, $5 each extra  
        if (inputs.numberOfSigners > 2) {
          extraSignersFee = (inputs.numberOfSigners - 2) * 5;
          breakdown.push(`Extra signers (${inputs.numberOfSigners - 2}): $${extraSignersFee}`);
        }
        
        // Same-day service after 3 pm: +$25
        if (inputs.urgencyLevel === 'same-day') {
          const sameDayFee = 25;
          breakdown.push(`Same-day Service: $${sameDayFee}`);
        }
        
        // After-hours service (9 pm – 7 am): +$50
        if (inputs.isAfterHours) {
          const afterHoursFee = 50;
          breakdown.push(`After-hours Service: $${afterHoursFee}`);
        }
      }
      else if (serviceName.includes('loan')) {
        // Loan Signing: $150 flat fee, covers 4 signers
        if (inputs.numberOfSigners > 4) {
          extraSignersFee = (inputs.numberOfSigners - 4) * 10;
          breakdown.push(`Extra signers (${inputs.numberOfSigners - 4}): $${extraSignersFee}`);
        }
      }
    }

    // Calculate travel fee with service-specific radius
    let travelFee = 0;
    if (!isRONService) { // RON has no travel fee
      let serviceRadius = 15; // Default 15-mile radius per SOP
      
      if (isQuickStampLocal) {
        serviceRadius = 10; // Quick-Stamp has 10-mile radius per SOP
      } else if (serviceName.includes('loan')) {
        serviceRadius = 30; // Loan signing has 30-mile radius per SOP
      }
      
      travelFee = inputs.distance > serviceRadius ? 
        (inputs.distance - serviceRadius) * 0.50 : 0; // $0.50/mile per SOP
    }

    // Other fees (kept for compatibility)
    const weekendHolidayFee = inputs.isWeekend || inputs.isHoliday ? 40 : 0;
    const afterHoursFee = inputs.isAfterHours && !serviceName.includes('extended') ? 50 : 0;
    const extraDocumentsFee = inputs.extraDocuments * 10; // $10 per extra doc per SOP
    const overnightHandlingFee = inputs.needsOvernightHandling ? 35 : 0;
    const bilingualFee = inputs.needsBilingualService ? 20 : 0;
    
    // Urgency fees per SOP
    let urgencyFee = 0;
    if (inputs.urgencyLevel === 'same-day' && !serviceName.includes('extended')) {
      urgencyFee = 25; // Same-day fee per SOP
    } else if (inputs.urgencyLevel === 'emergency') {
      urgencyFee = 50; // Emergency/after-hours fee per SOP  
    }

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
    if (!isRONService && !isQuickStampLocal && extraSignersFee > 0) {
      breakdown.push(`Additional signers (${inputs.numberOfSigners - (serviceName.includes('loan') ? 4 : 2)}): $${extraSignersFee}`);
    }
    if (travelFee > 0) breakdown.push(`Travel (${inputs.distance.toFixed(1)} miles): $${travelFee.toFixed(2)}`);
    if (weekendHolidayFee > 0) breakdown.push(`Weekend/Holiday: $${weekendHolidayFee}`);
    if (afterHoursFee > 0) breakdown.push(`After hours: $${afterHoursFee}`);
    if (extraDocumentsFee > 0) breakdown.push(`Extra documents (${inputs.extraDocuments}): $${extraDocumentsFee}`);
    if (overnightHandlingFee > 0) breakdown.push(`Overnight handling: $${overnightHandlingFee}`);
    if (bilingualFee > 0) breakdown.push(`Bilingual Service: $${bilingualFee}`);
    if (urgencyFee > 0) breakdown.push(`${inputs.urgencyLevel} Service: $${urgencyFee}`);
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
    if (inputs.promoCode && inputs.promoCode.trim() && inputs.Service) {
      validatePromoCode(inputs.promoCode.trim());
    } else {
      setPromoValidation(null);
    }
  }, [inputs.promoCode, inputs.Service]);

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
          serviceId: inputs.Service?.id,
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
    if (inputs.distance > 50) {
      return {
        type: 'error' as const,
        message: `Service area exceeded. We typically serve within 50 miles of ZIP 77591. Additional coordination may be required for ${inputs.distance.toFixed(1)} mile distance.`
      };
    }
    if (inputs.distance > 15) {
      return {
        type: 'warning' as const,
        message: `Travel fee applies for distances beyond 15 miles from ZIP 77591. ${formatCurrency(pricing.travelFee)} added for ${inputs.distance.toFixed(1)} mile distance.`
      };
    }
    return null;
  };

  const travelWarning = getTravelWarning();

  if (!inputs.Service) {
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
            {inputs.Service.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>~{inputs.Service.duration} min</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 