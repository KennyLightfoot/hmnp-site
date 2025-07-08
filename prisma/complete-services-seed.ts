/**
 * Complete Services Setup - Houston Mobile Notary Pros
 * Implements all 6 services from the website per SERVICE_IMPLEMENTATION_PLAN.md
 */
import * as dotenv from 'dotenv';
import { PrismaClient, ServiceType } from '@prisma/client';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  console.log(`🚀 Starting complete services setup...`);
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Complete service list - all 6 services from website
    const allServices = [
      // 1. Quick-Stamp Local (NEW - missing from backend)
      {
        id: 'hmnp_quick_stamp_local',
        name: 'Quick-Stamp Local',
        type: ServiceType.MOBILE,
        description: 'Fast & simple local signings. ≤ 1 document, ≤ 2 stamps, 1 signer included.',
        basePrice: 50.00,
        depositRequired: false,
        depositAmount: null,
        duration: 30,
        maxSigners: 1,
        maxDocuments: 1,
        isActive: true,
        serviceRadius: 10,
        travelFeeRate: 0.50,
        businessHours: {
          schedule: 'Monday-Friday 9:00 AM - 5:00 PM',
          notes: 'Quick local service during business hours'
        },
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { available: false },
          sunday: { available: false }
        }
      },
      
      // 2. Standard Mobile Notary (EXISTING - update if needed)
      {
        id: 'hmnp_standard_notary',
        name: 'Standard Mobile Notary',
        type: ServiceType.MOBILE,
        description: 'Professional mobile notary services for up to 2 documents and 2 signers. Includes travel within 20-mile radius from ZIP 77591.',
        basePrice: 75.00,
        depositRequired: true,
        depositAmount: 25.00,
        duration: 60,
        maxSigners: 2,
        maxDocuments: 2,
        isActive: true,
        serviceRadius: 20,
        travelFeeRate: 0.50,
        businessHours: {
          schedule: 'Monday-Friday 9:00 AM - 5:00 PM',
          notes: 'Standard business hours'
        },
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '10:00', end: '15:00', available: true },
          sunday: { available: false }
        }
      },
      
      // 3. Extended Hours Mobile (EXISTING)
      {
        id: 'hmnp_extended_hours',
        name: 'Extended Hours Mobile Notary',
        type: ServiceType.MOBILE,
        description: 'Extended hours mobile notary services available 7 days a week, 7 AM - 9 PM. Up to 5 documents and 2 signers with 30-mile travel radius.',
        basePrice: 100.00,
        depositRequired: true,
        depositAmount: 25.00,
        duration: 60,
        maxSigners: 2,
        maxDocuments: 5,
        isActive: true,
        serviceRadius: 30,
        travelFeeRate: 0.50,
        businessHours: {
          schedule: 'Daily 7:00 AM - 9:00 PM',
          notes: 'Extended hours available all week'
        },
        availability: {
          monday: { start: '07:00', end: '21:00', available: true },
          tuesday: { start: '07:00', end: '21:00', available: true },
          wednesday: { start: '07:00', end: '21:00', available: true },
          thursday: { start: '07:00', end: '21:00', available: true },
          friday: { start: '07:00', end: '21:00', available: true },
          saturday: { start: '07:00', end: '21:00', available: true },
          sunday: { start: '07:00', end: '21:00', available: true }
        }
      },
      
      // 4. Loan Signing Specialist (EXISTING)
      {
        id: 'hmnp_loan_signing',
        name: 'Loan Signing Specialist',
        type: ServiceType.MOBILE,
        description: 'Professional loan signing services by certified specialist. Unlimited documents, up to 4 signers, 90-minute sessions. Flat rate pricing.',
        basePrice: 150.00,
        depositRequired: true,
        depositAmount: 50.00,
        duration: 90,
        maxSigners: 4,
        maxDocuments: 999,
        isActive: true,
        serviceRadius: 20,
        travelFeeRate: 0.50,
        businessHours: {
          schedule: 'By appointment',
          notes: 'Flexible scheduling available'
        },
        availability: {
          monday: { start: '08:00', end: '20:00', available: true },
          tuesday: { start: '08:00', end: '20:00', available: true },
          wednesday: { start: '08:00', end: '20:00', available: true },
          thursday: { start: '08:00', end: '20:00', available: true },
          friday: { start: '08:00', end: '20:00', available: true },
          saturday: { start: '08:00', end: '20:00', available: true },
          sunday: { start: '10:00', end: '18:00', available: true }
        }
      },
      
      // 5. RON Services (EXISTING)
      {
        id: 'hmnp_ron_services',
        name: 'Remote Online Notarization (RON)',
        type: ServiceType.RON,
        description: 'Secure remote online notarization via video conference using Proof.com technology. Available 24/7 with up to 10 documents per session.',
        basePrice: 35.00,
        depositRequired: false,
        depositAmount: null,
        duration: 45,
        maxSigners: 1,
        maxDocuments: 10,
        isActive: true,
        serviceRadius: null,
        travelFeeRate: null,
        businessHours: {
          schedule: '24/7 Availability',
          notes: 'Remote service available anytime'
        },
        availability: {
          monday: { start: '00:00', end: '23:59', available: true },
          tuesday: { start: '00:00', end: '23:59', available: true },
          wednesday: { start: '00:00', end: '23:59', available: true },
          thursday: { start: '00:00', end: '23:59', available: true },
          friday: { start: '00:00', end: '23:59', available: true },
          saturday: { start: '00:00', end: '23:59', available: true },
          sunday: { start: '00:00', end: '23:59', available: true }
        }
      },
      
      // 6. Business Subscription Essentials (NEW)
      {
        id: 'hmnp_business_essentials',
        name: 'Business Subscription - Essentials',
        type: ServiceType.RON,
        description: 'Monthly subscription: Up to 10 RON seals/month + 10% off mobile rates.',
        basePrice: 125.00,
        depositRequired: false,
        depositAmount: null,
        duration: 30,
        maxSigners: 1,
        maxDocuments: 10,
        isActive: true,
        serviceRadius: null,
        travelFeeRate: null,
        businessHours: {
          schedule: '24/7 RON availability + mobile discounts',
          notes: 'Monthly subscription service'
        },
        availability: {
          monday: { start: '00:00', end: '23:59', available: true },
          tuesday: { start: '00:00', end: '23:59', available: true },
          wednesday: { start: '00:00', end: '23:59', available: true },
          thursday: { start: '00:00', end: '23:59', available: true },
          friday: { start: '00:00', end: '23:59', available: true },
          saturday: { start: '00:00', end: '23:59', available: true },
          sunday: { start: '00:00', end: '23:59', available: true }
        }
      },
      
      // 7. Business Subscription Growth (NEW)
      {
        id: 'hmnp_business_growth',
        name: 'Business Subscription - Growth',
        type: ServiceType.RON,
        description: 'Monthly subscription: Up to 40 RON seals/month + 10% off mobile rates + 1 free loan signing.',
        basePrice: 349.00,
        depositRequired: false,
        depositAmount: null,
        duration: 30,
        maxSigners: 1,
        maxDocuments: 40,
        isActive: true,
        serviceRadius: null,
        travelFeeRate: null,
        businessHours: {
          schedule: '24/7 RON availability + mobile discounts + loan signing',
          notes: 'Premium monthly subscription service'
        },
        availability: {
          monday: { start: '00:00', end: '23:59', available: true },
          tuesday: { start: '00:00', end: '23:59', available: true },
          wednesday: { start: '00:00', end: '23:59', available: true },
          thursday: { start: '00:00', end: '23:59', available: true },
          friday: { start: '00:00', end: '23:59', available: true },
          saturday: { start: '00:00', end: '23:59', available: true },
          sunday: { start: '00:00', end: '23:59', available: true }
        }
      }
    ];

    // Insert all services
    for (const service of allServices) {
      await prisma.service.upsert({
        where: { id: service.id },
        update: {
          name: service.name,
          type: service.type,
          description: service.description,
          basePrice: service.basePrice,
          depositRequired: service.depositRequired,
          depositAmount: service.depositAmount,
          duration: service.duration,
          maxSigners: service.maxSigners,
          maxDocuments: service.maxDocuments,
          isActive: service.isActive,
          serviceRadius: service.serviceRadius,
          travelFeeRate: service.travelFeeRate,
          businessHours: service.businessHours,
          availability: service.availability,
        },
        create: {
          id: service.id,
          name: service.name,
          type: service.type,
          description: service.description,
          basePrice: service.basePrice,
          depositRequired: service.depositRequired,
          depositAmount: service.depositAmount,
          duration: service.duration,
          maxSigners: service.maxSigners,
          maxDocuments: service.maxDocuments,
          isActive: service.isActive,
          serviceRadius: service.serviceRadius,
          travelFeeRate: service.travelFeeRate,
          businessHours: service.businessHours,
          availability: service.availability,
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
      select: { id: true, name: true, type: true, basePrice: true, isActive: true }
    });
    
    console.log('\n📋 Complete Service Summary:');
    services.forEach(service => {
      console.log(`   ${service.type}: ${service.name} - $${service.basePrice} (${service.isActive ? 'Active' : 'Inactive'})`);
    });
    
    console.log('\n🚀 All 6 services from website now available in database!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 