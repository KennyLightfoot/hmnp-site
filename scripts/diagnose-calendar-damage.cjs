#!/usr/bin/env node

/**
 * Diagnose Calendar Damage - Houston Mobile Notary Pros
 * 
 * Check what was damaged by the previous script and plan restoration
 */

require('dotenv').config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

// Calendar IDs
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

async function diagnoseDamage() {
  console.log('🔍 Diagnosing Calendar Damage');
  console.log('═'.repeat(50));
  console.log('Checking what was damaged by the previous script...\n');
  
  for (const [serviceName, calendarId] of Object.entries(CALENDARS)) {
    console.log(`📅 Checking ${serviceName} Calendar`);
    console.log('-'.repeat(40));
    
    try {
      const calendar = await makeGHLRequest(`/calendars/${calendarId}`);
      
      console.log(`📋 Calendar ID: ${calendarId}`);
      console.log(`📋 Name: ${calendar.name || 'NOT SET'}`);
      console.log(`📋 Active: ${calendar.isActive ? 'YES' : 'NO'}`);
      console.log(`📋 Team Members: ${calendar.teamMembers?.length || 0}`);
      
      // Check openHours (business hours)
      console.log('\n🕐 Open Hours (Business Hours):');
      if (calendar.openHours && calendar.openHours.length > 0) {
        calendar.openHours.forEach((day, index) => {
          if (day && day.length > 0) {
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index];
            day.forEach(hours => {
              console.log(`   ${dayName}: ${hours.openHour}:${hours.openMinute.toString().padStart(2, '0')} - ${hours.closeHour}:${hours.closeMinute.toString().padStart(2, '0')}`);
            });
          }
        });
      } else {
        console.log('   ❌ NO OPEN HOURS SET!');
      }
      
      // Check availabilities (availability blocks)
      console.log('\n📅 Availabilities (Booking Blocks):');
      if (calendar.availabilities && calendar.availabilities.length > 0) {
        calendar.availabilities.forEach(avail => {
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][avail.dayOfTheWeek];
          if (avail.hours && avail.hours.length > 0) {
            avail.hours.forEach(hours => {
              console.log(`   ${dayName}: ${hours.openHour}:${hours.openMinute.toString().padStart(2, '0')} - ${hours.closeHour}:${hours.closeMinute.toString().padStart(2, '0')}`);
            });
          }
        });
      } else {
        console.log('   ❌ NO AVAILABILITIES SET!');
      }
      
      // Check other important settings
      console.log('\n⚙️  Other Settings:');
      console.log(`   Slot Duration: ${calendar.slotDuration || 'NOT SET'} mins`);
      console.log(`   Slot Interval: ${calendar.slotInterval || 'NOT SET'} mins`);
      console.log(`   Buffer Time: ${calendar.slotBuffer || 'NOT SET'} mins`);
      console.log(`   Max per Day: ${calendar.appPerDay || 'NOT SET'}`);
      console.log(`   Min Notice: ${calendar.minSchedulingNotice || 'NOT SET'} hours`);
      
      console.log('\n');
      
    } catch (error) {
      console.log(`❌ Error checking ${serviceName}: ${error.message}\n`);
    }
  }
  
  console.log('\n🎯 DIAGNOSIS COMPLETE');
  console.log('═'.repeat(50));
  console.log('🔧 Based on the results above, I\'ll create a restoration script');
  console.log('💡 Look for missing openHours and availabilities - those need to be restored');
}

diagnoseDamage().catch(console.error); 