// Environment variables should be loaded from .env.local automatically

async function testGHLCalendarDirect() {
  console.log('🧪 Direct GHL Calendar API Test');
  console.log('=================================\n');

  // Check environment variables
  const requiredEnvs = [
    'GHL_PRIVATE_INTEGRATION_TOKEN',
    'GHL_LOCATION_ID',
    'GHL_STANDARD_NOTARY_CALENDAR_ID'
  ];

  for (const env of requiredEnvs) {
    const value = process.env[env];
    console.log(`${env}: ${value ? '✅ Set' : '❌ Missing'}`);
  }

  if (!process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
    console.error('\n❌ Missing GHL_PRIVATE_INTEGRATION_TOKEN');
    return;
  }

  console.log('\n📅 Testing Calendar Slots API...');

  const calendarId = process.env.GHL_STANDARD_NOTARY_CALENDAR_ID;
  console.log(`Calendar ID: ${calendarId}`);

  // Test different date ranges
  const testDates = [
    '2025-01-08', // Today
    '2025-01-09', // Tomorrow
    '2025-01-15', // Next week
    '2025-01-20'  // Later
  ];

  for (const testDate of testDates) {
    console.log(`\n🔍 Testing date: ${testDate}`);
    
    const startDate = new Date(`${testDate}T00:00:00.000Z`);
    const endDate = new Date(`${testDate}T23:59:59.999Z`);
    
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
    console.log(`Start timestamp: ${startTimestamp} (${startDate.toISOString()})`);
    console.log(`End timestamp: ${endTimestamp} (${endDate.toISOString()})`);

    try {
      const url = `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago`;
      console.log(`API URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        }
      });

      console.log(`Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error: ${errorText}`);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Response:`, JSON.stringify(data, null, 2));

      // Analyze response structure
      if (Array.isArray(data)) {
        console.log(`📊 Found ${data.length} slots directly in response array`);
      } else if (data.slots && Array.isArray(data.slots)) {
        console.log(`📊 Found ${data.slots.length} slots in data.slots`);
      } else if (data.data && Array.isArray(data.data)) {
        console.log(`📊 Found ${data.data.length} slots in data.data`);
      } else if (data.freeSlots && Array.isArray(data.freeSlots)) {
        console.log(`📊 Found ${data.freeSlots.length} slots in data.freeSlots`);
      } else {
        console.log(`📊 Response structure:`, Object.keys(data));
        console.log(`❓ No slots array found in expected locations`);
      }

    } catch (error) {
      console.error(`❌ Request failed:`, error.message);
    }
  }

  console.log('\n🔧 Testing Calendar Info...');
  try {
    const calendarInfoUrl = `https://services.leadconnectorhq.com/calendars/${calendarId}`;
    console.log(`Calendar Info URL: ${calendarInfoUrl}`);

    const response = await fetch(calendarInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      }
    });

    if (response.ok) {
      const calendarInfo = await response.json();
      console.log(`✅ Calendar Info:`, JSON.stringify(calendarInfo, null, 2));
    } else {
      const errorText = await response.text();
      console.error(`❌ Calendar Info Error: ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ Calendar Info Request Failed:`, error.message);
  }

  console.log('\n✅ GHL Calendar Test Complete!');
}

testGHLCalendarDirect().catch(console.error); 