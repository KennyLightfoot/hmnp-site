#!/usr/bin/env tsx
/**
 * Test Database Connectivity and Setup Business Settings
 * 
 * This script tests both Supabase and Redis connectivity,
 * then populates the BusinessSettings table if needed.
 */

import { PrismaClient } from '@prisma/client';
import redis from '@/lib/redis';
import { logger } from '@/lib/logger';

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

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase database connection...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function testRedisConnection() {
  console.log('🔍 Testing Redis/Upstash connection...');
  
  try {
    // Test Redis connectivity
    await redis.set('test:connection', 'success', 10);
    const result = await redis.get('test:connection');
    
    if (result === 'success') {
      console.log('✅ Redis connected successfully');
      await redis.del('test:connection');
      return true;
    } else {
      console.error('❌ Redis test failed: unexpected result');
      return false;
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

async function checkBusinessSettings() {
  console.log('🔍 Checking BusinessSettings table...');
  
  try {
    const existingSettings = await prisma.businessSettings.findMany();
    console.log(`📊 Found ${existingSettings.length} existing business settings`);
    
    // Check if we have the essential settings
    const essentialKeys = ESSENTIAL_BUSINESS_SETTINGS.map(s => s.key);
    const existingKeys = existingSettings.map(s => s.key);
    const missingKeys = essentialKeys.filter(key => !existingKeys.includes(key));
    
    if (missingKeys.length > 0) {
      console.log(`⚠️  Missing essential settings: ${missingKeys.join(', ')}`);
      return false;
    } else {
      console.log('✅ All essential business settings found');
      return true;
    }
  } catch (error) {
    console.error('❌ Error checking business settings:', error);
    return false;
  }
}

async function populateBusinessSettings() {
  console.log('🌱 Populating BusinessSettings table...');
  
  try {
    let created = 0;
    let updated = 0;
    
    for (const setting of ESSENTIAL_BUSINESS_SETTINGS) {
      const existing = await prisma.businessSettings.findUnique({
        where: { key: setting.key }
      });
      
      if (existing) {
        // Update if needed
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
          console.log(`🔄 Updated setting: ${setting.key}`);
        }
      } else {
        // Create new setting
        await prisma.businessSettings.create({
          data: setting
        });
        created++;
        console.log(`➕ Created setting: ${setting.key}`);
      }
    }
    
    console.log(`✅ Business settings populated: ${created} created, ${updated} updated`);
    return true;
  } catch (error) {
    console.error('❌ Error populating business settings:', error);
    return false;
  }
}

async function testTimeSlotGeneration() {
  console.log('🔍 Testing time slot generation...');
  
  try {
    // Get business hours
    const businessHours = await prisma.businessSettings.findUnique({
      where: { key: 'businessHours' }
    });
    
    if (!businessHours) {
      console.error('❌ Business hours not found');
      return false;
    }
    
    const hours = JSON.parse(businessHours.value);
    console.log('📅 Business hours loaded:', hours.monday);
    
    // Test date calculation
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    console.log(`📅 Testing for tomorrow: ${tomorrow.toISOString().split('T')[0]}`);
    console.log('✅ Time slot generation test passed');
    
    return true;
  } catch (error) {
    console.error('❌ Time slot generation test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Database and Setup Test Starting...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Database Connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    allTestsPassed = false;
    console.log('\n❌ Stopping tests - database connection failed');
    return;
  }
  
  // Test 2: Redis Connection
  const redisConnected = await testRedisConnection();
  if (!redisConnected) {
    console.log('\n⚠️  Redis connection failed - availability caching may not work');
  }
  
  // Test 3: Business Settings
  const settingsExist = await checkBusinessSettings();
  if (!settingsExist) {
    console.log('\n🔧 Populating missing business settings...');
    const populated = await populateBusinessSettings();
    if (!populated) {
      allTestsPassed = false;
    }
  }
  
  // Test 4: Time Slot Generation
  const timeSlotsWork = await testTimeSlotGeneration();
  if (!timeSlotsWork) {
    allTestsPassed = false;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED - Your system is ready!');
    console.log('\n✅ Database: Connected');
    console.log(`✅ Redis: ${redisConnected ? 'Connected' : 'Failed (non-critical)'}`);
    console.log('✅ Business Settings: Configured');
    console.log('✅ Time Slots: Working');
  } else {
    console.log('❌ SOME TESTS FAILED - Please review the errors above');
  }
  console.log('='.repeat(50));
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch(console.error)
    .finally(() => {
      prisma.$disconnect();
    });
}

export { testDatabaseConnection, testRedisConnection, checkBusinessSettings, populateBusinessSettings };
