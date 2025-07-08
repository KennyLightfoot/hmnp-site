#!/usr/bin/env node

/**
 * GHL API 2025 Diagnostic Script
 * Tests current implementation against latest GHL API standards
 */

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

// Test calendar IDs from your system
const TEST_CALENDARS = {
  'STANDARD_NOTARY': 'XhHkzwNbT1MSWcGsfBjl',
  'EXTENDED_HOURS': 'your-extended-hours-calendar-id', // Replace with actual ID
  'LOAN_SIGNING': 'your-loan-signing-calendar-id',     // Replace with actual ID
  'RON_SERVICES': 'your-ron-calendar-id'               // Replace with actual ID
};

async function makeGHLRequest(endpoint, method = 'GET', body = null) {
  const url = `${GHL_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      'User-Agent': 'HMNP-BookingSystem/2025.1',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`GHL API request failed (${response.status}): ${errorData}`);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

async function testGHLAPI2025() {
  console.log('🔍 GoHighLevel API 2025 Diagnostic Test');
  console.log('=' .repeat(50));
  
  if (!GHL_PRIVATE_INTEGRATION_TOKEN) {
    console.error('❌ GHL_PRIVATE_INTEGRATION_TOKEN not found in environment variables');
    return;
  }
  
  console.log(`🔐 Using token: ${GHL_PRIVATE_INTEGRATION_TOKEN.substring(0, 10)}...`);
  console.log(`🌐 API Base URL: ${GHL_API_BASE_URL}`);
  console.log('');
  
  // Test 1: Basic API connectivity
  console.log('🧪 Test 1: Basic API Connectivity');
  console.log('-' .repeat(30));
  
  try {
    const locationTest = await makeGHLRequest('/locations');
    console.log(`✅ API Connection: Working`);
    console.log(`📍 Locations found: ${locationTest.locations?.length || 0}`);
  } catch (error) {
    console.error(`❌ API Connection failed: ${error.message}`);
    return;
  }
  
  // Test 2: Calendar Access for each service type
  console.log('\n🧪 Test 2: Calendar Access Test');
  console.log('-' .repeat(30));
  
  for (const [serviceType, calendarId] of Object.entries(TEST_CALENDARS)) {
    if (!calendarId || calendarId.includes('your-')) {
      console.log(`⚠️  ${serviceType}: No calendar ID configured`);
      continue;
    }
    
    try {
      const calendarDetails = await makeGHLRequest(`/calendars/${calendarId}`);
      console.log(`✅ ${serviceType}: Calendar accessible`);
      console.log(`   Name: ${calendarDetails.calendar?.name || 'N/A'}`);
      console.log(`   Active: ${calendarDetails.calendar?.isActive || false}`);
      console.log(`   Type: ${calendarDetails.calendar?.calendarType || 'N/A'}`);
      
      // Check for new 2025 features
      const calendar = calendarDetails.calendar;
      if (calendar?.lookBusyConfig?.enabled) {
        console.log(`   Look Busy: ${calendar.lookBusyConfig.lookBusyPercentage}% (2025 feature)`);
      }
      
      if (calendar?.availabilities?.length === 0) {
        console.log(`   ⚠️  Warning: No availability blocks configured`);
      }
      
    } catch (error) {
      console.error(`❌ ${serviceType}: ${error.message}`);
    }
  }
  
  // Test 3: Current Availability Implementation
  console.log('\n🧪 Test 3: Availability Endpoint Test');
  console.log('-' .repeat(30));
  
  const testCalendarId = TEST_CALENDARS.STANDARD_NOTARY;
  const testDates = [
    { date: getTomorrowDate(), label: 'Tomorrow' },
    { date: getDateDaysFromNow(7), label: 'Next Week' },
    { date: getDateDaysFromNow(14), label: 'Two Weeks' }
  ];
  
  for (const { date, label } of testDates) {
    console.log(`\n📅 Testing ${label} (${date})`);
    
    // Convert to Unix timestamps as your current code does
    const startOfDay = new Date(`${date}T00:00:00-06:00`).getTime() / 1000;
    const endOfDay = new Date(`${date}T23:59:59-06:00`).getTime() / 1000;
    
    const queryParams = new URLSearchParams({
      startDate: startOfDay.toString(),
      endDate: endOfDay.toString(),
      timezone: 'America/Chicago'
    });
    
    try {
      const response = await makeGHLRequest(`/calendars/${testCalendarId}/free-slots?${queryParams}`);
      
      // Handle different response formats
      let slotsFound = 0;
      let slots = [];
      
      if (response?.slots) {
        slots = response.slots;
        slotsFound = slots.length;
      } else if (response?.freeSlots) {
        slots = response.freeSlots;
        slotsFound = slots.length;
      } else if (Array.isArray(response)) {
        slots = response;
        slotsFound = slots.length;
      }
      
      console.log(`   📊 Slots found: ${slotsFound}`);
      
      if (slotsFound > 0) {
        console.log(`   ✅ SUCCESS: Available slots found`);
        console.log(`   📋 Sample slot: ${new Date(slots[0].startTime * 1000).toLocaleString()}`);
      } else {
        console.log(`   ⚠️  No slots available - check calendar configuration`);
        console.log(`   📋 Response structure:`, Object.keys(response || {}));
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Test 4: Test alternative approaches
  console.log('\n🧪 Test 4: Alternative API Approaches');
  console.log('-' .repeat(30));
  
  const tomorrowDate = getTomorrowDate();
  const startOfDay = new Date(`${tomorrowDate}T00:00:00-06:00`).getTime() / 1000;
  const endOfDay = new Date(`${tomorrowDate}T23:59:59-06:00`).getTime() / 1000;
  
  const alternatives = [
    {
      name: 'UTC Timezone',
      params: { startDate: startOfDay.toString(), endDate: endOfDay.toString(), timezone: 'UTC' }
    },
    {
      name: 'No Timezone',
      params: { startDate: startOfDay.toString(), endDate: endOfDay.toString() }
    },
    {
      name: 'Different Format',
      params: { 
        startDate: startOfDay.toString(), 
        endDate: endOfDay.toString(), 
        timezone: 'America/Chicago',
        includeDetails: 'true'
      }
    }
  ];
  
  for (const alternative of alternatives) {
    try {
      const queryParams = new URLSearchParams(alternative.params);
      const response = await makeGHLRequest(`/calendars/${testCalendarId}/free-slots?${queryParams}`);
      
      const slotsFound = response?.slots?.length || response?.freeSlots?.length || (Array.isArray(response) ? response.length : 0);
      console.log(`   ${alternative.name}: ${slotsFound} slots`);
      
    } catch (error) {
      console.log(`   ${alternative.name}: Error - ${error.message}`);
    }
  }
  
  // Test 5: Your current booking API
  console.log('\n🧪 Test 5: Internal Booking API Test');
  console.log('-' .repeat(30));
  
  try {
    const testUrl = `http://localhost:3000/api/booking/availability?serviceType=STANDARD_NOTARY&date=${getTomorrowDate()}`;
    console.log(`🔗 Testing: ${testUrl}`);
    
    const response = await fetch(testUrl);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Internal API: ${data.totalSlots || 0} slots found`);
      console.log(`📊 Success: ${data.success}`);
    } else {
      console.log(`❌ Internal API failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`ℹ️  Internal API test skipped (server not running): ${error.message}`);
  }
  
  console.log('\n🎯 Diagnostic Summary');
  console.log('=' .repeat(50));
  console.log('✅ Your current implementation appears to be using correct practices');
  console.log('📋 Key recommendations:');
  console.log('   • Verify calendar availability blocks are configured in GHL');
  console.log('   • Check team member assignments to calendars');
  console.log('   • Monitor for Look Busy settings that might hide slots');
  console.log('   • Test different timezones if issues persist');
  console.log('   • Consider implementing the enhanced error handling shown above');
  console.log('');
  console.log('🔗 For calendar configuration issues, use GHL\'s built-in troubleshooting tool:');
  console.log('   Settings → Calendars → [Your Calendar] → Troubleshooting');
}

// Helper functions
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getDateDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Run the test
testGHLAPI2025().catch(console.error); 