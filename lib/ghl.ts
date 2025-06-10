// /lib/ghl.ts

// Cache for custom fields
interface CustomFieldsCacheEntry {
  timestamp: number;
  fields: GhlCustomField[];
}
const customFieldsCache: Record<string, CustomFieldsCacheEntry> = {};
const CUSTOM_FIELDS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

/**
 * GHL API Helper Utility (V2 - Private Integration Token Focused)
 *
 * This module provides functions to interact with the GoHighLevel (GHL) API using Private Integration Tokens.
 * It handles API authentication, request formation, and basic error handling.
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
  const apiKey = process.env.GHL_API_KEY;
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

  if (!apiKey) {
    console.error('GHL_API_KEY (Private Integration Token) environment variable is not set');
    throw new Error('GHL_API_KEY (Private Integration Token) environment variable is not set');
  }
  return { apiKey, baseUrl };
};

async function callGhlApi<T = any>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<T | null> {
  const { apiKey, baseUrl } = getGhlApiConfig();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Authorization': `Bearer ${apiKey}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GHL API Error (${response.status}) on ${method} ${url}: ${errorText}`);
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
    // Use the search endpoint instead of the contacts endpoint
    // Based on GHL API v2 documentation and community feedback
    // The search requires pageLimit and takes email directly as query
    const response = await callGhlApi(`/contacts/search`, 'POST', {
      locationId: process.env.GHL_LOCATION_ID,
      query: email.toLowerCase().trim(),
      pageLimit: 10
    });

    let foundContact: GhlContact | null = null;

    if (response && response.contacts && Array.isArray(response.contacts)) {
      // Case 1: Response is { meta: {...}, contacts: [...] }
      foundContact = response.contacts.find(
        (contact: GhlContact) => contact.email?.toLowerCase() === email.toLowerCase()
      ) || null;
    } else if (response && Array.isArray(response) && response.length > 0 && response[0].id) {
      // Case 2: Response is an array of contacts directly, e.g. [{...}, {...}]
      // This is common if the API returns a list for a query
      foundContact = response.find(
        (contact: GhlContact) => contact.email?.toLowerCase() === email.toLowerCase()
      ) || null;
    } else if (response && response.id && response.email) {
      // Case 3: Response is a single contact object directly (e.g., if email is a unique lookup and API returns single object)
      if (response.email.toLowerCase() === email.toLowerCase()) {
        foundContact = response;
      }
    } else if (response && Array.isArray(response) && response.length === 0) {
      // Case 4: Response is an empty array, meaning no contact found
      foundContact = null;
    } else if (response && response.contacts && Array.isArray(response.contacts) && response.contacts.length === 0) {
      // Case 5: Response is { contacts: [] }, meaning no contact found
      foundContact = null;
    }

    if (foundContact) {
      console.log(`GHL API: Found contact by email ${email}: ID ${foundContact.id}`);
    } else {
      console.log(`GHL API: No contact found for email ${email} after parsing response.`);
    }
    return foundContact;

  } catch (error: any) {
    const errorMessage = error.message || String(error);
    
    // Enhanced 403 error handling
    if (errorMessage.includes('403') || errorMessage.includes('does not have access to this location')) {
      console.error(`GHL API 403 Error for email lookup (${email}):`);
      console.error('  - This suggests a location access permission issue');
      console.error('  - The API token may not have access to the configured location');
      console.error('  - Consider running: node scripts/debug-ghl-403.js');
      
      // For 403 errors during contact lookup for new client check, return null
      // This allows the booking to continue without the first-time discount
      console.warn('  - Treating as "contact not found" to allow booking to continue');
      return null;
    }
    
    if (error.response?.status === 404) {
      console.log(`GHL API: Contact with email ${email} not found (received 404).`);
      return null; // Explicitly return null on 404
    }
    
    // Log the error structure for other types of errors for better debugging
    console.error(`GHL API: Error fetching contact by email (${email}). Status: ${error.response?.status}, Data:`, error.response?.data || error.message, error.stack);
    throw error; // Re-throw other errors to be handled by the caller
  }
}

/**
 * Creates or updates a contact in GoHighLevel.
 *
 * This function handles the upsert logic for GHL contacts. Key considerations:
 * - `locationId` is required in the `contactData` payload for Private Integration Token (PIT) based API calls.
 * - Custom fields should be provided in the `contactData.customField` property as a key-value object
 *   (e.g., `{ "field_id_1": "value1", "field_id_2": "value2" }`).
 * - This function internally converts the `customField` object into the array format
 *   `[{ id: "field_id_1", field_value: "value1" }, ...]` required by the GHL API,
 *   using the `convertCustomFieldsObjectToArray` utility.
 * - If the GHL API expects `customFields` (plural) in the payload, this function adapts.
 *
 * @param contactData The contact data to upsert. Must include `locationId` and can include `customField` as an object.
 * @returns A promise that resolves with the GHL API response (typically the created/updated contact object).
 * @throws Error if `locationId` is missing or if the API call fails.
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
    // GHL requires an array of { id: string, field_value: any } objects
    let customFieldsArray: { id: string, field_value: any }[] = [];
    
    if (customField) {
      // Use our utility function to convert the object to an array
      customFieldsArray = convertCustomFieldsObjectToArray(customField);
    }
    
    // Create the final payload with proper GHL API format
    const payload = {
      ...contactDataWithoutCustomField,
      customFields: customFieldsArray
    };
    
    console.log('[upsertContact] Using payload format with', customFieldsArray.length, 'custom fields');
    
    // The /contacts/upsert endpoint expects locationId in the body with PITs
    const response = await callGhlApi('/contacts/upsert', 'POST', payload);
    return response.contact || response; 
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('customFields must be an array')) {
      console.error('Error upserting contact: customFields must be an array format. Check our formatting logic.');
    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
      console.error('Error upserting contact: Unauthorized. Check your GHL_API_KEY permissions.');
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
 * Returns a hardcoded list of known custom fields for the HMNP application
 * This is used as a fallback when we can't fetch custom fields from the API
 */
