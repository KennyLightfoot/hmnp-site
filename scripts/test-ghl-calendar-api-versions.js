// Test different GHL Calendar API versions and endpoints

async function testDifferentGHLApproaches() {
  console.log('🧪 Testing Different GHL Calendar API Approaches');
  console.log('=============================================\n');

  const calendarId = process.env.GHL_STANDARD_NOTARY_CALENDAR_ID || 'XhHkzwNbT1MSWcGsfBjl';
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!token) {
    console.error('❌ Missing GHL_PRIVATE_INTEGRATION_TOKEN');
    return;
  }

  // Test different date formats and API versions
  const testDate = '2025-01-15';
  
  console.log(`📅 Testing calendar: ${calendarId}`);
  console.log(`📍 Location: ${locationId}`);
  console.log(`📆 Test date: ${testDate}\n`);

  // Convert to different timestamp formats
  const startDate = new Date(`${testDate}T00:00:00.000Z`);
  const endDate = new Date(`${testDate}T23:59:59.999Z`);
  
  const unixStart = Math.floor(startDate.getTime() / 1000);
  const unixEnd = Math.floor(endDate.getTime() / 1000);
  const isoStart = startDate.toISOString();
  const isoEnd = endDate.toISOString();

  // Test approaches
  const testCases = [
    {
      name: 'Current Approach (free-slots)',
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${unixStart}&endDate=${unixEnd}&timezone=America/Chicago`,
      version: '2021-07-28'
    },
    {
      name: 'API v2 free-slots',
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${unixStart}&endDate=${unixEnd}&timezone=America/Chicago`,
      version: '2024-01-01'
    },
    {
      name: 'Alternative endpoint: slots',
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/slots?startDate=${unixStart}&endDate=${unixEnd}&timezone=America/Chicago`,
      version: '2021-07-28'
    },
    {
      name: 'Alternative endpoint: availability',
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/availability?startDate=${unixStart}&endDate=${unixEnd}&timezone=America/Chicago`,
      version: '2021-07-28'
    },
    {
      name: 'With locationId parameter',
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${unixStart}&endDate=${unixEnd}&timezone=America/Chicago&locationId=${locationId}`,
      version: '2021-07-28'
    },
    {
      name: 'ISO date format',
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${encodeURIComponent(isoStart)}&endDate=${encodeURIComponent(isoEnd)}&timezone=America/Chicago`,
      version: '2021-07-28'
    },
    {
      name: 'Without timezone',
      url: `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${unixStart}&endDate=${unixEnd}`,
      version: '2021-07-28'
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    console.log(`Version: ${testCase.version}`);

    try {
      const response = await fetch(testCase.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': testCase.version,
        }
      });

      console.log(`Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response:', JSON.stringify(data, null, 2));
        
        // Analyze response structure
        if (Array.isArray(data)) {
          console.log(`📊 Direct array with ${data.length} items`);
        } else if (data.slots) {
          console.log(`📊 data.slots with ${Array.isArray(data.slots) ? data.slots.length : 'non-array'} items`);
        } else if (data.freeSlots) {
          console.log(`📊 data.freeSlots with ${Array.isArray(data.freeSlots) ? data.freeSlots.length : 'non-array'} items`);
        } else if (data.data) {
          console.log(`📊 data.data with ${Array.isArray(data.data) ? data.data.length : 'non-array'} items`);
        } else {
          console.log(`📊 Response keys: [${Object.keys(data).join(', ')}]`);
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ Request failed: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }

  // Test specific troubleshooting
  console.log('\n🔧 Testing Calendar Configuration Issues...');
  
  try {
    // Test calendar availability settings
    const availabilityUrl = `https://services.leadconnectorhq.com/calendars/${calendarId}`;
    const response = await fetch(availabilityUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      }
    });

    if (response.ok) {
      const calendarData = await response.json();
      console.log('\n📋 Calendar Analysis:');
      
      if (calendarData.calendar) {
        const cal = calendarData.calendar;
        console.log(`• Name: ${cal.name}`);
        console.log(`• Active: ${cal.isActive}`);
        console.log(`• Slot Duration: ${cal.slotDuration} ${cal.slotDurationUnit}`);
        console.log(`• Slot Interval: ${cal.slotInterval} ${cal.slotIntervalUnit}`);
        console.log(`• Max per day: ${cal.appoinmentPerDay}`);
        console.log(`• Available hours: ${cal.openHours?.length || 0} day configs`);
        console.log(`• Availabilities: ${cal.availabilities?.length || 0} blocks`);
        
        if (cal.availabilities && cal.availabilities.length === 0) {
          console.log('\n❗ POTENTIAL ISSUE: Calendar has no availability blocks configured!');
          console.log('This could be why no slots are returned.');
          console.log('Check your GHL calendar configuration and add availability blocks.');
        }

        if (cal.openHours && cal.openHours.length > 0) {
          console.log('\n⏰ Open Hours Configuration:');
          cal.openHours.forEach((hours, index) => {
            console.log(`  Day ${hours.daysOfTheWeek}: ${JSON.stringify(hours.hours)}`);
          });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Calendar analysis failed: ${error.message}`);
  }

  console.log('\n✅ API Testing Complete!');
  console.log('\n💡 Next Steps:');
  console.log('1. Check if any endpoint returned slots');
  console.log('2. Verify calendar availability blocks in GHL dashboard');
  console.log('3. Test with different date ranges');
  console.log('4. Consider using different API version if supported');
}

// Set environment variables for this test
if (typeof process !== 'undefined' && process.env) {
  if (!process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
  console.error('❌ GHL_PRIVATE_INTEGRATION_TOKEN environment variable is required');
  process.exit(1);
}
  if (!process.env.GHL_LOCATION_ID) {
    console.error('❌ GHL_LOCATION_ID environment variable is required');
    process.exit(1);
  }
  if (!process.env.GHL_STANDARD_NOTARY_CALENDAR_ID) {
    console.error('❌ GHL_STANDARD_NOTARY_CALENDAR_ID environment variable is required');
    process.exit(1);
  }
}

testDifferentGHLApproaches().catch(console.error); 