import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import { randomUUID } from 'crypto'

// POST /api/admin/users/[userId]/impersonate
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

  // Prevent impersonating self
  if (session.user.id === userId) {
    return NextResponse.json({ error: 'Cannot impersonate yourself' }, { status: 400 })
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Create new session token for target user (30 days)
  const sessionToken = randomUUID()
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      sessionToken,
      userId: targetUser.id,
      expires,
    },
  })

  const res = NextResponse.json({ success: true, redirect: '/portal' })
  // Name follows NextAuth defaults; use __Secure prefix if production & secure
  const cookieName = process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
  res.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires,
    secure: process.env.NODE_ENV === 'production',
  })

  return res
} 