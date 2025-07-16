/**
 * Comprehensive Unit Tests - Slot Reservation Engine
 * Houston Mobile Notary Pros
 * 
 * Battle-tested coverage for slot locking, urgency mechanisms, and conflict resolution
 * Target: 85%+ branch coverage, bulletproof booking conflicts prevention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SlotReservationEngine } from '@/lib/slot-reservation';
import type { SlotReservation, ReservationResult, ReservationStatus } from '@/lib/slot-reservation';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  keys: vi.fn(),
  scan: vi.fn(),
  multi: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    setex: vi.fn().mockReturnThis(),
    del: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(['OK', 1, 1])
  }))
};

vi.mock('@/lib/redis', () => ({
  redis: mockRedis
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

import { logger } from '@/lib/logger';
const mockedLogger = vi.mocked(logger);

describe('SlotReservationEngine', () => {
  let engine: SlotReservationEngine;
  
  beforeEach(() => {
    vi.clearAllMocks();
    engine = new SlotReservationEngine();
    
    // Default mock responses
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.setex.mockResolvedValue('OK');
    mockRedis.del.mockResolvedValue(1);
    mockRedis.exists.mockResolvedValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Slot Reservation Creation', () => {
    const validRequest = {
      datetime: '2024-02-15T14:00:00Z',
      serviceType: 'STANDARD_NOTARY' as const,
      customerEmail: 'test@example.com',
      estimatedDuration: 60
    };

    it('should create a new slot reservation successfully', async () => {
      mockRedis.get.mockResolvedValue(null); // No existing reservation
      
      const result = await engine.reserveSlot(validRequest);
      
      expect(result.success).toBe(true);
      expect(result.reservation).toBeDefined();
      expect(result.reservation?.datetime).toBe(validRequest.datetime);
      expect(result.reservation?.serviceType).toBe(validRequest.serviceType);
      expect(result.reservation?.customerEmail).toBe(validRequest.customerEmail);
      expect(result.reservation?.estimatedDuration).toBe(validRequest.estimatedDuration);
      expect(result.reservation?.id).toBeDefined();
      expect(result.reservation?.expiresAt).toBeDefined();
      
      // Should set Redis keys
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('slot_hold:'),
        expect.any(Number),
        expect.any(String)
      );
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('slot_reservation:'),
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should reject reservation if slot is already taken', async () => {
      const existingReservation = {
        id: 'existing-id',
        datetime: validRequest.datetime,
        serviceType: validRequest.serviceType,
        customerEmail: 'other@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 900000).toISOString(), // 15 min from now
        extended: false,
        extensionCount: 0
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(existingReservation));
      
      const result = await engine.reserveSlot(validRequest);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already reserved');
      expect(result.conflictingReservation).toBeDefined();
      
      // Should not create new reservation
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should validate request parameters', async () => {
      const invalidRequests = [
        { ...validRequest, datetime: 'invalid-date' },
        { ...validRequest, serviceType: 'INVALID_SERVICE' as any },
        { ...validRequest, customerEmail: 'invalid-email' },
        { ...validRequest, estimatedDuration: 0 },
        { ...validRequest, estimatedDuration: 200 }
      ];

      for (const invalidRequest of invalidRequests) {
        await expect(engine.reserveSlot(invalidRequest)).rejects.toThrow();
      }
    });

    it('should set correct expiration time', async () => {
      const result = await engine.reserveSlot(validRequest);
      
      expect(result.success).toBe(true);
      
      const reservedAt = new Date(result.reservation!.reservedAt);
      const expiresAt = new Date(result.reservation!.expiresAt);
      const duration = expiresAt.getTime() - reservedAt.getTime();
      
      // Should be approximately 15 minutes (900000 ms)
      expect(duration).toBeCloseTo(900000, -3); // Allow 1 second tolerance
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection error'));
      
      const result = await engine.reserveSlot(validRequest);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
      expect(mockedLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to reserve slot'),
        expect.any(Object)
      );
    });

    it('should include user association when userId provided', async () => {
      const requestWithUser = { ...validRequest, userId: 'user-123' };
      
      const result = await engine.reserveSlot(requestWithUser);
      
      expect(result.success).toBe(true);
      expect(result.reservation?.userId).toBe('user-123');
      
      // Should set user key
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('user_reservation:user-123'),
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should include metadata when provided', async () => {
      const metadata = { bookingSource: 'website', ipAddress: '127.0.0.1' };
      const requestWithMetadata = { ...validRequest, metadata };
      
      const result = await engine.reserveSlot(requestWithMetadata);
      
      expect(result.success).toBe(true);
      expect(result.reservation?.metadata).toEqual(metadata);
    });
  });

  describe('Slot Reservation Retrieval', () => {
    const mockReservation: SlotReservation = {
      id: 'test-reservation-id',
      datetime: '2024-02-15T14:00:00Z',
      serviceType: 'STANDARD_NOTARY',
      customerEmail: 'test@example.com',
      estimatedDuration: 60,
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 900000).toISOString(), // 15 min from now
      extended: false,
      extensionCount: 0
    };

    it('should retrieve existing reservation successfully', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(mockReservation));
      
      const result = await engine.getReservation('test-reservation-id');
      
      expect(result).toEqual(mockReservation);
      expect(mockRedis.get).toHaveBeenCalledWith('slot_reservation:test-reservation-id');
    });

    it('should return null for non-existent reservation', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const result = await engine.getReservation('non-existent-id');
      
      expect(result).toBeNull();
    });

    it('should handle malformed reservation data', async () => {
      mockRedis.get.mockResolvedValue('invalid-json');
      
      const result = await engine.getReservation('test-reservation-id');
      
      expect(result).toBeNull();
      expect(mockedLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse reservation'),
        expect.any(Object)
      );
    });
  });

  describe('Reservation Status Checking', () => {
    it('should return active status for valid reservation', async () => {
      const activeReservation = {
        id: 'test-id',
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'test@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 600000).toISOString(), // 10 min from now
        extended: false,
        extensionCount: 0
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(activeReservation));
      
      const status = await engine.getReservationStatus('test-id');
      
      expect(status.active).toBe(true);
      expect(status.timeRemaining).toBeCloseTo(600, -1); // ~600 seconds
      expect(status.warningZone).toBe(false); // More than 5 minutes left
      expect(status.canExtend).toBe(true);
      expect(status.reservation).toEqual(activeReservation);
    });

    it('should detect warning zone correctly', async () => {
      const warningReservation = {
        id: 'test-id',
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'test@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 240000).toISOString(), // 4 min from now
        extended: false,
        extensionCount: 0
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(warningReservation));
      
      const status = await engine.getReservationStatus('test-id');
      
      expect(status.active).toBe(true);
      expect(status.warningZone).toBe(true); // Less than 5 minutes left
      expect(status.canExtend).toBe(true);
    });

    it('should detect expired reservations', async () => {
      const expiredReservation = {
        id: 'test-id',
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'test@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 60000).toISOString(), // 1 min ago
        extended: false,
        extensionCount: 0
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(expiredReservation));
      
      const status = await engine.getReservationStatus('test-id');
      
      expect(status.active).toBe(false);
      expect(status.timeRemaining).toBe(0);
      expect(status.canExtend).toBe(false);
    });

    it('should prevent extension when already extended', async () => {
      const extendedReservation = {
        id: 'test-id',
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'test@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 min from now
        extended: true,
        extensionCount: 1
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(extendedReservation));
      
      const status = await engine.getReservationStatus('test-id');
      
      expect(status.canExtend).toBe(false); // Already extended once
    });

    it('should return inactive status for non-existent reservation', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const status = await engine.getReservationStatus('non-existent-id');
      
      expect(status.active).toBe(false);
      expect(status.timeRemaining).toBe(0);
      expect(status.warningZone).toBe(false);
      expect(status.canExtend).toBe(false);
      expect(status.reservation).toBeUndefined();
    });
  });

  describe('Reservation Extension', () => {
    const extendableReservation = {
      id: 'test-id',
      datetime: '2024-02-15T14:00:00Z',
      serviceType: 'STANDARD_NOTARY',
      customerEmail: 'test@example.com',
      estimatedDuration: 60,
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 240000).toISOString(), // 4 min from now
      extended: false,
      extensionCount: 0
    };

    it('should extend reservation successfully', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(extendableReservation));
      
      const result = await engine.extendReservation({
        reservationId: 'test-id',
        customerEmail: 'test@example.com'
      });
      
      expect(result.success).toBe(true);
      expect(result.reservation?.extended).toBe(true);
      expect(result.reservation?.extensionCount).toBe(1);
      
      const originalExpiry = new Date(extendableReservation.expiresAt);
      const newExpiry = new Date(result.reservation!.expiresAt);
      const extensionDuration = newExpiry.getTime() - originalExpiry.getTime();
      
      // Should be approximately 5 minutes (300000 ms)
      expect(extensionDuration).toBeCloseTo(300000, -3);
    });

    it('should reject extension if already extended', async () => {
      const alreadyExtended = { ...extendableReservation, extended: true, extensionCount: 1 };
      mockRedis.get.mockResolvedValue(JSON.stringify(alreadyExtended));
      
      const result = await engine.extendReservation({
        reservationId: 'test-id',
        customerEmail: 'test@example.com'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already extended');
    });

    it('should reject extension if reservation expired', async () => {
      const expiredReservation = {
        ...extendableReservation,
        expiresAt: new Date(Date.now() - 60000).toISOString() // 1 min ago
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(expiredReservation));
      
      const result = await engine.extendReservation({
        reservationId: 'test-id',
        customerEmail: 'test@example.com'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject extension for non-existent reservation', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const result = await engine.extendReservation({
        reservationId: 'non-existent-id',
        customerEmail: 'test@example.com'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should validate customer email for extension', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(extendableReservation));
      
      const result = await engine.extendReservation({
        reservationId: 'test-id',
        customerEmail: 'wrong@example.com' // Wrong email
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not authorized');
    });

    it('should validate extension request parameters', async () => {
      const invalidRequests = [
        { reservationId: '', customerEmail: 'test@example.com' },
        { reservationId: 'test-id', customerEmail: 'invalid-email' },
        { reservationId: 'test-id', customerEmail: 'test@example.com', reason: 'x'.repeat(201) }
      ];

      for (const invalidRequest of invalidRequests) {
        await expect(engine.extendReservation(invalidRequest)).rejects.toThrow();
      }
    });
  });

  describe('Reservation Cancellation', () => {
    const activeReservation = {
      id: 'test-id',
      datetime: '2024-02-15T14:00:00Z',
      serviceType: 'STANDARD_NOTARY',
      customerEmail: 'test@example.com',
      estimatedDuration: 60,
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      extended: false,
      extensionCount: 0
    };

    it('should cancel reservation successfully', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(activeReservation));
      
      const result = await engine.cancelReservation('test-id');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('cancelled');
      
      // Should delete Redis keys
      expect(mockRedis.del).toHaveBeenCalledWith('slot_reservation:test-id');
      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('slot_hold:')
      );
    });

    it('should handle cancellation of non-existent reservation', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const result = await engine.cancelReservation('non-existent-id');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should clean up user association keys', async () => {
      const reservationWithUser = { ...activeReservation, userId: 'user-123' };
      mockRedis.get.mockResolvedValue(JSON.stringify(reservationWithUser));
      
      const result = await engine.cancelReservation('test-id');
      
      expect(result.success).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('user_reservation:user-123');
    });
  });

  describe('Booking Conversion', () => {
    const activeReservation = {
      id: 'test-id',
      datetime: '2024-02-15T14:00:00Z',
      serviceType: 'STANDARD_NOTARY',
      customerEmail: 'test@example.com',
      estimatedDuration: 60,
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      extended: false,
      extensionCount: 0
    };

    it('should convert reservation to booking successfully', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify(activeReservation));
      
      const result = await engine.convertToBooking('test-id', 'booking-123');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('converted');
      
      // Should update reservation with booking ID
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'slot_reservation:test-id',
        expect.any(Number),
        expect.stringContaining('"bookingId":"booking-123"')
      );
    });

    it('should reject conversion of expired reservation', async () => {
      const expiredReservation = {
        ...activeReservation,
        expiresAt: new Date(Date.now() - 60000).toISOString()
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(expiredReservation));
      
      const result = await engine.convertToBooking('test-id', 'booking-123');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject conversion if already converted', async () => {
      const convertedReservation = { ...activeReservation, bookingId: 'existing-booking' };
      mockRedis.get.mockResolvedValue(JSON.stringify(convertedReservation));
      
      const result = await engine.convertToBooking('test-id', 'booking-123');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already converted');
    });
  });

  describe('Cleanup Operations', () => {
    it('should clean up expired reservations', async () => {
      const expiredKeys = [
        'slot_reservation:expired-1',
        'slot_reservation:expired-2'
      ];
      
      const expiredReservation = {
        id: 'expired-1',
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'test@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
        extended: false,
        extensionCount: 0
      };

      mockRedis.scan.mockResolvedValue(['0', expiredKeys]);
      mockRedis.get.mockResolvedValue(JSON.stringify(expiredReservation));
      
      const cleanedCount = await engine.cleanupExpiredReservations();
      
      expect(cleanedCount).toBe(2);
      expect(mockRedis.del).toHaveBeenCalledTimes(4); // 2 reservations * 2 keys each
    });

    it('should handle cleanup errors gracefully', async () => {
      mockRedis.scan.mockRejectedValue(new Error('Redis scan error'));
      
      const cleanedCount = await engine.cleanupExpiredReservations();
      
      expect(cleanedCount).toBe(0);
      expect(mockedLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to cleanup expired reservations'),
        expect.any(Object)
      );
    });
  });

  describe('Conflict Detection', () => {
    it('should detect slot conflicts correctly', async () => {
      const conflictingReservation = {
        id: 'existing-id',
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'other@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 900000).toISOString(),
        extended: false,
        extensionCount: 0
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(conflictingReservation));
      
      const hasConflict = await engine.hasSlotConflict('2024-02-15T14:00:00Z', 'STANDARD_NOTARY');
      
      expect(hasConflict).toBe(true);
    });

    it('should allow reservations when no conflicts exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      
      const hasConflict = await engine.hasSlotConflict('2024-02-15T14:00:00Z', 'STANDARD_NOTARY');
      
      expect(hasConflict).toBe(false);
    });

    it('should ignore expired reservations in conflict detection', async () => {
      const expiredReservation = {
        id: 'expired-id',
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'test@example.com',
        estimatedDuration: 60,
        reservedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
        extended: false,
        extensionCount: 0
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(expiredReservation));
      
      const hasConflict = await engine.hasSlotConflict('2024-02-15T14:00:00Z', 'STANDARD_NOTARY');
      
      expect(hasConflict).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent reservation attempts', async () => {
      const request = {
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY' as const,
        customerEmail: 'test@example.com',
        estimatedDuration: 60
      };

      // Simulate race condition where second call sees existing reservation
      mockRedis.get
        .mockResolvedValueOnce(null) // First call sees no reservation
        .mockResolvedValueOnce(JSON.stringify({ // Second call sees existing
          id: 'first-reservation',
          datetime: request.datetime,
          serviceType: request.serviceType,
          customerEmail: 'other@example.com',
          estimatedDuration: 60,
          reservedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 900000).toISOString(),
          extended: false,
          extensionCount: 0
        }));

      const [result1, result2] = await Promise.all([
        engine.reserveSlot(request),
        engine.reserveSlot(request)
      ]);

      // One should succeed, one should fail due to conflict
      const results = [result1, result2];
      expect(results.some(r => r.success)).toBe(true);
      expect(results.some(r => !r.success)).toBe(true);
    });

    it('should handle malformed datetime inputs', async () => {
      const invalidRequest = {
        datetime: 'not-a-date',
        serviceType: 'STANDARD_NOTARY' as const,
        customerEmail: 'test@example.com',
        estimatedDuration: 60
      };

      await expect(engine.reserveSlot(invalidRequest)).rejects.toThrow();
    });

    it('should generate unique reservation IDs', async () => {
      const ids = new Set();
      
      for (let i = 0; i < 100; i++) {
        const id = engine['generateReservationId'](); // Access private method for testing
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
      
      expect(ids.size).toBe(100);
    });

    it('should handle Redis connection failures gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection lost'));
      
      const result = await engine.reserveSlot({
        datetime: '2024-02-15T14:00:00Z',
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'test@example.com',
        estimatedDuration: 60
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
    });
  });
});

// Helper functions for integration tests
export function createMockReservation(overrides: Partial<SlotReservation> = {}): SlotReservation {
  return {
    id: 'test-reservation-id',
    datetime: '2024-02-15T14:00:00Z',
    serviceType: 'STANDARD_NOTARY',
    customerEmail: 'test@example.com',
    estimatedDuration: 60,
    reservedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 900000).toISOString(),
    extended: false,
    extensionCount: 0,
    ...overrides
  };
}

export function createValidReservationRequest(overrides: any = {}) {
  return {
    datetime: '2024-02-15T14:00:00Z',
    serviceType: 'STANDARD_NOTARY' as const,
    customerEmail: 'test@example.com',
    estimatedDuration: 60,
    ...overrides
  };
}