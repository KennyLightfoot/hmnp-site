'use client';

/**
 * 🚀 MOBILE-OPTIMIZED PROGRESS TRACKER
 * Houston Mobile Notary Pros
 * 
 * Enhanced progress tracking with mobile-first design,
 * smooth animations, and conversion-optimized UX
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  Zap, 
  Shield, 
  Star,
  Smartphone,
  Monitor,
  ChevronRight
} from 'lucide-react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  completionProgress: number;
  pricing?: any;
  pricingLoading?: boolean;
  timeRemaining?: number | null;
  isMobile?: boolean;
}

interface StepData {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  mobileDescription: string;
  estimatedTime: string;
  icon: any;
  tips: string[];
}

const STEP_DATA: StepData[] = [
  {
    id: 'service',
    title: 'Choose Service',
    shortTitle: 'Service',
    description: 'Select the perfect notary service for your needs',
    mobileDescription: 'Pick your service',
    estimatedTime: '2 min',
    icon: null,
    tips: ['Most popular: Standard Notary', 'RON available 24/7', 'Loan signing includes expertise']
  },
  {
    id: 'customer',
    title: 'Your Information',
    shortTitle: 'Contact',
    description: 'Contact details for confirmation',
    mobileDescription: 'Your contact info',
    estimatedTime: '1 min',
    icon: null,
    tips: ['We\'ll send confirmation to this email', 'Phone for urgent updates', 'Your info is secure']
  },
  {
    id: 'location',
    title: 'Location',
    shortTitle: 'Where',
    description: 'Where should we meet you?',
    mobileDescription: 'Meeting location',
    estimatedTime: '2 min',
    icon: null,
    tips: ['We travel to you', 'RON: No location needed', 'Free travel within radius']
  },
  {
    id: 'scheduling',
    title: 'Schedule',
    shortTitle: 'When',
    description: 'Pick your preferred date and time',
    mobileDescription: 'Pick date & time',
    estimatedTime: '2 min',
    icon: null,
    tips: ['Same-day available', 'Weekend appointments', 'Flexible timing options']
  },
  {
    id: 'review',
    title: 'Review & Confirm',
    shortTitle: 'Confirm',
    description: 'Review and confirm your booking',
    mobileDescription: 'Final review',
    estimatedTime: '1 min',
    icon: null,
    tips: ['Double-check details', 'Secure payment', 'Instant confirmation']
  }
];

export default function ProgressTracker({
  currentStep,
  totalSteps,
  completionProgress,
  pricing,
  pricingLoading = false,
  timeRemaining,
  isMobile = false
}: ProgressTrackerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);

  // Animation triggers
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setAnimateProgress(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768 && !isMobile) {
        // Force mobile view
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  const currentStepData = STEP_DATA[currentStep] || STEP_DATA[0];
  const isLastStep = currentStep === totalSteps - 1;

  // Mobile Progress View
  if (isMobile) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <Badge variant="secondary" className="text-xs">
                {currentStepData?.estimatedTime}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">
                {completionProgress}%
              </div>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="relative mb-3">
            <Progress 
              value={animateProgress ? completionProgress : 0} 
              className="h-2 transition-all duration-1000 ease-out"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 bg-white px-2">
                {currentStepData?.shortTitle}
              </span>
            </div>
          </div>

          {/* Mobile Step Info */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {currentStepData?.mobileDescription}
            </h3>
            <p className="text-xs text-gray-600">
              {currentStepData?.description}
            </p>
          </div>

          {/* Mobile Trust Indicators */}
          <div className="flex justify-center mt-3 space-x-3">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Zap className="h-3 w-3" />
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Star className="h-3 w-3" />
              <span>Trusted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop Progress View
  return (
    <div className="space-y-4">
      {/* Desktop Progress Header */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentStepData?.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentStepData?.description}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {currentStepData?.estimatedTime}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Step {currentStep + 1} of {totalSteps}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {animateProgress ? completionProgress : 0}%
              </div>
              <div className="text-sm text-gray-600">
                Complete
              </div>
            </div>
          </div>

          {/* Desktop Progress Bar */}
          <div className="relative mb-4">
            <Progress 
              value={animateProgress ? completionProgress : 0} 
              className="h-3 transition-all duration-1000 ease-out"
            />
            <div className="absolute inset-0 flex items-center justify-between px-2">
              {STEP_DATA.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-1 ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    index < currentStep 
                      ? 'bg-blue-600 border-blue-600' 
                      : index === currentStep 
                        ? 'bg-white border-blue-600' 
                        : 'bg-gray-200 border-gray-300'
                  }`}>
                    {index < currentStep && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden lg:block">
                    {step.shortTitle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Trust Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Zap className="h-4 w-4" />
                <span>Instant Confirmation</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Star className="h-4 w-4" />
                <span>Trusted by 10k+ Customers</span>
              </div>
            </div>

            {timeRemaining && (
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <Clock className="h-4 w-4" />
                <span>{timeRemaining} min remaining</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Desktop Step Tips */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <Monitor className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Pro Tips for This Step
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {currentStepData?.tips?.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Pricing Summary */}
      {pricing && !pricingLoading && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-900">
                  Estimated Total
                </h4>
                <p className="text-xs text-green-700">
                  Final price calculated at review step
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-900">
                  ${pricing.totalAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-green-700">
                  {pricing.breakdown && (
                    <span>
                      Base: ${pricing.breakdown.basePrice} + Travel: ${pricing.breakdown.travelFee}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desktop Loading State */}
      {pricingLoading && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm text-gray-600">Calculating pricing...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desktop Next Step Preview */}
      {!isLastStep && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Next: {STEP_DATA[currentStep + 1]?.title}
                </h4>
                <p className="text-xs text-gray-600">
                  {STEP_DATA[currentStep + 1]?.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}