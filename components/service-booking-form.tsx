"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from 'react';
import AppointmentCalendar, { ServiceType } from "@/components/appointment-calendar";

interface ApiService {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  depositAmount?: number | null;
  requiresDeposit: boolean;
  duration: number;
  serviceType?: ServiceType;
  isActive: boolean;
}

// Updated schema for new booking system
const serviceBookingSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  serviceId: z.string({ required_error: "Please select a service." }),
  numberOfSigners: z.coerce.number({
    required_error: "Number of signers is required.",
    invalid_type_error: "Number of signers must be a number."
  }).min(1, { message: "Number of signers must be at least 1." }),
  serviceAddressStreet: z.string().min(5, { message: "Please enter a street address." }),
  serviceAddressCity: z.string().min(2, { message: "Please enter a city." }),
  serviceAddressState: z.string().min(2, { message: "Please enter a state." }),
  serviceAddressZip: z.string().min(5, { message: "Please enter a valid ZIP code." }),
  additionalNotes: z.string().optional(),
  promoCode: z.string().optional(),
  referredBy: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions to proceed." }),
  consentSms: z.boolean().optional(),
  consentEmail: z.boolean().optional()
});

type ServiceBookingFormValues = z.infer<typeof serviceBookingSchema>;

const defaultValues: Partial<ServiceBookingFormValues> = {
  fullName: "",
  email: "",
  phone: "",
  serviceId: undefined,
  numberOfSigners: 1,
  serviceAddressStreet: "",
  serviceAddressCity: "",
  serviceAddressState: "",
  serviceAddressZip: "",
  additionalNotes: "",
  promoCode: "",
  referredBy: "",
  termsAccepted: false,
  consentSms: false,
  consentEmail: false,
};

export function ServiceBookingForm() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string; bookingId?: string } | null>(null);
  
  // State for selected time slot from AppointmentCalendar
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
        console.error("Error fetching services:", error);
        setSubmitStatus({ success: false, message: 'Could not load service options.' });
      }
    }
    fetchServices();
  }, []);

  const form = useForm<ServiceBookingFormValues>({
    resolver: zodResolver(serviceBookingSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedServiceId = useWatch({ control: form.control, name: "serviceId" });
  const watchedNumberOfSigners = useWatch({ control: form.control, name: "numberOfSigners" });
  const watchedPromoCode = useWatch({ control: form.control, name: "promoCode" });

  // Get selected service details
  const selectedService = services.find(service => service.id === watchedServiceId);

  const handleTimeSelected = (startTime: string, endTime: string, formattedTime: string, calendarId: string) => {
    setSelectedSlot({ startTime, endTime, formattedTime, calendarId });
    setSubmitStatus(null);
  };

  // Validate promo code when it changes
  useEffect(() => {
    if (watchedPromoCode && watchedPromoCode.trim() && selectedService) {
      validatePromoCode(watchedPromoCode.trim(), selectedService.id, selectedService.price);
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
          customerEmail: form.getValues('email')
        })
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

  async function onSubmit(data: ServiceBookingFormValues) {
    if (!selectedSlot) {
      setSubmitStatus({ success: false, message: "Please select an available time slot from the calendar." });
      return;
    }

    if (!selectedService) {
      setSubmitStatus({ success: false, message: "Please select a service." });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    console.log("!!!!!!!!!! FORM ONSUBMIT CALLED !!!!!!!!!!"); 
    console.log("!!!!!!!!!! FORM DATA:", data);
    console.log("!!!!!!!!!! SELECTED SLOT:", selectedSlot);

    // Updated payload for new booking system - matching API expectations
    const payload = {
      serviceId: data.serviceId,
      scheduledDateTime: selectedSlot.startTime,
      customerName: data.fullName,          // ✅ Fixed: API expects customerName
      customerEmail: data.email,            // ✅ Fixed: API expects customerEmail  
      customerPhone: data.phone,            // ✅ Fixed: API expects customerPhone
      locationType: 'CLIENT_SPECIFIED_ADDRESS',
      addressStreet: data.serviceAddressStreet,
      addressCity: data.serviceAddressCity,
      addressState: data.serviceAddressState,
      addressZip: data.serviceAddressZip,
      locationNotes: '',                    // ✅ Fixed: API expects locationNotes
      notes: data.additionalNotes || '',    // ✅ Fixed: API expects notes
      promoCode: data.promoCode || '',      // ✅ Fixed: API expects promoCode
    };

    try {
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
      console.log("!!!!!!!!!! FRONTEND API RESPONSE:", result);
      
      if (result.booking && result.booking.id) {
        if (result.checkoutUrl) {
          console.log("!!!!!!!!!! REDIRECTING TO CHECK OUT URL:", result.checkoutUrl);
          // Redirect to Stripe for payment
          window.location.href = result.checkoutUrl;
        } else {
          console.log("!!!!!!!!!! NO CHECKOUT URL, REDIRECTING TO CONFIRMATION");
          // Booking confirmed without payment
          window.location.href = `/booking-confirmed?bookingId=${result.booking.id}`;
        }
      } else {
        console.log("!!!!!!!!!! NO BOOKING ID IN RESPONSE");
        setSubmitStatus({ 
          success: false, 
          message: result.error || result.message || "Booking creation failed. Please check details and try again." 
        });
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitStatus({ 
        success: false, 
        message: error.message || "An unexpected error occurred. Please try again." 
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 md:p-8 lg:p-10 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Request a Service Booking</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.length === 0 && <p className="p-4 text-sm text-gray-500">Loading services...</p>}
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
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
              <FormLabel>Number of Signers (if applicable)</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedService && selectedService.serviceType && watchedNumberOfSigners && watchedNumberOfSigners > 0 && (
          <div className="my-6 p-4 border rounded-md bg-slate-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Select Appointment Time</h3>
            <AppointmentCalendar
              serviceType={selectedService.serviceType}
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

        <h3 className="text-xl font-medium text-gray-700 pt-4 border-t mt-6">Service Address</h3>
        <FormField
          control={form.control}
          name="serviceAddressStreet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="serviceAddressCity"
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
            name="serviceAddressState"
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
            name="serviceAddressZip"
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
        </div>

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

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special instructions or additional information..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 pt-4 border-t">
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
        </div>

        {submitStatus && (
          <div className={`p-4 rounded-md ${submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p>{submitStatus.message}</p>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creating Booking...' : 'Book Appointment Now'}
        </Button>
      </form>
    </Form>
  );
}
