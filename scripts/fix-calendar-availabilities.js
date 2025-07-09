#!/usr/bin/env node

/**
 * Fix GHL Calendar Availabilities
 * Houston Mobile Notary Pros
 * 
 * Sets proper availabilities array based on openHours to fix zero slots issue
 * Run with: npx tsx scripts/fix-calendar-availabilities.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

// Calendar configurations to fix
const CALENDARS_TO_FIX = {
  'STANDARD_NOTARY': {
    id: 'w3sjmTzBfuahySgQvKoV',
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
    availabilities: [
      { dayOfTheWeek: 0, hours: [{ openHour: 0, openMinute: 0, closeHour: 23, closeMinute: 59 }] },
      { dayOfTheWeek: 1, hours: [{ openHour: 0, openMinute: 0, closeHour: 23, closeMinute: 59 }] },
      { dayOfTheWeek: 2, hours: [{ openHour: 0, openMinute: 0, closeHour: 23, closeMinute: 59 }] },
      { dayOfTheWeek: 3, hours: [{ openHour: 0, openMinute: 0, closeHour: 23, closeMinute: 59 }] },
      { dayOfTheWeek: 4, hours: [{ openHour: 0, openMinute: 0, closeHour: 23, closeMinute: 59 }] },
      { dayOfTheWeek: 5, hours: [{ openHour: 0, openMinute: 0, closeHour: 23, closeMinute: 59 }] },
      { dayOfTheWeek: 6, hours: [{ openHour: 0, openMinute: 0, closeHour: 23, closeMinute: 59 }] }
    ]
  }
};

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
 * Fix calendar availability
 */
async function fixCalendarAvailability(serviceType, config) {
  console.log(`\n📅 Fixing ${serviceType} Calendar Availability`);
  console.log('=' .repeat(50));
  console.log(`📋 Calendar ID: ${config.id}`);
  
  try {
    // Update calendar with proper availabilities
    const updatePayload = {
      availabilities: config.availabilities
    };
    
    console.log('🔄 Setting availabilities:');
    config.availabilities.forEach(avail => {
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][avail.dayOfTheWeek];
      const hours = avail.hours.map(h => `${h.openHour}:${h.openMinute.toString().padStart(2, '0')}-${h.closeHour}:${h.closeMinute.toString().padStart(2, '0')}`).join(', ');
      console.log(`   ${day}: ${hours}`);
    });
    
    const result = await makeGHLRequest(`/calendars/${config.id}`, 'PUT', updatePayload);
    
    console.log(`✅ Availability updated successfully!`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to update ${serviceType} availability:`);
    console.error(error.message);
    return false;
  }
}

/**
 * Test availability after fix
 */
async function testAvailabilityAfterFix(calendarId, serviceType) {
  console.log(`\n🔍 Testing availability after fix...`);
  
  try {
    // Test tomorrow
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const startTimestamp = Math.floor(new Date(`${testDate}T00:00:00.000Z`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${testDate}T23:59:59.999Z`).getTime() / 1000);
    
    const availability = await makeGHLRequest(
      `/calendars/${calendarId}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago`
    );
    
    console.log(`📊 Testing date: ${testDate}`);
    
    // Check for slots
    let slotsFound = 0;
    if (availability && availability.freeSlots) {
      slotsFound = availability.freeSlots.length;
    } else if (Array.isArray(availability)) {
      slotsFound = availability.length;
    }
    
    if (slotsFound > 0) {
      console.log(`🎉 SUCCESS! Found ${slotsFound} available slots!`);
      if (availability.freeSlots) {
        console.log(`📋 Sample slots:`, availability.freeSlots.slice(0, 3));
      }
      return true;
    } else {
      console.log(`⚠️  Still no slots available`);
      console.log(`📋 Response:`, JSON.stringify(availability, null, 2));
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error testing availability: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function fixAllCalendars() {
  console.log('🔧 Houston Mobile Notary Pros - Availability Fix');
  console.log('================================================');
  console.log(`🔑 Using API Token: ${GHL_PRIVATE_INTEGRATION_TOKEN.substring(0, 20)}...`);
  console.log('');
  
  const results = {};
  
  for (const [serviceType, config] of Object.entries(CALENDARS_TO_FIX)) {
    // Fix availability
    const updateSuccess = await fixCalendarAvailability(serviceType, config);
    
    // Test after fix
    const hasSlots = updateSuccess ? await testAvailabilityAfterFix(config.id, serviceType) : false;
    
    results[serviceType] = {
      id: config.id,
      updated: updateSuccess,
      hasAvailability: hasSlots
    };
  }
  
  // Summary
  console.log('\n🎯 FINAL RESULTS');
  console.log('=================');
  
  let anyWorking = false;
  for (const [serviceType, result] of Object.entries(results)) {
    const status = result.updated ? 
      (result.hasAvailability ? '🎉 FIXED & WORKING!' : '⚠️  UPDATED BUT NO SLOTS') : 
      '❌ UPDATE FAILED';
    
    console.log(`${serviceType}: ${status}`);
    console.log(`  Calendar ID: ${result.id}`);
    
    if (result.hasAvailability) anyWorking = true;
  }
  
  if (anyWorking) {
    console.log('\n🎉 SUCCESS! Your calendars are now working!');
    console.log('💡 Test your booking flow at: http://localhost:3000/booking');
  } else {
    console.log('\n🔧 If still no slots, the issue might be:');
    console.log('1. Google Calendar conflicts');
    console.log('2. User timezone settings');
    console.log('3. GHL-specific availability settings in the UI');
  }
}

// Run the fix
fixAllCalendars().catch(console.error); 