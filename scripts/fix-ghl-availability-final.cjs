#!/usr/bin/env node

/**
 * GHL Calendar Availability Fix - Final Troubleshooting
 * Based on official GHL documentation for calendar availability
 * 
 * This script follows the exact steps from GHL's guide to diagnose
 * why calendars return empty slots despite successful API calls.
 */

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Your calendar IDs that need to work
const CALENDARS_TO_FIX = {
  'STANDARD_NOTARY': 'XhHkzwNbT1MSWcGsfBjl',
  'EXTENDED_HOURS': 'BjSsV5TuN8kJSexADD9W',
  'LOAN_SIGNING': 'gp2EBhGYgfYTNwJ0LlhK',
  'RON_SERVICES': 'FMg76LwuDd9RLJNekQId'
};

async function makeGHLRequest(endpoint, method = 'GET', body = null) {
  const url = `${GHL_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
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

async function diagnoseAndFixAvailability() {
  console.log('🔧 GHL Calendar Availability Fix - Final Diagnosis');
  console.log('=' .repeat(60));
  
  if (!GHL_PRIVATE_INTEGRATION_TOKEN) {
    console.error('❌ Missing GHL_PRIVATE_INTEGRATION_TOKEN');
    return;
  }
  
  console.log(`🔐 Token: ${GHL_PRIVATE_INTEGRATION_TOKEN.substring(0, 10)}...`);
  console.log(`📍 Location: ${GHL_LOCATION_ID}`);
  console.log('');

  // Step 1: Verify authentication and token scope
  console.log('🔑 STEP 1: Authentication & Token Verification');
  console.log('-' .repeat(50));
  
  try {
    const location = await makeGHLRequest(`/locations/${GHL_LOCATION_ID}`);
    console.log(`✅ Authentication: Valid`);
    console.log(`📍 Location: ${location.name}`);
  } catch (error) {
    console.error(`❌ Authentication failed: ${error.message}`);
    return;
  }

  // Step 2: Get all calendars and verify IDs
  console.log('\n📅 STEP 2: Calendar ID Verification');
  console.log('-' .repeat(50));
  
  try {
    const calendarsResponse = await makeGHLRequest(`/locations/${GHL_LOCATION_ID}/calendars`);
    const allCalendars = calendarsResponse.calendars || [];
    
    console.log(`📋 Found ${allCalendars.length} total calendars in location`);
    
    for (const [serviceType, calendarId] of Object.entries(CALENDARS_TO_FIX)) {
      const found = allCalendars.find(cal => cal.id === calendarId);
      if (found) {
        console.log(`✅ ${serviceType}: ${found.name} (${calendarId})`);
      } else {
        console.log(`❌ ${serviceType}: Calendar ${calendarId} NOT FOUND in location`);
      }
    }
  } catch (error) {
    console.error(`❌ Calendar list failed: ${error.message}`);
  }

  // Step 3: Detailed calendar analysis for each calendar
  console.log('\n🔍 STEP 3: Detailed Calendar Analysis');
  console.log('-' .repeat(50));
  
  for (const [serviceType, calendarId] of Object.entries(CALENDARS_TO_FIX)) {
    console.log(`\n📅 Analyzing ${serviceType} (${calendarId})`);
    console.log('─' .repeat(40));
    
    try {
      const calendar = await makeGHLRequest(`/calendars/${calendarId}`);
      const cal = calendar.calendar || calendar;
      
      console.log(`📋 Basic Info:`);
      console.log(`   Name: ${cal.name}`);
      console.log(`   Active: ${cal.isActive}`);
      console.log(`   Type: ${cal.calendarType}`);
      
      // Check team members (CRITICAL)
      console.log(`\n👥 Team Members:`);
      if (cal.teamMembers && cal.teamMembers.length > 0) {
        cal.teamMembers.forEach((member, i) => {
          console.log(`   ${i + 1}. User ID: ${member.userId || member.id}`);
          console.log(`      Selected: ${member.selected !== false}`);
          console.log(`      Primary: ${member.isPrimary || false}`);
        });
      } else {
        console.log(`   ❌ NO TEAM MEMBERS ASSIGNED - This is likely the issue!`);
      }
      
      // Check availability blocks (CRITICAL)
      console.log(`\n⏰ Availability Configuration:`);
      console.log(`   Open Hours: ${cal.openHours?.length || 0} configured`);
      console.log(`   Availabilities: ${cal.availabilities?.length || 0} blocks`);
      
      if (cal.openHours && cal.openHours.length > 0) {
        console.log(`   📋 Open Hours Details:`);
        cal.openHours.forEach((hours, i) => {
          if (hours.hours && hours.hours.length > 0) {
            console.log(`     Day ${hours.daysOfTheWeek}: ${JSON.stringify(hours.hours)}`);
          } else {
            console.log(`     Day ${hours.daysOfTheWeek}: No hours configured`);
          }
        });
      } else {
        console.log(`   ❌ NO OPEN HOURS CONFIGURED - This is likely the issue!`);
      }
      
      // Check booking settings
      console.log(`\n⚙️ Booking Settings:`);
      console.log(`   Slot Duration: ${cal.slotDuration} ${cal.slotDurationUnit || 'minutes'}`);
      console.log(`   Slot Interval: ${cal.slotInterval} ${cal.slotIntervalUnit || 'minutes'}`);
      console.log(`   Min Notice: ${cal.allowBookingAfter} ${cal.allowBookingAfterUnit || 'hours'}`);
      console.log(`   Max Advance: ${cal.allowBookingFor} ${cal.allowBookingForUnit || 'days'}`);
      console.log(`   Auto Confirm: ${cal.autoConfirm}`);
      
    } catch (error) {
      console.log(`❌ Failed to analyze: ${error.message}`);
    }
  }

  // Step 4: Test free-slots endpoint with proper parameters
  console.log('\n🧪 STEP 4: Free Slots Testing (Following GHL Guide)');
  console.log('-' .repeat(50));
  
  // Test dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const endDate = nextWeek.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  console.log(`📅 Testing date range: ${startDate} to ${endDate}`);
  console.log(`🕐 Using timezone: America/Chicago`);
  
  for (const [serviceType, calendarId] of Object.entries(CALENDARS_TO_FIX)) {
    console.log(`\n🔍 Testing ${serviceType}:`);
    
    try {
      // Following the exact format from GHL documentation
      const endpoint = `/calendars/${calendarId}/free-slots?startDate=${startDate}&endDate=${endDate}&timezone=America/Chicago`;
      console.log(`   Endpoint: ${endpoint}`);
      
      const response = await makeGHLRequest(endpoint);
      
      if (response && response.slots && response.slots.length > 0) {
        console.log(`   ✅ SUCCESS: ${response.slots.length} slots found!`);
        console.log(`   📋 Sample slots:`);
        response.slots.slice(0, 3).forEach(slot => {
          console.log(`     • ${slot.startTime} - ${slot.endTime}`);
        });
      } else if (response && response.freeSlots && response.freeSlots.length > 0) {
        console.log(`   ✅ SUCCESS: ${response.freeSlots.length} slots found!`);
      } else {
        console.log(`   ❌ NO SLOTS: Empty response`);
        console.log(`   📋 Response: ${JSON.stringify(response, null, 2)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }

  // Step 5: Provide specific fixes
  console.log('\n🛠️  STEP 5: Required Fixes');
  console.log('-' .repeat(50));
  
  console.log(`\n📋 Based on the analysis above, here's what you need to fix in GHL:`);
  console.log('');
  
  console.log(`1. 👥 ASSIGN TEAM MEMBERS to calendars:`);
  console.log(`   → Go to Settings → Calendars → [Calendar Name]`);
  console.log(`   → Click "Team Members" tab`);
  console.log(`   → Add at least one team member to each calendar`);
  console.log(`   → Make sure they're marked as "Selected"`);
  console.log('');
  
  console.log(`2. ⏰ CONFIGURE WORKING HOURS:`);
  console.log(`   → Go to Settings → Calendars → [Calendar Name]`);
  console.log(`   → Click "Availability" tab`);
  console.log(`   → Set "Weekly Working Hours" (e.g., Mon-Fri 9am-5pm)`);
  console.log(`   → OR set "Date-Specific Hours" for custom availability`);
  console.log('');
  
  console.log(`3. 👤 SET TEAM MEMBER PERSONAL AVAILABILITY:`);
  console.log(`   → Go to Settings → Team Members`);
  console.log(`   → Click on each team member`);
  console.log(`   → Set their personal availability hours`);
  console.log(`   → Make sure timezone is set to America/Chicago`);
  console.log('');
  
  console.log(`4. ✅ ENABLE RECURRING AVAILABILITY:`);
  console.log(`   → In calendar settings, look for "Recurring" options`);
  console.log(`   → Enable weekly recurring availability`);
  console.log(`   → Save all changes`);
  console.log('');
  
  console.log(`🎯 PRIORITY ORDER:`);
  console.log(`1. Fix team member assignments (most critical)`);
  console.log(`2. Set working hours/availability blocks`);
  console.log(`3. Configure team member personal availability`);
  console.log(`4. Test again with this script`);
  console.log('');
  
  console.log(`🔄 After making changes, run this script again:`);
  console.log(`node scripts/fix-ghl-availability-final.cjs`);
}

// Run the diagnosis
diagnoseAndFixAvailability().catch(console.error); 