"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, Check, X, Percent, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PromoCodeData {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
}

interface PromoCodeValidationResult {
  isValid: boolean;
  promoCode?: PromoCodeData;
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
  originalAmount: number;
}

interface PromoCodeInputProps {
  serviceId: string;
  originalAmount: number;
  customerEmail?: string;
  onPromoCodeApplied: (result: PromoCodeValidationResult | null) => void;
  appliedPromoCode?: PromoCodeValidationResult | null;
}

export default function PromoCodeInput({
  serviceId,
  originalAmount,
  customerEmail,
  onPromoCodeApplied,
  appliedPromoCode
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState(appliedPromoCode?.promoCode?.code || '');
  const [loading, setLoading] = useState(false);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: 'Enter promo code',
        description: 'Please enter a promo code to validate',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          serviceId,
          originalAmount,
          customerEmail
        })
      });

      const data: PromoCodeValidationResult = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate promo code');
      }

      if (data.isValid) {
        onPromoCodeApplied(data);
        toast({
          title: 'Promo code applied!',
          description: `You saved $${data.discountAmount?.toFixed(2)}`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: 'Invalid promo code',
        description: error instanceof Error ? error.message : 'Please check your promo code and try again',
        variant: 'destructive'
      });
      onPromoCodeApplied(null);
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    onPromoCodeApplied(null);
    toast({
      title: 'Promo code removed',
      description: 'The discount has been removed from your order',
    });
  };

  const formatDiscountDisplay = (promoCodeData: PromoCodeData, discountAmount: number) => {
    if (promoCodeData.discountType === 'PERCENTAGE') {
      return (
        <div className="flex items-center gap-1">
          <Percent className="h-3 w-3" />
          {promoCodeData.discountValue}% off (-${discountAmount.toFixed(2)})
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          ${discountAmount.toFixed(2)} off
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Promo Code
        </CardTitle>
        <CardDescription>
          Have a discount code? Enter it here to save on your deposit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!appliedPromoCode ? (
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  validatePromoCode();
                }
              }}
              disabled={loading}
            />
            <Button 
              onClick={validatePromoCode}
              disabled={loading || !promoCode.trim()}
              size="default"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Applied Promo Code Display */}
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">
                    {appliedPromoCode.promoCode?.code}
                  </div>
                  {appliedPromoCode.promoCode?.description && (
                    <div className="text-sm text-green-600">
                      {appliedPromoCode.promoCode.description}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removePromoCode}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Discount Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Original amount:</span>
                <span>${appliedPromoCode.originalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>
                  {appliedPromoCode.promoCode && appliedPromoCode.discountAmount && 
                    formatDiscountDisplay(appliedPromoCode.promoCode, appliedPromoCode.discountAmount)
                  }
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Final amount:</span>
                <span>${appliedPromoCode.finalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sample Promo Codes (for demo/testing) */}
        {!appliedPromoCode && (
          <div className="text-xs text-muted-foreground">
            <p>Try these sample codes:</p>
            <div className="flex gap-2 mt-1">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setPromoCode('WELCOME10')}
              >
                WELCOME10
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setPromoCode('SAVE25')}
              >
                SAVE25
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 