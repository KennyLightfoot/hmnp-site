"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, AlertTriangle, CheckCircle, User, MapPin, Phone, Mail, Building, MessageSquare } from 'lucide-react';
import UnifiedBookingCalendar from '@/components/unified-booking-calendar';

// Unified booking form schema combining best practices from all existing forms
const unifiedBookingSchema = z.object({
  // Step 1: Service Selection
  serviceId: z.string().min(1, 'Please select a service'),
  numberOfSigners: z.coerce.number().min(1).max(10, 'Maximum 10 signers allowed'),
  promoCode: z.string().optional(),

  // Step 2: Calendar Selection (will be populated by calendar component)
  calendarId: z.string().min(1, 'Internal error: Calendar ID missing'),
  appointmentStartTime: z.string().min(1, 'Please select an appointment time'),
  appointmentEndTime: z.string().min(1, 'Internal error: End time missing'),
  appointmentFormattedTime: z.string().min(1, 'Internal error: Formatted time missing'),

  // Step 3: Contact Information (API-compatible field names)
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().min(10, 'Please enter a valid phone number'),

  // Step 4: Location Details (API-compatible field names)
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'PUBLIC_PLACE']),
  addressStreet: z.string().min(5, 'Please enter a valid street address'),
  addressCity: z.string().min(2, 'Please enter a valid city'),
  addressState: z.string().min(2, 'Please enter a valid state'),
  addressZip: z.string().min(5, 'Please enter a valid ZIP code'),
  locationNotes: z.string().optional(),

  // Step 5: Additional Information
  notes: z.string().optional(),
  referredBy: z.string().optional(),
  
  // Step 6: Consent and Terms
  consentSms: z.boolean().default(true),
  consentEmail: z.boolean().default(true),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type UnifiedBookingFormData = z.infer<typeof unifiedBookingSchema>;

interface ApiService {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  depositAmount?: number | null;
  requiresDeposit: boolean;
  durationMinutes: number;
  isActive: boolean;
}

interface UnifiedBookingFormProps {
  variant?: 'simple' | 'full' | 'multi-step';
  onSubmit?: (data: UnifiedBookingFormData) => void;
  loading?: boolean;
  initialData?: Partial<UnifiedBookingFormData>;
}

