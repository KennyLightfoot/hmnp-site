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

export async function getCalendarSlots(
  calendarId: string,
  startDate: string,
  endDate: string,
  teamMemberId?: string
) {
  try {
    // Normalize inputs and compute timestamps (seconds)
    const startIso = /T/.test(startDate) ? startDate : `${startDate}T00:00:00`;
    const endIso = /T/.test(endDate) ? endDate : `${endDate}T23:59:59`;
    const startSec = Math.floor(new Date(startIso).getTime() / 1000);
    const endSec = Math.floor(new Date(endIso).getTime() / 1000);

    console.log(`📅 [getCalendarSlots] Fetching slots for calendar ${calendarId}`);
    console.log(`📅 [getCalendarSlots] Date range: ${startIso} to ${endIso}`);
    console.log(`📅 [getCalendarSlots] Seconds: ${startSec} to ${endSec}`);

    // Attempt 1: startDate/endDate (seconds)
    const qp1 = new URLSearchParams({
      startDate: String(startSec),
      endDate: String(endSec),
      timezone: 'America/Chicago'
    });
    if (teamMemberId) qp1.set('teamMemberId', teamMemberId);
    const ep1 = `/calendars/${calendarId}/free-slots?${qp1}`;
    try {
      const resp1 = await makeGHLRequest(ep1, 'GET');
      console.log(`📅 [getCalendarSlots] Used params: startDate/endDate (sec)`);
      // Normalize response
      const s = Array.isArray(resp1) ? resp1 : (resp1?.slots || resp1?.data || resp1?.freeSlots || resp1?.availableSlots || []);
      return s;
    } catch (err: any) {
      const msg = (err?.response && JSON.stringify(err.response)) || String(err?.message || err);
      if (!/startDate|endDate/i.test(msg)) throw err;
      console.warn(`⚠️ [getCalendarSlots] startDate/endDate rejected. Retrying with startTime/endTime...`);
    }

    // Attempt 2: startTime/endTime (seconds)
    const qp2 = new URLSearchParams({
      startTime: String(startSec),
      endTime: String(endSec),
      timezone: 'America/Chicago'
    });
    if (teamMemberId) qp2.set('teamMemberId', teamMemberId);
    const ep2 = `/calendars/${calendarId}/free-slots?${qp2}`;
    try {
      const resp2 = await makeGHLRequest(ep2, 'GET');
      console.log(`📅 [getCalendarSlots] Used params: startTime/endTime (sec)`);
      const s = Array.isArray(resp2) ? resp2 : (resp2?.slots || resp2?.data || resp2?.freeSlots || resp2?.availableSlots || []);
      return s;
    } catch (err2: any) {
      const msg2 = (err2?.response && JSON.stringify(err2.response)) || String(err2?.message || err2);
      if (!/start(Time|Date)|end(Time|Date)/i.test(msg2)) throw err2;
      console.warn(`⚠️ [getCalendarSlots] startTime/endTime (sec) rejected. Retrying with milliseconds...`);
    }

    // Attempt 3: startTime/endTime (milliseconds)
    const startMs = startSec * 1000;
    const endMs = endSec * 1000;
    const qp3 = new URLSearchParams({
      startTime: String(startMs),
      endTime: String(endMs),
      timezone: 'America/Chicago'
    });
    if (teamMemberId) qp3.set('teamMemberId', teamMemberId);
    const ep3 = `/calendars/${calendarId}/free-slots?${qp3}`;
    const resp3 = await makeGHLRequest(ep3, 'GET');
    console.log(`📅 [getCalendarSlots] Used params: startTime/endTime (ms)`);
    const s3 = Array.isArray(resp3) ? resp3 : (resp3?.slots || resp3?.data || resp3?.freeSlots || resp3?.availableSlots || []);
    return s3;
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