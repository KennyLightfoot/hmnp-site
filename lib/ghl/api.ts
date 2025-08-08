// lib/ghl/api.ts
import { ghlApiRequest } from './error-handler';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getCleanEnv } from '../env-clean';

// GHL Private Integration API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = getCleanEnv('GHL_PRIVATE_INTEGRATION_TOKEN');
const GHL_API_VERSION = "2021-07-28"; // Standardized to latest stable version
const GHL_LOCATION_ID = getCleanEnv('GHL_LOCATION_ID');
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || 'America/Chicago';
const DEFAULT_BUFFER_MINUTES = Number(process.env.MIN_APPOINTMENT_GAP_MINUTES || '15');
const GHL_DEFAULT_PIPELINE_ID = process.env.GHL_DEFAULT_PIPELINE_ID || '';
const GHL_DEFAULT_PIPELINE_STAGE_ID = process.env.GHL_DEFAULT_PIPELINE_STAGE_ID || '';

// Validation helper for Private Integration setup
function validateGHLConfig() {
  if (!GHL_PRIVATE_INTEGRATION_TOKEN) {
    console.error("GHL_PRIVATE_INTEGRATION_TOKEN is missing. Please set up Private Integration.");
    throw new Error("GHL Private Integration not configured. See lib/ghl/private-integration-setup.md");
  }
  
  if (!GHL_LOCATION_ID) {
    console.error("GHL_LOCATION_ID is missing in environment variables.");
    throw new Error("GHL Location ID is required.");
  }
}

