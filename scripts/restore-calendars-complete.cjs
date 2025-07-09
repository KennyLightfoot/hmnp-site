#!/usr/bin/env node

/**
 * COMPLETE CALENDAR RESTORATION - Houston Mobile Notary Pros
 * 
 * This script completely restores your GHL calendars that were wiped out
 * by the previous script. It rebuilds all settings from scratch.
 */

require('dotenv').config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// COMPLETE calendar configurations - rebuilding everything from scratch
const CALENDAR_RESTORATIONS = {
  'STANDARD_NOTARY': {
    id: 'w3sjmTzBfuahySgQvKoV',
    name: 'Standard Notary Services',
    description: 'Professional notary services during business hours (9am-5pm Mon-Fri). Base service includes up to 2 documents, 1-2 signers, 15-mile travel included.',
    isActive: true,
    calendarType: 'ROUND_ROBIN',
    // Team member - using your user ID from previous diagnostics
    teamMembers: ['dYOQIx02wwBVjY4ihxoY'],
    // Slot settings
    slotDuration: 30,
    slotInterval: 30,
    slotBuffer: 15,
    appPerSlot: 1,
    appPerDay: 12,
    minSchedulingNotice: 2,
    minSchedulingNoticeUnit: 'hours',
    dateRange: 30,
    dateRangeUnit: 'days',
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    eventColor: '#A52A2A',
    // Open Hours (Business Hours) - Monday to Friday 9-5
    openHours: [
      [], // Sunday
      [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }], // Monday
      [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }], // Tuesday
      [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }], // Wednesday
      [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }], // Thursday
      [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }], // Friday
      [] // Saturday
    ],
    // Availability blocks (when appointments can be booked)
    availabilities: [
      { dayOfTheWeek: 1, hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }] },
      { dayOfTheWeek: 2, hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }] },
      { dayOfTheWeek: 3, hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }] },
      { dayOfTheWeek: 4, hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }] },
      { dayOfTheWeek: 5, hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }] }
    ]
  },
  
  'EXTENDED_HOURS': {
    id: 'OmcFGOLhrR9lil6AQa2z',
    name: 'Extended Hours Notary',
    description: 'Extended hours notary services (7am-9pm Daily). Perfect for busy schedules. Base service includes up to 5 documents, 2 signers, 20-mile travel included.',
    isActive: true,
    calendarType: 'ROUND_ROBIN',
    teamMembers: ['dYOQIx02wwBVjY4ihxoY'],
    slotDuration: 45,
    slotInterval: 45,
    slotBuffer: 15,
    appPerSlot: 1,
    appPerDay: 18,
    minSchedulingNotice: 2,
    minSchedulingNoticeUnit: 'hours',
    dateRange: 30,
    dateRangeUnit: 'days',
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    eventColor: '#002147',
    // Open Hours - 7am to 9pm daily
    openHours: [
      [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }], // Sunday
      [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }], // Monday
      [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }], // Tuesday
      [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }], // Wednesday
      [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }], // Thursday
      [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }], // Friday
      [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }]  // Saturday
    ],
    availabilities: [
      { dayOfTheWeek: 0, hours: [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }] },
      { dayOfTheWeek: 1, hours: [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }] },
      { dayOfTheWeek: 2, hours: [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }] },
      { dayOfTheWeek: 3, hours: [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }] },
      { dayOfTheWeek: 4, hours: [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }] },
      { dayOfTheWeek: 5, hours: [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }] },
      { dayOfTheWeek: 6, hours: [{ openHour: 7, openMinute: 0, closeHour: 21, closeMinute: 0 }] }
    ]
  },
  
  'LOAN_SIGNING': {
    id: 'yf6tpA7YMn3oyZc6GVZK',
    name: 'Loan Signing Specialist',
    description: 'Professional loan document signing services. $150 flat fee includes unlimited documents for a single signing session, up to 4 signers, 90-minute session.',
    isActive: true,
    calendarType: 'ROUND_ROBIN',
    teamMembers: ['dYOQIx02wwBVjY4ihxoY'],
    slotDuration: 90,
    slotInterval: 60,
    slotBuffer: 30,
    appPerSlot: 1,
    appPerDay: 8,
    minSchedulingNotice: 24,
    minSchedulingNoticeUnit: 'hours',
    dateRange: 56,
    dateRangeUnit: 'days',
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    eventColor: '#8B4513',
    openHours: [
      [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }], // Sunday
      [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }], // Monday
      [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }], // Tuesday
      [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }], // Wednesday
      [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }], // Thursday
      [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }], // Friday
      [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }]  // Saturday
    ],
    availabilities: [
      { dayOfTheWeek: 0, hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }] },
      { dayOfTheWeek: 1, hours: [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }] },
      { dayOfTheWeek: 2, hours: [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }] },
      { dayOfTheWeek: 3, hours: [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }] },
      { dayOfTheWeek: 4, hours: [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }] },
      { dayOfTheWeek: 5, hours: [{ openHour: 8, openMinute: 0, closeHour: 20, closeMinute: 0 }] },
      { dayOfTheWeek: 6, hours: [{ openHour: 9, openMinute: 0, closeHour: 17, closeMinute: 0 }] }
    ]
  },
  
  'RON_SERVICES': {
    id: 'xFRCVGNlnZASiQnBVHEG',
    name: 'RON Services - Remote Online Notarization',
    description: '24/7 Remote Online Notarization services. No travel required! Texas-compliant RON with Proof.com integration.',
    isActive: true,
    calendarType: 'ROUND_ROBIN',
    teamMembers: ['dYOQIx02wwBVjY4ihxoY'],
    slotDuration: 45,
    slotInterval: 15,
    slotBuffer: 5,
    appPerSlot: 1,
    appPerDay: 20,
    minSchedulingNotice: 1,
    minSchedulingNoticeUnit: 'hours',
    dateRange: 84,
    dateRangeUnit: 'days',
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    eventColor: '#4169E1',
    openHours: [
      [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }], // Sunday
      [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }], // Monday
      [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }], // Tuesday
      [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }], // Wednesday
      [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }], // Thursday
      [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }], // Friday
      [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }]  // Saturday
    ],
    availabilities: [
      { dayOfTheWeek: 0, hours: [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }] },
      { dayOfTheWeek: 1, hours: [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }] },
      { dayOfTheWeek: 2, hours: [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }] },
      { dayOfTheWeek: 3, hours: [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }] },
      { dayOfTheWeek: 4, hours: [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }] },
      { dayOfTheWeek: 5, hours: [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }] },
      { dayOfTheWeek: 6, hours: [{ openHour: 8, openMinute: 0, closeHour: 18, closeMinute: 0 }] }
    ]
  }
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

