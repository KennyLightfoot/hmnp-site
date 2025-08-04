// /lib/ghl.ts

import { getErrorMessage } from '@/lib/utils/error-utils';

// Cache for custom fields
interface CustomFieldsCacheEntry {
  timestamp: number;
  fields: GhlCustomField[];
}
const customFieldsCache: Record<string, CustomFieldsCacheEntry> = {};
const CUSTOM_FIELDS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

/**
 * GHL API Helper Utility (V2 - Private Integration Token Focused - Updated for 2024/2025)
 *
 * This module provides functions to interact with the GoHighLevel (GHL) API using Private Integration Tokens.
 * Updated to match the latest GHL API v2 requirements and authentication changes.
 *
 * Ensure the following environment variables are set:
 * GHL_API_KEY=your_ghl_private_integration_token (starting with pit-)
 * GHL_API_BASE_URL=https://services.leadconnectorhq.com (or your specific GHL API base URL)
 * GHL_LOCATION_ID=your_target_ghl_location_id (used in request bodies, not headers)
 */

export interface GhlCustomField {
  id?: string; // Custom field ID in GHL (used when GHL returns it)
  key?: string; // The unique key for the custom field (e.g., contact.cf_custom_field_key)
  fieldKey?: string; // GHL sometimes uses this alias for key
  value: string | number | boolean | string[] | null;
  // Properties returned by getLocationCustomFields
  name?: string;
  dataType?: string;
  position?: number;
  options?: string[];
  placeholder?: string;
  acceptedFormat?: string;
  folderId?: string;
  model?: 'contact';
}

export interface GhlCustomFieldsResponse {
  customFields?: GhlCustomField[];
  // If GHL API sometimes wraps custom fields in a 'data' property, you could add:
  // data?: GhlCustomField[]; 
}

export interface GhlContact {
  id?: string; // GHL Contact ID (returned by GHL)
  locationId?: string; // REQUIRED in the body for creating/upserting contacts
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  tags?: string[];
  customFields?: Record<string, any>; // Plural form for API response
  customField?: Record<string, any>; // Singular form used in our internal code
  custom_fields?: Record<string, any>; // Underscore format sometimes used by APIs
  dnd?: boolean; // Do Not Disturb
  source?: string;
  companyName?: string;
}

interface GhlApiConfig {
  apiKey: string;
  baseUrl: string;
}

const getGhlApiConfig = (): GhlApiConfig => {
  // Try multiple environment variable names for backward compatibility
  const apiKey = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

  if (!apiKey) {
    console.error('GHL_PRIVATE_INTEGRATION_TOKEN or GHL_API_KEY environment variable is not set');
    throw new Error('GHL_PRIVATE_INTEGRATION_TOKEN or GHL_API_KEY environment variable is not set');
  }
  return { apiKey, baseUrl };
};

// Utility function to get clean location ID (trim whitespace/newlines)
export const getCleanLocationId = (): string => {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) {
    throw new Error('GHL_LOCATION_ID environment variable is not set');
  }
  return locationId.trim();
};

async function callGhlApi<T = any>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<T | null> {
  const { apiKey, baseUrl } = getGhlApiConfig();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Updated authentication based on latest GHL API v2 requirements
  const headers: HeadersInit = {
    'Authorization': apiKey,
    'Version': '2021-07-28',
    'Accept': 'application/json',
  };

  if (method === 'POST' || method === 'PUT') {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`[callGhlApi] Request: ${method} ${url}`);
  if (body) {
    console.log(`[callGhlApi] Body: ${JSON.stringify(body, null, 2)}`);
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`[callGhlApi] Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GHL API Error (${response.status}) on ${method} ${url}: ${errorText}`);
      
      // Enhanced error handling for common issues
      if (response.status === 403) {
        console.error('🚨 GHL API 403 Error - This usually indicates:');
        console.error('  1. Private Integration Token lacks required permissions');
        console.error('  2. Token doesn\'t have access to the specified location');
        console.error('  3. Token may have expired or been rotated');
        console.error('  4. The location ID might be incorrect');
      }
      
      throw new Error(`GHL API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (response.status === 204) { // No Content
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error during GHL API call to ${method} ${url}:`, error);
    throw error;
  }
}

