import { NextResponse } from 'next/server'
import { getResponse } from '@/lib/ai/chat-provider'
import { alertManager } from '@/lib/monitoring/alert-manager'

export const runtime = 'edge'

export async function GET() {
  try {
    const res = await getResponse('ping', undefined, { type: 'canary' })
    try { await alertManager.recordMetric('ai.chat.canary.success', 1) } catch (_) {}
    return NextResponse.json({ ok: true, text: res.text })
  } catch (err) {
    try { await alertManager.recordMetric('ai.chat.canary.failure', 1) } catch (_) {}
    return NextResponse.json({ ok: false, error: 'AI unavailable' }, { status: 502 })
  }
} 