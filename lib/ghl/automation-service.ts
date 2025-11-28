import { addTagsToContact, createContact, findContactByEmail, findContactByPhone } from './contacts'
import { sendGHLSMS } from '@/lib/ghl-messaging'
import { sendSms } from '@/lib/sms'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { createBookingPaymentToken } from '@/lib/security/payment-link-tokens'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'https://houstonmobilenotarypros.com'

function normalizePhone(input: string): string {
  if (!input) return ''
  const digits = input.replace(/[^\d]/g, '')
  if (!digits) return ''
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  if (digits.startsWith('+')) return digits
  return `+${digits}`
}

async function ensureContactByPhone(phone: string, defaults: { firstName?: string; lastName?: string; source?: string }): Promise<string | null> {
  const normalized = normalizePhone(phone)
  if (!normalized) return null
  try {
    const existing = await findContactByPhone(normalized)
    if (existing?.id) {
      return existing.id as string
    }
  } catch (error) {
    console.warn('[GHL] ensureContactByPhone lookup failed', getErrorMessage(error))
  }

  try {
    const created = await createContact({
      firstName: defaults.firstName || 'Valued',
      lastName: defaults.lastName || 'Caller',
      phone: normalized,
      source: defaults.source || 'Missed Call',
    })
    const contactId = (created as any)?.id || (created as any)?.contact?.id
    if (contactId) {
      try {
        await addTagsToContact(contactId, ['event:missed_call'])
      } catch (tagError) {
        console.warn('[GHL] Failed to tag missed call contact', getErrorMessage(tagError))
      }
    }
    return contactId || null
  } catch (error) {
    console.error('[GHL] ensureContactByPhone create failed', getErrorMessage(error))
    return null
  }
}

async function sendSmsViaContact(contactId: string, message: string): Promise<boolean> {
  try {
    const response = await sendGHLSMS(contactId, message)
    if (!response.success) {
      console.warn('[GHL] sendGHLSMS failed', response.error)
    }
    return response.success
  } catch (error) {
    console.error('[GHL] sendGHLSMS threw error', getErrorMessage(error))
    return false
  }
}

export async function sendMissedCallTextback(phone: string, options?: { bookingId?: string; source?: string }): Promise<boolean> {
  const normalized = normalizePhone(phone)
  if (!normalized) return false
  const bookingQuery = options?.bookingId ? `&bookingId=${encodeURIComponent(options.bookingId)}` : ''
  const link = `${BASE_URL}/booking?utm_source=missed-call&utm_medium=sms${bookingQuery}`
  const message = `Sorry we missed you! Schedule your notary in seconds: ${link}`

  const contactId = await ensureContactByPhone(normalized, {
    source: options?.source || 'Missed Call',
  })

  if (contactId) {
    const sent = await sendSmsViaContact(contactId, message)
    if (sent) return true
  }

  try {
    const fallback = await sendSms({ to: normalized, body: message })
    if (!fallback.success) {
      console.error('[GHL] Missed call fallback SMS failed', fallback.error)
      return false
    }
    return true
  } catch (error) {
    console.error('[GHL] Missed call SMS threw error', getErrorMessage(error))
    return false
  }
}

export async function resolveBookingContactId(booking: any): Promise<string | null> {
  if (booking?.ghlContactId) return booking.ghlContactId as string
  const email = booking?.customerEmail
  if (!email) return null
  try {
    const existing = await findContactByEmail(email)
    const contactId = existing?.id as string | undefined
    if (contactId) {
      return contactId
    }
  } catch (error) {
    console.warn('[GHL] resolveBookingContactId lookup failed', getErrorMessage(error))
  }
  return null
}

export function buildBookingLinks(booking: any) {
  const bookingId = booking?.id || ''
  const rescheduleLink = `${BASE_URL}/request-a-call?intent=reschedule${bookingId ? `&bookingId=${encodeURIComponent(bookingId)}` : ''}`
  const cancelLink = `${BASE_URL}/request-a-call?intent=cancel${bookingId ? `&bookingId=${encodeURIComponent(bookingId)}` : ''}`
  const token = bookingId ? createBookingPaymentToken(bookingId) : null
  const paymentLink = booking?.stripePaymentUrl || (
    token
      ? `${BASE_URL}/payment/${bookingId}?token=${encodeURIComponent(token)}`
      : `${BASE_URL}/payment/${bookingId}`
  )
  const reviewLink = process.env.NEXT_PUBLIC_REVIEW_LINK || `${BASE_URL}/reviews`
  return {
    rescheduleLink,
    cancelLink,
    paymentLink,
    reviewLink,
  }
}
