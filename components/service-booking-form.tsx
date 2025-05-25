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
import type { ServiceType as AppointmentServiceType } from "@/components/appointment-calendar"; // Import ServiceType for casting

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
  termsAccepted: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions to proceed." })
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
};

// Updated service types to align with new branding and expected keys for AppointmentCalendar
const HMNPServices: { id: AppointmentServiceType | 'other'; label: string }[] = [
  { id: "standard-notary" as AppointmentServiceType, label: "Standard Notary" }, 
  { id: "extended-hours-notary" as AppointmentServiceType, label: "Extended Hours Notary" },
  { id: "loan-signing-specialist" as AppointmentServiceType, label: "Loan Signing Specialist" },
  { id: "specialty-notary-service" as AppointmentServiceType, label: "Specialty Notary Service" },
  // Business Solutions and individual Support Services are likely handled via different forms/flows
  // and are not included here as direct calendar-bookable service types in this specific form.
  // The 'other' option can be kept if there's a manual process for unlisted requests.
  // { id: "other", label: "Other Inquiry (Please describe in notes)" }
];

export function ServiceBookingForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // State for selected time slot from AppointmentCalendar
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
    formattedTime: string;
    calendarId: string;
  } | null>(null);

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

    const [firstName, ...lastNameParts] = data.fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    const payload = {
      calendarId: selectedSlot.calendarId,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      firstName: firstName || '',
      lastName: lastName || data.fullName, // Fallback if no space in fullName
      email: data.email,
      phone: data.phone,
      address: `${data.serviceAddressStreet}, ${data.serviceAddressCity}, ${data.serviceAddressState} ${data.serviceAddressZip}`,
      city: data.serviceAddressCity,
      state: data.serviceAddressState,
      postalCode: data.serviceAddressZip,
      numberOfSigners: data.numberOfSigners || 1,
      signingLocation: "Client's Address", // Default or could be another form field
      specialInstructions: data.additionalNotes || "",
      smsNotifications: true, // Default or could be a checkbox
      emailUpdates: true,     // Default or could be a checkbox
      serviceType: data.serviceType, // To be used for appointment title/notes in API
      // locationId can be omitted, API will use default or logic based on calendarId
    };

    console.log("Submitting to /api/calendar/create-appointment with payload:", payload);

    try {
      const response = await fetch('/api/calendar/create-appointment', {
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
      if (result.success) {
        setSubmitStatus({ success: true, message: `Appointment for ${selectedSlot.formattedTime} booked successfully! Booking Ref: ${result.data?.bookingReference}` });
        form.reset();
        setSelectedSlot(null); // Reset selected slot
      } else {
        setSubmitStatus({ success: false, message: result.message || "Booking failed. Please try again." });
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
                  {HMNPServices.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.label}
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
                  I acknowledge and agree to the <a href="/deposit-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Deposit & Cancellation Policy</a> and <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms of Service</a>.
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