// Helper function to search for a contact by email in GHL
export async function findContactByEmail(email: string, locationId?: string): Promise<any | null> {
  validateGHLConfig();
  
  try {
    const locationIdToUse = locationId || GHL_LOCATION_ID;
    const queryParams: Record<string, string> = { query: email };
    if (locationIdToUse) {
      queryParams.locationId = locationIdToUse;
    }
    
    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = `/contacts?${queryString}`;
    
    console.log(`🔍 Searching for contact by email: ${email}`);
    const data = await ghlApiRequest(endpoint, { method: 'GET' });
    
    if (data.contacts && data.contacts.length > 0) {
      console.log(`✅ Contact found: ${data.contacts[0].id}`);
      return data.contacts[0];
    }

    console.log(`📝 No contact found for email: ${email}`);
    return null;
    
  } catch (error: any) {
    // Handle 404 as "not found" rather than error
    if (error.ghlError?.statusCode === 404) {
      console.log(`📝 No contact found for email: ${email} (404)`);
      return null;
    }
    
    console.error(`❌ Error searching for contact by email (${email}):`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to search contact: ${getErrorMessage(error)}`);
  }
}

// Helper function to create a contact in GHL
export async function createContact(contactData: any, locationId?: string): Promise<any> {
  validateGHLConfig();
  
  try {
    const locationIdToUse = locationId || GHL_LOCATION_ID;
    
    if (!locationIdToUse) {
      throw new Error("No location ID provided or available in environment.");
    }
    
    const payload = {
      locationId: locationIdToUse,
      ...contactData,
    };
    
    console.log(`👤 Creating contact: ${contactData.email || 'unknown'}`);
    const response = await ghlApiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log(`✅ Contact created successfully: ${response.id}`);
    return response;
    
  } catch (error: any) {
    // Handle duplicate contact error
    if (error.ghlError?.statusCode === 400 && getErrorMessage(error)?.includes('duplicate')) {
      console.warn(`⚠️ Duplicate contact detected for ${contactData.email}, attempting to find existing...`);
      try {
        const existingContact = await findContactByEmail(contactData.email, locationId);
        if (existingContact) {
          console.log(`✅ Using existing contact: ${existingContact.id}`);
          return existingContact;
        }
      } catch (findError) {
        console.error(`❌ Failed to find existing contact after duplicate error:`, findError);
      }
    }
    
    console.error(`❌ Error creating contact:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to create contact: ${getErrorMessage(error)}`);
  }
}

// Helper function to create an opportunity in GHL
export async function createOpportunity(contactId: string, opportunityData: any, locationId?: string): Promise<any> {
  validateGHLConfig();
  
  try {
    const locationIdToUse = locationId || GHL_LOCATION_ID;
    
    if (!locationIdToUse) {
      throw new Error("No location ID provided or available in environment.");
    }
    
    const payload: any = {
      locationId: locationIdToUse,
      contactId: contactId,
      ...opportunityData,
    };

    // Include default pipeline info if provided via env (prevents 404/validation issues)
    if (GHL_DEFAULT_PIPELINE_ID) payload.pipelineId = GHL_DEFAULT_PIPELINE_ID;
    if (GHL_DEFAULT_PIPELINE_STAGE_ID) payload.pipelineStageId = GHL_DEFAULT_PIPELINE_STAGE_ID;
    
    console.log(`💼 Creating opportunity for contact: ${contactId}`);
    const response = await ghlApiRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log(`✅ Opportunity created successfully: ${response.id}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error creating opportunity:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to create opportunity: ${getErrorMessage(error)}`);
  }
}

// Helper function to update custom fields for a contact
export async function updateContactCustomFields(contactId: string, customFields: any): Promise<any> {
  validateGHLConfig();
  
  try {
    const payload = {
      customFields: customFields,
    };
    
    console.log(`🔧 Updating custom fields for contact: ${contactId}`);
    const response = await ghlApiRequest(`/contacts/${contactId}/custom-fields`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    
    console.log(`✅ Custom fields updated successfully for contact: ${contactId}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error updating contact custom fields:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to update contact custom fields: ${getErrorMessage(error)}`);
  }
}

// Helper function to update custom fields for an opportunity
export async function updateOpportunityCustomFields(opportunityId: string, customFields: any): Promise<any> {
  validateGHLConfig();
  
  try {
    const payload = {
      customFields: customFields,
    };
    
    console.log(`🔧 Updating custom fields for opportunity: ${opportunityId}`);
    const response = await ghlApiRequest(`/opportunities/${opportunityId}/custom-fields`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    
    console.log(`✅ Custom fields updated successfully for opportunity: ${opportunityId}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error updating opportunity custom fields:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to update opportunity custom fields: ${getErrorMessage(error)}`);
  }
}

// Helper function to create an appointment in GHL
export async function createAppointment(appointmentData: any, locationId?: string): Promise<any> {
  validateGHLConfig();
  
  try {
    const locationIdToUse = locationId || GHL_LOCATION_ID;
    
    if (locationIdToUse && !appointmentData.locationId) {
      appointmentData.locationId = locationIdToUse;
    }
    
    // Add timeZone for clarity
    if (!appointmentData.timeZone) {
      appointmentData.timeZone = BUSINESS_TIMEZONE;
    }

    console.log(`📅 Creating appointment:`, {
      calendarId: appointmentData.calendarId,
      contactId: appointmentData.contactId,
      title: appointmentData.title,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      timeZone: appointmentData.timeZone
    });

    // Preflight: check for calendar conflicts in a buffered window
    try {
      const bufferMinutes = isFinite(DEFAULT_BUFFER_MINUTES) ? DEFAULT_BUFFER_MINUTES : 15;
      const startMs = Date.parse(appointmentData.startTime);
      const endMs = Date.parse(appointmentData.endTime);
      const windowStartIso = new Date(startMs - bufferMinutes * 60 * 1000).toISOString();
      const windowEndIso = new Date(endMs + bufferMinutes * 60 * 1000).toISOString();

      const events = await getCalendarEvents(
        appointmentData.calendarId,
        windowStartIso,
        windowEndIso
      );

      if (Array.isArray(events?.events) ? events.events.length > 0 : (Array.isArray(events) && events.length > 0)) {
        console.warn('🛑 GHL preflight conflict detected – aborting appointment creation', {
          calendarId: appointmentData.calendarId,
          windowStartIso,
          windowEndIso,
          conflictCount: Array.isArray(events?.events) ? events.events.length : (Array.isArray(events) ? events.length : 0)
        });
        throw new Error('Selected time conflicts with existing calendar events');
      }
    } catch (preflightErr) {
      // Bubble up – caller will decide fallback to opportunity
      throw preflightErr;
    }

    const response = await ghlApiRequest('/calendars/events/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });

    console.log(`✅ Appointment created successfully: ${response.id}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error creating appointment:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to create appointment: ${getErrorMessage(error)}`);
  }
}

// List calendar events in a window – used for conflict preflight
export async function getCalendarEvents(
  calendarId: string,
  startTimeIso: string,
  endTimeIso: string
): Promise<any> {
  validateGHLConfig();
  try {
    const params = new URLSearchParams({
      calendarId,
      startTime: startTimeIso,
      endTime: endTimeIso,
    }).toString();
    const endpoint = `/calendars/events?${params}`;
    const data = await ghlApiRequest(endpoint, { method: 'GET' });
    return data;
  } catch (error: any) {
    console.error('❌ Error retrieving calendar events:', getErrorMessage(error));
    throw new Error(`Failed to retrieve calendar events: ${getErrorMessage(error)}`);
  }
}

// Helper function to add tags to a contact
export async function addTagsToContact(contactId: string, tags: string[]): Promise<any> {
  validateGHLConfig();
  
  try {
    const payload = {
      tags: tags
    };
    
    console.log(`🏷️ Adding tags to contact ${contactId}:`, tags);
    const response = await ghlApiRequest(`/contacts/${contactId}/tags`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log(`✅ Tags added successfully to contact: ${contactId}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error adding tags to contact:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to add tags to contact: ${getErrorMessage(error)}`);
  }
}

// Helper function to remove tags from a contact
export async function removeTagsFromContact(contactId: string, tags: string[]): Promise<any> {
  validateGHLConfig();
  
  try {
    console.log(`🏷️ Removing tags from contact ${contactId}:`, tags);
    
    // For removing tags, we need to send each tag removal individually
    const promises = tags.map(tag => 
      ghlApiRequest(`/contacts/${contactId}/tags/${encodeURIComponent(tag)}`, {
        method: 'DELETE'
      })
    );
    
    await Promise.allSettled(promises);
    console.log(`✅ Tags removed successfully from contact: ${contactId}`);
    return { success: true };
    
  } catch (error: any) {
    console.error(`❌ Error removing tags from contact:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to remove tags from contact: ${getErrorMessage(error)}`);
  }
}

// Helper function to update a contact
export async function updateContact(contactData: { id: string, [key: string]: any }): Promise<any> {
  validateGHLConfig();
  
  try {
    const { id, ...updateData } = contactData;
    
    console.log(`👤 Updating contact: ${id}`);
    const response = await ghlApiRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    console.log(`✅ Contact updated successfully: ${id}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error updating contact:`, error instanceof Error ? getErrorMessage(error) : String(error));
    throw new Error(`Failed to update contact: ${getErrorMessage(error)}`);
  }
}

// SOP COMPLIANT: Get monetary value for service types
export function getServiceValue(serviceType: string, numberOfSigners: number): number {
  switch (serviceType) {
    case "quick-stamp-local":
      // SOP: $50 base, 10-mile radius, 9am-5pm Mon-Fri
      return 50 + (numberOfSigners > 1 ? (numberOfSigners - 1) * 10 : 0);
    case "standard-notary":
      // SOP: $75 base, 20-mile radius, 9am-5pm Mon-Fri
      if (numberOfSigners === 1) return 75;
      if (numberOfSigners === 2) return 80;
      return 85; // 3+ signers
    case "extended-hours-notary":
      // SOP: $100 flat fee, 30-mile radius, 7am-9pm Daily
      return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 5 : 0);
    case "loan-signing-specialist":
      // SOP: $150 flat fee, single package, up to 4 signers
      return 150;
    case "ron-services":
      // SOP: $25 session + $5 per seal
      return 25;
    case "business-solutions":
      return 125;
    case "support-service":
      return 50;
    default:
      return 75;
  }
} 
