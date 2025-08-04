"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from '@/lib/utils/error-utils';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { useState } from 'react'; // Keep for isSubmittingManual and submitError

const preferredTimeOptions = [
  { id: "9am_11am", label: "Morning (9 AM - 11 AM)" },
  { id: "11am_1pm", label: "Late Morning (11 AM - 1 PM)" },
  { id: "1pm_3pm", label: "Afternoon (1 PM - 3 PM)" },
  { id: "3pm_5pm", label: "Late Afternoon (3 PM - 5 PM)" },
  { id: "5pm_7pm", label: "Evening (5 PM - 7 PM)" },
  { id: "after_7pm", label: "Later Evening (After 7 PM)" },
  { id: "anytime_flexible", label: "Anytime (Flexible)" },
];

const contactFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }).regex(/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, { message: "Invalid phone number format."}),
  subject: z.string().min(1, { message: "Subject is required." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  smsConsent: z.boolean().optional(),
  preferredCallTime: z.string({ required_error: "Please select a preferred call time." }).min(1, {message: "Please select a preferred call time."}),
  callRequestReason: z.string().min(5, { message: "Please briefly state the reason for your call (min 5 characters)." }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const router = useRouter();
  const [isSubmittingManual, setIsSubmittingManual] = useState(false); 
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "General Inquiry", // Default subject
      message: "",
      smsConsent: false,
      preferredCallTime: undefined, // Important for placeholder to show
      callRequestReason: "",
      termsAccepted: false,
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmittingManual(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit form. Please try again.');
      }
      router.push('/contact/thank-you');
    } catch (error) {
      setSubmitError(error instanceof Error ? getErrorMessage(error) : "An unexpected error occurred.");
    } finally {
      setIsSubmittingManual(false);
    }
  }

  return (
    <>
      <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-md text-sm text-sky-800">
        <h2 className="font-semibold text-lg mb-2 text-[#002147]">Houston Mobile Notary Pros</h2>
        <p className="mb-1 italic">Professional Notary Services Day & Evening.</p>
        <p className="mb-1">Use this form for general inquiries, booking questions, or to request a call. We aim to provide calm and clarity for all your notary needs. We typically respond within one business day during service hours.</p>
        <p className="text-xs">Essential Service: 9am-5pm Mon-Fri. Priority Service: 7am-9pm daily.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
            <p><strong>Important:</strong> For all notarial acts, a valid government-issued photo ID (e.g., Driver's License, State ID, Passport) is required for each signer, as per Texas law. Please ensure all signers have their ID ready for the appointment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="General Inquiry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide details about your inquiry or the service you need..."
                    className="resize-y min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The more information you give us, the better we can assist you.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="preferredCallTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Call Time <span className="text-red-500">*</span></FormLabel>
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
                <FormDescription>
                  Please state your general availability.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="callRequestReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Request Reason <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly tell us what you'd like to discuss..."
                    className="resize-y min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                 <FormDescription>
                  So we can prepare for our conversation (e.g., questions about loan signing, specific document type).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="smsConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I consent to receive text messages from Houston Mobile Notary Pros regarding my inquiry, appointment confirmations, and related services.</FormLabel>
                  <FormDescription>
                    Standard message and data rates may apply. You can opt-out at any time.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I have read and agree to the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms and Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a>. <span className="text-red-500">*</span></FormLabel>
                </div>
                <FormMessage /> 
              </FormItem>
            )}
          />

          {submitError && (
            <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{submitError}</p>
          )}

          <Button type="submit" disabled={isSubmittingManual || form.formState.isSubmitting} className="w-full md:w-auto">
            {(isSubmittingManual || form.formState.isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Inquiry
          </Button>
        </form>
      </Form>
      <div className="mt-8 text-center text-xs text-gray-500">
        <p className="font-semibold text-[#002147]">Houston Mobile Notary Pros</p>
        <p className="mb-1 italic">Professional Notary Services Day & Evening.</p>
        <p>Your privacy is important to us. By submitting this form, you acknowledge and agree to our <a href="/privacy-policy" className="underline">Privacy Policy</a> and <a href="/terms-of-service" className="underline">Terms of Service</a>. We use your information solely to respond to your request and provide our services. We do not sell or share your personal information with third parties for marketing purposes.</p>
      </div>
    </>
  );
}
