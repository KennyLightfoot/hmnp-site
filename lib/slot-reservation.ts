/**
 * Championship Booking System - Slot Reservation Engine
 * Houston Mobile Notary Pros
 * 
 * Psychological lock-in mechanism that reserves slots while customers complete booking.
 * This creates urgency and prevents slot conflicts, driving higher conversion rates.
 */

import { redis } from './redis';
import { logger } from './logger';
import { z } from 'zod';

// Reservation Configuration
const RESERVATION_CONFIG = {
  defaultHoldDuration: 15 * 60, // 15 minutes in seconds
  extensionDuration: 5 * 60,    // 5 minutes for extension
  maxExtensions: 1,             // Maximum number of extensions allowed
  warningThreshold: 5 * 60,     // Warning when 5 minutes left
  cleanupInterval: 60,          // Cleanup expired reservations every minute
} as const;

// Validation Schema
const ReservationRequestSchema = z.object({
  datetime: z.string().datetime(),
  serviceType: z.enum(['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES']),
  userId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  estimatedDuration: z.number().min(15).max(180).default(60),
  metadata: z.record(z.any()).optional()
});

const ExtensionRequestSchema = z.object({
  reservationId: z.string(),
  userId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  reason: z.string().max(200).optional()
});

// Types
export interface SlotReservation {
  id: string;
  datetime: string;
  serviceType: string;
  userId?: string;
  customerEmail?: string;
  estimatedDuration: number;
  reservedAt: string;
  expiresAt: string;
  extended: boolean;
  extensionCount: number;
  bookingId?: string;
  metadata?: Record<string, any>;
}

export interface ReservationResult {
  success: boolean;
  reservation?: SlotReservation;
  message: string;
  timeRemaining?: number;
  conflictingReservation?: string;
}

export interface ReservationStatus {
  active: boolean;
  timeRemaining: number;
  warningZone: boolean;
  canExtend: boolean;
  reservation?: SlotReservation;
}

/**
 * Slot Reservation Engine - The Psychological Lock-in System
 * 
 * This class manages time-limited slot reservations that create urgency
 * and prevent booking conflicts while customers complete their purchase.
 */
export class SlotReservationEngine {
  private readonly keyPrefix = 'slot_reservation:';
  private readonly userKeyPrefix = 'user_reservation:';
  private readonly slotKeyPrefix = 'slot_hold:';

  /**
   * Reserve a slot for a customer with psychological urgency
   */
  async reserveSlot(request: z.infer<typeof ReservationRequestSchema>): Promise<ReservationResult> {
    try {
      // Validate the request
      const validatedRequest = ReservationRequestSchema.parse(request);
      
      const { datetime, serviceType, userId, customerEmail, estimatedDuration, metadata } = validatedRequest;
      
      // Generate unique reservation ID
      const reservationId = this.generateReservationId();
      
      // Create Redis keys
      const slotKey = this.getSlotKey(datetime, serviceType);
      const reservationKey = this.getReservationKey(reservationId);
      const userKey = userId ? this.getUserKey(userId) : null;
      
      // Check for existing reservation on this slot
      const existingReservation = await redis.get(slotKey);
      if (existingReservation && existingReservation !== (userId || customerEmail)) {
        return {
          success: false,
          message: '⚠️ This time slot was just booked by another customer. Please select a different time.',
          conflictingReservation: existingReservation
        };
      }
      
      // Check if user already has an active reservation
      if (userKey) {
        const existingUserReservation = await redis.get(userKey);
        if (existingUserReservation) {
          // Release the old reservation before creating new one
          await this.releaseReservation(existingUserReservation);
        }
      }
      
      // Calculate expiration times
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (RESERVATION_CONFIG.defaultHoldDuration * 1000));
      
      // Create reservation object
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
        metadata
      };
      
      // Store reservation with expiration
      const pipeline = redis.pipeline();
      
