import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { sendSms, checkSmsConsent } from '@/lib/sms'
import { findContactByPhone } from '@/lib/ghl/contacts'

// naive in-memory token bucket per ip (build-time single instance only; fine for our use)
const rateMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: Request) {
  try {
    const hdrs = await headers()
    const apiKey = (hdrs?.get?.('x-api-key') as string) || ''
    const expected = process.env.SMS_API_KEY || ''
    if (!expected || apiKey !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const xff = (hdrs?.get?.('x-forwarded-for') as string) || ''
    const ip = (xff.split(',')[0] || '').trim() || 'anon'
    const now = Date.now()
    const windowMs = 60_000
    const maxPerWindow = 5
    const bucket = rateMap.get(ip)
    if (!bucket || now > bucket.resetAt) {
      rateMap.set(ip, { count: 1, resetAt: now + windowMs })
    } else {
      if (bucket.count >= maxPerWindow) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
      bucket.count += 1
      rateMap.set(ip, bucket)
    }
    const { to, body, email } = await req.json()
    if (!to || !body) return NextResponse.json({ error: 'Missing to or body' }, { status: 400 })
    const phone = String(to).replace(/[^+\d]/g, '')
    if (!/^\+?\d{10,15}$/.test(phone)) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    // Consent gate: prefer email; if absent, attempt GHL lookup by phone
    let allowed = true
    if (typeof email === 'string' && email.trim()) {
      allowed = await checkSmsConsent(email.trim())
    } else {
      try {
        const contact = await findContactByPhone(phone)
        const tags: string[] = Array.isArray(contact?.tags) ? contact.tags : []
        const consentTag = process.env.GHL_SMS_CONSENT_TAG || 'Consent:SMS_OptIn'
        allowed = tags.includes(consentTag)
      } catch {
        allowed = false
      }
    }
    if (!allowed) return NextResponse.json({ error: 'No SMS consent on file' }, { status: 403 })

    const result = await sendSms({ to: phone.startsWith('+') ? phone : `+1${phone}`.replace('++','+'), body: String(body).slice(0, 480) })
    if (!result.success) return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 502 })
    return NextResponse.json({ ok: true, messageId: result.messageId })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}



