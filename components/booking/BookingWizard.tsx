'use client';

/**
 * Championship Booking System - Main Booking Wizard
 * Houston Mobile Notary Pros
 * 
 * Multi-step booking wizard with real-time pricing, slot reservation,
 * and confidence building. Designed for 95%+ completion rates.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { trackError } from '@/lib/monitoring/error-handler';
import { 
  Clock, 
  DollarSign, 
  Shield, 
  Star, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Phone
} from 'lucide-react';

// Import our championship components
import ServiceSelector from './ServiceSelector';
import UpsellModal from './UpsellModal';
import BookingStepHeader from './BookingStepHeader';

// Import step components
import CustomerInfoStep from './steps/CustomerInfoStep';
import LocationStep from './steps/LocationStep';
import SchedulingStep from './steps/SchedulingStep';
import ReviewStep from './steps/ReviewStep';

import { CreateBookingSchema, type CreateBooking } from '@/lib/booking-validation';
import { PricingResult } from '@/lib/pricing-engine';
import { SlotReservation } from '@/lib/slot-reservation';
import {
  CompletedBooking,
  BookingStepUpdate,
  BookingErrors,
  BaseStepProps
} from '@/lib/types/booking-interfaces';

// Types for booking flow
interface BookingStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ComponentType<BaseStepProps>;
  isOptional?: boolean;
  showInProgress?: boolean;
}

interface BookingState {
  currentStep: number;
  pricing: PricingResult | null;
  pricingLoading: boolean;
  slotReservation: SlotReservation | null;
  timeRemaining: number | null;
  showUpsell: boolean;
  isSubmitting: boolean;
  completedBooking: CompletedBooking | null;
}

// Booking steps configuration
const BOOKING_STEPS: BookingStep[] = [
  {
    id: 'service',
    title: 'Choose Your Service',
    subtitle: 'Select the perfect notary service for your needs',
    component: ServiceSelector,
    showInProgress: true
  },
  {
    id: 'customer',
    title: 'Your Information',
    subtitle: 'Contact details for appointment confirmation',
    component: CustomerInfoStep,
    showInProgress: true
  },
  {
    id: 'location',
    title: 'Service Location',
    subtitle: 'Where should we meet you?',
    component: LocationStep,
    showInProgress: true
  },
  {
    id: 'scheduling',
    title: 'Date & Time',
    subtitle: 'Pick your preferred appointment time',
    component: SchedulingStep,
    showInProgress: true
  },
  {
    id: 'review',
    title: 'Review & Confirm',
    subtitle: 'Secure payment and final confirmation',
    component: ReviewStep,
    showInProgress: false
  }
];

export default function BookingWizard() {
  // Toast and error handling
  const { toast } = useToast();
  
  // Form setup
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
      bookingSource: 'website'
    },
    mode: 'onChange'
  });

  // Booking state
  const [state, setState] = useState<BookingState>({
    currentStep: 0,
    pricing: null,
    pricingLoading: false,
    slotReservation: null,
    timeRemaining: null,
    showUpsell: false,
    isSubmitting: false,
    completedBooking: null
  });

  // Add pricing hash tracking
  const [lastPricingHash, setLastPricingHash] = useState('');

  // Watch form values for real-time updates
  const watchedValues = form.watch();
  const formErrors = form.formState.errors;

  // Map each step to its required validation fields
  const stepFieldMap = {
    service: ['serviceType'] as const,
    customer: ['customer.name', 'customer.email', 'customer.phone'] as const,
    location: ['location.address', 'location.city', 'location.state', 'location.zipCode'] as const,
    scheduling: ['scheduling.preferredDate', 'scheduling.preferredTime'] as const,
    review: [] as const, // No validation needed for review step
  } as const;

  // Determine if current step is valid
  const isCurrentStepValid = useMemo(() => {
    const step = BOOKING_STEPS[state.currentStep];
    switch (step.id) {
      case 'service':
        return !!watchedValues.serviceType;
      case 'customer':
        return !!watchedValues.customer?.email && !!watchedValues.customer?.name;
      case 'location':
        return watchedValues.serviceType === 'RON_SERVICES' || !!watchedValues.location?.address;
      case 'scheduling':
        return !!watchedValues.scheduling?.preferredDate && !!watchedValues.scheduling?.preferredTime;
      case 'review':
        return !!watchedValues.payment?.paymentMethod;
      default:
        return false;
    }
  }, [state.currentStep, watchedValues]);

  // Calculate completion progress
  const completionProgress = useMemo(() => {
    let progress = 0;
    if (watchedValues.serviceType) progress += 20;
    if (watchedValues.customer?.email && watchedValues.customer?.name) progress += 20;
    if (watchedValues.serviceType === 'RON_SERVICES' || watchedValues.location?.address) progress += 20;
    if (watchedValues.scheduling?.preferredDate) progress += 20;
    if (state.slotReservation) progress += 10;
    if (state.currentStep === BOOKING_STEPS.length - 1) progress += 10;
    return Math.min(progress, 100);
  }, [watchedValues, state.slotReservation, state.currentStep]);

  // Optimized pricing calculation with smart debouncing
  const calculatePricing = useCallback(async () => {
    if (!watchedValues.serviceType) return;

    setState(prev => ({ ...prev, pricingLoading: true }));
    
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

      if (!response.ok) {
        let errorMessage = `Pricing calculation failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (!result.success && !result.data) {
        throw new Error(result.error || 'Invalid pricing response');
      }

      setState(prev => ({ 
        ...prev, 
        pricing: result.data,
        showUpsell: result.data.upsellSuggestions?.length > 0 && state.currentStep >= 2
      }));
    } catch (error) {
      console.error('Failed to calculate price:', error);
      toast({
        variant: 'destructive',
        title: 'Pricing Error',
        description: 'Unable to calculate pricing. Please try again or contact support.'
      });
      trackError(error as Error, {
        context: 'pricing-calculation',
        data: { serviceType: watchedValues.serviceType }
      });
    } finally {
      setState(prev => ({ ...prev, pricingLoading: false }));
    }
  }, [watchedValues.serviceType, watchedValues.location?.zipCode, watchedValues.scheduling?.preferredDate, state.currentStep, toast]);

  // Smart debouncing - only on meaningful changes
  const debouncedCalculatePricing = useMemo(
    () => debounce(calculatePricing, 2000), // 2 second delay to prevent excessive API calls
    [calculatePricing]
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
      debouncedCalculatePricing();
    }
  }, [shouldRecalculatePrice, debouncedCalculatePricing, watchedValues.serviceType]);

  // Slot reservation management
  const reserveSlot = useCallback(async () => {
    if (!watchedValues.scheduling?.preferredDate || !watchedValues.scheduling?.preferredTime) return;

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

      if (!reservationResponse.ok) {
        let errorMessage = `Slot reservation failed (${reservationResponse.status})`;
        try {
          const errorData = await reservationResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the default message
        }
        throw new Error(errorMessage);
      }

      const result = await reservationResponse.json();
      if (!result.success) {
        throw new Error(result.error || 'Slot reservation failed - please try a different time');
      }

      setState(prev => ({ ...prev, slotReservation: result.reservation }));
    } catch (error) {
      console.error('Failed to reserve slot:', error);
      toast({
        variant: 'destructive',
        title: 'Slot Reservation Failed',
        description: 'Unable to reserve your time slot. Please try selecting a different time.'
      });
      trackError(error as Error, {
        context: 'slot-reservation',
        data: { 
          datetime: watchedValues.scheduling?.preferredDate,
          serviceType: watchedValues.serviceType
        }
      });
    }
  }, [watchedValues, toast]);

  // Slot reservation timer
  useEffect(() => {
    if (state.slotReservation) {
      const updateTimer = () => {
        const expiresAt = new Date(state.slotReservation!.expiresAt);
        const now = new Date();
        const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        
        setState(prev => ({ ...prev, timeRemaining: remaining }));
        
        if (remaining === 0) {
          setState(prev => ({ ...prev, slotReservation: null, timeRemaining: null }));
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [state.slotReservation]);



  // Navigation handlers
  const nextStep = useCallback(async () => {
    if (state.currentStep < BOOKING_STEPS.length - 1) {
      // Get current step info
      const currentStepId = BOOKING_STEPS[state.currentStep].id as keyof typeof stepFieldMap;
      const fieldsToValidate = stepFieldMap[currentStepId];
      
      // CRITICAL: Only validate current step's fields if there are any
      if (fieldsToValidate && fieldsToValidate.length > 0) {
        const isValid = await form.trigger(fieldsToValidate as any);
        if (!isValid) {
          console.log('Step validation failed for fields:', fieldsToValidate);
          return;
        }
      }
      
      // Additional business logic validation
      if (!isCurrentStepValid) {
        console.log('Business logic validation failed for step:', currentStepId);
        return;
      }

      // Reserve slot when moving from scheduling step
      if (state.currentStep === 3 && !state.slotReservation) {
        await reserveSlot();
      }

      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  }, [state.currentStep, form, isCurrentStepValid, state.slotReservation, reserveSlot]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  // Form submission
  const onSubmit = useCallback(async (data: CreateBooking) => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const bookingData = {
        ...data,
        reservationId: state.slotReservation?.id,
        agreedToTerms: true
      };

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        let errorMessage = `Booking creation failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Booking creation failed - please try again');
      }

      setState(prev => ({ 
        ...prev, 
        completedBooking: result.booking,
        currentStep: BOOKING_STEPS.length - 1 
      }));
      toast({
        title: 'Booking Confirmed!',
        description: 'Your appointment has been successfully booked. Check your email for confirmation details.'
      });
    } catch (error) {
      console.error('Booking submission failed:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Unable to complete your booking. Please try again or contact support at 832-617-4285.'
      });
      trackError(error as Error, {
        context: 'booking-submission',
        data: { 
          serviceType: data.serviceType,
          customerEmail: data.customer?.email
        }
      });
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.slotReservation, toast]);

  // Upsell handlers
  const handleUpsellAccept = useCallback((suggestionId: string) => {
    const suggestion = state.pricing?.upsellSuggestions.find((_, index) => index.toString() === suggestionId);
    if (suggestion?.toService) {
      form.setValue('serviceType', suggestion.toService as any);
    }
    setState(prev => ({ ...prev, showUpsell: false }));
  }, [state.pricing, form]);

  const handleUpsellDecline = useCallback(() => {
    setState(prev => ({ ...prev, showUpsell: false }));
  }, []);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const CurrentStepComponent = BOOKING_STEPS[state.currentStep]?.component;
  const currentStepData = BOOKING_STEPS[state.currentStep];

  return (
    <div className="space-y-6">
      {/* Unified Step Header */}
      <BookingStepHeader
        currentStep={state.currentStep}
        totalSteps={BOOKING_STEPS.length}
        completion={completionProgress}
        totalPrice={state.pricing?.total || 0}
      />

      {/* Slot Reservation Alert */}
      {state.slotReservation && state.timeRemaining && state.timeRemaining > 0 && (
        <Alert className="border-orange-200 bg-orange-50 animate-pulse">
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              🔒 <strong>Slot Reserved!</strong> Your time slot expires in{' '}
              <strong className="text-orange-700">
                {formatTimeRemaining(state.timeRemaining)}
              </strong>
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Limited Time
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Step Content */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {/* Step Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentStepData?.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentStepData?.subtitle}
                </p>
              </div>
              
              {/* Live Price Display */}
              {state.pricing && state.currentStep > 0 && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    ${state.pricing.total.toFixed(2)}
                  </div>
                  {state.pricingLoading && (
                    <div className="text-sm text-gray-500 animate-pulse">
                      Updating price...
                    </div>
                  )}
                  {state.pricing.confidence.level === 'high' && (
                    <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                      Best Price Guaranteed
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Step {state.currentStep + 1} of {BOOKING_STEPS.length}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-4">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((state.currentStep + 1) / BOOKING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step Component */}
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {CurrentStepComponent && (
                <CurrentStepComponent
                  data={watchedValues}
                  onUpdate={(updates: BookingStepUpdate) => {
                    Object.keys(updates).forEach(key => {
                      form.setValue(key as any, updates[key]);
                    });
                  }}
                  pricing={state.pricing}
                  errors={formErrors}
                  isSubmitting={state.isSubmitting}
                  completedBooking={state.completedBooking}
                />
              )}
            </form>
          </FormProvider>

          {/* Step Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={state.currentStep === 0 || state.isSubmitting}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-4">
              {/* Emergency Contact */}
              <div className="text-sm text-gray-600 flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Need help?</span>
                <a href="tel:832-617-4285" className="text-secondary hover:text-secondary/80 font-medium">
                  832-617-4285
                </a>
              </div>

              {/* Next/Submit Button */}
              {state.currentStep < BOOKING_STEPS.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isCurrentStepValid || state.isSubmitting}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={!isCurrentStepValid || state.isSubmitting}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-lg px-8 py-3"
                >
                  {state.isSubmitting ? (
                    'Processing...'
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Complete Booking</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Signals Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-gray-700 font-medium">$100K Insured</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-700 font-medium">4.9/5 Rating</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-secondary" />
            <span className="text-gray-700 font-medium">30-Day Guarantee</span>
          </div>
        </div>
      </div>

      {/* Upsell Modal */}
      {state.showUpsell && state.pricing?.upsellSuggestions && (
        <UpsellModal
          isOpen={state.showUpsell}
          onClose={() => setState(prev => ({ ...prev, showUpsell: false }))}
          suggestions={state.pricing.upsellSuggestions.map((suggestion, index) => ({
            id: index.toString(),
            ...suggestion
          }))}
          currentService={watchedValues.serviceType}
          currentPrice={state.pricing.total}
          onAccept={handleUpsellAccept}
          onDecline={handleUpsellDecline}
          customerEmail={watchedValues.customer?.email}
          timeRemaining={state.timeRemaining || undefined}
        />
      )}
    </div>
  );
}