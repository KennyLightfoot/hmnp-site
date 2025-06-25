"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { Suspense } from 'react'
import BookingForm from '@/components/booking/BookingForm'
import EnhancedBookingWizard from '@/components/booking/EnhancedBookingWizard'
import { Skeleton } from '@/components/ui/skeleton'

// Conditional LaunchDarkly import - graceful degradation
let useFlags: any

// Only try LaunchDarkly in client environment
if (typeof window !== 'undefined') {
  try {
    const launchDarkly = require('launchdarkly-react-client-sdk')
    useFlags = launchDarkly.useFlags
  } catch {
    // NEW: Phase 2-A - Enable enhanced booking flow by default for testing
    useFlags = () => ({ useEnhancedBookingFlow: true })
  }
} else {
  // Server-side fallback
  useFlags = () => ({ useEnhancedBookingFlow: true })
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  serviceType: string;
  duration: number;
  requiresDeposit: boolean;
  depositAmount: number;
  active: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
}

interface BookingFormData {
  serviceId: string;
  scheduledDateTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locationType: 'CLIENT_SPECIFIED_ADDRESS' | 'PUBLIC_PLACE';
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  locationNotes: string;
  notes: string;
  promoCode: string;
}

export default function BookingPage() {
  const { useEnhancedBookingFlow } = useFlags()
  
  // Enhanced booking submission handler
  const handleEnhancedBookingSubmit = async (bookingData: any) => {
    try {
      // Use RON-specific endpoint if it's a RON booking
      const endpoint = bookingData.isRONService 
        ? '/api/bookings/enhanced-ron'
        : '/api/bookings/enhanced';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Booking submission failed');
      }

      const result = await response.json();
      console.log('Enhanced booking submitted:', result);
      
      // Redirect to confirmation page
      if (result.success) {
        window.location.href = `/booking-confirmation?id=${result.booking.id}`;
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      throw error;
    }
  };
  
  // Simple booking form submission handler  
  const handleSimpleBookingSubmit = (data: any) => {
    // Handle simple booking form submission
    console.log('Simple booking submitted:', data);
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#002147]">Book Your Notary Service</h1>
        <p className="text-gray-600 mt-2">
          Professional mobile and remote notary services in Houston, Texas
        </p>
      </div>
      
      <Suspense fallback={<BookingFormSkeleton />}>
        {useEnhancedBookingFlow ? (
          <EnhancedBookingWizard onBookingSubmit={handleEnhancedBookingSubmit} />
        ) : (
          <BookingForm onSubmit={handleSimpleBookingSubmit} />
        )}
      </Suspense>
    </div>
  )
}

function BookingFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
