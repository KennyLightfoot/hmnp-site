import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role } from '@/lib/prisma-types'

const qaUpdateSchema = z.object({
  journalEntryVerified: z.boolean().optional(),
  sealPhotoVerified: z.boolean().optional(),
  documentCountVerified: z.boolean().optional(),
  clientConfirmationVerified: z.boolean().optional(),
  closeoutFormVerified: z.boolean().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'FLAGGED', 'COMPLETE']).optional(),
  notes: z.string().max(2000).optional(),
  followUpAction: z.string().max(2000).optional(),
})

async function ensureAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session || !(session as any)?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = ((session as any).user as any)?.role as Role | undefined
  if (role !== Role.ADMIN && role !== Role.STAFF) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const unauthorized = await ensureAdmin(session)
  if (unauthorized) return unauthorized

  const { id } = await context.params

  const record = await (prisma as any).bookingQARecord.findUnique({
    where: { bookingId: id },
  })

  return NextResponse.json({ qa: record })
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const unauthorized = await ensureAdmin(session)
  if (unauthorized) return unauthorized

  const { id } = await context.params
  const payload = await request.json().catch(() => ({}))
  const parsed = qaUpdateSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const qaUserId = (session?.user as any)?.id as string | undefined

  const data = parsed.data

  const record = await (prisma as any).bookingQARecord.upsert({
    where: { bookingId: id },
    create: {
      bookingId: id,
      qaUserId,
      ...data,
    },
    update: {
      qaUserId,
      ...data,
    },
  })

  return NextResponse.json({ qa: record })
}
