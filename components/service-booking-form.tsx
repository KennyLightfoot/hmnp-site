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
} from "@/components/ui/select"; // Assuming Shadcn UI Select is available
import { useState, useEffect } from 'react';
import AppointmentCalendar from "@/components/appointment-calendar"; // Import the calendar component

interface ApiService {
  id: string; // This will be the UUID for the service
  name: string;
  description?: string | null;
  basePrice: number; // Assuming Prisma Decimal is converted to number
  depositAmount?: number | null;
  requiresDeposit: boolean;
  // Add any other fields from your Service model that might be useful in the form
}

// Schema updated for direct calendar booking
const serviceBookingSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  serviceType: z.string({ required_error: "Please select a service type." }),
  numberOfSigners: z.coerce.number({
    required_error: "Number of signers is required.",
    invalid_type_error: "Number of signers must be a number."
  }).min(1, { message: "Number of signers must be at least 1." }),
  // preferredDateTime is removed, will be handled by AppointmentCalendar
  serviceAddressStreet: z.string().min(5, { message: "Please enter a street address." }),
  serviceAddressCity: z.string().min(2, { message: "Please enter a city." }),
  serviceAddressState: z.string().min(2, { message: "Please enter a state." }),
  serviceAddressZip: z.string().min(5, { message: "Please enter a valid ZIP code." }),
  additionalNotes: z.string().optional(),
  promoCode: z.string().optional(), // Added for promo code
  referredBy: z.string().optional(), // Added for referral tracking
  termsAccepted: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions to proceed." }),
  consentSms: z.boolean().optional(),
  consentEmail: z.boolean().optional()
});

type ServiceBookingFormValues = z.infer<typeof serviceBookingSchema>;

const defaultValues: Partial<ServiceBookingFormValues> = {
  fullName: "",
  email: "",
  phone: "",
  serviceType: undefined,
  numberOfSigners: 1,
  // preferredDateTime removed
  serviceAddressStreet: "",
  serviceAddressCity: "",
  serviceAddressState: "",
  serviceAddressZip: "",
  additionalNotes: "",
  promoCode: "", // Added for promo code
  referredBy: "", // Added for referral tracking
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

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data.services || []); // Assuming API returns { services: [...] }
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

  const watchedServiceType = useWatch({ control: form.control, name: "serviceType" });
  const watchedNumberOfSigners = useWatch({ control: form.control, name: "numberOfSigners" });

  const handleTimeSelected = (startTime: string, endTime: string, formattedTime: string, calendarId: string) => {
    setSelectedSlot({ startTime, endTime, formattedTime, calendarId });
    // Optionally, you could set a hidden form field here if you wanted to include it in form.handleSubmit
    // For now, we'll use the state variable `selectedSlot` directly in `onSubmit`
    setSubmitStatus(null); // Clear previous submission status when a new time is selected
  };

  async function onSubmit(data: ServiceBookingFormValues) {
    if (!selectedSlot) {
      setSubmitStatus({ success: false, message: "Please select an available time slot from the calendar." });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Map form data to the BookingRequestBody structure
    const payload = {
      serviceId: data.serviceType, // serviceType from form now holds the serviceId (UUID)
      scheduledDateTime: selectedSlot.startTime, // ISO string
      firstName: firstName, // For guest bookings
      lastName: lastName,   // For guest bookings
      email: data.email,    // Always required
      phone: data.phone,
      // Location details - assuming CLIENT_SPECIFIED_ADDRESS for now
      // The API defaults to REMOTE_ONLINE_NOTARIZATION if not provided
      // You might want a form field for locationType if it varies
      locationType: 'CLIENT_SPECIFIED_ADDRESS', 
      addressStreet: data.serviceAddressStreet,
      addressCity: data.serviceAddressCity,
      addressState: data.serviceAddressState,
      addressZip: data.serviceAddressZip,
      // locationNotes: // Optional, if you have a field for it
      notes: data.additionalNotes, // Maps to cf_booking_special_instructions
      promoCode: data.promoCode,
      referredBy: data.referredBy,
      booking_number_of_signers: data.numberOfSigners,
      consent_terms_conditions: data.termsAccepted,
      smsNotifications: data.consentSms,
      emailUpdates: data.consentEmail,
    };

    console.log("Submitting to /api/bookings with payload:", payload);

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
      // API returns { booking: {...}, checkoutUrl: "..." or null }
      if (result.booking && result.booking.id) {
        if (result.checkoutUrl) {
          // Redirect to Stripe for payment
          window.location.href = result.checkoutUrl;
          // No need to set submit status here as page will redirect
        } else {
          // Booking confirmed without payment (e.g., free service or fully discounted)
          // Redirect to a success page directly
          // You might want to pass booking ID or some details to the success page via query params
          window.location.href = `/booking-confirmed?bookingId=${result.booking.id}`;
        }
      } else {
        // Handle cases where booking ID might be missing or other errors not caught by !response.ok
        setSubmitStatus({ success: false, message: result.error || result.message || "Booking creation failed. Please check details and try again." });
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitStatus({ success: false, message: error.message || "An unexpected error occurred. Please try again." });
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
          name="serviceType"
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
                      {service.name} {/* Display service name from API */}
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

        {watchedServiceType && (watchedServiceType !== 'other') && watchedNumberOfSigners && watchedNumberOfSigners > 0 && (
          <div className="my-6 p-4 border rounded-md bg-slate-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Select Appointment Time</h3>
            <AppointmentCalendar
              serviceType={watchedServiceType as AppointmentServiceType} // Cast to ensure type compatibility
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
                <Input placeholder="Enter promo code" {...field} />
              </FormControl>
              <FormDescription>
                e.g., FIRST25 for first-time client discount.
              </FormDescription>
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
              <FormLabel>Additional Notes or Special Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Specific documents to be notarized, gate code for access, any mobility concerns."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  I acknowledge and agree to the <a href="/terms#fees-and-payment" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Deposit & Cancellation Policy</a> and <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Service</a>.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentSms"
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
                  I consent to receive SMS (text message) notifications related to my booking.
                </FormLabel>
                <FormDescription>
                  Standard message and data rates may apply.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentEmail"
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
                  I consent to receive email updates and confirmations related to my booking.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {submitStatus && (
          <div className={`p-4 rounded-md text-sm ${submitStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitStatus.message}
          </div>
        )}

        <p className="text-xs text-gray-600 mt-1">
          Please note that a deposit may be required to secure your booking, as detailed in our Deposit Policy.
        </p>

        <Button 
          type="submit" 
          className="w-full mt-2"
          disabled={isLoading || (watchedServiceType !== 'other' && !selectedSlot)} // Disable if calendar is active but no slot selected
        >
          {isLoading ? 'Booking Appointment...' : 'Book Appointment Now'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Please select your desired service and an available time slot. Your appointment will be confirmed upon submission. For services marked 'Other', please describe your needs in the notes; we will contact you.
        </p>
      </form>
    </Form>
  );
}
