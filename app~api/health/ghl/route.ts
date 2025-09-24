import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { backfillMissingGhlContacts } from '@/lib/ghl/backfill'
import { addContactToWorkflow } from '@/lib/ghl/management'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const dryRun = url.searchParams.get('dryRun') === 'true'
  const workflowId = process.env.GHL_24HR_REMINDER_WORKFLOW_ID || ''

  // 1) Count bookings missing ghlContactId
  const missingCount = await prisma.booking.count({ where: { ghlContactId: null, customerEmail: { not: null } } })

  // 2) Optionally backfill a small batch in health
  let backfill: any = null
  if (!dryRun && missingCount > 0) {
    backfill = await backfillMissingGhlContacts(50)
  }

  // 3) Dry-run test of workflow on a recent booking with ghlContactId
  let workflowTest: any = { attempted: false }
  if (workflowId) {
    const recent = await prisma.booking.findFirst({
      where: { ghlContactId: { not: null } },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, ghlContactId: true },
    })
    if (recent?.ghlContactId) {
      workflowTest.attempted = true
      if (!dryRun) {
        try {
          await addContactToWorkflow(recent.ghlContactId, workflowId)
          workflowTest.result = 'ok'
          workflowTest.bookingId = recent.id
        } catch (e: any) {
          workflowTest.result = 'error'
          workflowTest.error = e?.message || 'unknown'
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    env: { hasWorkflowId: !!workflowId },
    missingContacts: missingCount,
    backfill,
    workflowTest,
  })
}


