import { z } from 'zod'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { RESERVATION_CONFIG } from './config'
import { getEmailKey, getReservationKey, getSlotKey, getUserKey } from './keys'
import { generateReservationId, maskEmail, sanitizeEmailInObj } from './utils'
import type { ReservationResult, ReservationStatus, SlotReservation } from './types'
import { webSocketManager } from '@/lib/realtime/websocket-manager'

export const ReservationRequestSchema = z.object({
  datetime: z.string().datetime(),
  serviceType: z.enum(['QUICK_STAMP_LOCAL','STANDARD_NOTARY','EXTENDED_HOURS','LOAN_SIGNING','RON_SERVICES','BUSINESS_ESSENTIALS','BUSINESS_GROWTH']),
  userId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  estimatedDuration: z.number().min(15).max(180).default(60),
  metadata: z.record(z.any()).optional(),
})

export const ExtensionRequestSchema = z.object({
  reservationId: z.string(),
  userId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  reason: z.string().max(200).optional(),
})

export class SlotReservationEngine {
  async reserveSlot(request: z.infer<typeof ReservationRequestSchema>): Promise<ReservationResult> {
    try {
      const validated = ReservationRequestSchema.parse(request)
      const { datetime, serviceType, userId, customerEmail, estimatedDuration, metadata } = validated
      const reservationId = generateReservationId()
      const slotKey = getSlotKey(datetime, serviceType)
      const reservationKey = getReservationKey(reservationId)
      const userKey = userId ? getUserKey(userId) : null

      const existingReservation = await redis.get(slotKey)
      if (existingReservation && existingReservation !== (userId || customerEmail)) {
        return { success: false, message: '⚠️ This time slot was just booked by another customer. Please select a different time.', conflictingReservation: existingReservation }
      }

      if (userKey) {
        const existingUserReservation = await redis.get(userKey)
        if (existingUserReservation) await this.releaseReservation(existingUserReservation)
      }

      const now = new Date()
      const expiresAt = new Date(now.getTime() + RESERVATION_CONFIG.defaultHoldDuration * 1000)
      const reservation: SlotReservation = {
        id: reservationId,
        datetime,
        serviceType,
        userId,
        customerEmail,
        estimatedDuration,
        reservedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        extended: false,
        extensionCount: 0,
        metadata,
      }

      const pipeline = redis.pipeline()
      pipeline?.setex(slotKey, RESERVATION_CONFIG.defaultHoldDuration, userId || customerEmail || reservationId)
      pipeline?.setex(reservationKey, RESERVATION_CONFIG.defaultHoldDuration, JSON.stringify(reservation))
      if (userKey) pipeline?.setex(userKey, RESERVATION_CONFIG.defaultHoldDuration, reservationId)
      if (customerEmail) pipeline?.setex(getEmailKey(customerEmail), RESERVATION_CONFIG.defaultHoldDuration, reservationId)
      await pipeline?.exec()

      await this.broadcastSlotUpdate(datetime, serviceType, false, reservationId)

      logger.info('Slot reserved successfully', { reservationId, datetime, serviceType, userId, customerEmail: customerEmail ? maskEmail(customerEmail) : undefined })
      return { success: true, reservation, message: '⏰ Slot reserved for 15 minutes while you complete booking', timeRemaining: RESERVATION_CONFIG.defaultHoldDuration }
    } catch (error) {
      logger.error('Slot reservation failed', { request: sanitizeEmailInObj(request as any), error: getErrorMessage(error) })
      return { success: false, message: 'Unable to reserve slot. Please try again.' }
    }
  }

  async extendReservation(request: z.infer<typeof ExtensionRequestSchema>): Promise<ReservationResult> {
    try {
      const validated = ExtensionRequestSchema.parse(request)
      const { reservationId, userId, customerEmail, reason } = validated
      const reservation = await this.getReservation(reservationId)
      if (!reservation) return { success: false, message: 'Reservation not found or has expired' }
      if (reservation.extensionCount >= RESERVATION_CONFIG.maxExtensions) return { success: false, message: 'Maximum extensions reached. Please complete your booking soon.' }
      if (!this.verifyReservationOwnership(reservation, userId, customerEmail)) return { success: false, message: 'You can only extend your own reservations' }

      const now = new Date()
      const newExpiresAt = new Date(now.getTime() + RESERVATION_CONFIG.extensionDuration * 1000)
      const updated: SlotReservation = { ...reservation, expiresAt: newExpiresAt.toISOString(), extended: true, extensionCount: reservation.extensionCount + 1, metadata: { ...reservation.metadata, extensionReason: reason, extendedAt: now.toISOString() } }

      const slotKey = getSlotKey(reservation.datetime, reservation.serviceType)
      const reservationKey = getReservationKey(reservationId)
      const pipeline = redis.pipeline()
      pipeline?.setex(slotKey, RESERVATION_CONFIG.extensionDuration, reservation.userId || reservation.customerEmail || reservationId)
      pipeline?.setex(reservationKey, RESERVATION_CONFIG.extensionDuration, JSON.stringify(updated))
      if (reservation.userId) pipeline?.setex(getUserKey(reservation.userId), RESERVATION_CONFIG.extensionDuration, reservationId)
      if (reservation.customerEmail) pipeline?.setex(getEmailKey(reservation.customerEmail), RESERVATION_CONFIG.extensionDuration, reservationId)
      await pipeline?.exec()

      logger.info('Reservation extended', { reservationId, extensionCount: updated.extensionCount, reason, newExpiresAt: newExpiresAt.toISOString() })
      return { success: true, reservation: updated, message: 'Reservation extended for 5 more minutes', timeRemaining: RESERVATION_CONFIG.extensionDuration }
    } catch (error) {
      logger.error('Reservation extension failed', { request: sanitizeEmailInObj(request as any), error: getErrorMessage(error) })
      return { success: false, message: 'Unable to extend reservation. Please try again.' }
    }
  }

