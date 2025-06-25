"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface PaymentOption {
  mode: 'full' | 'deposit';
  amount: number;
  description: string;
  benefits: string[];
  recommended?: boolean;
}

interface PaymentModeSelectorProps {
  totalAmount: number;
  depositAmount?: number;
  requiresDeposit: boolean;
  selectedMode: 'full' | 'deposit';
  onModeChange: (mode: 'full' | 'deposit') => void;
  isRONService?: boolean;
  className?: string;
}

export default function PaymentModeSelector({
  totalAmount,
  depositAmount = 0,
  requiresDeposit,
  selectedMode,
  onModeChange,
  isRONService = false,
  className = ""
}: PaymentModeSelectorProps) {
  const remainingBalance = totalAmount - depositAmount;
  
  // Calculate payment options
  const paymentOptions: PaymentOption[] = [
    {
      mode: 'full',
      amount: totalAmount,
      description: 'Pay the complete amount now',
      benefits: [
        'No remaining balance',
        'Booking fully secured',
        'No payment at service time',
        isRONService ? 'Immediate RON session access' : 'Complete peace of mind'
      ],
      recommended: !requiresDeposit || totalAmount < 200 // Recommend full for smaller amounts
    },
    ...(requiresDeposit ? [{
      mode: 'deposit' as const,
      amount: depositAmount,
      description: `Pay ${formatCurrency(depositAmount)} now, ${formatCurrency(remainingBalance)} at service`,
      benefits: [
        'Lower upfront cost',
        'Secures your appointment',
        `Pay remaining ${formatCurrency(remainingBalance)} in person`,
        'Flexible payment timing'
      ],
      recommended: requiresDeposit && totalAmount >= 200 // Recommend deposit for larger amounts
    }] : [])
  ];

  return (
    <Card className={`border-2 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Options
        </CardTitle>
        <CardDescription>
          Choose how you'd like to pay for your {isRONService ? 'RON' : 'notary'} service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedMode} 
          onValueChange={(value) => onModeChange(value as 'full' | 'deposit')}
          className="space-y-4"
        >
          {paymentOptions.map((option) => (
            <div key={option.mode} className="relative">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={option.mode} id={option.mode} />
                <Label 
                  htmlFor={option.mode} 
                  className="flex-1 cursor-pointer"
                >
                  <Card className={`transition-all duration-200 ${
                    selectedMode === option.mode 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {option.mode === 'full' ? 'Pay in Full' : 'Pay Deposit'}
                          </h3>
                          {option.recommended && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(option.amount)}
                          </div>
                          {option.mode === 'deposit' && (
                            <div className="text-sm text-gray-600">
                              + {formatCurrency(remainingBalance)} later
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {option.description}
                      </p>
                      
                      <div className="space-y-1">
                        {option.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      
                      {option.mode === 'deposit' && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2 text-sm text-yellow-800">
                            <Clock className="h-4 w-4" />
                            <span>
                              Remaining balance due at appointment: {formatCurrency(remainingBalance)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        {/* Payment Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Secure Payment Processing</p>
              <p>
                All payments are processed securely through Stripe. We never store your card information. 
                {selectedMode === 'deposit' && ' The remaining balance can be paid by card or cash at your appointment.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}