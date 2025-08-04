/**
 * Database Seed Script - Schema V2 Compatible
 * Houston Mobile Notary Pros
 * 
 * FIXED: Now matches schema-v2 structure
 * - serviceType → type
 * - Uses simple ServiceType enum (MOBILE, RON)
 * - Matches new field names
 */

import * as dotenv from 'dotenv';
import { PrismaClient, ServiceType } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 Start seeding database with schema-v2 structure...`);
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Mobile Services (MOBILE type)
    console.log('📱 Seeding Mobile Services...');
    const mobileServices = [
      {
        id: 'mobile-standard-001',
        name: 'Standard Mobile Notary',
        type: ServiceType.STANDARD_NOTARY,
        description: 'General notary services at your location. Includes travel within 20-mile radius.',
        basePrice: 75.00,
        depositRequired: true,
        depositAmount: 25.00,
        duration: 90, // minutes
        maxSigners: 2,
        maxDocuments: 5,
        isActive: true,
        serviceRadius: 20,
        extendedRadius: 50,
        travelFeeRate: 0.50
      },
      {
        id: 'mobile-extended-001', 
        name: 'Extended Hours Mobile Notary',
        type: ServiceType.STANDARD_NOTARY,
        description: 'Mobile notary services during extended hours (evenings/weekends).',
        basePrice: 100.00,
        depositRequired: true,
        depositAmount: 25.00,
        duration: 90,
        maxSigners: 2,
        maxDocuments: 5,
        isActive: true,
        serviceRadius: 30,
        extendedRadius: 50,
        travelFeeRate: 0.50
      },
      {
        id: 'mobile-loan-001',
        name: 'Loan Signing Specialist',
        type: ServiceType.STANDARD_NOTARY,
        description: 'Professional loan document signing services for mortgages and refinances.',
        basePrice: 150.00,
        depositRequired: true,
        depositAmount: 50.00,
        duration: 120,
        maxSigners: 3,
        maxDocuments: 20,
        isActive: true,
        serviceRadius: 25,
        extendedRadius: 50,
        travelFeeRate: 0.50
      }
    ];

    // RON Services (RON type)
    console.log('🌐 Seeding RON Services...');
    const ronServices = [
      {
        id: 'ron-standard-001',
        name: 'RON Standard Acknowledgment',
        type: ServiceType.STANDARD_NOTARY,
        description: 'Remote Online Notarization for standard acknowledgments.',
        basePrice: 35.00,
        depositRequired: false,
        depositAmount: null,
        duration: 30,
        maxSigners: 1,
        maxDocuments: 3,
        isActive: true,
        serviceRadius: null, // RON has no travel
        extendedRadius: null,
        travelFeeRate: null
      }
    ];

    // Insert all services
    const allServices = [...mobileServices, ...ronServices];
    
    for (const service of allServices) {
      await prisma.service.upsert({
        where: { id: service.id },
        update: {
          name: service.name,
          serviceType: service.type, // Fixed: use 'type' not 'serviceType'
          description: service.description,
          basePrice: service.basePrice,
          depositAmount: service.depositAmount || undefined,
          durationMinutes: service.duration,
          isActive: service.isActive,
        },
        create: {
          id: service.id,
          name: service.name,
          serviceType: service.type, // Fixed: use 'type' not 'serviceType'
          description: service.description,
          basePrice: service.basePrice,
          depositAmount: service.depositAmount || undefined,
          durationMinutes: service.duration,
          isActive: service.isActive,
        }
      });
      
      console.log(`✅ Service created/updated: ${service.name}`);
    }
    
    console.log(`🎉 Seeded ${allServices.length} services successfully!`);
    
    // Verify services exist
    const serviceCount = await prisma.service.count();
    console.log(`📊 Total services in database: ${serviceCount}`);
    
    // Show service summary
    const services = await prisma.service.findMany({
      select: { id: true, name: true, serviceType: true, basePrice: true, isActive: true }
    });
    
    console.log('\n📋 Service Summary:');
    services.forEach(service => {
      console.log(`   ${service.serviceType}: ${service.name} - $${service.basePrice} (${service.isActive ? 'Active' : 'Inactive'})`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal seeding error:', e);
    process.exit(1);
  });