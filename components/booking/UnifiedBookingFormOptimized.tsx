"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Optimized imports - components are loaded dynamically to reduce initial bundle size
import { ServiceSelection } from './forms/ServiceSelection';
import { ContactInfo } from './forms/ContactInfo';
import { LocationDetails } from './forms/LocationDetails';
import { 
  unifiedBookingSchema, 
  BOOKING_STEPS, 
  STEP_FIELDS,
  type UnifiedBookingFormData,
  type Service 
} from './forms/types';

// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const UnifiedBookingCalendar = dynamic(() => import('@/components/unified-booking-calendar'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>,
  ssr: false
});

// Booking Summary Component
function BookingSummary({ 
  data, 
  service 
}: { 
  data: Partial<UnifiedBookingFormData>; 
  service?: Service;
}) {
  if (!service) return null;

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-lg">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Service:</span>
            <div className="text-gray-600">{service.name}</div>
          </div>
          <div>
            <span className="font-medium">Date & Time:</span>
            <div className="text-gray-600">{data.appointmentFormattedTime || 'Not selected'}</div>
          </div>
          <div>
            <span className="font-medium">Customer:</span>
            <div className="text-gray-600">{data.customerName}</div>
          </div>
          <div>
            <span className="font-medium">Signers:</span>
            <div className="text-gray-600">{data.numberOfSigners || 1}</div>
          </div>
          <div className="col-span-2">
            <span className="font-medium">Location:</span>
            <div className="text-gray-600">
              {data.addressStreet && data.addressCity 
                ? `${data.addressStreet}, ${data.addressCity}, ${data.addressState} ${data.addressZip}`
                : 'Not specified'
              }
            </div>
          </div>
        </div>
        
        <hr />
        
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>${(service.basePrice * (data.numberOfSigners || 1))}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface UnifiedBookingFormOptimizedProps {
  services: Service[];
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
  onSubmit?: (data: UnifiedBookingFormData) => void;
  loading?: boolean;
}

/**
 * Optimized Unified Booking Form Component
 * 
 * This component has been refactored from a 1,099-line monolithic component
 * into smaller, focused components for better performance and maintainability.
 * 
 * Key optimizations:
 * - Separated form steps into individual components
 * - Dynamic imports for heavy components
 * - Better state management and validation
 * - Improved error handling with Error Boundaries
 * - Reduced initial bundle size
 */
export default function UnifiedBookingFormOptimized({
  services,
  isAuthenticated = false,
  userEmail,
  userName,
  onSubmit,
  loading = false
}: UnifiedBookingFormOptimizedProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form setup with real-time validation
  const form = useForm<UnifiedBookingFormData>({
    resolver: zodResolver(unifiedBookingSchema),
    defaultValues: {
      numberOfSigners: 1,
      locationType: 'CLIENT_SPECIFIED_ADDRESS',
      emailUpdates: false,
      smsNotifications: false,
      consent_terms_conditions: false,
    },
    mode: 'onChange', // Real-time validation for better UX
    reValidateMode: 'onChange', // Re-validate on every change
    shouldFocusError: true, // Focus on first error field
  });

  const { handleSubmit, trigger, getValues, watch } = form;

  // Watch selected service for step validation
  const selectedServiceId = watch('serviceId');
  const selectedService = services.find(s => s.id === selectedServiceId);

  // Calculate progress
  const progress = (currentStep / BOOKING_STEPS.length) * 100;

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS];
    return await trigger(fieldsToValidate as any);
  };

  // Navigate between steps
  const goToNextStep = async () => {
    if (currentStep < BOOKING_STEPS.length) {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const onFormSubmit = async (data: UnifiedBookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit?.(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle calendar selection
  const handleCalendarSelection = (calendarData: any) => {
    form.setValue('calendarId', calendarData.calendarId);
    form.setValue('appointmentStartTime', calendarData.startTime);
    form.setValue('appointmentEndTime', calendarData.endTime);
    form.setValue('appointmentFormattedTime', calendarData.formattedTime);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection 
            services={services} 
            loading={loading}
            onServiceSelect={(service) => {
              // Auto-advance to next step after service selection
              setTimeout(() => {
                if (form.formState.isValid) {
                  goToNextStep();
                }
              }, 500);
            }}
          />
        );

      case 2:
        if (!selectedService) {
          return (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please select a service first.
              </AlertDescription>
            </Alert>
          );
        }
        
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select Date & Time
              </h3>
              <p className="text-gray-600 text-sm">
                Choose your preferred appointment time for {selectedService.name}.
              </p>
            </div>
            
            <UnifiedBookingCalendar
              serviceId={selectedService.id}
              onSelectionChange={handleCalendarSelection}
              durationMinutes={selectedService.durationMinutes}
            />
          </div>
        );

      case 3:
        return (
          <ContactInfo
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            userName={userName}
          />
        );

      case 4:
        return (
          <LocationDetails />
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review & Confirm
              </h3>
              <p className="text-gray-600 text-sm">
                Please review your booking details and confirm your appointment.
              </p>
            </div>

            {/* Booking Summary */}
            <BookingSummary data={getValues()} service={selectedService} />

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <Textarea
                placeholder="Any special requests or information for your notary..."
                rows={3}
                {...form.register('notes')}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  {...form.register('consent_terms_conditions')}
                  id="terms"
                />
                <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  {...form.register('emailUpdates')}
                  id="email-updates"
                />
                <label htmlFor="email-updates" className="text-sm text-gray-700">
                  Send me email updates about my appointment
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  {...form.register('smsNotifications')}
                  id="sms-notifications"
                />
                <label htmlFor="sms-notifications" className="text-sm text-gray-700">
                  Send me SMS notifications (arrival alerts, reminders)
                </label>
              </div>
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Progress Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl">Book Your Appointment</CardTitle>
                  <span className="text-sm text-gray-500">
                    Step {currentStep} of {BOOKING_STEPS.length}
                  </span>
                </div>
                
                <Progress value={progress} className="h-2" />
                
                <div className="flex justify-between mt-4">
                  {BOOKING_STEPS.map((step) => (
                    <div
                      key={step.id}
                      className={`text-center ${
                        step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium ${
                        step.id < currentStep 
                          ? 'bg-blue-600 text-white' 
                          : step.id === currentStep
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.id < currentStep ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="text-xs font-medium">{step.name}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Step Content */}
            <Card>
              <CardContent className="p-6">
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < BOOKING_STEPS.length ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </ErrorBoundary>
  );
}