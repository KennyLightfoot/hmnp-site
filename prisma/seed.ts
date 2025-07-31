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
        id: 'quick-stamp-local-001',
        name: 'Quick-Stamp Local',
        serviceType: ServiceType.QUICK_STAMP_LOCAL,
        description: 'Fast & simple local signings for routine documents',
        basePrice: 50.00,
        requiresDeposit: false,
        depositAmount: 0.00,
        durationMinutes: 30,
        isActive: true,
      },
      {
        id: 'standard-notary-002',
        name: 'Standard Notary',
        serviceType: ServiceType.STANDARD_NOTARY,
        description: 'Perfect for routine document notarization during business hours',
        basePrice: 75.00,
        requiresDeposit: true,
        depositAmount: 25.00,
        durationMinutes: 60,
        isActive: true,
      },
      {
        id: 'extended-hours-003',
        name: 'Extended Hours',
        serviceType: ServiceType.EXTENDED_HOURS,
        description: 'Extended availability for urgent needs and after-hours appointments',
        basePrice: 100.00,
        requiresDeposit: true,
        depositAmount: 25.00,
        durationMinutes: 90,
        isActive: true,
      },
      {
        id: 'loan-signing-004',
        name: 'Loan Signing Specialist',
        serviceType: ServiceType.LOAN_SIGNING,
        description: 'Specialized expertise for loan documents and real estate transactions',
        basePrice: 150.00,
        requiresDeposit: true,
        depositAmount: 50.00,
        durationMinutes: 120,
        isActive: true,
      },
      {
        id: 'ron-services-005',
        name: 'Remote Online Notarization',
        serviceType: ServiceType.RON_SERVICES,
        description: 'Secure remote notarization from anywhere, available 24/7',
        basePrice: 35.00,
        requiresDeposit: false,
        depositAmount: 0.00,
        durationMinutes: 30,
        isActive: true,
      },
      {
        id: 'business-essentials-006',
        name: 'Business Subscription - Essentials',
        serviceType: ServiceType.BUSINESS_ESSENTIALS,
        description: 'Monthly subscription for regular business notarization needs',
        basePrice: 125.00,
        requiresDeposit: false,
        depositAmount: 0.00,
        durationMinutes: 60,
        isActive: true,
      },
      {
        id: 'business-growth-007',
        name: 'Business Subscription - Growth',
        serviceType: ServiceType.BUSINESS_GROWTH,
        description: 'Premium monthly subscription for high-volume business needs',
        basePrice: 349.00,
        requiresDeposit: false,
        depositAmount: 0.00,
        durationMinutes: 90,
        isActive: true,
      }
    ];

    for (const service of services) {
      await prisma.service.upsert({
        where: { name: service.name },
        update: {
          serviceType: service.serviceType,
          description: service.description,
          basePrice: service.basePrice,
          requiresDeposit: service.requiresDeposit,
          depositAmount: service.depositAmount,
          durationMinutes: service.durationMinutes,
          isActive: service.isActive,
        },
        create: service,
      });
      console.log(`✅ Upserted service: ${service.name}`);
    }

    // Create business settings needed for booking system
    console.log('⚙️ Seeding Business Settings...');
    
    const businessSettings = [
      // Business hours
      { key: 'business_hours_monday_start', value: '09:00', dataType: 'string', description: 'Monday start time', category: 'booking' },
      { key: 'business_hours_monday_end', value: '17:00', dataType: 'string', description: 'Monday end time', category: 'booking' },
      { key: 'business_hours_tuesday_start', value: '09:00', dataType: 'string', description: 'Tuesday start time', category: 'booking' },
      { key: 'business_hours_tuesday_end', value: '17:00', dataType: 'string', description: 'Tuesday end time', category: 'booking' },
      { key: 'business_hours_wednesday_start', value: '09:00', dataType: 'string', description: 'Wednesday start time', category: 'booking' },
      { key: 'business_hours_wednesday_end', value: '17:00', dataType: 'string', description: 'Wednesday end time', category: 'booking' },
      { key: 'business_hours_thursday_start', value: '09:00', dataType: 'string', description: 'Thursday start time', category: 'booking' },
      { key: 'business_hours_thursday_end', value: '17:00', dataType: 'string', description: 'Thursday end time', category: 'booking' },
      { key: 'business_hours_friday_start', value: '09:00', dataType: 'string', description: 'Friday start time', category: 'booking' },
      { key: 'business_hours_friday_end', value: '17:00', dataType: 'string', description: 'Friday end time', category: 'booking' },
      { key: 'business_hours_saturday_start', value: '10:00', dataType: 'string', description: 'Saturday start time', category: 'booking' },
      { key: 'business_hours_saturday_end', value: '15:00', dataType: 'string', description: 'Saturday end time', category: 'booking' },
      
      // Booking configuration
      { key: 'minimum_lead_time_hours', value: '2', dataType: 'number', description: 'Minimum lead time in hours', category: 'booking' },
      { key: 'slot_duration_minutes', value: '30', dataType: 'number', description: 'Time slot duration in minutes', category: 'booking' },
      { key: 'buffer_time_minutes', value: '15', dataType: 'number', description: 'Buffer time between appointments', category: 'booking' },
      { key: 'timezone', value: 'America/Chicago', dataType: 'string', description: 'Business timezone', category: 'booking' },
      
      // Pricing
      { key: 'travel_fee_per_mile', value: '2.50', dataType: 'number', description: 'Travel fee per mile', category: 'pricing' },
      { key: 'service_radius_miles', value: '20', dataType: 'number', description: 'Service radius in miles', category: 'pricing' },
    ];

    for (const setting of businessSettings) {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          dataType: setting.dataType,
          description: setting.description,
          category: setting.category,
        },
        create: setting,
      });
      console.log(`✅ Upserted business setting: ${setting.key}`);
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