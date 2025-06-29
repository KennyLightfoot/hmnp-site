"use client";

import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormMessage, FormControl, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, Info } from 'lucide-react';
import type { UnifiedBookingFormData } from './types';

interface ContactInfoProps {
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
}

export function ContactInfo({ isAuthenticated = false, userEmail, userName }: ContactInfoProps) {
  const { control, setValue } = useFormContext<UnifiedBookingFormData>();
  
  // Watch values for validation feedback
  const customerName = useWatch({ control, name: 'customerName' });
  const customerEmail = useWatch({ control, name: 'customerEmail' });
  const customerPhone = useWatch({ control, name: 'customerPhone' });

  // Pre-fill authenticated user data
  if (isAuthenticated && userEmail && !customerEmail) {
    setValue('customerEmail', userEmail);
  }
  if (isAuthenticated && userName && !customerName) {
    setValue('customerName', userName);
  }

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setValue('customerPhone', formatted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Contact Information
        </h3>
        <p className="text-gray-600 text-sm">
          We'll use this information to confirm your appointment and send updates.
        </p>
      </div>

      {isAuthenticated && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            We've pre-filled your information. You can update it if needed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {/* Customer Name */}
        <FormField
          control={control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>
              <FormDescription>
                This name will appear on all notarized documents.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Email */}
        <FormField
          control={control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="your.email@example.com"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                  disabled={isAuthenticated && !!userEmail}
                />
              </FormControl>
              <FormDescription>
                We'll send appointment confirmations and reminders here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Phone */}
        <FormField
          control={control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                We'll call or text with appointment updates and arrival notifications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact Preferences */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Communication Preferences</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Appointment confirmation via email</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Reminder notifications 24 hours before</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Notary arrival notification</span>
          </div>
        </div>
      </div>

      {/* Data Privacy Notice */}
      <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
        <strong>Privacy Notice:</strong> Your contact information is used solely for appointment 
        coordination and will not be shared with third parties. We follow strict data protection 
        practices to keep your information secure.
      </div>
    </div>
  );
}