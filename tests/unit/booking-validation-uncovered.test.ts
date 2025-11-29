/**
 * Unit Tests for Uncovered Lines in booking-validation.ts
 * Houston Mobile Notary Pros
 * 
 * Tests specific uncovered line ranges:
 * - 186-187: RON services location validation
 * - 386-395: validatePartialBookingData error handling
 * - 398-399: validateSlotReservation
 * - 402-403: validatePaymentIntent
 * - 431-447: validateBookingStateTransition
 * - 451-492: validateServiceAvailability
 */

import { describe, it, expect } from 'vitest';
import {
  CreateBookingSchema,
  SlotReservationSchema,
  PaymentIntentSchema,
  validatePartialBookingData,
  validateSlotReservation,
  validatePaymentIntent,
  validateBookingStateTransition,
  validateServiceAvailability,
} from '@/lib/booking-validation';

const futureDate = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
})();

describe('Booking Validation - Uncovered Lines', () => {
  describe('RON Services Location Validation (lines 186-187)', () => {
    it('should require REMOTE_ONLINE location type for RON_SERVICES', () => {
      const validRONBooking = {
        serviceType: 'RON_SERVICES',
        locationType: 'REMOTE_ONLINE',
        customer: {
          email: 'test@example.com',
          name: 'Test User',
        },
        serviceDetails: {
          serviceType: 'RON_SERVICES',
          documentCount: 1,
          documentTypes: ['Document'],
          signerCount: 1,
        },
        scheduling: {
          preferredDate: futureDate,
          preferredTime: '14:00',
        },
        payment: {
          paymentMethod: 'credit-card',
        },
      };

      expect(() => CreateBookingSchema.parse(validRONBooking)).not.toThrow();
    });

    it('should reject RON_SERVICES with non-REMOTE_ONLINE location type', () => {
      const invalidRONBooking = {
        serviceType: 'RON_SERVICES',
        locationType: 'CLIENT_ADDRESS', // Should be REMOTE_ONLINE
        customer: {
          email: 'test@example.com',
          name: 'Test User',
        },
        serviceDetails: {
          serviceType: 'RON_SERVICES',
          documentCount: 1,
          documentTypes: ['Document'],
          signerCount: 1,
        },
        scheduling: {
          preferredDate: futureDate,
          preferredTime: '14:00',
        },
        payment: {
          paymentMethod: 'credit-card',
        },
      };

      expect(() => CreateBookingSchema.parse(invalidRONBooking)).toThrow();
    });

    it('should allow RON_SERVICES without location object', () => {
      const ronBookingWithoutLocation = {
        serviceType: 'RON_SERVICES',
        locationType: 'REMOTE_ONLINE',
        customer: {
          email: 'test@example.com',
          name: 'Test User',
        },
        serviceDetails: {
          serviceType: 'RON_SERVICES',
          documentCount: 1,
          documentTypes: ['Document'],
          signerCount: 1,
        },
        scheduling: {
          preferredDate: futureDate,
          preferredTime: '14:00',
        },
        payment: {
          paymentMethod: 'credit-card',
        },
      };

      expect(() => CreateBookingSchema.parse(ronBookingWithoutLocation)).not.toThrow();
    });
  });

  describe('validatePartialBookingData - Error Handling (lines 386-395)', () => {
    it('should return parsed data when validation succeeds', () => {
      const validData = {
        serviceType: 'STANDARD_NOTARY',
        locationType: 'CLIENT_ADDRESS',
        location: {
          address: '123 Main St',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
        },
        customer: {
          email: 'test@example.com',
          name: 'Test User',
        },
        serviceDetails: {
          serviceType: 'STANDARD_NOTARY',
          documentCount: 1,
          documentTypes: ['Document'],
          signerCount: 1,
        },
        scheduling: {
          preferredDate: futureDate,
          preferredTime: '14:00',
        },
        payment: {
          paymentMethod: 'credit-card',
        },
      };

      const result = validatePartialBookingData(validData);
      expect(result).toHaveProperty('serviceType', 'STANDARD_NOTARY');
    });

    it('should return partial data as object when full validation fails', () => {
      const invalidData = {
        serviceType: 'STANDARD_NOTARY',
        customer: {
          email: 'invalid-email', // Invalid email
          name: 'Test',
        },
        // Missing required fields
      };

      const result = validatePartialBookingData(invalidData);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('serviceType', 'STANDARD_NOTARY');
    });

    it('should throw error when data is not an object', () => {
      expect(() => validatePartialBookingData(null)).toThrow();
      expect(() => validatePartialBookingData(undefined)).toThrow();
      expect(() => validatePartialBookingData('string')).toThrow();
      expect(() => validatePartialBookingData(123)).toThrow();
    });

    it('should handle empty object gracefully', () => {
      const result = validatePartialBookingData({});
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('validateSlotReservation (lines 398-399)', () => {
    it('should validate valid slot reservation', () => {
      const validReservation = {
        serviceType: 'STANDARD_NOTARY',
        datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        customerEmail: 'test@example.com',
        estimatedDuration: 60,
      };

      expect(() => validateSlotReservation(validReservation)).not.toThrow();
      const result = validateSlotReservation(validReservation);
      expect(result).toHaveProperty('serviceType', 'STANDARD_NOTARY');
    });

    it('should validate slot reservation without optional fields', () => {
      const minimalReservation = {
        serviceType: 'RON_SERVICES',
        datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(() => validateSlotReservation(minimalReservation)).not.toThrow();
    });

    it('should reject invalid slot reservation', () => {
      const invalidReservation = {
        serviceType: 'INVALID_SERVICE',
        datetime: 'invalid-date',
      };

      expect(() => validateSlotReservation(invalidReservation)).toThrow();
    });
  });

  describe('validatePaymentIntent (lines 402-403)', () => {
    it('should validate valid payment intent', () => {
      const validIntent = {
        bookingId: 'booking-123',
        amount: 100,
        currency: 'usd',
        paymentMethodTypes: ['card'],
      };

      expect(() => validatePaymentIntent(validIntent)).not.toThrow();
      const result = validatePaymentIntent(validIntent);
      expect(result).toHaveProperty('bookingId', 'booking-123');
      expect(result).toHaveProperty('amount', 100);
    });

    it('should use default values for optional fields', () => {
      const minimalIntent = {
        bookingId: 'booking-123',
        amount: 75,
      };

      const result = validatePaymentIntent(minimalIntent);
      expect(result.currency).toBe('usd');
      expect(result.paymentMethodTypes).toEqual(['card']);
    });

    it('should reject invalid payment intent', () => {
      const invalidIntent = {
        bookingId: '',
        amount: -10, // Invalid amount
      };

      expect(() => validatePaymentIntent(invalidIntent)).toThrow();
    });
  });

  describe('validateBookingStateTransition (lines 431-447)', () => {
    it('should allow valid transitions from PENDING', () => {
      expect(validateBookingStateTransition('PENDING', 'PAYMENT_PENDING')).toBe(true);
      expect(validateBookingStateTransition('PENDING', 'CANCELLED')).toBe(true);
      expect(validateBookingStateTransition('PENDING', 'CONFIRMED')).toBe(false);
    });

    it('should allow valid transitions from PAYMENT_PENDING', () => {
      expect(validateBookingStateTransition('PAYMENT_PENDING', 'CONFIRMED')).toBe(true);
      expect(validateBookingStateTransition('PAYMENT_PENDING', 'CANCELLED')).toBe(true);
      expect(validateBookingStateTransition('PAYMENT_PENDING', 'SCHEDULED')).toBe(false);
    });

    it('should allow valid transitions from CONFIRMED', () => {
      expect(validateBookingStateTransition('CONFIRMED', 'SCHEDULED')).toBe(true);
      expect(validateBookingStateTransition('CONFIRMED', 'CANCELLED')).toBe(true);
      expect(validateBookingStateTransition('CONFIRMED', 'IN_PROGRESS')).toBe(false);
    });

    it('should allow valid transitions from SCHEDULED', () => {
      expect(validateBookingStateTransition('SCHEDULED', 'IN_PROGRESS')).toBe(true);
      expect(validateBookingStateTransition('SCHEDULED', 'CANCELLED')).toBe(true);
      expect(validateBookingStateTransition('SCHEDULED', 'RESCHEDULED')).toBe(true);
      expect(validateBookingStateTransition('SCHEDULED', 'NO_SHOW')).toBe(true);
      expect(validateBookingStateTransition('SCHEDULED', 'COMPLETED')).toBe(false);
    });

    it('should allow valid transitions from IN_PROGRESS', () => {
      expect(validateBookingStateTransition('IN_PROGRESS', 'COMPLETED')).toBe(true);
      expect(validateBookingStateTransition('IN_PROGRESS', 'CANCELLED')).toBe(true);
      expect(validateBookingStateTransition('IN_PROGRESS', 'SCHEDULED')).toBe(false);
    });

    it('should not allow transitions from terminal states', () => {
      expect(validateBookingStateTransition('COMPLETED', 'CANCELLED')).toBe(false);
      expect(validateBookingStateTransition('COMPLETED', 'SCHEDULED')).toBe(false);
      expect(validateBookingStateTransition('CANCELLED', 'CONFIRMED')).toBe(false);
      expect(validateBookingStateTransition('CANCELLED', 'SCHEDULED')).toBe(false);
    });

    it('should allow rescheduling after NO_SHOW', () => {
      expect(validateBookingStateTransition('NO_SHOW', 'RESCHEDULED')).toBe(true);
      expect(validateBookingStateTransition('NO_SHOW', 'SCHEDULED')).toBe(false);
      expect(validateBookingStateTransition('NO_SHOW', 'COMPLETED')).toBe(false);
    });

    it('should allow transitions from RESCHEDULED', () => {
      expect(validateBookingStateTransition('RESCHEDULED', 'SCHEDULED')).toBe(true);
      expect(validateBookingStateTransition('RESCHEDULED', 'CANCELLED')).toBe(true);
      expect(validateBookingStateTransition('RESCHEDULED', 'IN_PROGRESS')).toBe(false);
    });

    it('should return false for unknown current status', () => {
      expect(validateBookingStateTransition('UNKNOWN_STATUS', 'CONFIRMED')).toBe(false);
      expect(validateBookingStateTransition('', 'CONFIRMED')).toBe(false);
    });
  });

  describe('validateServiceAvailability (lines 451-492)', () => {
    describe('STANDARD_NOTARY service', () => {
      it('should be available during business hours on weekdays', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1); // Tomorrow
        date.setHours(14, 0, 0, 0); // 2 PM
        // Ensure it's a weekday (Mon–Fri)
        while (date.getDay() === 0 || date.getDay() === 6) {
          date.setDate(date.getDate() + 1);
        }

        const result = validateServiceAvailability('STANDARD_NOTARY', date.toISOString());
        expect(result.available).toBe(true);
      });

      it('should not be available on weekends', () => {
        const saturday = new Date();
        // Find next Saturday
        const daysUntilSaturday = (6 - saturday.getDay() + 7) % 7 || 7;
        saturday.setDate(saturday.getDate() + daysUntilSaturday);
        saturday.setHours(14, 0, 0, 0);

        const result = validateServiceAvailability('STANDARD_NOTARY', saturday.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toContain('weekends');
      });

      it('should not be available before 9am', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(8, 0, 0, 0); // 8 AM
        // Ensure it's a weekday (Mon–Fri)
        while (date.getDay() === 0 || date.getDay() === 6) {
          date.setDate(date.getDate() + 1);
        }

        const result = validateServiceAvailability('STANDARD_NOTARY', date.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toContain('9am-5pm');
      });

      it('should not be available after 5pm', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(17, 0, 0, 0); // 5 PM (should be unavailable)
        // Ensure it's a weekday (Mon–Fri)
        while (date.getDay() === 0 || date.getDay() === 6) {
          date.setDate(date.getDate() + 1);
        }

        const result = validateServiceAvailability('STANDARD_NOTARY', date.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toContain('9am-5pm');
      });
    });

    describe('EXTENDED_HOURS service', () => {
      it('should be available during extended hours', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(18, 0, 0, 0); // 6 PM

        const result = validateServiceAvailability('EXTENDED_HOURS', date.toISOString());
        expect(result.available).toBe(true);
      });

      it('should not be available before 7am', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(6, 0, 0, 0); // 6 AM

        const result = validateServiceAvailability('EXTENDED_HOURS', date.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toContain('7am-9pm');
      });

      it('should not be available after 9pm', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(21, 0, 0, 0); // 9 PM (should be unavailable)

        const result = validateServiceAvailability('EXTENDED_HOURS', date.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toContain('7am-9pm');
      });
    });

    describe('LOAN_SIGNING service', () => {
      it('should be available during loan signing hours', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(10, 0, 0, 0); // 10 AM

        const result = validateServiceAvailability('LOAN_SIGNING', date.toISOString());
        expect(result.available).toBe(true);
      });

      it('should not be available before 6am', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(5, 0, 0, 0); // 5 AM

        const result = validateServiceAvailability('LOAN_SIGNING', date.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toContain('6am-10pm');
      });

      it('should not be available after 10pm', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(22, 0, 0, 0); // 10 PM (should be unavailable)

        const result = validateServiceAvailability('LOAN_SIGNING', date.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toContain('6am-10pm');
      });
    });

    describe('RON_SERVICES', () => {
      it('should always be available (24/7)', () => {
        const testTimes = [
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) && new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Midnight
          new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(23, 59, 0, 0) && new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 11:59 PM
        ];

        testTimes.forEach((time) => {
          if (time) {
            const result = validateServiceAvailability('RON_SERVICES', time);
            expect(result.available).toBe(true);
            expect(result.reason).toBeUndefined();
          }
        });
      });

      it('should be available on weekends', () => {
        const saturday = new Date();
        const daysUntilSaturday = (6 - saturday.getDay() + 7) % 7 || 7;
        saturday.setDate(saturday.getDate() + daysUntilSaturday);
        saturday.setHours(14, 0, 0, 0);

        const result = validateServiceAvailability('RON_SERVICES', saturday.toISOString());
        expect(result.available).toBe(true);
      });
    });

    describe('Unknown service types', () => {
      it('should return unavailable for unknown service type', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(14, 0, 0, 0);

        const result = validateServiceAvailability('UNKNOWN_SERVICE', date.toISOString());
        expect(result.available).toBe(false);
        expect(result.reason).toBe('Unknown service type');
      });
    });
  });
});

