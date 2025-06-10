const dotenv = require('dotenv');
dotenv.config();

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

console.log('🔍 Simple GHL Test');
console.log('==================');

console.log('📋 Environment Variables:');
console.log(`  GHL_API_KEY: ${GHL_API_KEY ? (GHL_API_KEY.startsWith('pit-') ? '✅ Set (PIT format)' : '⚠️  Set (Non-PIT format)') : '❌ Missing'}`);
console.log(`  GHL_LOCATION_ID: ${GHL_LOCATION_ID || '❌ Missing'}`);
console.log(`  GHL_API_BASE_URL: ${GHL_API_BASE_URL}`);

if (!GHL_API_KEY || !GHL_LOCATION_ID) {
  console.log('\n❌ Missing required environment variables.');
  console.log('Please check your .env file has:');
  console.log('GHL_API_KEY=pit-xxxxxxxxxxxxxxxxxxxxx');
  console.log('GHL_LOCATION_ID=oUvYNTw2Wvul7JSJplqQ');
  process.exit(1);
}

async function testGHL() {
  console.log('\n🧪 Testing GHL API...');
  
  // Test location access
  const url = `${GHL_API_BASE_URL}/locations/${GHL_LOCATION_ID}`;
  console.log(`\n🌐 Testing: GET ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      }
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 403) {
      console.log('\n🚨 403 FORBIDDEN ERROR DETECTED!');
      console.log('   This means your API token does not have access to this location.');
      console.log('\n🔧 TO FIX THIS:');
      console.log('1. Go to your GHL account: Settings > Integrations > Private Integrations');
      console.log('2. Create a NEW Private Integration Token with these scopes:');
      console.log('   ✅ contacts.write');
      console.log('   ✅ contacts.read'); 
      console.log('   ✅ locations.read');
      console.log('3. Update your .env file with the new token (starts with "pit-")');
      console.log('4. Restart your application');
      return;
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SUCCESS! Your GHL configuration is working.');
      console.log(`   📍 Location: ${data.name || data.location?.name || 'Unknown'}`);
      
      // Test contact endpoint
      console.log('\n👥 Testing contacts endpoint...');
      const contactUrl = `${GHL_API_BASE_URL}/contacts/?limit=1`;
      const contactResponse = await fetch(contactUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
        }
      });
      
      console.log(`   Contacts Status: ${contactResponse.status}`);
      if (contactResponse.ok) {
        console.log('   ✅ Contacts access working!');
        console.log('\n🎉 Your GHL integration should work for bookings!');
      } else {
        const errorText = await contactResponse.text();
        console.log(`   ❌ Contacts access failed: ${errorText}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
  }
}

testGHL(); 