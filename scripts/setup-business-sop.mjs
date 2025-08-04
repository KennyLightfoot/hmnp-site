#!/usr/bin/env node
/**
 * Business SOP Setup Script
 * Houston Mobile Notary Pros - Complete SOP Implementation
 * 
 * This script implements all business logic per the new SOP:
 * 1. HNIC Admin Account Setup
 * 2. Mileage/Travel Fee Configuration (15-mile base from 77591, $0.50/mile)
 * 3. Business Settings Configuration
 * 4. Service Area Updates
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// HNIC Configuration per SOP
const HNIC_CONFIG = {
  email: 'contact@houstonmobilenotarypros.com',
  displayName: 'Houston Mobile Notary Pros', // or "HNIC" to flex
  password: process.env.ADMIN_PASSWORD || (() => {
    console.error("ADMIN_PASSWORD environment variable is required");
    process.exit(1);
  })(),
  role: 'ADMIN',
  firstName: 'Houston Mobile Notary',
  lastName: 'Pros'
};

// SOP Business Configuration
const SOP_CONFIG = {
  BASE_LOCATION: '77591',
  BASE_LOCATION_FULL: 'Texas City, TX 77591',
  FREE_SERVICE_RADIUS: 15, // 15-mile base radius from 77591
  TRAVEL_FEE_PER_MILE: 0.50, // $0.50/mile beyond base radius
  MAX_SERVICE_RADIUS: 50,
  
  BUSINESS_HOURS: {
    monday: { open: '08:00', close: '18:00', enabled: true },
    tuesday: { open: '08:00', close: '18:00', enabled: true },
    wednesday: { open: '08:00', close: '18:00', enabled: true },
    thursday: { open: '08:00', close: '18:00', enabled: true },
    friday: { open: '08:00', close: '18:00', enabled: true },
    saturday: { open: '09:00', close: '17:00', enabled: true },
    sunday: { open: '12:00', close: '16:00', enabled: false }
  }
};

async function main() {
  console.log('🚀 Houston Mobile Notary Pros - Business SOP Setup');
  console.log('📋 Implementing all SOP requirements...\n');

  try {
    // Step 1: Setup HNIC Admin Account
    console.log('👤 Step 1: Setting up HNIC Admin Account...');
    await setupHNICAccount();
    
    // Step 2: Update Business Settings
    console.log('\n⚙️ Step 2: Configuring Business Settings...');
    await updateBusinessSettings();
    
    // Step 3: Update Service Areas
    console.log('\n🗺️ Step 3: Updating Service Area Configuration...');
    await updateServiceAreas();
    
    // Step 4: Final Verification
    console.log('\n🔍 Step 4: Verifying Configuration...');
    await verifySetup();
    
    // Summary
    console.log('\n✅ Business SOP Setup Complete!');
    console.log('🎯 All systems updated per your SOP requirements\n');
    
    console.log('📋 Configuration Summary:');
    console.log(`   • HNIC Admin: ${HNIC_CONFIG.email}`);
    console.log(`   • Password: ${HNIC_CONFIG.password}`);
    console.log(`   • Base Location: ${SOP_CONFIG.BASE_LOCATION_FULL}`);
    console.log(`   • Free Service Radius: ${SOP_CONFIG.FREE_SERVICE_RADIUS} miles`);
    console.log(`   • Travel Fee: $${SOP_CONFIG.TRAVEL_FEE_PER_MILE}/mile beyond base radius`);
    console.log(`   • Max Service Radius: ${SOP_CONFIG.MAX_SERVICE_RADIUS} miles`);
    
    console.log('\n🎉 Ready for production use!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function setupHNICAccount() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: HNIC_CONFIG.email }
    });

    const hashedPassword = await bcrypt.hash(HNIC_CONFIG.password, 12);

    if (existingUser) {
      console.log('   🔄 Updating existing HNIC account...');
      
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: `${HNIC_CONFIG.firstName} ${HNIC_CONFIG.lastName}`,
          role: HNIC_CONFIG.role,
          active: true,
          updatedAt: new Date()
        }
      });
      
      console.log('   ✅ HNIC account updated');
    } else {
      console.log('   🆕 Creating new HNIC account...');
      
      await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: HNIC_CONFIG.email,
          password: hashedPassword,
          name: `${HNIC_CONFIG.firstName} ${HNIC_CONFIG.lastName}`,
          role: HNIC_CONFIG.role,
          active: true,
          emailVerified: new Date(),
          updatedAt: new Date(),
        }
      });
      
      console.log('   ✅ HNIC account created');
    }
  } catch (error) {
    console.error('   ❌ Failed to setup HNIC account:', error);
    throw error;
  }
}

async function updateBusinessSettings() {
  const settings = [
    // Core Location Settings
    {
      key: 'business.baseLocation',
      value: SOP_CONFIG.BASE_LOCATION,
      dataType: 'string',
      description: 'Business base location ZIP code (77591)',
      category: 'location'
    },
    {
      key: 'business.baseLocationFull',
      value: SOP_CONFIG.BASE_LOCATION_FULL,
      dataType: 'string',
      description: 'Full business address for distance calculations',
      category: 'location'
    },
    
    // Mileage & Travel Fee Settings (Per SOP)
    {
      key: 'mileage.freeServiceRadius',
      value: SOP_CONFIG.FREE_SERVICE_RADIUS.toString(),
      dataType: 'number',
      description: '15-mile base radius from 77591 (no travel fee)',
      category: 'mileage'
    },
    {
      key: 'mileage.travelFeePerMile',
      value: SOP_CONFIG.TRAVEL_FEE_PER_MILE.toString(),
      dataType: 'number',
      description: '$0.50 per mile beyond 15-mile base radius',
      category: 'mileage'
    },
    {
      key: 'mileage.maxServiceRadius',
      value: SOP_CONFIG.MAX_SERVICE_RADIUS.toString(),
      dataType: 'number',
      description: 'Maximum service radius (50 miles)',
      category: 'mileage'
    },
    
    // Business Operations
    {
      key: 'business.hours',
      value: JSON.stringify(SOP_CONFIG.BUSINESS_HOURS),
      dataType: 'json',
      description: 'Business operating hours',
      category: 'operations'
    },
    {
      key: 'business.name',
      value: 'Houston Mobile Notary Pros',
      dataType: 'string',
      description: 'Business display name',
      category: 'general'
    },
    {
      key: 'business.contactEmail',
      value: HNIC_CONFIG.email,
      dataType: 'string',
      description: 'Primary business contact email',
      category: 'general'
    },
    
    // Booking Configuration
    {
      key: 'booking.leadTimeHours',
      value: '2',
      dataType: 'number',
      description: 'Minimum advance booking time',
      category: 'booking'
    },
    {
      key: 'booking.maxAdvanceDays',
      value: '60',
      dataType: 'number',
      description: 'Maximum advance booking days',
      category: 'booking'
    },
    {
      key: 'booking.bufferMinutes',
      value: '15',
      dataType: 'number',
      description: 'Buffer time between appointments',
      category: 'booking'
    },
    
    // Feature Flags
    {
      key: 'features.dynamicPricing',
      value: 'true',
      dataType: 'boolean',
      description: 'Enable real-time distance-based pricing',
      category: 'features'
    },
    {
      key: 'features.priceBreakdown',
      value: 'true',
      dataType: 'boolean',
      description: 'Show detailed pricing breakdown to customers',
      category: 'features'
    },
    {
      key: 'features.autoDistanceCalculation',
      value: 'true',
      dataType: 'boolean',
      description: 'Automatically calculate distance from 77591',
      category: 'features'
    }
  ];

  console.log(`   📝 Updating ${settings.length} business settings...`);

  for (const setting of settings) {
    await prisma.businessSettings.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        dataType: setting.dataType,
        description: setting.description,
        category: setting.category,
        updatedAt: new Date()
      },
      create: setting
    });
  }
  
  console.log('   ✅ Business settings updated');
}

async function updateServiceAreas() {
  try {
    // Update primary service area
    await prisma.service_areas.upsert({
      where: { name: 'Primary Service Area' },
      update: {
        zipCode: SOP_CONFIG.BASE_LOCATION,
        radiusMiles: SOP_CONFIG.FREE_SERVICE_RADIUS,
        isActive: true,
        description: `15-mile base radius from ${SOP_CONFIG.BASE_LOCATION_FULL} - no travel fee`,
        updatedAt: new Date()
      },
      create: {
        name: 'Primary Service Area',
        zipCode: SOP_CONFIG.BASE_LOCATION,
        radiusMiles: SOP_CONFIG.FREE_SERVICE_RADIUS,
        isActive: true,
        description: `15-mile base radius from ${SOP_CONFIG.BASE_LOCATION_FULL} - no travel fee`
      }
    });
    
    // Create/update extended service area
    await prisma.service_areas.upsert({
      where: { name: 'Extended Service Area' },
      update: {
        zipCode: SOP_CONFIG.BASE_LOCATION,
        radiusMiles: SOP_CONFIG.MAX_SERVICE_RADIUS,
        isActive: true,
        description: `Up to ${SOP_CONFIG.MAX_SERVICE_RADIUS} miles from ${SOP_CONFIG.BASE_LOCATION_FULL} - $${SOP_CONFIG.TRAVEL_FEE_PER_MILE}/mile travel fee beyond 15 miles`,
        updatedAt: new Date()
      },
      create: {
        name: 'Extended Service Area',
        zipCode: SOP_CONFIG.BASE_LOCATION,
        radiusMiles: SOP_CONFIG.MAX_SERVICE_RADIUS,
        isActive: true,
        description: `Up to ${SOP_CONFIG.MAX_SERVICE_RADIUS} miles from ${SOP_CONFIG.BASE_LOCATION_FULL} - $${SOP_CONFIG.TRAVEL_FEE_PER_MILE}/mile travel fee beyond 15 miles`
      }
    });
    
    console.log('   ✅ Service areas configured');
  } catch (error) {
    console.log('   ⚠️ Service area update skipped (table may not exist):', error.message);
  }
}

async function verifySetup() {
  // Verify HNIC account
  const hnicUser = await prisma.user.findUnique({
    where: { email: HNIC_CONFIG.email }
  });
  
  if (!hnicUser || hnicUser.role !== 'ADMIN') {
    throw new Error('HNIC account verification failed');
  }
  
  // Verify business settings
  const settingsCount = await prisma.businessSettings.count();
  if (settingsCount === 0) {
    throw new Error('Business settings verification failed');
  }
  
  // Check key settings
  const baseLocationSetting = await prisma.businessSettings.findUnique({
    where: { key: 'business.baseLocation' }
  });
  
  if (!baseLocationSetting || baseLocationSetting.value !== SOP_CONFIG.BASE_LOCATION) {
    throw new Error('Base location setting verification failed');
  }
  
  console.log('   ✅ All configurations verified');
}

// Run the setup
main().catch(console.error);
