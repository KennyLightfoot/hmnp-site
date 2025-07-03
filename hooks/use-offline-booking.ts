/**
 * useOfflineBooking Hook
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Provides offline booking functionality for forms
 */

'use client';

import { useState } from 'react';
import { usePWA } from '@/components/pwa/pwa-provider';
import { OfflineBookingData } from '@/lib/pwa/pwa-manager';

interface BookingFormData {
  serviceType: string;
  scheduledDateTime: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  pricing: {
    basePrice: number;
    finalPrice: number;
    adjustments?: any;
  };
  notes?: string;
}

export function useOfflineBooking() {
  const { isOnline, storeOfflineBooking } = usePWA();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState<'success' | 'error' | 'offline' | null>(null);

  const submitBooking = async (bookingData: BookingFormData): Promise<{
    success: boolean;
    isOffline: boolean;
    bookingId?: string;
    error?: string;
  }> => {
    setIsSubmitting(true);
    setLastSubmissionStatus(null);

    try {
      if (isOnline) {
        // Try online submission first
        const response = await fetch('/api/booking/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        if (response.ok) {
          const result = await response.json();
          setLastSubmissionStatus('success');
          return {
            success: true,
            isOffline: false,
            bookingId: result.booking?.id
          };
        } else {
          throw new Error('Server error');
        }
      } else {
        throw new Error('Offline mode');
      }
    } catch (error) {
      // If online submission fails or we're offline, store locally
      try {
        const offlineBookingData: Omit<OfflineBookingData, 'id' | 'status' | 'createdAt'> = {
          serviceType: bookingData.serviceType,
          scheduledDateTime: bookingData.scheduledDateTime,
          customerInfo: bookingData.customerInfo,
          location: bookingData.location,
          pricing: bookingData.pricing,
          lastSyncAttempt: undefined
        };

        const offlineBookingId = await storeOfflineBooking(offlineBookingData);
        setLastSubmissionStatus('offline');
        
        return {
          success: true,
          isOffline: true,
          bookingId: offlineBookingId
        };
      } catch (offlineError) {
        setLastSubmissionStatus('error');
        return {
          success: false,
          isOffline: false,
          error: offlineError instanceof Error ? offlineError.message : 'Failed to store booking'
        };
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (lastSubmissionStatus) {
      case 'success':
        return {
          type: 'success' as const,
          message: 'Booking submitted successfully!'
        };
      case 'offline':
        return {
          type: 'warning' as const,
          message: 'Booking saved offline and will sync when you reconnect.'
        };
      case 'error':
        return {
          type: 'error' as const,
          message: 'Failed to submit booking. Please try again.'
        };
      default:
        return null;
    }
  };

  const resetStatus = () => {
    setLastSubmissionStatus(null);
  };

  return {
    submitBooking,
    isSubmitting,
    lastSubmissionStatus,
    getStatusMessage,
    resetStatus,
    isOnline
  };
}