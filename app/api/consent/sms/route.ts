import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/security/rate-limiting'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { findContactByEmail, findContactByPhone, addTagsToContact, updateContactCustomFields } from '@/lib/ghl/contacts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CONSENT_TAG_OPT_IN = process.env.GHL_SMS_CONSENT_TAG || 'Consent:SMS_OptIn'
const CONSENT_TAG_OPT_OUT = process.env.GHL_SMS_OPTOUT_TAG || 'Consent:SMS_OptOut'

export const POST = withRateLimit('public', 'sms_consent')(async (request: NextRequest) => {
  try {
    const json = await request.json().catch(() => ({}))
    const email = String(json?.email || '').trim()
    const phone = String(json?.phone || '').trim()
    const consent = Boolean(json?.consent)
    const source = String(json?.source || 'Website').slice(0, 100)
    const timestamp = new Date().toISOString()
    const headersList = request.headers
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    if (!email && !phone) {
      return NextResponse.json({ success: false, message: 'email or phone required' }, { status: 400 })
    }

    let contact: any = null
    if (email) {
      contact = await findContactByEmail(email)
    }
    if (!contact && phone) {
      contact = await findContactByPhone(phone)
    }

    if (!contact?.id) {
      return NextResponse.json({ success: false, message: 'contact not found' }, { status: 404 })
    }

    const contactId = contact.id as string

    if (consent) {
      await addTagsToContact(contactId, [CONSENT_TAG_OPT_IN])
    } else {
      await addTagsToContact(contactId, [CONSENT_TAG_OPT_OUT])
    }

    try {
      await updateContactCustomFields(contactId, {
        cf_consent_sms_communications: consent ? 'true' : 'false',
        cf_consent_source: source,
        cf_consent_timestamp: timestamp,
        cf_consent_ip: ip,
        cf_consent_user_agent: userAgent,
      })
    } catch {}

    return NextResponse.json({ success: true, contactId, consent, source, timestamp })
  } catch (error) {
    return NextResponse.json({ success: false, message: getErrorMessage(error) }, { status: 500 })
  }
})


