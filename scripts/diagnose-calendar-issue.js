#!/usr/bin/env node

/**
 * GHL Calendar Diagnostic Script
 * Houston Mobile Notary Pros
 * 
 * Comprehensive diagnosis of calendar availability issues
 * Run with: npx tsx scripts/diagnose-calendar-issue.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Test calendar ID
const TEST_CALENDAR_ID = 'w3sjmTzBfuahySgQvKoV'; // Standard Notary

/**
 * Make authenticated request to GHL API
 */
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
  
  console.log(`🔗 ${method} ${endpoint}`);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL API Error (${response.status}): ${errorText}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return await response.json();
}

/**
 * Check user details
 */
async function checkUserDetails(userId) {
  console.log(`\n👤 Checking User Details: ${userId}`);
  console.log('=' .repeat(40));
  
  try {
    const user = await makeGHLRequest(`/users/${userId}`);
    console.log('📋 User Status:', user.type || 'Unknown');
    console.log('📋 User Active:', user.deleted ? 'NO (Deleted)' : 'YES');
    console.log('📋 User Email:', user.email || 'Not set');
    console.log('📋 User Name:', user.name || 'Not set');
    
    if (user.deleted) {
      console.log('❌ ISSUE FOUND: User is deleted/inactive!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking user:', error.message);
    return false;
  }
}

/**
 * Check location settings
 */
async function checkLocationSettings() {
  console.log(`\n🏢 Checking Location Settings`);
  console.log('=' .repeat(40));
  
  try {
    const location = await makeGHLRequest(`/locations/${GHL_LOCATION_ID}`);
    console.log('📋 Location Name:', location.name || 'Not set');
    console.log('📋 Location Timezone:', location.timezone || 'Not set');
    console.log('📋 Location Active:', location.deleted ? 'NO' : 'YES');
    
    if (location.deleted) {
      console.log('❌ ISSUE FOUND: Location is deleted/inactive!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking location:', error.message);
    return false;
  }
}

/**
 * Check calendar conflicts/blocks
 */
async function checkCalendarBlocks(calendarId, testDate) {
  console.log(`\n🚫 Checking Calendar Blocks & Conflicts`);
  console.log('=' .repeat(40));
  
  try {
    // Check if there are any blocked slots
    const startTimestamp = Math.floor(new Date(`${testDate}T00:00:00.000Z`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${testDate}T23:59:59.999Z`).getTime() / 1000);
    
    // Try to get calendar events/blocks
    const events = await makeGHLRequest(`/calendars/events?locationId=${GHL_LOCATION_ID}&startDate=${startTimestamp}&endDate=${endTimestamp}`);
    
    console.log('📊 Calendar Events Found:', events?.events?.length || 0);
    
    if (events?.events?.length > 0) {
      console.log('📋 Found Calendar Events:');
      events.events.forEach((event, i) => {
        console.log(`  ${i+1}. ${event.title || 'Untitled'} (${event.startTime} - ${event.endTime})`);
        console.log(`     Status: ${event.status || 'Unknown'}`);
        console.log(`     Calendar: ${event.calendarId}`);
      });
    }
    
    return events?.events || [];
  } catch (error) {
    console.error('❌ Error checking calendar blocks:', error.message);
    return [];
  }
}

/**
 * Test different date ranges
 */
async function testDateRanges(calendarId) {
  console.log(`\n📅 Testing Different Date Ranges`);
  console.log('=' .repeat(40));
  
  const dates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: '+2 Days', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { label: '+7 Days', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { label: '+14 Days', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
  ];
  
  for (const { label, date } of dates) {
    const testDate = date.toISOString().split('T')[0];
    const startTimestamp = Math.floor(new Date(`${testDate}T00:00:00.000Z`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${testDate}T23:59:59.999Z`).getTime() / 1000);
    
    try {
      const availability = await makeGHLRequest(
        `/calendars/${calendarId}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago`
      );
      
      let slotsFound = 0;
      if (availability && availability.freeSlots) {
        slotsFound = availability.freeSlots.length;
      } else if (Array.isArray(availability)) {
        slotsFound = availability.length;
      }
      
      console.log(`📊 ${label} (${testDate}): ${slotsFound} slots available`);
      
      if (slotsFound > 0) {
        console.log(`   ✅ SUCCESS! Found slots for ${label}`);
        console.log(`   📋 Sample slots:`, availability.freeSlots?.slice(0, 3) || availability.slice(0, 3));
        return { date: testDate, slots: slotsFound, success: true };
      }
      
    } catch (error) {
      console.log(`📊 ${label} (${testDate}): ERROR - ${error.message}`);
    }
  }
  
  return { success: false };
}

/**
 * Check if calendar requires specific availability settings
 */
async function checkAvailabilitySettings(calendar) {
  console.log(`\n⚙️  Checking Availability Settings`);
  console.log('=' .repeat(40));
  
  console.log('📋 Open Hours:', calendar.openHours?.length || 0, 'periods configured');
  console.log('📋 Availabilities:', calendar.availabilities?.length || 0, 'custom periods');
  console.log('📋 Look Busy:', calendar.lookBusyConfig?.enabled ? 'YES' : 'NO');
  console.log('📋 Auto Confirm:', calendar.autoConfirm ? 'YES' : 'NO');
  console.log('📋 Min Notice:', calendar.allowBookingAfter, calendar.allowBookingAfterUnit);
  console.log('📋 Max Advance:', calendar.allowBookingFor, calendar.allowBookingForUnit);
  console.log('📋 Slot Duration:', calendar.slotDuration, calendar.slotDurationUnit);
  console.log('📋 Slot Interval:', calendar.slotInterval, calendar.slotIntervalUnit);
  console.log('📋 Buffer Time:', calendar.slotBuffer, calendar.slotBufferUnit);
  console.log('📋 Appointments per Slot:', calendar.appoinmentPerSlot);
  console.log('📋 Appointments per Day:', calendar.appoinmentPerDay);
  
  // Check for potential issues
  const issues = [];
  
  if (!calendar.openHours || calendar.openHours.length === 0) {
    issues.push('No open hours configured');
  }
  
  if (calendar.lookBusyConfig?.enabled && calendar.lookBusyConfig?.lookBusyPercentage >= 100) {
    issues.push('Look Busy is set to 100% - blocking all slots');
  }
  
  if (calendar.allowBookingAfter > 24) {
    issues.push(`Minimum notice is ${calendar.allowBookingAfter} ${calendar.allowBookingAfterUnit} - might be too restrictive`);
  }
  
  if (calendar.allowBookingFor < 7) {
    issues.push(`Only allowing ${calendar.allowBookingFor} ${calendar.allowBookingForUnit} advance booking - might be too short`);
  }
  
  if (issues.length > 0) {
    console.log('\n❌ POTENTIAL ISSUES FOUND:');
    issues.forEach(issue => console.log(`   • ${issue}`));
  } else {
    console.log('\n✅ Availability settings look good');
  }
  
  return issues;
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log('🔍 Houston Mobile Notary Pros - Calendar Diagnostics');
  console.log('====================================================');
  console.log(`📅 System Date: ${new Date().toISOString()}`);
  console.log(`📍 Location ID: ${GHL_LOCATION_ID}`);
  console.log(`📋 Test Calendar: ${TEST_CALENDAR_ID}`);
  console.log('');
  
  try {
    // Get calendar details
    console.log('🔍 Getting calendar details...');
    const calendarResponse = await makeGHLRequest(`/calendars/${TEST_CALENDAR_ID}`);
    const calendar = calendarResponse.calendar;
    
    if (!calendar) {
      console.error('❌ Calendar not found!');
      return;
    }
    
    console.log(`✅ Calendar found: ${calendar.name}`);
    console.log(`📋 Calendar active: ${calendar.isActive ? 'YES' : 'NO'}`);
    console.log(`📋 Team members: ${calendar.teamMembers?.length || 0}`);
    
    // Run diagnostics
    const results = {
      calendarActive: calendar.isActive,
      teamMembers: calendar.teamMembers?.length || 0,
      userActive: true,
      locationActive: true,
      availabilityIssues: [],
      dateRangeTest: { success: false }
    };
    
    // Check user
    if (calendar.teamMembers && calendar.teamMembers.length > 0) {
      const userId = calendar.teamMembers[0].userId;
      results.userActive = await checkUserDetails(userId);
    }
    
    // Check location
    results.locationActive = await checkLocationSettings();
    
    // Check availability settings
    results.availabilityIssues = await checkAvailabilitySettings(calendar);
    
    // Test date ranges
    results.dateRangeTest = await testDateRanges(TEST_CALENDAR_ID);
    
    // Check for conflicts
    if (results.dateRangeTest.success) {
      await checkCalendarBlocks(TEST_CALENDAR_ID, results.dateRangeTest.date);
    } else {
      await checkCalendarBlocks(TEST_CALENDAR_ID, new Date().toISOString().split('T')[0]);
    }
    
    // Final diagnosis
    console.log('\n🎯 FINAL DIAGNOSIS');
    console.log('==================');
    
    if (results.dateRangeTest.success) {
      console.log('✅ CALENDAR IS WORKING! Found available slots.');
      console.log(`   The issue might be with specific dates or your booking flow.`);
    } else {
      console.log('❌ NO SLOTS FOUND for any test dates.');
      console.log('\nPossible causes:');
      
      if (!results.calendarActive) console.log('   • Calendar is not active');
      if (!results.userActive) console.log('   • Assigned user is inactive');
      if (!results.locationActive) console.log('   • Location is inactive');
      if (results.availabilityIssues.length > 0) {
        console.log('   • Availability configuration issues:');
        results.availabilityIssues.forEach(issue => console.log(`     - ${issue}`));
      }
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      console.log('1. Check GHL dashboard: Settings > Calendars > Standard Notary Services');
      console.log('2. Verify user assignment and user is active');
      console.log('3. Check for Google Calendar conflicts');
      console.log('4. Ensure minimum notice period isn\'t too restrictive');
      console.log('5. Contact GHL support if all settings appear correct');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Run diagnostics
runDiagnostics().catch(console.error); 