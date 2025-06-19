// lib/ghl/api.ts
import { ghlApiRequest } from './error-handler';

// GHL Private Integration API configuration from environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_API_VERSION = "2021-07-28"; // Standardized to latest stable version
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

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
    
    console.error(`❌ Error searching for contact by email (${email}):`, error.message);
    throw new Error(`Failed to search contact: ${error.message}`);
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
    if (error.ghlError?.statusCode === 400 && error.message?.includes('duplicate')) {
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
    
    console.error(`❌ Error creating contact:`, error.message);
    throw new Error(`Failed to create contact: ${error.message}`);
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
    
    const payload = {
      locationId: locationIdToUse,
      contactId: contactId,
      ...opportunityData,
    };
    
    console.log(`💼 Creating opportunity for contact: ${contactId}`);
    const response = await ghlApiRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log(`✅ Opportunity created successfully: ${response.id}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error creating opportunity:`, error.message);
    throw new Error(`Failed to create opportunity: ${error.message}`);
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
    console.error(`❌ Error updating contact custom fields:`, error.message);
    throw new Error(`Failed to update contact custom fields: ${error.message}`);
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
    console.error(`❌ Error updating opportunity custom fields:`, error.message);
    throw new Error(`Failed to update opportunity custom fields: ${error.message}`);
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
    
    console.log(`📅 Creating appointment:`, {
      calendarId: appointmentData.calendarId,
      contactId: appointmentData.contactId,
      title: appointmentData.title,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime
    });

    const response = await ghlApiRequest('/calendars/events/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });

    console.log(`✅ Appointment created successfully: ${response.id}`);
    return response;
    
  } catch (error: any) {
    console.error(`❌ Error creating appointment:`, error.message);
    throw new Error(`Failed to create appointment: ${error.message}`);
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
    console.error(`❌ Error adding tags to contact:`, error.message);
    throw new Error(`Failed to add tags to contact: ${error.message}`);
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
    console.error(`❌ Error removing tags from contact:`, error.message);
    throw new Error(`Failed to remove tags from contact: ${error.message}`);
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
    console.error(`❌ Error updating contact:`, error.message);
    throw new Error(`Failed to update contact: ${error.message}`);
  }
}

// Function to get monetary value (Consider moving this elsewhere if not strictly GHL API related)
export function getServiceValue(serviceType: string, numberOfSigners: number): number {
  switch (serviceType) {
    case "essential":
      if (numberOfSigners === 1) return 75;
      if (numberOfSigners === 2) return 85;
      if (numberOfSigners === 3) return 95;
      return 100; // 4+ signers
    case "priority":
      return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 10 : 0);
    case "loan-signing":
    case "reverse-mortgage":
      return 150;
    case "specialty":
      return 75;
    default:
      return 75;
  }
} 