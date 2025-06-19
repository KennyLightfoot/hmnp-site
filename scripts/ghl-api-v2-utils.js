#!/usr/bin/env node

/**
 * GHL API v2 (Private Integrations) Utilities
 * Shared functions for interacting with GoHighLevel API v2
 * 
 * Updated with latest API v2 configuration based on official documentation
 * API v2 Docs: https://highlevel.stoplight.io/docs/integrations/
 */

import 'dotenv/config';

// Configuration & Environment Variables
// Using the latest API v2 base URL from official documentation
const GHL_API_V2_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
// const GHL_COMPANY_ID = process.env.GHL_COMPANY_ID; // Currently unused

/**
 * Validates required environment variables for GHL v2 API
 * @returns {boolean} True if validation passes, false otherwise
 */
export function validateEnvVariables() {
  const missing = [];
  
  if (!GHL_API_KEY) missing.push('GHL_API_KEY');
  if (!GHL_LOCATION_ID) missing.push('GHL_LOCATION_ID');
  // Company ID is optional for most operations
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(variable => console.error(`- ${variable}`));
    console.error('\nTo use Private Integrations:');
    console.error('1. Go to Settings > Private Integrations in your GHL account');
    console.error('2. Create a new integration with required permissions');
    console.error('3. Copy the token to your .env file as GHL_API_KEY');
    return false;
  }
  
  return true;
}

/**
 * Creates v2 headers for GHL API requests
 * @returns {Object} Headers object
 */
export function createGhlV2Headers() {
  // Using the latest API version from official documentation
  // Version 2021-07-28 is the most stable and widely supported
  const apiVersion = process.env.GHL_API_VERSION || '2021-07-28';
  
  return {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': apiVersion,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

/**
 * Makes a request to the GHL v2 API with proper error handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} [body] - Request body for POST/PUT requests
 * @returns {Promise<Object>} API response
 */
export async function makeGhlV2Request(endpoint, method = 'GET', body = null) {
  const url = `${GHL_API_V2_BASE_URL}${endpoint}`;
  const headers = createGhlV2Headers();
  
  const options = {
    method,
    headers
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Check rate limit headers
    const rateLimitHeaders = {
      dailyLimit: response.headers.get('X-RateLimit-Limit-Daily'),
      dailyRemaining: response.headers.get('X-RateLimit-Daily-Remaining'),
      burstLimit: response.headers.get('X-RateLimit-Max'),
      burstRemaining: response.headers.get('X-RateLimit-Remaining')
    };
    
    // Log rate limit info if running low
    if (rateLimitHeaders.dailyRemaining && parseInt(rateLimitHeaders.dailyRemaining) < 1000) {
      console.warn(`⚠️  Low daily API limit: ${rateLimitHeaders.dailyRemaining} remaining`);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error (${response.status}): ${errorText}`;
      
      // Provide helpful error messages based on status code
      if (response.status === 401) {
        errorMessage += '\n\nAuthentication failed. Please check your Private Integration token.';
      } else if (response.status === 403) {
        errorMessage += '\n\nPermission denied. Ensure your Private Integration has the required scopes.';
      } else if (response.status === 404) {
        errorMessage += '\n\nEndpoint not found. This endpoint may not be available in API v2 yet.';
      } else if (response.status === 429) {
        errorMessage += '\n\nRate limit exceeded. Please wait before making more requests.';
      }
      
      throw new Error(errorMessage);
    }
    
    // Some endpoints might not return JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return { success: true, text: await response.text() };
    }
  } catch (error) {
    console.error(`Error making request to ${url}:`, error.message);
    throw error;
  }
}

/**
 * Get company locations using GHL v2 API
 * @returns {Promise<Array>} List of locations
 */
export async function getCompanyLocations() {
  // Use a different endpoint that doesn't require company ID
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}`).then(location => {
    // Mock the expected response structure with just the current location
    return { 
      locations: location ? [location] : [],
      success: !!location
    };
  });
}

/**
 * Get custom fields for a location
 * @returns {Promise<Array>} List of custom fields
 */
export async function getLocationCustomFields() {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/customFields`);
}

/**
 * Create a custom field for a location
 * @param {Object} fieldData - Custom field data
 * @returns {Promise<Object>} Created custom field
 */
export async function createLocationCustomField(fieldData) {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/customFields`, 'POST', fieldData);
}

/**
 * Get tags for a location
 * @returns {Promise<Array>} List of tags
 */
export async function getLocationTags() {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/tags`);
}

/**
 * Create a tag for a location
 * @param {string} tagName - Tag name
 * @returns {Promise<Object>} Created tag
 */
export async function createLocationTag(tagName) {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/tags`, 'POST', { name: tagName });
}

/**
 * Delete a custom field for a location
 * @param {string} fieldId - Custom field ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteLocationCustomField(fieldId) {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/customFields/${fieldId}`, 'DELETE');
}

/**
 * Delete a tag for a location
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteLocationTag(tagId) {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/tags/${tagId}`, 'DELETE');
}

/**
 * Get opportunities/pipelines for a location (updated endpoint)
 * @returns {Promise<Array>} List of pipelines
 */
export async function getLocationPipelines() {
  // Updated to use the correct v2 endpoint
  return makeGhlV2Request(`/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`);
}

/**
 * Create a pipeline for a location (updated endpoint)
 * @param {Object} pipelineData - Pipeline data
 * @returns {Promise<Object>} Created pipeline
 */
export async function createLocationPipeline(pipelineData) {
  // Ensure locationId is included in the pipeline data
  const dataWithLocation = {
    ...pipelineData,
    locationId: GHL_LOCATION_ID
  };
  return makeGhlV2Request(`/opportunities/pipelines`, 'POST', dataWithLocation);
}

/**
 * Get webhooks for a location
 * @returns {Promise<Array>} List of webhooks
 */
export async function getLocationWebhooks() {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/webhooks`);
}

/**
 * Create a webhook for a location
 * @param {Object} webhookData - Webhook data
 * @returns {Promise<Object>} Created webhook
 */
export async function createLocationWebhook(webhookData) {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/webhooks`, 'POST', webhookData);
}

