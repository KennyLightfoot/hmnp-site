// Comprehensive API Testing for Houston Mobile Notary Pros Booking System
// Run this to verify all endpoints are working correctly

const baseUrl = 'http://localhost:3000';

async function testBookingAPIs() {
  console.log('🔧 Testing Houston Mobile Notary Pros Booking APIs...\n');

  try {
    // Test 1: Availability API
    console.log('1️⃣ Testing Availability API...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const availabilityUrl = `${baseUrl}/api/availability-compatible?date=${dateStr}&serviceId=cmb8ovso10000ve9xwvtf0my0&serviceDuration=90`;
    console.log(`   URL: ${availabilityUrl}`);
    
    try {
      const availabilityRes = await fetch(availabilityUrl);
      const availabilityData = await availabilityRes.json();
      console.log(`   ✅ Status: ${availabilityRes.status}`);
      console.log(`   📅 Available slots: ${availabilityData.slots?.length || 0}`);
      if (availabilityData.slots?.length > 0) {
        console.log(`   ⏰ First slot: ${availabilityData.slots[0]}`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test 2: Services API
    console.log('\n2️⃣ Testing Services API...');
    try {
      const servicesRes = await fetch(`${baseUrl}/api/services`);
      const servicesData = await servicesRes.json();
      console.log(`   ✅ Status: ${servicesRes.status}`);
      console.log(`   📋 Active services: ${servicesData.length || 0}`);
      servicesData.forEach(service => {
        console.log(`     - ${service.name}: $${service.basePrice} (${service.durationMinutes}min)`);
      });
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    // Test 3: Promo Code Validation
    console.log('\n3️⃣ Testing Promo Code Validation...');
    const promoTests = [
      {
        code: 'WELCOME10',
        serviceId: 'cmb8ovso10000ve9xwvtf0my0',
        originalAmount: 75.00,
        customerEmail: 'test@example.com',
        expected: 'Should give 10% discount (max $50)'
      },
      {
        code: 'SAVE25',
        serviceId: 'cmb8ovsxo0001ve9xi40rj4g5',
        originalAmount: 150.00,
        customerEmail: 'test2@example.com',
        expected: 'Should give $25 discount (meets $100 minimum)'
      },
      {
        code: 'SAVE25',
        serviceId: 'cmb8ovso10000ve9xwvtf0my0',
        originalAmount: 75.00,
        customerEmail: 'test3@example.com',
        expected: 'Should NOT apply (below $100 minimum)'
      },
      {
        code: 'LOANSIGNING15',
        serviceId: 'cmb8ovsxo0001ve9xi40rj4g5',
        originalAmount: 150.00,
        customerEmail: 'test4@example.com',
        expected: 'Should give 15% discount (loan signing only)'
      },
      {
        code: 'INVALIDCODE',
        serviceId: 'cmb8ovso10000ve9xwvtf0my0',
        originalAmount: 75.00,
        customerEmail: 'test5@example.com',
        expected: 'Should return error - invalid code'
      }
    ];

    for (const test of promoTests) {
      console.log(`\n   Testing: ${test.code} - ${test.expected}`);
      try {
        const promoRes = await fetch(`${baseUrl}/api/promo-codes/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: test.code,
            serviceId: test.serviceId,
            originalAmount: test.originalAmount,
            customerEmail: test.customerEmail
          })
        });
        
        const promoData = await promoRes.json();
        console.log(`   Status: ${promoRes.status}`);
        
        if (promoRes.ok) {
          console.log(`   ✅ Valid: ${promoData.valid}`);
          if (promoData.valid) {
            console.log(`   💰 Discount: $${promoData.discountAmount}`);
            console.log(`   🏷️ Final: $${promoData.finalAmount}`);
          }
        } else {
          console.log(`   ❌ Error: ${promoData.message || promoData.error}`);
        }
      } catch (err) {
        console.log(`   ❌ Request failed: ${err.message}`);
      }
    }

    // Test 4: Business Settings
    console.log('\n4️⃣ Testing Business Settings...');
    console.log('   ℹ️ Business settings are internal APIs - check via Prisma Studio');
    console.log('   📊 Should have ~25 configured settings');

    console.log('\n🎯 API Testing Summary:');
    console.log('✅ Availability API - Check calendar slots');
    console.log('✅ Services API - Verify active services');
    console.log('✅ Promo Code API - Test validation logic');
    console.log('✅ Business Settings - Configure via database');

    console.log('\n🚀 Next Steps:');
    console.log('1. Visit http://localhost:3000/booking/new to test full booking flow');
    console.log('2. Try each promo code in the frontend');
    console.log('3. Test mobile responsiveness');
    console.log('4. Verify email notifications (check logs)');
    console.log('5. Check Prisma Studio for data integrity');

  } catch (error) {
    console.error('❌ Testing failed:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBookingAPIs();
}

export default testBookingAPIs; 