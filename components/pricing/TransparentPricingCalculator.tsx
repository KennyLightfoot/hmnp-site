'use client';

/**
 * Transparent Pricing Calculator - Houston Mobile Notary Pros
 * Phase 4: Complete Pricing Transparency System
 * 
 * This component provides real-time, transparent pricing calculations
 * with detailed explanations and alternative options.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { debugApiResponse } from '@/lib/api-debug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, DollarSign, MapPin, Calendar, FileText, Users, Percent } from 'lucide-react';

// Types for transparent pricing
interface PricingBreakdownComponent {
  amount: number;
  label: string;
  description: string;
  isDiscount: boolean;
  multiplier?: number;
  calculation?: string;
}

interface TransparentPricingResult {
  serviceType: string;
  basePrice: number;
  totalPrice: number;
  breakdown: {
    serviceBase: PricingBreakdownComponent;
    travelFee?: PricingBreakdownComponent;
    extraDocuments?: PricingBreakdownComponent;
    timeBasedSurcharges: PricingBreakdownComponent[];
    discounts: PricingBreakdownComponent[];
  };
  transparency: {
    whyThisPrice: string;
    feeExplanations: string[];
    priceFactors: string[];
    alternatives: Array<{
      serviceType: string;
      price: number;
      savings: number;
      tradeoffs: string[];
    }>;
  };
  businessRules: {
    isValid: boolean;
    serviceAreaZone: string;
    isWithinServiceArea: boolean;
    documentLimitsExceeded: boolean;
    dynamicPricingActive: boolean;
    discountsApplied: string[];
  };
}

const SERVICE_OPTIONS = [
  { value: 'QUICK_STAMP_LOCAL', label: 'Quick Stamp Local', description: 'Fast local signings' },
  { value: 'STANDARD_NOTARY', label: 'Standard Notary', description: 'Professional routine documents' },
  { value: 'EXTENDED_HOURS', label: 'Extended Hours', description: 'Urgent and after-hours service' },
  { value: 'LOAN_SIGNING', label: 'Loan Signing', description: 'Specialized loan documents' },
  { value: 'RON_SERVICES', label: 'Remote Online Notarization', description: '24/7 online service' }
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: 'new', label: 'New Customer', description: 'First time booking with us' },
  { value: 'returning', label: 'Returning Customer', description: 'Previous customer' },
  { value: 'loyalty', label: 'Loyalty Customer', description: '5+ previous bookings' }
];

export function TransparentPricingCalculator() {
  // Form state
  const [formData, setFormData] = useState({
    serviceType: '',
    documentCount: 1,
    signerCount: 1,
    address: '',
    scheduledDateTime: '',
    customerType: 'new',
    customerEmail: '',
    referralCode: '',
    promoCode: ''
  });

  // Pricing state
  const [pricingResult, setPricingResult] = useState<TransparentPricingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced calculation
  const [calculationTimeout, setCalculationTimeout] = useState<NodeJS.Timeout | null>(null);

  const calculatePricing = useCallback(async () => {
    if (!formData.serviceType) {
      setPricingResult(null);
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      const response = await fetch('/api/pricing/transparent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          documentCount: parseInt(formData.documentCount.toString()) || 1,
          signerCount: parseInt(formData.signerCount.toString()) || 1
        })
      });

      if (response.ok) {
        const result = await response.json();

        // 🔍 Verbose API debugging
        debugApiResponse('/api/pricing/transparent', response, result);
        if (result.success) {
          setPricingResult(result);
        } else {
          setError(result.error || 'Pricing calculation failed');
          setPricingResult(null);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        setPricingResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setPricingResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [formData]);

  // Debounced pricing calculation
  useEffect(() => {
    if (calculationTimeout) {
      clearTimeout(calculationTimeout);
    }

    const timeout = setTimeout(() => {
      calculatePricing();
    }, 500); // 500ms debounce

    setCalculationTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [calculatePricing]);

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const PricingBreakdownItem = ({ component, icon }: { component: PricingBreakdownComponent; icon?: React.ReactNode }) => (
    <div className={`flex items-center justify-between p-3 border rounded-lg ${component.isDiscount ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center space-x-2">
        {icon}
        <div>
          <div className="font-medium">{component.label}</div>
          <div className="text-sm text-gray-600">{component.description}</div>
          {component.calculation && (
            <div className="text-xs text-gray-500 mt-1">
              Calculation: {component.calculation}
            </div>
          )}
        </div>
      </div>
      <div className={`font-bold ${component.isDiscount ? 'text-green-600' : 'text-gray-900'}`}>
        {component.isDiscount ? '-' : '+'}{formatCurrency(component.amount)}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6" />
              <span>Transparent Pricing Calculator</span>
            </CardTitle>
            <p className="text-gray-600">
              Get complete, transparent pricing with detailed explanations. No hidden fees, ever.
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Type */}
              <div>
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleFormChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Document and Signer Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentCount">Documents</Label>
                  <Input
                    id="documentCount"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.documentCount}
                    onChange={(e) => handleFormChange('documentCount', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="signerCount">Signers</Label>
                  <Input
                    id="signerCount"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.signerCount}
                    onChange={(e) => handleFormChange('signerCount', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Address (for travel calculation) */}
              {formData.serviceType && formData.serviceType !== 'RON_SERVICES' && (
                <div>
                  <Label htmlFor="address">Service Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address for travel fee calculation"
                    value={formData.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                  />
                </div>
              )}

              {/* Scheduled Date/Time */}
              <div>
                <Label htmlFor="scheduledDateTime">Scheduled Date & Time (optional)</Label>
                <Input
                  id="scheduledDateTime"
                  type="datetime-local"
                  value={formData.scheduledDateTime}
                  onChange={(e) => handleFormChange('scheduledDateTime', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  For time-based pricing (same-day, extended hours, etc.)
                </p>
              </div>

              {/* Customer Type */}
              <div>
                <Label htmlFor="customerType">Customer Type</Label>
                <Select value={formData.customerType} onValueChange={(value) => handleFormChange('customerType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Advanced Options */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                </Button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="For discount eligibility"
                      value={formData.customerEmail}
                      onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referralCode">Referral Code</Label>
                    <Input
                      id="referralCode"
                      placeholder="Enter referral code"
                      value={formData.referralCode}
                      onChange={(e) => handleFormChange('referralCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="promoCode">Promo Code</Label>
                    <Input
                      id="promoCode"
                      placeholder="Enter promo code"
                      value={formData.promoCode}
                      onChange={(e) => handleFormChange('promoCode', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pricing Breakdown</span>
                {isCalculating && <Badge variant="secondary">Calculating...</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {pricingResult ? (
                <div className="space-y-4">
                  {/* Total Price */}
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(pricingResult.totalPrice)}
                    </div>
                    <div className="text-sm text-blue-700">Total Price</div>
                    {pricingResult.businessRules.dynamicPricingActive && (
                      <Badge variant="secondary" className="mt-2">Dynamic Pricing Active</Badge>
                    )}
                  </div>

                  {/* Why This Price */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800">Why This Price?</div>
                        <div className="text-sm text-yellow-700 mt-1">
                          {pricingResult.transparency.whyThisPrice}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Detailed Breakdown</h3>
                    
                    {/* Base Service */}
                    <PricingBreakdownItem 
                      component={pricingResult.breakdown.serviceBase} 
                      icon={<FileText className="h-4 w-4 text-blue-600" />}
                    />

                    {/* Travel Fee */}
                    {pricingResult.breakdown.travelFee && (
                      <PricingBreakdownItem 
                        component={pricingResult.breakdown.travelFee} 
                        icon={<MapPin className="h-4 w-4 text-green-600" />}
                      />
                    )}

                    {/* Extra Documents */}
                    {pricingResult.breakdown.extraDocuments && (
                      <PricingBreakdownItem 
                        component={pricingResult.breakdown.extraDocuments} 
                        icon={<FileText className="h-4 w-4 text-orange-600" />}
                      />
                    )}

                    {/* Time-Based Surcharges */}
                    {pricingResult.breakdown.timeBasedSurcharges.map((surcharge, index) => (
                      <PricingBreakdownItem 
                        key={index}
                        component={surcharge} 
                        icon={<Calendar className="h-4 w-4 text-purple-600" />}
                      />
                    ))}

                    {/* Discounts */}
                    {pricingResult.breakdown.discounts.map((discount, index) => (
                      <PricingBreakdownItem 
                        key={index}
                        component={discount} 
                        icon={<Percent className="h-4 w-4 text-green-600" />}
                      />
                    ))}
                  </div>

                  {/* Alternative Options */}
                  {pricingResult.transparency.alternatives.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium">Save Money With Alternative Services</h3>
                      {pricingResult.transparency.alternatives.map((alt, index) => (
                        <div key={index} className="p-3 border border-green-200 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{alt.serviceType.replace(/_/g, ' ')}</div>
                              <div className="text-sm text-green-700">
                                Save {formatCurrency(alt.savings)}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-green-800">
                              {formatCurrency(alt.price)}
                            </div>
                          </div>
                          {alt.tradeoffs.length > 0 && (
                            <div className="mt-2 text-xs text-green-600">
                              Tradeoffs: {alt.tradeoffs.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Business Rules Status */}
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Service Area:</span>
                        <Badge variant={pricingResult.businessRules.isWithinServiceArea ? 'secondary' : 'destructive'}>
                          {pricingResult.businessRules.serviceAreaZone.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {pricingResult.businessRules.discountsApplied.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Discounts Applied:</span>
                          <span className="text-green-600">
                            {pricingResult.businessRules.discountsApplied.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a service to see transparent pricing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fee Explanations */}
        {pricingResult && (
          <Card>
            <CardHeader>
              <CardTitle>Fee Explanations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pricingResult.transparency.feeExplanations.map((explanation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
} 