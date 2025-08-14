import { ghlApiRequest } from './error-handler'
import { DateTime } from 'luxon'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { getCalendarSlots } from './management'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || 'America/Chicago'

export async function createAppointment(appointmentData: any, locationId?: string) {
  const payload = { ...appointmentData }
  // Ensure locationId in body for PIT flows
  if (!payload.locationId) payload.locationId = process.env.GHL_LOCATION_ID
  if (!payload.timeZone) payload.timeZone = BUSINESS_TIMEZONE
  const TEAM_MEMBER_ID = process.env.GHL_DEFAULT_TEAM_MEMBER_ID || process.env.GHL_ASSIGNED_USER_ID
  if (TEAM_MEMBER_ID) {
    if (!payload.assignedUserId) payload.assignedUserId = TEAM_MEMBER_ID
    if (!payload.selectedUsers) payload.selectedUsers = [TEAM_MEMBER_ID]
  }
  if (!payload.channel) payload.channel = 'web'
  if (!payload.source) payload.source = 'api'
  if (!payload.selectedTimezone) payload.selectedTimezone = BUSINESS_TIMEZONE

  // Compute idempotency key (calendarId + startTime + contactId)
  const rawKey = `${String(payload.calendarId)}|${String(payload.startTime)}|${String(payload.contactId || '')}`
  const idempotencyKey = crypto.createHash('sha256').update(rawKey).digest('hex')
  const idempoRedisKey = `ghl:idempotency:${idempotencyKey}`
  try {
    // Avoid duplicate appointment attempts within 15 minutes
    const ok = await (redis as any)?.setex?.(idempoRedisKey, 15 * 60, '1')
    if (ok === false) {
      const err = new Error('DUPLICATE_REQUEST: An identical appointment create is already in progress') as any
      err.code = 'DUPLICATE_REQUEST'
      throw err
    }
  } catch {}

  const BYPASS_PREFLIGHT = (process.env.BOOKING_BYPASS_PREFLIGHT || '').toLowerCase() === 'true'
  if (!BYPASS_PREFLIGHT) {
    const startIso = String(payload.startTime)
    const startDT = DateTime.fromISO(startIso, { zone: BUSINESS_TIMEZONE })
    const dayStr = startDT.toFormat('yyyy-LL-dd')
    const teamMemberId = process.env.GHL_DEFAULT_TEAM_MEMBER_ID || undefined
    let slotsResponse: any = []
    try {
      slotsResponse = await getCalendarSlots(String(payload.calendarId), dayStr, dayStr, teamMemberId)
    } catch (e) {
      // If free-slots lookup fails, do not block appointment creation – GHL will validate again
      slotsResponse = []
    }
    const rawSlots = Array.isArray(slotsResponse as any)
      ? (slotsResponse as any)
      : Array.isArray((slotsResponse as any)?.slots)
        ? (slotsResponse as any).slots
        : Array.isArray((slotsResponse as any)?.availableSlots)
          ? (slotsResponse as any).availableSlots
          : []
    const desiredMs = Date.parse(startIso)
    const hasMatchingStart = rawSlots.some((s: any) => {
      const sStart = s?.startTime || s?.start
      if (!sStart) return false
      const ms = Date.parse(String(sStart))
      return isFinite(ms) && Math.abs(ms - desiredMs) < 60 * 1000
    })
    if (!hasMatchingStart) {
      const err = new Error('SLOT_UNAVAILABLE: Selected time is not available per free-slots') as any
      err.code = 'SLOT_UNAVAILABLE'
      throw err
    }
  }

  try {
    return await ghlApiRequest('/calendars/events/appointments', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    throw new Error(`Failed to create appointment: ${getErrorMessage(error)}`)
  }
}

export async function getCalendarEvents(calendarId: string, startTimeIso: string, endTimeIso: string) {
  const params = new URLSearchParams({ calendarId, startTime: startTimeIso, endTime: endTimeIso }).toString()
  try {
    return await ghlApiRequest(`/calendars/events?${params}`, { method: 'GET' })
  } catch (error) {
    throw new Error(`Failed to retrieve calendar events: ${getErrorMessage(error)}`)
  }
}


