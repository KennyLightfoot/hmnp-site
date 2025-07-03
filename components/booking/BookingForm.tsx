'use client';

/**
 * Championship Booking System - Main Booking Form
 * Houston Mobile Notary Pros
 * 
 * Multi-step booking form with confidence features, real-time pricing,
 * slot reservation, and conversion optimization. Built for 95%+ completion rates.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  Calendar,
  MapPin,
  FileText,
  Users,
  CreditCard
} from 'lucide-react';

// Import our championship components and utilities
import ServiceSelector from './ServiceSelector';
import UpsellModal from './UpsellModal';
import BookingStepHeader from './BookingStepHeader';
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
  const [lastPricingHash, setLastPricingHash] = useState('');

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


  // Optimized pricing calculation with smart debouncing
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

      // Update pricing hash to prevent duplicate requests
      const currentHash = JSON.stringify({
        serviceType: watchedValues.serviceType,
        zipCode: watchedValues.location?.zipCode,
        date: watchedValues.scheduling?.preferredDate,
        time: watchedValues.scheduling?.preferredTime,
        documentCount: watchedValues.serviceDetails?.documentCount
      });
      setLastPricingHash(currentHash);

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
  }, [watchedValues.serviceType, watchedValues.location?.zipCode, watchedValues.scheduling?.preferredDate, currentStep]);

  // Smart debouncing - only on meaningful changes
  const debouncedCalculatePrice = useMemo(
    () => debounce(calculateLivePrice, 2000), // Increased from 500ms to 2000ms
    [watchedValues.serviceType, watchedValues.location?.zipCode, watchedValues.scheduling?.preferredDate]
  );

  // Check if pricing recalculation is needed
  const shouldRecalculatePrice = useMemo(() => {
    const relevantData = {
      serviceType: watchedValues.serviceType,
      zipCode: watchedValues.location?.zipCode,
      date: watchedValues.scheduling?.preferredDate,
      time: watchedValues.scheduling?.preferredTime,
      documentCount: watchedValues.serviceDetails?.documentCount
    };
    
    const currentHash = JSON.stringify(relevantData);
    return currentHash !== lastPricingHash;
  }, [watchedValues, lastPricingHash]);

  // Optimized pricing trigger
  useEffect(() => {
    if (shouldRecalculatePrice && watchedValues.serviceType) {
      debouncedCalculatePrice();
    }
  }, [shouldRecalculatePrice, debouncedCalculatePrice, watchedValues.serviceType]);

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
      {/* Unified Step Header */}
      <BookingStepHeader
        currentStep={currentStep}
        totalSteps={BOOKING_STEPS.length}
        completion={completionProgress}
        totalPrice={livePrice?.total || 0}
      />

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

      {/* Content Area - Clean and Focused */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
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

      {/* Footer Navigation */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="min-h-[44px] border-gray-300 text-gray-600 hover:text-gray-800"
          >
            Back
          </Button>

          <div className="flex space-x-3">
            {currentStep < BOOKING_STEPS.length - 2 && (
              <Button
                onClick={nextStep}
                disabled={!isStepValid || isSubmitting}
                className="min-h-[44px] bg-primary hover:bg-primary/90 text-white px-8"
              >
                Next
              </Button>
            )}
            
            {currentStep === BOOKING_STEPS.length - 2 && (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={!isStepValid || isSubmitting}
                className="min-h-[44px] bg-primary hover:bg-primary/90 text-white px-8"
              >
                {isSubmitting ? (
                  'Creating Booking...'
                ) : (
                  'Complete Booking'
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Help Link */}
        <div className="text-center">
          <a 
            href="tel:832-617-4285" 
            className="text-sm text-gray-600 hover:text-secondary underline"
          >
            Need help? 832-617-4285
          </a>
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