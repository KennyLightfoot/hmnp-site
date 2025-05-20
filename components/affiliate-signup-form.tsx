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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from 'react';

// Define the Zod schema for form validation
// Matches cf_affiliate_business_name, cf_affiliate_website_url, cf_affiliate_promotion_plan, cf_affiliate_payout_preference_notes, cf_affiliate_terms_accepted from GHL_SETUP_GUIDE.md
const affiliateSignupFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(), // Assuming phone is optional
  businessName: z.string().optional(), // cf_affiliate_business_name
  websiteUrl: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." }).optional().or(z.literal('')), // cf_affiliate_website_url
  promotionPlan: z.string().min(10, { message: "Please briefly describe your promotion plan (min 10 characters)." }), // cf_affiliate_promotion_plan
  payoutPreferenceNotes: z.string().optional(), // cf_affiliate_payout_preference_notes
  termsAccepted: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions to proceed." }) // cf_affiliate_terms_accepted
});

type AffiliateSignupFormValues = z.infer<typeof affiliateSignupFormSchema>;

const defaultValues: Partial<AffiliateSignupFormValues> = {
  fullName: "",
  email: "",
  phone: "",
  businessName: "",
  websiteUrl: "",
  promotionPlan: "",
  payoutPreferenceNotes: "",
  termsAccepted: false,
};

export function AffiliateSignupForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const form = useForm<AffiliateSignupFormValues>({
    resolver: zodResolver(affiliateSignupFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: AffiliateSignupFormValues) {
    setIsLoading(true);
    setSubmitStatus(null);
    console.log("Affiliate Signup Form Data:", data);

    // Placeholder for API submission
    // In a real application, you would send this data to your backend API endpoint
    // e.g., /api/affiliates/signup which then interacts with GoHighLevel
    try {
      const response = await fetch('/api/affiliates/signup', {
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

      // Assuming a successful response means the application was submitted
      setSubmitStatus({ success: true, message: "Thank you for your application! We will review it and get back to you soon." });
      form.reset(); // Reset form fields
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setSubmitStatus({ success: false, message: errorMessage });
      console.error("Affiliate signup submission error:", error);
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 md:p-8 lg:p-10 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Join Our Affiliate Program</h2>
        
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

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your Company Inc." {...field} />
              </FormControl>
              <FormDescription>
                If you represent a business, please enter its name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://yourwebsite.com" {...field} />
              </FormControl>
              <FormDescription>
                Your blog, business website, or primary platform for promotion.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promotionPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How do you plan to promote us?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your audience and how you plan to share Houston Mobile Notary Pros (e.g., blog posts, social media, email list, etc.)"
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
          name="payoutPreferenceNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payout Preference Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PayPal email: your_paypal@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Let us know your preferred method for receiving payouts (e.g., PayPal email). Specific account details will be collected securely upon approval.
              </FormDescription>
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
                  I have read and agree to the <a href="/affiliate-terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Affiliate Program Terms & Conditions</a>.
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
          {isLoading ? 'Submitting Application...' : 'Apply to Affiliate Program'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Your information will be handled in accordance with our privacy policy.
          Applications are typically reviewed within 3-5 business days.
        </p>
      </form>
    </Form>
  );
}