export async function getContactByEmail(email: string): Promise<GhlContact | null> {
  if (!email) {
    console.error('GHL API: Email is required to get contact by email.');
    throw new Error('Email is required to get contact by email.');
  }
  try {
    // Updated approach based on latest GHL API v2 documentation
    // Try multiple approaches for better compatibility
    console.log(`[getContactByEmail] Searching for contact with email: ${email}`);
    
    // Method 1: Use the updated contacts search endpoint (v2 format)
    const response = await callGhlApi('/contacts/search', 'POST', {
      locationId: getCleanLocationId(),
      query: email.toLowerCase().trim(),
      limit: 10
    });

    let foundContact: GhlContact | null = null;

    // Handle different response formats from GHL API
    if (response && response.contacts && Array.isArray(response.contacts)) {
      // Standard format: { meta: {...}, contacts: [...] }
      foundContact = response.contacts.find(
        (contact: GhlContact) => contact.email?.toLowerCase() === email.toLowerCase()
      ) || null;
    } else if (response && Array.isArray(response) && response.length > 0) {
      // Array format: [{...}, {...}]
      foundContact = response.find(
        (contact: GhlContact) => contact.email?.toLowerCase() === email.toLowerCase()
      ) || null;
    } else if (response && response.id && response.email) {
      // Single contact format
      if (response.email.toLowerCase() === email.toLowerCase()) {
        foundContact = response;
      }
    }

    if (foundContact) {
      console.log(`GHL API: Found contact by email ${email}: ID ${foundContact.id}`);
      return foundContact;
    }

    // Method 2: If search fails, try the contacts list endpoint with email filter
    console.log(`[getContactByEmail] Search method didn't find contact, trying list endpoint`);
    
    const listResponse = await callGhlApi(`/contacts?locationId=${getCleanLocationId()}&email=${encodeURIComponent(email)}&limit=10`, 'GET');
    
    if (listResponse && listResponse.contacts && Array.isArray(listResponse.contacts)) {
      foundContact = listResponse.contacts.find(
        (contact: GhlContact) => contact.email?.toLowerCase() === email.toLowerCase()
      ) || null;
    }

    if (foundContact) {
      console.log(`GHL API: Found contact via list endpoint for email ${email}: ID ${foundContact.id}`);
    } else {
      console.log(`GHL API: No contact found for email ${email} using any method`);
    }
    
    return foundContact;

  } catch (error: any) {
    const errorMessage = getErrorMessage(error) || String(error);
    
    // Enhanced 403 error handling with updated guidance
    if (errorMessage.includes('403') || errorMessage.includes('does not have access to this location')) {
      console.error(`🚨 GHL API 403 Error for email lookup (${email}):`);
      console.error('  This suggests a Private Integration Token permission issue:');
      console.error('  1. Check if your PIT has "contacts.read" and "contacts.write" permissions');
      console.error('  2. Verify the GHL_LOCATION_ID matches your sub-account ID');
      console.error('  3. Consider regenerating your Private Integration Token');
      console.error('  4. Ensure your GHL plan supports Private Integrations');
      
      // For 403 errors during contact lookup, return null to allow booking to continue
      console.warn('  - Treating as "contact not found" to allow booking to continue');
      return null;
    }
    
    if (error.response?.status === 404 || errorMessage.includes('404')) {
      console.log(`GHL API: Contact with email ${email} not found (received 404).`);
      return null;
    }
    
    // Enhanced error logging
    console.error(`GHL API: Error fetching contact by email (${email}):`, {
      status: error.response?.status,
      message: errorMessage,
      stack: error.stack
    });
    
    // For other errors, still return null to prevent booking failures
    console.warn('  - Treating as "contact not found" to allow booking to continue');
    return null;
  }
}

