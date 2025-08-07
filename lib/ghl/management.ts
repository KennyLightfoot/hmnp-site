/**
 * Comprehensive GoHighLevel Management Utility
 * Provides functions to create and manage all GHL entities via API
 */

import { ghlClient } from './client';

interface GHLApiConfig {
  baseUrl: string;
  privateIntegrationToken: string;
  version: string;
  locationId?: string;
}

const getGHLConfig = (): GHLApiConfig => {
  // Load environment variables dynamically to avoid module loading order issues
  const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
  const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const GHL_API_VERSION = "2021-07-28"; // FIXED: Use working API version
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_BASE_URL || !GHL_PRIVATE_INTEGRATION_TOKEN) {
    throw new Error('GHL Private Integration credentials missing in environment variables. Please set up Private Integration.');
  }
  
  return {
    baseUrl: GHL_API_BASE_URL,
    privateIntegrationToken: GHL_PRIVATE_INTEGRATION_TOKEN,
    version: GHL_API_VERSION,
    locationId: GHL_LOCATION_ID
  };
};

async function makeGHLRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
  return await ghlClient.request(endpoint, {
    method,
    body: body ? JSON.stringify(body) : undefined
  });
}

// ===== CONTACT MANAGEMENT =====

export interface ContactData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  tags?: string[];
  customFields?: Array<{
    id: string;
    field_value: string | number | boolean;
  }>;
}

export async function createContact(contactData: ContactData) {
  const config = getGHLConfig();
  const endpoint = `/contacts/`;
  
  const payload = {
    ...contactData,
    locationId: config.locationId
  };

  return await makeGHLRequest(endpoint, 'POST', payload);
}

export async function updateContact(contactId: string, contactData: Partial<ContactData>) {
  const endpoint = `/contacts/${contactId}`;
  return await makeGHLRequest(endpoint, 'PUT', contactData);
}

export async function searchContacts(query: string, locationId?: string) {
  const config = getGHLConfig();
  const endpoint = `/contacts/?locationId=${locationId || config.locationId}&query=${encodeURIComponent(query)}`;
  return await makeGHLRequest(endpoint, 'GET');
}

export async function addContactTags(contactId: string, tags: string[]) {
  const endpoint = `/contacts/${contactId}/tags`;
  return await makeGHLRequest(endpoint, 'POST', { tags });
}

export async function removeContactTags(contactId: string, tags: string[]) {
  const endpoint = `/contacts/${contactId}/tags`;
  return await makeGHLRequest(endpoint, 'DELETE', { tags });
}

// ===== APPOINTMENT MANAGEMENT =====

export interface AppointmentData {
  calendarId: string;
  contactId: string;
  startTime: string; // ISO 8601 format
  endTime: string;
  title?: string;
  appointmentStatus?: 'confirmed' | 'cancelled' | 'showed' | 'noshow' | 'rescheduled';
  address?: string;
  ignoreDateRange?: boolean;
  toNotify?: boolean;
}

export async function createAppointment(appointmentData: AppointmentData) {
  const config = getGHLConfig();
  const endpoint = `/calendars/events/appointments`;
  
  const payload = {
    ...appointmentData,
    locationId: process.env.GHL_LOCATION_ID
  };

  // Call GHL and log raw response for diagnostics
  const response = await makeGHLRequest(endpoint, 'POST', payload);
  console.log('🗓️  GHL createAppointment response:', JSON.stringify(response).slice(0, 500));
  return response;
}

export async function getCalendarSlots(calendarId: string, startDate: string, endDate: string) {
  try {
    // ✅ FIXED: Better date handling for GHL API
    const startTimestamp = Math.floor(new Date(`${startDate}T00:00:00`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${endDate}T23:59:59`).getTime() / 1000);
    
    const queryParams = new URLSearchParams({
      startDate: startTimestamp.toString(),
      endDate: endTimestamp.toString(),
      timezone: 'America/Chicago'
    });
    
    console.log(`📅 [getCalendarSlots] Fetching slots for calendar ${calendarId}`);
    console.log(`📅 [getCalendarSlots] Date range: ${startDate} to ${endDate}`);
    console.log(`📅 [getCalendarSlots] Timestamps: ${startTimestamp} to ${endTimestamp}`);
    
    const endpoint = `/calendars/${calendarId}/free-slots?${queryParams}`;
    const response = await makeGHLRequest(endpoint, 'GET');
    
    console.log(`📅 [getCalendarSlots] Response type: ${typeof response}`);
    console.log(`📅 [getCalendarSlots] Response structure:`, JSON.stringify(response).slice(0, 200));
    
    return response;
  } catch (error) {
    console.error(`❌ [getCalendarSlots] Failed to fetch slots for calendar ${calendarId}:`, error);
    throw error;
  }
}

export async function updateAppointment(appointmentId: string, appointmentData: Partial<AppointmentData>) {
  const endpoint = `/calendars/events/appointments/${appointmentId}`;
  return await makeGHLRequest(endpoint, 'PUT', appointmentData);
}

// ===== WORKFLOW MANAGEMENT =====

export async function addContactToWorkflow(contactId: string, workflowId: string) {
  const endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
  return await makeGHLRequest(endpoint, 'POST', {});
}

export async function removeContactFromWorkflow(contactId: string, workflowId: string) {
  const endpoint = `/contacts/${contactId}/workflow/${workflowId}`;
  return await makeGHLRequest(endpoint, 'DELETE');
}

// ===== LOCATION INFO =====

export async function getLocationInfo() {
  const config = getGHLConfig();
  const endpoint = `/locations/${config.locationId}`;
  return await makeGHLRequest(endpoint, 'GET');
} 