#!/usr/bin/env node

/**
 * Google Calendar Conflict Diagnostic
 * Houston Mobile Notary Pros
 * 
 * Checks for Google Calendar conflicts and user availability issues
 * Run with: npx tsx scripts/diagnose-google-calendar-conflicts.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Test calendar and user
const TEST_CALENDAR_ID = 'XhHkzwNbT1MSWcGsfBjl'; // Standard Notary
const USER_ID = 'dYOQIx02wwBVjY4ihxoY'; // Kenny Lightfoot

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
 * Check user availability settings
 */
async function checkUserAvailability() {
  console.log(`\n👤 Checking User Availability Settings`);
  console.log('=' .repeat(40));
  
  try {
    const user = await makeGHLRequest(`/users/${USER_ID}`);
    
    console.log('📋 User Name:', user.name);
    console.log('📋 User Email:', user.email);
    console.log('📋 User Type:', user.type);
    console.log('📋 User Timezone:', user.timezone || 'Not set');
    
    // Check if user has availability settings
    if (user.availability) {
      console.log('📋 User Availability Found:', JSON.stringify(user.availability, null, 2));
    } else {
      console.log('📋 User Availability: No specific settings (should inherit from calendar)');
    }
    
    // Check user calendars/integrations
    if (user.integrations) {
      console.log('📋 User Integrations:', Object.keys(user.integrations));
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error checking user availability:', error.message);
    return null;
  }
}

/**
 * Check calendar integrations and Google Calendar connection
 */
async function checkCalendarIntegrations() {
  console.log(`\n📅 Checking Calendar Integrations`);
  console.log('=' .repeat(40));
  
  try {
    // Check location integrations
    const location = await makeGHLRequest(`/locations/${GHL_LOCATION_ID}`);
    
    if (location.integrations) {
      console.log('📋 Location Integrations:', Object.keys(location.integrations));
      
      // Check Google Calendar integration
      if (location.integrations.googleCalendar) {
        console.log('✅ Google Calendar Integration Found');
        console.log('📋 Google Calendar Config:', JSON.stringify(location.integrations.googleCalendar, null, 2));
      } else {
        console.log('❌ No Google Calendar Integration Found');
      }
    } else {
      console.log('📋 No integrations found for location');
    }
    
    return location.integrations;
  } catch (error) {
    console.error('❌ Error checking calendar integrations:', error.message);
    return null;
  }
}

/**
 * Check for calendar events/conflicts on specific dates
 */
async function checkCalendarEvents(testDates) {
  console.log(`\n🗓️  Checking Calendar Events & Conflicts`);
  console.log('=' .repeat(40));
  
  for (const testDate of testDates) {
    console.log(`\n📅 Checking ${testDate}:`);
    
    try {
      const startTimestamp = Math.floor(new Date(`${testDate}T00:00:00.000Z`).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(`${testDate}T23:59:59.999Z`).getTime() / 1000);
      
      // Try different endpoints to find calendar events
      const endpoints = [
        `/calendars/events?locationId=${GHL_LOCATION_ID}&userId=${USER_ID}&startTime=${testDate}T00:00:00.000Z&endTime=${testDate}T23:59:59.999Z`,
        `/calendars/events?calendarId=${TEST_CALENDAR_ID}&startTime=${testDate}T00:00:00.000Z&endTime=${testDate}T23:59:59.999Z`,
        `/calendars/${TEST_CALENDAR_ID}/events?startTime=${testDate}T00:00:00.000Z&endTime=${testDate}T23:59:59.999Z`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const events = await makeGHLRequest(endpoint);
          
          if (events && events.events && events.events.length > 0) {
            console.log(`📋 Found ${events.events.length} events via ${endpoint}:`);
            events.events.slice(0, 3).forEach(event => {
              console.log(`   • ${event.title || 'Untitled'} (${event.startTime} - ${event.endTime})`);
              console.log(`     Status: ${event.status}, Source: ${event.source || 'Unknown'}`);
            });
            return events.events;
          }
        } catch (error) {
          // Silently continue to next endpoint
          console.log(`   ⚠️  Endpoint failed: ${endpoint.split('?')[0]}`);
        }
      }
      
      console.log(`   ✅ No events found for ${testDate}`);
      
    } catch (error) {
      console.error(`❌ Error checking events for ${testDate}:`, error.message);
    }
  }
  
  return [];
}

/**
 * Test different ways to get availability
 */
