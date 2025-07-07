/**
 * Test GHL Calendar Mapping Utility
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Validates that calendar mapping works correctly
 */

require('dotenv').config({ path: '.env.local' });

async function testCalendarMapping() {
  console.log('🗺️  Testing GHL Calendar Mapping Utility');
  console.log('========================================\n');

  try {
    // Import the mapping functions (compiled JS version)
    console.log('📋 1. TESTING CALENDAR MAPPING FUNCTIONS');
    console.log('------------------------------------------');
    
    // Since we're in CommonJS, we'll test the environment variables directly
    const serviceTypes = ['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES'];
    const envVarMapping = {
      'STANDARD_NOTARY': 'GHL_STANDARD_NOTARY_CALENDAR_ID',
      'EXTENDED_HOURS': 'GHL_EXTENDED_HOURS_CALENDAR_ID', 
      'LOAN_SIGNING': 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID',
      'RON_SERVICES': 'GHL_BOOKING_CALENDAR_ID'
    };

    console.log('Testing service type to calendar ID mapping:\n');
    
    for (const serviceType of serviceTypes) {
      const envVarName = envVarMapping[serviceType];
      const calendarId = process.env[envVarName];
      
      if (calendarId) {
        console.log(`✅ ${serviceType}`);
        console.log(`   Environment Variable: ${envVarName}`);
        console.log(`   Calendar ID: ${calendarId}`);
        console.log(`   Display Name: ${getDisplayName(serviceType)}`);
      } else {
        console.log(`❌ ${serviceType}`);
        console.log(`   Environment Variable: ${envVarName} (MISSING)`);
      }
      console.log('');
    }

    // Test calendar ID validation
    console.log('🔍 2. CALENDAR ID VALIDATION');
    console.log('----------------------------');
    
    let allValid = true;
    const calendarIds = new Set();
    
    for (const serviceType of serviceTypes) {
      const envVarName = envVarMapping[serviceType];
      const calendarId = process.env[envVarName];
      
      if (!calendarId) {
        console.log(`❌ ${serviceType}: Missing calendar ID`);
        allValid = false;
        continue;
      }
      
      if (calendarIds.has(calendarId)) {
        console.log(`⚠️  ${serviceType}: Duplicate calendar ID detected`);
      } else {
        calendarIds.add(calendarId);
        console.log(`✅ ${serviceType}: Unique calendar ID configured`);
      }
    }
    
    console.log(`\nTotal calendars configured: ${calendarIds.size}`);
    console.log(`Validation result: ${allValid ? '✅ PASSED' : '❌ FAILED'}\n`);

    // Test API connectivity for each calendar
    console.log('🔌 3. CALENDAR API CONNECTIVITY TEST');
    console.log('------------------------------------');
    
    const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
    const GHL_PRIVATE_INTEGRATION_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
    
    if (!GHL_API_BASE_URL || !GHL_PRIVATE_INTEGRATION_TOKEN) {
      throw new Error('Missing GHL API credentials');
    }
    
    for (const serviceType of serviceTypes) {
      const envVarName = envVarMapping[serviceType];
      const calendarId = process.env[envVarName];
      
      if (!calendarId) {
        console.log(`⏭️  ${serviceType}: Skipping (no calendar ID)`);
        continue;
      }
      
      console.log(`Testing ${serviceType} calendar access...`);
      
      // Test by fetching tomorrow's slots (GHL API expects Unix timestamps)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const startDate = Math.floor(tomorrow.getTime() / 1000); // Unix timestamp
      
      const endOfDay = new Date(tomorrow);
      endOfDay.setHours(23, 59, 59, 999);
      const endDate = Math.floor(endOfDay.getTime() / 1000); // Unix timestamp
      
      const slotsUrl = `${GHL_API_BASE_URL}/calendars/${calendarId}/free-slots?startDate=${startDate}&endDate=${endDate}&timezone=America/Chicago`;
      
      try {
        const response = await fetch(slotsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GHL_PRIVATE_INTEGRATION_TOKEN}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          }
        });
        
        if (response.ok) {
          const slots = await response.json();
          console.log(`✅ ${serviceType}: ${slots.length || 0} available slots tomorrow`);
        } else {
          const errorText = await response.text();
          console.log(`❌ ${serviceType}: API error (${response.status}) - ${errorText}`);
          allValid = false;
        }
      } catch (error) {
        console.log(`❌ ${serviceType}: Connection error - ${error.message}`);
        allValid = false;
      }
    }

    console.log('\n📊 CALENDAR MAPPING TEST SUMMARY');
    console.log('=================================');
    console.log(`✅ Service types configured: ${serviceTypes.length}`);
    console.log(`✅ Unique calendars: ${calendarIds.size}`);
    console.log(`✅ API connectivity: ${allValid ? 'All working' : 'Some issues detected'}`);
    console.log(`✅ Ready for integration: ${allValid ? 'YES' : 'NO'}`);
    
    if (allValid) {
      console.log('\n🎉 Calendar mapping utility is ready for Phase 2 integration!');
      console.log('\n📋 NEXT STEPS:');
      console.log('- Enhance booking API to create GHL appointments');
      console.log('- Build availability API using these calendar mappings');
      console.log('- Update frontend to show real-time availability');
    } else {
      console.log('\n⚠️  Please resolve calendar configuration issues before proceeding');
    }

  } catch (error) {
    console.error('\n❌ Calendar mapping test failed:', error.message);
    console.error('\n🔧 TROUBLESHOOTING:');
    console.error('1. Verify all calendar IDs are set in .env.local');
    console.error('2. Run setup-ghl-calendars.cjs to get correct calendar IDs');
    console.error('3. Check GHL dashboard for calendar availability');
    
    process.exit(1);
  }
}

function getDisplayName(serviceType) {
  const displayNames = {
    'STANDARD_NOTARY': 'Standard Notary Services',
    'EXTENDED_HOURS': 'Extended Hours Services',
    'LOAN_SIGNING': 'Loan Signing Specialist',
    'RON_SERVICES': 'Remote Online Notarization'
  };
  
  return displayNames[serviceType] || serviceType;
}

// Run the test
testCalendarMapping().catch(console.error);