import * as dotenv from 'dotenv';
import { PrismaClient, ServiceType, DiscountType } from '@prisma/client';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
  process.exit(1);
}

console.log('✅ DATABASE_URL loaded successfully');
const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 Start seeding database...`);
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Create services using the CORRECT schema-v2 structure
    console.log('📱 Seeding Services...');
    
    const services = [
      {
        id: 'service_mobile_standard',
        name: 'Standard Mobile Notary',
        type: ServiceType.MOBILE,  // CORRECT: Use 'type' field with MOBILE enum
        description: 'General notary services at your location. Includes travel within a 20-mile radius.',
        basePrice: 75.00,
        depositRequired: true,
        depositAmount: 25.00,
        duration: 90,  // CORRECT: Use 'duration' field (minutes)
        maxSigners: 2,
        maxDocuments: 5,
        isActive: true,
        serviceRadius: 20,
        travelFeeRate: 2.50,
      },
      {
        id: 'service_mobile_extended',
        name: 'Extended Hours Mobile Notary',
        type: ServiceType.MOBILE,
        description: 'Mobile notary services during extended hours (evenings, weekends).',
        basePrice: 100.00,
        depositRequired: true,
        depositAmount: 25.00,
        duration: 90,
        maxSigners: 2,
        maxDocuments: 5,
        isActive: true,
        serviceRadius: 15,
        travelFeeRate: 3.00,
      },
      {
        id: 'service_mobile_loan_signing',
        name: 'Loan Signing Specialist',
        type: ServiceType.MOBILE,
        description: 'Specialized loan document signing services with certified loan signing agent.',
        basePrice: 150.00,
        depositRequired: true,
        depositAmount: 50.00,
        duration: 120,
        maxSigners: 4,
        maxDocuments: 100,
        isActive: true,
        serviceRadius: 25,
        travelFeeRate: 2.50,
      },
      {
        id: 'service_ron_standard',
        name: 'Remote Online Notarization',
        type: ServiceType.RON,  // CORRECT: Use RON enum value
        description: 'Secure remote online notarization via video conference.',
        basePrice: 35.00,
        depositRequired: false,
        depositAmount: null,
        duration: 30,
        maxSigners: 1,
        maxDocuments: 10,
        isActive: true,
        serviceRadius: null,  // Not applicable for RON
        travelFeeRate: null,
      }
    ];

    for (const service of services) {
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
        },
        create: service,
      });
      console.log(`✅ Upserted service: ${service.name}`);
    }

    // Create promotional campaigns using Phase 3 structure
    console.log('🎫 Seeding Promotional Campaigns...');
    
    const promotionalCampaigns = [
      {
        code: 'WELCOME10',
        name: '10% First-Time Customer Discount',
        description: 'Welcome to Houston Mobile Notary Pros!',
        type: 'first_time',
        value: 10,
        maxDiscount: 25,
        minOrderValue: 0,
        customerTypes: ['new'],
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true
      },
      {
        code: 'LOYAL20',
        name: '20% Loyalty Customer Discount',
        description: 'Thank you for being a loyal customer!',
        type: 'loyalty',
        value: 20,
        maxDiscount: 50,
        minOrderValue: 0,
        customerTypes: ['loyalty'],
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true
      },
      {
        code: 'FRIEND15',
        name: '15% Referral Discount',
        description: 'Thank you for the referral!',
        type: 'referral',
        value: 15,
        maxDiscount: 40,
        minOrderValue: 0,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true
      },
      {
        code: 'RON5OFF',
        name: '$5 RON Service Discount',
        description: 'Special discount for remote online notarization!',
        type: 'fixed_amount',
        value: 5,
        serviceTypes: ['RON_SERVICES'],
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        maxUses: 100,
        isActive: true
      },
      {
        code: 'WINTER25',
        name: '$25 Winter Special',
        description: 'Stay warm while we handle your notarization!',
        type: 'seasonal',
        value: 25,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-03-31'),
        maxUses: 50,
        isActive: true
      }
    ];

    for (const campaign of promotionalCampaigns) {
      await prisma.promotionalCampaign.upsert({
        where: { code: campaign.code },
        update: {
          ...campaign,
          updatedAt: new Date()
        },
        create: campaign,
      });
      console.log(`✅ Upserted promotional campaign: ${campaign.code} - ${campaign.name}`);
    }

    console.log(`🌱 Database seeding completed successfully!`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });