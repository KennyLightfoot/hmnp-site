"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// It's good practice to use a toast for non-redirect success messages
// Assuming you have sonner or react-toastify setup as seen in ui components
import { toast } from "sonner"; // Or your preferred toast library


// Zod Schema for visible form fields
const leadFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  preferredCallTime: z.string().optional(),
  callRequestReason: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  smsConsent: z.boolean().optional(),
  // Hidden fields will be registered dynamically and included in form.getValues()
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  apiEndpoint: string; // New: API endpoint to submit to
  tags?: string[];
  customFields?: Record<string, string>; // For ad-specific fields not in schema, passed directly
  successRedirectUrl?: string;
  onSuccess?: (data: any) => void; // Data from API response
  onError?: (error: Error) => void;
  submitButtonText?: string;
  formTitle?: string;
  formDescription?: string;
  privacyPolicyLink?: string;
  termsOfServiceLink?: string;
  // UTMs will be automatically collected and sent.
  // Add any other props you might need, like campaign name for internal logic
  campaignName?: string; 
}

export default function LeadForm({
  apiEndpoint,
  tags = [],
  customFields = {},
  successRedirectUrl,
  onSuccess,
  onError,
  submitButtonText = "Submit",
  formTitle,
  formDescription,
  privacyPolicyLink,
  termsOfServiceLink,
  campaignName,
}: LeadFormProps) {
  const router = useRouter();
  // Separate state for global submission error, RHF handles field errors
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
      preferredCallTime: "",
      callRequestReason: "",
      termsAccepted: false,
      smsConsent: false,
    },
  });

  // Hidden fields for UTMs, ad_platform etc. are prepared in processSubmit
  // No need to register them with react-hook-form if they are not part of the Zod schema
  // and are collected just before sending.

  async function processSubmit(data: LeadFormValues) {
    setSubmissionError(null);
    
    const queryParams = new URLSearchParams(window.location.search);
    const utmData: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(param => {
      if (queryParams.has(param)) {
        utmData[param] = queryParams.get(param)!;
      }
    });

    // Consolidate all data to be sent
    const payload = {
      ...data, // Data from react-hook-form (visible fields)
      tags,    // Tags from props
      customFieldsFromProps: customFields, // Explicitly named to avoid conflict if 'customFields' is a form field
      utmData, // UTMs collected from URL
      landingPageUrl: window.location.href, // Current landing page URL
      campaignName, // Pass campaign name if provided
    };

    try {
      const response = await fetch(apiEndpoint, { // Use new apiEndpoint prop
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Send as JSON
      });

      const result = await response.json(); // Expect JSON response

      if (!response.ok) {
        throw new Error(result.message || "An error occurred during submission.");
      }

      if (onSuccess) {
        onSuccess(result); // Pass API response data to callback
      }

      if (successRedirectUrl) {
        router.push(successRedirectUrl);
      } else if (!onSuccess) {
        toast.success(result.message || "Form submitted successfully!");
        form.reset();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setSubmissionError(errorMessage);
      if (onError) {
        onError(new Error(errorMessage));
      } else {
        toast.error(errorMessage);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-6 p-4 md:p-6 border rounded-lg shadow-md">
        {formTitle && <h2 className="text-2xl font-semibold text-center mb-4">{formTitle}</h2>}
        {formDescription && <p className="text-muted-foreground text-center mb-6">{formDescription}</p>}

        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-md text-sm text-sky-800">
          {!formTitle && <h2 className="font-semibold text-lg mb-2 text-[#002147]">Houston Mobile Notary Pros</h2>}
          <p className="mb-1 italic">Professional Notary Services Day & Evening.</p>
          {!formDescription && (
            <>
              <p className="mb-1">Please fill out the form below for your specific needs. We're here to provide calm and clarity for your notary requirements.</p>
              <p className="mb-1">We aim to respond promptly during our service hours.</p>
            </>
          )}
          <p className="text-xs">Essential Service: 9am-5pm Mon-Fri. Priority Service: 7am-9pm daily.</p>
        </div>
        <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
          <p><strong>Important:</strong> For all notarial acts, a valid government-issued photo ID (e.g., Driver's License, State ID, Passport) is required for each signer, as per Texas law. Please ensure all signers have their ID ready for the appointment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your email address" {...field} />
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
                  <Input type="tel" placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Please provide details about your inquiry or the service you need (e.g., document type, number of signers, desired signing location). The more information you provide, the better we can assist you." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Call Time */}
        <FormField
          control={form.control}
          name="preferredCallTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Call Time</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekdays 2-4 PM, Evenings after 6 PM. Please specify your general availability." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Call Request Reason */}
        <FormField
          control={form.control}
          name="callRequestReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Call Request Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="Briefly tell us what you'd like to discuss so we can prepare for our conversation (e.g., questions about loan signing, specific document type)." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms and Conditions Accepted */}
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="termsAccepted"
                />
              </FormControl>
              <FormLabel htmlFor="termsAccepted" className="text-sm font-normal !mt-0">
                I have read and agree to the <a href={termsOfServiceLink || "/terms"} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-blue-700">Terms and Conditions</a> and <a href={privacyPolicyLink || "/privacy-policy"} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-blue-700">Privacy Policy</a>. <span className="text-red-500">*</span>
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="smsConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
               <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  id="smsConsent"
                />
              </FormControl>
              <FormLabel htmlFor="smsConsent" className="text-sm font-normal !mt-0"> 
                I consent to receive text messages from Houston Mobile Notary Pros regarding my inquiry, appointment confirmations, and related services. Standard message and data rates may apply. You can opt-out at any time.
              </FormLabel>
            </FormItem>
          )}
        />

        {submissionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{submissionError}</span>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting} 
          className="w-full bg-[#002147] hover:bg-[#001a38] text-white text-lg py-3"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            submitButtonText
          )}
        </Button>

      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm font-semibold text-[#002147] mb-1">Houston Mobile Notary Pros</p>
        <p className="text-xs text-gray-600 mb-2 italic">Professional Notary Services Day & Evening.</p>
        <p className="text-xs text-gray-500">
          Your privacy is important to us. By submitting this form, you acknowledge and agree to our
          <a href={privacyPolicyLink || "/privacy-policy"} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700"> Privacy Policy</a> and
          <a href={termsOfServiceLink || "/terms"} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700"> Terms of Service</a>.
          We use your information solely to respond to your request and provide our services. We do not sell or share your personal information with third parties for marketing purposes.
        </p>
      </div>
    </form>
    </Form>
  );
} 