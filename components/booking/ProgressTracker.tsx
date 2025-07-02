'use client';

/**
 * Championship Booking System - Progress Tracker
 * Houston Mobile Notary Pros
 * 
 * Confidence-building progress tracker with real-time pricing,
 * psychological triggers, and trust signals.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Shield,
  Star,
  Users
} from 'lucide-react';

import { PricingResult } from '@/lib/pricing-engine';

interface BookingStep {
  id: string;
  title: string;
  subtitle: string;
  showInProgress?: boolean;
}

interface ProgressTrackerProps {
  steps: BookingStep[];
  currentStep: number;
  completionProgress: number;
  pricing?: PricingResult | null;
  pricingLoading?: boolean;
  timeRemaining?: number | null;
}

interface ConfidenceMetrics {
  bookingLikelihood: number;
  priceConfidence: 'high' | 'medium' | 'low';
  competitiveAdvantage: string[];
  nextActions: string[];
}

export default function ProgressTracker({
  steps,
  currentStep,
  completionProgress,
  pricing,
  pricingLoading = false,
  timeRemaining
}: ProgressTrackerProps) {
  
  // Calculate confidence metrics
  const confidenceMetrics: ConfidenceMetrics = React.useMemo(() => {
    const likelihood = Math.min(95, Math.max(20, completionProgress * 1.2));
    
    const advantages = [
      '$100K E&O Insurance Coverage',
      '4.9/5 Star Rating (487+ Reviews)',
      'Texas Licensed Professional'
    ];

    if (pricing?.confidence.level === 'high') {
      advantages.push('Best Price in Houston Area');
    }

    if (timeRemaining) {
      advantages.push('Slot Reserved & Protected');
    }

    const nextActions = [];
    if (currentStep === 0) nextActions.push('Choose your perfect service');
    if (currentStep === 1) nextActions.push('Quick contact details');
    if (currentStep === 2) nextActions.push('Confirm service location');
    if (currentStep === 3) nextActions.push('Pick your preferred time');
    if (currentStep === 4) nextActions.push('Secure payment & confirmation');

    return {
      bookingLikelihood: likelihood,
      priceConfidence: pricing?.confidence.level || 'medium',
      competitiveAdvantage: advantages,
      nextActions
    };
  }, [completionProgress, pricing, timeRemaining, currentStep]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
      <CardContent className="p-6">
        {/* Top Row - Main Metrics */}
        <div className="flex items-center justify-between mb-4">
          {/* Completion Progress */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Booking Progress: {completionProgress}%
              </span>
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-800 animate-pulse"
              >
                {confidenceMetrics.bookingLikelihood}% Success Rate
              </Badge>
            </div>
          </div>

          {/* Live Pricing */}
          {pricing && (
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">
                    ${pricing.total.toFixed(2)}
                  </span>
                  {pricingLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                  )}
                </div>
                {pricing.confidence.competitiveAdvantage && (
                  <div className="text-sm text-green-600 font-medium">
                    {pricing.confidence.competitiveAdvantage}
                  </div>
                )}
              </div>

              {/* Time Pressure (if slot reserved) */}
              {timeRemaining && timeRemaining > 0 && (
                <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Slot expires: {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress 
            value={completionProgress} 
            className="h-3 bg-green-100"
          />
          <div className="flex justify-between text-xs text-green-700 mt-1">
            <span>Getting started</span>
            <span className="font-medium">
              {confidenceMetrics.nextActions[0] || 'Almost done!'}
            </span>
            <span>Booking confirmed</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white animate-pulse' 
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="text-center mt-1 max-w-20">
                    <div className={`text-xs font-medium ${
                      isCurrent ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {step.title.split(' ')[0]}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-3 
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Row - Trust Signals and Competitive Advantages */}
        <div className="flex items-center justify-between text-sm">
          {/* Trust Signals */}
          <div className="flex items-center space-x-6">
            {confidenceMetrics.competitiveAdvantage.slice(0, 3).map((advantage, index) => (
              <div key={index} className="flex items-center space-x-1">
                {advantage.includes('Insurance') && <Shield className="h-3 w-3 text-blue-600" />}
                {advantage.includes('Rating') && <Star className="h-3 w-3 text-yellow-500" />}
                {advantage.includes('Licensed') && <CheckCircle className="h-3 w-3 text-green-600" />}
                {advantage.includes('Price') && <DollarSign className="h-3 w-3 text-green-600" />}
                {advantage.includes('Slot') && <Clock className="h-3 w-3 text-orange-600" />}
                <span className="text-gray-700 font-medium">{advantage}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>487+ customers this month</span>
            </div>
            {pricing?.upsellSuggestions && pricing.upsellSuggestions.length > 0 && (
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Upgrade Available
              </Badge>
            )}
          </div>
        </div>

        {/* Confidence Boost Messages */}
        {completionProgress >= 60 && (
          <div className="mt-3 p-2 bg-green-100 rounded-lg border border-green-200">
            <div className="text-sm text-green-800 font-medium">
              🎉 Great progress! You're {completionProgress}% complete. 
              Most customers at this stage successfully complete their booking.
            </div>
          </div>
        )}

        {/* Urgency Messages */}
        {timeRemaining && timeRemaining <= 300 && timeRemaining > 0 && ( // 5 minutes or less
          <div className="mt-3 p-2 bg-orange-100 rounded-lg border border-orange-200 animate-pulse">
            <div className="text-sm text-orange-800 font-medium">
              ⏰ Your reserved slot expires soon! Complete your booking to secure this time.
            </div>
          </div>
        )}

        {/* Pricing Confidence Boost */}
        {pricing?.confidence.level === 'high' && (
          <div className="mt-3 p-2 bg-blue-100 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-800 font-medium">
              💎 Premium service at the best price in Houston - you're saving vs competitors!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}