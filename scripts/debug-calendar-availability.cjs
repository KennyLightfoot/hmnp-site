#!/usr/bin/env node

/**
 * GHL Calendar Availability Diagnostic Tool
 * Helps debug why calendars are showing 0 available slots
 */

require('dotenv').config({ path: '.env.local' });

const calendarId = process.env.GHL_STANDARD_NOTARY_CALENDAR_ID;
const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const baseUrl = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";

if (!calendarId || !token) {
  console.error('❌ Missing required environment variables:');
  console.error('   GHL_STANDARD_NOTARY_CALENDAR_ID:', calendarId ? '✅ Set' : '❌ Missing');
  console.error('   GHL_PRIVATE_INTEGRATION_TOKEN:', token ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

async function makeGHLRequest(endpoint) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`🔍 Making request to: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Version': '2024-01-01',
    },
  });

  console.log(`📊 Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error(`❌ API Error (${response.status}):`, errorData);
    return null;
  }

  return await response.json();
}

async function debugCalendar() {
  console.log('🔧 GHL Calendar Availability Diagnostic (Simplified)');
  console.log('='.repeat(50));
  console.log(`📅 Calendar ID: ${calendarId}`);
  console.log(`🔐 Token: ${token.substring(0, 10)}...`);
  console.log('');

  // Skip calendar details check since that endpoint seems to have auth issues
  // Focus on what we know works: free-slots endpoint
  
  console.log('🔍 Testing free slots endpoint (what our booking API uses)...');
  const testDates = [
    { date: '2025-01-08', desc: 'Today' },
    { date: '2025-01-09', desc: 'Tomorrow' },
    { date: '2025-01-15', desc: 'Next week' },
    { date: '2025-07-15', desc: 'July 15th' }
  ];

  let anySlots = false;

  for (const { date, desc } of testDates) {
    console.log(`   Testing ${desc} (${date})...`);
    
    // Convert to Unix timestamps like our fixed code does
    const startOfDay = new Date(`${date}T00:00:00-06:00`).getTime() / 1000;
    const endOfDay = new Date(`${date}T23:59:59-06:00`).getTime() / 1000;
    
    const queryParams = new URLSearchParams({
      startDate: startOfDay.toString(),
      endDate: endOfDay.toString(),
      timezone: 'America/Chicago'
    });
    
    const slots = await makeGHLRequest(`/calendars/${calendarId}/free-slots?${queryParams}`);
    if (slots) {
      console.log(`     📊 Response:`, JSON.stringify(slots, null, 2));
      
      // Check if we found any slots in any format
      if (slots.slots?.length > 0 || slots.freeSlots?.length > 0 || (Array.isArray(slots) && slots.length > 0)) {
        anySlots = true;
      }
    }
  }
  console.log('');

  console.log('🔧 Diagnostic complete!');
  console.log('');
  
  if (!anySlots) {
    console.log('❌ No available slots found for any date tested');
    console.log('');
    console.log('💡 Possible reasons:');
    console.log('   1. Calendar has no availability configured in GHL');
    console.log('   2. Calendar working hours not set');
    console.log('   3. Calendar is inactive/disabled');
    console.log('   4. Calendar integration (Google Cal) issues');
    console.log('   5. Wrong calendar ID mapping');
    console.log('');
    console.log('🛠️  To fix:');
    console.log('   1. Log into GHL dashboard');
    console.log('   2. Go to Calendars section');
    console.log(`   3. Find calendar ID: ${calendarId}`);
    console.log('   4. Check availability settings, working hours, and status');
    console.log('   5. Test booking manually in GHL first');
  } else {
    console.log('✅ Found available slots! The calendar is working.');
  }
}

debugCalendar().catch(console.error); 