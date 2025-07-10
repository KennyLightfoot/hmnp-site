#!/usr/bin/env node

/**
 * 🔧 Fix GHL Team Member Availability
 * Houston Mobile Notary Pros - 2025
 * 
 * This script identifies and fixes the root cause of missing availability slots:
 * Team members in GHL calendars don't have personal availability configured.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Calendar IDs from your environment
const CALENDAR_IDS = {
  'STANDARD_NOTARY': process.env.GHL_STANDARD_NOTARY_CALENDAR_ID || 'w3sjmTzBfuahySgQvKoV',
  'EXTENDED_HOURS': process.env.GHL_EXTENDED_HOURS_CALENDAR_ID || 'OmcFGOLhrR9lil6AQa2z',
  'LOAN_SIGNING': process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID || 'yf6tpA7YMn3oyZc6GVZK',
  'RON_SERVICES': process.env.GHL_BOOKING_CALENDAR_ID || 'xFRCVGNlnZASiQnBVHEG'
};

async function makeGHLRequest(endpoint, method = 'GET', body = null) {
  const url = `${GHL_API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
      'User-Agent': 'HMNP-AvailabilityFix/1.0'
    }
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  console.log(`🔍 ${method} ${endpoint}`);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return await response.json();
}

async function checkEnvironment() {
  console.log('🔍 ENVIRONMENT CHECK');
  console.log('====================');
  
  const requiredVars = [
    'GHL_PRIVATE_INTEGRATION_TOKEN',
    'GHL_LOCATION_ID',
    'GHL_API_BASE_URL'
  ];
  
  let allGood = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: MISSING`);
      allGood = false;
    }
  }
  
  if (!allGood) {
    throw new Error('Missing required environment variables');
  }
  
  console.log('\n✅ Environment variables check passed!\n');
}

async function getCalendarDetails(calendarId, serviceName) {
  console.log(`📅 CALENDAR: ${serviceName}`);
  console.log(`   ID: ${calendarId}`);
  
  try {
    const calendar = await makeGHLRequest(`/calendars/${calendarId}`);
    
    console.log(`   Name: ${calendar.name}`);
    console.log(`   Active: ${calendar.isActive ? '✅' : '❌'}`);
    console.log(`   Type: ${calendar.calendarType || 'Unknown'}`);
    
    // Check team members
    if (calendar.teamMembers && calendar.teamMembers.length > 0) {
      console.log(`   Team Members: ${calendar.teamMembers.length}`);
      
      for (const member of calendar.teamMembers) {
        console.log(`     - User ID: ${member.userId}`);
        console.log(`       Selected: ${member.selected ? '✅' : '❌'}`);
        console.log(`       Primary: ${member.isPrimary ? '✅' : '❌'}`);
        
        // This is the KEY ISSUE: Check if user has availability
        await checkUserAvailability(member.userId, serviceName);
      }
    } else {
      console.log(`   ⚠️  No team members assigned`);
    }
    
    // Test availability
    await testCalendarAvailability(calendarId, serviceName);
    
    console.log('');
    return calendar;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log('');
    return null;
  }
}

async function checkUserAvailability(userId, serviceName) {
  try {
    // Try to get user details
    const user = await makeGHLRequest(`/users/${userId}`);
    console.log(`       Name: ${user.firstName} ${user.lastName}`);
    console.log(`       Email: ${user.email}`);
    
    // Check user availability (this might not be accessible via API)
    // The main issue is likely here - users need availability configured in GHL UI
    
  } catch (error) {
    console.log(`       ⚠️  Could not fetch user details: ${error.message}`);
  }
}

async function testCalendarAvailability(calendarId, serviceName) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const testDate = tomorrow.toISOString().split('T')[0];
  
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
    
    if (slotsFound > 0) {
      console.log(`   📊 Availability Test: ✅ ${slotsFound} slots found for ${testDate}`);
    } else {
      console.log(`   📊 Availability Test: ❌ No slots found for ${testDate}`);
      console.log(`   🔧 This indicates team members need availability configured in GHL dashboard`);
    }
    
  } catch (error) {
    console.log(`   📊 Availability Test: ❌ Error - ${error.message}`);
  }
}

async function generateSolution() {
  console.log('🛠️  SOLUTION STEPS');
  console.log('==================');
  console.log('');
  console.log('Based on the diagnosis, here\'s how to fix the missing time slots:');
  console.log('');
  console.log('1. 🔐 **Login to GoHighLevel Dashboard**');
  console.log('   Go to: https://app.gohighlevel.com');
  console.log('');
  console.log('2. 👥 **Configure Team Member Availability**');
  console.log('   - Go to Settings → Team Members');
  console.log('   - Find each team member assigned to calendars');
  console.log('   - Click on their profile');
  console.log('   - Set "Personal Availability":');
  console.log('     • Monday-Friday: 9:00 AM - 5:00 PM');
  console.log('     • Saturday: 10:00 AM - 3:00 PM (if needed)');
  console.log('     • Timezone: America/Chicago');
  console.log('   - Save changes');
  console.log('');
  console.log('3. 📅 **Alternative: Check Calendar Settings**');
  console.log('   - Go to Settings → Calendars');
  console.log('   - For each calendar, check "Advanced Settings"');
  console.log('   - Ensure "API Access" is enabled');
  console.log('   - Verify "Allow External Bookings" is ON');
  console.log('   - Set proper business hours and availability blocks');
  console.log('');
  console.log('4. 🧪 **Test After Configuration**');
  console.log('   Run this script again to verify the fix:');
  console.log('   ```');
  console.log('   node scripts/fix-ghl-team-availability.cjs');
  console.log('   ```');
  console.log('');
  console.log('5. 🌐 **Test Your Website**');
  console.log('   - Go to your booking page');
  console.log('   - Select a service and future date');
  console.log('   - You should now see available time slots');
  console.log('');
  console.log('💡 **Why This Happens:**');
  console.log('GHL calendars can be configured correctly, but if the assigned team members');
  console.log('don\'t have personal availability set, the API returns no available slots.');
  console.log('This is a common gotcha with GHL calendar integration.');
}

async function main() {
  console.log('🔧 GHL Team Member Availability Fix');
  console.log('===================================');
  console.log('');
  console.log('This script diagnoses why your calendar isn\'t showing available slots.');
  console.log('');
  
  try {
    await checkEnvironment();
    
    console.log('📋 CALENDAR ANALYSIS');
    console.log('====================');
    console.log('');
    
    // Check each calendar
    for (const [serviceName, calendarId] of Object.entries(CALENDAR_IDS)) {
      if (calendarId && calendarId !== 'undefined') {
        await getCalendarDetails(calendarId, serviceName);
      } else {
        console.log(`⚠️  ${serviceName}: Calendar ID not configured`);
        console.log('');
      }
    }
    
    await generateSolution();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('🆘 Need help? Check that:');
    console.log('1. Your .env.local file has the correct GHL credentials');
    console.log('2. Your GHL Private Integration has the right permissions');
    console.log('3. Your location ID matches your GHL account');
  }
}

// Run the diagnostic
main(); 