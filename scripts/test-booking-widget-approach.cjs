/*
  GHL Booking Widget Approach Test
  -------------------------------
  Tests using the calendar's service booking approach rather than direct appointment creation.
  
  Usage: node scripts/test-booking-widget-approach.cjs
*/
require('dotenv').config({ path: '.env.local' });

async function testBookingWidgetApproach() {
  const BASE_URL = 'https://services.leadconnectorhq.com';
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  
  console.log('🔧 Testing Booking Widget Approach');
  console.log('==================================');
  
  // Step 1: Create test contact
  console.log('\n1️⃣ Creating test contact...');
  const contactData = {
    firstName: 'Widget',
    lastName: 'Test',
    email: `widget.test.${Date.now()}@example.com`,
    phone: '7135050517',
    source: 'Widget Test',
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
  
  // Step 2: Try booking via calendar booking endpoint (like widget would do)
  console.log('\n2️⃣ Testing calendar booking endpoint...');
  
  const bookingData = {
    calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
    contactId: contact.contact.id,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    selectedTimezone: 'America/Chicago'
  };
  
  console.log('📤 Booking data:', JSON.stringify(bookingData, null, 2));
  
  // Try the calendar booking endpoint instead
  let bookingResponse = await fetch(`${BASE_URL}/calendars/${process.env.GHL_STANDARD_NOTARY_CALENDAR_ID}/bookings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  
  console.log('📥 Booking Status:', bookingResponse.status, bookingResponse.statusText);
  let bookingResult = await bookingResponse.text();
  console.log('📥 Booking Response:', bookingResult);
  
  if (!bookingResponse.ok) {
    // Step 3: Try different payload structure
    console.log('\n3️⃣ Trying alternative booking structure...');
    
    const altBookingData = {
      eventTitle: 'Widget Test - Standard Notary',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      contactId: contact.contact.id,
      calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      timezone: 'America/Chicago',
      guests: [
        {
          name: 'Widget Test',
          email: contactData.email,
          phone: contactData.phone
        }
      ]
    };
    
    bookingResponse = await fetch(`${BASE_URL}/calendars/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(altBookingData)
    });
    
    console.log('📥 Alt Status:', bookingResponse.status, bookingResponse.statusText);
    bookingResult = await bookingResponse.text();
    console.log('📥 Alt Response:', bookingResult);
  }
  
  if (!bookingResponse.ok) {
    // Step 4: Try the slots/booking endpoint
    console.log('\n4️⃣ Trying slots booking endpoint...');
    
    // First, let's see if we can get available slots
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const startTimestamp = Math.floor(tomorrow.getTime() / 1000);
    const endTimestamp = Math.floor((tomorrow.getTime() + 24 * 60 * 60 * 1000) / 1000);
    
    const slotsResponse = await fetch(`${BASE_URL}/calendars/${process.env.GHL_STANDARD_NOTARY_CALENDAR_ID}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Slots Status:', slotsResponse.status, slotsResponse.statusText);
    const slotsResult = await slotsResponse.text();
    console.log('📥 Available slots:', slotsResult.slice(0, 500));
    
    if (slotsResponse.ok) {
      const slots = JSON.parse(slotsResult);
      if (slots.length > 0) {
        console.log('\n✅ Found available slots! Now trying to book one...');
        
        const firstSlot = slots[0];
        const slotBookingData = {
          slotId: firstSlot.id,
          contactId: contact.contact.id,
          calendarId: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID
        };
        
        const slotBookingResponse = await fetch(`${BASE_URL}/calendars/events/book-slot`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(slotBookingData)
        });
        
        console.log('📥 Slot Booking Status:', slotBookingResponse.status, slotBookingResponse.statusText);
        const slotBookingResult = await slotBookingResponse.text();
        console.log('📥 Slot Booking Response:', slotBookingResult);
      }
    }
  }
  
  if (bookingResponse.ok) {
    console.log('✅ SUCCESS! Booking created via widget approach!');
    const booking = JSON.parse(bookingResult);
    console.log('📅 Booking details:', booking);
  } else {
    console.log('❌ All booking approaches failed');
  }
}

testBookingWidgetApproach().catch(console.error); 