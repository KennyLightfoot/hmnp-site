#!/usr/bin/env node

/**
 * Quick Test - Houston Mobile Notary Pros
 * Using correct future dates (server is in July 2025)
 */

async function quickTest() {
  console.log('🚀 QUICK TEST WITH CORRECT FUTURE DATES');
  console.log('Server date: July 10, 2025');
  console.log('Testing with August dates...\n');
  
  const BASE_URL = 'http://localhost:3000';
  const serviceId = 'standard-notary-002';
  const testDate = '2025-08-15'; // Future relative to July 2025
  
  try {
    const testUrl = `${BASE_URL}/api/availability?serviceId=${serviceId}&date=${testDate}&timezone=America/Chicago`;
    console.log(`Testing: ${testUrl}`);
    
    const response = await fetch(testUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! API is working!');
      console.log(`📊 Available slots: ${data.availableSlots?.length || 0}`);
      
      if (data.availableSlots && data.availableSlots.length > 0) {
        console.log('🎉 AVAILABILITY SLOTS FOUND!');
        console.log('📋 Sample slots:');
        data.availableSlots.slice(0, 5).forEach((slot, i) => {
          console.log(`   ${i + 1}. ${slot.startTime} - ${slot.endTime} (Available: ${slot.available})`);
        });
        console.log(`\n🏢 Service: ${data.serviceInfo?.name}`);
        console.log(`⏰ Business Hours: ${data.businessHours?.startTime} - ${data.businessHours?.endTime}`);
        console.log(`\n🎯 CONCLUSION: YOUR BOOKING FORMS SHOULD NOW WORK!`);
        console.log(`Just use dates in August 2025 or later.`);
      } else {
        console.log('⚠️  API working but no slots available');
        console.log('This could be due to business hours or weekend restrictions');
        console.log('Response:', JSON.stringify(data, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

quickTest(); 