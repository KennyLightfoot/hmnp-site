"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import EnhancedBookingWizard from '@/components/booking/EnhancedBookingWizard';

interface EnhancedBookingData {
  serviceId: string;
  scheduledDateTime: string;
  locationType: 'CLIENT_SPECIFIED_ADDRESS' | 'PUBLIC_PLACE';
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  locationNotes?: string;
  signers: Array<{
    name: string;
    email: string;
    phone?: string;
    role: 'PRIMARY' | 'SECONDARY' | 'WITNESS';
    notificationPreference: 'EMAIL' | 'SMS' | 'BOTH';
    specialInstructions?: string;
  }>;
  notes?: string;
  promoCode?: string;
  urgencyLevel: 'standard' | 'same-day' | 'emergency';
  customInstructions?: string;
  termsAccepted: boolean;
  smsNotifications: boolean;
  emailUpdates: boolean;
}

export default function EnhancedBookingPage() {
  const router = useRouter();

  const handleBookingSubmit = async (bookingData: EnhancedBookingData) => {
    try {
      console.log('Submitting enhanced booking:', bookingData);
      
      const response = await fetch('/api/bookings/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      if (result.success) {
        toast({
          title: "Booking created successfully!",
          description: `Your booking reference is ${result.booking.reference}`,
        });

        // Redirect to confirmation page
        router.push(`/booking-confirmed?bookingId=${result.booking.id}`);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Booking submission error:', error);
      
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Please try again or contact support",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Enhanced Notary Booking
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our new streamlined booking process with support for multiple signers 
            and enhanced service options.
          </p>
        </div>

        {/* Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Multiple Signers</h3>
            <p className="text-gray-600 text-sm">
              Add multiple signers and witnesses with individual notifications and requirements.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
            <p className="text-gray-600 text-sm">
              Upload documents in advance for faster processing and better preparation.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Service Add-ons</h3>
            <p className="text-gray-600 text-sm">
              Customize your service with witnesses, apostille, rush service, and more.
            </p>
          </div>
        </div>

        {/* Enhanced Booking Wizard */}
        <EnhancedBookingWizard
          onBookingSubmit={handleBookingSubmit}
          initialData={{
            addressState: 'TX',
            urgencyLevel: 'standard',
            smsNotifications: true,
            emailUpdates: true,
          }}
        />

        {/* Footer Help */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-800 text-sm mb-4">
              Our enhanced booking system is designed to make complex notarizations simple. 
              If you need assistance or have questions, we're here to help.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/contact" 
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                Contact Support
              </a>
              <a 
                href="tel:+1-555-123-4567" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 