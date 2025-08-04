#!/usr/bin/env tsx
/**
 * EMERGENCY FIX: Populate Business Settings Database
 * 
 * This script immediately fixes the empty BusinessSettings table
 * that is causing "Failed to load availability" errors.
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const businessSettings = [
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
    })
  },
  {
    key: 'timeZone',
    value: 'America/Chicago'
  },
  {
    key: 'bookingBuffer',
    value: '60'
  },
  {
    key: 'maxAdvanceBooking',
    value: '30'
  },
  {
    key: 'minAdvanceBooking',
    value: '2'
  },
  {
    key: 'defaultServiceDuration',
    value: '60'
  },
  {
    key: 'emergencyContact',
    value: '+1-832-617-4285'
  },
  {
    key: 'holidays',
    value: JSON.stringify([
      "2025-01-01", // New Year's Day
      "2025-07-04", // Independence Day
      "2025-11-28", // Thanksgiving
      "2025-11-29", // Black Friday
      "2025-12-25"  // Christmas
    ])
  },
  {
    key: 'blackoutDates',
    value: JSON.stringify([])
  },
  {
    key: 'specialHours',
    value: JSON.stringify({})
  },
  {
    key: 'serviceAreaRadius',
    value: '25'
  },
  {
    key: 'minimumNoticeHours',
    value: '2'
  },
  {
    key: 'cancellationPolicy',
    value: JSON.stringify({
      hours: 24,
      feePercentage: 0
    })
  },
  {
    key: 'autoConfirmBookings',
    value: 'true'
  },
  {
    key: 'requirePaymentUpfront',
    value: 'false'
  }
];

async function seedBusinessSettings() {
  console.log('🚨 EMERGENCY FIX: Populating BusinessSettings table...');
  
  try {
    // First, check if settings already exist
    const existingSettings = await prisma.businessSettings.findMany();
    console.log(`📊 Found ${existingSettings.length} existing business settings`);
    
    if (existingSettings.length > 0) {
      console.log('⚠️  Business settings already exist. Checking for missing keys...');
      
      const existingKeys = existingSettings.map(s => s.key);
      const missingSettings = businessSettings.filter(s => !existingKeys.includes(s.key));
      
      if (missingSettings.length > 0) {
        console.log(`📝 Adding ${missingSettings.length} missing settings...`);
        
        for (const setting of missingSettings) {
          await prisma.businessSettings.create({
            data: {
              id: randomUUID(),
              ...setting
            }
          });
          console.log(`✅ Added: ${setting.key}`);
        }
      } else {
        console.log('✅ All business settings are already present');
      }
    } else {
      console.log('🔧 Creating all business settings from scratch...');
      
      for (const setting of businessSettings) {
        await prisma.businessSettings.create({
          data: {
            id: randomUUID(),
            ...setting
          }
        });
        console.log(`✅ Created: ${setting.key} = ${setting.value.substring(0, 50)}${setting.value.length > 50 ? '...' : ''}`);
      }
    }
    
    // Verify the fix
    const finalCount = await prisma.businessSettings.count();
    console.log(`\n🎉 SUCCESS! BusinessSettings table now has ${finalCount} entries`);
    
    // Test critical business hours
    const businessHours = await prisma.businessSettings.findUnique({
      where: { key: 'businessHours' }
    });
    
    if (businessHours) {
      const hours = JSON.parse(businessHours.value);
      console.log('📅 Business Hours Test:');
      console.log(`   Monday: ${hours.monday.isOpen ? `${hours.monday.open}-${hours.monday.close}` : 'Closed'}`);
      console.log(`   Saturday: ${hours.saturday.isOpen ? `${hours.saturday.open}-${hours.saturday.close}` : 'Closed'}`);
      console.log(`   Sunday: ${hours.sunday.isOpen ? `${hours.sunday.open}-${hours.sunday.close}` : 'Closed'}`);
    }
    
    console.log('\n✅ EMERGENCY FIX COMPLETE - Booking system should now work!');
    
  } catch (error) {
    console.error('❌ EMERGENCY FIX FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the emergency fix
seedBusinessSettings();

export { seedBusinessSettings };