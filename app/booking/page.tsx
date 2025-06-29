"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import UnifiedBookingCalendar from '@/components/unified-booking-calendar';
import { FrontendServiceType, isValidFrontendServiceType } from '@/lib/types/service-types';
import { LocationType } from '@prisma/client';
import Link from 'next/link';

// Unified booking form schema combining best practices from all existing forms
const unifiedBookingSchema = z.object({
  // Step 1: Service Selection
  serviceType: z.string().min(1, 'Please select a service type'),
  numberOfSigners: z.coerce.number().min(1).max(10, 'Maximum 10 signers allowed'),
  promoCode: z.string().optional(),

  // Step 2: Calendar Selection
  calendarId: z.string().min(1, 'Internal error: Calendar ID missing'),
  appointmentStartTime: z.string().min(1, 'Please select an appointment time'),
  appointmentEndTime: z.string().min(1, 'Internal error: End time missing'),
  appointmentFormattedTime: z.string().min(1, 'Internal error: Formatted time missing'),

  // Step 3: Contact Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().optional(),

  // Step 4: Location Details
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(2, 'Please enter a valid state'),
  postalCode: z.string().min(5, 'Please enter a valid postal code'),
  signingLocation: z.enum(['client-location', 'public-place', 'business-office']),

  // Step 5: Additional Information
  specialInstructions: z.string().optional(),
  smsNotifications: z.boolean().default(true),
  emailUpdates: z.boolean().default(true),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type BookingFormData = z.infer<typeof unifiedBookingSchema>;

interface ApiService {
  id: string;
  key: string;
  name: string;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number | null;
  description?: string;
  duration?: number;
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<ApiService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [serviceIdMap, setServiceIdMap] = useState<Record<string, string>>({});

  const totalSteps = 6;

  // Refs for accessibility and focus management
  const stepRefs = {
    1: useRef<HTMLHeadingElement>(null),
    2: useRef<HTMLHeadingElement>(null),
    3: useRef<HTMLHeadingElement>(null),
    4: useRef<HTMLHeadingElement>(null),
    5: useRef<HTMLHeadingElement>(null),
    6: useRef<HTMLHeadingElement>(null),
  };

  const form = useForm<BookingFormData>({
    resolver: zodResolver(unifiedBookingSchema),
    defaultValues: {
      serviceType: 'standard-notary',
      numberOfSigners: 1,
      promoCode: '',
      calendarId: '',
      appointmentStartTime: '',
      appointmentEndTime: '',
      appointmentFormattedTime: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      state: 'TX',
      postalCode: '',
      signingLocation: 'client-location',
      specialInstructions: '',
      smsNotifications: true,
      emailUpdates: true,
      termsAccepted: false,
    },
  });

  const { watch, setValue, formState: { errors, isValid } } = form;
  
  // Watch form values for real-time updates
  const serviceType = watch('serviceType');
  const numberOfSigners = watch('numberOfSigners');
  const appointmentStartTime = watch('appointmentStartTime');
  const appointmentFormattedTime = watch('appointmentFormattedTime');

  // State to track if services are ready for selection
  const [isServicesReady, setIsServicesReady] = useState(false);

  // Load services on mount with proper dependency management
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      setIsServicesReady(false);
      
      try {
        await fetchServices();
        setIsServicesReady(true);
        
        // Pre-select service if provided in URL params (after services are loaded)
        const serviceParam = searchParams?.get('service');
        if (serviceParam) {
          setValue('serviceType', serviceParam);
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        setServicesError('Failed to load services');
      } finally {
        setServicesLoading(false);
      }
    };
    
    loadServices();
  }, [searchParams, setValue]);

  // Update selected service only when services are ready and serviceType changes
  useEffect(() => {
    if (isServicesReady && serviceType && services.length > 0) {
      const service = services.find(s => s.key === serviceType);
      setSelectedService(service || null);
      
      console.log('[SERVICE SELECTION]', {
        serviceType,
        foundService: !!service,
        serviceName: service?.name,
        totalServices: services.length
      });
    } else if (isServicesReady && !serviceType) {
      // Clear selection if no service type is selected
      setSelectedService(null);
    }
  }, [serviceType, services, isServicesReady]);

  // Focus management for accessibility
  useEffect(() => {
    const currentStepRef = stepRefs[currentStep as keyof typeof stepRefs];
    if (currentStepRef.current) {
      setTimeout(() => {
        currentStepRef.current?.focus();
      }, 100);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const fetchServices = async () => {
    try {
      
      const response = await fetch('/api/services-compatible');
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.services?.all || !Array.isArray(data.services.all)) {
        throw new Error('Invalid services data format');
      }
      
      setServices(data.services.all);
      
      // Build service ID mapping
      const newMap: Record<string, string> = {};
      data.services.all.forEach(service => {
        if (service.key && service.id) {
          newMap[service.key] = service.id;
        }
      });
      setServiceIdMap(newMap);
      
    } catch (error) {
      console.error('Error fetching services:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      setServicesError(errorMessage);
      
      toast({
        title: 'Error Loading Services',
        description: 'Could not load service options. Please refresh the page.',
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const getServicePrice = () => {
    if (selectedService) {
      return selectedService.price;
    }
    
    // SOP COMPLIANT: Fallback pricing logic
    switch (serviceType) {
      case 'standard-notary':
        if (numberOfSigners === 1) return 75;
        if (numberOfSigners === 2) return 85;
        if (numberOfSigners === 3) return 95;
        return 100;
      case 'extended-hours-notary':
        return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 10 : 0);
      case 'loan-signing-specialist':
        return 150;
      case 'specialty-notary-service':
        return 75;
      case 'business-solutions':
        return 125;
      case 'support-service':
        return 50;
      default:
        return 75;
    }
  };

  const getServiceName = () => {
    if (selectedService) {
      return selectedService.name;
    }
    
    // SOP COMPLIANT: Service naming
    switch (serviceType) {
      case 'standard-notary':
        return 'Standard Notary Services';
      case 'extended-hours-notary':
        return 'Extended Hours Notary';
      case 'loan-signing-specialist':
        return 'Loan Signing Specialist';
      case 'specialty-notary-service':
        return 'Specialty Notary Service';
      case 'business-solutions':
        return 'Business Solutions';
      case 'support-service':
        return 'Support Services';
      default:
        return 'Notary Service';
    }
  };

  const mapServiceTypeForCalendar = (serviceType: string): FrontendServiceType => {
    if (isValidFrontendServiceType(serviceType)) {
      return serviceType;
    }
    console.warn(`Invalid service type: ${serviceType}, defaulting to standard-notary`);
    return 'standard-notary';
  };

  const handleTimeSelected = (startTime: string, endTime: string, formattedTime: string, calendarId: string) => {
    setValue('appointmentStartTime', startTime);
    setValue('appointmentEndTime', endTime);
    setValue('appointmentFormattedTime', formattedTime);
    setValue('calendarId', calendarId);
  };

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

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get service ID from mapping
      const serviceId = serviceIdMap[data.serviceType];
      if (!serviceId) {
        throw new Error('Invalid service type selected');
      }

      // Map signing location to LocationType enum
      let locationTypeApi: string;
      switch (data.signingLocation) {
        case 'client-location':
          locationTypeApi = 'CLIENT_SPECIFIED_ADDRESS';
          break;
        case 'public-place':
          locationTypeApi = 'PUBLIC_PLACE';
          break;
        case 'business-office':
          locationTypeApi = 'OUR_OFFICE';
          break;
        default:
          throw new Error('Invalid signing location selected');
      }

      const apiPayload = {
        serviceId,
        scheduledDateTime: data.appointmentStartTime,
        locationType: locationTypeApi,
        addressStreet: data.address,
        addressCity: data.city,
        addressState: data.state,
        addressZip: data.postalCode,
        notes: data.specialInstructions,
        promoCode: data.promoCode,
        booking_number_of_signers: data.numberOfSigners,
        consent_terms_conditions: data.termsAccepted,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        consentSms: data.smsNotifications,
        consentEmail: data.emailUpdates,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Request failed with status ${response.status}`);
      }

      if (result.booking?.id) {
        if (result.payment?.clientSecret) {
          // Redirect to payment
          toast({
            title: 'Payment Required',
            description: 'Redirecting to secure payment...',
          });
          router.push(`/checkout?bookingId=${result.booking.id}&paymentIntentId=${result.payment.paymentIntentId}&clientSecret=${result.payment.clientSecret}&amount=${result.payment.amount}`);
        } else {
          // Booking confirmed
          toast({
            title: 'Booking Confirmed!',
            description: `Thank you, ${data.firstName}! Your booking has been processed.`,
          });
          router.push(`/booking/confirmation/${result.booking.id}`);
        }
      } else {
        throw new Error('Booking processed but ID missing');
      }

    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: 'Booking Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return serviceType && !errors.numberOfSigners;
      case 2:
        return appointmentStartTime;
      case 3:
        return !errors.firstName && !errors.lastName && !errors.email && !errors.phone;
      case 4:
        return !errors.address && !errors.city && !errors.state && !errors.postalCode && !errors.signingLocation;
      case 5:
        return true;
      case 6:
        return isValid;
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#002147] mb-2">Book Your Notary Service</h1>
          <p className="text-gray-600">Complete your booking in {totalSteps} simple steps</p>
          <p className="text-sm text-gray-500 mt-2">
            New to our services? Learn about{' '}
            <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline font-medium">
              what to expect during your appointment
            </Link>
          </p>
        </div>

        {/* Confidence Banner */}
        <div className="bg-gradient-to-r from-[#002147] to-[#001a38] border-2 border-[#A52A2A] rounded-lg px-6 py-4 mx-auto max-w-2xl mb-8">
          <div className="flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-[#A52A2A] mr-3" />
            <div className="text-center">
              <div className="text-lg font-bold text-[#A52A2A]">BOOKING WITH CONFIDENCE</div>
              <div className="text-white font-semibold">Flawless the first time—or we pay the redraw fee</div>
              <div className="text-xs text-[#91A3B0] mt-1">*Terms apply. Valid for notarization errors due to our oversight.</div>
            </div>
          </div>
        </div>

        {/* Promotional Alert */}
        <Alert className="mb-6 border-green-400 bg-green-50 text-green-700">
          <Sparkles className="h-5 w-5 text-green-600" />
          <AlertTitle className="font-semibold text-green-800">Unlock Your Discounts!</AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="list-disc space-y-1 pl-5 mt-1">
              <li>
                <strong>New Here?</strong> Get $25 off your first service! Use code{' '}
                <code className="mx-1 rounded bg-green-200 px-1.5 py-0.5 font-semibold text-green-900">FIRST25</code>
                {' '}in the "Promo Code" field below.
              </li>
              <li>
                <strong>Referred by a Friend?</strong> Enter their full name in the "Referred By" field. You'll both save $25!
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep > index + 1
                    ? 'bg-[#A52A2A] text-white'
                    : currentStep === index + 1
                    ? 'bg-[#002147] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-[#002147] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <div>Service</div>
            <div>Calendar</div>
            <div>Contact</div>
            <div>Location</div>
            <div>Details</div>
            <div>Confirm</div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-md">
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[1]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Select Your Service
                    </CardTitle>
                    <CardDescription>Choose the type of notary service you need</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {servicesError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error Loading Services</AlertTitle>
                        <AlertDescription>{servicesError}</AlertDescription>
                      </Alert>
                    )}

                    {servicesLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p>Loading service options...</p>
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel>Service Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                              >
                                {services.map((service) => (
                                  <FormItem key={service.id} className="relative" data-testid="service-option">
                                    <FormControl>
                                      <RadioGroupItem value={service.key} id={service.key} className="peer sr-only" />
                                    </FormControl>
                                    <Label
                                      htmlFor={service.key}
                                      className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5 h-full transition-all hover:border-gray-300"
                                    >
                                      <span className="font-semibold text-lg">{service.name}</span>
                                      {service.description && (
                                        <span className="text-sm text-gray-600 mt-1">{service.description}</span>
                                      )}
                                      <div className="mt-auto pt-3">
                                        <span className="text-2xl font-bold text-[#002147]">
                                          ${service.price}
                                        </span>
                                        {service.requiresDeposit && service.depositAmount && (
                                          <span className="text-xs font-normal text-gray-500 block">
                                            (${service.depositAmount} deposit)
                                          </span>
                                        )}
                                      </div>
                                    </Label>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="numberOfSigners"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Signers</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedService && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">Estimated Price:</h3>
                            <p className="text-sm text-gray-500">Based on service type and number of signers</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#002147]">${getServicePrice()}</div>
                            {selectedService.requiresDeposit && selectedService.depositAmount && (
                              <p className="text-xs text-orange-600 font-semibold">
                                Includes a ${selectedService.depositAmount} deposit
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* Step 2: Calendar Selection */}
              {currentStep === 2 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[2]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Schedule Your Appointment
                    </CardTitle>
                    <CardDescription>Select an available date and time slot</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <UnifiedBookingCalendar
                      serviceType={mapServiceTypeForCalendar(serviceType)}
                      serviceId={serviceIdMap[serviceType] || undefined}
                      numberOfSigners={numberOfSigners}
                      onTimeSelected={handleTimeSelected}
                      variant="full"
                    />

                    {appointmentStartTime && (
                      <div className="bg-green-50 p-4 rounded-md">
                        <h3 className="font-semibold text-green-800">Time Slot Selected</h3>
                        <p className="text-green-700">
                          {appointmentFormattedTime || 'Error displaying time'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[3]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Contact Information
                    </CardTitle>
                    <CardDescription>Provide your contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your company name if applicable" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </>
              )}

              {/* Step 4: Location Details */}
              {currentStep === 4 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[4]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Location Details
                    </CardTitle>
                    <CardDescription>Where will the notarization take place?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Mileage Fee Notice */}
                    <Alert className="border-blue-400 bg-blue-50 text-blue-700">
                      <AlertTriangle className="h-5 w-5 text-blue-600" />
                      <AlertTitle className="font-semibold text-blue-800">Mileage Fee Notice</AlertTitle>
                      <AlertDescription className="text-sm">
                        For locations beyond a 20-mile radius from our business base (zip code <strong>77591</strong>), 
                        a mileage fee of $1.10 per additional mile (round trip) will apply. This will be calculated 
                        and invoiced separately after your booking is confirmed, if applicable.
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={form.control}
                      name="signingLocation"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Signing Location Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                              <div className="relative">
                                <RadioGroupItem value="client-location" id="client-location" className="peer sr-only" />
                                <Label
                                  htmlFor="client-location"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5 transition-all hover:border-gray-300"
                                >
                                  <span className="font-semibold">Residence</span>
                                  <span className="text-sm text-gray-500">Home or apartment</span>
                                </Label>
                              </div>
                              <div className="relative">
                                <RadioGroupItem value="business-office" id="business-office" className="peer sr-only" />
                                <Label
                                  htmlFor="business-office"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5 transition-all hover:border-gray-300"
                                >
                                  <span className="font-semibold">Business Office</span>
                                  <span className="text-sm text-gray-500">Office or workplace</span>
                                </Label>
                              </div>
                              <div className="relative">
                                <RadioGroupItem value="public-place" id="public-place" className="peer sr-only" />
                                <Label
                                  htmlFor="public-place"
                                  className="flex flex-col p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-[#002147] peer-data-[state=checked]:bg-[#002147]/5 transition-all hover:border-gray-300"
                                >
                                  <span className="font-semibold">Public Place</span>
                                  <span className="text-sm text-gray-500">Café, library, etc.</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </>
              )}

              {/* Step 5: Additional Details */}
              {currentStep === 5 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[5]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Additional Details
                    </CardTitle>
                    <CardDescription>Provide any special instructions or requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="promoCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promo Code (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter promo code" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any special instructions or additional information"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                I would like to receive SMS notifications about my appointment
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emailUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                I would like to receive email updates about my appointment
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 6: Confirmation */}
              {currentStep === 6 && (
                <>
                  <CardHeader>
                    <CardTitle ref={stepRefs[6]} tabIndex={-1} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm">
                      Confirm Your Booking
                    </CardTitle>
                    <CardDescription>Review and confirm your appointment details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium">{getServiceName()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of Signers:</span>
                          <span className="font-medium">{numberOfSigners}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date & Time:</span>
                          <span className="font-medium">{appointmentFormattedTime || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">
                            {watch('address')}, {watch('city')}, {watch('state')} {watch('postalCode')}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between">
                          <span className="font-semibold text-base">Total:</span>
                          <span className="font-bold text-lg text-[#002147]">${getServicePrice()}</span>
                        </div>
                        {selectedService?.requiresDeposit && selectedService.depositAmount && (
                          <div className="text-xs text-orange-600 font-semibold">
                            Includes ${selectedService.depositAmount} deposit, payable upon booking
                          </div>
                        )}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the{' '}
                              <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#002147] underline hover:text-[#A52A2A]">
                                terms and conditions
                              </Link>
                              {' '}and understand that a valid government-issued photo ID will be required for all signers.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </>
              )}

              <CardFooter className="flex justify-between">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
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
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="ml-auto bg-[#A52A2A] hover:bg-[#8B0000]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete Booking'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
