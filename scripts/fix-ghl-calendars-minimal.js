#!/usr/bin/env node

/**
 * Minimal GHL Calendar Fix Script
 * Houston Mobile Notary Pros
 * 
 * Updates calendars with basic supported fields only
 * Run with: npx tsx scripts/fix-ghl-calendars-minimal.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

// Validate environment
if (!GHL_PRIVATE_INTEGRATION_TOKEN) {
  console.error('❌ Missing GHL_PRIVATE_INTEGRATION_TOKEN');
  process.exit(1);
}

// Your existing calendar IDs
const CALENDAR_IDS = {
  'STANDARD_NOTARY': 'w3sjmTzBfuahySgQvKoV',
  'EXTENDED_HOURS': 'OmcFGOLhrR9lil6AQa2z', 
  'LOAN_SIGNING': 'yf6tpA7YMn3oyZc6GVZK',
  'RON_SERVICES': 'xFRCVGNlnZASiQnBVHEG'
};

// Minimal calendar configurations using only supported fields
const MINIMAL_CONFIGS = {
  'STANDARD_NOTARY': {
    name: 'Standard Notary Services',
    description: 'Professional notary services during business hours (9am-5pm Mon-Fri). Base service includes up to 2 documents, 1-2 signers, 15-mile travel included.',
    eventTitle: 'Standard Notary - {{contact.first_name}} {{contact.last_name}}',
    isActive: true
  },
  'EXTENDED_HOURS': {
    name: 'Extended Hours Notary', 
    description: 'Extended hours notary services (7am-9pm Daily). Perfect for busy schedules. Base service includes up to 5 documents, 2 signers, 20-mile travel included.',
    eventTitle: 'Extended Hours - {{contact.first_name}} {{contact.last_name}}',
    isActive: true
  },
  'LOAN_SIGNING': {
    name: 'Loan Signing Specialist',
    description: 'Professional loan document signing services. $150 flat fee includes unlimited documents for a single signing session, up to 4 signers, 90-minute session.',
    eventTitle: 'Loan Signing - {{contact.first_name}} {{contact.last_name}}',
    isActive: true
  },
  'RON_SERVICES': {
    name: 'RON Services - Remote Online Notarization',
    description: '24/7 Remote Online Notarization services. No travel required! Texas-compliant RON with Proof.com integration.',
    eventTitle: 'RON Session - {{contact.first_name}} {{contact.last_name}}',
    isActive: true
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
 * Get current calendar details
 */
async function getCalendarDetails(calendarId) {
  try {
    return await makeGHLRequest(`/calendars/${calendarId}`, 'GET');
  } catch (error) {
    console.error(`❌ Failed to get calendar details: ${error.message}`);
    return null;
  }
}

/**
 * Update calendar with minimal config
 */
async function updateCalendar(serviceType, calendarId, config) {
  console.log(`\n📅 Updating ${serviceType} Calendar`);
  console.log('=' .repeat(50));
  console.log(`📋 Calendar ID: ${calendarId}`);
  
  try {
    // First get current calendar to see its structure
    console.log('🔍 Getting current calendar details...');
    const currentCalendar = await getCalendarDetails(calendarId);
    
    if (currentCalendar) {
      console.log('📊 Current Calendar Structure:');
      console.log(JSON.stringify(currentCalendar, null, 2));
    }
    
    // Try updating with minimal payload
    const updatePayload = {
      name: config.name,
      description: config.description,
      eventTitle: config.eventTitle,
      isActive: config.isActive
    };
    
    console.log('🔄 Updating calendar with payload:');
    console.log(JSON.stringify(updatePayload, null, 2));
    
    const result = await makeGHLRequest(`/calendars/${calendarId}`, 'PUT', updatePayload);
    
    console.log(`✅ Calendar updated successfully!`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to update ${serviceType} calendar:`);
    console.error(error.message);
    return null;
  }
}

/**
 * Test calendar availability
 */
async function testAvailability(calendarId, serviceType) {
  console.log(`\n🔍 Testing availability for ${serviceType}...`);
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const startTimestamp = Math.floor(new Date(`${testDate}T00:00:00.000Z`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${testDate}T23:59:59.999Z`).getTime() / 1000);
    
    const availability = await makeGHLRequest(
      `/calendars/${calendarId}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago`
    );
    
    console.log(`📊 Testing date: ${testDate}`);
    console.log(`📊 Availability response:`, JSON.stringify(availability, null, 2));
    
    // Check for slots
    let slotsFound = 0;
    if (availability && availability.freeSlots) {
      slotsFound = availability.freeSlots.length;
    } else if (Array.isArray(availability)) {
      slotsFound = availability.length;
    }
    
    console.log(slotsFound > 0 ? `✅ ${slotsFound} slots found!` : `⚠️  No slots available`);
    return slotsFound > 0;
    
  } catch (error) {
    console.error(`❌ Error testing availability: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function fixCalendars() {
  console.log('🔧 Houston Mobile Notary Pros - Calendar Fix');
  console.log('============================================');
  console.log(`🔑 Using API Token: ${GHL_PRIVATE_INTEGRATION_TOKEN.substring(0, 20)}...`);
  console.log('');
  
  const results = {};
  
  for (const [serviceType, calendarId] of Object.entries(CALENDAR_IDS)) {
    const config = MINIMAL_CONFIGS[serviceType];
    
    // Update calendar
    const updateResult = await updateCalendar(serviceType, calendarId, config);
    
    // Test availability
    const hasSlots = await testAvailability(calendarId, serviceType);
    
    results[serviceType] = {
      calendarId,
      updated: !!updateResult,
      hasAvailability: hasSlots
    };
  }
  
  // Summary
  console.log('\n📊 RESULTS SUMMARY');
  console.log('==================');
  
  for (const [serviceType, result] of Object.entries(results)) {
    const status = result.updated ? 
      (result.hasAvailability ? '✅ WORKING' : '⚠️  NO SLOTS') : 
      '❌ UPDATE FAILED';
    
    console.log(`${serviceType}: ${status}`);
    console.log(`  Calendar ID: ${result.calendarId}`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('If calendars still show no slots, the issue is in GHL UI settings:');
  console.log('1. Check office hours are properly set in GHL dashboard');
  console.log('2. Verify user assignment to calendars');
  console.log('3. Ensure slot duration/interval are configured');
  console.log('4. Test your booking API after fixing GHL settings');
}

// Run the fix
fixCalendars().catch(console.error); 