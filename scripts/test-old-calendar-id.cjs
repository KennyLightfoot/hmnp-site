/*
  Test Old Calendar ID from Backup
  -------------------------------
  Tests if the calendar ID from July 9th backup still works.
  
  Usage: node scripts/test-old-calendar-id.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testOldCalendarId() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  
  console.log('🔧 Testing Old vs New Calendar IDs');
  console.log('===================================');
  
  const OLD_CALENDAR_ID = 'XhHkzwNbT1MSWcGsfBjl'; // From July 9th backup
  const NEW_CALENDAR_ID = process.env.GHL_STANDARD_NOTARY_CALENDAR_ID; // Current w3sjmTzBfuahySgQvKoV
  
  console.log('📅 Old Calendar ID:', OLD_CALENDAR_ID);
  console.log('📅 New Calendar ID:', NEW_CALENDAR_ID);
  
  // Test 1: Check old calendar access
  console.log('\n1️⃣ Testing old calendar access...');
  try {
    const oldResp = await fetch(`${BASE_URL}/calendars/${OLD_CALENDAR_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Old Calendar Status:', oldResp.status, oldResp.statusText);
    
    if (oldResp.ok) {
      const oldCal = await oldResp.json();
      console.log('✅ Old Calendar Name:', oldCal.calendar?.name);
      console.log('📋 Old Calendar Active:', oldCal.calendar?.isActive);
    } else {
      const oldErr = await oldResp.text();
      console.log('❌ Old Calendar Error:', oldErr);
    }
  } catch (err) {
    console.error('❌ Old calendar request failed:', err.message);
  }
  
  // Test 2: Check new calendar access (we know this works)
  console.log('\n2️⃣ Testing new calendar access...');
  try {
    const newResp = await fetch(`${BASE_URL}/calendars/${NEW_CALENDAR_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 New Calendar Status:', newResp.status, newResp.statusText);
    
    if (newResp.ok) {
      const newCal = await newResp.json();
      console.log('✅ New Calendar Name:', newCal.calendar?.name);
      console.log('📋 New Calendar Active:', newCal.calendar?.isActive);
    } else {
      const newErr = await newResp.text();
      console.log('❌ New Calendar Error:', newErr);
    }
  } catch (err) {
    console.error('❌ New calendar request failed:', err.message);
  }
  
  // Test 3: Try creating appointment with old calendar ID
  console.log('\n3️⃣ Testing appointment creation with old calendar ID...');
  
  // First create a contact
  const contactData = {
    firstName: 'Old',
    lastName: 'Calendar',
    email: `old.calendar.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'Old Calendar Test',
    locationId: process.env.GHL_LOCATION_ID
  };
  
  const contactResp = await fetch(`${BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });
  
  if (contactResp.ok) {
    const contact = await contactResp.json();
    console.log('✅ Contact created:', contact.contact.id);
    
    // Try appointment with old calendar ID
    const appointmentData = {
      calendarId: OLD_CALENDAR_ID,
      contactId: contact.contact.id,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      title: "Old Calendar Test",
      appointmentStatus: "confirmed",
      address: "123 Test St, Houston, TX",
      ignoreDateRange: true,
      toNotify: false
    };
    
    const appointmentResp = await fetch(`${BASE_URL}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    console.log('📥 Old Calendar Appointment Status:', appointmentResp.status, appointmentResp.statusText);
    const appointmentResult = await appointmentResp.text();
    console.log('📥 Old Calendar Appointment Response:', appointmentResult);
    
    if (appointmentResp.ok) {
      console.log('🎉 SUCCESS! Old calendar ID works for appointments!');
    }
  } else {
    console.log('❌ Failed to create contact for old calendar test');
  }
}

testOldCalendarId().catch(console.error); 