"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Calendar, User, MapPin, CreditCard, CheckCircle, Video } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

// Import our new components
import ServiceToggle, { ServiceMode } from '@/components/booking/ServiceToggle';
import RealTimePricing, { PricingInputs, PricingCalculation, ServiceData } from '@/components/booking/RealTimePricing';
import { DistanceService, DistanceResult, GeofenceResult } from '@/lib/maps/distance';
import { shouldShowMobileRonToggle, shouldEnableRealTimePricing, shouldEnableDistanceGeofencing } from '@/lib/launchdarkly/config';

// Enhanced form schema
const enhancedBookingSchema = z.object({
  // Service Selection
  serviceMode: z.enum(['mobile', 'ron']),
  serviceId: z.string().min(1, 'Please select a service'),
  numberOfSigners: z.number().min(1).max(10),
  
  // Contact Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().optional(),
  
  // Location Details (for mobile service)
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(2, 'Please enter a valid state'),
  postalCode: z.string().min(5, 'Please enter a valid postal code'),
  
  // Appointment Details
  appointmentDate: z.string().min(1, 'Please select a date'),
  appointmentTime: z.string().min(1, 'Please select a time'),
  
  // Additional Options
  extraDocuments: z.number().min(0).default(0),
  urgencyLevel: z.enum(['standard', 'same-day', 'emergency']).default('standard'),
  promoCode: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // Consent
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
  smsNotifications: z.boolean().default(true),
  emailUpdates: z.boolean().default(true),
});

type EnhancedBookingForm = z.infer<typeof enhancedBookingSchema>;

interface ApiService {
  id: string;
  key: string;
  name: string;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
  duration?: number;
  description?: string;
}

