#!/usr/bin/env node

/**
 * GHL Calendar Groups Setup Script
 * Houston Mobile Notary Pros - 2025
 * 
 * Organizes calendars into logical groups for better client experience
 * and easier management.
 */

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Current calendar configuration
const CALENDAR_IDS = {
  'STANDARD_NOTARY': 'XhHkzwNbT1MSWcGsfBjl',
  'EXTENDED_HOURS': 'BjSsV5TuN8kJSexADD9W',
  'LOAN_SIGNING': 'gp2EBhGYgfYTNwJ0LlhK',
  'RON_SERVICES': 'FMg76LwuDd9RLJNekQId'
};

// Recommended calendar groups
const CALENDAR_GROUPS = {
  'STANDARD_BUSINESS': {
    name: 'Standard Business Services',
    description: 'Professional notary services during regular business hours (Mon-Fri 9am-5pm)',
    calendars: ['STANDARD_NOTARY'],
    priority: 1,
    color: '#2E7D32', // Green
    settings: {
      displayOrder: 1,
      defaultView: 'month',
      showTimeSlots: true,
      allowMultipleBookings: false
    }
  },
  
  'EXTENDED_FLEXIBLE': {
    name: 'Extended & Flexible Services',
    description: 'Extended hours and remote services for maximum flexibility',
    calendars: ['EXTENDED_HOURS', 'RON_SERVICES'],
    priority: 2,
    color: '#1976D2', // Blue
    settings: {
      displayOrder: 2,
      defaultView: 'week',
      showTimeSlots: true,
      allowMultipleBookings: true
    }
  },
  
  'SPECIALTY_SERVICES': {
    name: 'Specialty Services',
    description: 'Specialized loan signing and document services',
    calendars: ['LOAN_SIGNING'],
    priority: 3,
    color: '#F57C00', // Orange
    settings: {
      displayOrder: 3,
      defaultView: 'month',
      showTimeSlots: true,
      allowMultipleBookings: false
    }
  }
};