export function getHardcodedCustomFields(): GhlCustomField[] {
  // These are the custom fields we know are used in the booking flow
  return [
    {
      id: 'service_date',
      name: 'Service Date',
      fieldKey: 'contact.cf_service_date',
      dataType: 'date',
      value: null,
      options: undefined
    },
    {
      id: 'service_time',
      name: 'Service Time',
      fieldKey: 'contact.cf_service_time',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'service_address',
      name: 'Service Address',
      fieldKey: 'contact.cf_service_address',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'service_name',
      name: 'Service Name',
      fieldKey: 'contact.cf_service_name',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'service_price',
      name: 'Service Price',
      fieldKey: 'contact.cf_service_price',
      dataType: 'number',
      value: null,
      options: undefined
    },
    {
      id: 'booking_id',
      name: 'Booking ID',
      fieldKey: 'contact.cf_booking_id',
      dataType: 'text',
      value: null,
      options: undefined
    },
    {
      id: 'number_of_signatures',
      name: 'Number of Signatures',
      fieldKey: 'contact.cf_number_of_signatures',
      dataType: 'number',
      value: null,
      options: undefined
    },
    {
      id: 'document_type',
      name: 'Document Type',
      fieldKey: 'contact.cf_document_type',
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

  const endpointsToTry = [
    `/objects/schema/contact?locationId=${locationId}`, // v2 API schema-based approach
    `/contacts/custom-fields?locationId=${locationId}`,  // Alternative location-specific format
    `/locations/${locationId}/custom-fields`,            // Original endpoint format
  ];

  let fieldsToReturn: GhlCustomField[] = [];

  for (const endpoint of endpointsToTry) {
    try {
      console.log(`[getLocationCustomFields] Attempting to fetch custom fields using endpoint: ${endpoint}`);
      const response = await callGhlApi<any>(endpoint, 'GET');
      let extractedFields: GhlCustomField[] = [];

      if (response?.customFields && Array.isArray(response.customFields)) {
        extractedFields = response.customFields;
      } else if (response?.fields && Array.isArray(response.fields)) {
        extractedFields = response.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          fieldKey: field.key || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.type,
          options: field.options,
          value: null,
        }));
      } else if (response?.data?.fields && Array.isArray(response.data.fields)) {
        extractedFields = response.data.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          fieldKey: field.key || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.type,
          options: field.options,
          value: null,
        }));
      } else if (Array.isArray(response)) {
        extractedFields = response.map((field: any) => ({
          id: field.id,
          name: field.name,
          fieldKey: field.key || field.fieldKey || `contact.cf_${field.name?.toLowerCase().replace(/\s+/g, '_')}`,
          dataType: field.type || field.dataType,
          options: field.options,
          value: field.value || null,
        }));
      }

      if (extractedFields.length > 0) {
        console.log(`[getLocationCustomFields] Successfully fetched and processed custom fields from ${endpoint}`);
        fieldsToReturn = extractedFields;
        break; // Exit loop once fields are successfully fetched and processed
      }
      console.log(`[getLocationCustomFields] Endpoint ${endpoint} returned data but no recognizable fields format:`, response);
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
  console.log(`[getLocationCustomFields] Cached custom fields for location ${locationId}`);
  return fieldsToReturn;
}

// End of new getLocationCustomFields function. Old content remnants removed.

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

export async function testGhlConnection(locationId: string): Promise<any> {
  if (!locationId) {
    throw new Error('Location ID is required to test GHL connection.');
  }
  console.log(`[testGhlConnection] Testing GHL API connection for location: ${locationId}...`);
  try {
    // Fetch location details as a simple test call
    const responseData = await callGhlApi(`/locations/${locationId}`, 'GET');
    console.log('[testGhlConnection] Successfully fetched location details:', responseData?.location || responseData);
    return responseData?.location || responseData;
  } catch (error) {
    console.error('[testGhlConnection] Error testing GHL connection:', error);
    throw error;
  }
}

/**
 * Test function to get location details for API testing
 * This is used by the /api/test-ghl endpoint
 */
export async function testGetLocationDetails(): Promise<any> {
  const ghlLocationId = process.env.GHL_LOCATION_ID;
  if (!ghlLocationId) {
    throw new Error('GHL_LOCATION_ID environment variable is not set');
  }
  return testGhlConnection(ghlLocationId);
}

// Add other GHL helper functions as needed (e.g., createOpportunity, getCalendars, etc.)
// ensuring they follow the pattern of not using Location-Id header and passing locationId in body/path as per GHL docs for PITs.