async function restoreCalendar(serviceName, config) {
  console.log(`\n🛠️  RESTORING ${serviceName} Calendar`);
  console.log('═'.repeat(60));
  console.log(`📋 Calendar ID: ${config.id}`);
  console.log(`📋 Name: ${config.name}`);
  
  try {
    // Create complete restoration payload
    const restorationPayload = {
      name: config.name,
      description: config.description,
      locationId: GHL_LOCATION_ID,
      isActive: config.isActive,
      calendarType: config.calendarType,
      teamMembers: config.teamMembers,
      slotDuration: config.slotDuration,
      slotInterval: config.slotInterval,
      slotBuffer: config.slotBuffer,
      appPerSlot: config.appPerSlot,
      appPerDay: config.appPerDay,
      minSchedulingNotice: config.minSchedulingNotice,
      minSchedulingNoticeUnit: config.minSchedulingNoticeUnit,
      dateRange: config.dateRange,
      dateRangeUnit: config.dateRangeUnit,
      autoConfirm: config.autoConfirm,
      allowReschedule: config.allowReschedule,
      allowCancellation: config.allowCancellation,
      eventColor: config.eventColor,
      openHours: config.openHours,
      availabilities: config.availabilities,
      timezone: 'America/Chicago'
    };
    
    console.log('🔄 Restoring all calendar settings...');
    
    // Log what we're restoring
    console.log(`✅ Name: ${config.name}`);
    console.log(`✅ Active: ${config.isActive}`);
    console.log(`✅ Team Members: ${config.teamMembers.length}`);
    console.log(`✅ Slot Settings: ${config.slotDuration}min duration, ${config.slotInterval}min interval`);
    console.log(`✅ Open Hours: ${config.openHours.filter(day => day.length > 0).length} days configured`);
    console.log(`✅ Availabilities: ${config.availabilities.length} availability blocks`);
    
    const result = await makeGHLRequest(`/calendars/${config.id}`, 'PUT', restorationPayload);
    
    console.log(`🎉 ${serviceName} SUCCESSFULLY RESTORED!`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to restore ${serviceName}:`);
    console.error(error.message);
    return false;
  }
}

async function testRestoredCalendar(serviceName, calendarId) {
  console.log(`\n🧪 Testing restored ${serviceName} calendar...`);
  
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
    
    if (response.slots && response.slots.length > 0) {
      console.log(`🎉 SUCCESS! Found ${response.slots.length} available slots!`);
      return true;
    } else {
      console.log(`⚠️  No slots found yet - may need a few minutes to sync`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${serviceName}: ${error.message}`);
    return false;
  }
}

async function restoreAllCalendars() {
  console.log('🚨 EMERGENCY CALENDAR RESTORATION');
  console.log('═'.repeat(60));
  console.log('Completely rebuilding all calendar settings from scratch...\n');
  
  let successCount = 0;
  let testSuccessCount = 0;
  
  for (const [serviceName, config] of Object.entries(CALENDAR_RESTORATIONS)) {
    const restored = await restoreCalendar(serviceName, config);
    if (restored) {
      successCount++;
      
      // Test the restored calendar
      const hasSlots = await testRestoredCalendar(serviceName, config.id);
      if (hasSlots) {
        testSuccessCount++;
      }
    }
  }
  
  console.log('\n🎯 RESTORATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`📊 Calendars Restored: ${successCount}/4`);
  console.log(`📊 Calendars with Slots: ${testSuccessCount}/4`);
  
  if (successCount === 4) {
    console.log('\n🎉 ALL CALENDARS SUCCESSFULLY RESTORED!');
    console.log('✅ Your booking system should now be working again');
    console.log('🔗 Test your booking form at: /booking');
    
    if (testSuccessCount < 4) {
      console.log('\n⏰ Some calendars may take a few minutes to show slots');
      console.log('🔄 Run this test again in 5 minutes:');
      console.log('   node scripts/test-availability-fix.cjs');
    }
  } else {
    console.log('\n⚠️  Some calendars failed to restore');
    console.log('📞 You may need to check these manually in GHL dashboard');
  }
}

// Run the restoration
restoreAllCalendars().catch(console.error); 