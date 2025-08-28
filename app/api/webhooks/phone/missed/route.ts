import { NextResponse } from 'next/server'
import { sendSms } from '@/lib/sms'

export async function POST(req: Request) {
  const secret = process.env.MISSED_CALL_WEBHOOK_SECRET
  try {
    const body = await req.json()
    const provided = (body?.secret || '') as string
    if (!secret || provided !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const from = String(body?.from || '').replace(/[^+\d]/g, '')
    const status = String(body?.callStatus || '')
    const duration = Number(body?.duration || 0)
    if (!from) return NextResponse.json({ ok: true })
    if (status.toLowerCase().includes('missed') || duration === 0) {
      const link = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/booking?utm_source=call&utm_medium=sms-textback`
      await sendSms({ to: from.startsWith('+') ? from : `+1${from}`.replace('++','+'), body: `Sorry we missed you — book your nearest notary here: ${link}` })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}