async function testAvailabilityMethods(testDate) {
  console.log(`\n🔍 Testing Different Availability Methods for ${testDate}`);
  console.log('=' .repeat(40));
  
  const startTimestamp = Math.floor(new Date(`${testDate}T00:00:00.000Z`).getTime() / 1000);
  const endTimestamp = Math.floor(new Date(`${testDate}T23:59:59.999Z`).getTime() / 1000);
  
  const methods = [
    {
      name: 'Standard Method',
      endpoint: `/calendars/${TEST_CALENDAR_ID}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago`
    },
    {
      name: 'With User ID',
      endpoint: `/calendars/${TEST_CALENDAR_ID}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago&userId=${USER_ID}`
    },
    {
      name: 'Different Timezone',
      endpoint: `/calendars/${TEST_CALENDAR_ID}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/New_York`
    },
    {
      name: 'UTC Timezone',
      endpoint: `/calendars/${TEST_CALENDAR_ID}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=UTC`
    }
  ];
  
  for (const method of methods) {
    try {
      const result = await makeGHLRequest(method.endpoint);
      
      let slotsFound = 0;
      if (result && result.freeSlots) {
        slotsFound = result.freeSlots.length;
      } else if (Array.isArray(result)) {
        slotsFound = result.length;
      }
      
      console.log(`📊 ${method.name}: ${slotsFound} slots`);
      if (slotsFound > 0) {
        console.log(`   🎉 SUCCESS! Found slots with: ${method.name}`);
        console.log(`   📋 Sample slots:`, result.freeSlots?.slice(0, 2) || result.slice(0, 2));
        return { method: method.name, slots: slotsFound, result };
      }
      
    } catch (error) {
      console.log(`📊 ${method.name}: ERROR - ${error.message}`);
    }
  }
  
  return null;
}

/**
 * Check Google Calendar specific issues
 */
async function checkGoogleCalendarIssues() {
  console.log(`\n🔍 Checking Google Calendar Specific Issues`);
  console.log('=' .repeat(40));
  
  // Get current calendar details to check Google Calendar connection
  try {
    const calendarResponse = await makeGHLRequest(`/calendars/${TEST_CALENDAR_ID}`);
    const calendar = calendarResponse.calendar;
    
    console.log('📋 Calendar Google Integration Settings:');
    console.log('   Auto Confirm:', calendar.autoConfirm);
    console.log('   Google Invitation Emails:', calendar.googleInvitationEmails);
    console.log('   Should Assign Contact to Team Member:', calendar.shouldAssignContactToTeamMember);
    
    // Check team member settings
    if (calendar.teamMembers && calendar.teamMembers.length > 0) {
      const teamMember = calendar.teamMembers[0];
      console.log('📋 Team Member Settings:');
      console.log('   User ID:', teamMember.userId);
      console.log('   Selected:', teamMember.selected);
      console.log('   Is Primary:', teamMember.isPrimary);
      console.log('   Priority:', teamMember.priority);
      
      if (teamMember.isZoomAdded) {
        console.log('   Zoom Added:', teamMember.isZoomAdded);
      }
    }
    
    return calendar;
  } catch (error) {
    console.error('❌ Error checking Google Calendar issues:', error.message);
    return null;
  }
}

/**
 * Main diagnostic function
 */
async function runGoogleCalendarDiagnostic() {
  console.log('🔍 Google Calendar Conflict Diagnostic');
  console.log('=====================================');
  console.log(`📅 System Date: ${new Date().toISOString()}`);
  console.log(`👤 User ID: ${USER_ID}`);
  console.log(`📋 Calendar ID: ${TEST_CALENDAR_ID}`);
  console.log('');
  
  // Test dates
  const testDates = [
    new Date().toISOString().split('T')[0], // Today
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
  ];
  
  console.log(`📅 Testing dates: ${testDates.join(', ')}`);
  
  try {
    // Run all diagnostics
    const userInfo = await checkUserAvailability();
    const integrations = await checkCalendarIntegrations();
    const calendarInfo = await checkGoogleCalendarIssues();
    const events = await checkCalendarEvents(testDates);
    
    // Test availability with different methods
    let workingMethod = null;
    for (const testDate of testDates) {
      workingMethod = await testAvailabilityMethods(testDate);
      if (workingMethod) break;
    }
    
    // Final diagnosis
    console.log('\n🎯 DIAGNOSIS SUMMARY');
    console.log('====================');
    
    if (workingMethod) {
      console.log('✅ FOUND WORKING METHOD!');
      console.log(`   Method: ${workingMethod.method}`);
      console.log(`   Slots: ${workingMethod.slots}`);
    } else {
      console.log('❌ NO SLOTS FOUND with any method');
      
      console.log('\n🔧 POTENTIAL ISSUES:');
      
      if (!userInfo) {
        console.log('   • Cannot access user information');
      }
      
      if (!integrations || !integrations.googleCalendar) {
        console.log('   • Google Calendar integration may not be properly connected');
      }
      
      if (events && events.length > 0) {
        console.log(`   • Found ${events.length} calendar events that might be blocking slots`);
      }
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('   1. Check Google Calendar for blocking events');
      console.log('   2. Disconnect and reconnect Google Calendar in GHL');
      console.log('   3. Verify user timezone settings match calendar timezone');
      console.log('   4. Check if "Look Busy" or similar blocking features are enabled');
      console.log('   5. Try creating a test calendar without Google Calendar sync');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Run the diagnostic
runGoogleCalendarDiagnostic().catch(console.error); 