/**
 * Creates or updates a contact in GoHighLevel using the latest API format.
 */
export async function upsertContact(contactData: GhlContact): Promise<any> {
  if (!contactData.locationId) {
    throw new Error('locationId is required in contactData for upserting a contact.');
  }
  if (!contactData.email && !contactData.phone) {
    console.warn('Upserting contact without email or phone. GHL might require one.');
  }
  try {
    // Extract customField property and prepare payload
    const { customField, ...contactDataWithoutCustomField } = contactData;
    
    // Create an array of custom fields in the format GHL expects
    let customFieldsArray: { id: string, field_value: any }[] = [];
    
    if (customField) {
      // Handle both array format (from contact form) and object format (legacy)
      if (Array.isArray(customField)) {
        // Already in correct format from contact form
        customFieldsArray = customField;
      } else {
        // Convert object format to array format
        customFieldsArray = convertCustomFieldsObjectToArray(customField);
      }
    }
    
    // Create the final payload with proper GHL API format
    const payload = {
      ...contactDataWithoutCustomField,
      customFields: customFieldsArray
    };
    
    console.log('[upsertContact] Using updated payload format with', customFieldsArray.length, 'custom fields');
    console.log('[upsertContact] Custom fields payload:', JSON.stringify(customFieldsArray, null, 2));
    
    // Use the updated upsert endpoint
    const response = await callGhlApi('/contacts/upsert', 'POST', payload);
    return response.contact || response; 
  } catch (error) {
    const errorMessage = error instanceof Error ? getErrorMessage(error) : String(error);
    
    // Enhanced error handling for common issues
    if (errorMessage.includes('customFields must be an array')) {
      console.error('Error upserting contact: customFields format issue. Retrying with empty custom fields...');
      
      // Retry without custom fields
      try {
        const { customField, ...contactDataWithoutCustomField } = contactData;
        const retryPayload = {
          ...contactDataWithoutCustomField,
          customFields: []
        };
        
        const retryResponse = await callGhlApi('/contacts/upsert', 'POST', retryPayload);
        console.log('Successfully upserted contact without custom fields');
        return retryResponse.contact || retryResponse;
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        throw retryError;
      }
    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
      console.error('Error upserting contact: Unauthorized. Check your GHL_API_KEY permissions and location access.');
    }
    
    console.error('Error upserting contact:', error);
    throw error;
  }
}

export async function addTagsToContact(contactId: string, tags: string[]): Promise<any> {
  if (!contactId || !tags || tags.length === 0) {
    throw new Error('Contact ID and tags array are required.');
  }
  try {
    return await callGhlApi(`/contacts/${contactId}/tags`, 'POST', { tags });
  } catch (error) {
    console.error(`Error adding tags to contact ${contactId}:`, error);
    throw error;
  }
}

export async function removeTagsFromContact(contactId: string, tags: string[]): Promise<any> {
  if (!contactId || !tags || tags.length === 0) {
    throw new Error('Contact ID and tags array are required.');
  }
  try {
    return await callGhlApi(`/contacts/${contactId}/tags`, 'DELETE', { tags });
  } catch (error) {
    console.error(`Error removing tags from contact ${contactId}:`, error);
    throw error;
  }
}

/**
 * Fetches a contact by their ID from GoHighLevel.
 */
