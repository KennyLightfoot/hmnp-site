#!/usr/bin/env node

/**
 * Verify Manual Calendar Restoration - Houston Mobile Notary Pros
 * 
 * Run this after manually restoring calendars in GHL dashboard
 */

require('dotenv').config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

const CALENDARS = {
  'STANDARD_NOTARY': { id: 'XhHkzwNbT1MSWcGsfBjl', name: 'Standard Notary Services' },
  'EXTENDED_HOURS': { id: 'BjSsV5TuN8kJSexADD9W', name: 'Extended Hours Notary' },
  'LOAN_SIGNING': { id: 'gp2EBhGYgfYTNwJ0LlhK', name: 'Loan Signing Specialist' },
  'RON_SERVICES': { id: 'FMg76LwuDd9RLJNekQId', name: 'RON Services - Remote Online Notarization' }
};

async function makeGHLRequest(endpoint) {
  const url = `${GHL_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return await response.json();
}

async function verifyCalendar(serviceType, calendar) {
  console.log(`\n📅 Verifying ${serviceType}`);
  console.log('-'.repeat(50));
  
  try {
    // Check calendar settings
    const config = await makeGHLRequest(`/calendars/${calendar.id}`);
    
    const checks = {
      name: config.name === calendar.name,
      active: config.isActive === true,
      hasTeamMembers: config.teamMembers && config.teamMembers.length > 0,
      hasOpenHours: config.openHours && config.openHours.some(day => day && day.length > 0),
      hasAvailabilities: config.availabilities && config.availabilities.length > 0,
      hasSlotSettings: config.slotDuration && config.slotInterval
    };
    
    console.log(`📋 Name: ${config.name || 'NOT SET'} ${checks.name ? '✅' : '❌'}`);
    console.log(`📋 Active: ${config.isActive ? 'YES' : 'NO'} ${checks.active ? '✅' : '❌'}`);
    console.log(`📋 Team Members: ${config.teamMembers?.length || 0} ${checks.hasTeamMembers ? '✅' : '❌'}`);
    console.log(`📋 Open Hours: ${config.openHours?.filter(day => day && day.length > 0).length || 0} days ${checks.hasOpenHours ? '✅' : '❌'}`);
    console.log(`📋 Availabilities: ${config.availabilities?.length || 0} blocks ${checks.hasAvailabilities ? '✅' : '❌'}`);
    console.log(`📋 Slot Settings: ${config.slotDuration || 'NOT SET'}min duration ${checks.hasSlotSettings ? '✅' : '❌'}`);
    
    // Test availability
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T00:00:00-06:00').getTime() / 1000;
    const endOfDay = new Date(tomorrow.toISOString().split('T')[0] + 'T23:59:59-06:00').getTime() / 1000;
    
    const availability = await makeGHLRequest(
      `/calendars/${calendar.id}/free-slots?startDate=${startOfDay}&endDate=${endOfDay}&timezone=America/Chicago`
    );
    
    const hasSlots = availability.slots && availability.slots.length > 0;
    console.log(`📋 Available Slots: ${availability.slots?.length || 0} ${hasSlots ? '✅' : '❌'}`);
    
    const allChecks = Object.values(checks).every(check => check) && hasSlots;
    console.log(`\n🎯 Overall Status: ${allChecks ? '🎉 FULLY WORKING' : '⚠️  NEEDS ATTENTION'}`);
    
    return allChecks;
    
  } catch (error) {
    console.log(`❌ Error checking ${serviceType}: ${error.message}`);
    return false;
  }
}

async function verifyAllCalendars() {
  console.log('🔍 VERIFYING MANUAL CALENDAR RESTORATION');
  console.log('═'.repeat(60));
  console.log('Checking if your manual restoration was successful...\n');
  
  let workingCalendars = 0;
  
  for (const [serviceType, calendar] of Object.entries(CALENDARS)) {
    const isWorking = await verifyCalendar(serviceType, calendar);
    if (isWorking) workingCalendars++;
  }
  
  console.log('\n🎯 VERIFICATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`📊 Working Calendars: ${workingCalendars}/4`);
  
  if (workingCalendars === 4) {
    console.log('\n🎉 SUCCESS! ALL CALENDARS RESTORED AND WORKING!');
    console.log('✅ Your booking system is now fully operational');
    console.log('🔗 Test your booking form at: /booking');
  } else if (workingCalendars > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some calendars still need work');
    console.log('📋 Continue manual restoration for calendars marked with ❌');
  } else {
    console.log('\n❌ NO CALENDARS WORKING - Continue manual restoration');
    console.log('📋 Make sure to set ALL settings mentioned in the restoration guide');
  }
  
  console.log('\n💡 REMEMBER:');
  console.log('- Team members must be assigned to each calendar');
  console.log('- Weekly working hours must be set');
  console.log('- Availability blocks are separate from open hours');
  console.log('- All calendars must be marked as "Active"');
}

verifyAllCalendars().catch(console.error); 