  async getReservationStatus(reservationId: string): Promise<ReservationStatus> {
    try {
      const reservation = await this.getReservation(reservationId)
      if (!reservation) return { active: false, timeRemaining: 0, warningZone: false, canExtend: false }
      const now = new Date()
      const expiresAt = new Date(reservation.expiresAt)
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      const active = timeRemaining > 0
      const warningZone = timeRemaining <= RESERVATION_CONFIG.warningThreshold
      const canExtend = active && reservation.extensionCount < RESERVATION_CONFIG.maxExtensions
      return { active, timeRemaining, warningZone, canExtend, reservation: active ? reservation : undefined }
    } catch (error) {
      logger.error('Failed to get reservation status', { reservationId, error: getErrorMessage(error) })
      return { active: false, timeRemaining: 0, warningZone: false, canExtend: false }
    }
  }

  async convertToBooking(reservationId: string, bookingId: string): Promise<boolean> {
    try {
      const reservation = await this.getReservation(reservationId)
      if (!reservation) { logger.warn('Attempted to convert non-existent reservation', { reservationId, bookingId }); return false }
      const updated: SlotReservation = { ...reservation, bookingId, metadata: { ...reservation.metadata, convertedAt: new Date().toISOString() } }
      const reservationKey = getReservationKey(reservationId)
      const ttl = await redis.ttl(reservationKey)
      if (ttl > 0) await redis.setex(reservationKey, ttl, JSON.stringify(updated))
      logger.info('Reservation converted to booking', { reservationId, bookingId })
      return true
    } catch (error) {
      logger.error('Failed to convert reservation to booking', { reservationId, bookingId, error: getErrorMessage(error) })
      return false
    }
  }

  async releaseReservation(reservationId: string): Promise<boolean> {
    try {
      const reservation = await this.getReservation(reservationId)
      if (!reservation) return true
      const slotKey = getSlotKey(reservation.datetime, reservation.serviceType)
      const reservationKey = getReservationKey(reservationId)
      const keysToDelete = [slotKey, reservationKey]
      if (reservation.userId) keysToDelete.push(getUserKey(reservation.userId))
      if (reservation.customerEmail) keysToDelete.push(getEmailKey(reservation.customerEmail))
      for (const key of keysToDelete) await redis.del(key)
      await this.broadcastSlotUpdate(reservation.datetime, reservation.serviceType, true)
      logger.info('Reservation released', { reservationId })
      return true
    } catch (error) {
      logger.error('Failed to release reservation', { reservationId, error: getErrorMessage(error) })
      return false
    }
  }

  async isSlotAvailable(datetime: string, serviceType: string): Promise<boolean> {
    try {
      const slotKey = getSlotKey(datetime, serviceType)
      const r = await redis.get(slotKey)
      return !r
    } catch (error) {
      logger.error('Failed to check slot availability', { datetime, serviceType, error: getErrorMessage(error) })
      return false
    }
  }

  private verifyReservationOwnership(reservation: SlotReservation, userId?: string, customerEmail?: string): boolean {
    return !!((userId && reservation.userId === userId) || (customerEmail && reservation.customerEmail === customerEmail))
  }

  private async getReservation(reservationId: string): Promise<SlotReservation | null> {
    try {
      const data = await redis.get(getReservationKey(reservationId))
      if (!data) return null
      return JSON.parse(data)
    } catch (error) {
      logger.error('Failed to get reservation', { reservationId, error: getErrorMessage(error) })
      return null
    }
  }

  private async broadcastSlotUpdate(datetime: string, serviceType: string, available: boolean, reservationId?: string): Promise<void> {
    try {
      const viewerCount = webSocketManager.getSlotViewerCount(datetime, serviceType)
      await webSocketManager.broadcastSlotUpdate({ datetime, serviceType, available, reservationId, viewerCount })
      await redis.publish('slot_updates', JSON.stringify({ datetime, serviceType, available, reservationId, viewerCount, timestamp: new Date().toISOString() }))
    } catch (error) {
      logger.error('Failed to broadcast slot update', { datetime, serviceType, available, error: getErrorMessage(error) })
    }
  }
}

export const slotReservationEngine = new SlotReservationEngine()

export async function reserveSlot(request: z.infer<typeof ReservationRequestSchema>): Promise<ReservationResult> { return slotReservationEngine.reserveSlot(request) }
export async function extendReservation(request: z.infer<typeof ExtensionRequestSchema>): Promise<ReservationResult> { return slotReservationEngine.extendReservation(request) }
export async function getReservationStatus(reservationId: string): Promise<ReservationStatus> { return slotReservationEngine.getReservationStatus(reservationId) }
export async function isSlotAvailable(datetime: string, serviceType: string): Promise<boolean> { return slotReservationEngine.isSlotAvailable(datetime, serviceType) }
export async function convertToBooking(reservationId: string, bookingId: string): Promise<boolean> { return slotReservationEngine.convertToBooking(reservationId, bookingId) }
export async function releaseReservation(reservationId: string): Promise<boolean> { return slotReservationEngine.releaseReservation(reservationId) }


