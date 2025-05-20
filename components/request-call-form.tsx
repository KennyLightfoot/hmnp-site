"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';

// Matches cf_preferred_call_time, cf_call_request_reason from GHL_SETUP_GUIDE.md
const requestCallSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')), // Optional if phone is primary
  preferredCallTime: z.string({ required_error: "Please select a preferred call time." }), // cf_preferred_call_time
  callRequestReason: z.string().min(5, { message: "Please briefly state the reason for your call (min 5 characters)." }), // cf_call_request_reason
});

type RequestCallFormValues = z.infer<typeof requestCallSchema>;

const defaultValues: Partial<RequestCallFormValues> = {
  fullName: "",
  phone: "",
  email: "",
  preferredCallTime: undefined,
  callRequestReason: "",
};

const preferredTimeOptions = [
  { id: "9am_11am", label: "Morning (9 AM - 11 AM)" },
  { id: "11am_1pm", label: "Late Morning (11 AM - 1 PM)" },
  { id: "1pm_3pm", label: "Afternoon (1 PM - 3 PM)" },
  { id: "3pm_5pm", label: "Late Afternoon (3 PM - 5 PM)" },
  { id: "5pm_7pm", label: "Evening (5 PM - 7 PM)" },
  { id: "after_7pm", label: "Later Evening (After 7 PM)" },
  { id: "anytime_flexible", label: "Anytime (Flexible)" },
];

export function RequestCallForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const form = useForm<RequestCallFormValues>({
    resolver: zodResolver(requestCallSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: RequestCallFormValues) {
    setIsLoading(true);
    setSubmitStatus(null);
    console.log("Request a Call Form Data:", data);

    // Placeholder for API submission to /api/callbacks/request-call
    try {
      const response = await fetch('/api/callbacks/request-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      setSubmitStatus({ success: true, message: "Your call request has been submitted! We will contact you as soon as possible." });
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setSubmitStatus({ success: false, message: errorMessage });
      console.error("Request a call submission error:", error);
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 md:p-8 lg:p-10 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Request a Callback</h2>
        
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormDescription>We'll use this number to call you back.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>In case we need to reach you by email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredCallTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Call Time</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preferred time slot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {preferredTimeOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
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
          name="callRequestReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Call</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Question about loan signing, Need a quote for multiple documents, Follow up on a previous service."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitStatus && (
          <div className={`p-4 rounded-md text-sm ${submitStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitStatus.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting Request...' : 'Request Callback'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          We aim to respond to callback requests within one business day.
        </p>
      </form>
    </Form>
  );
}
