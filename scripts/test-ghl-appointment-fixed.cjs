/*
  GHL Appointment Creation Test - Fixed Version
  --------------------------------------------
  Tests appointment creation using the exact format that should work.
  
  Usage: node scripts/test-ghl-appointment-fixed.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testGHLAppointmentFixed() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  
  console.log('🔧 Testing GHL Appointment Creation (Fixed)');
  console.log('============================================');
  console.log('🔑 Token:', process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.slice(0, 10) + '...');
  console.log('🏢 Location ID:', process.env.GHL_LOCATION_ID);
  console.log('📅 Calendar ID:', process.env.GHL_STANDARD_NOTARY_CALENDAR_ID);
  
  // Step 1: Create a test contact first (this works)
  console.log('\n1️⃣ Creating test contact...');
  const contactData = {
    firstName: 'Fixed',
    lastName: 'Test',
    email: `fixed.test.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'Fixed Test',
    locationId: process.env.GHL_LOCATION_ID  // This works for contacts
  };
  
  const contactResponse = await fetch(`${BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': process.env.GHL_PRIVATE_INTEGRATION_TOKEN,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  
  if (!contactResponse.ok) {
    const error = await contactResponse.text();
    console.error('❌ Contact creation failed:', contactResponse.status, error);
    return;
  }
  
  const contact = await contactResponse.json();
  console.log('✅ Contact created:', contact.contact.id);
  
  // Step 2: Try appointment creation WITHOUT locationId in payload
  console.log('\n2️⃣ Creating appointment (no locationId in payload)...');
  const appointmentData = {
    calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
    contactId: contact.contact.id,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    title: 'Fixed Test - Standard Notary',
    appointmentStatus: 'confirmed',
    address: '123 Test Street, Houston, TX',
    ignoreDateRange: true,
    toNotify: false
    // NOTE: NO locationId here - that might be the issue!
  };
  
  console.log('📤 Appointment data:', JSON.stringify(appointmentData, null, 2));
  
  const appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
    method: 'POST',
    headers: {
      'Authorization': process.env.GHL_PRIVATE_INTEGRATION_TOKEN,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });
  
  console.log('📥 Status:', appointmentResponse.status, appointmentResponse.statusText);
  const appointmentResult = await appointmentResponse.text();
  console.log('📥 Response:', appointmentResult);
  
  if (appointmentResponse.ok) {
    const appointment = JSON.parse(appointmentResult);
    console.log('✅ Appointment created successfully!');
    console.log('📅 Appointment ID:', appointment.appointment?.id || appointment.id);
    console.log('🎯 Check your GHL calendar now!');
  } else {
    console.error('❌ Appointment creation still failed');
    
    // Step 3: If that fails, try with a different endpoint
    console.log('\n3️⃣ Trying alternative appointment endpoint...');
    
    const altResponse = await fetch(`${BASE_URL}/calendars/${process.env.GHL_STANDARD_NOTARY_CALENDAR_ID}/events`, {
      method: 'POST',
      headers: {
        'Authorization': process.env.GHL_PRIVATE_INTEGRATION_TOKEN,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    console.log('📥 Alt Status:', altResponse.status, altResponse.statusText);
    const altResult = await altResponse.text();
    console.log('📥 Alt Response:', altResult);
  }
}

testGHLAppointmentFixed().catch(console.error); 