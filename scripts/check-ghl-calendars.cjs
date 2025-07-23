/*
  GHL Calendar Access Check
  ------------------------
  Checks what calendars this token can access.
  
  Usage: node scripts/check-ghl-calendars.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function checkGHLAccess() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  
  console.log('🔍 Checking GHL Token Access');
  console.log('============================');
  console.log('🔑 Token:', token?.slice(0, 10) + '...');
  console.log('📍 Expected Location:', process.env.GHL_LOCATION_ID);
  console.log('📅 Expected Calendar:', process.env.GHL_STANDARD_NOTARY_CALENDAR_ID);
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  };
  
  // Check 1: What calendars can we access?
  console.log('\n1️⃣ Checking calendars access...');
  try {
    const calendarsResp = await fetch(`${BASE_URL}/calendars`, { headers });
    console.log('📥 Calendars Status:', calendarsResp.status, calendarsResp.statusText);
    
    if (calendarsResp.ok) {
      const calendars = await calendarsResp.json();
      console.log('📅 Available calendars:', JSON.stringify(calendars, null, 2));
    } else {
      const error = await calendarsResp.text();
      console.log('❌ Calendars error:', error);
    }
  } catch (err) {
    console.error('❌ Calendars request failed:', err.message);
  }
  
  // Check 2: Can we access the specific calendar?
  console.log('\n2️⃣ Checking specific calendar access...');
  try {
    const calendarResp = await fetch(`${BASE_URL}/calendars/${process.env.GHL_STANDARD_NOTARY_CALENDAR_ID}`, { headers });
    console.log('📥 Specific Calendar Status:', calendarResp.status, calendarResp.statusText);
    
    if (calendarResp.ok) {
      const calendar = await calendarResp.json();
      console.log('📅 Calendar details:', JSON.stringify(calendar, null, 2));
    } else {
      const error = await calendarResp.text();
      console.log('❌ Specific calendar error:', error);
    }
  } catch (err) {
    console.error('❌ Specific calendar request failed:', err.message);
  }
  
  // Check 3: What locations can we access?
  console.log('\n3️⃣ Checking locations access...');
  try {
    const locationsResp = await fetch(`${BASE_URL}/locations/${process.env.GHL_LOCATION_ID}`, { headers });
    console.log('📥 Location Status:', locationsResp.status, locationsResp.statusText);
    
    if (locationsResp.ok) {
      const location = await locationsResp.json();
      console.log('📍 Location details:', JSON.stringify(location, null, 2));
    } else {
      const error = await locationsResp.text();
      console.log('❌ Location error:', error);
    }
  } catch (err) {
    console.error('❌ Location request failed:', err.message);
  }
  
  // Check 4: What about user/account info?
  console.log('\n4️⃣ Checking user access...');
  try {
    const userResp = await fetch(`${BASE_URL}/users/current`, { headers });
    console.log('📥 User Status:', userResp.status, userResp.statusText);
    
    if (userResp.ok) {
      const user = await userResp.json();
      console.log('👤 User details:', JSON.stringify(user, null, 2));
    } else {
      const error = await userResp.text();
      console.log('❌ User error:', error);
    }
  } catch (err) {
    console.error('❌ User request failed:', err.message);
  }
}

checkGHLAccess().catch(console.error); 