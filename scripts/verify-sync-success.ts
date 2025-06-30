import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySync() {
  console.log('🧪 VERIFYING SCHEMA SYNCHRONIZATION SUCCESS');
  console.log('=' .repeat(50));

  const results = {
    database: { pass: 0, fail: 0 },
    schema: { pass: 0, fail: 0 },
    services: { pass: 0, fail: 0 },
    api: { pass: 0, fail: 0 }
  };

  try {
    // Test 1: Database Connection
    console.log('\n📡 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection: PASS');
    results.database.pass++;

    // Test 2: Critical Tables
    console.log('\n🗄️ Testing critical tables...');
    const tableTests = [
      { name: 'User', accessor: 'user' },
      { name: 'Service', accessor: 'service' },
      { name: 'Booking', accessor: 'booking' },
      { name: 'PromoCode', accessor: 'promoCode' }
    ];
    
    for (const tableTest of tableTests) {
      try {
        const count = await prisma[tableTest.accessor].count();
        console.log(`✅ Table ${tableTest.name}: ${count} records`);
        results.schema.pass++;
      } catch (error) {
        console.log(`❌ Table ${tableTest.name}: ${error.message}`);
        results.schema.fail++;
      }
    }

    // Test 3: Service Data
    console.log('\n📊 Testing service data...');
    const services = await prisma.service.findMany({ where: { isActive: true } });
    
    if (services.length >= 3) {
      console.log(`✅ Services: Found ${services.length} active services`);
      results.services.pass++;
      
      services.forEach(service => {
        console.log(`  - ${service.name}: $${service.basePrice} (${service.serviceType})`);
      });
    } else {
      console.log(`❌ Services: Only ${services.length} active services (need at least 3)`);
      results.services.fail++;
    }

    // Test 4: API Endpoints
    console.log('\n🌐 Testing API endpoints...');
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const endpoints = [
      `${baseUrl}/api/services`,
      `${baseUrl}/api/services-compatible`,
      `${baseUrl}/api/debug/database-health`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          console.log(`✅ ${endpoint}: ${response.status}`);
          results.api.pass++;
        } else {
          console.log(`❌ ${endpoint}: ${response.status}`);
          results.api.fail++;
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
        results.api.fail++;
      }
    }

    // Overall Results
    console.log('\n📋 VERIFICATION RESULTS');
    console.log('=' .repeat(30));
    console.log(`Database Tests: ${results.database.pass}/${results.database.pass + results.database.fail}`);
    console.log(`Schema Tests: ${results.schema.pass}/${results.schema.pass + results.schema.fail}`);
    console.log(`Service Tests: ${results.services.pass}/${results.services.pass + results.services.fail}`);
    console.log(`API Tests: ${results.api.pass}/${results.api.pass + results.api.fail}`);

    const totalPass = Object.values(results).reduce((sum, cat) => sum + cat.pass, 0);
    const totalFail = Object.values(results).reduce((sum, cat) => sum + cat.fail, 0);
    
    console.log(`\nOVERALL: ${totalPass}/${totalPass + totalFail} tests passed`);
    
    if (totalFail === 0) {
      console.log('\n🎉 ALL TESTS PASSED - Schema sync successful!');
    } else {
      console.log(`\n⚠️ ${totalFail} tests failed - review issues above`);
    }

  } catch (error) {
    console.error('💥 Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySync();