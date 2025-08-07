import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Essential business settings for time slot generation
const ESSENTIAL_BUSINESS_SETTINGS = [
  {
    key: 'businessHours',
    value: JSON.stringify({
      monday: { open: "09:00", close: "17:00", isOpen: true },
      tuesday: { open: "09:00", close: "17:00", isOpen: true },
      wednesday: { open: "09:00", close: "17:00", isOpen: true },
      thursday: { open: "09:00", close: "17:00", isOpen: true },
      friday: { open: "09:00", close: "17:00", isOpen: true },
      saturday: { open: "10:00", close: "15:00", isOpen: true },
      sunday: { open: "12:00", close: "16:00", isOpen: false }
    }),
    dataType: 'json',
    description: 'Business operating hours by day',
    category: 'booking'
  },
  {
    key: 'timeZone',
    value: 'America/Chicago',
    dataType: 'string',
    description: 'Business timezone',
    category: 'booking'
  },
  {
    key: 'bookingBuffer',
    value: '60',
    dataType: 'number',
    description: 'Buffer time between appointments in minutes',
    category: 'booking'
  },
  {
    key: 'minAdvanceBooking',
    value: '2',
    dataType: 'number',
    description: 'Minimum advance booking time in hours',
    category: 'booking'
  },
  {
    key: 'maxAdvanceBooking',
    value: '30',
    dataType: 'number',
    description: 'Maximum days in advance to allow booking',
    category: 'booking'
  },
  {
    key: 'defaultServiceDuration',
    value: '60',
    dataType: 'number',
    description: 'Default service duration in minutes',
    category: 'booking'
  },
  {
    key: 'slotInterval',
    value: '15',
    dataType: 'number',
    description: 'Time slot interval in minutes',
    category: 'booking'
  },
  {
    key: 'holidays',
    value: JSON.stringify([
      "2025-01-01", // New Year's Day
      "2025-07-04", // Independence Day
      "2025-11-28", // Thanksgiving
      "2025-11-29", // Black Friday
      "2025-12-25"  // Christmas
    ]),
    dataType: 'json',
    description: 'Holiday dates (no availability)',
    category: 'booking'
  },
  {
    key: 'blackoutDates',
    value: JSON.stringify([]),
    dataType: 'json',
    description: 'Blackout dates for bookings',
    category: 'booking'
  }
];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.ADMIN_API_KEY}`;
  
  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 Starting database setup...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Check existing settings
    const existingSettings = await prisma.businessSettings.findMany();
    console.log(`📊 Found ${existingSettings.length} existing business settings`);
    
    let created = 0;
    let updated = 0;
    
    // Populate essential settings
    for (const setting of ESSENTIAL_BUSINESS_SETTINGS) {
      try {
        const existing = await prisma.businessSettings.findUnique({
          where: { key: setting.key }
        });
        
        if (existing) {
          if (existing.value !== setting.value) {
            await prisma.businessSettings.update({
              where: { key: setting.key },
              data: {
                value: setting.value,
                dataType: setting.dataType,
                description: setting.description,
                category: setting.category
              }
            });
            updated++;
            console.log(`🔄 Updated: ${setting.key}`);
          }
        } else {
          await prisma.businessSettings.create({
            data: setting
          });
          created++;
          console.log(`➕ Created: ${setting.key}`);
        }
      } catch (error) {
        console.error(`❌ Error with setting ${setting.key}:`, error);
      }
    }
    
    // Test time slot generation
    const businessHours = await prisma.businessSettings.findUnique({
      where: { key: 'businessHours' }
    });
    
    const testSlots = businessHours ? JSON.parse(businessHours.value) : null;
    
    return NextResponse.json({
      success: true,
      message: `Database setup complete: ${created} created, ${updated} updated`,
      details: {
        existingSettings: existingSettings.length,
        created,
        updated,
        businessHoursTest: testSlots?.monday || 'Failed to load'
      }
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const settings = await prisma.businessSettings.findMany({
      where: { category: 'booking' },
      select: {
        key: true,
        value: true,
        dataType: true,
        description: true
      }
    });
    
    return NextResponse.json({
      success: true,
      count: settings.length,
      settings: settings.reduce((acc, setting) => {
        acc[setting.key] = {
          value: setting.value,
          dataType: setting.dataType,
          description: setting.description
        };
        return acc;
      }, {} as Record<string, any>)
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch settings'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
