/**
 * 🚀 HMNP V2 Booking Form
 * Gorgeous, fast, bulletproof booking experience
 * Connected to our legendary V2 APIs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, DollarSign, Phone, Mail, User, FileText, Shield, Star } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// 🎯 TYPES & INTERFACES
// ============================================================================

interface Service {
  id: string;
  name: string;
  type: 'MOBILE' | 'RON';
  description: string;
  basePrice: number;
  depositRequired: boolean;
  depositAmount?: number;
  duration: number;
  maxSigners: number;
  maxDocuments: number;
  features: string[];
  availability: string;
  serviceArea?: string;
  isActive: boolean;
}

interface PricingCalculation {
  serviceId: string;
  serviceName: string;
  serviceType: 'MOBILE' | 'RON';
  basePrice: number;
  travelFee: number;
  timeSurcharge: number;
  emergencyFee: number;
  promoDiscount: number;
  subtotal: number;
  taxAmount: number;
  finalPrice: number;
  depositRequired: boolean;
  depositAmount: number;
  breakdown: Array<{
    item: string;
    description: string;
    amount: number;
    type: 'base' | 'fee' | 'discount' | 'tax';
  }>;
  calculatedAt: string;
  pricingVersion: string;
  distanceInfo?: {
    distanceMiles: number;
    durationMinutes: number;
    withinStandardArea: boolean;
    withinExtendedArea: boolean;
  };
}

interface BookingFormData {
  serviceId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  scheduledDateTime: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  locationNotes?: string;
  specialInstructions?: string;
  promoCode?: string;
  termsAccepted: boolean;
  smsNotifications: boolean;
  emailUpdates: boolean;
}

// ============================================================================
// 🛡️ VALIDATION SCHEMA
// ============================================================================

const BookingFormSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().regex(/^[\+]?[\d\s\(\)\-\.]{10,}$/, 'Please enter a valid phone number'),
  scheduledDateTime: z.string().min(1, 'Please select a date and time'),
  addressStreet: z.string().min(1, 'Street address is required'),
  addressCity: z.string().min(1, 'City is required'),
  addressState: z.string().length(2, 'State must be 2 characters (e.g., TX)'),
  addressZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits (e.g., 77591)'),
  locationNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
  promoCode: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  smsNotifications: z.boolean().optional(),
  emailUpdates: z.boolean().optional()
});

// ============================================================================
// 🎨 MAIN COMPONENT
// ============================================================================

export default function BookingFormV2() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [pricing, setPricing] = useState<PricingCalculation | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      addressState: 'TX',
      smsNotifications: true,
      emailUpdates: true,
      termsAccepted: false
    }
  });

  const { watch } = form;
  const watchedValues = watch(['serviceId', 'scheduledDateTime', 'addressStreet', 'addressCity', 'addressState', 'addressZip', 'promoCode']);

  // ============================================================================
  // 🚀 EFFECTS & DATA LOADING
  // ============================================================================

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  // Calculate pricing when relevant fields change
  useEffect(() => {
    const shouldCalculatePricing = () => {
      if (!selectedService || !watchedValues[1]) return false; // Need service and date
      
      // For mobile services, need address
      if (selectedService.type === 'MOBILE') {
        return watchedValues[2] && watchedValues[3] && watchedValues[4] && watchedValues[5]; // street, city, state, zip
      }
      
      // For RON services, just need service and date
      return true;
    };
    
    if (shouldCalculatePricing()) {
      calculatePricing();
    } else {
      // Clear pricing if requirements not met
      setPricing(null);
    }
  }, [selectedService, watchedValues[1], watchedValues[2], watchedValues[3], watchedValues[4], watchedValues[5], watchedValues[6]]); // Include promo code

  // ============================================================================
  // 🎯 API FUNCTIONS
  // ============================================================================

  const loadServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await fetch('/api/v2/services?include_pricing=true');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data.services);
      } else {
        toast.error('Failed to load services');
      }
    } catch (error) {
      toast.error('Failed to load services');
      console.error('Error loading services:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const calculatePricing = async () => {
    if (!selectedService || isCalculatingPrice) return;

    try {
      setIsCalculatingPrice(true);
      
      // Transform datetime format for API if needed
      let formattedDateTime = watchedValues[1];
      if (formattedDateTime && !formattedDateTime.includes('Z')) {
        // If it's datetime-local format, convert to ISO
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(formattedDateTime)) {
          formattedDateTime = new Date(formattedDateTime + ':00').toISOString();
        }
      }
      
      const address = selectedService.type === 'MOBILE' ? {
        street: watchedValues[2],
        city: watchedValues[3],
        state: watchedValues[4],
        zip: watchedValues[5]
      } : undefined;

      const requestPayload = {
        serviceId: selectedService.id,
        scheduledDateTime: formattedDateTime,
        address,
        promoCode: watchedValues[6] || undefined
      };

      console.log('Calculating pricing with payload:', requestPayload);

      const response = await fetch('/api/v2/services/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const data = await response.json();
      
      if (data.success) {
        setPricing(data.data.pricing);
        console.log('Pricing calculated successfully:', data.data.pricing);
      } else {
        console.error('Pricing calculation failed:', data.error);
        toast.error(data.error?.message || 'Failed to calculate pricing');
        setPricing(null);
      }
    } catch (error) {
      console.error('Error calculating pricing:', error);
      toast.error('Failed to calculate pricing - please try again');
      setPricing(null);
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const submitBooking = async (data: BookingFormData) => {
    if (!pricing) {
      toast.error('Please wait for pricing calculation');
      return;
    }

    try {
      setIsSubmitting(true);

      // Transform datetime format from datetime-local to ISO format
      const transformedData = {
        ...data,
        scheduledDateTime: data.scheduledDateTime 
          ? new Date(data.scheduledDateTime + ':00').toISOString() 
          : data.scheduledDateTime
      };

      const bookingData = {
        ...transformedData,
        locationType: selectedService?.type === 'RON' ? 'REMOTE_ONLINE' : 'CLIENT_SPECIFIED_ADDRESS',
        address: selectedService?.type === 'MOBILE' ? {
          street: data.addressStreet,
          city: data.addressCity,
          state: data.addressState,
          zip: data.addressZip
        } : undefined,
        expectedFinalPrice: pricing.finalPrice
      };

      const response = await fetch('/api/v2/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Booking created successfully!');
        // TODO: Redirect to payment page
        console.log('Booking created:', result.data.booking);
      } else {
        toast.error(result.error.message || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('Failed to create booking');
      console.error('Error creating booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // 🎨 SERVICE SELECTION COMPONENT
  // ============================================================================

  const ServiceSelector = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold">Choose Your Service</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select the notary service that best fits your needs
        </p>
      </div>

      {isLoadingServices ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map(service => (
            <Card 
              key={service.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedService?.id === service.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedService(service);
                form.setValue('serviceId', service.id);
                setCurrentStep(2);
              }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${service.basePrice.toFixed(2)}
                    </div>
                    {service.depositRequired && (
                      <div className="text-sm text-muted-foreground">
                        ${service.depositAmount?.toFixed(2)} deposit
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={service.type === 'RON' ? 'default' : 'secondary'}>
                    {service.type === 'RON' ? '💻 Remote Online' : '🚗 Mobile Service'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration} min
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {service.maxSigners} signers
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium mb-2">Features:</div>
                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Availability:</div>
                    <p className="text-muted-foreground">{service.availability}</p>
                    {service.serviceArea && (
                      <p className="text-muted-foreground mt-1">{service.serviceArea}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ============================================================================
  // 🎨 PRICING DISPLAY COMPONENT
  // ============================================================================

  const PricingDisplay = () => {
    if (!pricing && !isCalculatingPrice) {
      // Show a message when pricing prerequisites aren't met
      return (
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="text-yellow-800">
              {selectedService?.type === 'MOBILE' 
                ? 'Please fill in your address to see pricing'
                : 'Please select a date and time to see pricing'
              }
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="w-5 h-5" />
            Pricing Breakdown
          </CardTitle>
          <CardDescription>
            {isCalculatingPrice ? 'Calculating...' : 'Your personalized quote'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCalculatingPrice ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {pricing.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.description}</div>
                    {item.type === 'discount' && (
                      <div className="text-sm text-green-600">Discount applied!</div>
                    )}
                  </div>
                  <div className={`font-semibold ${
                    item.type === 'discount' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {item.amount >= 0 ? '$' : '-$'}{Math.abs(item.amount).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-green-600">${pricing.finalPrice.toFixed(2)}</span>
              </div>
              
              {pricing.depositRequired && (
                <div className="text-sm text-center text-muted-foreground bg-blue-50 p-3 rounded">
                  💡 Only ${pricing.depositAmount.toFixed(2)} deposit required to secure your booking
                </div>
              )}
              
              {pricing.distanceInfo && (
                <div className="text-xs text-muted-foreground">
                  📍 Distance: {pricing.distanceInfo.distanceMiles.toFixed(1)} miles
                  {pricing.distanceInfo.withinStandardArea 
                    ? ' (within standard service area)' 
                    : ' (travel fee applied)'
                  }
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // 🎨 MAIN RENDER
  // ============================================================================

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Book Your Notary Service
        </h1>
        <p className="text-xl text-muted-foreground">
          Professional, reliable notary services in Houston and surrounding areas
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[
            { step: 1, label: 'Select Service', icon: FileText },
            { step: 2, label: 'Schedule & Location', icon: Calendar },
            { step: 3, label: 'Contact Info', icon: User },
            { step: 4, label: 'Review & Pay', icon: Shield }
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? '✓' : <Icon className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {label}
              </span>
              {step < 4 && <div className="w-8 h-px bg-gray-300 ml-4" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(submitBooking)} className="space-y-8">
        {/* Step 1: Service Selection */}
        {currentStep >= 1 && <ServiceSelector />}

        {/* Step 2: Schedule & Location */}
        {currentStep >= 2 && selectedService && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule & Location
              </CardTitle>
              <CardDescription>
                When and where would you like your {selectedService.name}?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="scheduledDateTime">Preferred Date & Time *</Label>
                  <Input
                    id="scheduledDateTime"
                    type="datetime-local"
                    {...form.register('scheduledDateTime')}
                    min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="mt-1"
                  />
                  {form.formState.errors.scheduledDateTime && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.scheduledDateTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                  <Input
                    id="promoCode"
                    placeholder="Enter promo code"
                    {...form.register('promoCode')}
                    className="mt-1"
                  />
                </div>
              </div>

              {selectedService.type === 'MOBILE' && (
                <div>
                  <Label className="text-base font-semibold">Service Location</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="addressStreet">Street Address *</Label>
                      <Input
                        id="addressStreet"
                        placeholder="123 Main Street"
                        {...form.register('addressStreet')}
                        className="mt-1"
                      />
                      {form.formState.errors.addressStreet && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.addressStreet.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="addressCity">City *</Label>
                      <Input
                        id="addressCity"
                        placeholder="Houston"
                        {...form.register('addressCity')}
                        className="mt-1"
                      />
                      {form.formState.errors.addressCity && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.addressCity.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="addressState">State *</Label>
                      <Input
                        id="addressState"
                        placeholder="TX"
                        {...form.register('addressState')}
                        className="mt-1"
                      />
                      {form.formState.errors.addressState && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.addressState.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="addressZip">ZIP Code *</Label>
                      <Input
                        id="addressZip"
                        placeholder="77591"
                        {...form.register('addressZip')}
                        className="mt-1"
                      />
                      {form.formState.errors.addressZip && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.addressZip.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="locationNotes">Location Notes (Optional)</Label>
                      <Textarea
                        id="locationNotes"
                        placeholder="Apartment number, gate code, parking instructions, etc."
                        {...form.register('locationNotes')}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(3)}
                  disabled={!form.watch('scheduledDateTime') || (selectedService?.type === 'MOBILE' && !form.watch('addressZip'))}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Display */}
        {currentStep >= 2 && selectedService && <PricingDisplay />}

        {/* Step 3: Contact Information */}
        {currentStep >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                We'll use this information to confirm your appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    {...form.register('customerName')}
                    className="mt-1"
                  />
                  {form.formState.errors.customerName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="john@example.com"
                    {...form.register('customerEmail')}
                    className="mt-1"
                  />
                  {form.formState.errors.customerEmail && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...form.register('customerPhone')}
                    className="mt-1"
                  />
                  {form.formState.errors.customerPhone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerPhone.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="Any special requirements or instructions for your notary appointment..."
                    {...form.register('specialInstructions')}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailUpdates"
                    {...form.register('emailUpdates')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="emailUpdates" className="text-sm">
                    Send email confirmations and updates
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    {...form.register('smsNotifications')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="smsNotifications" className="text-sm">
                    Send SMS reminders and notifications
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    {...form.register('termsAccepted')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="termsAccepted" className="text-sm">
                    I accept the <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> *
                  </Label>
                </div>
                {form.formState.errors.termsAccepted && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.termsAccepted.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(4)}
                  disabled={!form.watch('customerName') || !form.watch('customerEmail') || !form.watch('termsAccepted')}
                >
                  Review & Pay
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep >= 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Review & Book
              </CardTitle>
              <CardDescription>
                Please review your booking details before proceeding to payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Service Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Service:</strong> {selectedService?.name}</p>
                    <p><strong>Date & Time:</strong> {form.watch('scheduledDateTime') && new Date(form.watch('scheduledDateTime')).toLocaleString()}</p>
                    <p><strong>Duration:</strong> {selectedService?.duration} minutes</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {form.watch('customerName')}</p>
                    <p><strong>Email:</strong> {form.watch('customerEmail')}</p>
                    <p><strong>Phone:</strong> {form.watch('customerPhone')}</p>
                  </div>
                </div>

                {selectedService?.type === 'MOBILE' && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-2">Service Location</h4>
                    <p className="text-sm">
                      {form.watch('addressStreet')}, {form.watch('addressCity')}, {form.watch('addressState')} {form.watch('addressZip')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(3)}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !pricing}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Booking...
                    </>
                  ) : (
                    `Book Now - ${pricing ? `$${pricing.depositRequired ? pricing.depositAmount.toFixed(2) : pricing.finalPrice.toFixed(2)}` : 'Calculate Price'}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}