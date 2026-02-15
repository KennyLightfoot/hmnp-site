const fetch = require('node-fetch');

// Test GHL API connectivity
async function testGHL() {
  try {
    const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
    const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
    
    console.log('Testing GHL API connectivity...');
    console.log('Base URL:', GHL_API_BASE_URL);
    console.log('Location ID:', GHL_LOCATION_ID);
    console.log('Token exists:', !!GHL_PRIVATE_INTEGRATION_TOKEN);
    
    // Test 1: Get location info
    const locationResponse = await fetch(`${GHL_API_BASE_URL}/locations/${GHL_LOCATION_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });
    
    console.log('Location API Status:', locationResponse.status);
    
    if (locationResponse.ok) {
      const locationData = await locationResponse.json();
      console.log('✅ GHL Location API Working - Name:', locationData.name);
    } else {
      const errorData = await locationResponse.text();
      console.log('❌ GHL Location API Error:', errorData);
    }
    
    // Test 2: Search for existing contacts
    const contactsResponse = await fetch(`${GHL_API_BASE_URL}/contacts/search?query=test&locationId=${GHL_LOCATION_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });
    
    console.log('Contacts Search API Status:', contactsResponse.status);
    
    if (contactsResponse.ok) {
      const contactsData = await contactsResponse.json();
      console.log('✅ GHL Contacts API Working - Found contacts:', contactsData.total || 0);
    } else {
      const errorData = await contactsResponse.text();
      console.log('❌ GHL Contacts API Error:', errorData);
    }
    
  } catch (error) {
    console.log('❌ GHL Test Error:', error.message);
  }
}

testGHL();