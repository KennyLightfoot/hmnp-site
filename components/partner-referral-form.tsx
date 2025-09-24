"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from '@/lib/utils/error-utils';
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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from 'react';

// Define the Zod schema for form validation
// Aligns with cf_referred_by_partner_id, cf_partner_referral_notes, cf_is_partner_referral from GHL_SETUP_GUIDE.md
const partnerReferralSchema = z.object({
  partnerIdentifier: z.string().min(2, { message: "Please enter your Partner ID or registered email." }), // Used to find cf_referred_by_partner_id in backend
  referredFullName: z.string().min(2, { message: "Referred person's full name must be at least 2 characters." }),
  referredEmail: z.string().email({ message: "Please enter a valid email address for the referred person." }),
  referredPhone: z.string().optional(),
  servicesOfInterest: z.string().optional(), // Could be a multi-select in future
  referralNotes: z.string().optional(), // cf_partner_referral_notes
  consentConfirmed: z.boolean().refine(val => val === true, { message: "You must confirm you have consent from the referred person to share their details." })
});

type PartnerReferralFormValues = z.infer<typeof partnerReferralSchema>;

const defaultValues: Partial<PartnerReferralFormValues> = {
  partnerIdentifier: "",
  referredFullName: "",
  referredEmail: "",
  referredPhone: "",
  servicesOfInterest: "",
  referralNotes: "",
  consentConfirmed: false,
};

export function PartnerReferralForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const form = useForm<PartnerReferralFormValues>({
    resolver: zodResolver(partnerReferralSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: PartnerReferralFormValues) {
    setIsLoading(true);
    setSubmitStatus(null);
    console.log("Partner Referral Form Data:", data);

    // Placeholder for API submission
    // In a real application, you would send this data to your backend API endpoint
    // e.g., /api/referrals/submit-partner-referral
    // The backend would then create/update the referred contact in GHL,
    // associate them with the referring partner (using partnerIdentifier to look up the partner),
    // and apply tags like 'LeadSource:PartnerReferral', 'Status:NewPartnerReferral'.
    try {
      const response = await fetch('/api/referrals/submit-partner-referral', {
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

      setSubmitStatus({ success: true, message: "Referral submitted successfully! Thank you for helping us grow." });
      form.reset(); // Reset form fields
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : "An unexpected error occurred. Please try again.";
      setSubmitStatus({ success: false, message: errorMessage });
      console.error("Partner referral submission error:", getErrorMessage(error));
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 md:p-8 lg:p-10 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Submit a New Referral</h2>
        
        <FormField
          control={form.control}
          name="partnerIdentifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Partner ID or Registered Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your unique Partner ID or GHL registered email" {...field} />
              </FormControl>
              <FormDescription>
                This helps us correctly attribute this referral to you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <hr className="my-6" />
        <h3 className="text-xl font-medium text-gray-700">Referred Person's Details</h3>

        <FormField
          control={form.control}
          name="referredFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referred Person's Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referredEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referred Person's Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="jane.smith@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referredPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referred Person's Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 987-6543" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servicesOfInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service(s) of Interest (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Loan Signing, General Notary for a Will"
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Any specific services the referred person mentioned.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referralNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes about the Referral (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Best time to contact them, specific needs discussed."
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
          name="consentConfirmed"
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
                  I confirm I have obtained consent from the referred person to share their contact information with Houston Mobile Notary Pros for the purpose of this referral.
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting Referral...' : 'Submit Referral'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Thank you for your referral! We appreciate your partnership.
        </p>
      </form>
    </Form>
  );
}
