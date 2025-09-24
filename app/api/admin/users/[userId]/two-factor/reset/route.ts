import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'

// POST /api/admin/users/[userId]/two-factor/reset
export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    // Delete or reset two-factor record
    await prisma.userTwoFactor.upsert({
      where: { userId },
      update: { isEnabled: false, secret: '', backupCodes: '' },
      create: { userId, isEnabled: false, secret: '', backupCodes: '' },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('2FA reset error', error)
    return NextResponse.json({ error: 'Failed to reset 2FA' }, { status: 500 })
  }
} 