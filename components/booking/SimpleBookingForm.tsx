'use client';

/**
 * Simple Booking Form - Houston Mobile Notary Pros
 * Back to basics: One form, clear pricing, easy booking.
 */

import React, { useState, useEffect } from 'react';
import { debugApiResponse } from '@/lib/api-debug';
import { DateTime } from 'luxon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard } from 'lucide-react';
import { getServiceId } from '@/lib/services/serviceIdMap';

const SERVICE_PRICES = {
  'QUICK_STAMP_LOCAL': 50,
  'STANDARD_NOTARY': 75,
  'EXTENDED_HOURS': 100,
  'LOAN_SIGNING': 150,
  'ESTATE_PLANNING': 250,
  'SPECIALTY_NOTARY': 150,
  'BUSINESS_SOLUTIONS': 250,
  'RON_SERVICES': 35,
  'BUSINESS_ESSENTIALS': 125,
  'BUSINESS_GROWTH': 349
};

export default function SimpleBookingForm() {
  const [formData, setFormData] = useState({
    serviceType: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    bookingTime: '',
    locationAddress: ''
  });

  const [pricing, setPricing] = useState({ 
    basePrice: 0, 
    travelFee: 0, 
    totalPrice: 0,
    transparentData: null as any
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.serviceType) calculatePrice();
  }, [formData.serviceType, formData.locationAddress]);

  useEffect(() => {
    if (formData.serviceType && formData.bookingDate) {
      fetchAvailableSlots();
    }
  }, [formData.serviceType, formData.bookingDate]);

  const calculatePrice = async () => {
    try {
      // Use new transparent pricing API
      const response = await fetch('/api/pricing/transparent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          address: formData.serviceType !== 'RON_SERVICES' ? formData.locationAddress : null,
          documentCount: 1,
          signerCount: 1,
          customerType: 'new',
          scheduledDateTime: formData.bookingDate && formData.bookingTime ? 
            `${formData.bookingDate}T${formData.bookingTime.split('T')[1] || '10:00:00'}` : undefined
        })
      });
      
      if (response.ok) {
        const result = await response.json();

        // 🔍 Verbose API debugging
        debugApiResponse('/api/pricing/transparent', response, result);
        if (result.success) {
          // Transform transparent pricing to simple format for backward compatibility
          setPricing({
            basePrice: result.basePrice,
            travelFee: result.breakdown.travelFee?.amount || 0,
            totalPrice: result.totalPrice,
            // Store full transparent data for enhanced display
            transparentData: result
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error('Pricing calculation failed');
      }
    } catch (error) {
      console.warn('Falling back to basic pricing:', error);
      setPricing({
        basePrice: SERVICE_PRICES[formData.serviceType as keyof typeof SERVICE_PRICES] || 75,
        travelFee: 0,
        totalPrice: SERVICE_PRICES[formData.serviceType as keyof typeof SERVICE_PRICES] || 75,
        transparentData: null
      });
    }
  };

  const fetchAvailableSlots = async () => {
    setIsLoadingSlots(true);
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, bookingTime: '' })); // Clear selected time
    
    try {
      let serviceId: string;
      try {
        serviceId = getServiceId(formData.serviceType);
      } catch (err) {
        setError('Invalid or unsupported service type selected');
        return;
      }
      
      // Use the WORKING availability endpoint
      const response = await fetch(
        `/api/availability?serviceId=${serviceId}&date=${formData.bookingDate}&timezone=America/Chicago`
      );
      
      if (response.ok) {
        const result = await response.json();

        // 🔍 Verbose API debugging
        debugApiResponse('/api/availability', response, result);
        if (result.availableSlots) {
          // Transform the response to match expected format
          const transformedSlots = result.availableSlots.map((slot: any) => ({
            startTime: `${formData.bookingDate}T${slot.startTime}:00`,
            endTime: `${formData.bookingDate}T${slot.endTime}:00`,
            displayTime: slot.startTime,
            duration: 60,
            available: slot.available
          })).filter((slot: any) => slot.available);
          
          setAvailableSlots(transformedSlots);
        } else {
          setError(result.message || 'No available times for this date');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Unable to load available times');
      }
    } catch (error) {
      console.error('Availability fetch error:', error);
      setError('Unable to load available times');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceType || !formData.customerName || !formData.customerEmail || 
        !formData.bookingDate || !formData.bookingTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.serviceType !== 'RON_SERVICES' && !formData.locationAddress) {
      setError('Address is required for mobile services');
      return;
    }

    setIsSubmitting(true);
    try {
      // 🛡️ Safe date parsing – protect against invalid values
      let scheduledDateTimeISO: string;
      try {
        if (!formData.bookingTime) {
          throw new Error('No booking time selected');
        }

        const dt = DateTime.fromISO(formData.bookingTime, { zone: 'America/Chicago' });

        if (!dt.isValid) {
          console.error('❌ Invalid ISO received for bookingTime', {
            bookingTime: formData.bookingTime,
            explain: dt.invalidExplanation,
            reason: dt.invalidReason,
          });
          throw new Error('Invalid date selected');
        }

        scheduledDateTimeISO = dt.toISO();
      } catch (dateErr: any) {
        console.error('Date conversion error:', dateErr);
        setError('Invalid date selected. Please choose another time.');
        return;
      }

      console.log('📤 Preparing booking payload with datetime:', scheduledDateTimeISO);

      const bookingData: any = {
        serviceType: formData.serviceType,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        scheduledDateTime: scheduledDateTimeISO,
        timeZone: 'America/Chicago',
       
        // Enhanced pricing with transparent data
        pricing: {
          basePrice: pricing.basePrice,
          travelFee: pricing.travelFee,
          totalPrice: pricing.totalPrice,
          transparentData: pricing.transparentData ?? undefined
        },
        numberOfDocuments: 1,
        numberOfSigners: 1
      };

      // Optional phone
      if (formData.customerPhone) {
        bookingData.customerPhone = formData.customerPhone;
      }

      // Address only for mobile services and when provided
      if (formData.serviceType !== 'RON_SERVICES' && formData.locationAddress) {
        Object.assign(bookingData, {
          locationType: 'OTHER',
          addressStreet: formData.locationAddress,
          addressCity: 'Houston',
          addressState: 'TX',
          addressZip: '77001'
        });
      }

      const response = await fetch('/api/booking/ghl-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = `/booking/success?id=${result.booking.id}`;
      } else {
        setError('Booking failed. Please try again.');
      }
    } catch (error) {
      setError('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Your Notary Service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Service Selection */}
            <div>
              <Label className="font-semibold">Select Service *</Label>
              <div className="grid gap-2 mt-2">
                {[
                  // Core Mobile Services
                  ['QUICK_STAMP_LOCAL', 'Quick-Stamp Local - $50'],
                  ['STANDARD_NOTARY', 'Standard Mobile Notary - $75'],
                  ['EXTENDED_HOURS', 'Extended Hours Mobile - $100'],
                  ['LOAN_SIGNING', 'Loan Signing Specialist - $150'],
                  
                  // Specialized Services
                  ['ESTATE_PLANNING', 'Estate Planning Package - $250'],
                  ['SPECIALTY_NOTARY', 'Specialty Notary Services - $150'],
                  ['BUSINESS_SOLUTIONS', 'Business Notary Solutions - $250'],
                  
                  // Remote & Subscription Services
                  ['RON_SERVICES', 'Remote Online Notarization - $35'],
                  ['BUSINESS_ESSENTIALS', 'Business Subscription Essentials - $125/month'],
                  ['BUSINESS_GROWTH', 'Business Subscription Growth - $349/month']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="serviceType"
                      value={key}
                      checked={formData.serviceType === key}
                      onChange={(e) => handleChange('serviceType', e.target.value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            {/* Address for mobile services */}
            {formData.serviceType && formData.serviceType !== 'RON_SERVICES' && (
              <div>
                <Label htmlFor="address">Service Address *</Label>
                <Input
                  id="address"
                  value={formData.locationAddress}
                  onChange={(e) => handleChange('locationAddress', e.target.value)}
                  placeholder="123 Main St, Houston, TX 77001"
                />
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => handleChange('bookingDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Available Times *</Label>
                {formData.bookingDate && formData.serviceType ? (
                  <>
                    {isLoadingSlots ? (
                      <div className="p-3 text-center text-gray-500 border rounded">
                        Loading available times...
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <select
                        id="time"
                        value={formData.bookingTime}
                        onChange={(e) => handleChange('bookingTime', e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select a time</option>
                        {availableSlots.map((slot, index) => {
                          // 🎨 UI render log
                          console.log(`🕐 [FRONTEND] Rendering slot ${index}`, slot);
                          return (
                            <option key={index} value={slot.startTime}>
                              {slot.displayTime} ({slot.duration} min)
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <div className="p-3 text-center text-gray-500 border rounded">
                        No available times for this date. Please select a different date.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 text-center text-gray-400 border rounded">
                    Select service and date to see available times
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Price Display */}
            {formData.serviceType && (
              <div className="space-y-3">
                {/* Transparent Pricing Display */}
                {pricing.transparentData ? (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-blue-900">Transparent Pricing</h3>
                      {pricing.transparentData.businessRules?.dynamicPricingActive && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                          Dynamic Pricing
                        </span>
                      )}
                    </div>
                    
                    {/* Breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{pricing.transparentData.breakdown.serviceBase.label}:</span>
                        <span>${pricing.transparentData.breakdown.serviceBase.amount}</span>
                      </div>
                      
                      {pricing.transparentData.breakdown.travelFee && (
                        <div className="flex justify-between">
                          <span>{pricing.transparentData.breakdown.travelFee.label}:</span>
                          <span>${pricing.transparentData.breakdown.travelFee.amount}</span>
                        </div>
                      )}
                      
                      {pricing.transparentData.breakdown.timeBasedSurcharges?.map((surcharge: any, index: number) => (
                        <div key={index} className="flex justify-between text-orange-700">
                          <span>{surcharge.label}:</span>
                          <span>+${surcharge.amount}</span>
                        </div>
                      ))}
                      
                      {pricing.transparentData.breakdown.discounts?.map((discount: any, index: number) => (
                        <div key={index} className="flex justify-between text-green-700">
                          <span>{discount.label}:</span>
                          <span>-${discount.amount}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between font-bold border-t border-blue-200 pt-2 mt-3 text-blue-900">
                      <span>Total:</span>
                      <span>${pricing.totalPrice}</span>
                    </div>
                    
                    {/* Why This Price */}
                    {pricing.transparentData.transparency?.whyThisPrice && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <strong>Why this price?</strong> {pricing.transparentData.transparency.whyThisPrice}
                      </div>
                    )}
                    
                    {/* Savings Options */}
                    {pricing.transparentData.transparency?.alternatives && 
                     pricing.transparentData.transparency.alternatives.length > 0 && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="text-xs font-medium text-green-800 mb-1">💰 Save Money:</div>
                        {pricing.transparentData.transparency.alternatives.slice(0, 2).map((alt: any, index: number) => (
                          <div key={index} className="text-xs text-green-700">
                            • {alt.serviceType.replace(/_/g, ' ')}: ${alt.price} (save ${alt.savings})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback Basic Display */
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>${pricing.basePrice}</span>
                    </div>
                    {pricing.travelFee > 0 && (
                      <div className="flex justify-between">
                        <span>Travel:</span>
                        <span>${pricing.travelFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span>${pricing.totalPrice}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* CRITICAL: PAYMENT REQUIRED BEFORE BOOKING */}
            <div className="border-t pt-4 mt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Payment Required</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete payment to secure your booking. You'll receive instant confirmation.
                </p>
              </div>
              
              <Button
                type="button"
                disabled={!formData.serviceType || isSubmitting}
                onClick={() => {
                  // Redirect to full booking form with payment collection
                  const params = new URLSearchParams({
                    serviceType: formData.serviceType,
                    customerName: formData.customerName,
                    customerEmail: formData.customerEmail,
                    customerPhone: formData.customerPhone || '',
                    bookingDate: formData.bookingDate,
                    bookingTime: formData.bookingTime,
                    locationAddress: formData.locationAddress || '',
                    totalPrice: pricing.totalPrice.toString()
                  });
                  window.location.href = `/booking/checkout?${params.toString()}`;
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Continue to Payment - $${pricing.totalPrice}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}