const US_STATES = [
  { value: 'TX', label: 'Texas' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export default function UnifiedBookingForm({ 
  variant = 'multi-step', 
  onSubmit,
  loading = false,
  initialData 
}: UnifiedBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<ApiService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string; bookingId?: string } | null>(null);

  // State for selected time slot from UnifiedBookingCalendar
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
    formattedTime: string;
    calendarId: string;
  } | null>(null);

  // State for promo code validation
  const [promoValidation, setPromoValidation] = useState<{
    isValid: boolean;
    discountAmount?: number;
    finalAmount?: number;
    error?: string;
  } | null>(null);

  const totalSteps = variant === 'simple' ? 3 : variant === 'full' ? 4 : 6;

  // Refs for accessibility and focus management
  const stepRefs = {
    1: useRef<HTMLHeadingElement>(null),
    2: useRef<HTMLHeadingElement>(null),
    3: useRef<HTMLHeadingElement>(null),
    4: useRef<HTMLHeadingElement>(null),
    5: useRef<HTMLHeadingElement>(null),
    6: useRef<HTMLHeadingElement>(null),
  };

  const form = useForm<UnifiedBookingFormData>({
    resolver: zodResolver(unifiedBookingSchema),
    defaultValues: {
      serviceId: initialData?.serviceId || '',
      numberOfSigners: initialData?.numberOfSigners || 1,
      promoCode: initialData?.promoCode || '',
      calendarId: initialData?.calendarId || '',
      appointmentStartTime: initialData?.appointmentStartTime || '',
      appointmentEndTime: initialData?.appointmentEndTime || '',
      appointmentFormattedTime: initialData?.appointmentFormattedTime || '',
      customerName: initialData?.customerName || '',
      customerEmail: initialData?.customerEmail || '',
      customerPhone: initialData?.customerPhone || '',
      locationType: initialData?.locationType || 'CLIENT_SPECIFIED_ADDRESS',
      addressStreet: initialData?.addressStreet || '',
      addressCity: initialData?.addressCity || '',
      addressState: initialData?.addressState || 'TX',
      addressZip: initialData?.addressZip || '',
      locationNotes: initialData?.locationNotes || '',
      notes: initialData?.notes || '',
      referredBy: initialData?.referredBy || '',
      consentSms: initialData?.consentSms ?? true,
      consentEmail: initialData?.consentEmail ?? true,
      termsAccepted: initialData?.termsAccepted || false,
    },
    mode: 'onChange',
  });

  const watchedServiceId = useWatch({ control: form.control, name: 'serviceId' });
  const watchedNumberOfSigners = useWatch({ control: form.control, name: 'numberOfSigners' });
  const watchedPromoCode = useWatch({ control: form.control, name: 'promoCode' });
  const watchedLocationType = useWatch({ control: form.control, name: 'locationType' });

  // Load services on component mount
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data.services || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServicesError('Could not load service options.');
      } finally {
        setServicesLoading(false);
      }
    }
    fetchServices();
  }, []);

  // Get selected service details
  useEffect(() => {
    const service = services.find(service => service.id === watchedServiceId);
    setSelectedService(service || null);
  }, [watchedServiceId, services]);

  // Handle time selection from calendar
  const handleTimeSelected = (startTime: string, endTime: string, formattedTime: string, calendarId: string) => {
    setSelectedSlot({ startTime, endTime, formattedTime, calendarId });
    form.setValue('calendarId', calendarId);
    form.setValue('appointmentStartTime', startTime);
    form.setValue('appointmentEndTime', endTime);
    form.setValue('appointmentFormattedTime', formattedTime);
    setSubmitStatus(null);
  };

  // Validate promo code when it changes
  useEffect(() => {
    if (watchedPromoCode && watchedPromoCode.trim() && selectedService) {
      validatePromoCode(watchedPromoCode.trim(), selectedService.id, selectedService.basePrice);
    } else {
      setPromoValidation(null);
    }
  }, [watchedPromoCode, selectedService]);

  const validatePromoCode = async (code: string, serviceId: string, amount: number) => {
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          serviceId,
          originalAmount: amount,
          // Only send email if it's been validated
          ...(form.getFieldState('customerEmail').isDirty &&
            !form.getFieldState('customerEmail').error && {
              customerEmail: form.getValues('customerEmail'),
            }),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPromoValidation(result);
      } else {
        const errorData = await response.json();
        setPromoValidation({ isValid: false, error: errorData.error || 'Invalid promo code' });
      }
    } catch (error) {
      setPromoValidation({ isValid: false, error: 'Failed to validate promo code' });
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'CLIENT_SPECIFIED_ADDRESS':
        return 'Client Address';
      case 'PUBLIC_PLACE':
        return 'Public Location';
      default:
        return type;
    }
  };

  const getLocationTypeDescription = (type: string) => {
    switch (type) {
      case 'CLIENT_SPECIFIED_ADDRESS':
        return 'We come to your location (home, office, etc.)';
      case 'PUBLIC_PLACE':
        return 'Meet at a public location (coffee shop, library, etc.)';
      default:
        return '';
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return watchedServiceId && watchedNumberOfSigners > 0;
      case 2:
        return selectedSlot && selectedSlot.startTime && selectedSlot.calendarId;
      case 3:
        const nameValid = form.getValues('customerName')?.length >= 2;
        const emailValid = form.getValues('customerEmail')?.includes('@');
        const phoneValid = form.getValues('customerPhone')?.length >= 10;
        return nameValid && emailValid && phoneValid;
      case 4:
        const addressValid = form.getValues('addressStreet')?.length >= 5;
        const cityValid = form.getValues('addressCity')?.length >= 2;
        const stateValid = form.getValues('addressState')?.length >= 2;
        const zipValid = form.getValues('addressZip')?.length >= 5;
        return addressValid && cityValid && stateValid && zipValid;
      case 5:
        return true; // Additional info is optional
      case 6:
        return form.getValues('termsAccepted') === true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      stepRefs[currentStep + 1 as keyof typeof stepRefs]?.current?.focus();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      stepRefs[currentStep - 1 as keyof typeof stepRefs]?.current?.focus();
    }
  };

  async function handleSubmit(data: UnifiedBookingFormData) {
    if (!selectedSlot) {
      setSubmitStatus({ success: false, message: 'Please select an available time slot from the calendar.' });
      return;
    }

    if (!selectedService) {
      setSubmitStatus({ success: false, message: 'Please select a service.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // API-compatible payload
    const payload = {
      serviceId: data.serviceId,
      scheduledDateTime: selectedSlot.startTime,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      locationType: data.locationType,
      addressStreet: data.addressStreet,
      addressCity: data.addressCity,
      addressState: data.addressState,
      addressZip: data.addressZip,
      locationNotes: data.locationNotes || '',
      notes: data.notes || '',
      promoCode: data.promoCode || '',
    };

    try {
      if (onSubmit) {
        onSubmit(data);
      } else {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred processing the response.' }));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.booking && result.booking.id) {
          if (result.checkoutUrl) {
            window.location.href = result.checkoutUrl;
          } else {
            window.location.href = `/booking-confirmed?bookingId=${result.booking.id}`;
          }
        } else {
          setSubmitStatus({ 
            success: false, 
            message: result.error || result.message || 'Booking creation failed. Please check details and try again.' 
          });
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitStatus({ 
        success: false, 
        message: error.message || 'An unexpected error occurred. Please try again.' 
      });
    }
    setIsSubmitting(false);
  }

  // Render step content based on variant and current step
  const renderStepContent = () => {
    if (variant === 'simple') {
      return renderSimpleForm();
    } else if (variant === 'full') {
      return renderFullForm();
    } else {
      return renderMultiStepForm();
    }
  };

  const renderSimpleForm = () => (
    <div className="space-y-6">
      {renderServiceSelection()}
      {renderContactInformation()}
      {renderLocationDetails()}
    </div>
  );

  const renderFullForm = () => (
    <div className="space-y-6">
      {renderServiceSelection()}
      {selectedService && (
        <div className="my-6 p-4 border rounded-md bg-slate-50">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Select Appointment Time</h3>
          <UnifiedBookingCalendar
            serviceId={selectedService.id}
            numberOfSigners={watchedNumberOfSigners}
            onTimeSelected={handleTimeSelected}
          />
          {selectedSlot && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-700">
                Selected Time: <span className="font-bold">{selectedSlot.formattedTime}</span>
              </p>
            </div>
          )}
        </div>
      )}
      {renderContactInformation()}
      {renderLocationDetails()}
    </div>
  );

  const renderMultiStepForm = () => {
    switch (currentStep) {
      case 1:
        return renderServiceSelection();
      case 2:
        return renderCalendarSelection();
      case 3:
        return renderContactInformation();
      case 4:
        return renderLocationDetails();
      case 5:
        return renderAdditionalInformation();
      case 6:
        return renderConsentAndTerms();
      default:
        return renderServiceSelection();
    }
  };

  const renderServiceSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle ref={stepRefs[1]} tabIndex={-1} className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {variant === 'multi-step' ? 'Step 1: ' : ''}Service Selection
        </CardTitle>
        <CardDescription>
          Choose the notary service you need and specify the number of signers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={servicesLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={servicesLoading ? "Loading services..." : "Select a service"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {servicesError && <p className="p-4 text-sm text-red-500">{servicesError}</p>}
                  {services.length === 0 && !servicesLoading && <p className="p-4 text-sm text-gray-500">No services available</p>}
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.basePrice}
                      {service.requiresDeposit && service.depositAmount && (
                        <span className="text-sm text-muted-foreground ml-2">
                          (${service.depositAmount} deposit)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfSigners"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Signers</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="10" placeholder="1" {...field} />
              </FormControl>
              <FormDescription>How many people will be signing documents?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promoCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter promo code (e.g., WELCOME10, SAVE25)" {...field} />
              </FormControl>
              {promoValidation && (
                <FormDescription className={promoValidation.isValid ? "text-green-600" : "text-red-600"}>
                  {promoValidation.isValid
                    ? `Valid! Save $${promoValidation.discountAmount?.toFixed(2)} - Final amount: $${promoValidation.finalAmount?.toFixed(2)}`
                    : promoValidation.error
                  }
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderCalendarSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle ref={stepRefs[2]} tabIndex={-1} className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Step 2: Select Appointment Time
        </CardTitle>
        <CardDescription>
          Choose your preferred date and time for the notary appointment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedService && watchedNumberOfSigners > 0 ? (
          <div className="space-y-4">
            <UnifiedBookingCalendar
              serviceId={selectedService.id}
              numberOfSigners={watchedNumberOfSigners}
              onTimeSelected={handleTimeSelected}
            />
            {selectedSlot && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-700">
                  Selected Time: <span className="font-bold">{selectedSlot.formattedTime}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Service Selection Required</AlertTitle>
            <AlertDescription>
              Please go back to Step 1 and select a service before choosing an appointment time.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderContactInformation = () => (
    <Card>
      <CardHeader>
        <CardTitle ref={stepRefs[3]} tabIndex={-1} className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {variant === 'multi-step' ? 'Step 3: ' : ''}Contact Information
        </CardTitle>
        <CardDescription>
          Please provide your contact details for appointment coordination.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(713) 555-0123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderLocationDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle ref={stepRefs[4]} tabIndex={-1} className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {variant === 'multi-step' ? 'Step 4: ' : ''}Service Location
        </CardTitle>
        <CardDescription>
          Where would you like the notary service to take place?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="locationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {['CLIENT_SPECIFIED_ADDRESS', 'PUBLIC_PLACE'].map((type) => (
                    <div key={type} className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value={type} id={type} />
                      <div className="flex-1">
                        <label htmlFor={type} className="font-medium cursor-pointer">
                          {getLocationTypeLabel(type)}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {getLocationTypeDescription(type)}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="addressStreet"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input placeholder="77001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="locationNotes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Location Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special instructions for finding your location (e.g., gate code, apartment number, parking information)"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderAdditionalInformation = () => (
    <Card>
      <CardHeader>
        <CardTitle ref={stepRefs[5]} tabIndex={-1} className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Step 5: Additional Information
        </CardTitle>
        <CardDescription>
          Any special instructions or notes for your appointment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requirements, documents to bring, or other notes for your notary appointment"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referredBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referred by (Name or Email - Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter referrer's name or email" {...field} />
              </FormControl>
              <FormDescription>
                If someone referred you, let us know!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderConsentAndTerms = () => (
    <Card>
      <CardHeader>
        <CardTitle ref={stepRefs[6]} tabIndex={-1} className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Step 6: Consent & Terms
        </CardTitle>
        <CardDescription>
          Please review and accept our terms and communication preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="consentSms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I consent to receive SMS (text message) notifications related to my booking.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentEmail"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I consent to receive email updates and confirmations related to my booking.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I accept the <a href="/terms" className="text-[#A52A2A] underline">Terms and Conditions</a> and <a href="/privacy" className="text-[#A52A2A] underline">Privacy Policy</a>.
                </FormLabel>
                <FormDescription>
                  Please note that a deposit may be required to secure your booking, as detailed in our Deposit Policy.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 p-6 md:p-8 lg:p-10 border rounded-lg shadow-lg bg-white">
        {variant === 'multi-step' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Request a Service Booking</h2>
              <div className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
          </div>
        )}

        {variant !== 'multi-step' && (
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Request a Service Booking</h2>
        )}

        {renderStepContent()}

        {submitStatus && (
          <Alert className={submitStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {submitStatus.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={submitStatus.success ? 'text-green-700' : 'text-red-700'}>
              {submitStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {variant === 'multi-step' ? (
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting || loading || !form.getValues('termsAccepted')}
              >
                {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmitting || loading ? 'Creating Booking...' : 'Book Appointment Now'}
              </Button>
            )}
          </div>
        ) : (
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || loading}
          >
            {(isSubmitting || loading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting || loading ? 'Creating Booking...' : 'Book Appointment Now'}
          </Button>
        )}
      </form>
    </Form>
  );
}