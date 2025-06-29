/**
 * Optimized Booking Hook
 * 
 * Provides optimized data fetching and state management for booking-related
 * operations with race condition prevention and caching.
 */

import { useMemo } from 'react';
import { useAsyncState, useAsyncStateGroup } from './useAsyncState';
import type { Service } from '@/components/booking/forms/types';

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
      const response = await fetch('/api/services', {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300', // 5-minute cache
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.statusText}`);
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
 * Hook for optimized availability checking
 */
export function useOptimizedAvailability(serviceId: string, date: string) {
  return useAsyncState(
    async () => {
      if (!serviceId || !date) {
        throw new Error('Service ID and date are required');
      }

      const url = new URL('/api/availability', window.location.origin);
      url.searchParams.set('serviceId', serviceId);
      url.searchParams.set('date', date);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=60', // 1-minute cache for availability
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.statusText}`);
      }

      return response.json();
    },
    {
      immediate: Boolean(serviceId && date),
      deps: [serviceId, date],
      keepPreviousData: false, // Availability should always be fresh
      retry: { attempts: 2, delay: 500 },
    }
  );
}

/**
 * Hook for optimized booking submission
 */
export function useOptimizedBookingSubmission() {
  return useAsyncState(
    async (bookingData: any) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(bookingData),
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
      const url = new URL('/api/bookings', window.location.origin);
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

      const response = await fetch(`/api/bookings/${bookingId}`, {
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