import { NextResponse } from 'next/server'
import { checkTimeBasedFollowUps, processScheduledFollowUps } from '@/lib/follow-up-automation'
import { backfillMissingGhlContacts } from '@/lib/ghl/backfill'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Ensure legacy records have ghlContactId before scheduling
  try { await backfillMissingGhlContacts(100) } catch {}
  await checkTimeBasedFollowUps()
  await processScheduledFollowUps()
  return NextResponse.json({ ok: true, processed: true })
}

export async function POST() {
  return GET()
}