export async function getContactById(contactId: string): Promise<GhlContact | null> {
  if (!contactId) {
    console.error('GHL API: Contact ID is required to get contact by ID.');
    throw new Error('Contact ID is required to get contact by ID.');
  }
  try {
    console.log(`[getContactById] Fetching contact with ID: ${contactId}`);
    const response = await callGhlApi(`/contacts/${contactId}`, 'GET');
    
    if (response && response.contact) {
      console.log(`GHL API: Found contact by ID ${contactId}`);
      return response.contact;
    } else if (response && response.id) {
      console.log(`GHL API: Found contact by ID ${contactId}`);
      return response;
    }
    
    console.log(`GHL API: No contact found for ID ${contactId}`);
    return null;
  } catch (error: any) {
    const errorMessage = getErrorMessage(error) || String(error);
    
    if (error.response?.status === 404 || errorMessage.includes('404')) {
      console.log(`GHL API: Contact with ID ${contactId} not found (received 404).`);
      return null;
    }
    
    console.error(`GHL API: Error fetching contact by ID (${contactId}):`, error);
    throw error;
  }
}

/**
 * Fetches contacts by tag from GoHighLevel.
 */
export async function getContactsByTag(tag: string): Promise<GhlContact[]> {
  if (!tag) {
    console.error('GHL API: Tag is required to get contacts by tag.');
    throw new Error('Tag is required to get contacts by tag.');
  }
  
  try {
    console.log(`[getContactsByTag] Fetching contacts with tag: ${tag}`);
    
    // Use the contacts list endpoint with tag filter
    const response = await callGhlApi(
      `/contacts?locationId=${getCleanLocationId()}&tags=${encodeURIComponent(tag)}&limit=100`,
      'GET'
    );
    
    if (response && response.contacts && Array.isArray(response.contacts)) {
      console.log(`GHL API: Found ${response.contacts.length} contacts with tag ${tag}`);
      return response.contacts;
    } else if (response && Array.isArray(response)) {
      console.log(`GHL API: Found ${response.length} contacts with tag ${tag}`);
      return response;
    }
    
    console.log(`GHL API: No contacts found with tag ${tag}`);
    return [];
  } catch (error: any) {
    console.error(`GHL API: Error fetching contacts by tag (${tag}):`, error);
    throw error;
  }
}

/**
 * Adds tags to a contact by their email address.
 * This is a convenience function that combines getContactByEmail and addTagsToContact.
 */
export async function addTagsToContactByEmail(email: string, tags: string[]): Promise<any> {
  if (!email || !tags || tags.length === 0) {
    throw new Error('Email and tags array are required.');
  }
  
  try {
    // First, find the contact by email
    const contact = await getContactByEmail(email);
    
    if (!contact || !contact.id) {
      throw new Error(`Contact with email ${email} not found`);
    }
    
    // Then add the tags to the found contact
    return await addTagsToContact(contact.id, tags);
  } catch (error) {
    console.error(`Error adding tags to contact with email ${email}:`, error);
    throw error;
  }
}

/**
 * Returns a hardcoded list of known custom fields for the HMNP application
 * This is used as a fallback when we can't fetch custom fields from the API
 */
