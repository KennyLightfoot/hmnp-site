import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBusinessSettings() {
  console.log('🌱 Seeding business settings for production stability...');
  
  const settings = [
    { key: 'business_timezone', value: 'America/Chicago', category: 'booking', description: 'Business timezone' },
    { key: 'business_hours_monday_start', value: '09:00', category: 'booking', description: 'Monday start time' },
    { key: 'business_hours_monday_end', value: '17:00', category: 'booking', description: 'Monday end time' },
    { key: 'business_hours_tuesday_start', value: '09:00', category: 'booking', description: 'Tuesday start time' },
    { key: 'business_hours_tuesday_end', value: '17:00', category: 'booking', description: 'Tuesday end time' },
    { key: 'business_hours_wednesday_start', value: '09:00', category: 'booking', description: 'Wednesday start time' },
    { key: 'business_hours_wednesday_end', value: '17:00', category: 'booking', description: 'Wednesday end time' },
    { key: 'business_hours_thursday_start', value: '09:00', category: 'booking', description: 'Thursday start time' },
    { key: 'business_hours_thursday_end', value: '17:00', category: 'booking', description: 'Thursday end time' },
    { key: 'business_hours_friday_start', value: '09:00', category: 'booking', description: 'Friday start time' },
    { key: 'business_hours_friday_end', value: '17:00', category: 'booking', description: 'Friday end time' },
    { key: 'business_hours_saturday_start', value: '10:00', category: 'booking', description: 'Saturday start time' },
    { key: 'business_hours_saturday_end', value: '15:00', category: 'booking', description: 'Saturday end time' },
    { key: 'minimum_lead_time_hours', value: '2', category: 'booking', description: 'Minimum booking lead time' },
    { key: 'slot_interval_minutes', value: '30', category: 'booking', description: 'Time slot intervals' },
    { key: 'buffer_time_minutes', value: '15', category: 'booking', description: 'Buffer between appointments' },
    { 
      key: 'blackout_dates', 
      value: JSON.stringify([
        '2024-07-04', '2024-12-25', '2024-01-01',
        '2025-07-04', '2025-12-25', '2025-01-01',
        '2026-07-04', '2026-12-25', '2026-01-01'
      ]), 
      category: 'booking', 
      description: 'Holiday blackout dates' 
    }
  ];

  for (const setting of settings) {
    try {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: { 
          value: setting.value,
          description: setting.description,
          category: setting.category,
          updatedAt: new Date()
        },
        create: {
          id: `bs_${setting.key}_${Date.now()}`,
          key: setting.key,
          value: setting.value,
          category: setting.category,
          description: setting.description,
          dataType: 'string'
        }
      });
      console.log(`✅ ${setting.key}: ${setting.value}`);
    } catch (error) {
      console.error(`❌ Failed to seed ${setting.key}:`, error);
    }
  }

  console.log('\n🎉 Business settings seeded successfully!');
  
  // Verify settings
  const count = await prisma.businessSettings.count({
    where: { category: 'booking' }
  });
  console.log(`📊 Total booking settings: ${count}`);
}

seedBusinessSettings()
  .catch((error) => {
    console.error('❌ Error seeding business settings:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });