/*
  Test New GHL Token
  ------------------
  Tests the new token with proper scopes to see which auth format works.
  
  Usage: node scripts/test-new-token.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testNewToken() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  
  console.log('🔧 Testing New GHL Token');
  console.log('========================');
  console.log('🔑 New Token:', token?.slice(0, 10) + '...');
  console.log('🏢 Location ID:', process.env.GHL_LOCATION_ID);
  console.log('📅 Calendar ID:', process.env.GHL_STANDARD_NOTARY_CALENDAR_ID);
  
  // Test 1: Contact creation with Bearer prefix
  console.log('\n1️⃣ Testing contact creation WITH Bearer prefix...');
  const contactData = {
    firstName: 'New',
    lastName: 'Token',
    email: `new.token.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'New Token Test',
    locationId: process.env.GHL_LOCATION_ID
  };
  
  let contactResponse = await fetch(`${BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  
  console.log('📥 Contact Status (Bearer):', contactResponse.status, contactResponse.statusText);
  
  let contactId = null;
  if (contactResponse.ok) {
    const contact = await contactResponse.json();
    contactId = contact.contact.id;
    console.log('✅ Contact created (Bearer):', contactId);
  } else {
    const error = await contactResponse.text();
    console.log('❌ Contact error (Bearer):', error);
    
    // Test 2: Try without Bearer prefix
    console.log('\n2️⃣ Testing contact creation WITHOUT Bearer prefix...');
    contactResponse = await fetch(`${BASE_URL}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    
    console.log('📥 Contact Status (no Bearer):', contactResponse.status, contactResponse.statusText);
    
    if (contactResponse.ok) {
      const contact = await contactResponse.json();
      contactId = contact.contact.id;
      console.log('✅ Contact created (no Bearer):', contactId);
    } else {
      const error = await contactResponse.text();
      console.log('❌ Contact error (no Bearer):', error);
      return; // Can't proceed without a contact
    }
  }
  
  // Test 3: Calendar access
  console.log('\n3️⃣ Testing calendar access...');
  const calendarResponse = await fetch(`${BASE_URL}/calendars/${process.env.GHL_STANDARD_NOTARY_CALENDAR_ID}`, {
    headers: {
      'Authorization': contactResponse.ok && !contactResponse.headers.get('Authorization')?.includes('Bearer') ? token : `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    }
  });
  
  console.log('📥 Calendar Status:', calendarResponse.status, calendarResponse.statusText);
  if (calendarResponse.ok) {
    const calendar = await calendarResponse.json();
    console.log('✅ Calendar accessible:', calendar.calendar?.name);
  } else {
    const error = await calendarResponse.text();
    console.log('❌ Calendar error:', error);
  }
  
  // Test 4: Appointment creation
  if (contactId) {
    console.log('\n4️⃣ Testing appointment creation...');
    
    const appointmentData = {
      calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      contactId: contactId,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      title: "New Token Test - Standard Notary",
      appointmentStatus: "confirmed",
      address: "123 Test St, Houston, TX",
      ignoreDateRange: true,
      toNotify: false
    };
    
    const authHeader = contactResponse.ok && !contactResponse.headers.get('Authorization')?.includes('Bearer') ? token : `Bearer ${token}`;
    
    const appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    console.log('📥 Appointment Status:', appointmentResponse.status, appointmentResponse.statusText);
    const appointmentResult = await appointmentResponse.text();
    console.log('📥 Appointment Response:', appointmentResult);
    
    if (appointmentResponse.ok) {
      console.log('🎉 SUCCESS! Appointment created with new token!');
      const appointment = JSON.parse(appointmentResult);
      console.log('📅 Appointment ID:', appointment.appointment?.id || appointment.id);
      console.log('🎯 Check your GHL calendar now!');
    } else {
      console.log('❌ Appointment creation failed even with new token');
    }
  }
}

testNewToken().catch(console.error); 