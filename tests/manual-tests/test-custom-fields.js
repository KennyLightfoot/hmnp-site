#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

console.log('🔍 Custom Fields API Test');
console.log('==========================');
console.log(`Location ID: ${GHL_LOCATION_ID}`);

if (!GHL_API_KEY || !GHL_LOCATION_ID) {
  console.log('❌ Missing required environment variables');
  process.exit(1);
}

// Test the specific endpoints that getLocationCustomFields tries
const endpointsToTry = [
  `/objects/schema/contact?locationId=${GHL_LOCATION_ID}`, // v2 API schema-based approach
  `/contacts/custom-fields?locationId=${GHL_LOCATION_ID}`,  // Alternative location-specific format
  `/locations/${GHL_LOCATION_ID}/custom-fields`,            // Original endpoint format
];

async function testCustomFieldEndpoints() {
  console.log('\n🧪 Testing Custom Field Endpoints...\n');

  for (const endpoint of endpointsToTry) {
    console.log(`📡 Testing: ${endpoint}`);
    
    try {
      const response = await fetch(`${GHL_API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.status === 403) {
        console.log('   🚨 403 FORBIDDEN - This endpoint is causing the booking error!');
        const errorText = await response.text();
        console.log(`   Error Details: ${errorText}`);
      } else if (response.status === 404) {
        console.log('   ⚠️  404 NOT FOUND - Endpoint doesn\'t exist for this API version');
      } else if (response.ok) {
        const data = await response.json();
        console.log('   ✅ SUCCESS');
        
        // Check response structure
        if (data?.customFields && Array.isArray(data.customFields)) {
          console.log(`   📋 Found ${data.customFields.length} custom fields in data.customFields`);
        } else if (data?.fields && Array.isArray(data.fields)) {
          console.log(`   📋 Found ${data.fields.length} custom fields in data.fields`);
        } else if (data?.data?.fields && Array.isArray(data.data.fields)) {
          console.log(`   📋 Found ${data.data.fields.length} custom fields in data.data.fields`);
        } else if (Array.isArray(data)) {
          console.log(`   📋 Found ${data.length} custom fields in root array`);
        } else {
          console.log('   ⚠️  Response structure doesn\'t match expected formats');
          console.log(`   📋 Response keys: ${Object.keys(data || {}).join(', ')}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   💥 Network Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Test individual contact operations that might be failing
async function testContactOperations() {
  console.log('\n🧪 Testing Contact Operations...\n');

  // Test 1: Get contacts list
  console.log('📡 Testing: GET /contacts');
  try {
    const response = await fetch(`${GHL_API_BASE_URL}/contacts?locationId=${GHL_LOCATION_ID}&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      }
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 403) {
      console.log('   🚨 403 FORBIDDEN - Contact read access denied!');
    } else if (response.ok) {
      console.log('   ✅ Contact read access working');
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Contact upsert
  console.log('📡 Testing: POST /contacts/upsert');
  try {
    const testContact = {
      email: 'test-booking-fix@example.com',
      firstName: 'Test',
      lastName: 'BookingFix',
      locationId: GHL_LOCATION_ID
    };

    const response = await fetch(`${GHL_API_BASE_URL}/contacts/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContact)
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    if (response.status === 403) {
      console.log('   🚨 403 FORBIDDEN - Contact write access denied!');
      console.log('   This is likely why your bookings are failing!');
    } else if (response.ok) {
      console.log('   ✅ Contact write access working');
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
  }
}

async function runTests() {
  await testCustomFieldEndpoints();
  await testContactOperations();
  
  console.log('\n📊 SUMMARY & RECOMMENDATIONS');
  console.log('=============================');
  console.log('Based on the test results:');
  console.log('');
  console.log('If you see 403 errors above, the solution is:');
  console.log('1. 🔑 Generate a NEW Private Integration Token in GHL');
  console.log('2. 📍 Ensure it\'s created in the SAME sub-account as your location');
  console.log('3. ✅ Include these scopes when creating the token:');
  console.log('   • contacts.read');
  console.log('   • contacts.write');
  console.log('   • locations.read');
  console.log('   • customFields.read (if available)');
  console.log('   • customValues.read (if available)');
  console.log('4. 🔄 Update your .env.local file with the new token');
  console.log('5. 🖥️  Restart your application: pnpm dev');
  console.log('');
  console.log('🔗 Create new token at:');
  console.log('   GHL → Settings → Integrations → Private Integrations');
}

runTests().catch(console.error); 