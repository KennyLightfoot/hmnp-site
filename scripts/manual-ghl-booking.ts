#!/usr/bin/env tsx

/**
 * Manual GHL Booking Script
 * - Creates (or finds) a contact in GHL
 * - Creates an appointment on the mapped calendar to trigger workflows
 *
 * Usage:
 *   pnpm dotenv -e .env.local -- tsx scripts/manual-ghl-booking.ts \
 *     --email "you@example.com" \
 *     --name "Test User" \
 *     --phone "+18325550123" \
 *     --service STANDARD_NOTARY \
 *     --start "2025-08-15T15:00:00-05:00"
 *
 * If --start is not provided, it defaults to now + 2 hours in BUSINESS_TIMEZONE.
 */

import 'dotenv/config'
import { DateTime } from 'luxon'
import { findContactByEmail, createContact } from '@/lib/ghl/contacts'
import { createAppointment } from '@/lib/ghl/appointments-adapter'
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping'
import { createOpportunity } from '@/lib/ghl/opportunities'

type Args = {
  email: string
  name: string
  phone?: string
  service: string
  start?: string
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = {}
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i]
    const val = argv[i + 1]
    if (!key.startsWith('--')) continue
    switch (key) {
      case '--email': out.email = val; i++; break
      case '--name': out.name = val; i++; break
      case '--phone': out.phone = val; i++; break
      case '--service': out.service = val; i++; break
      case '--start': out.start = val; i++; break
    }
  }
  if (!out.email || !out.name || !out.service) {
    console.error('Missing required args. Required: --email, --name, --service. Optional: --phone, --start')
    process.exit(1)
  }
  return out as Args
}

async function main() {
  // Ensure preflight does not block test if slots cache is out of sync
  process.env.BOOKING_BYPASS_PREFLIGHT = process.env.BOOKING_BYPASS_PREFLIGHT || 'true'

  const args = parseArgs(process.argv)
  const tz = process.env.BUSINESS_TIMEZONE || 'America/Chicago'

  const startDT = args.start
    ? DateTime.fromISO(args.start)
    : DateTime.now().setZone(tz).plus({ hours: 2 })

  if (!startDT.isValid) {
    console.error(`Invalid --start datetime: ${args.start}`)
    process.exit(1)
  }

  const endDT = startDT.plus({ minutes: 60 })

  console.log('Preparing test booking...')
  console.log(`- Service: ${args.service}`)
  console.log(`- Start:   ${startDT.toISO()}`)
  console.log(`- End:     ${endDT.toISO()}`)

  const calendarId = getCalendarIdForService(args.service)

  // Find or create contact
  const nameParts = String(args.name).trim().split(' ')
  const firstName = nameParts.shift() || args.name
  const lastName = nameParts.join(' ') || '-'

  let contact: any = null
  try {
    contact = await findContactByEmail(args.email)
  } catch {}
  if (!contact) {
    const created = await createContact({
      firstName,
      lastName,
      email: args.email,
      phone: args.phone,
      source: 'Manual Test Booking'
    })
    // Normalize shape – API may return { id } or { contact: { id } }
    contact = (created as any)?.contact || created
    if (!contact?.id) {
      // Fallback: re-fetch to obtain ID
      contact = await findContactByEmail(args.email)
    }
  }

  console.log(`Contact ready: ${contact?.id || '(unknown id)'} for ${args.email}`)

  // Create appointment, fall back to opportunity if 4xx
  let appointment: any = null
  try {
    appointment = await createAppointment({
      calendarId,
      contactId: contact?.id,
      title: `${args.service.replace(/_/g, ' ')} – ${args.name}`,
      description: 'Manual test appointment to verify workflow triggers',
      startTime: startDT.toUTC().toISO(),
      endTime: endDT.toUTC().toISO(),
      locationId: process.env.GHL_LOCATION_ID,
      // Helpful defaults commonly required by GHL
      selectedTimezone: tz,
      timeZone: tz,
      channel: 'web',
      source: 'api',
    })
  } catch (err: any) {
    console.warn('Appointment creation failed, creating Opportunity instead:', err?.message || err)
  }

  if (appointment?.id) {
    console.log('Appointment created:')
    console.log({ id: (appointment as any)?.id, calendarId })
    console.log('\nIf your workflows are configured on this calendar/location, they should trigger now.')
    return
  }

  // Fallback
  const opportunity = await createOpportunity(String(contact?.id), {
    name: `${args.service} – ${args.name}`,
    status: 'open',
    source: 'Manual Test Booking',
    monetaryValue: 100,
  })
  console.log('Opportunity created:')
  console.log({ id: (opportunity as any)?.id })
  console.log('\nWorkflows attached to pipeline/stage should trigger for this opportunity.')
}

main().catch((err) => {
  console.error('Failed to create test booking:', err?.message || err)
  process.exit(1)
})


