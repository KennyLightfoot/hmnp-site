import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed booking-related business settings
async function seedBookingSettings() {
  console.log('🗓️  Seeding Booking Business Settings...');

  const bookingSettings = [
    // Business Hours
    {
      id: 'booking_hours_monday_start',
      key: 'business_hours_monday_start',
      value: '09:00',
      dataType: 'time',
      description: 'Monday business start time',
      category: 'booking',
    },
    {
      id: 'booking_hours_monday_end',
      key: 'business_hours_monday_end',
      value: '17:00',
      dataType: 'time',
      description: 'Monday business end time',
      category: 'booking',
    },
    {
      id: 'booking_hours_tuesday_start',
      key: 'business_hours_tuesday_start',
      value: '09:00',
      dataType: 'time',
      description: 'Tuesday business start time',
      category: 'booking',
    },
    {
      id: 'booking_hours_tuesday_end',
      key: 'business_hours_tuesday_end',
      value: '17:00',
      dataType: 'time',
      description: 'Tuesday business end time',
      category: 'booking',
    },
    {
      id: 'booking_hours_wednesday_start',
      key: 'business_hours_wednesday_start',
      value: '09:00',
      dataType: 'time',
      description: 'Wednesday business start time',
      category: 'booking',
    },
    {
      id: 'booking_hours_wednesday_end',
      key: 'business_hours_wednesday_end',
      value: '17:00',
      dataType: 'time',
      description: 'Wednesday business end time',
      category: 'booking',
    },
    {
      id: 'booking_hours_thursday_start',
      key: 'business_hours_thursday_start',
      value: '09:00',
      dataType: 'time',
      description: 'Thursday business start time',
      category: 'booking',
    },
    {
      id: 'booking_hours_thursday_end',
      key: 'business_hours_thursday_end',
      value: '17:00',
      dataType: 'time',
      description: 'Thursday business end time',
      category: 'booking',
    },
    {
      id: 'booking_hours_friday_start',
      key: 'business_hours_friday_start',
      value: '09:00',
      dataType: 'time',
      description: 'Friday business start time',
      category: 'booking',
    },
    {
      id: 'booking_hours_friday_end',
      key: 'business_hours_friday_end',
      value: '17:00',
      dataType: 'time',
      description: 'Friday business end time',
      category: 'booking',
    },
    {
      id: 'booking_hours_saturday_start',
      key: 'business_hours_saturday_start',
      value: '10:00',
      dataType: 'time',
      description: 'Saturday business start time',
      category: 'booking',
    },
    {
      id: 'booking_hours_saturday_end',
      key: 'business_hours_saturday_end',
      value: '15:00',
      dataType: 'time',
      description: 'Saturday business end time',
      category: 'booking',
    },
    // Sunday closed by default (no settings)

    // Booking Configuration
    {
      id: 'booking_timezone',
      key: 'business_timezone',
      value: 'America/Chicago',
      dataType: 'string',
      description: 'Business timezone for scheduling',
      category: 'booking',
    },
    {
      id: 'booking_lead_time',
      key: 'minimum_lead_time_hours',
      value: '2',
      dataType: 'number',
      description: 'Minimum hours required before booking',
      category: 'booking',
    },
    {
      id: 'booking_slot_interval',
      key: 'slot_interval_minutes',
      value: '30',
      dataType: 'number',
      description: 'Time interval between available slots',
      category: 'booking',
    },
    {
      id: 'booking_buffer_time',
      key: 'buffer_time_minutes',
      value: '15',
      dataType: 'number',
      description: 'Buffer time between appointments',
      category: 'booking',
    },
    {
      id: 'booking_blackout_dates',
      key: 'blackout_dates',
      value: '[]',
      dataType: 'json',
      description: 'Array of blackout dates (YYYY-MM-DD format)',
      category: 'booking',
    },
  ];

  for (const setting of bookingSettings) {
    await prisma.businessSettings.upsert({
      where: { id: setting.id },
      update: {
        key: setting.key,
        value: setting.value,
        dataType: setting.dataType,
        description: setting.description,
        category: setting.category,
        updatedAt: new Date(),
      },
      create: {
        ...setting,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Upserted booking setting: ${setting.key}`);
  }

  console.log(`🎉 Seeded ${bookingSettings.length} booking business settings`);
}

// Run the seeding
seedBookingSettings()
  .catch((e) => {
    console.error('❌ Error seeding booking settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 