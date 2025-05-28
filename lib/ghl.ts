// /lib/ghl.ts

/**
 * GHL API Helper Utility
 * 
 * This module provides functions to interact with the GoHighLevel (GHL) API.
 * It handles API authentication, request formation, and basic error handling.
 *
 * Ensure the following environment variables are set in your .env.local or environment:
 * GHL_API_KEY=your_ghl_api_key
 * GHL_API_BASE_URL=https://services.leadconnectorhq.com (or your specific GHL API base URL)
 */

export interface GhlCustomField {
  id: string; // Custom field ID in GHL
  key?: string; // The {{contact.custom_field_key}} in GHL, useful for lookup
  value: string | number | boolean | string[];
}

export interface GhlContact {
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
  customFields?: GhlCustomField[];
  dnd?: boolean; // Do Not Disturb
  source?: string;
  companyName?: string;
  // Add other GHL contact fields as needed
}

interface GhlApiConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * Retrieves GHL API configuration from environment variables.
 * @returns {GhlApiConfig} The GHL API key and base URL.
 * @throws {Error} If GHL_API_KEY or GHL_API_BASE_URL are not set.
 */
const getGhlApiConfig = (): GhlApiConfig => {
  const apiKey = process.env.GHL_API_KEY;
  const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

  if (!apiKey) {
    console.error('GHL_API_KEY is not set in environment variables.');
    throw new Error('GHL_API_KEY is not set.');
  }
  return { apiKey, baseUrl };
};

/**
 * Generic helper function to make authenticated calls to the GHL API.
 * @param endpoint The API endpoint (e.g., '/contacts/').
 * @param method The HTTP method (e.g., 'GET', 'POST', 'PUT').
 * @param body The request body for POST/PUT requests.
 * @returns {Promise<any>} The JSON response from the API.
 * @throws {Error} If the API call fails.
 */
async function callGhlApi(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<any> {
  const { apiKey, baseUrl } = getGhlApiConfig();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.text(); // Try to get more error details
      console.error(`GHL API Error (${response.status}) on ${method} ${url}: ${errorData}`);
      throw new Error(`GHL API request failed with status ${response.status}: ${errorData}`);
    }

    // For 204 No Content, return null or a specific success indicator
    if (response.status === 204) {
      return null; 
    }

    return await response.json();
  } catch (error) {
    console.error(`Error during GHL API call to ${method} ${url}:`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Retrieves a contact by their email address.
 * @param {string} email The email address of the contact to find.
 * @returns {Promise<GhlContact | null>} The contact object if found, otherwise null.
 */
export async function getContactByEmail(email: string): Promise<any | null> {
  try {
    const { apiKey, baseUrl } = getGhlApiConfig();
    const response = await fetch(`${baseUrl}/contacts/search?query=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Contact not found
      }
      throw new Error(`GHL API request failed with status ${response.status}`);
    }

    const data = await response.json();
    // Return the first contact that matches the email exactly
    const contacts = data.contacts || [];
    return contacts.find((contact: any) => contact.email === email) || null;
  } catch (error) {
    console.error(`Error fetching contact by email (${email}):`, error);
    return null;
  }
}

/**
 * Creates or updates a contact in GHL.
 * If a contact with the given email exists, it will be updated.
 * Otherwise, a new contact will be created.
 * @param {GhlContact} contactData The contact data.
 * @returns {Promise<any>} The created or updated contact object from GHL.
 */
export async function upsertContact(contactData: GhlContact): Promise<any> {
  if (!contactData.email && !contactData.phone) {
    throw new Error('Either email or phone is required to upsert a contact.');
  }

  // GHL's primary /contacts/upsert endpoint handles this logic.
  try {
    const response = await callGhlApi('/contacts/upsert', 'POST', contactData);
    return response.contact || response; // Response structure might vary
  } catch (error) {
    console.error('Error upserting contact:', error);
    throw error;
  }
}

/**
 * Adds one or more tags to a contact in GHL.
 * @param {string} contactId The GHL ID of the contact.
 * @param {string[]} tags An array of tag names to add.
 * @returns {Promise<any>} The response from GHL API.
 */
export async function addTagsToContact(contactId: string, tags: string[]): Promise<any> {
  if (!contactId) {
    throw new Error('Contact ID is required to add tags.');
  }
  if (!tags || tags.length === 0) {
    throw new Error('Tags array cannot be empty.');
  }

  try {
    const { apiKey, baseUrl } = getGhlApiConfig();
    const response = await fetch(`${baseUrl}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ tags })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to add tags to contact: ${errorData}`);
    }

    console.log(`Successfully added tags to contact ${contactId}:`, tags);
    return await response.json();
  } catch (error) {
    console.error(`Error adding tags to contact ${contactId}:`, error);
    throw error;
  }
}

/**
 * Removes one or more tags from a contact in GHL.
 * @param {string} contactId The GHL ID of the contact.
 * @param {string[]} tags An array of tag names to remove.
 * @returns {Promise<any>} The response from GHL API.
 */
export async function removeTagsFromContact(contactId: string, tags: string[]): Promise<any> {
    if (!contactId) {
        throw new Error('Contact ID is required to remove tags.');
    }
    if (!tags || tags.length === 0) {
        throw new Error('Tags array cannot be empty.');
    }

    // GHL API to remove tags: DELETE /contacts/{contactId}/tags
    // Body: { "tags": ["tag1", "tag2"] }
    try {
        const response = await callGhlApi(`/contacts/${contactId}/tags`, 'DELETE', { tags });
        return response;
    } catch (error) {
        console.error(`Error removing tags from contact ${contactId}:`, error);
        throw error;
    }
}

/**
 * Retrieves a contact by their GHL ID.
 * @param {string} contactId The GHL ID of the contact.
 * @returns {Promise<any | null>} The contact object if found, otherwise null.
 */
export async function getContactById(contactId: string): Promise<any | null> {
  if (!contactId) {
    throw new Error('Contact ID is required to get a contact.');
  }
  try {
    // GHL API: GET /contacts/{contactId}
    const response = await callGhlApi(`/contacts/${contactId}`, 'GET');
    // Response structure for GET /contacts/{contactId} is typically { "contact": { ... } }
    // or sometimes just the contact object directly.
    return response.contact || response; 
  } catch (error: any) {
    // Check if the error message indicates that the contact was not found.
    if (error.message.includes('404') || 
        error.message.toLowerCase().includes('no contact found') || 
        error.message.toLowerCase().includes('could not be found') ||
        error.message.toLowerCase().includes('contact not found')) {
      return null; // Contact not found is a valid case, not an error for this function.
    }
    console.error(`Error fetching contact by ID ${contactId}:`, error);
    throw error; // Re-throw other errors
  }
}

/**
 * Updates a custom field for a specific contact.
 * Note: GHL's primary way to update custom fields is via contact upsert.
 * This function demonstrates updating a single custom field if a dedicated endpoint exists or is preferred.
 * Typically, you'd include customFields in the upsertContact payload.
 * @param {string} contactId The GHL ID of the contact.
 * @param {GhlCustomField} customField The custom field to update (ID and new value).
 * @returns {Promise<any>} The updated contact object or GHL API response.
 */
export async function updateContactCustomField(contactId: string, customField: GhlCustomField): Promise<any> {
  if (!contactId) {
    throw new Error('Contact ID is required to update a custom field.');
  }
  if (!customField || !customField.id || customField.value === undefined) {
    throw new Error('Custom field ID and value are required.');
  }

  // GHL API: PUT /contacts/{contactId}/customFields/{customFieldId} - This endpoint might not exist as such.
  // More commonly, custom fields are updated by PUT /contacts/{contactId} with the full contact payload
  // or via /contacts/upsert. This is a conceptual function.
  // We will use the upsert approach with the specific custom field.
  const payload = {
    customFields: [customField],
  };

  // This will update the contact with only the specified custom field. 
  // Be cautious as this might overwrite other fields if not handled carefully by GHL's PUT /contacts/{id} logic.
  // It's often safer to fetch the contact, merge changes, then PUT, or use upsert.
  // For simplicity here, we'll call PUT on the contact with just the custom field, assuming GHL merges.
  // A more robust way is to use upsertContact with the email/phone and the new custom field value.
  try {
    // Let's try updating via PUT to /contacts/{contactId}
    // This usually expects the full contact object. Sending only customFields might clear other fields.
    // The safest is to get the contact's email/phone and use upsertContact.
    // For now, this function illustrates the concept; direct use of upsertContact is recommended for field updates.
    
    // Alternative: Use upsertContact after finding the contact's email/phone if only ID is known.
    // This function assumes you might want to update a field for a known contactId directly.
    // However, GHL's /contacts/{id} PUT endpoint expects a more complete contact object.
    // The /contacts/upsert is generally preferred for this.
    
    // For a targeted update if contactId is known, but email/phone isn't readily available:
    // 1. GET /contacts/{contactId} to fetch existing data (if not too heavy)
    // 2. Merge customField into the existing data
    // 3. PUT /contacts/{contactId} with merged data

    // Simpler (and often better): if you have a unique identifier like email or phone, use upsertContact:
    // const contactToUpdate = await getContactById(contactId); // Assuming getContactById exists
    // if (contactToUpdate && contactToUpdate.email) {
    //   return upsertContact({ email: contactToUpdate.email, customFields: [customField] });
    // }
    // throw new Error('Contact email not found for targeted custom field update.');

    // Given the constraints and typical GHL patterns, directly using upsertContact by providing
    // an identifier (like email) and the new customFields array is the most reliable way.
    // This function is more illustrative of a *potential* direct update.
    console.warn('updateContactCustomField is illustrative. For robust updates, use upsertContact with contact identifiers (email/phone) and new custom field values.');
    const response = await callGhlApi(`/contacts/${contactId}`, 'PUT', { customFields: [customField] });
    return response.contact || response;
  } catch (error) {
    console.error(`Error updating custom field ${customField.id} for contact ${contactId}:`, error);
    throw error;
  }
}

/**
 * Fetches all custom fields available in the GHL location.
 * @returns {Promise<GhlCustomField[]>} A list of custom fields.
 */
export async function getLocationCustomFields(): Promise<GhlCustomField[]> {
    try {
        const response = await callGhlApi('/custom-fields', 'GET');
        return response.customFields || [];
    } catch (error) {
        console.error('Error fetching location custom fields:', error);
        throw error;
    }
}

/**
 * Fetches all tags available in the GHL location.
 * @returns {Promise<{tags: string[]}[]>} A list of tags. GHL returns { tags: ["tag1", "tag2", ...] }
 */
export async function getLocationTags(): Promise<string[]> {
    try {
        const response = await callGhlApi('/tags', 'GET');
        // The response is typically an object like { tags: [...] }
        return response.tags || []; 
    } catch (error) {
        console.error('Error fetching location tags:', error);
        throw error;
    }
}

/**
 * Retrieves contacts by a specific tag.
 * @param {string} tag The tag to search for.
 * @returns {Promise<any[]>} Array of contacts with the specified tag.
 */
export async function getContactsByTag(tag: string): Promise<any[]> {
  try {
    const { apiKey, baseUrl } = getGhlApiConfig();
    const response = await fetch(`${baseUrl}/contacts?tags=${encodeURIComponent(tag)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GHL API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error(`Error fetching contacts by tag (${tag}):`, error);
    return [];
  }
}

/**
 * Add tags to a contact by email address
 * @param email The contact's email address
 * @param tags Array of tags to add
 */
export async function addTagsToContactByEmail(email: string, tags: string[]): Promise<void> {
  try {
    const contact = await getContactByEmail(email);
    if (!contact || !contact.id) {
      console.warn(`Contact not found for email: ${email}`);
      return;
    }
    
    await addTagsToContact(contact.id, tags);
  } catch (error) {
    console.error(`Error adding tags to contact by email ${email}:`, error);
    throw error;
  }
}

// Add this new interface for Opportunity Data
export interface GhlOpportunity {
  name: string;
  pipelineId: string;
  stageId: string; // GHL refers to this as 'pipelineStageId' in some contexts but often just 'stageId' in API
  status: 'open' | 'won' | 'lost' | 'abandoned';
  contactId?: string; // Link to an existing contact
  monetaryValue?: number;
  assignedTo?: string; // User ID to assign opportunity to
  source?: string; // Lead source for the opportunity
  // You can add other opportunity-specific custom fields here if needed,
  // though they are less common than on contacts.
}

/**
 * Creates an opportunity in GHL.
 * @param {GhlOpportunity} opportunityData The data for the new opportunity.
 * @returns {Promise<any>} The created opportunity object from GHL.
 */
export async function createOpportunity(opportunityData: GhlOpportunity): Promise<any> {
  if (!opportunityData.name || !opportunityData.pipelineId || !opportunityData.stageId) {
    throw new Error('Opportunity name, pipelineId, and stageId are required.');
  }
  if (!opportunityData.contactId && opportunityData.status === 'open') {
      // While GHL API might allow creating an opportunity without a contactId initially,
      // it is highly recommended to associate it with a contact for it to be useful.
      // Depending on your GHL version, contactId might be implicitly required for certain operations.
      console.warn('Creating an open opportunity without a contactId. Ensure this is intended.');
  }

  try {
    // The endpoint for creating opportunities is typically POST /opportunities/
    // GHL may require locationId in the opportunity payload for some API versions or setups.
    // Check GHL API documentation if direct creation under /opportunities/ fails.
    // If so, you might need to ensure your callGhlApi or the opportunityData includes locationId.
    // For now, assuming location context is handled by API key or GHL automatically.
    
    const response = await callGhlApi('/opportunities/', 'POST', opportunityData);
    return response.opportunity || response; // Response structure might vary
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
}

// Example Usage (comment out or remove in production code):
/*
async function testGhlFunctions() {
  try {
    // Make sure GHL_API_KEY and GHL_API_BASE_URL are in your .env.local
    // console.log('Testing GHL functions...');

    // Test getting location custom fields
    // const customFields = await getLocationCustomFields();
    // console.log('Location Custom Fields:', customFields.slice(0, 5)); // Log first 5

    // Test getting location tags
    // const tagsList = await getLocationTags();
    // console.log('Location Tags:', tagsList.slice(0, 5)); // Log first 5

    // Test upserting a contact
    const newContact: GhlContact = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser-${Date.now()}@example.com`,
      phone: '+11234567890',
      tags: ['sdk_test', 'new_lead'],
      customFields: [
        // Replace with actual custom field IDs from your GHL account if testing custom fields
        // { id: 'YOUR_CUSTOM_FIELD_ID_1', value: 'Custom Value 1' },
        // { id: 'YOUR_CUSTOM_FIELD_ID_2', value: 12345 },
      ],
      source: 'Website Test Form',
    };
    // const upsertedContact = await upsertContact(newContact);
    // console.log('Upserted Contact:', upsertedContact);

    // if (upsertedContact && upsertedContact.id) {
      // const contactId = upsertedContact.id;
      
      // Test getting contact by email
      // const fetchedContact = await getContactByEmail(newContact.email!);
      // console.log('Fetched Contact by Email:', fetchedContact);

      // Test adding tags
      // await addTagsToContact(contactId, ['additional_tag', 'priority_customer']);
      // console.log('Added tags. Verify in GHL.');

      // Test removing tags
      // await removeTagsFromContact(contactId, ['sdk_test']);
      // console.log('Removed tags. Verify in GHL.');

      // Test updating a custom field (using upsert is safer as discussed)
      // if (newContact.customFields && newContact.customFields.length > 0 && newContact.customFields[0].id) {
      //   await updateContactCustomField(contactId, { id: newContact.customFields[0].id, value: 'Updated Custom Value' });
      //   console.log('Updated custom field. Verify in GHL.');
      // }
    // }

  } catch (error) {
    console.error('Error in testGhlFunctions:', error);
  }
}

// testGhlFunctions(); // Uncomment to run test functions locally
*/
