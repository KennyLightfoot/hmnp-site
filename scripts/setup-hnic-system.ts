#!/usr/bin/env tsx
/**
 * HNIC Complete System Setup Script
 * Houston Mobile Notary Pros - Updated SOP Implementation
 * 
 * This script implements the complete business logic updates per the new SOP:
 * 1. Creates HNIC admin account with specified credentials
 * 2. Updates all mileage/travel fee logic to use 77591 as base with 15-mile radius
 * 3. Configures all business settings according to new SOP
 * 4. Updates pricing calculations across the system
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

// HNIC Account Configuration (per user's SOP)
const HNIC_CONFIG = {
  email: 'contact@houstonmobilenotarypros.com',
  displayName: 'Houston Mobile Notary Pros',
  password: 'Hmnp128174!',
  role: 'ADMIN' as Role,
  firstName: 'Houston Mobile Notary',
  lastName: 'Pros'
};

// New SOP Business Configuration
const BUSINESS_CONFIG = {
  // Base location updated to ZIP 77591 per SOP
  BASE_LOCATION: '77591', // ZIP code for distance calculations
  BASE_LOCATION_FULL: 'Texas City, TX 77591', // Full address for Google Maps
  
  // Mileage Logic per SOP
  FREE_SERVICE_RADIUS: 15, // 15-mile base radius from 77591
  TRAVEL_FEE_PER_MILE: 0.50, // $0.50/mi beyond base radius
  MAX_SERVICE_RADIUS: 50, // Maximum service area
  
  // Business Hours (can be customized later)
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
  console.log('🚀 Houston Mobile Notary Pros - HNIC System Setup');
  console.log('📋 Implementing new SOP business logic...\n');

  try {
    // 1. Setup HNIC Admin Account
    await setupHNICAccount();
    
    // 2. Create/Update HNIC Role with Full Permissions
    await setupHNICRole();
    
    // 3. Update Business Settings for New SOP
    await updateBusinessSettings();
    
    // 4. Update Service Area Configuration
    await updateServiceAreaConfig();
    
    // 5. Verify System Configuration
    await verifySystemSetup();
    
    console.log('\n✅ HNIC System Setup Complete!');
    console.log('🎯 All business logic has been updated per your new SOP');
    console.log('\n📋 Summary:');
    console.log(`   • HNIC Admin Account: ${HNIC_CONFIG.email}`);
    console.log(`   • Base Location: ${BUSINESS_CONFIG.BASE_LOCATION_FULL}`);
    console.log(`   • Free Service Radius: ${BUSINESS_CONFIG.FREE_SERVICE_RADIUS} miles`);
    console.log(`   • Travel Fee: $${BUSINESS_CONFIG.TRAVEL_FEE_PER_MILE}/mile beyond base radius`);
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${HNIC_CONFIG.email}`);
    console.log(`   Password: ${HNIC_CONFIG.password}`);
    console.log('\n🎉 System is ready for production use!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function setupHNICAccount() {
  console.log('👤 Setting up HNIC Admin Account...');
  
  try {
    // Check if user already exists
    const existingUser = await prisma.User.findUnique({
      where: { email: HNIC_CONFIG.email }
    });

    if (existingUser) {
      console.log('🔄 HNIC account exists, updating credentials...');
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(HNIC_CONFIG.password, 12);
      
      // Update existing user
      await prisma.User.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          firstName: HNIC_CONFIG.firstName,
          lastName: HNIC_CONFIG.lastName,
          role: HNIC_CONFIG.role,
          isActive: true,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ HNIC account updated successfully');
    } else {
      console.log('🆕 Creating new HNIC account...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(HNIC_CONFIG.password, 12);
      
      // Create new HNIC user
      const user = await prisma.User.create({
        data: {
          email: HNIC_CONFIG.email,
          password: hashedPassword,
          firstName: HNIC_CONFIG.firstName,
          lastName: HNIC_CONFIG.lastName,
          role: HNIC_CONFIG.role,
          isActive: true,
          emailVerified: new Date(), // Auto-verify HNIC account
        }
      });
      
      console.log('✅ HNIC account created successfully');
    }
  } catch (error) {
    console.error('❌ Error setting up HNIC account:', error);
    throw error;
  }
}

async function setupHNICRole() {
  console.log('🔑 Setting up HNIC Role & Permissions...');
  
  // Full HNIC permissions (everything)
  const hnicPermissions = [
    // User management
    'users:manage', 'users:create', 'users:read', 'users:update', 'users:delete',
    
    // Booking management
    'bookings:manage', 'bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete',
    
    // Calendar management
    'calendar:manage', 'calendar:settings:manage', 'calendar:view', 'calendar:bookings:view', 'calendar:bookings:manage',
    
    // Business management
    'settings:manage', 'business:manage', 'pricing:manage', 'services:manage',
    
    // Administrative
    'admin:access', 'reports:view', 'analytics:view', 'webhooks:manage',
    
    // Portal management
    'portal:manage', 'assignments:manage', 'documents:manage',
    
    // Financial
    'payments:manage', 'promo-codes:manage', 'billing:manage'
  ];
  
  // Ensure ADMIN role exists with full permissions
  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      description: 'HNIC - Full system access and management',
      permissions: hnicPermissions
    },
    create: {
      name: 'ADMIN',
      description: 'HNIC - Full system access and management',
      permissions: hnicPermissions
    }
  });
  
  console.log('✅ HNIC role configured with full permissions');
}

async function updateBusinessSettings() {
  console.log('⚙️ Updating business settings for new SOP...');
  
  const businessSettings = [
    // Core location settings
    {
      key: 'business.baseLocation',
      value: BUSINESS_CONFIG.BASE_LOCATION,
      dataType: 'string',
      description: 'Primary business location ZIP code for distance calculations',
      category: 'location'
    },
    {
      key: 'business.baseLocationFull',
      value: BUSINESS_CONFIG.BASE_LOCATION_FULL,
      dataType: 'string',
      description: 'Full address for Google Maps distance calculations',
      category: 'location'
    },
    
    // Mileage & Travel Fee Settings
    {
      key: 'mileage.freeServiceRadius',
      value: BUSINESS_CONFIG.FREE_SERVICE_RADIUS.toString(),
      dataType: 'number',
      description: 'Free service radius in miles from base location (77591)',
      category: 'mileage'
    },
    {
      key: 'mileage.travelFeePerMile',
      value: BUSINESS_CONFIG.TRAVEL_FEE_PER_MILE.toString(),
      dataType: 'number',
      description: 'Travel fee per mile beyond free service radius ($0.50/mile)',
      category: 'mileage'
    },
    {
      key: 'mileage.maxServiceRadius',
      value: BUSINESS_CONFIG.MAX_SERVICE_RADIUS.toString(),
      dataType: 'number',
      description: 'Maximum service radius in miles',
      category: 'mileage'
    },
    
    // Business Hours
    {
      key: 'business.hours',
      value: JSON.stringify(BUSINESS_CONFIG.BUSINESS_HOURS),
      dataType: 'json',
      description: 'Business operating hours by day of week',
      category: 'scheduling'
    },
    
    // Booking Settings
    {
      key: 'booking.leadTimeHours',
      value: '2',
      dataType: 'number',
      description: 'Minimum advance booking time in hours',
      category: 'booking'
    },
    {
      key: 'booking.advanceBookingDays',
      value: '60',
      dataType: 'number',
      description: 'Maximum days in advance to allow booking',
      category: 'booking'
    },
    {
      key: 'booking.bufferTimeMinutes',
      value: '15',
      dataType: 'number',
      description: 'Buffer time between appointments in minutes',
      category: 'booking'
    },
    
    // Contact Information
    {
      key: 'business.name',
      value: 'Houston Mobile Notary Pros',
      dataType: 'string',
      description: 'Business display name',
      category: 'general'
    },
    {
      key: 'business.email',
      value: HNIC_CONFIG.email,
      dataType: 'string',
      description: 'Primary business email',
      category: 'general'
    },
    
    // Feature Flags
    {
      key: 'features.dynamicPricing',
      value: 'true',
      dataType: 'boolean',
      description: 'Enable dynamic pricing with real-time distance calculation',
      category: 'features'
    },
    {
      key: 'features.priceBreakdown',
      value: 'true',
      dataType: 'boolean',
      description: 'Show detailed price breakdown to customers',
      category: 'features'
    }
  ];

  for (const setting of businessSettings) {
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
  
  console.log(`✅ Updated ${businessSettings.length} business settings`);
}

async function updateServiceAreaConfig() {
  console.log('🗺️ Updating service area configuration...');
  
  // Update or create service area record
  await prisma.serviceArea.upsert({
    where: { name: 'Primary Service Area' },
    update: {
      zipCode: BUSINESS_CONFIG.BASE_LOCATION,
      radiusMiles: BUSINESS_CONFIG.FREE_SERVICE_RADIUS,
      isActive: true,
      coordinates: null, // Will be calculated dynamically
      updatedAt: new Date()
    },
    create: {
      name: 'Primary Service Area',
      zipCode: BUSINESS_CONFIG.BASE_LOCATION,
      radiusMiles: BUSINESS_CONFIG.FREE_SERVICE_RADIUS,
      isActive: true,
      description: `Primary service area - ${BUSINESS_CONFIG.FREE_SERVICE_RADIUS}-mile radius from ${BUSINESS_CONFIG.BASE_LOCATION_FULL}`,
    }
  });
  
  console.log('✅ Service area configuration updated');
}

async function verifySystemSetup() {
  console.log('🔍 Verifying system configuration...');
  
  // Verify HNIC account
  const hnicUser = await prisma.User.findUnique({
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
  
  // Verify service area
  const serviceArea = await prisma.serviceArea.findFirst({
    where: { zipCode: BUSINESS_CONFIG.BASE_LOCATION }
  });
  
  if (!serviceArea) {
    throw new Error('Service area configuration verification failed');
  }
  
  console.log('✅ System configuration verified');
}

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

export { main as setupHNICSystem }; 