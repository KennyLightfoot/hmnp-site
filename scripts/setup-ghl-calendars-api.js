#!/usr/bin/env node

/**
 * GHL Calendar Setup via API
 * Houston Mobile Notary Pros - Automated Calendar Configuration
 * 
 * Based on SOP_ENHANCED.md specifications and GHL API V2 capabilities
 * Run with: npx tsx scripts/setup-ghl-calendars-api.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Validate environment
if (!GHL_PRIVATE_INTEGRATION_TOKEN || !GHL_LOCATION_ID) {
  console.error('❌ Missing required environment variables');
  console.error('GHL_PRIVATE_INTEGRATION_TOKEN:', GHL_PRIVATE_INTEGRATION_TOKEN ? 'Set' : 'Missing');
  console.error('GHL_LOCATION_ID:', GHL_LOCATION_ID ? 'Set' : 'Missing');
  process.exit(1);
}

// Calendar configurations based on SOP_ENHANCED.md
const CALENDAR_CONFIGS = {
  'STANDARD_NOTARY': {
    name: 'Standard Notary Services',
    description: 'Professional notary services during business hours (9am-5pm Mon-Fri). Base service includes up to 2 documents, 1-2 signers, 15-mile travel included.',
    calendarType: 'INDIVIDUAL',
    eventTitle: 'Standard Notary - {{contact.first_name}} {{contact.last_name}}',
    meetingLocation: 'Client Location',
    slotDuration: 30, // minutes
    slotInterval: 30, // minutes
    slotBuffer: 15, // minutes
    preBuffer: 0,
    postBuffer: 15,
    appPerSlot: 1,
    appPerDay: 12,
    minSchedulingNotice: 2, // hours
    dateRange: 30, // days
    availability: [
      { day: 'MON', intervals: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'TUE', intervals: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'WED', intervals: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'THU', intervals: [{ startTime: '09:00', endTime: '17:00' }] },
      { day: 'FRI', intervals: [{ startTime: '09:00', endTime: '17:00' }] }
    ],
    eventColor: '#A52A2A', // Auburn
    isActive: true,
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    meetingPreparationTime: 0,
    calendarNotes: 'Phone: {{contact.phone}}\nEmail: {{contact.email}}\n\nIMPORTANT REMINDERS:\n• Please have a valid government-issued photo ID ready\n• Ensure all documents are complete but unsigned\n• Our notary will arrive 5 minutes before your scheduled time\n• Questions? Call (713) 505-0517\n\nThank you for choosing Houston Mobile Notary Pros!'
  },

  'EXTENDED_HOURS': {
    name: 'Extended Hours Notary',
    description: 'Extended hours notary services (7am-9pm Daily). Perfect for busy schedules. Base service includes up to 5 documents, 2 signers, 20-mile travel included.',
    calendarType: 'INDIVIDUAL',
    eventTitle: 'Extended Hours - {{contact.first_name}} {{contact.last_name}}',
    meetingLocation: 'Client Location',
    slotDuration: 45,
    slotInterval: 45,
    slotBuffer: 15,
    preBuffer: 0,
    postBuffer: 15,
    appPerSlot: 1,
    appPerDay: 18,
    minSchedulingNotice: 2,
    dateRange: 30,
    availability: [
      { day: 'SUN', intervals: [{ startTime: '07:00', endTime: '21:00' }] },
      { day: 'MON', intervals: [{ startTime: '07:00', endTime: '21:00' }] },
      { day: 'TUE', intervals: [{ startTime: '07:00', endTime: '21:00' }] },
      { day: 'WED', intervals: [{ startTime: '07:00', endTime: '21:00' }] },
      { day: 'THU', intervals: [{ startTime: '07:00', endTime: '21:00' }] },
      { day: 'FRI', intervals: [{ startTime: '07:00', endTime: '21:00' }] },
      { day: 'SAT', intervals: [{ startTime: '07:00', endTime: '21:00' }] }
    ],
    eventColor: '#002147', // Oxford Blue
    isActive: true,
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    meetingPreparationTime: 0,
    calendarNotes: 'Phone: {{contact.phone}}\nEmail: {{contact.email}}\n\nEXTENDED HOURS SERVICE:\n• Available 7am-9pm daily for your convenience\n• Please have a valid government-issued photo ID ready\n• Ensure all documents are complete but unsigned\n• Our notary will arrive 5 minutes before your scheduled time\n• Questions? Call (713) 505-0517\n\nThank you for choosing Houston Mobile Notary Pros!'
  },

  'LOAN_SIGNING': {
    name: 'Loan Signing Specialist',
    description: 'Professional loan document signing services. $150 flat fee includes unlimited documents for a single signing session, up to 4 signers, 90-minute session.',
    calendarType: 'INDIVIDUAL',
    eventTitle: 'Loan Signing - {{contact.first_name}} {{contact.last_name}}',
    meetingLocation: 'Client Location',
    slotDuration: 90,
    slotInterval: 90,
    slotBuffer: 30,
    preBuffer: 15,
    postBuffer: 30,
    appPerSlot: 1,
    appPerDay: 6,
    minSchedulingNotice: 24, // 24 hours for loan signings
    dateRange: 45,
    availability: [
      { day: 'MON', intervals: [{ startTime: '08:00', endTime: '20:00' }] },
      { day: 'TUE', intervals: [{ startTime: '08:00', endTime: '20:00' }] },
      { day: 'WED', intervals: [{ startTime: '08:00', endTime: '20:00' }] },
      { day: 'THU', intervals: [{ startTime: '08:00', endTime: '20:00' }] },
      { day: 'FRI', intervals: [{ startTime: '08:00', endTime: '20:00' }] },
      { day: 'SAT', intervals: [{ startTime: '09:00', endTime: '17:00' }] }
    ],
    eventColor: '#91A3B0', // Cadet Gray
    isActive: true,
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    meetingPreparationTime: 15,
    calendarNotes: 'Phone: {{contact.phone}}\nEmail: {{contact.email}}\n\nLOAN SIGNING APPOINTMENT:\n• $150 flat fee - unlimited documents, up to 4 signers\n• 90-minute session with professional loan signing agent\n• Please have ALL signers present with valid photo ID\n• Documents will be provided by your title company\n• Questions? Call (713) 505-0517\n\nThank you for choosing Houston Mobile Notary Pros!'
  },

  'RON_SERVICES': {
    name: 'RON Services - Remote Online Notarization',
    description: '24/7 Remote Online Notarization services. No travel required! Texas-compliant RON with Proof.com integration.',
    calendarType: 'INDIVIDUAL',
    eventTitle: 'RON Session - {{contact.first_name}} {{contact.last_name}}',
    meetingLocation: 'Remote Online Session',
    slotDuration: 30,
    slotInterval: 30,
    slotBuffer: 5,
    preBuffer: 0,
    postBuffer: 5,
    appPerSlot: 1,
    appPerDay: 48, // 24/7 availability
    minSchedulingNotice: 1,
    dateRange: 60,
    availability: [
      { day: 'SUN', intervals: [{ startTime: '00:00', endTime: '23:59' }] },
      { day: 'MON', intervals: [{ startTime: '00:00', endTime: '23:59' }] },
      { day: 'TUE', intervals: [{ startTime: '00:00', endTime: '23:59' }] },
      { day: 'WED', intervals: [{ startTime: '00:00', endTime: '23:59' }] },
      { day: 'THU', intervals: [{ startTime: '00:00', endTime: '23:59' }] },
      { day: 'FRI', intervals: [{ startTime: '00:00', endTime: '23:59' }] },
      { day: 'SAT', intervals: [{ startTime: '00:00', endTime: '23:59' }] }
    ],
    eventColor: '#A52A2A', // Auburn
    isActive: true,
    autoConfirm: true,
    allowReschedule: true,
    allowCancellation: true,
    meetingPreparationTime: 0,
    calendarNotes: 'Phone: {{contact.phone}}\nEmail: {{contact.email}}\n\nREMOTE ONLINE NOTARIZATION:\n• Available 24/7 for your convenience\n• $35 per notarization (TX compliant pricing)\n• Valid government-issued photo ID required\n• Reliable internet connection needed\n• Computer/device with camera and microphone\n• Questions? Call (713) 505-0517\n\nThank you for choosing Houston Mobile Notary Pros!'
  }
};

// Existing calendar IDs (if updating existing calendars)
const EXISTING_CALENDAR_IDS = {
  'STANDARD_NOTARY': 'w3sjmTzBfuahySgQvKoV',
  'EXTENDED_HOURS': 'OmcFGOLhrR9lil6AQa2z',
  'LOAN_SIGNING': 'yf6tpA7YMn3oyZc6GVZK',
  'RON_SERVICES': 'xFRCVGNlnZASiQnBVHEG'
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
 * Create or update a calendar via GHL API
 */
