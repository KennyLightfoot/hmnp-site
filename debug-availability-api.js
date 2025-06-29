#!/usr/bin/env node

/**
 * Debug script for availability API 500 error
 * Check service ID and business settings
 */

import { PrismaClient } from '@prisma/client';

async function debugAvailabilityAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 DEBUGGING AVAILABILITY API 500 ERROR');
    console.log('=========================================');
    
    const serviceId = 'cmb8ovso10000ve9xwvtf0my0';
    const testDate = '2025-07-04';
    
    console.log('\n1. 🏷️  Checking Service ID:', serviceId);
    
    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      console.log('❌ Service NOT FOUND in database');
      
      // Get all services
      const allServices = await prisma.service.findMany({
        select: { id: true, name: true, isActive: true }
      });
      
      console.log('\n📋 Available Services:');
      allServices.forEach(s => {
        console.log(`   ${s.isActive ? '✅' : '❌'} ${s.id} - ${s.name}`);
      });
      
    } else {
      console.log('✅ Service found:', service.name);
      console.log('   - Active:', service.isActive);
      console.log('   - Duration:', service.durationMinutes, 'minutes');
      console.log('   - Price:', service.basePrice);
    }
    
    console.log('\n2. ⚙️  Checking Business Settings');
    
    // Check business settings
    const businessSettings = await prisma.businessSettings.findMany({
      where: { category: 'booking' }
    });
    
    if (businessSettings.length === 0) {
      console.log('❌ NO business settings found for category "booking"');
    } else {
      console.log('✅ Business settings found:', businessSettings.length, 'entries');
      businessSettings.forEach(setting => {
        console.log(`   ${setting.key}: ${setting.value}`);
      });
    }
    
    console.log('\n3. 📅 Checking for July 4th Holiday Configuration');
    
    // Check for blackout dates
    const blackoutSetting = businessSettings.find(s => s.key === 'blackout_dates');
    if (blackoutSetting) {
      try {
        const blackoutDates = JSON.parse(blackoutSetting.value);
        const isJuly4Blackout = blackoutDates.includes('2025-07-04');
        console.log('   Blackout dates configured:', blackoutDates.length, 'dates');
        console.log('   July 4th is blackout:', isJuly4Blackout);
        if (isJuly4Blackout) {
          console.log('   ⚠️  July 4th is configured as blackout date!');
        }
      } catch (e) {
        console.log('   ❌ Error parsing blackout dates:', e.message);
      }
    } else {
      console.log('   ℹ️  No blackout dates configured');
    }
    
    console.log('\n4. 🕒 Checking Business Hours for Friday (July 4th)');
    
    // July 4th, 2025 is a Friday (day 5)
    const fridayHours = businessSettings.filter(s => 
      s.key.includes('friday') && s.key.includes('hours')
    );
    
    if (fridayHours.length === 0) {
      console.log('   ℹ️  No custom Friday hours configured (will use defaults)');
      console.log('   📋 Default Friday hours: 09:00 - 17:00');
    } else {
      console.log('   ✅ Friday hours configured:');
      fridayHours.forEach(setting => {
        console.log(`      ${setting.key}: ${setting.value}`);
      });
    }
    
    console.log('\n5. 📊 Database Connection Test');
    
    // Test database connection
    const serviceCount = await prisma.service.count();
    const bookingCount = await prisma.booking.count();
    const settingsCount = await prisma.businessSettings.count();
    
    console.log('   ✅ Database connection successful');
    console.log(`   📊 Services: ${serviceCount}, Bookings: ${bookingCount}, Settings: ${settingsCount}`);
    
    console.log('\n6. 🔧 Recommendations');
    
    if (!service) {
      console.log('   🎯 PRIMARY ISSUE: Service ID does not exist');
      console.log('   💡 Solution: Use a valid service ID from the list above');
    }
    
    if (businessSettings.length === 0) {
      console.log('   ⚠️  SECONDARY ISSUE: No business settings configured');
      console.log('   💡 Solution: Add business hours and settings to database');
    }
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug script
debugAvailabilityAPI().catch(console.error);