      // Reserve the slot
      pipeline.setex(slotKey, RESERVATION_CONFIG.defaultHoldDuration, userId || customerEmail || reservationId);
      
      // Store reservation details
      pipeline.setex(reservationKey, RESERVATION_CONFIG.defaultHoldDuration, JSON.stringify(reservation));
      
      // Track user's current reservation
      if (userKey) {
        pipeline.setex(userKey, RESERVATION_CONFIG.defaultHoldDuration, reservationId);
      }
      
      // Track by email if provided
      if (customerEmail) {
        const emailKey = this.getEmailKey(customerEmail);
        pipeline.setex(emailKey, RESERVATION_CONFIG.defaultHoldDuration, reservationId);
      }
      
      await pipeline.exec();
      
      logger.info('Slot reserved successfully', {
        reservationId,
        datetime,
        serviceType,
        userId,
        customerEmail: customerEmail ? this.maskEmail(customerEmail) : undefined
      });
      
      return {
        success: true,
        reservation,
        message: '⏰ Slot reserved for 15 minutes while you complete booking',
        timeRemaining: RESERVATION_CONFIG.defaultHoldDuration
      };
      
    } catch (error) {
      logger.error('Slot reservation failed', { 
        request: this.sanitizeRequest(request), 
        error: error.message 
      });
      
      return {
        success: false,
        message: 'Unable to reserve slot. Please try again.'
      };
    }
  }

  /**
   * Extend a reservation by additional time (one-time only)
   */
  async extendReservation(request: z.infer<typeof ExtensionRequestSchema>): Promise<ReservationResult> {
    try {
      const validatedRequest = ExtensionRequestSchema.parse(request);
      const { reservationId, userId, customerEmail, reason } = validatedRequest;
      
      // Get current reservation
      const reservation = await this.getReservation(reservationId);
      if (!reservation) {
        return {
          success: false,
          message: 'Reservation not found or has expired'
        };
      }
      
      // Check if already extended
      if (reservation.extensionCount >= RESERVATION_CONFIG.maxExtensions) {
        return {
          success: false,
          message: 'Maximum extensions reached. Please complete your booking soon.'
        };
      }
      
      // Verify ownership
      if (!this.verifyReservationOwnership(reservation, userId, customerEmail)) {
        return {
          success: false,
          message: 'You can only extend your own reservations'
        };
      }
      
      // Calculate new expiration
      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + (RESERVATION_CONFIG.extensionDuration * 1000));
      
      // Update reservation
      const updatedReservation: SlotReservation = {
        ...reservation,
        expiresAt: newExpiresAt.toISOString(),
        extended: true,
        extensionCount: reservation.extensionCount + 1,
        metadata: {
          ...reservation.metadata,
          extensionReason: reason,
          extendedAt: now.toISOString()
        }
      };
      
      // Update Redis with new expiration
      const slotKey = this.getSlotKey(reservation.datetime, reservation.serviceType);
      const reservationKey = this.getReservationKey(reservationId);
      
      const pipeline = redis.pipeline();
      pipeline.setex(slotKey, RESERVATION_CONFIG.extensionDuration, reservation.userId || reservation.customerEmail || reservationId);
      pipeline.setex(reservationKey, RESERVATION_CONFIG.extensionDuration, JSON.stringify(updatedReservation));
      
      // Update user tracking
      if (reservation.userId) {
        const userKey = this.getUserKey(reservation.userId);
        pipeline.setex(userKey, RESERVATION_CONFIG.extensionDuration, reservationId);
      }
      
      if (reservation.customerEmail) {
        const emailKey = this.getEmailKey(reservation.customerEmail);
        pipeline.setex(emailKey, RESERVATION_CONFIG.extensionDuration, reservationId);
      }
      
      await pipeline.exec();
      
      logger.info('Reservation extended', {
        reservationId,
        extensionCount: updatedReservation.extensionCount,
        reason,
        newExpiresAt: newExpiresAt.toISOString()
      });
      
      return {
        success: true,
        reservation: updatedReservation,
        message: 'Reservation extended for 5 more minutes',
        timeRemaining: RESERVATION_CONFIG.extensionDuration
      };
      
    } catch (error) {
      logger.error('Reservation extension failed', { 
        request: this.sanitizeExtensionRequest(request), 
        error: error.message 
      });
      
      return {
        success: false,
        message: 'Unable to extend reservation. Please try again.'
      };
    }
  }

  /**
   * Check reservation status and time remaining
   */
  async getReservationStatus(reservationId: string): Promise<ReservationStatus> {
    try {
      const reservation = await this.getReservation(reservationId);
      
      if (!reservation) {
        return {
          active: false,
          timeRemaining: 0,
          warningZone: false,
          canExtend: false
        };
      }
      
      const now = new Date();
      const expiresAt = new Date(reservation.expiresAt);
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      
      const active = timeRemaining > 0;
      const warningZone = timeRemaining <= RESERVATION_CONFIG.warningThreshold;
      const canExtend = active && reservation.extensionCount < RESERVATION_CONFIG.maxExtensions;
      
      return {
        active,
        timeRemaining,
        warningZone,
        canExtend,
        reservation: active ? reservation : undefined
      };
      
    } catch (error) {
      logger.error('Failed to get reservation status', { reservationId, error: error.message });
      
      return {
        active: false,
        timeRemaining: 0,
        warningZone: false,
        canExtend: false
      };
    }
  }

  /**
   * Convert reservation to actual booking
   */
  async convertToBooking(reservationId: string, bookingId: string): Promise<boolean> {
    try {
      const reservation = await this.getReservation(reservationId);
      if (!reservation) {
        logger.warn('Attempted to convert non-existent reservation', { reservationId, bookingId });
        return false;
      }
      
      // Update reservation to link with booking
      const updatedReservation: SlotReservation = {
        ...reservation,
        bookingId,
        metadata: {
          ...reservation.metadata,
          convertedAt: new Date().toISOString()
        }
      };
      
      // Update reservation record (but don't change expiration)
      const reservationKey = this.getReservationKey(reservationId);
      const currentTtl = await redis.ttl(reservationKey);
      
      if (currentTtl > 0) {
        await redis.setex(reservationKey, currentTtl, JSON.stringify(updatedReservation));
      }
      
      logger.info('Reservation converted to booking', { reservationId, bookingId });
      return true;
      
    } catch (error) {
      logger.error('Failed to convert reservation to booking', { 
        reservationId, 
        bookingId, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Release a reservation manually
   */
  async releaseReservation(reservationId: string): Promise<boolean> {
    try {
      const reservation = await this.getReservation(reservationId);
      if (!reservation) {
        return true; // Already released or expired
      }
      
      // Remove all related keys
      const slotKey = this.getSlotKey(reservation.datetime, reservation.serviceType);
      const reservationKey = this.getReservationKey(reservationId);
      
      const keysToDelete = [slotKey, reservationKey];
      
      if (reservation.userId) {
        keysToDelete.push(this.getUserKey(reservation.userId));
      }
      
      if (reservation.customerEmail) {
        keysToDelete.push(this.getEmailKey(reservation.customerEmail));
      }
      
      await redis.del(...keysToDelete);
      
      logger.info('Reservation released', { reservationId });
      return true;
      
    } catch (error) {
      logger.error('Failed to release reservation', { reservationId, error: error.message });
      return false;
    }
  }

  /**
   * Check if a slot is available
   */
  async isSlotAvailable(datetime: string, serviceType: string): Promise<boolean> {
    try {
      const slotKey = this.getSlotKey(datetime, serviceType);
      const reservation = await redis.get(slotKey);
      return !reservation;
    } catch (error) {
      logger.error('Failed to check slot availability', { datetime, serviceType, error: error.message });
      return false; // Assume not available on error
    }
  }

  /**
   * Get user's current reservation
   */
  async getUserCurrentReservation(userId: string): Promise<SlotReservation | null> {
    try {
      const userKey = this.getUserKey(userId);
      const reservationId = await redis.get(userKey);
      
      if (!reservationId) {
        return null;
      }
      
      return await this.getReservation(reservationId);
    } catch (error) {
      logger.error('Failed to get user current reservation', { userId, error: error.message });
      return null;
    }
  }

  /**
   * Get reservation by email
   */
  async getReservationByEmail(email: string): Promise<SlotReservation | null> {
    try {
      const emailKey = this.getEmailKey(email);
      const reservationId = await redis.get(emailKey);
      
      if (!reservationId) {
        return null;
      }
      
      return await this.getReservation(reservationId);
    } catch (error) {
      logger.error('Failed to get reservation by email', { email: this.maskEmail(email), error: error.message });
      return null;
    }
  }

  /**
   * Cleanup expired reservations
   */
  async cleanupExpiredReservations(): Promise<number> {
    try {
      // This would typically be called by a background job
      const pattern = `${this.keyPrefix}*`;
      const keys = await redis.keys(pattern);
      
      let cleanedCount = 0;
      
      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl === -2) { // Key expired
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.info('Cleaned up expired reservations', { count: cleanedCount });
      }
      
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired reservations', { error: error.message });
      return 0;
    }
  }

  // Private helper methods
  private async getReservation(reservationId: string): Promise<SlotReservation | null> {
    try {
      const reservationKey = this.getReservationKey(reservationId);
      const data = await redis.get(reservationKey);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to get reservation', { reservationId, error: error.message });
      return null;
    }
  }

  private verifyReservationOwnership(
    reservation: SlotReservation, 
    userId?: string, 
    customerEmail?: string
  ): boolean {
    return !!(
      (userId && reservation.userId === userId) ||
      (customerEmail && reservation.customerEmail === customerEmail)
    );
  }

  private generateReservationId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSlotKey(datetime: string, serviceType: string): string {
    return `${this.slotKeyPrefix}${datetime}:${serviceType}`;
  }

  private getReservationKey(reservationId: string): string {
    return `${this.keyPrefix}${reservationId}`;
  }

  private getUserKey(userId: string): string {
    return `${this.userKeyPrefix}${userId}`;
  }

  private getEmailKey(email: string): string {
    return `${this.userKeyPrefix}email:${email}`;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }

  private sanitizeRequest(request: any): any {
    const sanitized = { ...request };
    if (sanitized.customerEmail) {
      sanitized.customerEmail = this.maskEmail(sanitized.customerEmail);
    }
    return sanitized;
  }

  private sanitizeExtensionRequest(request: any): any {
    const sanitized = { ...request };
    if (sanitized.customerEmail) {
      sanitized.customerEmail = this.maskEmail(sanitized.customerEmail);
    }
    return sanitized;
  }
}

// Singleton instance
export const slotReservationEngine = new SlotReservationEngine();

// Convenience functions
export async function reserveSlot(request: z.infer<typeof ReservationRequestSchema>): Promise<ReservationResult> {
  return slotReservationEngine.reserveSlot(request);
}

export async function extendReservation(request: z.infer<typeof ExtensionRequestSchema>): Promise<ReservationResult> {
  return slotReservationEngine.extendReservation(request);
}

export async function getReservationStatus(reservationId: string): Promise<ReservationStatus> {
  return slotReservationEngine.getReservationStatus(reservationId);
}

export async function isSlotAvailable(datetime: string, serviceType: string): Promise<boolean> {
  return slotReservationEngine.isSlotAvailable(datetime, serviceType);
}

export async function convertToBooking(reservationId: string, bookingId: string): Promise<boolean> {
  return slotReservationEngine.convertToBooking(reservationId, bookingId);
}

export async function releaseReservation(reservationId: string): Promise<boolean> {
  return slotReservationEngine.releaseReservation(reservationId);
}