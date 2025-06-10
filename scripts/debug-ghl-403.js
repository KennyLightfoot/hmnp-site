#!/usr/bin/env node

/**
 * GHL 403 Error Diagnostic Script
 * 
 * This script helps diagnose the "403 - token does not have access to this location" error
 * by testing various GHL API endpoints and validating the configuration.
 */

import { config } from 'dotenv';
config();

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

console.log('🔍 GHL 403 Error Diagnostic Tool');
console.log('================================');

// Step 1: Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`  GHL_API_KEY: ${GHL_API_KEY ? (GHL_API_KEY.startsWith('pit-') ? '✅ Set (PIT format)' : '⚠️  Set (Non-PIT format)') : '❌ Missing'}`);
console.log(`  GHL_LOCATION_ID: ${GHL_LOCATION_ID || '❌ Missing'}`);
console.log(`  GHL_API_BASE_URL: ${GHL_API_BASE_URL}`);

if (!GHL_API_KEY || !GHL_LOCATION_ID) {
  console.log('\n❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Helper function to make GHL API calls
async function makeGhlRequest(endpoint, method = 'GET', body = null) {
  const url = `${GHL_API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
    'Accept': 'application/json',
  };

  if (method === 'POST' || method === 'PUT') {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`\n🌐 Testing: ${method} ${url}`);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   Error: ${errorText}`);
      return { success: false, status: response.status, error: errorText };
    }

    if (response.status === 204) {
      return { success: true, status: 204, data: null };
    }

    const data = await response.json();
    console.log(`   Success: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
    return { success: true, status: response.status, data };
  } catch (error) {
    console.log(`   Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('\n🧪 Running API Diagnostics...');
  
  // Test 1: Check if we can access the location directly
  console.log('\n📍 Test 1: Location Access');
  const locationTest = await makeGhlRequest(`/locations/${GHL_LOCATION_ID}`);
  
  if (locationTest.success) {
    console.log('   ✅ Location access successful');
    if (locationTest.data) {
      console.log(`   📍 Location Name: ${locationTest.data.name || locationTest.data.location?.name || 'Unknown'}`);
      console.log(`   🏢 Company: ${locationTest.data.companyId || locationTest.data.location?.companyId || 'Unknown'}`);
    }
  } else {
    console.log('   ❌ Location access failed');
    if (locationTest.status === 403) {
      console.log('   🚨 This is likely the root cause of your booking errors!');
    }
  }

  // Test 2: Try to list contacts (simpler endpoint)
  console.log('\n👥 Test 2: Contacts Access');
  const contactsTest = await makeGhlRequest(`/contacts/?limit=1`);
  
  if (contactsTest.success) {
    console.log('   ✅ Contacts access successful');
  } else {
    console.log('   ❌ Contacts access failed');
  }

  // Test 2b: Try the new search endpoint
  console.log('\n🔍 Test 2b: Contact Search (New Method)');
  const searchTestData = {
    locationId: GHL_LOCATION_ID,
    query: 'test@example.com',
    pageLimit: 10
  };
  
  const searchTest = await makeGhlRequest('/contacts/search', 'POST', searchTestData);
  
  if (searchTest.success) {
    console.log('   ✅ Contact search successful');
  } else {
    console.log('   ❌ Contact search failed');
    if (searchTest.status === 403) {
      console.log('   🚨 This also has permission issues!');
    }
  }

  // Test 3: Try the contact upsert endpoint with minimal data
  console.log('\n📝 Test 3: Contact Upsert (Test)');
  const testContactData = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    locationId: GHL_LOCATION_ID
  };
  
  const upsertTest = await makeGhlRequest('/contacts/upsert', 'POST', testContactData);
  
  if (upsertTest.success) {
    console.log('   ✅ Contact upsert successful');
  } else {
    console.log('   ❌ Contact upsert failed');
    if (upsertTest.status === 403) {
      console.log('   🚨 This matches your booking error!');
    }
  }

  // Test 4: Check custom fields
  console.log('\n🏷️  Test 4: Custom Fields Access');
  const customFieldsEndpoints = [
    `/locations/${GHL_LOCATION_ID}/customFields`,
    `/contacts/custom-fields?locationId=${GHL_LOCATION_ID}`,
    `/objects/schema/contact?locationId=${GHL_LOCATION_ID}`
  ];

  for (const endpoint of customFieldsEndpoints) {
    const result = await makeGhlRequest(endpoint);
    if (result.success) {
      console.log(`   ✅ ${endpoint} - Success`);
      break;
    } else {
      console.log(`   ❌ ${endpoint} - Failed (${result.status})`);
    }
  }

  // Summary and recommendations
  console.log('\n📊 Diagnostic Summary');
  console.log('=====================');
  
  if (locationTest.success) {
    console.log('✅ Your API key and location ID appear to be working correctly.');
    console.log('   The issue might be intermittent or related to specific endpoints.');
  } else {
    console.log('❌ Your API key does not have access to the specified location.');
    console.log('\n🔧 Recommended Actions:');
    console.log('1. 🔑 Regenerate your Private Integration Token in GHL:');
    console.log('   - Go to Settings > Integrations > Private Integrations');
    console.log('   - Create a new PIT with these scopes: contacts.write, contacts.read, locations.read');
    console.log('');
    console.log('2. 📍 Verify your Location ID:');
    console.log('   - Go to Settings > Company');
    console.log('   - Check the URL: the location ID is after /location/');
    console.log('   - It should look like: oUvYNTw2Wvul7JSJplqQ');
    console.log('');
    console.log('3. 🔄 Update your .env file with the new values');
    console.log('');
    console.log('4. 🧪 Run this script again to verify the fix');
  }
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('\n💥 Script error:', error);
  process.exit(1); 
}); 