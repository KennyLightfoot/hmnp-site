#!/usr/bin/env node
// Bulk-cancel non-cancelled bookings (intended for test cleanup)
// Usage:
//  node scripts/bulk-cancel-test-bookings.mjs --dry-run
//  node scripts/bulk-cancel-test-bookings.mjs --apply

import fs from 'fs';
import path from 'path';
import process from 'process';
import url from 'url';
import dotenv from 'dotenv';

// Load env: prefer .env.local if present, else .env
const cwd = process.cwd();
const envLocal = path.join(cwd, '.env.local');
const envDefault = path.join(cwd, '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}

// Import Prisma ESM
const { PrismaClient, BookingStatus } = await (async () => {
  const mod = await import('@prisma/client');
  return mod;
})();

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    apply: args.has('--apply'),
    dryRun: args.has('--dry-run') || !args.has('--apply'),
  };
}

async function main() {
  const { apply, dryRun } = parseArgs(process.argv);
  const now = new Date();

  // Target: any booking not already terminal (cancelled, completed, archived)
  const terminalStatuses = [
    BookingStatus.CANCELLED_BY_CLIENT,
    BookingStatus.CANCELLED_BY_STAFF,
    BookingStatus.COMPLETED,
    BookingStatus.ARCHIVED,
  ];

  const toCancel = await prisma.booking.findMany({
    where: {
      status: { notIn: terminalStatuses },
    },
    select: {
      id: true,
      status: true,
      scheduledDateTime: true,
      customerEmail: true,
      customerName: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (toCancel.length === 0) {
    console.log('No active bookings found to cancel.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${toCancel.length} active booking(s) to cancel.`);
  for (const b of toCancel) {
    console.log(`- ${b.id} | ${b.status} | ${b.scheduledDateTime ? new Date(b.scheduledDateTime).toISOString() : 'unscheduled'} | ${b.customerEmail || ''} | ${b.customerName || ''}`);
  }

  if (dryRun) {
    console.log('\nDry-run complete. Re-run with --apply to perform cancellations.');
    await prisma.$disconnect();
    return;
  }

  console.log('\nApplying cancellations...');
  let success = 0;
  let failed = 0;
  for (const b of toCancel) {
    try {
      await prisma.booking.update({
        where: { id: b.id },
        data: {
          status: BookingStatus.CANCELLED_BY_STAFF,
          notes: 'Bulk test cleanup: cancelled by staff',
          updatedAt: new Date(),
        },
      });
      success++;
    } catch (err) {
      failed++;
      console.error(`Failed to cancel ${b.id}:`, err?.message || String(err));
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});


