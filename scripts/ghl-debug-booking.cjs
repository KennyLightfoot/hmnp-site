/*
  GHL Debug Booking Script
  -----------------------
  Creates a test contact and tries to create an appointment for
  July 24, 2025 11:30 AM America/Chicago.
  Logs full responses so we can see any validation errors.

  Usage:  node scripts/ghl-debug-booking.cjs
*/
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'https://services.leadconnectorhq.com';

async function ghlRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  };

  console.log(`🌐 ${method} ${url}`);
  if (body) console.log('📤 Body:', JSON.stringify(body, null, 2));

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const responseData = await response.json().catch(() => null);
  
  console.log(`📥 Status: ${response.status} ${response.statusText}`);
  console.log('📥 Response:', JSON.stringify(responseData, null, 2));

  if (!response.ok) {
    throw new Error(`GHL API error: ${response.status} ${responseData?.message || response.statusText}`);
  }

  return responseData;
}

(async () => {
  try {
    console.log('🔑 Using token:', process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.slice(0, 10) + '…');
    console.log('🏢 Location ID:', process.env.GHL_LOCATION_ID);
    console.log('📅 Calendar ID:', process.env.GHL_STANDARD_NOTARY_CALENDAR_ID);

    // 1. Create contact
    const contactData = {
      firstName: 'Debug',
      lastName: 'Tester',
      email: `debug.tester.${Date.now()}@example.com`,
      phone: '7135050517',
      source: 'Debug Script',
      locationId: process.env.GHL_LOCATION_ID
    };

    const contactRes = await ghlRequest('/contacts/', 'POST', contactData);
    const contactId = contactRes.contact?.id || contactRes.id;
    console.log('✅ Contact created:', contactId);

    // 2. Create appointment for July 24 2025 11:30 AM CDT (16:30 UTC)
    const appointmentData = {
      calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      contactId,
      startTime: '2025-07-24T16:30:00.000Z',
      endTime: '2025-07-24T17:30:00.000Z',
      title: 'Debug Test Appointment',
      appointmentStatus: 'confirmed',
      address: 'Debug Address',
      ignoreDateRange: true,
      toNotify: false
    };

    const apptRes = await ghlRequest('/calendars/events/appointments', 'POST', appointmentData);
    console.log('✅ Appointment created:', apptRes.id || apptRes);

  } catch (err) {
    console.error('❌ GHL error:', err.message || err);
  }
})(); 