// Alternative organization by service tier
const ALTERNATIVE_GROUPS = {
  'ESSENTIAL_SERVICES': {
    name: 'Essential Services',
    description: 'Core notary services for everyday business needs',
    calendars: ['STANDARD_NOTARY'],
    priority: 1,
    color: '#4CAF50', // Green
  },
  
  'PREMIUM_SERVICES': {
    name: 'Premium Services',
    description: 'Higher-tier services with extended hours and specialization',
    calendars: ['EXTENDED_HOURS', 'LOAN_SIGNING'],
    priority: 2,
    color: '#FF9800', // Orange
  },
  
  'DIGITAL_SERVICES': {
    name: 'Digital Services',
    description: 'Modern remote online notarization services',
    calendars: ['RON_SERVICES'],
    priority: 3,
    color: '#2196F3', // Blue
  }
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

async function setupCalendarGroups() {
  console.log('🗂️  GHL Calendar Groups Setup');
  console.log('=' .repeat(50));
  
  if (!GHL_PRIVATE_INTEGRATION_TOKEN) {
    console.error('❌ Missing GHL_PRIVATE_INTEGRATION_TOKEN');
    return;
  }
  
  console.log(`🔐 Using token: ${GHL_PRIVATE_INTEGRATION_TOKEN.substring(0, 10)}...`);
  console.log(`📍 Location ID: ${GHL_LOCATION_ID}`);
  console.log('');

  // Step 1: Validate calendar IDs exist
  console.log('🔍 Step 1: Validating Calendar IDs');
  console.log('-' .repeat(30));
  
  const validCalendars = {};
  
  for (const [serviceType, calendarId] of Object.entries(CALENDAR_IDS)) {
    try {
      const calendar = await makeGHLRequest(`/calendars/${calendarId}`);
      console.log(`✅ ${serviceType}: ${calendar.calendar?.name || 'Unknown'}`);
      validCalendars[serviceType] = {
        id: calendarId,
        name: calendar.calendar?.name || serviceType,
        isActive: calendar.calendar?.isActive || false
      };
    } catch (error) {
      console.error(`❌ ${serviceType}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Found ${Object.keys(validCalendars).length} valid calendars`);
  
  // Step 2: Show recommended groupings
  console.log('\n🎯 Step 2: Recommended Calendar Groups');
  console.log('-' .repeat(30));
  
  console.log('\n📋 OPTION 1: Business Function Groups');
  console.log('═'.repeat(40));
  
  for (const [groupId, group] of Object.entries(CALENDAR_GROUPS)) {
    console.log(`\n📁 ${group.name}`);
    console.log(`   Description: ${group.description}`);
    console.log(`   Priority: ${group.priority}`);
    console.log(`   Color: ${group.color}`);
    console.log(`   Calendars:`);
    
    group.calendars.forEach(calendarType => {
      const calendar = validCalendars[calendarType];
      if (calendar) {
        console.log(`     • ${calendar.name} (${calendar.id})`);
      } else {
        console.log(`     • ${calendarType} (NOT FOUND)`);
      }
    });
  }
  
  console.log('\n📋 OPTION 2: Service Tier Groups');
  console.log('═'.repeat(40));
  
  for (const [groupId, group] of Object.entries(ALTERNATIVE_GROUPS)) {
    console.log(`\n📁 ${group.name}`);
    console.log(`   Description: ${group.description}`);
    console.log(`   Priority: ${group.priority}`);
    console.log(`   Color: ${group.color}`);
    console.log(`   Calendars:`);
    
    group.calendars.forEach(calendarType => {
      const calendar = validCalendars[calendarType];
      if (calendar) {
        console.log(`     • ${calendar.name} (${calendar.id})`);
      } else {
        console.log(`     • ${calendarType} (NOT FOUND)`);
      }
    });
  }
  
  // Step 3: Generate GHL group URLs
  console.log('\n🔗 Step 3: GHL Group Setup URLs');
  console.log('-' .repeat(30));
  
  console.log('\n📝 Manual Setup Instructions:');
  console.log('1. Login to your GHL dashboard');
  console.log('2. Go to Settings → Calendars → Groups');
  console.log('3. Create these groups:');
  console.log('');
  
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    const calendarIds = group.calendars
      .map(type => validCalendars[type]?.id)
      .filter(Boolean);
    
    console.log(`📁 Group: ${group.name}`);
    console.log(`   Calendar IDs to add: ${calendarIds.join(', ')}`);
    console.log(`   Display Order: ${group.priority}`);
    console.log(`   Suggested Color: ${group.color}`);
    console.log('');
  });
  
  // Step 4: Generate booking widget URLs
  console.log('🎯 Step 4: Booking Widget Integration');
  console.log('-' .repeat(30));
  
  console.log('\n📱 After creating groups, you can use these URLs:');
  console.log('');
  
  Object.entries(CALENDAR_GROUPS).forEach(([groupId, group]) => {
    const groupSlug = group.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    console.log(`📁 ${group.name}:`);
    console.log(`   Booking URL: https://your-domain.com/booking/${groupSlug}`);
    console.log(`   Widget Embed: <iframe src="https://your-ghl-widget-url/${groupSlug}"></iframe>`);
    console.log('');
  });
  
  // Step 5: Configuration recommendations
  console.log('⚙️  Step 5: Configuration Recommendations');
  console.log('-' .repeat(30));
  
  console.log('\n🎨 Group Display Settings:');
  console.log('• Standard Business: Show first, emphasize business hours');
  console.log('• Extended/Flexible: Show second, highlight convenience');
  console.log('• Specialty Services: Show third, emphasize expertise');
  console.log('');
  
  console.log('📋 Booking Flow Recommendations:');
  console.log('• Use group URLs on your website service pages');
  console.log('• Standard Business → Link from main "Book Now" buttons');
  console.log('• Extended/Flexible → Link from "Need flexible hours?" CTAs');
  console.log('• Specialty Services → Link from loan/mortgage pages');
  console.log('');
  
  console.log('🔧 Next Steps:');
  console.log('1. Choose your preferred grouping strategy (Option 1 or 2)');
  console.log('2. Create the groups in GHL dashboard');
  console.log('3. Update your website booking links');
  console.log('4. Test the booking flow for each group');
  console.log('5. Monitor analytics to optimize group performance');
}

// Run the setup
setupCalendarGroups().catch(console.error); 