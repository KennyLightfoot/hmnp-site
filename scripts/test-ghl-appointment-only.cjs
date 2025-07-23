/*
  GHL Appointment Creation Test
  ----------------------------
  Tests ONLY the appointment creation part to see if it's working.
  
  Usage: node scripts/test-ghl-appointment-only.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testGHLAppointment() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  
  console.log('🔧 Testing GHL Appointment Creation');
  console.log('===================================');
  console.log('🔑 Token:', process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.slice(0, 10) + '...');
  console.log('🏢 Location ID:', process.env.GHL_LOCATION_ID);
  console.log('📅 Calendar ID:', process.env.GHL_STANDARD_NOTARY_CALENDAR_ID);
  
  // Step 1: Create a test contact first
  console.log('\n1️⃣ Creating test contact...');
  const contactData = {
    firstName: 'Appointment',
    lastName: 'Test',
    email: `appointment.test.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'Appointment Test',
    locationId: process.env.GHL_LOCATION_ID
  };
  
  const contactResponse = await fetch(`${BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`,
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
  
  // Step 2: Try to create appointment
  console.log('\n2️⃣ Creating appointment...');

  // Target 10:00 AM Houston time (CDT = UTC-5), which is 15:00 UTC.
  const tomorrowUTC = new Date();
  tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
  tomorrowUTC.setUTCHours(15, 0, 0, 0); // 15:00:00 UTC
  const startTime = tomorrowUTC.toISOString();
  // End time is 1 hour later
  const endTime = new Date(tomorrowUTC.getTime() + 60 * 60 * 1000).toISOString();

  const appointmentData = {
    calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
    contactId: contact.contact.id,
    locationId: process.env.GHL_LOCATION_ID,
    startTime: startTime,
    endTime: endTime,
    title: 'Test Appointment - Standard Notary',
    appointmentStatus: 'confirmed',
    address: '123 Test Street, Houston, TX',
    ignoreDateRange: true,
    toNotify: false
  };
  
  console.log('📤 Appointment data:', JSON.stringify(appointmentData, null, 2));
  
  const appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`,
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
    console.log('🎯 This should now appear in your GHL calendar');
  } else {
    console.error('❌ Appointment creation failed');
    console.error('Details:', appointmentResult);
  }
}

testGHLAppointment().catch(console.error); 