/*
  GHL Appointment Test - Using Working July 10th Format
  ----------------------------------------------------
  Tests appointment creation using the exact structure from the working appointment.
  
  Usage: node scripts/test-with-working-format.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testWithWorkingFormat() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  
  console.log('🔧 Testing with Working July 10th Format');
  console.log('=========================================');
  
  // Step 1: Create test contact
  console.log('\n1️⃣ Creating test contact...');
  const contactData = {
    firstName: 'Working',
    lastName: 'Format',
    email: `working.format.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'Working Format Test',
    locationId: process.env.GHL_LOCATION_ID
  };
  
  const contactResponse = await fetch(`${BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`, // Try Bearer first since contacts work with it
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
  
  // Step 2: Try appointment using the EXACT structure from working July 10th appointment
  console.log('\n2️⃣ Creating appointment with working format...');
  
  const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  
  const appointmentData = {
    calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID, // "w3sjmTzBfuahySgQvKoV"
    contactId: contact.contact.id,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    title: "Standard Notary - Working Format Test",
    appointmentStatus: "confirmed", // Note: working one had "appoinmentStatus" typo
    address: "123 Test St, Houston, TX",
    assignedUserId: "Kenny Lightfoot", // Use string name like working one
    calendarProviderId: "HPZNa4woigTcaRJAzK8B", // From working appointment
    userCalendarId: "qmLpCYw7I5tzjkVGs169", // From working appointment
    channel: "web",
    selectedTimezone: "America/Chicago",
    source: "api",
    local: true,
    isFree: false,
    isFullDay: false
  };
  
  console.log('📤 Appointment data (working format):', JSON.stringify(appointmentData, null, 2));
  
  // Try with Bearer prefix first
  let appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });
  
  console.log('📥 Status (Bearer):', appointmentResponse.status, appointmentResponse.statusText);
  let appointmentResult = await appointmentResponse.text();
  console.log('📥 Response (Bearer):', appointmentResult);
  
  if (!appointmentResponse.ok) {
    // Try without Bearer prefix
    console.log('\n3️⃣ Trying without Bearer prefix...');
    
    appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    
    console.log('📥 Status (no Bearer):', appointmentResponse.status, appointmentResponse.statusText);
    appointmentResult = await appointmentResponse.text();
    console.log('📥 Response (no Bearer):', appointmentResult);
  }
  
  if (!appointmentResponse.ok) {
    // Try minimal version
    console.log('\n4️⃣ Trying minimal required fields...');
    
    const minimalData = {
      calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      contactId: contact.contact.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      title: "Minimal Test",
      appointmentStatus: "confirmed"
    };
    
    appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalData)
    });
    
    console.log('📥 Status (minimal):', appointmentResponse.status, appointmentResponse.statusText);
    appointmentResult = await appointmentResponse.text();
    console.log('📥 Response (minimal):', appointmentResult);
  }
  
  if (appointmentResponse.ok) {
    console.log('✅ SUCCESS! Appointment created!');
    const appointment = JSON.parse(appointmentResult);
    console.log('📅 Appointment details:', appointment);
    console.log('🎯 Check your GHL calendar now!');
  } else {
    console.log('❌ All attempts failed');
  }
}

testWithWorkingFormat().catch(console.error); 