/**
 * Optimized Booking Hook
 * 
 * Provides optimized data fetching and state management for booking-related
 * operations with race condition prevention and caching.
 */

import { useMemo } from 'react';
import { useAsyncState, useAsyncStateGroup } from './useAsyncState';
import type { Service } from '@/components/booking/forms/types';

/**
 * Transform legacy booking data format to V2 API format
 */
function transformToV2Format(legacyData: any) {
  return {
    // Service selection
    serviceId: legacyData.serviceId,
    
    // Customer information (V2 format)
    customerEmail: legacyData.email || legacyData.customerEmail,
    customerName: legacyData.customerName || 
                  (legacyData.firstName && legacyData.lastName 
                    ? `${legacyData.firstName} ${legacyData.lastName}`.trim()
                    : legacyData.name || ''),
    customerPhone: legacyData.phone || legacyData.customerPhone,
    
    // Scheduling
    scheduledDateTime: legacyData.scheduledDateTime || legacyData.appointmentDateTime,
    
    // Location (V2 nested address format)
    locationType: legacyData.locationType || 'CLIENT_SPECIFIED_ADDRESS',
    address: legacyData.addressStreet ? {
      street: legacyData.addressStreet,
      city: legacyData.addressCity || '',
      state: legacyData.addressState || 'TX',
      zip: legacyData.addressZip || ''
    } : legacyData.address,
    locationNotes: legacyData.locationNotes || legacyData.notes,
    
    // Optional enhancements
    promoCode: legacyData.promoCode,
    specialInstructions: legacyData.specialInstructions || legacyData.notes,
    
    // Consent (required for V2)
    termsAccepted: legacyData.termsAccepted !== false,
    smsNotifications: legacyData.smsNotifications || false,
    emailUpdates: legacyData.emailUpdates !== false,
    
    // Legacy compatibility metadata
    _legacyData: {
      ...legacyData,
      migrationSource: 'useOptimizedBooking-hook'
    }
  };
}

interface BookingService {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  requiresDeposit: boolean;
  depositAmount?: number;
  isActive: boolean;
}

