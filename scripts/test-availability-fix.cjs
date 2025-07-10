#!/usr/bin/env node

/**
 * Test Availability Fix - Houston Mobile Notary Pros
 * 
 * Tests both the working and failing availability endpoints to confirm the fix
 */

async function testAvailabilityEndpoints() {
  console.log('🧪 Testing Availability Endpoint Fix');
  console.log('====================================\n');
  
  const BASE_URL = 'http://localhost:3000';
  const testDate = '2025-01-12'; // Tomorrow
  
  console.log(`📅 Testing date: ${testDate}\n`);
  
  // Test 1: Working endpoint (database-based)
  console.log('1. 🟢 TESTING WORKING ENDPOINT: /api/availability');
  console.log('   (Database-based, uses serviceId)');
  console.log('   ----------------------------------------');
  
  try {
    const workingUrl = `${BASE_URL}/api/availability?serviceId=standard-notary&date=${testDate}&timezone=America/Chicago`;
    console.log(`   URL: ${workingUrl}`);
    
    const workingResponse = await fetch(workingUrl);
    console.log(`   Status: ${workingResponse.status} ${workingResponse.statusText}`);
    
    if (workingResponse.ok) {
      const workingData = await workingResponse.json();
      console.log(`   ✅ SUCCESS: Found ${workingData.availableSlots?.length || 0} available slots`);
      
      if (workingData.availableSlots && workingData.availableSlots.length > 0) {
        console.log(`   📋 Sample slots:`);
        workingData.availableSlots.slice(0, 3).forEach((slot, i) => {
          console.log(`      ${i + 1}. ${slot.startTime} - ${slot.endTime} (Available: ${slot.available})`);
        });
      }
      
      console.log(`   📊 Business Hours: ${workingData.businessHours?.startTime} - ${workingData.businessHours?.endTime}`);
      console.log(`   🏢 Service: ${workingData.serviceInfo?.name}`);
    } else {
      const errorData = await workingResponse.text();
      console.log(`   ❌ FAILED: ${errorData}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  console.log('\n');
  
  // Test 2: Failing endpoint (GHL-based)
  console.log('2. 🔴 TESTING FAILING ENDPOINT: /api/booking/availability');
  console.log('   (GHL-based, uses serviceType)');
  console.log('   ----------------------------------------');
  
  try {
    const failingUrl = `${BASE_URL}/api/booking/availability?serviceType=STANDARD_NOTARY&date=${testDate}&timezone=America/Chicago`;
    console.log(`   URL: ${failingUrl}`);
    
    const failingResponse = await fetch(failingUrl);
    console.log(`   Status: ${failingResponse.status} ${failingResponse.statusText}`);
    
    if (failingResponse.ok) {
      const failingData = await failingResponse.json();
      console.log(`   Result: Found ${failingData.totalSlots || 0} available slots`);
      
      if (failingData.success && failingData.availableSlots?.length > 0) {
        console.log(`   ✅ GHL Integration Working: ${failingData.availableSlots.length} slots`);
      } else {
        console.log(`   ⚠️  GHL Integration Issues: ${failingData.error || 'No slots returned'}`);
        console.log(`   📋 Calendar ID: ${failingData.calendarId || 'Not provided'}`);
        console.log(`   🔧 This is expected - GHL calendars need configuration`);
      }
    } else {
      const errorData = await failingResponse.text();
      console.log(`   ❌ FAILED: ${errorData}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  console.log('\n');
  
  // Test 3: Verify serviceId mapping works
  console.log('3. 🔍 TESTING SERVICE MAPPING');
  console.log('   ----------------------------------------');
  
  const serviceTypes = ['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES'];
  const serviceMapping = {
    'STANDARD_NOTARY': 'standard-notary',
    'EXTENDED_HOURS': 'extended-hours',
    'LOAN_SIGNING': 'loan-signing',
    'RON_SERVICES': 'ron-services'
  };
  
  for (const serviceType of serviceTypes) {
    const serviceId = serviceMapping[serviceType];
    console.log(`   ${serviceType} → ${serviceId}`);
    
    try {
      const testUrl = `${BASE_URL}/api/availability?serviceId=${serviceId}&date=${testDate}&timezone=America/Chicago`;
      const response = await fetch(testUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`      ✅ ${data.availableSlots?.length || 0} slots available`);
      } else {
        console.log(`      ❌ HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n');
  
  // Summary
  console.log('📋 SUMMARY');
  console.log('==========');
  console.log('✅ If Test 1 shows available slots, the database-based system is working');
  console.log('⚠️  Test 2 may fail due to GHL calendar configuration (this is expected)');
  console.log('🔧 The fix routes booking forms to use Test 1 (working) instead of Test 2 (failing)');
  console.log('🌐 Your booking forms should now show available time slots!');
  console.log('\n📍 Next: Test your booking page in the browser');
}

// Run the tests
testAvailabilityEndpoints().catch(console.error); 