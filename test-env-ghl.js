#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

console.log('🔍 Environment Variable Test');
console.log('============================');
console.log(`GHL_API_KEY: ${GHL_API_KEY ? (GHL_API_KEY.startsWith('pit-') ? '✅ Set (PIT format)' : '⚠️ Set (check format)') : '❌ Missing'}`);
console.log(`GHL_LOCATION_ID: ${GHL_LOCATION_ID || '❌ Missing'}`);

if (GHL_API_KEY && GHL_LOCATION_ID) {
  console.log('\n🧪 Testing GHL API connection...');
  
  fetch(`https://services.leadconnectorhq.com/locations/${GHL_LOCATION_ID}`, {
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Version': '2021-07-28',
      'Accept': 'application/json',
    }
  })
  .then(response => {
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('✅ GHL API connection successful!');
      return response.json();
    } else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  })
  .then(data => {
    console.log(`📍 Location: ${data.name || data.location?.name || 'Unknown'}`);
  })
  .catch(error => {
    console.log('❌ GHL API connection failed:', error.message);
    if (error.message.includes('403')) {
      console.log('\n🔧 Solutions:');
      console.log('1. Regenerate your Private Integration Token');
      console.log('2. Verify scopes: contacts.read, contacts.write, locations.read');  
      console.log('3. Ensure token was created in the SAME sub-account as your location ID');
    }
  });
} else {
  console.log('\n❌ Please set GHL_API_KEY and GHL_LOCATION_ID in .env.local');
} 