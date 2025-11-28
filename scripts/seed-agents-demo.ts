import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';

import {
  persistAgentBlog,
  upsertAgentJob,
  upsertAgentLead,
  upsertAgentPricingQuote,
} from '@/lib/services/agent-webhook-service';
import { prisma } from '@/lib/db';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const maybeConfig =
    // ESM namespace export
    (dotenv as any).config ||
    // Some bundlers stick it under default
    (dotenv as any).default?.config;

  if (typeof maybeConfig === 'function') {
    maybeConfig({ path: filePath, override: true });
  }
}

const rootDir = process.cwd();
loadEnvFile(path.join(rootDir, '.env'));
loadEnvFile(path.join(rootDir, '.env.local'));

async function seedDemoData() {
  const now = new Date().toISOString();

  console.log('🌱 Seeding demo agents data (leads, jobs, pricing, blog)...');

  await upsertAgentLead({
    correlationId: 'demo-lead-001',
    name: 'Ava Sample',
    phone: '+1-832-555-0199',
    email: 'ava.sample@example.com',
    message: 'Need a mobile notary for estate documents tomorrow evening.',
    serviceType: 'MOBILE_NOTARY',
    urgency: 'HIGH',
    status: 'NEW',
    source: 'demo-seed',
    raw: { seededAt: now },
  });

  await upsertAgentJob({
    jobId: 'demo-job-001',
    correlationId: 'demo-lead-001',
    customerName: 'Ava Sample',
    phone: '+1-832-555-0199',
    email: 'ava.sample@example.com',
    serviceType: 'ESTATE_PLANNING',
    status: 'PENDING_REVIEW',
    appointmentDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    confirmedPrice: 285,
    raw: { seededAt: now },
  });

  await upsertAgentPricingQuote({
    correlationId: 'demo-lead-001',
    total: 285,
    baseFee: 225,
    travelFee: 40,
    rushFee: 20,
    pricingVersion: 'demo-v1',
    needsReview: true,
    raw: { seededAt: now },
  });

  await persistAgentBlog({
    jobId: 'demo-blog-001',
    blogData: {
      title: 'Houston Estate Planning: How Mobile Notaries Help Families Stay On Track',
      body: [
        '# Houston Estate Planning? Bring a Mobile Notary to You',
        'Estate planning paperwork stacks up fast, and missing one signature means another trip across town.',
        '',
        'Our mobile notaries keep families on schedule by arriving with the correct witnesses, ID checks, and Know Before You Sign summaries.',
        '',
        '## Why customers book us',
        '- Evening + weekend availability',
        '- Flat travel fee inside Beltway 8',
        '- Real-time SMS updates so attorneys stay in the loop',
        '',
        '## Next steps',
        'Text or call us when the documents are ready. We’ll dispatch the closest vetted notary and send a price confirmation before we leave HQ.',
      ].join('\n'),
      summary: 'Mobile notaries eliminate delays in Houston estate planning signings with flexible hours and on-site witness management.',
      metaDescription:
        'Need an estate planning signing in Houston? Our mobile notaries bring witnesses, ID checks, and evening availability directly to your clients.',
      author: 'Houston Mobile Notary Pros',
      publishedAt: now,
    },
    timestamp: now,
  });

  console.log('✅ Demo data seeded. Open /admin/operations, /admin/network, and /admin/content to verify the sync.');
}

seedDemoData()
  .catch((error) => {
    console.error('❌ Failed to seed demo agents data', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

