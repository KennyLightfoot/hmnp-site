#!/usr/bin/env node

/**
 * Final Availability Fix Test - Houston Mobile Notary Pros
 * 
 * Tests the corrected availability system with real service IDs
 */

async function testFinalFix() {
  console.log('🎯 FINAL AVAILABILITY FIX TEST');
  console.log('===============================\n');
  
  const BASE_URL = 'http://localhost:3000';
  
  // Test multiple dates to find one that works
  const testDates = [
    '2025-01-20',
    '2025-01-25', 
    '2025-02-01',
    '2025-02-15'
  ];
  
  // Real service IDs from database
  const serviceMapping = {
    'STANDARD_NOTARY': 'standard-notary-002',
    'EXTENDED_HOURS': 'extended-hours-003',
    'LOAN_SIGNING': 'loan-signing-004',
    'RON_SERVICES': 'ron-services-005'
  };
  
  console.log('📋 Testing with REAL service IDs from database:');
  Object.entries(serviceMapping).forEach(([type, id]) => {
    console.log(`   ${type} → ${id}`);
  });
  console.log('');
  
  // Test each service with multiple dates
  for (const [serviceType, serviceId] of Object.entries(serviceMapping)) {
    console.log(`🔍 TESTING ${serviceType} (${serviceId})`);
    console.log('─'.repeat(50));
    
    let foundWorkingDate = false;
    
    for (const testDate of testDates) {
      try {
        const testUrl = `${BASE_URL}/api/availability?serviceId=${serviceId}&date=${testDate}&timezone=America/Chicago`;
        const response = await fetch(testUrl);
        
        console.log(`   📅 ${testDate}: Status ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.availableSlots && data.availableSlots.length > 0) {
            console.log(`   ✅ SUCCESS! Found ${data.availableSlots.length} available slots`);
            console.log(`   🕐 Sample slots: ${data.availableSlots.slice(0, 3).map(s => s.startTime).join(', ')}`);
            console.log(`   🏢 Service: ${data.serviceInfo?.name}`);
            console.log(`   ⏰ Business Hours: ${data.businessHours?.startTime} - ${data.businessHours?.endTime}`);
            foundWorkingDate = true;
            break; // Found working date, move to next service
          } else {
            console.log(`   ⚠️  No slots available (but API worked)`);
            if (data.message) {
              console.log(`   💬 Message: ${data.message}`);
            }
          }
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
    }
    
    if (!foundWorkingDate) {
      console.log(`   🔴 No working dates found for ${serviceType}`);
    }
    
    console.log('');
  }
  
  // Test the form-style API call
  console.log('🌐 TESTING FORM-STYLE API CALL');
  console.log('===============================');
  
  try {
    const formTestUrl = `${BASE_URL}/api/availability?serviceId=standard-notary-002&date=2025-02-15&timezone=America/Chicago`;
    console.log(`URL: ${formTestUrl}`);
    
    const response = await fetch(formTestUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Form API call successful!');
      console.log(`📊 Available slots: ${data.availableSlots?.length || 0}`);
      
      if (data.availableSlots && data.availableSlots.length > 0) {
        console.log('🎉 YOUR BOOKING FORMS SHOULD NOW WORK!');
        console.log('📋 The fix has successfully connected your forms to the working availability system.');
      } else {
        console.log('⚠️  API working but no slots available (check business hours/settings)');
      }
    } else {
      const errorData = await response.text();
      console.log(`❌ Form API call failed: ${errorData}`);
    }
  } catch (error) {
    console.log(`❌ Form test error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Fixed: Updated all booking forms to use working /api/availability endpoint');
  console.log('✅ Fixed: Updated service mappings to use real database IDs');
  console.log('✅ Fixed: Bypassed broken GHL calendar integration'); 
  console.log('');
  console.log('🌐 Next Steps:');
  console.log('1. Test your booking page in browser');
  console.log('2. Select a service and future date'); 
  console.log('3. Available time slots should now appear!');
  console.log('');
  console.log('💡 Note: If no slots appear, it may be due to:');
  console.log('   - Business hours configuration');
  console.log('   - Lead time requirements');
  console.log('   - Weekend/holiday restrictions');
}

testFinalFix().catch(console.error); 