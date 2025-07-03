'use client';

/**
 * Championship Booking System - Main Booking Form
 * Houston Mobile Notary Pros
 * 
 * Multi-step booking form with confidence features, real-time pricing,
 * slot reservation, and conversion optimization. Built for 95%+ completion rates.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  DollarSign, 
  Shield, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  FileText,
  Users,
  CreditCard,
  Zap
} from 'lucide-react';

// Import our championship components and utilities
import ServiceSelector from './ServiceSelector';
import UpsellModal from './UpsellModal';
import { CreateBookingSchema, type CreateBooking } from '@/lib/booking-validation';
import { PricingResult } from '@/lib/pricing-engine';
import { SlotReservation } from '@/lib/slot-reservation';
import {
  BookingFormProps,
  BookingStep,
  CompletedBooking,
  BookingError,
  BaseStepProps
} from '@/lib/types/booking-interfaces';

// Form step components (we'll import these)
import CustomerInfoStep from './steps/CustomerInfoStep';
import ServiceDetailsStep from './steps/ServiceDetailsStep';
import LocationStep from './steps/LocationStep';
import SchedulingStep from './steps/SchedulingStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';

// Use imported types from booking-interfaces

interface BookingConfidence {
  level: number; // 0-100
  factors: string[];
  nextAction: string;
}

// Form steps configuration
const BOOKING_STEPS: BookingStep[] = [
  {
    id: 'service',
    title: 'Choose Service',
    description: 'Select the perfect notary service for your needs',
    component: ServiceSelector,
    icon: FileText,
    isValid: (data: Partial<CreateBooking>) => !!data.serviceType
  },
  {
    id: 'details',
    title: 'Service Details',
    description: 'Tell us about your documents and requirements',
    component: ServiceDetailsStep,
    icon: Users,
    isValid: (data: Partial<CreateBooking>) => data.serviceDetails?.documentCount > 0
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Where should we meet you?',
    component: LocationStep,
    icon: MapPin,
    isValid: (data: Partial<CreateBooking>) => data.serviceType === 'RON_SERVICES' || !!data.location?.address
  },
  {
    id: 'scheduling',
    title: 'Schedule',
    description: 'Pick your preferred date and time',
    component: SchedulingStep,
    icon: Calendar,
    isValid: (data) => !!data.scheduling?.preferredDate
  },
  {
    id: 'customer',
    title: 'Your Information',
    description: 'Contact details for confirmation',
    component: CustomerInfoStep,
    icon: Users,
    isValid: (data) => !!data.customer?.email && !!data.customer?.name
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Secure payment to confirm your booking',
    component: PaymentStep,
    icon: CreditCard,
    isValid: (data) => !!data.payment?.paymentMethod
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Review and confirm your booking',
    component: ConfirmationStep,
    icon: CheckCircle,
    isValid: () => true
  }
];

export default function BookingForm({
  initialData = {},
  onComplete,
  onError,
  className = ''
}: BookingFormProps) {
  // Form state
  const form = useForm<CreateBooking>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      serviceType: 'STANDARD_NOTARY',
      locationType: 'CLIENT_ADDRESS',
      customer: {
        preferredContactMethod: 'email',
        marketingConsent: false,
        smsConsent: false
      },
      serviceDetails: {
        documentCount: 1,
        documentTypes: [],
        signerCount: 1,
        witnessRequired: false,
        witnessProvided: 'none',
        identificationRequired: true
      },
      scheduling: {
        timeZone: 'America/Chicago',
        flexibleTiming: false,
        priority: false,
        sameDay: false,
        estimatedDuration: 60
      },
      payment: {
        paymentMethod: 'credit-card',
        sameBillingAddress: true,
        corporateBilling: false,
        payFullAmount: false,
        savePaymentMethod: false
      },
      bookingSource: 'website',
      ...initialData
    },
    mode: 'onChange'
  });

  // Booking flow state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [livePrice, setLivePrice] = useState<PricingResult | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [slotReservation, setSlotReservation] = useState<SlotReservation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [bookingConfidence, setBookingConfidence] = useState<BookingConfidence>({
    level: 20,
    factors: ['Service selected'],
    nextAction: 'Complete service details'
  });

  // Watch form values for real-time updates
  const watchedValues = form.watch();
  const formErrors = form.formState.errors;
  const isStepValid = BOOKING_STEPS[currentStep]?.isValid?.(watchedValues) ?? false;

  // Calculate completion progress
  const completionProgress = useMemo(() => {
    const validSteps = BOOKING_STEPS.filter((step, index) => 
      index <= currentStep && step.isValid?.(watchedValues)
    ).length;
    return Math.round((validSteps / BOOKING_STEPS.length) * 100);
  }, [currentStep, watchedValues]);

  // Update booking confidence
  useEffect(() => {
    const factors = [];
    let level = 20;

    if (watchedValues.serviceType) {
      factors.push('Service selected');
      level += 15;
    }

    if (watchedValues.serviceDetails?.documentCount > 0) {
      factors.push('Requirements specified');
      level += 15;
    }

    if (watchedValues.location?.address || watchedValues.serviceType === 'RON_SERVICES') {
      factors.push('Location confirmed');
      level += 15;
    }

    if (watchedValues.scheduling?.preferredDate) {
      factors.push('Time scheduled');
      level += 15;
    }

    if (watchedValues.customer?.email && watchedValues.customer?.name) {
      factors.push('Contact info provided');
      level += 15;
    }

    if (slotReservation) {
      factors.push('Slot reserved');
      level += 5;
    }

    const nextActions = [
      'Complete service details',
      'Choose location',
      'Schedule appointment',
      'Provide contact info',
      'Complete payment',
      'Finalize booking'
    ];

    setBookingConfidence({
      level: Math.min(level, 100),
      factors,
      nextAction: nextActions[currentStep] || 'Complete booking'
    });
  }, [watchedValues, currentStep, slotReservation]);

  // Real-time pricing calculation
  const calculateLivePrice = useCallback(async () => {
    if (!watchedValues.serviceType) return;

    setPriceLoading(true);
    try {
      const pricingParams = {
        serviceType: watchedValues.serviceType,
        location: watchedValues.location ? {
          address: `${watchedValues.location.address}, ${watchedValues.location.city}, ${watchedValues.location.state} ${watchedValues.location.zipCode}`,
          latitude: watchedValues.location.latitude,
          longitude: watchedValues.location.longitude
        } : undefined,
        scheduledDateTime: watchedValues.scheduling?.preferredDate && watchedValues.scheduling?.preferredTime ? 
          new Date(`${watchedValues.scheduling.preferredDate.split('T')[0]}T${watchedValues.scheduling.preferredTime}`).toISOString() :
          new Date().toISOString(),
        documentCount: watchedValues.serviceDetails?.documentCount || 1,
        signerCount: watchedValues.serviceDetails?.signerCount || 1,
        options: {
          priority: watchedValues.scheduling?.priority || false,
          sameDay: watchedValues.scheduling?.sameDay || false,
          weatherAlert: false
        },
        customerEmail: watchedValues.customer?.email,
        promoCode: watchedValues.promoCode,
        referralCode: watchedValues.referralCode
      };

      const response = await fetch('/api/booking/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingParams)
      });

      if (response.ok) {
        const result = await response.json();
        setLivePrice(result.data);

        // Check for upsell opportunities
        if (result.data.upsellSuggestions?.length > 0 && currentStep >= 3) {
          setShowUpsell(true);
        }
      }
    } catch (error) {
      console.error('Failed to calculate price:', error);
    } finally {
      setPriceLoading(false);
    }
  }, [watchedValues, currentStep]);

  // Debounced price calculation
  useEffect(() => {
    const timer = setTimeout(calculateLivePrice, 500);
    return () => clearTimeout(timer);
  }, [calculateLivePrice]);

  // Slot reservation timer
  useEffect(() => {
    if (slotReservation && currentStep >= 3) {
      const expiresAt = new Date(slotReservation.expiresAt);
      const updateTimer = () => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setSlotReservation(null);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [slotReservation, currentStep]);

  // Navigation handlers
  const nextStep = useCallback(async () => {
    if (currentStep < BOOKING_STEPS.length - 1) {
      // Validate current step
      const currentStepValid = await form.trigger();
      if (!currentStepValid) return;

      // Reserve slot when scheduling is completed
      if (currentStep === 3 && !slotReservation && watchedValues.scheduling) {
        try {
          const reservationResponse = await fetch('/api/booking/reserve-slot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              datetime: new Date(
                `${watchedValues.scheduling.preferredDate.split('T')[0]}T${watchedValues.scheduling.preferredTime}`
              ).toISOString(),
              serviceType: watchedValues.serviceType,
              customerEmail: watchedValues.customer?.email,
              estimatedDuration: watchedValues.scheduling.estimatedDuration
            })
          });

          if (reservationResponse.ok) {
            const result = await reservationResponse.json();
            if (result.success) {
              setSlotReservation(result.reservation);
            }
          }
        } catch (error) {
          console.error('Failed to reserve slot:', error);
        }
      }

      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, form, slotReservation, watchedValues]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Form submission
  const onSubmit = useCallback(async (data: CreateBooking) => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        ...data,
        reservationId: slotReservation?.id,
        agreedToTerms: true
      };

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        onComplete?.(result.booking);
        setCurrentStep(BOOKING_STEPS.length - 1); // Go to confirmation
      } else {
        throw new Error(result.error || 'Booking creation failed');
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [slotReservation, onComplete, onError]);

  // Upsell handlers
  const handleUpsellAccept = useCallback((suggestionId: string) => {
    // Update service type based on upsell
    const suggestion = livePrice?.upsellSuggestions.find(s => s.type === suggestionId);
    if (suggestion?.toService) {
      form.setValue('serviceType', suggestion.toService as any);
    }
    setShowUpsell(false);
  }, [livePrice, form]);

  const handleUpsellDecline = useCallback(() => {
    setShowUpsell(false);
  }, []);

  const CurrentStepComponent = BOOKING_STEPS[currentStep]?.component;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Championship Confidence Bar */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  Booking Progress: {completionProgress}%
                </span>
              </div>
              {livePrice && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-800 text-lg">
                    Live Estimate: ${livePrice.total.toFixed(2)}
                  </span>
                  {livePrice.confidence.level === 'high' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Best Price Guaranteed
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Trust Signals */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-green-700">$100K Insured</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-green-700">4.9/5 Rating</span>
              </div>
            </div>
          </div>
          
          <Progress value={completionProgress} className="h-2" />
          
          <div className="flex justify-between text-sm text-green-700 mt-2">
            <span>Confidence Level: {bookingConfidence.level}%</span>
            <span>{bookingConfidence.nextAction}</span>
          </div>
        </CardContent>
      </Card>

      {/* Slot Reservation Alert */}
      {slotReservation && timeRemaining && timeRemaining > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              ⏰ Your slot is reserved for <strong>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</strong> minutes
            </span>
            <Badge variant="secondary" className="animate-pulse">
              Reserved
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(BOOKING_STEPS[currentStep].icon, { className: "h-5 w-5" })}
                <span>{BOOKING_STEPS[currentStep].title}</span>
                <Badge variant="outline">
                  Step {currentStep + 1} of {BOOKING_STEPS.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                {BOOKING_STEPS[currentStep].description}
              </CardDescription>
            </div>
            
            {livePrice && currentStep > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${livePrice.total.toFixed(2)}
                </div>
                {priceLoading && (
                  <div className="text-sm text-gray-500">Updating...</div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {CurrentStepComponent && (
                <CurrentStepComponent
                  {...watchedValues}
                  onServiceSelect={(serviceType: string) => form.setValue('serviceType', serviceType)}
                  pricing={livePrice}
                  errors={formErrors}
                />
              )}
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentStep < BOOKING_STEPS.length - 2 && (
            <Button
              onClick={nextStep}
              disabled={!isStepValid || isSubmitting}
            >
              Next Step
            </Button>
          )}
          
          {currentStep === BOOKING_STEPS.length - 2 && (
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isStepValid || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                'Creating Booking...'
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Complete Booking
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Upsell Modal */}
      {showUpsell && livePrice?.upsellSuggestions && (
        <UpsellModal
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
          suggestions={livePrice.upsellSuggestions.map((suggestion, index) => ({
            id: index.toString(),
            ...suggestion
          }))}
          currentService={watchedValues.serviceType}
          currentPrice={livePrice.total}
          onAccept={handleUpsellAccept}
          onDecline={handleUpsellDecline}
          customerEmail={watchedValues.customer?.email}
          timeRemaining={timeRemaining || undefined}
        />
      )}
    </div>
  );
}