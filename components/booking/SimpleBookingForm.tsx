'use client';

/**
 * Simple Booking Form - Houston Mobile Notary Pros
 * Back to basics: One form, clear pricing, easy booking.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SERVICE_PRICES = {
  'STANDARD_NOTARY': 75,
  'EXTENDED_HOURS': 100,
  'LOAN_SIGNING': 150,
  'RON_SERVICES': 35
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

  const [pricing, setPricing] = useState({ basePrice: 0, travelFee: 0, totalPrice: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.serviceType) calculatePrice();
  }, [formData.serviceType, formData.locationAddress]);

  const calculatePrice = async () => {
    try {
      const response = await fetch('/api/booking/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          address: formData.serviceType !== 'RON_SERVICES' ? formData.locationAddress : null
        })
      });
      if (response.ok) {
        const result = await response.json();
        setPricing(result);
      }
    } catch (error) {
      setPricing({
        basePrice: SERVICE_PRICES[formData.serviceType as keyof typeof SERVICE_PRICES] || 75,
        travelFee: 0,
        totalPrice: SERVICE_PRICES[formData.serviceType as keyof typeof SERVICE_PRICES] || 75
      });
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
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, pricing })
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
                  ['STANDARD_NOTARY', 'Standard Notary - $75'],
                  ['EXTENDED_HOURS', 'Extended Hours - $100'],
                  ['LOAN_SIGNING', 'Loan Signing - $150'],
                  ['RON_SERVICES', 'Remote Online Notarization - $35']
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
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.bookingTime}
                  onChange={(e) => handleChange('bookingTime', e.target.value)}
                />
              </div>
            </div>

            {/* Price Display */}
            {formData.serviceType && (
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={!formData.serviceType || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Processing...' : `Book Now - $${pricing.totalPrice}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}