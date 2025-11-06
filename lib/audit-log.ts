import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export type AuditEvent = {
  bookingId?: string
  entity: string
  action: string
  performedBy?: string
  data?: Record<string, any>
}

function computeHash(payload: object, prevHash?: string) {
  const serialized = JSON.stringify({ payload, prevHash: prevHash || null })
  return crypto.createHash('sha256').update(serialized).digest('hex')
}

export async function appendAuditLog(event: AuditEvent) {
  const { bookingId, entity, action, performedBy, data } = event
  let prevHash: string | undefined
  if (bookingId) {
    const last = await (prisma as any).auditLog.findFirst({ where: { bookingId }, orderBy: { timestamp: 'desc' } })
    prevHash = last?.hash || undefined
  }
  const hash = computeHash({ bookingId, entity, action, performedBy, data, timestamp: Date.now() }, prevHash)
  return (prisma as any).auditLog.create({
    data: {
      bookingId,
      entity,
      action,
      performedBy,
      data: data as any,
      prevHash,
      hash,
    }
  })
}


