const { PrismaClient } = require('@prisma/client');

async function populateBusinessSettings() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  console.log('🔧 Populating Business Settings...');
  
  try {
    // Test connection first
    await prisma.$connect();
    console.log('✅ Database connected');

    const settings = [
      { key: 'business_hours_monday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_monday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_tuesday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_tuesday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_wednesday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_wednesday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_thursday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_thursday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_friday_start', value: '09:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_friday_end', value: '17:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_saturday_start', value: '10:00', dataType: 'string', category: 'booking' },
      { key: 'business_hours_saturday_end', value: '15:00', dataType: 'string', category: 'booking' },
      { key: 'minimum_lead_time_hours', value: '2', dataType: 'number', category: 'booking' },
      { key: 'slot_interval_minutes', value: '30', dataType: 'number', category: 'booking' },
      { key: 'buffer_time_minutes', value: '15', dataType: 'number', category: 'booking' },
      { key: 'blackout_dates', value: JSON.stringify(['2025-01-01', '2025-07-04', '2025-12-25']), dataType: 'json', category: 'booking' }
    ];

    for (const setting of settings) {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      });
      console.log(`✅ ${setting.key}`);
    }

    const count = await prisma.businessSettings.count({ where: { category: 'booking' } });
    console.log(`\n✅ Created ${count} business settings`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

populateBusinessSettings(); 