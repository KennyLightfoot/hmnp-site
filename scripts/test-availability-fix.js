#!/usr/bin/env node

/**
 * Test Availability Fix - Houston Mobile Notary Pros
 * 
 * Quick test to verify availability slots are working after GHL dashboard fix
 */

require('dotenv').config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

// Calendar IDs from your configuration
const CALENDARS = {
  'STANDARD_NOTARY': 'w3sjmTzBfuahySgQvKoV',
  'EXTENDED_HOURS': 'OmcFGOLhrR9lil6AQa2z',
  'LOAN_SIGNING': 'yf6tpA7YMn3oyZc6GVZK',
  'RON_SERVICES': 'xFRCVGNlnZASiQnBVHEG'
};

async function makeGHLRequest(endpoint, method = 'GET', body = null) {
  const url = `${GHL_API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL API Error (${response.status}): ${errorText}`);
  }
  
  return await response.json();
}

async function testCalendarAvailability(calendarId, serviceName) {
  console.log(`\n📅 Testing ${serviceName}`);
  console.log('═'.repeat(50));
  
  try {
    // Test tomorrow's availability
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T00:00:00-06:00').getTime() / 1000;
    const endOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T23:59:59-06:00').getTime() / 1000;
    
    const queryParams = new URLSearchParams({
      startDate: startOfDay.toString(),
      endDate: endOfDay.toString(),
      timezone: 'America/Chicago'
    });
    
    const endpoint = `/calendars/${calendarId}/free-slots?${queryParams}`;
    const response = await makeGHLRequest(endpoint);
    
    console.log(`📊 Calendar ID: ${calendarId}`);
    console.log(`📅 Test Date: ${tomorrow.toISOString().split('T')[0]}`);
    
    if (response.slots && response.slots.length > 0) {
      console.log(`✅ Found ${response.slots.length} available slots!`);
      console.log('📋 Sample slots:');
      response.slots.slice(0, 5).forEach(slot => {
        const startTime = new Date(slot.startTime).toLocaleString('en-US', {
          timeZone: 'America/Chicago',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        console.log(`   • ${startTime} (${slot.duration || 30} min)`);
      });
    } else {
      console.log(`❌ No slots available - check availability blocks in GHL dashboard`);
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${serviceName}:`, error.message);
  }
}

async function testAllCalendars() {
  console.log('🧪 Testing Calendar Availability After Dashboard Fix');
  console.log('═'.repeat(60));
  console.log('📍 Testing tomorrow\'s availability for all calendars...');
  
  for (const [serviceName, calendarId] of Object.entries(CALENDARS)) {
    await testCalendarAvailability(calendarId, serviceName);
  }
  
  console.log('\n🎯 Test Complete!');
  console.log('═'.repeat(60));
  console.log('✅ If you see slots above, your fix worked!');
  console.log('❌ If no slots, double-check availability blocks in GHL dashboard');
  console.log('💡 Remember: Availability blocks are separate from open hours');
}

// Run the test
testAllCalendars().catch(console.error); 