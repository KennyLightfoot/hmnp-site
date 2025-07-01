"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  User,
  Phone,
  Mail,
  Home,
  CreditCard,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import UnifiedBookingCalendar from '@/components/unified-booking-calendar';
import { EnhancedPricingComponent } from '@/components/booking/EnhancedPricingEngine';
import ServiceAreaMap from '@/components/maps/ServiceAreaMap';

// Form validation schema
const enhancedBookingSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  numberOfSigners: z.coerce.number().min(1).max(10, 'Maximum 10 signers allowed'),
  numberOfDocuments: z.coerce.number().min(1).max(100, 'Maximum 100 documents allowed'),
  
  // Calendar
  calendarId: z.string().min(1, 'Please select an appointment time'),
  appointmentStartTime: z.string().min(1, 'Please select an appointment time'),
  appointmentEndTime: z.string().min(1, 'Appointment end time is required'),
  appointmentFormattedTime: z.string().min(1, 'Formatted time is required'),
  
  // Contact
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().optional(),
  
  // Location
  addressStreet: z.string().min(5, 'Please enter a valid street address'),
  addressCity: z.string().min(2, 'Please enter a valid city'),
  addressState: z.string().min(2, 'Please enter a valid state'),
  addressZip: z.string().min(5, 'Please enter a valid ZIP code'),
  locationType: z.enum(['client-location', 'public-place', 'business-office']),
  locationNotes: z.string().optional(),
  
  // Additional
  specialInstructions: z.string().optional(),
  promoCode: z.string().optional(),
});

type FormData = z.infer<typeof enhancedBookingSchema>;

interface Service {
  id: string;
  key: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  basePrice: number;
  requiresDeposit: boolean;
  depositAmount: number;
  typeLabel: string;
  serviceType: string;
}

interface ServiceResponse {
  success: boolean;
  services: {
    all: Service[];
    byType: Record<string, Service[]>;
    typeLabels: Record<string, string>;
  };
  meta: {
    totalServices: number;
    serviceTypes: string[];
  };
}

const STEPS = [
  { id: 1, title: 'Select Service', description: 'Choose your notary service type' },
  { id: 2, title: 'Pick Time', description: 'Select appointment date & time' },
  { id: 3, title: 'Contact Info', description: 'Provide your contact details' },
  { id: 4, title: 'Location', description: 'Specify service location' },
  { id: 5, title: 'Review & Pay', description: 'Confirm and complete booking' },
];

