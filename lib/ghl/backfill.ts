import { prisma } from '@/lib/db'
import { findContactByEmail, createContact } from '@/lib/ghl/contacts'

export interface BackfillResult {
  scanned: number
  updated: number
  failed: number
  details: Array<{ bookingId: string; status: 'updated' | 'skipped' | 'failed'; reason?: string }>
}

/**
 * Backfill missing booking.ghlContactId for legacy records
 */
export async function backfillMissingGhlContacts(limit: number = 100): Promise<BackfillResult> {
  const now = new Date()
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  const bookings = await prisma.booking.findMany({
    where: {
      ghlContactId: null,
      customerEmail: { not: null },
      scheduledDateTime: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), lte: in60Days },
    },
    take: limit,
  })

  let updated = 0
  let failed = 0
  const details: BackfillResult['details'] = []

  for (const b of bookings) {
    try {
      const email = b.customerEmail as string
      let contact = await findContactByEmail(email)
      if (!contact) {
        const created = await createContact({
          firstName: (b.customerName || '').split(' ')[0] || '',
          lastName: (b.customerName || '').split(' ').slice(1).join(' ') || '',
          email,
          source: 'Backfill: Missing ghlContactId',
        })
        contact = created as any
      }
      if (contact?.id) {
        await prisma.booking.update({ where: { id: b.id }, data: { ghlContactId: contact.id } })
        updated++
        details.push({ bookingId: b.id, status: 'updated' })
      } else {
        details.push({ bookingId: b.id, status: 'skipped', reason: 'No contact id from GHL' })
      }
    } catch (err: any) {
      failed++
      details.push({ bookingId: b.id, status: 'failed', reason: err?.message || 'unknown' })
    }
  }

  return { scanned: bookings.length, updated, failed, details }
}


