import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function verifyServices() {
  console.log('🔍 Verifying unified services...');
  
  try {
    const services = await prisma.service.findMany({
      orderBy: { basePrice: 'asc' }
    });
    
    console.log('\n📋 Services in database:');
    console.log('═'.repeat(80));
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name}`);
      console.log(`   Type: ${service.serviceType}`);
      console.log(`   Price: $${service.basePrice}`);
      console.log(`   Duration: ${service.durationMinutes} min`);
      console.log(`   Active: ${service.isActive ? '✅' : '❌'}`);
      console.log('');
    });
    
    console.log('═'.repeat(80));
    console.log(`📊 Total services: ${services.length}`);
    
    // Check if we have all 7 expected services
    const expectedServiceTypes = [
      'QUICK_STAMP_LOCAL',
      'STANDARD_NOTARY', 
      'EXTENDED_HOURS',
      'LOAN_SIGNING',
      'RON_SERVICES',
      'BUSINESS_ESSENTIALS',
      'BUSINESS_GROWTH'
    ];
    
    const actualServiceTypes = services.map(s => s.serviceType);
    const missingServices = expectedServiceTypes.filter(type => !actualServiceTypes.includes(type));
    const extraServices = actualServiceTypes.filter(type => !expectedServiceTypes.includes(type));
    
    if (missingServices.length === 0 && extraServices.length === 0 && services.length === 7) {
      console.log('✅ SUCCESS: All 7 unified services are correctly configured!');
    } else {
      console.log('❌ Issues found:');
      if (missingServices.length > 0) {
        console.log(`   Missing: ${missingServices.join(', ')}`);
      }
      if (extraServices.length > 0) {
        console.log(`   Extra: ${extraServices.join(', ')}`);
      }
      console.log(`   Expected: 7, Found: ${services.length}`);
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyServices(); 