#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

async function makeGHLRequest(endpoint, method = 'GET', body = null) {
  const url = `${GHL_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28', // Using working API version
      'User-Agent': 'HMNP-BookingSystem/1.0',
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

async function testImprovedCalendarSlots() {
  console.log('🧪 Testing Improved Calendar Slots Function');
  console.log('═'.repeat(60));
  
  const calendarId = 'XhHkzwNbT1MSWcGsfBjl'; // Standard Notary Services
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  console.log(`🔍 Testing calendar: ${calendarId}`);
  console.log(`📅 Testing date: ${dateStr}`);
  console.log('');
  
  try {
    // Step 1: Test free-slots endpoint
    console.log('📋 Step 1: Testing free-slots endpoint');
    console.log('-'.repeat(40));
    
    const startOfDay = new Date(`${dateStr}T00:00:00-06:00`).getTime() / 1000;
    const endOfDay = new Date(`${dateStr}T23:59:59-06:00`).getTime() / 1000;
    
    const queryParams = new URLSearchParams({
      startDate: startOfDay.toString(),
      endDate: endOfDay.toString(),
      timezone: 'America/Chicago'
    });
    
    const freesSlotsEndpoint = `/calendars/${calendarId}/free-slots?${queryParams}`;
    console.log(`🔗 Endpoint: ${freesSlotsEndpoint}`);
    
    const freeSlotsResponse = await makeGHLRequest(freesSlotsEndpoint, 'GET');
    console.log('📊 Free slots response:', JSON.stringify(freeSlotsResponse, null, 2));
    
    if (freeSlotsResponse?.slots?.length > 0) {
      console.log(`✅ Found ${freeSlotsResponse.slots.length} free slots!`);
      return freeSlotsResponse;
    }
    
    console.log('⚠️  No free slots found, checking calendar configuration...');
    
    // Step 2: Get calendar details
    console.log('\n📋 Step 2: Checking calendar configuration');
    console.log('-'.repeat(40));
    
    const calendarDetails = await makeGHLRequest(`/calendars/${calendarId}`, 'GET');
    console.log('📊 Calendar details:', JSON.stringify(calendarDetails, null, 2));
    
    // Check configuration
    console.log('\n🔍 Configuration Analysis:');
    console.log(`   Name: ${calendarDetails.name || 'NOT SET'}`);
    console.log(`   Active: ${calendarDetails.isActive ? 'YES' : 'NO'}`);
    console.log(`   Team Members: ${calendarDetails.teamMembers?.length || 0}`);
    console.log(`   Slot Duration: ${calendarDetails.slotDuration || 'NOT SET'} minutes`);
    console.log(`   Open Hours: ${calendarDetails.openHours?.filter(day => day?.length > 0).length || 0} days configured`);
    console.log(`   Availability Blocks: ${calendarDetails.availabilities?.length || 0} blocks`);
    
    // Step 3: Check existing events
    console.log('\n📋 Step 3: Checking existing events');
    console.log('-'.repeat(40));
    
    const eventsEndpoint = `/calendars/events?calendarId=${calendarId}&startDate=${startOfDay}&endDate=${endOfDay}`;
    const eventsResponse = await makeGHLRequest(eventsEndpoint, 'GET');
    console.log('📊 Events response:', JSON.stringify(eventsResponse, null, 2));
    
    console.log(`   Found ${eventsResponse?.events?.length || 0} existing events`);
    
    // Step 4: Analysis and recommendations
    console.log('\n🎯 Analysis and Recommendations:');
    console.log('═'.repeat(50));
    
    if (!calendarDetails.isActive) {
      console.log('❌ ISSUE: Calendar is not active');
      console.log('   FIX: Go to GHL dashboard and activate the calendar');
    }
    
    if (!calendarDetails.teamMembers || calendarDetails.teamMembers.length === 0) {
      console.log('❌ ISSUE: No team members assigned to calendar');
      console.log('   FIX: Add Kenny Lightfoot to the calendar team');
    }
    
    if (!calendarDetails.slotDuration) {
      console.log('❌ ISSUE: No slot duration configured');
      console.log('   FIX: Set slot duration to 30 minutes');
    }
    
    if (!calendarDetails.availabilities || calendarDetails.availabilities.length === 0) {
      console.log('❌ CRITICAL ISSUE: No availability blocks configured');
      console.log('   FIX: Add availability blocks for business hours');
      console.log('   EXAMPLE: Monday-Friday 9:00 AM - 5:00 PM');
    }
    
    if (!calendarDetails.openHours || calendarDetails.openHours.filter(day => day?.length > 0).length === 0) {
      console.log('❌ ISSUE: No open hours configured');
      console.log('   FIX: Set weekly open hours in GHL');
    }
    
    return {
      slots: [],
      calendarDetails,
      eventsResponse,
      analysis: 'Calendar configuration incomplete'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { error: error.message };
  }
}

testImprovedCalendarSlots().then(result => {
  console.log('\n🎯 Final Result:');
  console.log('═'.repeat(60));
  if (result.slots && result.slots.length > 0) {
    console.log(`✅ SUCCESS: Found ${result.slots.length} available slots`);
  } else {
    console.log('❌ NO SLOTS: Calendar needs configuration in GHL dashboard');
  }
}).catch(console.error); 