export default function EnhancedBookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<ApiService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  const [geofenceResult, setGeofenceResult] = useState<GeofenceResult | null>(null);
  const [pricing, setPricing] = useState<PricingCalculation | null>(null);
  const [serviceMode, setServiceMode] = useState<ServiceMode>('mobile');
  const [showComingSoon] = useState(true); // RON coming soon

  // Feature flags
  const showMobileRonToggle = shouldShowMobileRonToggle();
  const enableRealTimePricing = shouldEnableRealTimePricing();
  const enableDistanceGeofencing = shouldEnableDistanceGeofencing();

  const totalSteps = 6;

  const form = useForm<EnhancedBookingForm>({
    resolver: zodResolver(enhancedBookingSchema),
    defaultValues: {
      serviceMode: 'mobile',
      numberOfSigners: 1,
      extraDocuments: 0,
      urgencyLevel: 'standard',
      smsNotifications: true,
      emailUpdates: true,
      termsAccepted: false,
    },
  });

  const { watch, setValue, formState: { errors, isValid } } = form;
  
  // Watch form values for real-time updates
  const serviceId = watch('serviceId');
  const numberOfSigners = watch('numberOfSigners');
  const address = watch('address');
  const city = watch('city');
  const state = watch('state');
  const postalCode = watch('postalCode');
  const extraDocuments = watch('extraDocuments');
  const urgencyLevel = watch('urgencyLevel');
  const promoCode = watch('promoCode');

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  // Calculate distance when address changes (for mobile service)
  useEffect(() => {
    if (serviceMode === 'mobile' && address && city && state && enableDistanceGeofencing) {
      const fullAddress = `${address}, ${city}, ${state} ${postalCode}`;
      calculateDistance(fullAddress);
    }
  }, [serviceMode, address, city, state, postalCode, enableDistanceGeofencing]);

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to load services');
      
      const data: ApiService[] = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service options. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const calculateDistance = async (fullAddress: string) => {
    try {
      const [distanceResult, geofenceResult] = await Promise.all([
        DistanceService.calculateDistance(fullAddress),
        DistanceService.performGeofenceCheck(fullAddress)
      ]);
      
      setDistanceResult(distanceResult);
      setGeofenceResult(geofenceResult);

      // Show warnings if outside service area
      if (!geofenceResult.isAllowed) {
        toast({
          title: 'Service Area Notice',
          description: geofenceResult.warnings[0],
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
    }
  };

  // Get selected service details
  const selectedService = useMemo((): ServiceData | undefined => {
    if (!serviceId) return undefined;
    const service = services.find(s => s.id === serviceId);
    if (!service) return undefined;
    
    return {
      id: service.id,
      name: service.name,
      price: service.price,
      requiresDeposit: service.requiresDeposit,
      depositAmount: service.depositAmount,
      duration: service.duration,
    };
  }, [serviceId, services]);

  // Build pricing inputs for real-time calculation
  const pricingInputs = useMemo((): PricingInputs => {
    const currentDate = new Date();
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const isHoliday = false; // TODO: Implement holiday detection
    const isAfterHours = currentDate.getHours() < 8 || currentDate.getHours() > 18;

    return {
      service: selectedService,
      numberOfSigners,
      distance: distanceResult?.distance.miles || 0,
      extraDocuments,
      isWeekend,
      isHoliday,
      isAfterHours,
      promoCode,
    };
  }, [selectedService, numberOfSigners, distanceResult, extraDocuments, promoCode]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: EnhancedBookingForm) => {
    try {
      setIsSubmitting(true);

      // Validate geofencing for mobile service
      if (data.serviceMode === 'mobile' && geofenceResult && !geofenceResult.isAllowed) {
        toast({
          title: 'Service Area Restriction',
          description: 'This location is outside our standard service area. Please contact us directly.',
          variant: 'destructive',
        });
        return;
      }

      // Submit booking
      const bookingData = {
        ...data,
        serviceType: data.serviceMode,
        distance: distanceResult?.distance.miles || 0,
        estimatedTravelTime: distanceResult?.duration.minutes || 0,
        finalPrice: pricing?.finalPrice || 0,
        depositAmount: pricing?.depositAmount || 0,
        paymentType: pricing?.paymentType || 'full',
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();

      // Redirect to payment or confirmation
      if (pricing?.paymentType !== 'none') {
        router.push(`/checkout?booking=${result.id}`);
      } else {
        router.push(`/booking-confirmation?booking=${result.id}`);
      }

    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: 'Booking Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Service Type';
      case 2: return 'Service Selection';
      case 3: return 'Contact Information';
      case 4: return 'Location Details';
      case 5: return 'Review & Pricing';
      case 6: return 'Confirmation';
      default: return `Step ${step}`;
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return serviceMode;
      case 2: return serviceId && selectedService;
      case 3: return !errors.firstName && !errors.lastName && !errors.email && !errors.phone;
      case 4: return serviceMode === 'ron' || (!errors.address && !errors.city && !errors.state && !errors.postalCode);
      case 5: return isValid && (!geofenceResult || geofenceResult.isAllowed);
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Book Your Notary Service</h1>
            <p className="text-gray-600 mt-2">
              Complete your booking in {totalSteps} simple steps
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{getStepTitle(currentStep)}</span>
              <span>Step {currentStep} of {totalSteps}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStep === 1 && <User className="h-5 w-5" />}
                  {currentStep === 2 && <Calendar className="h-5 w-5" />}
                  {currentStep === 3 && <User className="h-5 w-5" />}
                  {currentStep === 4 && <MapPin className="h-5 w-5" />}
                  {currentStep === 5 && <CreditCard className="h-5 w-5" />}
                  {currentStep === 6 && <CheckCircle className="h-5 w-5" />}
                  {getStepTitle(currentStep)}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Choose how you want to complete your notarization'}
                  {currentStep === 2 && 'Select the service that best fits your needs'}
                  {currentStep === 3 && 'Provide your contact information'}
                  {currentStep === 4 && 'Where should we meet you?'}
                  {currentStep === 5 && 'Review your booking and pricing details'}
                  {currentStep === 6 && 'Confirm your booking'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {/* Step 1: Service Type Toggle */}
                  {currentStep === 1 && (
                    <ServiceToggle
                      selectedMode={serviceMode}
                      onModeChange={(mode) => setValue('serviceMode', mode)}
                      showComingSoon={!showMobileRonToggle}
                    />
                  )}

                  {/* Step 2: Service Selection */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      {servicesLoading ? (
                        <div className="text-center py-8">Loading services...</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {services.map((service) => (
                            <Card
                              key={service.id}
                              className={`cursor-pointer transition-all border-2 ${
                                serviceId === service.id
                                  ? 'border-[#A52A2A] bg-red-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setValue('serviceId', service.id)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                <div className="flex justify-between items-center">
                                  <span className="text-2xl font-bold text-[#A52A2A]">
                                    ${service.price}
                                  </span>
                                  {service.requiresDeposit && (
                                    <span className="text-sm text-gray-500">
                                      ${service.depositAmount} deposit
                                    </span>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent>
                                {service.description && (
                                  <p className="text-sm text-gray-600">{service.description}</p>
                                )}
                                {service.duration && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Estimated duration: {service.duration} minutes
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    )}
                    
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceedToNextStep()}
                        className="ml-auto"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="ml-auto bg-[#A52A2A] hover:bg-[#8B0000]"
                      >
                        {isSubmitting ? 'Processing...' : 'Complete Booking'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Real-time Pricing */}
          <div className="lg:col-span-1">
            {enableRealTimePricing && (
              <RealTimePricing
                inputs={pricingInputs}
                onPricingCalculated={setPricing}
                showBreakdown={currentStep >= 2}
                className="sticky top-6"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 