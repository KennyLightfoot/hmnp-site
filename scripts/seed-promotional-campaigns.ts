/**
 * Seed Script for Promotional Campaigns
 * Phase 3: Database-driven promotional campaigns
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPromotionalCampaigns() {
  console.log('🌱 Seeding promotional campaigns...');

  const campaigns = [
    {
      code: 'WELCOME10',
      name: '10% First-Time Customer Discount',
      description: 'Welcome to Houston Mobile Notary Pros!',
      type: 'first_time',
      value: 10,
      maxDiscount: 25,
      minOrderValue: 0,
      customerTypes: ['new'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      isActive: true
    },
    {
      code: 'LOYAL20',
      name: '20% Loyalty Customer Discount',
      description: 'Thank you for being a loyal customer!',
      type: 'loyalty',
      value: 20,
      maxDiscount: 50,
      minOrderValue: 0,
      customerTypes: ['loyalty'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      isActive: true
    },
    {
      code: 'FRIEND15',
      name: '15% Referral Discount',
      description: 'Thank you for the referral!',
      type: 'referral',
      value: 15,
      maxDiscount: 40,
      minOrderValue: 0,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      isActive: true
    },
    {
      code: 'RON5OFF',
      name: '$5 RON Service Discount',
      description: 'Special discount for remote online notarization!',
      type: 'fixed_amount',
      value: 5,
      serviceTypes: ['RON_SERVICES'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      maxUses: 100,
      isActive: true
    },
    {
      code: 'WINTER25',
      name: '$25 Winter Special',
      description: 'Stay warm while we handle your notarization!',
      type: 'seasonal',
      value: 25,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-03-31'),
      maxUses: 50,
      isActive: true
    },
    {
      code: 'SPRING15',
      name: '15% Spring Promotion',
      description: 'Spring into action with savings!',
      type: 'seasonal',
      value: 15,
      maxDiscount: 35,
      validFrom: new Date('2025-04-01'),
      validUntil: new Date('2025-06-30'),
      isActive: true
    },
    {
      code: 'LOANS10',
      name: '10% Loan Signing Discount',
      description: 'Professional loan signing services!',
      type: 'percentage',
      value: 10,
      maxDiscount: 20,
      minOrderValue: 100,
      serviceTypes: ['LOAN_SIGNING'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      isActive: true
    }
  ];

  let created = 0;
  let updated = 0;

  for (const campaign of campaigns) {
    try {
      const result = await prisma.promotionalCampaign.upsert({
        where: { code: campaign.code },
        update: {
          ...campaign,
          updatedAt: new Date()
        },
        create: campaign
      });

      if (result.createdAt === result.updatedAt) {
        created++;
        console.log(`✅ Created campaign: ${campaign.code} - ${campaign.name}`);
      } else {
        updated++;
        console.log(`📝 Updated campaign: ${campaign.code} - ${campaign.name}`);
      }
    } catch (error) {
      console.error(`❌ Error seeding campaign ${campaign.code}:`, error);
    }
  }

  console.log(`\n🎉 Promotional campaigns seeded successfully!`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total: ${campaigns.length}`);
}

async function main() {
  try {
    await seedPromotionalCampaigns();
  } catch (error) {
    console.error('Error seeding promotional campaigns:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 