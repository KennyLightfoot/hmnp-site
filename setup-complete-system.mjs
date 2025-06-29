import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupCompleteSystem() {
  console.log('🚀 Setting up Houston Mobile Notary Pros - Complete System Setup...\n');

  try {
    // 1. Setup Business Settings
    console.log('📅 Setting up business settings...');
    const businessSettings = [
      {
        key: 'booking.bufferTimeMinutes',
        value: '15',
        dataType: 'number',
        description: 'Buffer time between appointments in minutes',
        category: 'booking'
      },
      {
        key: 'booking.leadTimeHours',
        value: '2',
        dataType: 'number',
        description: 'Minimum advance booking time in hours',
        category: 'booking'
      },
      {
        key: 'booking.advanceBookingDays',
        value: '60',
        dataType: 'number',
        description: 'Maximum days in advance to allow booking',
        category: 'booking'
      },
      {
        key: 'booking.timeSlotInterval',
        value: '30',
        dataType: 'number',
        description: 'Time slot interval in minutes',
        category: 'booking'
      },
      {
        key: 'booking.businessHours',
        value: JSON.stringify({
          monday: { open: '08:00', close: '18:00', enabled: true },
          tuesday: { open: '08:00', close: '18:00', enabled: true },
          wednesday: { open: '08:00', close: '18:00', enabled: true },
          thursday: { open: '08:00', close: '18:00', enabled: true },
          friday: { open: '08:00', close: '18:00', enabled: true },
          saturday: { open: '09:00', close: '17:00', enabled: true },
          sunday: { open: '12:00', close: '16:00', enabled: false }
        }),
        dataType: 'json',
        description: 'Business operating hours by day',
        category: 'booking'
      },
      {
        key: 'booking.holidays',
        value: JSON.stringify([
          '2024-12-25', // Christmas
          '2024-01-01', // New Year
          '2024-07-04', // Independence Day
          '2024-11-28', // Thanksgiving
          '2024-11-29'  // Black Friday
        ]),
        dataType: 'json',
        description: 'Holiday dates when business is closed',
        category: 'booking'
      },
      {
        key: 'payment.stripeEnabled',
        value: 'true',
        dataType: 'boolean',
        description: 'Enable Stripe payment processing',
        category: 'payment'
      },
      {
        key: 'notification.adminEmail',
        value: 'admin@houstonmobilenotarypros.com',
        dataType: 'string',
        description: 'Admin email for booking notifications',
        category: 'notification'
      }
    ];

    for (const setting of businessSettings) {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: { 
          value: setting.value,
          dataType: setting.dataType,
          description: setting.description,
          category: setting.category
        },
        create: setting
      });
    }
    console.log('✅ Business settings configured');

    // 2. Setup Services (update existing ones with proper duration)
    console.log('📋 Setting up services...');
    const serviceUpdates = [
      {
        id: 'cmb8ovso10000ve9xwvtf0my0',
        name: 'Standard Mobile Notary',
        durationMinutes: 90,
        basePrice: 75.00,
        depositAmount: 25.00
      },
      {
        id: 'cmb8p8ww20003veixccludati',
        name: 'Priority Mobile Notary (Rush)',
        durationMinutes: 90,
        basePrice: 100.00,
        depositAmount: 25.00
      },
      {
        id: 'cmb8ovsxo0001ve9xi40rj4g5',
        name: 'Loan Signing Specialist',
        durationMinutes: 180,
        basePrice: 150.00,
        depositAmount: 25.00
      },
      {
        id: 'cmb8ovt3d0002ve9xks32rktv',
        name: 'Extended Hours Notary',
        durationMinutes: 90,
        basePrice: 100.00,
        depositAmount: 25.00
      }
    ];

    for (const service of serviceUpdates) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          durationMinutes: service.durationMinutes,
          basePrice: service.basePrice,
          depositAmount: service.depositAmount,
          isActive: true
        }
      });
    }
    console.log('✅ Services configured with durations');

    // 3. Create Promo Codes
    console.log('🎫 Creating promo codes...');
    const promoCodes = [
      {
        code: 'WELCOME10',
        description: 'Welcome discount - 10% off first booking',
        discountType: 'PERCENTAGE',
        discountValue: 10.00,
        maxDiscountAmount: 50.00,
        usageLimit: 100,
        perCustomerLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        applicableServices: [] // Apply to all services
      },
      {
        code: 'SAVE25',
        description: 'Save $25 on any booking over $100',
        discountType: 'FIXED_AMOUNT',
        discountValue: 25.00,
        minimumAmount: 100.00,
        usageLimit: 50,
        perCustomerLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
        applicableServices: []
      },
      {
        code: 'LOANSIGNING15',
        description: '15% off loan signing services',
        discountType: 'PERCENTAGE',
        discountValue: 15.00,
        maxDiscountAmount: 75.00,
        usageLimit: 25,
        perCustomerLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        applicableServices: ['cmb8ovsxo0001ve9xi40rj4g5'] // Only for loan signing
      },
      {
        code: 'PRIORITY20',
        description: '$20 off priority rush service',
        discountType: 'FIXED_AMOUNT',
        discountValue: 20.00,
        minimumAmount: 75.00,
        usageLimit: 30,
        perCustomerLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        isActive: true,
        applicableServices: ['cmb8p8ww20003veixccludati'] // Only for priority service
      }
    ];

    for (const promo of promoCodes) {
      await prisma.promoCode.upsert({
        where: { code: promo.code },
        update: promo,
        create: promo
      });
    }
    console.log('✅ Promo codes created');

    // 4. Verify Setup
    console.log('\n🔍 Verifying system setup...');
    
    const activeServices = await prisma.service.findMany({
      where: { isActive: true }
    });
    
    const activePromoCodes = await prisma.promoCode.findMany({
      where: { isActive: true }
    });
    
    const businessSettingsCount = await prisma.businessSettings.count();

    console.log('\n🎯 Setup Complete! System Summary:');
    console.log(`  ✅ Services: ${activeServices.length} active`);
    activeServices.forEach(service => {
      console.log(`    - ${service.name}: $${service.basePrice} (${service.durationMinutes}min)`);
    });
    
    console.log(`  ✅ Promo Codes: ${activePromoCodes.length} active`);
    activePromoCodes.forEach(code => {
      const discount = code.discountType === 'PERCENTAGE' ? `${code.discountValue}%` : `$${code.discountValue}`;
      console.log(`    - ${code.code}: ${discount} off`);
    });
    
    console.log(`  ✅ Business Settings: ${businessSettingsCount} configured`);

    console.log('\n🚀 Next Steps:');
    console.log('1. Visit /booking/new to test the booking flow');
    console.log('2. Try promo codes: WELCOME10, SAVE25, LOANSIGNING15, PRIORITY20');
    console.log('3. Check availability API: /api/availability-compatible');
    console.log('4. Configure payment processing environment variables');
    console.log('5. Test complete booking flow with payment');

    console.log('\n✨ Your Houston Mobile Notary Pros booking system is ready for production!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleteSystem(); 