export default function EnhancedBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingResult, setPricingResult] = useState<any>(null);
  const [locationValidated, setLocationValidated] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(enhancedBookingSchema),
    defaultValues: {
      numberOfSigners: 1,
      numberOfDocuments: 1,
      addressState: 'TX',
      locationType: 'client-location',
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    fetchServices();
  }, []);

  // Auto-advance logic based on form completion
  useEffect(() => {
    const values = form.getValues();
    
    if (currentStep === 1 && values.serviceId && selectedService) {
      // Auto-advance after service selection
    } else if (currentStep === 2 && values.calendarId && values.appointmentStartTime) {
      // Auto-advance after time selection
    }
  }, [watchedValues, currentStep, selectedService, form]);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch('/api/services');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }
      
      const data: ServiceResponse = await response.json();
      
      if (!data.success || !data.services?.all) {
        throw new Error('Invalid services response');
      }
      
      setServices(data.services.all);
      
      // Pre-select service if provided in URL
      const serviceParam = searchParams?.get('service');
      if (serviceParam) {
        const service = data.services.all.find(s => s.key === serviceParam);
        if (service) {
          setSelectedService(service);
          form.setValue('serviceId', service.id);
        }
      }
      
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error Loading Services',
        description: 'Could not load service options. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    form.setValue('serviceId', service.id);
    setCurrentStep(2);
  };

  const handleCalendarSelection = (calendarData: any) => {
    form.setValue('calendarId', calendarData.calendarId);
    form.setValue('appointmentStartTime', calendarData.startTime);
    form.setValue('appointmentEndTime', calendarData.endTime);
    form.setValue('appointmentFormattedTime', calendarData.formattedTime);
    setCurrentStep(3);
  };

  const handleLocationSelect = (locationData: any) => {
    setLocationValidated(locationData.isWithinServiceArea);
    // Location data is automatically used by pricing component
  };

  const handleNextStep = async () => {
    let isValid = true;
    
    // Validate current step
    switch (currentStep) {
      case 1:
        isValid = !!selectedService;
        if (!isValid) {
          toast({ title: 'Please select a service', variant: 'destructive' });
        }
        break;
      case 2:
        const calendarValues = ['calendarId', 'appointmentStartTime', 'appointmentEndTime'];
        for (const field of calendarValues) {
          const result = await form.trigger(field as keyof FormData);
          if (!result) isValid = false;
        }
        break;
      case 3:
        const contactFields = ['firstName', 'lastName', 'email', 'phone'];
        for (const field of contactFields) {
          const result = await form.trigger(field as keyof FormData);
          if (!result) isValid = false;
        }
        break;
      case 4:
        const locationFields = ['addressStreet', 'addressCity', 'addressState', 'addressZip'];
        for (const field of locationFields) {
          const result = await form.trigger(field as keyof FormData);
          if (!result) isValid = false;
        }
        if (!locationValidated) {
          toast({ 
            title: 'Location outside service area', 
            description: 'Please select a location within our service area or contact us directly.',
            variant: 'destructive' 
          });
          isValid = false;
        }
        break;
    }
    
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!pricingResult?.success) {
      toast({
        title: 'Pricing calculation required',
        description: 'Please wait for pricing calculation to complete.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        ...data,
        pricingBreakdown: pricingResult.pricing,
        calculatedDistance: pricingResult.pricing.locationFees.distance,
        travelFee: pricingResult.pricing.locationFees.travelFee,
        serviceAreaValidated: locationValidated,
        pricingVersion: '2.0.0'
      };

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      toast({
        title: 'Booking Created Successfully!',
        description: 'You will receive a confirmation email shortly.',
      });

      router.push(`/booking/confirmation/${result.bookingId}`);
      
    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was an error creating your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Booking Experience</h1>
          </div>
          <p className="text-lg text-gray-600">Professional notary services with real-time pricing and instant booking</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                  currentStep >= step.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="mb-8">
                  <CardContent className="p-6">
                    {/* Step 1: Service Selection */}
                    {currentStep === 1 && (
                      <div>
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Select Your Service
                          </CardTitle>
                        </CardHeader>
                        
                        {servicesLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading services...</p>
                          </div>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2">
                            {services.map((service) => (
                              <Card 
                                key={service.id} 
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  selectedService?.id === service.id ? 'ring-2 ring-indigo-600' : ''
                                }`}
                                onClick={() => handleServiceSelect(service)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg">{service.name}</h3>
                                    <Badge variant="secondary">${service.basePrice}</Badge>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {service.duration}min
                                    </div>
                                    {service.requiresDeposit && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        ${service.depositAmount} deposit
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Service Details */}
                        {selectedService && (
                          <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="numberOfDocuments"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Number of Documents</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        max="100" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="promoCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Promo Code (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter promo code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Calendar */}
                    {currentStep === 2 && selectedService && (
                      <div>
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Pick Your Time
                          </CardTitle>
                        </CardHeader>
                        
                        <Alert className="mb-4">
                          <AlertDescription>
                            Selected Service: <strong>{selectedService.name}</strong> - ${selectedService.basePrice}
                          </AlertDescription>
                        </Alert>

                        <UnifiedBookingCalendar
                          serviceType={selectedService.serviceType}
                          onTimeSelected={handleCalendarSelection}
                          showTimeZone={true}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Step 3: Contact Information */}
                    {currentStep === 3 && (
                      <div>
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
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
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                                  <Input type="tel" placeholder="(555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Company name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 4: Location */}
                    {currentStep === 4 && (
                      <div>
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Service Location
                          </CardTitle>
                        </CardHeader>
                        
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="locationType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location Type</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="client-location" id="client-location" />
                                      <label htmlFor="client-location">Client Location (Home/Office)</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="public-place" id="public-place" />
                                      <label htmlFor="public-place">Public Place (Library, Coffee Shop)</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="business-office" id="business-office" />
                                      <label htmlFor="business-office">Business Office</label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={form.control}
                              name="addressStreet"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main Street" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="addressCity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Houston" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="addressState"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                      <Input placeholder="TX" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="addressZip"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="77573" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="locationNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Building name, floor, unit number, parking instructions, etc."
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Service Area Map */}
                          <ServiceAreaMap
                            selectedServiceType={selectedService?.serviceType}
                            onLocationSelect={handleLocationSelect}
                            showSearch={false}
                            showLegend={true}
                            showMultipleServiceAreas={true}
                            height="300px"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 5: Review & Payment */}
                    {currentStep === 5 && selectedService && (
                      <div>
                        <CardHeader className="px-0 pt-0">
                          <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Review & Complete Booking
                          </CardTitle>
                        </CardHeader>
                        
                        <div className="space-y-6">
                          {/* Booking Summary */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Booking Summary</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Service:</span>
                                <span className="font-medium">{selectedService.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Date & Time:</span>
                                <span>{form.getValues('appointmentFormattedTime')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Location:</span>
                                <span>
                                  {form.getValues('addressStreet')}, {form.getValues('addressCity')}, {form.getValues('addressState')} {form.getValues('addressZip')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Contact:</span>
                                <span>{form.getValues('firstName')} {form.getValues('lastName')}</span>
                              </div>
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="specialInstructions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Special Instructions (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Any special requirements, accessibility needs, or additional information..."
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              By proceeding with this booking, you agree to our terms of service and privacy policy. 
                              A confirmation email will be sent to {form.getValues('email')}.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    onClick={handlePrevStep} 
                    disabled={currentStep === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  
                  {currentStep < STEPS.length ? (
                    <Button 
                      type="button"
                      onClick={handleNextStep}
                      disabled={currentStep === 1 && !selectedService}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !pricingResult?.success}
                    >
                      {isSubmitting ? 'Creating Booking...' : 'Complete Booking'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Sidebar - Real-time Pricing */}
          <div className="lg:col-span-1">
            {selectedService && currentStep >= 2 && (
              <div className="sticky top-8">
                <EnhancedPricingComponent
                  serviceType={selectedService.serviceType}
                  numberOfSigners={form.watch('numberOfSigners') || 1}
                  numberOfDocuments={form.watch('numberOfDocuments') || 1}
                  appointmentDateTime={form.watch('appointmentStartTime') ? new Date(form.watch('appointmentStartTime')) : new Date()}
                  location={{
                    address: form.watch('addressStreet') || '',
                    city: form.watch('addressCity') || '',
                    state: form.watch('addressState') || 'TX',
                    zip: form.watch('addressZip') || ''
                  }}
                  promoCode={form.watch('promoCode')}
                  onPricingUpdate={setPricingResult}
                  showBreakdown={true}
                  showValidation={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}