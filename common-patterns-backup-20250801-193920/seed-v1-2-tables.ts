import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedV12Tables() {
  console.log('🌱 Seeding v1.2 tables with default data...');
  
  try {
    // 1. Seed default service areas for Houston Metro
    console.log('📍 Creating service areas...');
    
    const housenCoreArea = await prisma.service_areas.upsert({
      where: { name: 'Houston Metro Core' },
      update: {},
      create: {
        name: 'Houston Metro Core',
        description: 'Primary service area covering downtown Houston and immediate suburbs',
        polygon_coordinates: {
          type: 'Polygon',
          coordinates: [[
            [-95.7, 29.5], [-95.1, 29.5], [-95.1, 30.1], [-95.7, 30.1], [-95.7, 29.5]
          ]]
        },
        service_fee_multiplier: 1.0,
        active: true
      }
    });
    
    const houstonExtendedArea = await prisma.service_areas.upsert({
      where: { name: 'Extended Houston Area' },
      update: {},
      create: {
        name: 'Extended Houston Area', 
        description: 'Secondary service area with additional travel fees',
        polygon_coordinates: {
          type: 'Polygon',
          coordinates: [[
            [-96.0, 29.2], [-94.8, 29.2], [-94.8, 30.4], [-96.0, 30.4], [-96.0, 29.2]
          ]]
        },
        service_fee_multiplier: 1.5,
        active: true
      }
    });
    
    console.log(`✅ Created service areas: ${housenCoreArea.name}, ${houstonExtendedArea.name}`);
    
    // 2. Seed default feature flags
    console.log('🚩 Creating feature flags...');
    
    const featureFlags = [
      {
        key: 'ron_service_toggle',
        enabled: true,
        description: 'Enable/disable RON services globally',
        rolloutPercentage: 100,
        environment: 'production'
      },
      {
        key: 'mobile_service_toggle', 
        enabled: true,
        description: 'Enable/disable mobile notary services',
        rolloutPercentage: 100,
        environment: 'production'
      },
      {
        key: 'advanced_pricing_engine',
        enabled: false,
        description: 'Use advanced real-time pricing calculations',
        rolloutPercentage: 0,
        environment: 'development'
      },
      {
        key: 'proof_integration',
        enabled: true,
        description: 'Enable Proof.co integration for RON services', 
        rolloutPercentage: 100,
        environment: 'production'
      },
      {
        key: 'google_maps_integration',
        enabled: true,
        description: 'Enable Google Maps for distance calculations',
        rolloutPercentage: 100,
        environment: 'production'
      },
      {
        key: 'sms_notifications',
        enabled: true,
        description: 'Enable SMS notifications via Twilio',
        rolloutPercentage: 100,
        environment: 'production'
      },
      {
        key: 'push_notifications',
        enabled: false,
        description: 'Enable PWA push notifications',
        rolloutPercentage: 0,
        environment: 'development'
      },
      {
        key: 'admin_analytics_dashboard',
        enabled: true,
        description: 'Show advanced analytics in admin portal',
        rolloutPercentage: 100,
        environment: 'production'
      },
      {
        key: 'customer_portal_v2',
        enabled: false,
        description: 'New customer portal interface',
        rolloutPercentage: 0,
        environment: 'development'
      },
      {
        key: 'notary_mobile_app',
        enabled: false,
        description: 'Mobile app features for notaries',
        rolloutPercentage: 0,
        environment: 'development'
      }
    ];
    
    let createdFlags = 0;
    for (const flag of featureFlags) {
      await prisma.feature_flags.upsert({
        where: { key: flag.key },
        update: {},
        create: flag
      });
      createdFlags++;
    }
    
    console.log(`✅ Created ${createdFlags} feature flags`);
    
    // 3. Initialize today's metrics entry
    console.log('📊 Initializing daily metrics...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    
    await prisma.daily_metrics.upsert({
      where: { date: today },
      update: {},
      create: {
        date: today,
        total_bookings: 0,
        mobile_bookings: 0,
        ron_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        total_revenue: 0,
        mobile_revenue: 0,
        ron_revenue: 0,
        proof_costs: 0,
        mileage_costs: 0,
        stripe_fees: 0,
        net_revenue: 0,
        new_customers: 0,
        repeat_customers: 0
      }
    });
    
    console.log(`✅ Initialized daily metrics for ${today.toDateString()}`);
    
    // 4. Check existing users and create sample notary profiles if needed
    console.log('👤 Checking for notary users to create profiles...');
    
    const notaryUsers = await prisma.user.findMany({
      where: { role: 'NOTARY' }
    });
    
    if (notaryUsers.length > 0) {
      for (const notaryUser of notaryUsers) {
        const existingProfile = await prisma.notary_profiles.findUnique({
          where: { user_id: notaryUser.id }
        });
        
        if (!existingProfile) {
          await prisma.notary_profiles.create({
            data: {
              user_id: notaryUser.id,
              commission_number: 'TX123456789', // Sample - should be updated by notary
              commission_expiry: new Date('2026-12-31'),
              base_address: 'Houston, TX 77002', // Default downtown Houston
              service_radius_miles: 25,
              is_active: true,
              preferred_service_types: ['STANDARD_NOTARY', 'LOAN_SIGNING_SPECIALIST'],
              daily_capacity: 8
            }
          });
          console.log(`✅ Created notary profile for ${notaryUser.name || notaryUser.email}`);
        }
      }
    } else {
      console.log('ℹ️  No notary users found - notary profiles will be created when notaries register');
    }
    
    console.log('\n🎉 v1.2 table seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Service areas: 2 created (Houston Metro Core, Extended Houston Area)');  
    console.log('- Feature flags: 10 created (production ready)');
    console.log('- Daily metrics: Initialized for today');
    console.log('- Notary profiles: Created for existing notary users');
    console.log('\n🚀 Database is now ready for v1.2 functionality!');
    
  } catch (error) {
    console.error('❌ Error seeding v1.2 tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedV12Tables()
  .catch((error) => {
    console.error('Failed to seed v1.2 tables:', error);
    process.exit(1);
  }); 