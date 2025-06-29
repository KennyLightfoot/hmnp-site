"use client";

import { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, DollarSign, Users, Tag, Sparkles } from 'lucide-react';
import type { Service, UnifiedBookingFormData } from './types';

interface ServiceSelectionProps {
  services: Service[];
  loading?: boolean;
  onServiceSelect?: (service: Service) => void;
}

export function ServiceSelection({ services, loading = false, onServiceSelect }: ServiceSelectionProps) {
  const { control, setValue, getValues } = useFormContext<UnifiedBookingFormData>();
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [promoCodeDiscount, setPromoCodeDiscount] = useState(0);
  
  // Watch form values for reactive UI
  const selectedServiceId = useWatch({ control, name: 'serviceId' });
  const numberOfSigners = useWatch({ control, name: 'numberOfSigners' });
  const promoCode = useWatch({ control, name: 'promoCode' });

  const selectedService = services.find(s => s.id === selectedServiceId);

  // Calculate pricing
  const basePrice = selectedService?.basePrice || 0;
  const signerMultiplier = numberOfSigners || 1;
  const subtotal = basePrice * signerMultiplier;
  const discount = promoCodeApplied ? promoCodeDiscount : 0;
  const total = Math.max(0, subtotal - discount);

  const handleServiceSelect = (service: Service) => {
    setValue('serviceId', service.id);
    onServiceSelect?.(service);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode?.trim() || !selectedService) return;
    
    try {
      // Simulate promo code validation
      if (promoCode.toUpperCase() === 'FIRST25') {
        setPromoCodeDiscount(25);
        setPromoCodeApplied(true);
      }
    } catch (error) {
      console.error('Promo code validation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading services...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose Your Service
        </h3>
        
        <FormField
          control={control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedServiceId === service.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {service.description}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${service.basePrice}
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.durationMinutes} min
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.durationMinutes} minutes
                          </div>
                          {service.requiresDeposit && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Deposit required
                            </div>
                          )}
                          <Badge variant="secondary">
                            {service.isActive ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Number of Signers */}
      {selectedService && (
        <div>
          <FormField
            control={control}
            name="numberOfSigners"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Signers
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('numberOfSigners', Math.max(1, (numberOfSigners || 1) - 1))}
                      disabled={(numberOfSigners || 1) <= 1}
                    >
                      -
                    </Button>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="10"
                      className="text-center w-20"
                      value={numberOfSigners || 1}
                      onChange={(e) => setValue('numberOfSigners', parseInt(e.target.value) || 1)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('numberOfSigners', Math.min(10, (numberOfSigners || 1) + 1))}
                      disabled={(numberOfSigners || 1) >= 10}
                    >
                      +
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Promo Code */}
      {selectedService && (
        <div>
          <FormField
            control={control}
            name="promoCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Promo Code (Optional)
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="Enter promo code"
                      className="uppercase"
                      disabled={promoCodeApplied}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyPromoCode}
                      disabled={!field.value?.trim() || promoCodeApplied}
                    >
                      Apply
                    </Button>
                  </div>
                </FormControl>
                {promoCodeApplied && (
                  <Alert className="mt-2">
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      Promo code applied! You saved ${promoCodeDiscount}.
                    </AlertDescription>
                  </Alert>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Pricing Summary */}
      {selectedService && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>{selectedService.name}</span>
              <span>${basePrice}</span>
            </div>
            {(numberOfSigners || 1) > 1 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>× {numberOfSigners} signers</span>
                <span>${subtotal}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo discount</span>
                <span>-${discount}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total}</span>
            </div>
            {selectedService.requiresDeposit && (
              <div className="text-sm text-gray-600">
                Deposit required: ${selectedService.depositAmount || Math.round(total * 0.5)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}