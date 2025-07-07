/**
 * GHL Calendar Setup Script
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Fetches available calendars from GHL and helps configure calendar IDs
 */

require('dotenv').config({ path: '.env.local' });

async function setupGHLCalendars() {
  console.log('📅 GHL Calendar Setup - Phase 2');
  console.log('================================\n');

  try {
    // Test basic API connection first
    const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
    const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    if (!GHL_API_BASE_URL || !GHL_PRIVATE_INTEGRATION_TOKEN || !GHL_LOCATION_ID) {
      throw new Error('Missing GHL credentials. Check .env.local file.');
    }

    console.log('🔌 Testing GHL API Connection...');
    console.log(`API Base: ${GHL_API_BASE_URL}`);
    console.log(`Location: ${GHL_LOCATION_ID}`);
    console.log(`Token: ${GHL_PRIVATE_INTEGRATION_TOKEN.substring(0, 20)}...\n`);

    // Fetch available calendars
    console.log('📋 Fetching available calendars...');
    const calendarsUrl = `${GHL_API_BASE_URL}/calendars/?locationId=${GHL_LOCATION_ID}`;
    
    const response = await fetch(calendarsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch calendars: ${response.status} - ${errorText}`);
    }

    const calendarsData = await response.json();
    const calendars = calendarsData.calendars || calendarsData || [];

    console.log(`✅ Found ${calendars.length} calendars in GHL:\n`);

    // Display available calendars
    calendars.forEach((calendar, index) => {
      console.log(`📅 ${index + 1}. ${calendar.name}`);
      console.log(`   ID: ${calendar.id}`);
      console.log(`   Status: ${calendar.isActive ? 'Active' : 'Inactive'}`);
      if (calendar.description) {
        console.log(`   Description: ${calendar.description}`);
      }
      console.log('');
    });

    // Suggest mapping
    console.log('🎯 SUGGESTED CALENDAR MAPPING');
    console.log('==============================');
    console.log('Add these to your .env.local file:\n');

    // Find best matches for our services
    const serviceMapping = [
      { service: 'STANDARD_NOTARY', keywords: ['standard', 'notary', 'general', 'basic'], envVar: 'GHL_STANDARD_NOTARY_CALENDAR_ID' },
      { service: 'EXTENDED_HOURS', keywords: ['extended', 'hours', 'evening', 'weekend'], envVar: 'GHL_EXTENDED_HOURS_CALENDAR_ID' },
      { service: 'LOAN_SIGNING', keywords: ['loan', 'signing', 'mortgage', 'refinance'], envVar: 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID' },
      { service: 'RON_SERVICES', keywords: ['ron', 'remote', 'online', 'notarization'], envVar: 'GHL_BOOKING_CALENDAR_ID' }
    ];

    serviceMapping.forEach(mapping => {
      const matchedCalendar = calendars.find(cal => 
        mapping.keywords.some(keyword => 
          cal.name.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (matchedCalendar) {
        console.log(`${mapping.envVar}=${matchedCalendar.id}  # ${matchedCalendar.name}`);
      } else {
        // Use first active calendar as fallback
        const fallbackCalendar = calendars.find(cal => cal.isActive) || calendars[0];
        if (fallbackCalendar) {
          console.log(`${mapping.envVar}=${fallbackCalendar.id}  # ${fallbackCalendar.name} (suggested)`);
        } else {
          console.log(`${mapping.envVar}=PLEASE_SET_CALENDAR_ID  # No suitable calendar found`);
        }
      }
    });

    console.log('\n📝 NEXT STEPS:');
    console.log('==============');
    console.log('1. Copy the environment variables above to your .env.local file');
    console.log('2. Adjust calendar assignments based on your business needs');
    console.log('3. Run the GHL integration test again: node tests/manual-tests/test-ghl-integration.cjs');
    console.log('4. Proceed with Phase 2 booking integration');

    console.log('\n💡 CALENDAR MANAGEMENT TIPS:');
    console.log('============================');
    console.log('- Each service type can use the same calendar or different ones');
    console.log('- Multiple services can share a calendar if you prefer unified scheduling');
    console.log('- Calendar names in GHL can be updated to match your service types');
    console.log('- Ensure calendars are marked as "Active" for booking availability');

  } catch (error) {
    console.error('\n❌ Calendar setup failed:', error.message);
    console.error('\n🔧 TROUBLESHOOTING:');
    console.error('1. Verify GHL credentials in .env.local');
    console.error('2. Check if calendars exist in your GHL location');
    console.error('3. Ensure Private Integration Token has calendar permissions');
    console.error('4. Create calendars in GHL dashboard if none exist');
    
    process.exit(1);
  }
}

// Run the setup
setupGHLCalendars().catch(console.error);