/**
 * Get contacts for a location
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Contacts response
 */
export async function getLocationContacts(params = { limit: 10 }) {
  const queryParams = new URLSearchParams(params).toString();
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}/contacts?${queryParams}`);
}

/**
 * Get location details (updated endpoint)
 * @returns {Promise<Object>} Location details
 */
export async function getLocationDetails() {
  return makeGhlV2Request(`/locations/${GHL_LOCATION_ID}`);
}

/**
 * Helper to print a colorful success message
 * @param {string} message - Message to print
 */
export function printSuccess(message) {
  console.log(`✅ ${message}`);
}

/**
 * Helper to print a colorful error message
 * @param {string} message - Message to print
 */
export function printError(message) {
  console.log(`❌ ${message}`);
}

/**
 * Helper to print a colorful info message
 * @param {string} message - Message to print
 */
export function printInfo(message) {
  console.log(`ℹ️ ${message}`);
}

/**
 * Create a contact (new helper function)
 * @param {Object} contactData - Contact data
 * @returns {Promise<Object>} Created contact
 */
export async function createContact(contactData) {
  const dataWithLocation = {
    ...contactData,
    locationId: GHL_LOCATION_ID
  };
  return makeGhlV2Request('/contacts', 'POST', dataWithLocation);
}

/**
 * Get workflows for a location (new helper function)
 * @returns {Promise<Array>} List of workflows
 */
export async function getLocationWorkflows() {
  return makeGhlV2Request(`/workflows?locationId=${GHL_LOCATION_ID}`);
}

/**
 * Get conversations for a location (new helper function)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Conversations response
 */
export async function getLocationConversations(params = {}) {
  const queryParams = new URLSearchParams({
    locationId: GHL_LOCATION_ID,
    ...params
  }).toString();
  return makeGhlV2Request(`/conversations?${queryParams}`);
}