async function setupCalendar(serviceType, config, existingCalendarId = null) {
  console.log(`\n📅 Setting up ${serviceType} Calendar`);
  console.log('=' .repeat(50));
  
  const calendarPayload = {
    name: config.name,
    description: config.description,
    locationId: GHL_LOCATION_ID,
    calendarType: config.calendarType,
    eventTitle: config.eventTitle,
    meetingLocation: config.meetingLocation,
    slotDuration: config.slotDuration,
    slotInterval: config.slotInterval,
    slotBuffer: config.slotBuffer,
    preBuffer: config.preBuffer,
    postBuffer: config.postBuffer,
    appPerSlot: config.appPerSlot,
    appPerDay: config.appPerDay,
    minSchedulingNotice: config.minSchedulingNotice,
    minSchedulingNoticeUnit: 'hours',
    dateRange: config.dateRange,
    dateRangeUnit: 'days',
    availability: config.availability,
    eventColor: config.eventColor,
    isActive: config.isActive,
    autoConfirm: config.autoConfirm,
    allowReschedule: config.allowReschedule,
    allowCancellation: config.allowCancellation,
    meetingPreparationTime: config.meetingPreparationTime,
    calendarNotes: config.calendarNotes,
    timezone: 'America/Chicago'
  };
  
  try {
    let result;
    
    if (existingCalendarId) {
      // Update existing calendar
      console.log(`🔄 Updating existing calendar: ${existingCalendarId}`);
      result = await makeGHLRequest(`/calendars/${existingCalendarId}`, 'PUT', calendarPayload);
    } else {
      // Create new calendar
      console.log('🆕 Creating new calendar');
      result = await makeGHLRequest('/calendars', 'POST', calendarPayload);
    }
    
    console.log(`✅ Calendar ${existingCalendarId ? 'updated' : 'created'} successfully!`);
    console.log(`📋 Calendar ID: ${result.id || existingCalendarId}`);
    console.log(`📋 Name: ${config.name}`);
    console.log(`📋 Slot Duration: ${config.slotDuration} minutes`);
    console.log(`📋 Availability: ${config.availability.length} days configured`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to ${existingCalendarId ? 'update' : 'create'} ${serviceType} calendar:`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Verify calendar availability by testing the free-slots endpoint
 */
async function verifyCalendarAvailability(calendarId, serviceType) {
  console.log(`\n🔍 Verifying availability for ${serviceType}...`);
  
  try {
    // Test tomorrow's availability
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const startTimestamp = Math.floor(new Date(`${testDate}T00:00:00.000Z`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${testDate}T23:59:59.999Z`).getTime() / 1000);
    
    const availability = await makeGHLRequest(
      `/calendars/${calendarId}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=America/Chicago`
    );
    
    console.log(`📊 Testing date: ${testDate}`);
    console.log(`📊 API Response:`, JSON.stringify(availability, null, 2));
    
    // Check if we got slots
    let slotsFound = 0;
    if (availability && availability.freeSlots) {
      slotsFound = availability.freeSlots.length;
    } else if (Array.isArray(availability)) {
      slotsFound = availability.length;
    }
    
    if (slotsFound > 0) {
      console.log(`✅ SUCCESS: Found ${slotsFound} available slots!`);
    } else {
      console.log(`⚠️  WARNING: No available slots found`);
    }
    
    return slotsFound > 0;
    
  } catch (error) {
    console.error(`❌ Error verifying availability: ${error.message}`);
    return false;
  }
}

