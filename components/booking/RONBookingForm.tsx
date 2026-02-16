'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';

// Validation schema for RON session creation form
const createRONSessionSchema = z.object({
  customerName: z.string().min(1, 'Full name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required').max(15),
  documentType: z.enum(['GENERAL', 'LOAN_SIGNING', 'POWER_OF_ATTORNEY', 'REAL_ESTATE', 'OTHER']),
  notes: z.string().optional(),
});

type RONBookingFormValues = z.infer<typeof createRONSessionSchema>;

export default function RONBookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create the form
  const form = useForm<RONBookingFormValues>({
    resolver: zodResolver(createRONSessionSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      documentType: 'GENERAL',
      notes: '',
    },
  });

  // Form submission handler - creates a Stripe checkout session
  const onSubmit = async (data: RONBookingFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Create a checkout session for RON service
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'RON_SERVICES',
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          documentType: data.documentType,
          notes: data.notes,
          // The actual BlueNotary session will be created after payment confirmation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const checkout = await response.json();
      
      // 2. Redirect to Stripe checkout
      if (checkout.url) {
        // Set a brief success message before redirecting
        setSuccessMessage('Redirecting to secure payment...');
        setTimeout(() => {
          window.location.href = checkout.url;
        }, 1000);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating RON checkout session:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-[#002147]/10">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#002147] mb-2">Remote Online Notarization</h2>
          <p className="text-gray-600 text-sm">
            Complete this form to create a secure RON session. You'll be directed to payment, after which your session will be created.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-100">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter name exactly as it appears on ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Email */}
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Session invite will be sent to this email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Phone */}
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used for text notifications and verification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Type */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GENERAL">General Document</SelectItem>
                      <SelectItem value="LOAN_SIGNING">Loan Signing</SelectItem>
                      <SelectItem value="POWER_OF_ATTORNEY">Power of Attorney</SelectItem>
                      <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the primary document type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes (Optional) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Special instructions or details about your document"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#A52A2A] hover:bg-[#8B0000]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              After payment, you'll receive a secure link to your RON session.
              No BlueNotary session is created until payment is confirmed.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}