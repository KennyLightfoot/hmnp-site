#!/usr/bin/env node
/**
 * Database Services Update Script
 * Updates all service records in the database to match SOP v2.0 pricing
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// SOP v2.0 Service Definitions
const SOP_SERVICES = [
  // Quick-Stamp Local removed from SOP services
  {
    name: 'Standard Mobile Notary',
    description: 'Professional mobile notary service for standard documents during regular business hours.',
    serviceType: 'STANDARD_NOTARY', 
    price: 75.00,
    requiresDeposit: false,
    depositAmount: 0.00,
    duration: 30,
    active: true,
    key: 'standard-notary'
  },
  {
    name: 'Extended Hours Mobile',
    description: 'Extended hours and same-day notary service with premium scheduling flexibility.',
    serviceType: 'EXTENDED_HOURS_NOTARY',
    price: 100.00,
    requiresDeposit: false, 
    depositAmount: 0.00,
    duration: 45,
    active: true,
    key: 'extended-hours'
  },
  {
    name: 'Loan Signing Specialist',
    description: 'Expert loan signing and real estate closing services with comprehensive package handling.',
    serviceType: 'LOAN_SIGNING_SPECIALIST',
    price: 150.00,
    requiresDeposit: true,
    depositAmount: 50.00,
    duration: 120,
    active: true,
    key: "loan-signing-specialist"
  },
  {
    name: 'Remote Online Notarization (RON)',
    description: 'Secure online notarization with credential analysis, KBA verification, and audio-video recording.',
    serviceType: 'STANDARD_NOTARY',
    price: 25.00, // Base session fee, seals are additional
    requiresDeposit: false,
    depositAmount: 0.00,
    duration: 20,
    active: true,
    key: 'ron-session'
  },
  {
    name: 'Business Subscription - Essentials',
    description: 'Monthly business subscription with up to 10 RON seals and 10% off mobile rates.',
    serviceType: 'BUSINESS_SOLUTIONS',
    price: 125.00,
    requiresDeposit: false,
    depositAmount: 0.00,
    duration: 0, // Subscription service
    active: true,
    key: 'business-essentials'
  },
  {
    name: 'Business Subscription - Growth',
    description: 'Premium business subscription with up to 40 RON seals, 1 free loan signing, and priority support.',
    serviceType: 'BUSINESS_SOLUTIONS',
    price: 349.00,
    requiresDeposit: false,
    depositAmount: 0.00,
    duration: 0, // Subscription service
    active: true,
    key: 'business-growth'
  }
];

async function updateServices() {
  console.log('🔄 Updating services to match SOP v2.0 pricing...\n');

  for (const serviceData of SOP_SERVICES) {
    try {
      console.log(`📝 Updating: ${serviceData.name}`);
      
      const service = await prisma.service.upsert({
        where: { name: serviceData.name },
        update: {
          description: serviceData.description,
          serviceType: serviceData.serviceType,
          price: serviceData.price,
          requiresDeposit: serviceData.requiresDeposit,
          depositAmount: serviceData.depositAmount,
          duration: serviceData.duration,
          active: serviceData.active,
          updatedAt: new Date()
        },
        create: {
          id: crypto.randomUUID(),
          name: serviceData.name,
          description: serviceData.description,
          serviceType: serviceData.serviceType,
          price: serviceData.price,
          requiresDeposit: serviceData.requiresDeposit,
          depositAmount: serviceData.depositAmount,
          duration: serviceData.duration,
          active: serviceData.active,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`   ✅ ${service.name}: $${service.price}`);
      
    } catch (error) {
      console.error(`   ❌ Failed to update ${serviceData.name}:`, error.message);
    }
  }
}

async function updateBusinessSettings() {
  console.log('\n⚙️ Updating business settings for SOP compliance...\n');

  const sopSettings = [
    {
      key: 'sop.version',
      value: '2.0',
      dataType: 'string',
      description: 'Current SOP version implemented',
      category: 'system'
    },
    {
      key: 'sop.lastUpdated',
      value: new Date().toISOString(),
      dataType: 'string',
      description: 'Last SOP update timestamp',
      category: 'system'
    },
    // Quick-Stamp Local pricing removed
    {
      key: 'pricing.standardNotary.base',
      value: '75.00',
      dataType: 'number',
      description: 'Standard Mobile Notary base price per SOP', 
      category: 'pricing'
    },
    {
      key: 'pricing.extendedHours.base',
      value: '100.00',
      dataType: 'number',
      description: 'Extended Hours Mobile base price per SOP',
      category: 'pricing'
    },
    {
      key: 'pricing.loanSigning.base',
      value: '150.00',
      dataType: 'number',
      description: 'Loan Signing Specialist flat fee per SOP',
      category: 'pricing'
    },
    {
      key: 'pricing.ron.sessionFee',
      value: '25.00',
      dataType: 'number',
      description: 'RON session fee per SOP',
      category: 'pricing'
    },
    {
      key: 'pricing.ron.sealFee',
      value: '5.00',
      dataType: 'number',
      description: 'RON seal fee per SOP',
      category: 'pricing'
    },
    {
      key: 'fees.sameDayService',
      value: '25.00',
      dataType: 'number',
      description: 'Same-day service surcharge after 3 PM per SOP',
      category: 'fees'
    },
    {
      key: 'fees.afterHours',
      value: '50.00',
      dataType: 'number',
      description: 'After-hours service fee (9 PM – 7 AM) per SOP',
      category: 'fees'
    },
    {
      key: 'fees.extraSigner.standard',
      value: '5.00',
      dataType: 'number',
      description: 'Extra signer fee for Standard/Extended services per SOP',
      category: 'fees'
    },
    {
      key: 'fees.extraDocument',
      value: '10.00',
      dataType: 'number',
      description: 'Extra document fee per SOP',
      category: 'fees'
    },
    {
      key: 'travel.baseRadius',
      value: '15',
      dataType: 'number',
      description: '15-mile base radius from ZIP 77591 per SOP',
      category: 'travel'
    },
    {
      key: 'travel.ratePerMile',
      value: '0.50',
      dataType: 'number',
      description: '$0.50 per mile beyond base radius per SOP',
      category: 'travel'
    }
  ];

  for (const setting of sopSettings) {
    try {
      await prisma.businessSettings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          dataType: setting.dataType,
          description: setting.description,
          category: setting.category,
          updatedAt: new Date()
        },
        create: {
          id: crypto.randomUUID(),
          ...setting,
          updatedAt: new Date()
        }
      });
      console.log(`   ✅ ${setting.key}: ${setting.value}`);
    } catch (error) {
      console.error(`   ❌ Failed to update ${setting.key}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Houston Mobile Notary Pros - SOP v2.0 Database Update');
  console.log('📋 Updating services and settings to match SOP requirements...\n');

  try {
    await updateServices();
    await updateBusinessSettings();
    
    console.log('\n✅ SOP v2.0 Database Update Complete!');
    console.log('🎯 All services and settings updated per SOP requirements\n');
    
    // Verification
    console.log('📊 Updated Services Summary:');
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    });
    
    services.forEach(service => {
      console.log(`   • ${service.name}: $${service.price}`);
    });
    
  } catch (error) {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 