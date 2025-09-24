import { NextRequest, NextResponse } from 'next/server'
import { withAdminSecurity } from '@/lib/security/comprehensive-security'

let runtimeSourceOverride: 'ghl' | 'local' | null = null

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = withAdminSecurity(async () => {
  return NextResponse.json({ source: runtimeSourceOverride })
})

export const POST = withAdminSecurity(async (request: NextRequest) => {
  const adminToken = request.headers.get('x-admin-token')
  const expected = process.env.ADMIN_API_TOKEN
  if (!expected || adminToken !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const source = String(body?.source || '').toLowerCase()
  if (source !== 'ghl' && source !== 'local') {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
  }
  runtimeSourceOverride = source as any
  ;(globalThis as any).__AV_SOURCE_OVERRIDE = runtimeSourceOverride
  return NextResponse.json({ success: true, source: runtimeSourceOverride })
})


