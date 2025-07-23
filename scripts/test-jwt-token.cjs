/*
  Test JWT Token from Business Profile
  ------------------------------------
  Tests the JWT token to see if it has calendar permissions.
  
  Usage: node scripts/test-jwt-token.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testJWTToken() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6Im9VdllOVHcyV3Z1bDdKU0pwbHFRIiwiY29tcGFueV9pZCI6Ik1LeHhKWEd5bTQxYWNucjZ6dEQyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAxOTg5NjI4MzY5LCJzdWIiOiJ1c2VyX2lkIn0.OhG7eQuY4ufsWR7zfLDRLw6rcADC1Gr6LQfnycYLhc0';
  
  console.log('🔧 Testing JWT Token from Business Profile');
  console.log('==========================================');
  console.log('🔑 JWT Token:', JWT_TOKEN.slice(0, 20) + '...');
  console.log('🏢 Location ID:', process.env.GHL_LOCATION_ID);
  console.log('📅 Calendar ID:', process.env.GHL_STANDARD_NOTARY_CALENDAR_ID);
  
  // Test 1: Contact creation with JWT (try both auth formats)
  console.log('\n1️⃣ Testing contact creation with JWT...');
  const contactData = {
    firstName: 'JWT',
    lastName: 'Token',
    email: `jwt.token.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'JWT Token Test',
    locationId: process.env.GHL_LOCATION_ID
  };
  
  // Try with Bearer prefix first
  let contactResponse = await fetch(`${BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  
  console.log('📥 Contact Status (Bearer):', contactResponse.status, contactResponse.statusText);
  
  let contactId = null;
  let workingAuthFormat = `Bearer ${JWT_TOKEN}`;
  
  if (contactResponse.ok) {
    const contact = await contactResponse.json();
    contactId = contact.contact.id;
    console.log('✅ Contact created (Bearer):', contactId);
  } else {
    const error = await contactResponse.text();
    console.log('❌ Contact error (Bearer):', error);
    
    // Try without Bearer prefix
    console.log('\n🔄 Trying without Bearer prefix...');
    contactResponse = await fetch(`${BASE_URL}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': JWT_TOKEN,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    
    console.log('📥 Contact Status (no Bearer):', contactResponse.status, contactResponse.statusText);
    
    if (contactResponse.ok) {
      const contact = await contactResponse.json();
      contactId = contact.contact.id;
      workingAuthFormat = JWT_TOKEN;
      console.log('✅ Contact created (no Bearer):', contactId);
    } else {
      const error = await contactResponse.text();
      console.log('❌ Contact error (no Bearer):', error);
    }
  }
  
  // Test 2: Calendar access with working auth format
  console.log('\n2️⃣ Testing calendar access with JWT...');
  const calendarResponse = await fetch(`${BASE_URL}/calendars/${process.env.GHL_STANDARD_NOTARY_CALENDAR_ID}`, {
    headers: {
      'Authorization': workingAuthFormat,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    }
  });
  
  console.log('📥 Calendar Status:', calendarResponse.status, calendarResponse.statusText);
  if (calendarResponse.ok) {
    const calendar = await calendarResponse.json();
    console.log('✅ Calendar accessible:', calendar.calendar?.name);
    console.log('📋 Calendar active:', calendar.calendar?.isActive);
  } else {
    const error = await calendarResponse.text();
    console.log('❌ Calendar error:', error);
  }
  
  // Test 3: Appointment creation (only if contact was created)
  if (contactId) {
    console.log('\n3️⃣ Testing appointment creation with JWT...');
    
    const appointmentData = {
      calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      contactId: contactId,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      title: "JWT Token Test - Standard Notary",
      appointmentStatus: "confirmed",
      address: "123 Test St, Houston, TX",
      ignoreDateRange: true,
      toNotify: false
    };
    
    const appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': workingAuthFormat,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    console.log('📥 Appointment Status:', appointmentResponse.status, appointmentResponse.statusText);
    const appointmentResult = await appointmentResponse.text();
    console.log('📥 Appointment Response:', appointmentResult);
    
    if (appointmentResponse.ok) {
      console.log('🎉 SUCCESS! JWT token works for appointments!');
      const appointment = JSON.parse(appointmentResult);
      console.log('📅 Appointment ID:', appointment.appointment?.id || appointment.id);
      console.log('🎯 Check your GHL calendar now!');
      console.log('');
      console.log('🔧 RECOMMENDED: Update .env.local to use this JWT token:');
      console.log(`GHL_PRIVATE_INTEGRATION_TOKEN="${JWT_TOKEN}"`);
    } else {
      console.log('❌ Appointment creation failed with JWT token too');
    }
  } else {
    console.log('⚠️  Skipping appointment test - no contact created');
  }
  
  // Test 4: Compare token formats
  console.log('\n4️⃣ Token Analysis:');
  console.log('JWT Token (business profile):', JWT_TOKEN.slice(0, 30) + '...');
  console.log('Private Integration Token:', process.env.GHL_PRIVATE_INTEGRATION_TOKEN);
  console.log('');
  console.log('JWT tokens are often more permissive and may have broader access.');
  console.log('If this works, it suggests the Private Integration token setup was incomplete.');
}

testJWTToken().catch(console.error); 