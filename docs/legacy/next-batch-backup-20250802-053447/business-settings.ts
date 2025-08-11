import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedBusinessSettings() {
  console.log('🏢 Seeding business settings...');

  const businessSettings = [
    // Business Hours
    {
      key: 'business_hours_monday_start',
      value: '09:00',
      dataType: 'string',
      description: 'Monday opening time',
      category: 'booking',
    },
    {
      key: 'business_hours_monday_end',
      value: '17:00',
      dataType: 'string',
      description: 'Monday closing time',
      category: 'booking',
    },
    {
      key: 'business_hours_tuesday_start',
      value: '09:00',
      dataType: 'string',
      description: 'Tuesday opening time',
      category: 'booking',
    },
    {
      key: 'business_hours_tuesday_end',
      value: '17:00',
      dataType: 'string',
      description: 'Tuesday closing time',
      category: 'booking',
    },
    {
      key: 'business_hours_wednesday_start',
      value: '09:00',
      dataType: 'string',
      description: 'Wednesday opening time',
      category: 'booking',
    },
    {
      key: 'business_hours_wednesday_end',
      value: '17:00',
      dataType: 'string',
      description: 'Wednesday closing time',
      category: 'booking',
    },
    {
      key: 'business_hours_thursday_start',
      value: '09:00',
      dataType: 'string',
      description: 'Thursday opening time',
      category: 'booking',
    },
    {
      key: 'business_hours_thursday_end',
      value: '17:00',
      dataType: 'string',
      description: 'Thursday closing time',
      category: 'booking',
    },
    {
      key: 'business_hours_friday_start',
      value: '09:00',
      dataType: 'string',
      description: 'Friday opening time',
      category: 'booking',
    },
    {
      key: 'business_hours_friday_end',
      value: '17:00',
      dataType: 'string',
      description: 'Friday closing time',
      category: 'booking',
    },
    {
      key: 'business_hours_saturday_start',
      value: '10:00',
      dataType: 'string',
      description: 'Saturday opening time',
      category: 'booking',
    },
    {
      key: 'business_hours_saturday_end',
      value: '15:00',
      dataType: 'string',
      description: 'Saturday closing time',
      category: 'booking',
    },
    // Sunday is closed by default (no entries)

    // Booking Settings
    {
      key: 'minimum_lead_time_hours',
      value: '2',
      dataType: 'number',
      description: 'Minimum hours required before booking',
      category: 'booking',
    },
    {
      key: 'maximum_advance_booking_days',
      value: '90',
      dataType: 'number',
      description: 'Maximum days in advance for booking',
      category: 'booking',
    },
    {
      key: 'slot_interval_minutes',
      value: '30',
      dataType: 'number',
      description: 'Time interval between available slots',
      category: 'booking',
    },
    {
      key: 'buffer_time_minutes',
      value: '15',
      dataType: 'number',
      description: 'Buffer time between appointments',
      category: 'booking',
    },
    {
      key: 'default_service_duration',
      value: '60',
      dataType: 'number',
      description: 'Default service duration in minutes',
      category: 'booking',
    },

    // Blackout Dates (holidays, etc.)
    {
      key: 'blackout_dates',
      value: JSON.stringify([
        '2024-12-25', // Christmas
        '2024-01-01', // New Year
        '2024-07-04', // Independence Day
        '2024-11-28', // Thanksgiving
      ]),
      dataType: 'json',
      description: 'Dates when bookings are not allowed',
      category: 'booking',
    },

    // Notification Settings
    {
      key: 'send_confirmation_email',
      value: 'true',
      dataType: 'boolean',
      description: 'Send confirmation email after booking',
      category: 'notification',
    },
    {
      key: 'send_reminder_24hr',
      value: 'true',
      dataType: 'boolean',
      description: 'Send 24-hour reminder',
      category: 'notification',
    },
    {
      key: 'send_reminder_2hr',
      value: 'true',
      dataType: 'boolean',
      description: 'Send 2-hour reminder',
      category: 'notification',
    },
    {
      key: 'send_followup_email',
      value: 'true',
      dataType: 'boolean',
      description: 'Send follow-up email after service',
      category: 'notification',
    },

    // Payment Settings
    {
      key: 'require_deposits',
      value: 'true',
      dataType: 'boolean',
      description: 'Require deposits for bookings',
      category: 'payment',
    },
    {
      key: 'default_deposit_amount',
      value: '25.00',
      dataType: 'number',
      description: 'Default deposit amount in dollars',
      category: 'payment',
    },
    {
      key: 'payment_timeout_minutes',
      value: '30',
      dataType: 'number',
      description: 'Time to complete payment before booking expires',
      category: 'payment',
    },

    // General Business Settings
    {
      key: 'business_name',
      value: 'Houston Mobile Notary Pros',
      dataType: 'string',
      description: 'Business name',
      category: 'general',
    },
    {
      key: 'business_phone',
      value: '(713) 234-5678',
      dataType: 'string',
      description: 'Main business phone number',
      category: 'general',
    },
    {
      key: 'business_email',
      value: 'info@houstonmobilenotarypros.com',
      dataType: 'string',
      description: 'Main business email',
      category: 'general',
    },
    {
      key: 'service_area_radius_miles',
      value: '50',
      dataType: 'number',
      description: 'Service area radius in miles',
      category: 'general',
    },
    {
      key: 'emergency_contact_available',
      value: 'true',
      dataType: 'boolean',
      description: 'Emergency contact available',
      category: 'general',
    },
  ];

  try {
    for (const setting of businessSettings) {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          dataType: setting.dataType,
          description: setting.description,
          category: setting.category,
          updatedAt: new Date(),
        },
        create: setting,
      });
    }

    console.log(`✅ Seeded ${businessSettings.length} business settings`);
  } catch (error) {
    console.error('❌ Error seeding business settings:', error);
    throw error;
  }
}

if (require.main === module) {
  seedBusinessSettings()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 