/**
 * Main setup function
 */
async function setupAllCalendars() {
  console.log('🚀 Houston Mobile Notary Pros - GHL Calendar Setup');
  console.log('===================================================');
  console.log(`📍 Location ID: ${GHL_LOCATION_ID}`);
  console.log(`🔑 API Token: ${GHL_PRIVATE_INTEGRATION_TOKEN.substring(0, 20)}...`);
  console.log('');
  
  const results = {};
  
  for (const [serviceType, config] of Object.entries(CALENDAR_CONFIGS)) {
    try {
      const existingId = EXISTING_CALENDAR_IDS[serviceType];
      const result = await setupCalendar(serviceType, config, existingId);
      
      // Verify the calendar works
      const calendarId = result?.id || existingId;
      if (calendarId) {
        const isWorking = await verifyCalendarAvailability(calendarId, serviceType);
        results[serviceType] = {
          id: calendarId,
          configured: true,
          hasAvailability: isWorking
        };
      }
      
    } catch (error) {
      console.error(`❌ Failed to setup ${serviceType}:`, error.message);
      results[serviceType] = {
        configured: false,
        error: error.message
      };
    }
  }
  
  // Summary
  console.log('\n📊 SETUP SUMMARY');
  console.log('==================');
  
  for (const [serviceType, result] of Object.entries(results)) {
    const status = result.configured ? 
      (result.hasAvailability ? '✅ WORKING' : '⚠️  NO SLOTS') : 
      '❌ FAILED';
    
    console.log(`${serviceType}: ${status}`);
    if (result.id) console.log(`  Calendar ID: ${result.id}`);
    if (result.error) console.log(`  Error: ${result.error}`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Update your .env.local with any new calendar IDs');
  console.log('2. Test your booking API: curl "http://localhost:3000/api/booking/availability?serviceType=STANDARD_NOTARY&date=2025-01-23"');
  console.log('3. Check GHL dashboard to verify calendar settings');
}

// Run the setup
setupAllCalendars().catch(console.error); 