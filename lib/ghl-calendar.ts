/**
 * GoHighLevel Calendar Integration (API v2 - Private Integration)
 * 
 * This module provides functions to interact with GHL calendars and availability
 * using the Private Integration API v2 as documented at:
 * https://help.gohighlevel.com/support/solutions/articles/155000003054-private-integrations-everything-you-need-to-know
 */

import { getErrorMessage } from '@/lib/utils/error-utils';

// Cache for calendar data to prevent excessive API calls
interface CalendarCacheEntry {
  data: any;
  timestamp: number;
  expires: number;
}

const calendarCache = new Map<string, CalendarCacheEntry>();
const CALENDAR_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface GhlApiConfig {
  apiKey: string;
  baseUrl: string;
}

const getGhlApiConfig = (): GhlApiConfig => {
  const apiKey = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

  if (!apiKey) {
    throw new Error('GHL_PRIVATE_INTEGRATION_TOKEN or GHL_API_KEY environment variable is not set');
  }
  return { apiKey, baseUrl };
};

export const getCleanLocationId = (): string => {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) {
    throw new Error('GHL_LOCATION_ID environment variable is not set');
  }
  return locationId.trim();
};

/**
 * Make authenticated API call to GHL API v2
 */
async function callGhlCalendarApi<T = any>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  body?: any
): Promise<T | null> {
  const { apiKey, baseUrl } = getGhlApiConfig();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Authorization': apiKey,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Version': '2021-07-28' // GHL API v2 version
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GHL API Error (${response.status}):`, errorText);
      throw new Error(`GHL API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GHL Calendar API call failed:', getErrorMessage(error));
    throw error;
  }
}

/**
 * Get all calendars for the location
 */
export async function getCalendars(): Promise<any[]> {
  const locationId = getCleanLocationId();
  const cacheKey = `calendars-${locationId}`;
  
  // Check cache first
  const cached = calendarCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const response = await callGhlCalendarApi(`/calendars/?locationId=${locationId}`, 'GET');
    
    if (response && Array.isArray(response)) {
      // Cache the response
      calendarCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
        expires: Date.now() + CALENDAR_CACHE_TTL
      });
      return response;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch calendars:', getErrorMessage(error));
    return [];
  }
}

/**
 * Get calendar by ID
 */
export async function getCalendarById(calendarId: string): Promise<any | null> {
  const cacheKey = `calendar-${calendarId}`;
  
  // Check cache first
  const cached = calendarCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const response = await callGhlCalendarApi(`/calendars/${calendarId}`, 'GET');
    
    if (response) {
      // Cache the response
      calendarCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
        expires: Date.now() + CALENDAR_CACHE_TTL
      });
      return response;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch calendar ${calendarId}:`, getErrorMessage(error));
    return null;
  }
}

/**
 * Get available time slots for a specific date range
 */
export async function getAvailableSlots(
  calendarId: string,
  startDate: string,
  endDate: string,
  duration: number = 60
): Promise<any[]> {
  const cacheKey = `slots-${calendarId}-${startDate}-${endDate}-${duration}`;
  
  // Check cache first
  const cached = calendarCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
      duration: duration.toString()
    });

    const response = await callGhlCalendarApi(
      `/calendars/${calendarId}/available-slots?${params}`, 
      'GET'
    );
    
    if (response && Array.isArray(response)) {
      // Cache the response
      calendarCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
        expires: Date.now() + CALENDAR_CACHE_TTL
      });
      return response;
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to fetch available slots for calendar ${calendarId}:`, getErrorMessage(error));
    return [];
  }
}

/**
 * Get calendar events for a date range
 */
export async function getCalendarEvents(
  calendarId: string,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const cacheKey = `events-${calendarId}-${startDate}-${endDate}`;
  
  // Check cache first
  const cached = calendarCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      startDate,
      endDate
    });

    const response = await callGhlCalendarApi(
      `/calendars/${calendarId}/events?${params}`, 
      'GET'
    );
    
    if (response && Array.isArray(response)) {
      // Cache the response
      calendarCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
        expires: Date.now() + CALENDAR_CACHE_TTL
      });
      return response;
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to fetch events for calendar ${calendarId}:`, getErrorMessage(error));
    return [];
  }
}

/**
 * Create an appointment in GHL calendar
 */
export async function createAppointment(appointmentData: {
  calendarId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  contactId?: string;
  locationId?: string;
}): Promise<any> {
  try {
    // Ensure locationId is set
    if (!appointmentData.locationId) {
      appointmentData.locationId = getCleanLocationId();
    }

    const response = await callGhlCalendarApi(
      '/calendars/events/appointments',
      'POST',
      appointmentData
    );
    
    console.log('GHL appointment created successfully:', response?.id);
    return response;
  } catch (error) {
    console.error('Error creating GHL appointment:', getErrorMessage(error));
    throw new Error(`Failed to create appointment: ${getErrorMessage(error)}`);
  }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
  appointmentId: string,
  appointmentData: Partial<{
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
  }>
): Promise<any> {
  try {
    const response = await callGhlCalendarApi(
      `/calendars/events/appointments/${appointmentId}`,
      'PUT',
      appointmentData
    );
    
    console.log('GHL appointment updated successfully:', response?.id);
    return response;
  } catch (error) {
    console.error('Error updating GHL appointment:', getErrorMessage(error));
    throw new Error(`Failed to update appointment: ${getErrorMessage(error)}`);
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: string,
  reason?: string
): Promise<any> {
  try {
    const response = await callGhlCalendarApi(
      `/calendars/events/appointments/${appointmentId}/cancel`,
      'POST',
      { reason }
    );
    
    console.log('GHL appointment cancelled successfully:', appointmentId);
    return response;
  } catch (error) {
    console.error('Error cancelling GHL appointment:', getErrorMessage(error));
    throw new Error(`Failed to cancel appointment: ${getErrorMessage(error)}`);
  }
}

/**
 * Test GHL calendar connection
 */
export async function testCalendarConnection(): Promise<boolean> {
  try {
    const calendars = await getCalendars();
    console.log('GHL Calendar connection test successful. Found calendars:', calendars.length);
    return true;
  } catch (error) {
    console.error('GHL Calendar connection test failed:', getErrorMessage(error));
    return false;
  }
}

/**
 * Clear calendar cache
 */
export function clearCalendarCache(): void {
  calendarCache.clear();
  console.log('GHL Calendar cache cleared');
}

/**
 * Get cache statistics
 */
export function getCalendarCacheStats(): { size: number; keys: string[] } {
  return {
    size: calendarCache.size,
    keys: Array.from(calendarCache.keys())
  };
} 