'use client';

/**
 * Championship Booking System - Intelligent Upsell Modal
 * Houston Mobile Notary Pros
 * 
 * Conversion-optimized upsell presentation system that dramatically
 * increases average order value through smart, contextual suggestions.
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Star,
  Shield,
  X,
  Gift
} from 'lucide-react';

// Types for upsell suggestions
interface UpsellSuggestion {
  id: string;
  type: 'service_upgrade' | 'add_on';
  fromService?: string;
  toService?: string;
  priceIncrease: number;
  headline: string;
  benefit: string;
  urgency?: string;
  conversionBoost?: string;
  savings?: number;
  condition?: string;
  confidence: 'high' | 'medium' | 'low';
  features?: string[];
}

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: UpsellSuggestion[];
  currentService: string;
  currentPrice: number;
  onAccept: (suggestionId: string) => void;
  onDecline: (suggestionId: string) => void;
  customerEmail?: string;
  timeRemaining?: number; // For urgency if slot is reserved
}

interface UpsellBenefits {
  [key: string]: {
    title: string;
    benefits: string[];
    icon: React.ComponentType<any>;
    color: string;
  };
}

// Service upgrade benefits mapping
const SERVICE_BENEFITS: UpsellBenefits = {
  'EXTENDED_HOURS': {
    title: 'Extended Hours Service',
    benefits: [
      'Available 7am-9pm daily',
      'Up to 5 documents included',
      '20-mile travel radius',
      'Same-day guarantee',
      'Evening appointments',
      'Weekend availability'
    ],
    icon: Clock,
    color: 'text-blue-600'
  },
  'LOAN_SIGNING': {
    title: 'Loan Signing Specialist',
    benefits: [
      'Unlimited documents',
      'Real estate expertise',
      'Title company coordination',
      'Up to 4 signers',
      '90-minute session',
      'Flat-rate pricing'
    ],
    icon: TrendingUp,
    color: 'text-green-600'
  }
};

// Confidence level indicators
const CONFIDENCE_INDICATORS = {
  high: { color: 'text-green-600', label: '95% of customers benefit' },
  medium: { color: 'text-yellow-600', label: '80% of customers benefit' },
  low: { color: 'text-gray-600', label: '60% of customers benefit' }
};

export default function UpsellModal({
  isOpen,
  onClose,
  suggestions,
  currentService,
  currentPrice,
  onAccept,
  onDecline,
  customerEmail,
  timeRemaining
}: UpsellModalProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<UpsellSuggestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [urgencyTimer, setUrgencyTimer] = useState<number | null>(timeRemaining || null);

  // Update urgency timer
  useEffect(() => {
    if (urgencyTimer && urgencyTimer > 0) {
      const interval = setInterval(() => {
        setUrgencyTimer(prev => prev ? Math.max(0, prev - 1) : 0);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [urgencyTimer]);

  // Auto-select first high-confidence suggestion
  useEffect(() => {
    if (suggestions.length > 0 && !selectedSuggestion) {
      const highConfidenceSuggestion = suggestions.find(s => s.confidence === 'high') || suggestions[0];
      setSelectedSuggestion(highConfidenceSuggestion);
    }
  }, [suggestions, selectedSuggestion]);

  const handleAccept = async (suggestionId: string) => {
    setIsProcessing(true);
    try {
      await onAccept(suggestionId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (suggestionId: string) => {
    setIsProcessing(true);
    try {
      await onDecline(suggestionId);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!selectedSuggestion) return null;

  const serviceBenefits = selectedSuggestion.toService ? 
    SERVICE_BENEFITS[selectedSuggestion.toService] : null;
  const confidenceIndicator = CONFIDENCE_INDICATORS[selectedSuggestion.confidence];
  const newTotalPrice = currentPrice + selectedSuggestion.priceIncrease;

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center space-x-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              <span>Upgrade Your Service</span>
            </DialogTitle>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Urgency Timer */}
        {urgencyTimer && urgencyTimer > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Your reserved slot expires in <strong>{formatTime(urgencyTimer)}</strong></span>
              <Badge variant="secondary" className="animate-pulse">
                Limited Time
              </Badge>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Upsell Presentation */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-green-800">
                  {selectedSuggestion.headline}
                </CardTitle>
                <CardDescription className="text-green-700 mt-1">
                  {selectedSuggestion.benefit}
                </CardDescription>
                
                {/* Confidence Indicator */}
                <div className="flex items-center space-x-2 mt-2">
                  <Star className={`h-4 w-4 ${confidenceIndicator.color}`} />
                  <span className={`text-sm font-medium ${confidenceIndicator.color}`}>
                    {confidenceIndicator.label}
                  </span>
                </div>
              </div>
              
              {/* Pricing Display */}
              <div className="text-right">
                <div className="text-sm text-gray-600 line-through">
                  ${currentPrice.toFixed(2)}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${newTotalPrice.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">
                  +${selectedSuggestion.priceIncrease.toFixed(2)} upgrade
                </div>
                {selectedSuggestion.savings && selectedSuggestion.savings > 0 && (
                  <Badge variant="destructive" className="mt-1">
                    Save ${selectedSuggestion.savings.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Urgency/Conversion Boost */}
            {(selectedSuggestion.urgency || selectedSuggestion.conversionBoost) && (
              <div className="mt-3 space-y-1">
                {selectedSuggestion.urgency && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      {selectedSuggestion.urgency}
                    </span>
                  </div>
                )}
                {selectedSuggestion.conversionBoost && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      {selectedSuggestion.conversionBoost}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardHeader>

          {/* Service Benefits */}
          {serviceBenefits && (
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <serviceBenefits.icon className={`h-5 w-5 ${serviceBenefits.color}`} />
                  <h4 className="font-semibold text-gray-800">
                    {serviceBenefits.title} Includes:
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {serviceBenefits.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Additional Suggestions */}
        {suggestions.length > 1 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Other Available Upgrades:</h4>
            <div className="grid gap-2">
              {suggestions
                .filter(s => s.id !== selectedSuggestion.id)
                .slice(0, 2)
                .map((suggestion) => (
                  <Card 
                    key={suggestion.id} 
                    className="cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => setSelectedSuggestion(suggestion)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{suggestion.headline}</div>
                          <div className="text-xs text-gray-600">{suggestion.benefit}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            +${suggestion.priceIncrease.toFixed(2)}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Trust Signals */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-blue-700 font-medium">$100K Insured</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-blue-700 font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="text-blue-700 font-medium">30-Day Guarantee</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => handleAccept(selectedSuggestion.id)}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
            size="lg"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Yes, Upgrade My Service
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleDecline(selectedSuggestion.id)}
            disabled={isProcessing}
            className="h-12"
            size="lg"
          >
            Continue with Current Selection
          </Button>
        </div>

        {/* Condition Note */}
        {selectedSuggestion.condition && (
          <div className="text-xs text-gray-500 text-center">
            * {selectedSuggestion.condition}
          </div>
        )}

        {/* Social Proof */}
        <div className="text-center">
          <div className="text-sm text-gray-600">
            <strong>487 customers</strong> upgraded their service this month
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Join the majority who choose our premium services
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}