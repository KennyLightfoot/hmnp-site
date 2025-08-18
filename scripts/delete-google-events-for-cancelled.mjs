#!/usr/bin/env node
// Delete Google Calendar events for cancelled bookings
// Usage: node scripts/delete-google-events-for-cancelled.mjs [--dry-run]

import fs from 'fs';
import path from 'path';
import process from 'process';
import dotenv from 'dotenv';
import { google } from 'googleapis';

// Load env from .env.local or .env
const cwd = process.cwd();
const envLocal = path.join(cwd, '.env.local');
const envDefault = path.join(cwd, '.env');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
else if (fs.existsSync(envDefault)) dotenv.config({ path: envDefault });

const DRY_RUN = process.argv.includes('--dry-run');

// Prisma
const { PrismaClient, BookingStatus } = await import('@prisma/client');
const prisma = new PrismaClient();

function extractEventIdFromNotes(notes) {
  if (!notes) return null;
  const match = notes.match(/Google Calendar Event ID: ([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : null;
}

function getGoogleAuth() {
  // Prefer GOOGLE_SERVICE_ACCOUNT_JSON; fallback to key file
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    let jsonString = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
    if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
      jsonString = jsonString.slice(1, -1);
    }
    const credentials = JSON.parse(jsonString);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
  }
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_KEY');
}

async function main() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    console.error('GOOGLE_CALENDAR_ID not set. Aborting.');
    process.exit(1);
  }

  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  // Find cancelled bookings that have an event id in field or notes
  const cancelled = await prisma.booking.findMany({
    where: {
      status: { in: [BookingStatus.CANCELLED_BY_CLIENT, BookingStatus.CANCELLED_BY_STAFF] },
      OR: [
        { googleCalendarEventId: { not: null } },
        { notes: { contains: 'Google Calendar Event ID:' } },
      ],
    },
    select: { id: true, googleCalendarEventId: true, notes: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (cancelled.length === 0) {
    console.log('No cancelled bookings with Google event IDs found.');
    await prisma.$disconnect();
    return;
  }

  let success = 0;
  let failed = 0;
  console.log(`Found ${cancelled.length} cancelled booking(s) with possible Google events.`);
  for (const b of cancelled) {
    const eventId = b.googleCalendarEventId || extractEventIdFromNotes(b.notes || '') || null;
    if (!eventId) {
      console.log(`- ${b.id}: no eventId present`);
      continue;
    }
    console.log(`- ${b.id}: deleting event ${eventId}${DRY_RUN ? ' [dry-run]' : ''}`);
    if (DRY_RUN) continue;
    try {
      await calendar.events.delete({ calendarId, eventId });
      // Clear stored field and mark notes
      const newNotes = `${b.notes || ''}\n[cleanup] Google Calendar event ${eventId} deleted on ${new Date().toISOString()}`.trim();
      await prisma.booking.update({
        where: { id: b.id },
        data: { googleCalendarEventId: null, notes: newNotes },
      });
      success++;
    } catch (err) {
      failed++;
      console.error(`  ✗ Failed to delete event for ${b.id}:`, err?.message || String(err));
    }
  }

  console.log(`Done. Deleted: ${success}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});



