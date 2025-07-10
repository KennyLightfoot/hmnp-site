#!/usr/bin/env node

/**
 * Check Services - Houston Mobile Notary Pros
 * 
 * Check what services exist in the database to understand serviceId mapping
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkServices() {
  console.log('🔍 Checking Services in Database');
  console.log('=================================\n');
  
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        serviceType: true,
        isActive: true,
        basePrice: true,
        durationMinutes: true
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`📋 Found ${services.length} services in database:\n`);
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. 📝 Service ID: ${service.id}`);
      console.log(`   Name: ${service.name}`);
      console.log(`   Type: ${service.serviceType}`);
      console.log(`   Active: ${service.isActive ? '✅' : '❌'}`);
      console.log(`   Price: $${service.basePrice}`);
      console.log(`   Duration: ${service.durationMinutes} minutes`);
      console.log('');
    });
    
    // Check business settings
    console.log('🏢 Checking Business Settings');
    console.log('==============================\n');
    
    const businessSettings = await prisma.businessSettings.findMany({
      where: { category: 'booking' },
      select: { key: true, value: true, description: true }
    });
    
    if (businessSettings.length > 0) {
      console.log(`📊 Found ${businessSettings.length} business settings:\n`);
      businessSettings.forEach(setting => {
        console.log(`🔧 ${setting.key}: ${setting.value}`);
        if (setting.description) {
          console.log(`   ${setting.description}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No business settings found in database!');
      console.log('💡 The availability API needs business settings to work.');
    }
    
    // Suggest serviceId mappings
    console.log('🗺️  Suggested ServiceType → ServiceId Mapping');
    console.log('==============================================\n');
    
    const mapping = {};
    services.forEach(service => {
      const name = service.name.toLowerCase();
      if (name.includes('standard') && name.includes('notary')) {
        mapping['STANDARD_NOTARY'] = service.id;
      } else if (name.includes('extended') && name.includes('hours')) {
        mapping['EXTENDED_HOURS'] = service.id;
      } else if (name.includes('loan') && name.includes('signing')) {
        mapping['LOAN_SIGNING'] = service.id;
      } else if (name.includes('ron') || name.includes('remote')) {
        mapping['RON_SERVICES'] = service.id;
      }
    });
    
    if (Object.keys(mapping).length > 0) {
      console.log('📋 Auto-detected mappings:');
      Object.entries(mapping).forEach(([serviceType, serviceId]) => {
        console.log(`   ${serviceType} → ${serviceId}`);
      });
    } else {
      console.log('⚠️  Could not auto-detect service mappings');
    }
    
  } catch (error) {
    console.error('❌ Error checking services:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices(); 