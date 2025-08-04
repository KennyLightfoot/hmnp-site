'use client';

/**
 * Enhanced Pricing Display - Houston Mobile Notary Pros
 * Phase 4: Transparent Pricing Integration
 * 
 * This component provides transparent pricing displays throughout
 * the booking flow with detailed explanations and alternatives.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Info, 
  MapPin, 
  FileText, 
  Calendar, 
  Percent,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';

// Types for transparent pricing display
interface PricingComponent {
  amount: number;
  label: string;
  description: string;
  isDiscount: boolean;
  calculation?: string;
  icon?: React.ReactNode;
}

interface TransparentPricingDisplayProps {
  // Pricing data from unified engine
  serviceType: string;
  basePrice: number;
  totalPrice: number;
  breakdown: {
    serviceBase: PricingComponent;
    travelFee?: PricingComponent;
    extraDocuments?: PricingComponent;
    timeBasedSurcharges: PricingComponent[];
    discounts: PricingComponent[];
  };
  transparency?: {
    whyThisPrice: string;
    feeExplanations: string[];
    alternatives: Array<{
      serviceType: string;
      price: number;
      savings: number;
      tradeoffs: string[];
    }>;
  };
  businessRules?: {
    serviceAreaZone: string;
    discountsApplied: string[];
    dynamicPricingActive: boolean;
  };
  
  // Display options
  variant?: 'compact' | 'detailed' | 'summary';
  showAlternatives?: boolean;
  showExplanations?: boolean;
  isMobile?: boolean;
  isLoading?: boolean;
  
  // Callbacks
  onServiceAlternativeSelect?: (serviceType: string) => void;
  onPricingHelpClick?: () => void;
}

interface PricingComponentDisplayProps {
  component: PricingComponent;
  variant: 'compact' | 'detailed';
}

const PricingComponentDisplay: React.FC<PricingComponentDisplayProps> = ({ component, variant }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const formatAmount = (amount: number, isDiscount: boolean) => {
    const formatted = amount.toFixed(2);
    return isDiscount ? `-$${formatted}` : `+$${formatted}`;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          {component.icon}
          <span className="text-sm">{component.label}</span>
          {component.calculation && (
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{component.calculation}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className={`font-medium text-sm ${
          component.isDiscount ? 'text-green-600' : 'text-gray-900'
        }`}>
          {formatAmount(component.amount, component.isDiscount)}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 border rounded-lg ${
      component.isDiscount ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {component.icon}
          <div>
            <div className="font-medium">{component.label}</div>
            <div className="text-sm text-gray-600">{component.description}</div>
          </div>
        </div>
        <div className={`font-bold ${
          component.isDiscount ? 'text-green-600' : 'text-gray-900'
        }`}>
          {formatAmount(component.amount, component.isDiscount)}
        </div>
      </div>
      
      {component.calculation && (
        <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border">
          <strong>Calculation:</strong> {component.calculation}
        </div>
      )}
    </div>
  );
};

export function EnhancedPricingDisplay({
  serviceType,
  basePrice,
  totalPrice,
  breakdown,
  transparency,
  businessRules,
  variant = 'detailed',
  showAlternatives = true,
  showExplanations = true,
  isMobile = false,
  isLoading = false,
  onServiceAlternativeSelect,
  onPricingHelpClick
}: TransparentPricingDisplayProps) {
  
  const [showFullBreakdown, setShowFullBreakdown] = useState(variant === 'detailed');
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  // Add icons to pricing components
  const enhancedBreakdown = {
    ...breakdown,
    serviceBase: {
      ...breakdown.serviceBase,
      icon: <FileText className="h-4 w-4 text-blue-600" />
    },
    travelFee: breakdown.travelFee ? {
      ...breakdown.travelFee,
      icon: <MapPin className="h-4 w-4 text-green-600" />
    } : undefined,
    extraDocuments: breakdown.extraDocuments ? {
      ...breakdown.extraDocuments,
      icon: <FileText className="h-4 w-4 text-orange-600" />
    } : undefined,
    timeBasedSurcharges: breakdown.timeBasedSurcharges.map(surcharge => ({
      ...surcharge,
      icon: <Calendar className="h-4 w-4 text-purple-600" />
    })),
    discounts: breakdown.discounts.map(discount => ({
      ...discount,
      icon: <Percent className="h-4 w-4 text-green-600" />
    }))
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
            <span className="text-gray-600">Calculating transparent pricing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">
                {serviceType.replace(/_/g, ' ')} Service
              </div>
              {transparency && (
                <button
                  onClick={onPricingHelpClick}
                  className="text-xs text-blue-700 hover:text-blue-800 flex items-center space-x-1 mt-1"
                >
                  <Info className="h-3 w-3" />
                  <span>Why this price?</span>
                </button>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                ${totalPrice.toFixed(2)}
              </div>
              {businessRules?.dynamicPricingActive && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Dynamic Pricing
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Main Pricing Card */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span>Transparent Pricing</span>
              </div>
              {businessRules?.dynamicPricingActive && (
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1" />
                  Dynamic Pricing Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total Price Display */}
            <div className="text-center p-4 bg-white border border-blue-200 rounded-lg">
              <div className="text-3xl font-bold text-blue-900">
                ${totalPrice.toFixed(2)}
              </div>
              <div className="text-sm text-blue-700">
                Total Price - No Hidden Fees
              </div>
              {businessRules?.discountsApplied && businessRules.discountsApplied.length > 0 && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Discounts Applied
                  </Badge>
                </div>
              )}
            </div>

            {/* Why This Price Explanation */}
            {transparency && showExplanations && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Why this price?</strong> {transparency.whyThisPrice}
                </AlertDescription>
              </Alert>
            )}

            {/* Pricing Breakdown Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Pricing Breakdown</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullBreakdown(!showFullBreakdown)}
              >
                {showFullBreakdown ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>

            {/* Pricing Breakdown */}
            {showFullBreakdown && (
              <div className="space-y-3">
                {/* Base Service */}
                <PricingComponentDisplay 
                  component={enhancedBreakdown.serviceBase} 
                  variant={isMobile ? 'compact' : 'detailed'}
                />

                {/* Travel Fee */}
                {enhancedBreakdown.travelFee && (
                  <PricingComponentDisplay 
                    component={enhancedBreakdown.travelFee} 
                    variant={isMobile ? 'compact' : 'detailed'}
                  />
                )}

                {/* Extra Documents */}
                {enhancedBreakdown.extraDocuments && (
                  <PricingComponentDisplay 
                    component={enhancedBreakdown.extraDocuments} 
                    variant={isMobile ? 'compact' : 'detailed'}
                  />
                )}

                {/* Time-Based Surcharges */}
                {enhancedBreakdown.timeBasedSurcharges.map((surcharge, index) => (
                  <PricingComponentDisplay 
                    key={index}
                    component={surcharge} 
                    variant={isMobile ? 'compact' : 'detailed'}
                  />
                ))}

                {/* Discounts */}
                {enhancedBreakdown.discounts.map((discount, index) => (
                  <PricingComponentDisplay 
                    key={index}
                    component={discount} 
                    variant={isMobile ? 'compact' : 'detailed'}
                  />
                ))}

                <Separator className="my-3" />

                {/* Total Calculation */}
                <div className="flex items-center justify-between p-3 bg-blue-100 border border-blue-200 rounded-lg">
                  <span className="font-bold text-blue-900">Total Price</span>
                  <span className="text-xl font-bold text-blue-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alternative Options */}
        {transparency && transparency.alternatives.length > 0 && showAlternatives && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <TrendingDown className="h-5 w-5" />
                <span>Save Money With Alternative Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transparency.alternatives.map((alt, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedAlternative === alt.serviceType 
                      ? 'border-green-400 bg-green-100' 
                      : 'border-green-200 bg-white hover:border-green-300'
                  }`}
                  onClick={() => setSelectedAlternative(alt.serviceType)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{alt.serviceType.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-green-700">
                        Save ${alt.savings.toFixed(2)} from current selection
                      </div>
                      {alt.tradeoffs.length > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          <strong>Note:</strong> {alt.tradeoffs.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-800">
                        ${alt.price.toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onServiceAlternativeSelect?.(alt.serviceType);
                        }}
                      >
                        Select This
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Service Area and Business Rules Status */}
        {businessRules && (
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service Area:</span>
                  <Badge variant="secondary">
                    {businessRules.serviceAreaZone.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {businessRules.discountsApplied?.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Discounts:</span>
                    <span className="text-green-600 font-medium">
                      {businessRules.discountsApplied.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fee Explanations */}
        {transparency && transparency.feeExplanations.length > 0 && showExplanations && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">How Our Pricing Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transparency.feeExplanations.map((explanation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
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

// Compact version for use in forms and smaller spaces
export function CompactPricingDisplay(props: Omit<TransparentPricingDisplayProps, 'variant'>) {
  return <EnhancedPricingDisplay {...props} variant="compact" />;
}

// Summary version for final review
export function PricingSummaryDisplay(props: Omit<TransparentPricingDisplayProps, 'variant'>) {
  return <EnhancedPricingDisplay {...props} variant="summary" showAlternatives={false} />;
}

export default EnhancedPricingDisplay; 