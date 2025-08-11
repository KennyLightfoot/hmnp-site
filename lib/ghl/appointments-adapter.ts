import { ghlApiRequest } from './error-handler'
import { DateTime } from 'luxon'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { getCalendarSlots } from './management'

const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || 'America/Chicago'

export async function createAppointment(appointmentData: any, locationId?: string) {
  const payload = { ...appointmentData }
  if (!payload.timeZone) payload.timeZone = BUSINESS_TIMEZONE
  const TEAM_MEMBER_ID = process.env.GHL_DEFAULT_TEAM_MEMBER_ID || process.env.GHL_ASSIGNED_USER_ID
  if (TEAM_MEMBER_ID) {
    if (!payload.assignedUserId) payload.assignedUserId = TEAM_MEMBER_ID
    if (!payload.selectedUsers) payload.selectedUsers = [TEAM_MEMBER_ID]
  }
  if (!payload.channel) payload.channel = 'web'
  if (!payload.source) payload.source = 'api'
  if (!payload.selectedTimezone) payload.selectedTimezone = BUSINESS_TIMEZONE

  const BYPASS_PREFLIGHT = (process.env.BOOKING_BYPASS_PREFLIGHT || '').toLowerCase() === 'true'
  if (!BYPASS_PREFLIGHT) {
    const startIso = String(payload.startTime)
    const startDT = DateTime.fromISO(startIso, { zone: BUSINESS_TIMEZONE })
    const dayStr = startDT.toFormat('yyyy-LL-dd')
    const teamMemberId = process.env.GHL_DEFAULT_TEAM_MEMBER_ID || undefined
    const slotsResponse = await getCalendarSlots(String(payload.calendarId), dayStr, dayStr, teamMemberId)
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
    return await ghlApiRequest('/calendars/events/appointments', { method: 'POST', body: JSON.stringify(payload) })
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


