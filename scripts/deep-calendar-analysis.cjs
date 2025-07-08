#!/usr/bin/env node

/**
 * Deep Calendar Analysis - Houston Mobile Notary Pros
 * 
 * Analyzing the discrepancy between list and individual calendar endpoints
 */

require('dotenv').config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

async function makeGHLRequest(endpoint) {
  const url = `${GHL_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      'User-Agent': 'HMNP-BookingSystem/1.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${await response.text()}`);
  }
  
  return await response.json();
}

async function analyzeCalendarDiscrepancy() {
  console.log('🔍 DEEP CALENDAR ANALYSIS');
  console.log('═'.repeat(60));
  console.log('Investigating discrepancy between list and individual calendar data...\n');
  
  try {
    // Step 1: Get list of calendars
    console.log('📋 Step 1: Fetching Calendar List');
    console.log('-'.repeat(40));
    
    const calendarList = await makeGHLRequest(`/calendars/?locationId=${GHL_LOCATION_ID}`);
    
    if (!calendarList.calendars || calendarList.calendars.length === 0) {
      console.log('❌ No calendars found in list!');
      return;
    }
    
    console.log(`✅ Found ${calendarList.calendars.length} calendars in list:\n`);
    
    const calendarMap = {};
    calendarList.calendars.forEach((cal, index) => {
      console.log(`${index + 1}. ${cal.name || 'UNNAMED'}`);
      console.log(`   ID: ${cal.id}`);
      console.log(`   Active: ${cal.isActive ? 'YES' : 'NO'}`);
      console.log(`   Team Members: ${cal.teamMembers?.length || 0}`);
      console.log(`   Widget Type: ${cal.widgetType || 'Not set'}`);
      console.log('');
      
      calendarMap[cal.id] = cal;
    });
    
    // Step 2: Get individual calendar details
    console.log('📋 Step 2: Fetching Individual Calendar Details');
    console.log('-'.repeat(50));
    
    for (const calendar of calendarList.calendars) {
      console.log(`\n🔍 Analyzing: ${calendar.name || 'UNNAMED'} (${calendar.id})`);
      console.log('-'.repeat(30));
      
      try {
        const individualCal = await makeGHLRequest(`/calendars/${calendar.id}`);
        
        // Compare list vs individual data
        console.log('LIST ENDPOINT vs INDIVIDUAL ENDPOINT:');
        console.log(`Name: "${calendar.name || 'NULL'}" vs "${individualCal.name || 'NULL'}"`);
        console.log(`Active: ${calendar.isActive} vs ${individualCal.isActive}`);
        console.log(`Team Members: ${calendar.teamMembers?.length || 0} vs ${individualCal.teamMembers?.length || 0}`);
        
        // Check for missing fields that might cause issues
        console.log('\nCRITICAL FIELDS CHECK:');
        console.log(`✓ Name: ${individualCal.name ? '✅' : '❌ MISSING'}`);
        console.log(`✓ Description: ${individualCal.description ? '✅' : '❌ MISSING'}`);
        console.log(`✓ Active: ${individualCal.isActive ? '✅' : '❌ INACTIVE'}`);
        console.log(`✓ Team Members: ${individualCal.teamMembers?.length > 0 ? '✅' : '❌ NONE'}`);
        console.log(`✓ Slot Duration: ${individualCal.slotDuration ? '✅' : '❌ MISSING'}`);
        console.log(`✓ Slot Interval: ${individualCal.slotInterval ? '✅' : '❌ MISSING'}`);
        console.log(`✓ Open Hours: ${individualCal.openHours?.some(day => day?.length > 0) ? '✅' : '❌ MISSING'}`);
        console.log(`✓ Availabilities: ${individualCal.availabilities?.length > 0 ? '✅' : '❌ MISSING'}`);
        
        // Test availability for this calendar
        console.log('\nAVAILABILITY TEST:');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T00:00:00-06:00').getTime() / 1000;
        const endOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T23:59:59-06:00').getTime() / 1000;
        
        try {
          const slots = await makeGHLRequest(
            `/calendars/${calendar.id}/free-slots?startDate=${startOfDay}&endDate=${endOfDay}&timezone=America/Chicago`
          );
          
          console.log(`📅 Tomorrow's slots: ${slots?.slots?.length || 0}`);
          
          if (slots?.slots?.length > 0) {
            console.log(`   First slot: ${slots.slots[0].startTime}`);
          }
          
        } catch (slotError) {
          console.log(`❌ Slot fetch error: ${slotError.message}`);
        }
        
      } catch (error) {
        console.log(`❌ Error fetching individual calendar: ${error.message}`);
      }
    }
    
    // Step 3: Recommendations
    console.log('\n🎯 ANALYSIS SUMMARY');
    console.log('═'.repeat(60));
    
    const workingCalendars = calendarList.calendars.filter(cal => cal.isActive && cal.name);
    const nonWorkingCalendars = calendarList.calendars.filter(cal => !cal.isActive || !cal.name);
    
    console.log(`✅ Calendars with names and active status: ${workingCalendars.length}`);
    console.log(`❌ Calendars needing restoration: ${nonWorkingCalendars.length}`);
    
    if (workingCalendars.length > 0) {
      console.log('\n✅ GOOD NEWS: Some calendars are partially restored!');
      console.log('💡 The names show up in the list but individual settings may be incomplete');
      console.log('🔧 You may need to check each calendar in GHL dashboard for:');
      console.log('   - Team member assignments');
      console.log('   - Weekly working hours');
      console.log('   - Availability blocks');
      console.log('   - Slot duration/interval settings');
    }
    
    if (nonWorkingCalendars.length > 0) {
      console.log('\n⚠️  CALENDARS STILL NEEDING WORK:');
      nonWorkingCalendars.forEach(cal => {
        console.log(`   - ${cal.id}: ${cal.name || 'UNNAMED'} (${cal.isActive ? 'Active' : 'Inactive'})`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Analysis failed: ${error.message}`);
  }
}

analyzeCalendarDiscrepancy().catch(console.error); 