interface BusinessHours {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface BookingSettings {
  businessHours: BusinessHours;
  minimumLeadTimeHours: number;
  bufferTimeMinutes: number;
  blackoutDates: string[];
  timezone: string;
}

/**
 * Hook for optimized service loading
 */
export function useOptimizedServices() {
  return useAsyncState<BookingService[]>(
    async () => {
      console.log('🔄 useOptimizedServices: Fetching from V2 API...');
      const response = await fetch('/api/v2/services', {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300', // 5-minute cache
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ useOptimizedServices: V2 services received');
      
      // Transform V2 response to expected format
      return data.data?.services || [];
    },
    {
      immediate: true,
      keepPreviousData: true,
      retry: { attempts: 3, delay: 1000 },
    }
  );
}

/**
 * Hook for optimized booking settings loading
 */
export function useOptimizedBookingSettings() {
  return useAsyncState<BookingSettings>(
    async () => {
      const response = await fetch('/api/booking-settings', {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=600', // 10-minute cache
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch booking settings: ${response.statusText}`);
      }
      
      return response.json();
    },
    {
      immediate: true,
      keepPreviousData: true,
      retry: { attempts: 3, delay: 1000 },
    }
  );
}

/**
 * Hook for optimized availability checking with service validation
 */
export function useOptimizedAvailability(serviceId: string, date: string) {
  return useAsyncState(
    async () => {
      // Enhanced validation
      if (!serviceId || serviceId.trim() === '') {
        throw new Error('Service ID is required. Please select a service to view availability.');
      }
      
      if (!date || date.trim() === '') {
        throw new Error('Date is required. Please select a date to view availability.');
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
      }

      // Validate service ID format (basic check)
      if (serviceId.length < 10) {
        throw new Error('Invalid service ID format. Please select a valid service.');
      }

      const url = new URL('/api/availability', window.location.origin);
      url.searchParams.set('serviceId', serviceId.trim());
      url.searchParams.set('date', date.trim());

      console.log('[useOptimizedAvailability] Fetching availability:', { serviceId: serviceId.trim(), date: date.trim() });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=60', // 1-minute cache for availability
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('Service not found. Please select a different service.');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid request parameters. Please check your service and date selection.');
        } else {
          throw new Error(errorData.error || `Failed to load availability: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('[useOptimizedAvailability] Availability loaded:', data.availableSlots?.length || 0, 'slots');
      
      return data;
    },
    {
      immediate: Boolean(serviceId && serviceId.trim() && date && date.trim()),
      deps: [serviceId, date],
      keepPreviousData: false, // Availability should always be fresh
      retry: { attempts: 2, delay: 1000 },
    }
  );
}

/**
 * Hook for optimized booking submission
 */
export function useOptimizedBookingSubmission() {
  return useAsyncState(
    async (bookingData: any) => {
      console.log('🔄 useOptimizedBookingSubmission: Creating booking via V2 API...');
      
      // Transform legacy booking data to V2 format if needed
      const v2BookingData = transformToV2Format(bookingData);
      
      const response = await fetch('/api/v2/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(v2BookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Booking failed: ${response.statusText}`);
      }

      return response.json();
    },
    {
      immediate: false, // Only execute when called
      retry: { attempts: 1, delay: 1000 },
    }
  );
}

/**
 * Combined hook for booking form data
 */
export function useBookingFormData() {
  const servicesState = useOptimizedServices();
  const settingsState = useOptimizedBookingSettings();

  // Derived state
  const isReady = !servicesState.loading && !settingsState.loading && 
                  servicesState.data && settingsState.data;
  const hasError = servicesState.error || settingsState.error;
  const loading = servicesState.loading || settingsState.loading;

  // Refetch all data
  const refetchAll = () => {
    servicesState.refetch();
    settingsState.refetch();
  };

  return {
    services: servicesState.data || [],
    settings: settingsState.data,
    loading,
    error: hasError,
    isReady,
    refetchAll,
    servicesState,
    settingsState,
  };
}

/**
 * Hook for user bookings list with optimizations
 */
export function useOptimizedUserBookings(userId?: string, page = 1, limit = 10) {
  return useAsyncState(
    async () => {
      const url = new URL('/api/v2/bookings', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', limit.toString());
      
      if (userId) {
        url.searchParams.set('userId', userId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=30', // 30-second cache
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }

      return response.json();
    },
    {
      immediate: true,
      deps: [userId, page, limit],
      keepPreviousData: true,
      retry: { attempts: 2, delay: 1000 },
    }
  );
}

/**
 * Hook for real-time booking status updates
 */
export function useBookingStatusUpdates(bookingId: string) {
  return useAsyncState(
    async () => {
      if (!bookingId) return null;

      const response = await fetch(`/api/v2/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache', // Always fresh for status updates
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booking status: ${response.statusText}`);
      }

      return response.json();
    },
    {
      immediate: Boolean(bookingId),
      deps: [bookingId],
      keepPreviousData: false,
      retry: { attempts: 3, delay: 2000 },
    }
  );
}

/**
 * Hook for optimized promo code validation
 */
export function usePromoCodeValidation() {
  return useAsyncState(
    async ({ code, serviceId, amount }: { code: string; serviceId: string; amount: number }) => {
      if (!code || !serviceId) {
        throw new Error('Promo code and service ID are required');
      }

      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ code, serviceId, amount }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid promo code');
      }

      return response.json();
    },
    {
      immediate: false,
      retry: { attempts: 1, delay: 500 },
    }
  );
}

/**
 * Performance monitoring hook for booking operations
 */
export function useBookingPerformanceMonitor() {
  const metrics = useMemo(() => ({
    startTime: performance.now(),
    measureOperation: (operationName: string) => {
      const endTime = performance.now();
      const duration = endTime - performance.now();
      
      // Log performance metrics
      console.log(`[BOOKING PERF] ${operationName}: ${duration.toFixed(2)}ms`);
      
      // Send to analytics if configured
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: operationName,
          value: Math.round(duration)
        });
      }
      
      return duration;
    }
  }), []);

  return metrics;
}

export {
  useAsyncState,
  useAsyncStateGroup,
};