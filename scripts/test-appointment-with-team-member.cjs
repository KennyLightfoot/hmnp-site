/*
  GHL Appointment Test with Team Member
  ------------------------------------
  Tests appointment creation including the team member from the calendar.
  
  Usage: node scripts/test-appointment-with-team-member.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testAppointmentWithTeamMember() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  
  console.log('🔧 Testing Appointment with Team Member');
  console.log('=======================================');
  
  // Step 1: Create test contact
  console.log('\n1️⃣ Creating test contact...');
  const contactData = {
    firstName: 'TeamMember',
    lastName: 'Test',
    email: `teammember.test.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'Team Member Test',
    locationId: process.env.GHL_LOCATION_ID
  };
  
  const contactResponse = await fetch(`${BASE_URL}/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
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
  
  // Step 2: Create appointment with team member
  console.log('\n2️⃣ Creating appointment with team member...');
  
  // From our calendar check, we know the team member userId is: dYOQIx02wwBVjY4ihxoY
  const appointmentData = {
    calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
    contactId: contact.contact.id,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    title: 'Team Member Test - Standard Notary',
    appointmentStatus: 'confirmed',
    address: '123 Test Street, Houston, TX',
    ignoreDateRange: true,
    toNotify: false,
    selectedUsers: ['dYOQIx02wwBVjY4ihxoY'] // Try including the team member
  };
  
  console.log('📤 Appointment data:', JSON.stringify(appointmentData, null, 2));
  
  let appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appointmentData)
  });
  
  console.log('📥 Status:', appointmentResponse.status, appointmentResponse.statusText);
  let appointmentResult = await appointmentResponse.text();
  console.log('📥 Response:', appointmentResult);
  
  if (!appointmentResponse.ok) {
    // Try variation 2: using assignedUserId instead
    console.log('\n3️⃣ Trying with assignedUserId...');
    const appointmentData2 = {
      ...appointmentData,
      assignedUserId: 'dYOQIx02wwBVjY4ihxoY'
    };
    delete appointmentData2.selectedUsers;
    
    appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData2)
    });
    
    console.log('📥 Status v2:', appointmentResponse.status, appointmentResponse.statusText);
    appointmentResult = await appointmentResponse.text();
    console.log('📥 Response v2:', appointmentResult);
  }
  
  if (!appointmentResponse.ok) {
    // Try variation 3: minimal payload
    console.log('\n4️⃣ Trying minimal payload...');
    const appointmentData3 = {
      calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      contactId: contact.contact.id,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      title: 'Minimal Test'
    };
    
    appointmentResponse = await fetch(`${BASE_URL}/calendars/events/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData3)
    });
    
    console.log('📥 Status v3:', appointmentResponse.status, appointmentResponse.statusText);
    appointmentResult = await appointmentResponse.text();
    console.log('📥 Response v3:', appointmentResult);
  }
  
  if (appointmentResponse.ok) {
    console.log('✅ SUCCESS! Appointment created!');
    const appointment = JSON.parse(appointmentResult);
    console.log('📅 Appointment ID:', appointment.appointment?.id || appointment.id);
  } else {
    console.log('❌ All attempts failed');
  }
}

testAppointmentWithTeamMember().catch(console.error); 