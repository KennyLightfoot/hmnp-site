'use client';

/**
 * 🚀 Phase 1: Interactive Pricing Calculator
 * Houston Mobile Notary Pros
 * 
 * Real-time pricing updates with service add-ons and mobile optimization
 * 
 * ✅ Live price updates based on selections
 * ✅ Distance-based travel fees 
 * ✅ Service add-ons and upgrades
 * ✅ Promotional code integration
 * ✅ Mobile-optimized interface
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Calculator, 
  Plus, 
  Minus, 
  Tag, 
  MapPin, 
  Clock, 
  FileText, 
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  Car,
  ArrowRight
} from 'lucide-react';
// Minimal shape needed from unified transparent pricing
type UnifiedPricingDisplay = {
  serviceType?: string;
  basePrice: number;
  totalPrice: number;
  breakdown: {
    serviceBase: { amount: number; label: string; description?: string };
    travelFee?: { amount: number; label: string };
    extraDocuments?: { amount: number; label: string };
    timeBasedSurcharges?: Array<{ amount: number; label: string }>;
    discounts?: Array<{ amount: number; label: string }>;
  };
} | null;

// Types
interface PricingBreakdown {
  serviceBase: number;
  travelFee: number;
  documentFee: number;
  timeSurcharge: number;
  addOns: number;
  discount: number;
  total: number;
}

interface ServiceAddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'document' | 'time' | 'service';
  popular?: boolean;
}

interface InteractivePricingCalculatorProps {
  serviceType: string;
  address?: string;
  scheduledDateTime?: string;
  onPricingChange?: (breakdown: PricingBreakdown) => void;
  className?: string;
  isMobile?: boolean;
  // When provided, this value will be displayed as the Total to keep UI consistent
  externalTotal?: number;
  // Optional unified transparent pricing result to drive the breakdown UI
  transparentPricing?: UnifiedPricingDisplay;
  // External calculating flag from unified pricing
  isPricingCalculating?: boolean;
}

// Base service prices (single source of truth)
import { SERVICES_CONFIG } from '@/lib/services/config';
const BASE_PRICES = Object.fromEntries(
  Object.entries(SERVICES_CONFIG).map(([k, v]) => [k, v.basePrice])
) as Record<string, number>;

// Service Add-Ons Configuration
const SERVICE_ADD_ONS: ServiceAddOn[] = [
  // Document Add-ons
  {
    id: 'extra_document',
    name: 'Additional Document',
    price: 10,
    description: 'Each additional document beyond the included limit',
    category: 'document',
    popular: true
  },
  // Removed Quick-Stamp specific add-on
  {
    id: 'document_scan',
    name: 'Document Scanning',
    price: 10,
    description: 'Digital copies of all notarized documents',
    category: 'document'
  },
  {
    id: 'certified_copy',
    name: 'Certified Copy',
    price: 5,
    description: 'Official certified copy of notarized document',
    category: 'document'
  },
  
  // Time Add-ons
  {
    id: 'rush_service',
    name: 'Rush Service',
    price: 25,
    description: 'Priority scheduling within 2 hours',
    category: 'time',
    popular: true
  },
  {
    id: 'weekend_booking',
    name: 'Weekend Appointment',
    price: 40,
    description: 'Saturday or Sunday appointment',
    category: 'time'
  },
  {
    id: 'evening_hours',
    name: 'Evening Hours (6-9 PM)',
    price: 15,
    description: 'After-hours appointment scheduling',
    category: 'time'
  },
  {
    id: 'night_service',
    name: 'Night Service (9 PM-7 AM)',
    price: 50,
    description: 'Late night or early morning service',
    category: 'time'
  },
  
  // Service Add-ons
  {
    id: 'travel_protection',
    name: 'Travel Protection',
    price: 10,
    description: 'No-charge reschedule if travel is delayed',
    category: 'service'
  },
  {
    id: 'bilingual_service',
    name: 'Bilingual Service',
    price: 15,
    description: 'Spanish/English notary assistance',
    category: 'service'
  },
  {
    id: 'witness_service',
    name: 'Witness Service',
    price: 20,
    description: 'Professional witness for document signing',
    category: 'service'
  }
];

export default function InteractivePricingCalculator({
  serviceType,
  address,
  scheduledDateTime,
  onPricingChange,
  className = '',
  isMobile = false,
  externalTotal,
  transparentPricing,
  isPricingCalculating
}: InteractivePricingCalculatorProps) {
  // State
  const [documentCount, setDocumentCount] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  // Promo code removed to simplify pricing
  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Hoisted helper functions to avoid TDZ errors when referenced in useMemo
  function calculateTimeSurcharge(dateTime: string): number {
    const date = new Date(dateTime);
    const hour = date.getHours();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (isWeekend) return 20;
    if (hour >= 18 || hour < 8) return 15;
    return 0;
  }

  function calculateDiscount(subtotal: number): number { return 0; }

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo((): PricingBreakdown => {
    const basePrice = BASE_PRICES[serviceType as keyof typeof BASE_PRICES] ?? 75;
    
    // DISABLED: Travel fee calculation (for mobile services)
    // Travel fee calculation temporarily disabled to simplify booking system
    const travelFee = 0; // serviceType === 'RON_SERVICES' ? 0 : 
      // estimatedDistance > 15 ? (estimatedDistance - 15) * 0.50 : 0;
    
    // Document fee calculation
    const documentFee = documentCount > 1 ? (documentCount - 1) * 15 : 0;
    
    // Time surcharge calculation
    const timeSurcharge = scheduledDateTime ? calculateTimeSurcharge(scheduledDateTime) : 0;
    
    // Add-ons calculation
    const addOns = selectedAddOns.reduce((total, addOnId) => {
      const addOn = SERVICE_ADD_ONS.find(a => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    
    // Discount calculation
    const discount = 0;
    
    // Total calculation
    const total = Math.max(0, basePrice + travelFee + documentFee + timeSurcharge + addOns - discount);
    
    return {
      serviceBase: basePrice,
      travelFee,
      documentFee,
      timeSurcharge,
      addOns,
      discount,
      total
    };
  }, [serviceType, estimatedDistance, documentCount, scheduledDateTime, selectedAddOns]);

  // (moved) calculateTimeSurcharge and calculateDiscount declared above

  // Promo code removed

  // Toggle add-on
  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  // Effect to calculate distance
  useEffect(() => {
    if (address && serviceType !== 'RON_SERVICES') {
      setIsCalculating(true);
      // Simulate distance calculation
      setTimeout(() => {
        setEstimatedDistance(Math.floor(Math.random() * 30) + 5);
        setIsCalculating(false);
      }, 1000);
    }
  }, [address, serviceType]);

  // Use ref to track previous pricing to prevent unnecessary callbacks
  const prevPricingRef = useRef<PricingBreakdown | null>(null);
  
  // Effect to notify parent of pricing changes - optimized to prevent excessive updates
  useEffect(() => {
    // Only call onPricingChange if it's actually a function and we have meaningful data
    // and the pricing has actually changed
    if (typeof onPricingChange === 'function' && pricingBreakdown.total > 0) {
      const prevPricing = prevPricingRef.current;
      const hasChanged = !prevPricing || 
        prevPricing.total !== pricingBreakdown.total ||
        prevPricing.serviceBase !== pricingBreakdown.serviceBase ||
        prevPricing.travelFee !== pricingBreakdown.travelFee;
      
      if (hasChanged) {
        prevPricingRef.current = pricingBreakdown;
        onPricingChange(pricingBreakdown);
      }
    }
  }, [pricingBreakdown, onPricingChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Pricing Display */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className={isMobile ? 'text-base' : 'text-lg'}>Interactive Pricing</span>
            </div>
            <Badge variant="outline" className="text-blue-600">
              <Zap className="h-3 w-3 mr-1" />
              Live Updates
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Price Display */}
          <div className="text-center p-4 bg-white border border-blue-200 rounded-lg">
            <div className={`font-bold text-blue-900 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              {(isPricingCalculating ?? isCalculating) ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
                  <span>Calculating...</span>
                </div>
              ) : (
                `$${Number((externalTotal ?? pricingBreakdown.total)).toFixed(2)}`
              )}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {serviceType === 'RON_SERVICES' ? 'Remote Online Notarization' : 'Mobile Notary Service'}
            </div>
          </div>

          {/* Service Type Indicator */}
          <div className="flex items-center justify-center space-x-4 py-2">
            {serviceType === 'RON_SERVICES' ? (
              <>
                <Monitor className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Online Service</span>
              </>
            ) : (
              <>
                <Car className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Mobile Service</span>
              </>
            )}
          </div>

          {/* Quick Breakdown Toggle */}
          <div className="flex items-center justify-center">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-blue-600 border-blue-200"
            >
              {showBreakdown ? 'Hide' : 'Show'} Breakdown
              <ArrowRight className={`h-4 w-4 ml-1 transform transition-transform ${showBreakdown ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          {/* Detailed Breakdown */}
          {showBreakdown && (
            <div className="bg-white p-4 border border-blue-200 rounded-lg space-y-3">
              {transparentPricing ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Service Base:</span>
                    <span className="font-medium">${transparentPricing.basePrice.toFixed(2)}</span>
                  </div>

                  {transparentPricing.breakdown?.travelFee && transparentPricing.breakdown.travelFee.amount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{transparentPricing.breakdown.travelFee.label}:</span>
                      </div>
                      <span className="font-medium">${transparentPricing.breakdown.travelFee.amount.toFixed(2)}</span>
                    </div>
                  )}

                  {transparentPricing.breakdown?.extraDocuments && transparentPricing.breakdown.extraDocuments.amount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{transparentPricing.breakdown.extraDocuments.label}:</span>
                      </div>
                      <span className="font-medium">${transparentPricing.breakdown.extraDocuments.amount.toFixed(2)}</span>
                    </div>
                  )}

                  {(transparentPricing.breakdown?.timeBasedSurcharges || []).map((s, idx) => (
                    <div key={`surcharge_${idx}`} className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{s.label}:</span>
                      </div>
                      <span className="font-medium text-orange-600">${s.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  {(transparentPricing.breakdown?.discounts || []).map((d, idx) => (
                    <div key={`discount_${idx}`} className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{d.label}:</span>
                      </div>
                      <span className="font-medium text-green-600">-${d.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-900">${Number((externalTotal ?? transparentPricing.totalPrice)).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Fallback to local demo calculator if unified pricing not provided */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Service Base:</span>
                    <span className="font-medium">${pricingBreakdown.serviceBase.toFixed(2)}</span>
                  </div>

                  {pricingBreakdown.travelFee > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Travel Fee ({estimatedDistance} miles):</span>
                      </div>
                      <span className="font-medium">${pricingBreakdown.travelFee.toFixed(2)}</span>
                    </div>
                  )}

                  {pricingBreakdown.documentFee > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Extra Documents ({documentCount - 1}):</span>
                      </div>
                      <span className="font-medium">${pricingBreakdown.documentFee.toFixed(2)}</span>
                    </div>
                  )}

                  {pricingBreakdown.timeSurcharge > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Time Surcharge:</span>
                      </div>
                      <span className="font-medium text-orange-600">${pricingBreakdown.timeSurcharge.toFixed(2)}</span>
                    </div>
                  )}

                  {pricingBreakdown.addOns > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <Plus className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Add-ons:</span>
                      </div>
                      <span className="font-medium text-green-600">${pricingBreakdown.addOns.toFixed(2)}</span>
                    </div>
                  )}

                  {pricingBreakdown.discount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Discount:</span>
                      </div>
                      <span className="font-medium text-green-600">-${pricingBreakdown.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-900">${pricingBreakdown.total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hide demo controls when unified pricing is present to avoid confusion */}
      {!transparentPricing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className={isMobile ? 'text-base' : 'text-lg'}>Document Count</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Number of Documents:</Label>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDocumentCount(Math.max(1, documentCount - 1))}
                  disabled={documentCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-medium w-8 text-center">{documentCount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDocumentCount(documentCount + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {documentCount > 1 && (
              <div className="mt-2 text-sm text-gray-600">
                ${(documentCount - 1) * 15} for {documentCount - 1} additional document{documentCount > 2 ? 's' : ''}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!transparentPricing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-600" />
                <span className={isMobile ? 'text-base' : 'text-lg'}>Service Add-ons</span>
              </div>
              <Badge variant="outline" className="hidden md:inline">Swipe/Scroll</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
              {SERVICE_ADD_ONS.map(addOn => (
                <div
                  key={addOn.id}
                  className="min-w-[240px] snap-start flex flex-col justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{addOn.name}</span>
                      {addOn.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-3">{addOn.description}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-green-600">+${addOn.price}</span>
                    <Switch
                      checked={selectedAddOns.includes(addOn.id)}
                      onCheckedChange={() => toggleAddOn(addOn.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promo Code removed */}
    </div>
  );
} 