#!/usr/bin/env node

/**
 * GHL API v2 (Private Integrations) Utilities
 * Shared functions for interacting with GoHighLevel API v2
 */

import 'dotenv/config';

// Configuration & Environment Variables
const GHL_API_V2_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_COMPANY_ID = process.env.GHL_COMPANY_ID;

/**
 * Validates required environment variables for GHL v2 API
 * @returns {boolean} True if validation passes, false otherwise
 */
export function validateEnvVariables() {
  const missing = [];
  
  if (!GHL_API_KEY) missing.push('GHL_API_KEY');
  if (!GHL_LOCATION_ID) missing.push('GHL_LOCATION_ID');
  // Company ID is now optional
  // if (!GHL_COMPANY_ID) missing.push('GHL_COMPANY_ID');
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(variable => console.error(`- ${variable}`));
    return false;
  }
  
  return true;
}

/**
 * Creates v2 headers for GHL API requests
 * @returns {Object} Headers object
 */
export function createGhlV2Headers() {
  // Use the API version from environment or fall back to the one in the PDF
  const apiVersion = process.env.GHL_API_VERSION || '2021-07-28';
  
  return {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': apiVersion,
    'Content-Type': 'application/json'
  };
}

/**
 * Makes a request to the GHL v2 API
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
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
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
 * Get pipelines for a location
 * @returns {Promise<Array>} List of pipelines
 */
export async function getLocationPipelines() {
  return makeGhlV2Request(`/opportunities/pipelines`);
}

/**
 * Create a pipeline for a location
 * @param {Object} pipelineData - Pipeline data
 * @returns {Promise<Object>} Created pipeline
 */
export async function createLocationPipeline(pipelineData) {
  return makeGhlV2Request(`/opportunities/pipelines`, 'POST', pipelineData);
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
