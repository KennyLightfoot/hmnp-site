'use client';

/**
 * Payment Recovery Form Component
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Features:
 * - Failed payment analysis and recovery
 * - Multiple retry strategies
 * - Alternative payment method suggestions
 * - Customer support integration
 * - Payment failure education
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Building,
  Smartphone,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  DollarSign,
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaymentFailure {
  id: string;
  bookingId: string;
  amount: number;
  originalMethod: string;
  failureReason: string;
  stripeErrorCode?: string;
  customerMessage: string;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

export interface RecoveryOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'retry' | 'alternative' | 'support';
  successRate: number;
  processingTime: string;
  recommended: boolean;
}

export interface PaymentRecoveryFormProps {
  failure: PaymentFailure;
  onRetryPayment: (option: RecoveryOption) => Promise<void>;
  onAlternativePayment: (method: string) => Promise<void>;
  onContactSupport: () => void;
  onCancel: () => void;
  className?: string;
}

const RECOVERY_OPTIONS: RecoveryOption[] = [
  {
    id: 'retry-same-method',
    name: 'Retry Same Payment Method',
    description: 'Try the same card again (may have been a temporary issue)',
    icon: RefreshCw,
    type: 'retry',
    successRate: 65,
    processingTime: 'Instant',
    recommended: true
  },
  {
    id: 'different-card',
    name: 'Use Different Card',
    description: 'Try a different credit or debit card',
    icon: CreditCard,
    type: 'alternative',
    successRate: 85,
    processingTime: 'Instant',
    recommended: true
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer (ACH)',
    description: 'Pay directly from your checking account',
    icon: Building,
    type: 'alternative',
    successRate: 95,
    processingTime: '2-3 business days',
    recommended: false
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    description: 'Quick and secure with Face ID or Touch ID',
    icon: Smartphone,
    type: 'alternative',
    successRate: 90,
    processingTime: 'Instant',
    recommended: false
  },
  {
    id: 'contact-support',
    name: 'Contact Support',
    description: 'Get help from our payment specialists',
    icon: Phone,
    type: 'support',
    successRate: 100,
    processingTime: '5-10 minutes',
    recommended: false
  }
];

const FAILURE_REASONS = {
  'card_declined': {
    title: 'Card Declined',
    description: 'Your card was declined by your bank',
    solutions: [
      'Check your card balance',
      'Verify card details are correct',
      'Contact your bank to authorize the transaction',
      'Try a different payment method'
    ]
  },
  'insufficient_funds': {
    title: 'Insufficient Funds',
    description: 'Your account doesn\'t have enough funds',
    solutions: [
      'Add funds to your account',
      'Use a different payment method',
      'Consider paying a deposit instead of full amount'
    ]
  },
  'expired_card': {
    title: 'Expired Card',
    description: 'Your card has expired',
    solutions: [
      'Update your card information',
      'Use a different card',
      'Contact your bank for a replacement'
    ]
  },
  'incorrect_cvc': {
    title: 'Incorrect Security Code',
    description: 'The CVC code entered is incorrect',
    solutions: [
      'Check the 3-digit code on the back of your card',
      'For American Express, use the 4-digit code on the front',
      'Re-enter the security code carefully'
    ]
  },
  'processing_error': {
    title: 'Processing Error',
    description: 'A temporary error occurred during processing',
    solutions: [
      'Try again in a few moments',
      'Check your internet connection',
      'Use a different payment method'
    ]
  }
};

export default function PaymentRecoveryForm({
  failure,
  onRetryPayment,
  onAlternativePayment,
  onContactSupport,
  onCancel,
  className = ''
}: PaymentRecoveryFormProps) {
  const [selectedOption, setSelectedOption] = useState<RecoveryOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Get failure reason details
  const failureDetails = FAILURE_REASONS[failure.stripeErrorCode as keyof typeof FAILURE_REASONS] || {
    title: 'Payment Failed',
    description: failure.customerMessage,
    solutions: [
      'Try a different payment method',
      'Contact support for assistance',
      'Check your payment information'
    ]
  };

  // Handle recovery option selection
  const handleOptionSelect = async (option: RecoveryOption) => {
    setSelectedOption(option);
    setIsProcessing(true);

    try {
      if (option.type === 'retry') {
        await onRetryPayment(option);
      } else if (option.type === 'alternative') {
        await onAlternativePayment(option.id);
      } else if (option.type === 'support') {
        onContactSupport();
      }
    } catch (error) {
      console.error('Recovery option failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get option styling
  const getOptionStyling = (option: RecoveryOption) => {
    const isSelected = selectedOption?.id === option.id;
    
    return cn(
      'transition-all duration-200 cursor-pointer',
      isSelected 
        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
        : 'hover:border-gray-300 hover:shadow-sm',
      option.recommended && 'border-green-200 bg-green-50'
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Failure Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Payment Failed:</strong> {failureDetails.title}
        </AlertDescription>
      </Alert>

      {/* Failure Analysis */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <Info className="h-5 w-5" />
            <span>What Happened?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-orange-700">
            {failureDetails.description}
          </p>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-800">Possible Solutions:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              {failureDetails.solutions.map((solution, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </Button>

          {showDetails && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <div className="text-xs space-y-1">
                <div><strong>Error Code:</strong> {failure.stripeErrorCode || 'Unknown'}</div>
                <div><strong>Retry Count:</strong> {failure.retryCount}/{failure.maxRetries}</div>
                <div><strong>Timestamp:</strong> {new Date(failure.timestamp).toLocaleString()}</div>
                <div><strong>Amount:</strong> ${failure.amount.toFixed(2)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovery Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span>Recovery Options</span>
          </CardTitle>
          <CardDescription>
            Choose how you'd like to resolve this payment issue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECOVERY_OPTIONS.map((option) => (
              <div key={option.id} className="relative">
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id} 
                  className="sr-only"
                  checked={selectedOption?.id === option.id}
                  onChange={() => setSelectedOption(option)}
                />
                <Label
                  htmlFor={option.id}
                  className="cursor-pointer block"
                >
                  <Card className={getOptionStyling(option)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <option.icon className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{option.name}</span>
                              {option.recommended && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  Recommended
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {option.successRate}% success rate
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              {option.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.processingTime}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOptionSelect(option);
                          }}
                          disabled={isProcessing}
                          className="ml-4"
                        >
                          {isProcessing && selectedOption?.id === option.id ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Try This
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support Options */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <HelpCircle className="h-5 w-5" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded border border-blue-200">
              <Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-800">Call Support</div>
              <div className="text-xs text-blue-700 mb-2">(713) 555-0123</div>
              <Button
                variant="outline"
                size="sm"
                onClick={onContactSupport}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Call Now
              </Button>
            </div>
            
            <div className="text-center p-3 bg-white rounded border border-blue-200">
              <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-800">Email Support</div>
              <div className="text-xs text-blue-700 mb-2">support@hmnp.com</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('mailto:support@hmnp.com', '_blank')}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Send Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isProcessing}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Booking
        </Button>
        
        <Button
          onClick={() => window.location.reload()}
          className="flex-1"
          disabled={isProcessing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>🔒 All payment attempts are secure and encrypted</p>
        <p>💳 We never store your full payment details</p>
        <p>🛡️ Your information is protected by Stripe's security standards</p>
      </div>
    </div>
  );
} 