export function getHardcodedCustomFields(): GhlCustomField[] {
  // These are the custom fields we know are used in the booking flow
  return [
    {
      id: 'cf_service_date',
      name: 'Service Date',
      key: 'cf_service_date',
      fieldKey: 'contact.cf_service_date',
      dataType: 'date',
      value: null,
      options: undefined
    },
    {
      id: 'cf_service_time',
      name: 'Service Time',
      key: 'cf_service_time',
      fieldKey: 'contact.cf_service_time',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'cf_service_address',
      name: 'Service Address',
      key: 'cf_service_address',
      fieldKey: 'contact.cf_service_address',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'cf_service_name',
      name: 'Service Name',
      key: 'cf_service_name',
      fieldKey: 'contact.cf_service_name',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'cf_service_price',
      name: 'Service Price',
      key: 'cf_service_price',
      fieldKey: 'contact.cf_service_price',
      dataType: 'number',
      value: null,
      options: undefined
    },
    {
      id: 'cf_booking_id',
      name: 'Booking ID',
      key: 'cf_booking_id',
      fieldKey: 'contact.cf_booking_id',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'cf_number_of_signatures',
      name: 'Number of Signatures',
      key: 'cf_number_of_signatures',
      fieldKey: 'contact.cf_number_of_signatures',
      dataType: 'number',
      value: null,
      options: undefined
    },
    {
      id: 'cf_document_type',
      name: 'Document Type',
      key: 'cf_document_type',
      fieldKey: 'contact.cf_document_type',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'cf_lead_source_detail',
      name: 'Lead Source Detail',
      key: 'cf_lead_source_detail',
      fieldKey: 'contact.cf_lead_source_detail',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'cf_consent_sms_communications',
      name: 'SMS Communications Consent',
      key: 'cf_consent_sms_communications',
      fieldKey: 'contact.cf_consent_sms_communications',
      dataType: 'boolean',
      value: null,
      options: undefined
    },
    {
      id: 'cf_consent_terms_conditions',
      name: 'Terms & Conditions Consent',
      key: 'cf_consent_terms_conditions',
      fieldKey: 'contact.cf_consent_terms_conditions',
      dataType: 'boolean',
      value: null,
      options: undefined
    },
    {
      id: 'cf_preferred_call_time',
      name: 'Preferred Call Time',
      key: 'cf_preferred_call_time',
      fieldKey: 'contact.cf_preferred_call_time',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'cf_call_request_notes',
      name: 'Call Request Notes',
      key: 'cf_call_request_notes',
      fieldKey: 'contact.cf_call_request_notes',
      dataType: 'text',
      value: null,
      options: undefined
    }
  ];
}

/**
 * Fetches custom fields for a given GHL location.
 *
 * This function attempts to retrieve custom fields from several known GHL API endpoints.
 * Due to inconsistencies and ongoing V1/V2 API transitions in GHL, multiple endpoints are tried.
 * If all API attempts fail (e.g., due to 404 errors or unexpected response formats),
 * it falls back to a hardcoded list of custom fields defined in `getHardcodedCustomFields()`.
 *
 * Caching:
 * - Results (both from successful API calls and fallbacks) are cached in memory.
 * - Cache TTL is defined by `CUSTOM_FIELDS_CACHE_TTL_MS` (currently 1 hour).
 * - Subsequent calls for the same `locationId` within the TTL will return cached data.
 *
 * @param locationId The GHL Location ID for which to fetch custom fields.
 * @returns A promise that resolves to an array of `GhlCustomField` objects.
 * @throws Error if `locationId` is not provided.
 */
