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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from 'react';

// Corresponds to GHL custom field cf_consent_newsletter
const newsletterSignupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  firstName: z.string().optional(), // Optional, for personalized greetings
  consentNewsletter: z.boolean().refine(val => val === true, { message: "You must consent to receive newsletters." }) // cf_consent_newsletter
});

type NewsletterSignupFormValues = z.infer<typeof newsletterSignupSchema>;

const defaultValues: Partial<NewsletterSignupFormValues> = {
  email: "",
  firstName: "",
  consentNewsletter: false,
};

export function NewsletterSignupForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const form = useForm<NewsletterSignupFormValues>({
    resolver: zodResolver(newsletterSignupSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: NewsletterSignupFormValues) {
    setIsLoading(true);
    setSubmitStatus(null);
    console.log("Newsletter Signup Form Data:", data);

    // Placeholder for API submission to /api/newsletter/subscribe
    // The backend would handle adding the contact to the GHL newsletter list
    // and update/set the cf_consent_newsletter field.
    try {
      const response = await fetch('/api/newsletter/subscribe', {
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

      setSubmitStatus({ success: true, message: "Thank you for subscribing! You're now on our newsletter list." });
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setSubmitStatus({ success: false, message: errorMessage });
      console.error("Newsletter signup error:", error);
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 md:p-8 border rounded-lg shadow-md bg-white max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-center text-gray-800">Subscribe to Our Newsletter</h3>
        <p className="text-sm text-gray-600 text-center mb-4">Stay updated with our latest news, offers, and notary tips.</p>
        
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
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Alex" {...field} />
              </FormControl>
              <FormDescription>
                Help us personalize your experience.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentNewsletter"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="consentNewsletter"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="consentNewsletter" className="text-sm font-normal">
                  I consent to receive email newsletters from Houston Mobile Notary Pros and understand I can unsubscribe at any time.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {submitStatus && (
          <div className={`p-3 rounded-md text-sm ${submitStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submitStatus.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Subscribing...' : 'Subscribe Now'}
        </Button>
      </form>
    </Form>
  );
}
