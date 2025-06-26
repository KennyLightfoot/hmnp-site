const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n');

  try {
    // Check if tables exist and count records
    const tables = [
      'notary_profiles',
      'service_areas', 
      'feature_flags',
      'notary_journal',
      'mileage_cache',
      'daily_metrics'
    ];

    for (const table of tables) {
      try {
        const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "${table}"`;
        console.log(`📊 ${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Table not found or error - ${error.message}`);
      }
    }

    // Check some sample data
    console.log('\n📋 Sample data:');
    
    try {
      const serviceAreas = await prisma.serviceArea.findMany({ take: 3 });
      console.log('\n📍 Service Areas:');
      serviceAreas.forEach(area => {
        console.log(`  - ${area.name}: ${area.description}`);
      });
    } catch (error) {
      console.log('❌ Service Areas: Error accessing table');
    }

    try {
      const featureFlags = await prisma.featureFlag.findMany({ take: 3 });
      console.log('\n🚩 Feature Flags:');
      featureFlags.forEach(flag => {
        console.log(`  - ${flag.key}: ${flag.enabled ? '✅' : '❌'} (${flag.description})`);
      });
    } catch (error) {
      console.log('❌ Feature Flags: Error accessing table');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 