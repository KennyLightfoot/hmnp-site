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
  console.log(`🌱 Starting Houston Mobile Notary Pros Production Database Setup...`);
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // 1. Create Production Services
    console.log('\n📱 Seeding Production Services...');
    
    const services = [
      {
        id: 'hmnp_standard_notary',
        name: 'Standard Notary Services',
        type: ServiceType.STANDARD_NOTARY,
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
      {
        id: 'hmnp_extended_hours',
        name: 'Extended Hours Notary',
        type: ServiceType.EXTENDED_HOURS,
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
      {
        id: 'hmnp_loan_signing',
        name: 'Loan Signing Specialist',
        type: ServiceType.LOAN_SIGNING,
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
      {
        id: 'hmnp_ron_services',
        name: 'Remote Online Notarization (RON)',
        type: ServiceType.RON_SERVICES,
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
      }
    ];

    for (const service of services) {
      await prisma.service.upsert({
        where: { id: service.id },
        update: {
          name: service.name,
          description: service.description,
          basePrice: service.basePrice,
          depositAmount: service.depositAmount || undefined,
          durationMinutes: service.duration,
          isActive: service.isActive,
        },
        create: {
          ...service,
          serviceType: service.type,
          durationMinutes: service.duration,
          depositAmount: service.depositAmount || undefined,
        },
      });
      console.log(`✅ Upserted service: ${service.name}`);
    }

    // 2. Create Business Settings
    console.log('\n🏢 Seeding Business Settings...');
    
    const businessSettings = [
      // Business Hours
      {
        key: 'business_hours_monday_start',
        value: '09:00',
        dataType: 'string',
        category: 'booking',
        description: 'Monday opening time'
      },
      {
        key: 'business_hours_monday_end',
        value: '17:00',
        dataType: 'string',
        category: 'booking',
        description: 'Monday closing time'
      },
      {
        key: 'business_hours_tuesday_start',
        value: '09:00',
        dataType: 'string',
        category: 'booking',
        description: 'Tuesday opening time'
      },
      {
        key: 'business_hours_tuesday_end',
        value: '17:00',
        dataType: 'string',
        category: 'booking',
        description: 'Tuesday closing time'
      },
      {
        key: 'business_hours_wednesday_start',
        value: '09:00',
        dataType: 'string',
        category: 'booking',
        description: 'Wednesday opening time'
      },
      {
        key: 'business_hours_wednesday_end',
        value: '17:00',
        dataType: 'string',
        category: 'booking',
        description: 'Wednesday closing time'
      },
      {
        key: 'business_hours_thursday_start',
        value: '09:00',
        dataType: 'string',
        category: 'booking',
        description: 'Thursday opening time'
      },
      {
        key: 'business_hours_thursday_end',
        value: '17:00',
        dataType: 'string',
        category: 'booking',
        description: 'Thursday closing time'
      },
      {
        key: 'business_hours_friday_start',
        value: '09:00',
        dataType: 'string',
        category: 'booking',
        description: 'Friday opening time'
      },
      {
        key: 'business_hours_friday_end',
        value: '17:00',
        dataType: 'string',
        category: 'booking',
        description: 'Friday closing time'
      },
      {
        key: 'business_hours_saturday_start',
        value: '10:00',
        dataType: 'string',
        category: 'booking',
        description: 'Saturday opening time'
      },
      {
        key: 'business_hours_saturday_end',
        value: '15:00',
        dataType: 'string',
        category: 'booking',
        description: 'Saturday closing time'
      },
      // Sunday is closed by default

      // Operational Rules
      {
        key: 'minimum_lead_time_hours',
        value: '2',
        dataType: 'number',
        category: 'booking',
        description: 'Minimum hours required before booking'
      },
      {
        key: 'slot_interval_minutes',
        value: '30',
        dataType: 'number',
        category: 'booking',
        description: 'Time interval between available slots'
      },
      {
        key: 'buffer_time_minutes',
        value: '15',
        dataType: 'number',
        category: 'booking',
        description: 'Buffer time between appointments'
      },
      {
        key: 'service_area_base_zip',
        value: '77591',
        dataType: 'string',
        category: 'location',
        description: 'Base ZIP code for service area calculations'
      },
      {
        key: 'travel_fee_per_mile',
        value: '0.50',
        dataType: 'number',
        category: 'pricing',
        description: 'Travel fee per mile beyond included radius'
      },

      // Pricing Rules
      {
        key: 'emergency_surcharge',
        value: '30.00',
        dataType: 'number',
        category: 'pricing',
        description: 'Emergency service surcharge'
      },
      {
        key: 'weekend_surcharge',
        value: '40.00',
        dataType: 'number',
        category: 'pricing',
        description: 'Weekend service surcharge'
      },
      {
        key: 'weather_fuel_surcharge_per_mile',
        value: '0.65',
        dataType: 'number',
        category: 'pricing',
        description: 'Weather/fuel surcharge per mile'
      },
      {
        key: 'deposit_percentage',
        value: '50',
        dataType: 'number',
        category: 'pricing',
        description: 'Deposit percentage of service price'
      },
      {
        key: 'require_deposits',
        value: 'true',
        dataType: 'boolean',
        category: 'pricing',
        description: 'Whether deposits are required'
      },

      // Holidays
      {
        key: 'holidays',
        value: JSON.stringify([
          '2025-01-01',
          '2025-07-04',
          '2025-11-28',
          '2025-12-25'
        ]),
        dataType: 'json',
        category: 'booking',
        description: 'Holiday dates when business is closed'
      },

      // General Business Info
      {
        key: 'business_name',
        value: 'Houston Mobile Notary Pros',
        dataType: 'string',
        category: 'general',
        description: 'Official business name'
      },
      {
        key: 'business_phone',
        value: '(832) 617-4285',
        dataType: 'string',
        category: 'general',
        description: 'Main business phone number'
      },
      {
        key: 'business_email',
        value: 'info@houstonmobilenotarypros.com',
        dataType: 'string',
        category: 'general',
        description: 'Main business email'
      },
      {
        key: 'service_area_radius_miles',
        value: '25',
        dataType: 'number',
        category: 'general',
        description: 'Service area radius in miles'
      },
      {
        key: 'emergency_contact_available',
        value: 'true',
        dataType: 'boolean',
        category: 'general',
        description: 'Emergency contact availability'
      },

      // Notification Settings
      {
        key: 'send_confirmation_email',
        value: 'true',
        dataType: 'boolean',
        category: 'notification',
        description: 'Send confirmation email after booking'
      },
      {
        key: 'send_reminder_24hr',
        value: 'true',
        dataType: 'boolean',
        category: 'notification',
        description: 'Send 24-hour reminder'
      },
      {
        key: 'send_reminder_2hr',
        value: 'true',
        dataType: 'boolean',
        category: 'notification',
        description: 'Send 2-hour reminder'
      },
      {
        key: 'send_followup_email',
        value: 'true',
        dataType: 'boolean',
        category: 'notification',
        description: 'Send follow-up email after service'
      },

      // Payment Settings
      {
        key: 'payment_timeout_minutes',
        value: '30',
        dataType: 'number',
        category: 'payment',
        description: 'Time to complete payment before booking expires'
      },
      {
        key: 'stripe_enabled',
        value: 'true',
        dataType: 'boolean',
        category: 'payment',
        description: 'Enable Stripe payment processing'
      },

      // RON Settings
      {
        key: 'ron_enabled',
        value: 'true',
        dataType: 'boolean',
        category: 'services',
        description: 'Enable Remote Online Notarization services'
      },
      {
        key: 'ron_session_fee',
        value: '25.00',
        dataType: 'number',
        category: 'pricing',
        description: 'RON session fee component'
      },
      {
        key: 'ron_notarial_fee',
        value: '10.00',
        dataType: 'number',
        category: 'pricing',
        description: 'RON notarial fee component'
      },

      // System Settings
      {
        key: 'system_timezone',
        value: 'America/Chicago',
        dataType: 'string',
        category: 'system',
        description: 'System default timezone'
      },
      {
        key: 'booking_system_enabled',
        value: 'true',
        dataType: 'boolean',
        category: 'system',
        description: 'Enable online booking system'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        dataType: 'boolean',
        category: 'system',
        description: 'System maintenance mode'
      }
    ];

    for (const setting of businessSettings) {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          dataType: setting.dataType,
          category: setting.category,
          description: setting.description,
        },
        create: setting,
      });
      console.log(`✅ Upserted business setting: ${setting.key}`);
    }

    // 3. Create Promo Codes
    console.log('\n🎫 Seeding Promo Codes...');
    
    const promoCodes = [
      {
        id: 'promo_first25',
        code: 'FIRST25',
        description: 'First-time customer discount - $25 off',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 25.00,
        minimumAmount: 75.00,
        usageLimit: 100,
        usageCount: 0,
        perCustomerLimit: 1,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true,
        applicableServices: null
      },
      {
        id: 'promo_loyal10',
        code: 'LOYAL10',
        description: 'Returning customer loyalty discount - 10% off',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10.00,
        minimumAmount: 50.00,
        usageLimit: 500,
        usageCount: 0,
        perCustomerLimit: 5,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true,
        applicableServices: null
      },
      {
        id: 'promo_ron20',
        code: 'RON20',
        description: 'RON service launch special - 20% off',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20.00,
        minimumAmount: 25.00,
        usageLimit: 50,
        usageCount: 0,
        perCustomerLimit: 3,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-06-30'),
        isActive: true,
        applicableServices: JSON.stringify(['hmnp_ron_services'])
      }
    ];

    for (const promo of promoCodes) {
      await prisma.promoCode.upsert({
        where: { id: promo.id },
        update: {
          code: promo.code,
          description: promo.description,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          minimumAmount: promo.minimumAmount,
          usageLimit: promo.usageLimit,
          usageCount: promo.usageCount,
          perCustomerLimit: promo.perCustomerLimit,
          validFrom: promo.validFrom,
          validUntil: promo.validUntil,
          isActive: promo.isActive,
          applicableServices: Array.isArray(promo.applicableServices) ? promo.applicableServices : [],
        },
        create: {
          ...promo,
          discountValue: promo.discountValue,
          applicableServices: Array.isArray(promo.applicableServices) ? promo.applicableServices : [],
        },
      });
      console.log(`✅ Upserted promo code: ${promo.code}`);
    }

    // 4. Generate Summary Report
    console.log('\n📊 Production Database Setup Summary:');
    console.log('=====================================');
    
    const serviceCount = await prisma.service.count();
    const businessSettingsCount = await prisma.businessSettings.count();
    const promoCodeCount = await prisma.promoCode.count();
    
    console.log(`✅ Services: ${serviceCount}`);
    console.log(`✅ Business Settings: ${businessSettingsCount}`);
    console.log(`✅ Promo Codes: ${promoCodeCount}`);
    
    // Verify key settings
    const keySettings = await prisma.businessSettings.findMany({
      where: {
        key: {
          in: ['business_name', 'service_area_base_zip', 'minimum_lead_time_hours']
        }
      }
    });
    
    console.log('\n🔧 Key Business Settings Verification:');
    keySettings.forEach(setting => {
      console.log(`✅ ${setting.key}: ${setting.value}`);
    });

    console.log('\n🎉 Houston Mobile Notary Pros Database Setup Complete!');
    console.log('🚀 Your booking system is now ready for production use.');
    
  } catch (error) {
    console.error('❌ Error during production seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Production seeding failed:', e);
    process.exit(1);
  }); 