export async function getLocationCustomFields(locationId: string): Promise<GhlCustomField[]> {
  // Check cache first
  const cachedEntry = customFieldsCache[locationId];
  if (cachedEntry && (Date.now() - cachedEntry.timestamp < CUSTOM_FIELDS_CACHE_TTL_MS)) {
    console.log(`[getLocationCustomFields] Returning cached custom fields for location ${locationId}`);
    return cachedEntry.fields;
  }

  if (!locationId) {
    throw new Error('Location ID is required to fetch custom fields.');
  }

  // Updated endpoints to use correct GHL v2 API format
  const endpointsToTry = [
    `/locations/${locationId}/customFields`,               // Primary v2 endpoint
    `/locations/${locationId}/custom-fields`,              // Alternative format
    `/objects/schema/contact?locationId=${locationId}`,    // Schema-based approach
    `/contacts/custom-fields?locationId=${locationId}`,    // Query parameter format
  ];

  let fieldsToReturn: GhlCustomField[] = [];

  for (const endpoint of endpointsToTry) {
    try {
      console.log(`[getLocationCustomFields] Attempting to fetch custom fields using endpoint: ${endpoint}`);
      const response = await callGhlApi<any>(endpoint, 'GET');
      let extractedFields: GhlCustomField[] = [];

      // Handle different response formats from GHL API
      if (response?.customFields && Array.isArray(response.customFields)) {
        extractedFields = response.customFields.map((field: any) => ({
          id: field.id,
          name: field.name,
          key: field.key,
          fieldKey: field.fieldKey || field.key || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.dataType || field.type,
          options: field.options,
          value: field.value || null,
        }));
      } else if (response?.fields && Array.isArray(response.fields)) {
        extractedFields = response.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          key: field.key,
          fieldKey: field.fieldKey || field.key || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.dataType || field.type,
          options: field.options,
          value: field.value || null,
        }));
      } else if (response?.data?.customFields && Array.isArray(response.data.customFields)) {
        extractedFields = response.data.customFields.map((field: any) => ({
          id: field.id,
          name: field.name,
          key: field.key,
          fieldKey: field.fieldKey || field.key || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.dataType || field.type,
          options: field.options,
          value: field.value || null,
        }));
      } else if (response?.data?.fields && Array.isArray(response.data.fields)) {
        extractedFields = response.data.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          key: field.key,
          fieldKey: field.fieldKey || field.key || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.dataType || field.type,
          options: field.options,
          value: field.value || null,
        }));
      } else if (Array.isArray(response)) {
        extractedFields = response.map((field: any) => ({
          id: field.id,
          name: field.name,
          key: field.key,
          fieldKey: field.fieldKey || field.key || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.dataType || field.type,
          options: field.options,
          value: field.value || null,
        }));
      }

      if (extractedFields.length > 0) {
        console.log(`[getLocationCustomFields] Successfully fetched ${extractedFields.length} custom fields from ${endpoint}`);
        fieldsToReturn = extractedFields;
        break; // Exit loop once fields are successfully fetched and processed
      }
      console.log(`[getLocationCustomFields] Endpoint ${endpoint} returned data but no recognizable fields format:`, JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(`[getLocationCustomFields] Error fetching custom fields from ${endpoint}:`, error);
      // Continue to next endpoint
    }
  }

  if (fieldsToReturn.length === 0) {
    console.warn(`[getLocationCustomFields] Failed to fetch custom fields from API for location ${locationId}, using hardcoded fallback.`);
    fieldsToReturn = getHardcodedCustomFields();
  }

  // Cache the result (either fetched or fallback)
  customFieldsCache[locationId] = {
    timestamp: Date.now(),
    fields: fieldsToReturn,
  };
  console.log(`[getLocationCustomFields] Cached ${fieldsToReturn.length} custom fields for location ${locationId}`);
  return fieldsToReturn;
}

/**
 * Convert an array of custom field objects to a key-value object format 
 * (used internally for easier handling in the application)
 * 
 * @param fieldsArray Array of custom field objects in GHL format {id, field_value}
 * @returns A key-value object where keys are field IDs and values are field values
 */
export function convertCustomFieldsArrayToObject(fieldsArray: { id: string, field_value: any }[]): Record<string, any> {
  return fieldsArray.reduce((acc, field) => {
    if (field.id && typeof field.field_value !== 'undefined') {
      acc[field.id] = field.field_value;
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Convert a key-value custom fields object back to the array format required by GHL API
 * 
 * @param customFieldsObject A key-value object where keys are field IDs and values are field values
 * @returns Array of custom field objects in GHL format {id, field_value}
 */
export function convertCustomFieldsObjectToArray(customFieldsObject: Record<string, any>): { id: string, field_value: any }[] {
  if (!customFieldsObject) return [];
  
  return Object.entries(customFieldsObject).map(([id, value]) => ({
    id,
    field_value: value
  }));
}

/**
 * Test the GHL connection with improved error handling and diagnostics
 */
export async function testGhlConnection(locationId: string): Promise<any> {
  console.log('🔧 Testing GHL API Connection with Enhanced Diagnostics...');
  
  try {
    // Test 1: Basic location lookup
    console.log('Test 1: Location Details');
    const locationData = await callGhlApi(`/locations/${locationId}`, 'GET');
    console.log('✅ Location found:', locationData?.name || 'Unknown');
    
    // Test 2: Contact search capability
    console.log('Test 2: Contact Search');
    const searchTest = await callGhlApi('/contacts/search', 'POST', {
      locationId: locationId,
      query: 'test@ghl-api-test.com',
      pageLimit: 1
    });
    console.log('✅ Contact search endpoint accessible');
    
    // Test 3: Custom fields access
    console.log('Test 3: Custom Fields');
    try {
      const customFields = await getLocationCustomFields(locationId);
      console.log(`✅ Custom fields accessible (${customFields.length} fields found)`);
    } catch (cfError) {
      console.warn('⚠️ Custom fields access issue:', cfError);
    }
    
    return {
      success: true,
      location: locationData,
      message: 'GHL API connection successful'
    };
    
  } catch (error) {
    console.error('❌ GHL Connection Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? getErrorMessage(error) : String(error),
      message: 'GHL API connection failed'
    };
  }
}

/**
 * Test function to get location details with enhanced error reporting
 */
export async function testGetLocationDetails(): Promise<any> {
  const locationId = getCleanLocationId();
  
  console.log('🔍 Getting GHL Location Details...');
  console.log('Location ID:', locationId.substring(0, 10) + '...');
  
  try {
    const response = await callGhlApi(`/locations/${locationId}`, 'GET');
    console.log('✅ Successfully retrieved location details');
    
    return {
      success: true,
      location: {
        id: response?.id,
        name: response?.name,
        timezone: response?.timezone,
        country: response?.country
      }
    };
  } catch (error) {
    console.error('❌ Failed to get location details:', error);
    throw error;
  }
}

// Add other GHL helper functions as needed (e.g., createOpportunity, getCalendars, etc.)
// ensuring they follow the pattern of not using Location-Id header and passing locationId in body/path as per GHL docs for PITs.

/**
 * Update a contact in GHL
 * This is a wrapper around upsertContact for backward compatibility
 */
export async function updateContact(contactData: GhlContact): Promise<any> {
  if (!contactData.id && !contactData.email) {
    throw new Error('Contact ID or email is required to update a contact');
  }

  try {
    // If we have an ID, update directly
    if (contactData.id) {
      const updateData = {
        locationId: contactData.locationId || process.env.GHL_LOCATION_ID,
        ...contactData
      };

      const response = await callGhlApi(`/contacts/${contactData.id}`, 'PUT', updateData);
      console.log(`GHL API: Updated contact ${contactData.id}`);
      return response;
    } else {
      // If we only have email, use upsertContact
      return await upsertContact(contactData);
    }
  } catch (error: any) {
    console.error(`GHL API: Error updating contact:`, error);
    throw error;
  }
}

/**
 * Update contact custom fields
 * Helper function to update only custom fields of a contact
 */
export async function updateContactCustomFields(contactId: string, customFields: Record<string, any>): Promise<any> {
  if (!contactId) {
    throw new Error('Contact ID is required to update custom fields');
  }

  try {
    const updateData = {
      locationId: process.env.GHL_LOCATION_ID,
      customField: customFields
    };

    const response = await callGhlApi(`/contacts/${contactId}`, 'PUT', updateData);
    console.log(`GHL API: Updated custom fields for contact ${contactId}`);
    return response;
  } catch (error: any) {
    console.error(`GHL API: Error updating contact custom fields:`, error);
    throw error;
  }
}

// Export the ghl object with commonly used methods
export const ghl = {
  createContact: async (contactData: any) => {
    return await upsertContact(contactData);
  },
  createAppointment: async (appointmentData: any) => {
    // Basic appointment creation using GHL API
    if (!appointmentData.locationId) {
      appointmentData.locationId = getCleanLocationId();
    }
    
    console.log('Creating GHL appointment:', appointmentData);
    
    try {
      const response = await callGhlApi('/calendars/events/appointments', 'POST', appointmentData);
      console.log('GHL appointment created successfully:', response?.id);
      return response;
    } catch (error: any) {
      console.error('Error creating GHL appointment:', error);
      throw new Error(`Failed to create appointment: ${getErrorMessage(error)}`);
    }
  }
};
