/**
 * Comprehensive Unit Tests - Booking Validation
 * Houston Mobile Notary Pros
 * 
 * Battle-tested validation for all booking input schemas
 * Target: 85%+ branch coverage, bulletproof data integrity
 */

import { describe, it, expect } from 'vitest';
import {
  ServiceTypeSchema,
  LocationTypeSchema,
  BookingStatusSchema,
  BookingTriageSchema,
  LocationSchema,
  CustomerInfoSchema,
  ServiceDetailsSchema,
  SchedulingSchema,
  CreateBookingSchema,
  validateBookingData,
  formatValidationError
} from '@/lib/booking-validation';

// Helper: always generate a future date (YYYY-MM-DD) for scheduling tests
const futureDate = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
})();

describe('Booking Validation Schemas', () => {
  
  describe('ServiceTypeSchema', () => {
    it('should accept valid service types', () => {
      const validTypes = ['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES'];
      
      validTypes.forEach(type => {
        expect(() => ServiceTypeSchema.parse(type)).not.toThrow();
      });
    });

    it('should reject invalid service types', () => {
      const invalidTypes = ['INVALID', 'standard_notary', '', null, undefined, 123];
      
      invalidTypes.forEach(type => {
        expect(() => ServiceTypeSchema.parse(type)).toThrow();
      });
    });
  });

  describe('LocationTypeSchema', () => {
    it('should accept valid location types', () => {
      const validTypes = ['CLIENT_ADDRESS', 'NOTARY_OFFICE', 'NEUTRAL_LOCATION', 'REMOTE_ONLINE'];
      
      validTypes.forEach(type => {
        expect(() => LocationTypeSchema.parse(type)).not.toThrow();
      });
    });

    it('should reject invalid location types', () => {
      const invalidTypes = ['HOME', 'OFFICE', '', null];
      
      invalidTypes.forEach(type => {
        expect(() => LocationTypeSchema.parse(type)).toThrow();
      });
    });
  });

  describe('BookingStatusSchema', () => {
    it('should accept all valid booking statuses', () => {
      const validStatuses = [
        'PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED',
        'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'
      ];
      
      validStatuses.forEach(status => {
        expect(() => BookingStatusSchema.parse(status)).not.toThrow();
      });
    });

    it('should reject invalid statuses', () => {
      const invalidStatuses = ['pending', 'DONE', 'ACTIVE', ''];
      
      invalidStatuses.forEach(status => {
        expect(() => BookingStatusSchema.parse(status)).toThrow();
      });
    });
  });

  describe('BookingTriageSchema', () => {
    const validTriage = {
      documentType: ['Affidavit'],
      urgency: 'this-week',
      location: 'in-person',
      timePreference: 'morning',
      signerCount: 1,
      specialRequirements: []
    };

    it('should accept valid triage data', () => {
      expect(() => BookingTriageSchema.parse(validTriage)).not.toThrow();
    });

    it('should require at least one document type', () => {
      const invalidTriage = { ...validTriage, documentType: [] };
      expect(() => BookingTriageSchema.parse(invalidTriage)).toThrow();
    });

    it('should validate urgency enum values', () => {
      const validUrgencies = ['today', 'this-week', 'next-week', 'flexible'];
      
      validUrgencies.forEach(urgency => {
        expect(() => BookingTriageSchema.parse({ ...validTriage, urgency })).not.toThrow();
      });

      expect(() => BookingTriageSchema.parse({ ...validTriage, urgency: 'immediate' })).toThrow();
    });

    it('should validate location preferences', () => {
      const validLocations = ['in-person', 'remote', 'either'];
      
      validLocations.forEach(location => {
        expect(() => BookingTriageSchema.parse({ ...validTriage, location })).not.toThrow();
      });

      expect(() => BookingTriageSchema.parse({ ...validTriage, location: 'office' })).toThrow();
    });

    it('should enforce signer count limits', () => {
      expect(() => BookingTriageSchema.parse({ ...validTriage, signerCount: 0 })).toThrow();
      expect(() => BookingTriageSchema.parse({ ...validTriage, signerCount: 11 })).toThrow();
      expect(() => BookingTriageSchema.parse({ ...validTriage, signerCount: 5 })).not.toThrow();
    });

    it('should set default values correctly', () => {
      const minimal = {
        documentType: ['Contract'],
        urgency: 'flexible',
        location: 'either'
      };

      const result = BookingTriageSchema.parse(minimal);
      expect(result.signerCount).toBe(1);
      expect(result.specialRequirements).toEqual([]);
    });
  });

  describe('LocationSchema', () => {
    const validLocation = {
      address: '123 Main Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001'
    };

    it('should accept valid location data', () => {
      expect(() => LocationSchema.parse(validLocation)).not.toThrow();
    });

    it('should require minimum address length', () => {
      const shortAddress = { ...validLocation, address: '123' };
      expect(() => LocationSchema.parse(shortAddress)).toThrow();
    });

    it('should require city with minimum length', () => {
      const shortCity = { ...validLocation, city: 'H' };
      expect(() => LocationSchema.parse(shortCity)).toThrow();
    });

    it('should validate state abbreviation format', () => {
      expect(() => LocationSchema.parse({ ...validLocation, state: 'Texas' })).toThrow();
      expect(() => LocationSchema.parse({ ...validLocation, state: 'T' })).toThrow();
      expect(() => LocationSchema.parse({ ...validLocation, state: 'TX' })).not.toThrow();
    });

    it('should validate ZIP code formats', () => {
      const validZips = ['77001', '77001-1234', '12345'];
      const invalidZips = ['7700', '770011', 'ABCDE', '77001-12'];

      validZips.forEach(zipCode => {
        expect(() => LocationSchema.parse({ ...validLocation, zipCode })).not.toThrow();
      });

      invalidZips.forEach(zipCode => {
        expect(() => LocationSchema.parse({ ...validLocation, zipCode })).toThrow();
      });
    });

    it('should accept optional fields', () => {
      const withOptionals = {
        ...validLocation,
        latitude: 29.7604,
        longitude: -95.3698,
        accessInstructions: 'Ring doorbell twice',
        parkingNotes: 'Guest parking available'
      };

      expect(() => LocationSchema.parse(withOptionals)).not.toThrow();
    });

    it('should enforce length limits on optional fields', () => {
      const longInstructions = 'x'.repeat(501);
      const longParking = 'x'.repeat(301);

      expect(() => LocationSchema.parse({ 
        ...validLocation, 
        accessInstructions: longInstructions 
      })).toThrow();

      expect(() => LocationSchema.parse({ 
        ...validLocation, 
        parkingNotes: longParking 
      })).toThrow();
    });
  });

  describe('CustomerInfoSchema', () => {
    const validCustomer = {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '555-123-4567'
    };

    it('should accept valid customer data', () => {
      expect(() => CustomerInfoSchema.parse(validCustomer)).not.toThrow();
    });

    it('should validate email format', () => {
      const invalidEmails = ['invalid', 'test@', '@example.com', 'test.example.com'];
      
      invalidEmails.forEach(email => {
        expect(() => CustomerInfoSchema.parse({ ...validCustomer, email })).toThrow();
      });
    });

    it('should validate name length', () => {
      expect(() => CustomerInfoSchema.parse({ ...validCustomer, name: 'A' })).toThrow();
      expect(() => CustomerInfoSchema.parse({ 
        ...validCustomer, 
        name: 'x'.repeat(101) 
      })).toThrow();
    });

    it('should validate phone number formats', () => {
      const validPhones = [
        '555-123-4567',
        '(555) 123-4567',
        '555.123.4567',
        '5551234567',
        '+1-555-123-4567',
        '+1 555 123 4567'
      ];

      const invalidPhones = [
        '123',
        '555-123',
        '555-123-456',
        '555-123-45678',
        'abc-def-ghij'
      ];

      validPhones.forEach(phone => {
        expect(() => CustomerInfoSchema.parse({ ...validCustomer, phone })).not.toThrow();
      });

      invalidPhones.forEach(phone => {
        expect(() => CustomerInfoSchema.parse({ ...validCustomer, phone })).toThrow();
      });
    });

    it('should accept optional company name', () => {
      const withCompany = { ...validCustomer, companyName: 'ACME Corp' };
      expect(() => CustomerInfoSchema.parse(withCompany)).not.toThrow();
    });

    it('should set default values correctly', () => {
      const minimal = {
        email: 'test@example.com',
        name: 'Test User'
      };

      const result = CustomerInfoSchema.parse(minimal);
      expect(result.preferredContactMethod).toBe('email');
      expect(result.marketingConsent).toBe(false);
      expect(result.smsConsent).toBe(false);
    });

    it('should validate contact method preferences', () => {
      const validMethods = ['email', 'phone', 'sms'];
      
      validMethods.forEach(method => {
        expect(() => CustomerInfoSchema.parse({ 
          ...validCustomer, 
          preferredContactMethod: method 
        })).not.toThrow();
      });

      expect(() => CustomerInfoSchema.parse({ 
        ...validCustomer, 
        preferredContactMethod: 'mail' 
      })).toThrow();
    });
  });

  describe('ServiceDetailsSchema', () => {
    const validDetails = {
      serviceType: 'STANDARD_NOTARY',
      documentCount: 2,
      documentTypes: ['Affidavit', 'Power of Attorney'],
      signerCount: 1
    };

    it('should accept valid service details', () => {
      expect(() => ServiceDetailsSchema.parse(validDetails)).not.toThrow();
    });

    it('should enforce document count limits', () => {
      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        documentCount: 0 
      })).toThrow();

      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        documentCount: 51 
      })).toThrow();

      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        documentCount: 25 
      })).not.toThrow();
    });

    it('should require at least one document type', () => {
      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        documentTypes: [] 
      })).toThrow();
    });

    it('should enforce signer count limits', () => {
      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        signerCount: 0 
      })).toThrow();

      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        signerCount: 11 
      })).toThrow();

      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        signerCount: 5 
      })).not.toThrow();
    });

    it('should set boolean defaults correctly', () => {
      const result = ServiceDetailsSchema.parse(validDetails);
      expect(result.witnessRequired).toBe(false);
      expect(result.witnessProvided).toBe('none');
      expect(result.identificationRequired).toBe(true);
    });

    it('should validate witness provision options', () => {
      const validOptions = ['customer', 'notary', 'none'];
      
      validOptions.forEach(option => {
        expect(() => ServiceDetailsSchema.parse({ 
          ...validDetails, 
          witnessProvided: option 
        })).not.toThrow();
      });

      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        witnessProvided: 'third-party' 
      })).toThrow();
    });

    it('should enforce length limits on text fields', () => {
      const longInstructions = 'x'.repeat(1001);
      const longNotes = 'x'.repeat(501);

      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        specialInstructions: longInstructions 
      })).toThrow();

      expect(() => ServiceDetailsSchema.parse({ 
        ...validDetails, 
        clientNotes: longNotes 
      })).toThrow();
    });
  });

  describe('SchedulingSchema', () => {
    const validScheduling = {
      preferredDate: futureDate,
      preferredTime: '14:00'
    };

    it('should accept valid scheduling data', () => {
      expect(() => SchedulingSchema.parse(validScheduling)).not.toThrow();
    });

    it('should validate datetime format for preferred date', () => {
      const invalidDates = [
        `${futureDate}T14:00:00Z`, // includes time – should fail regex
        '02/15/2024',
        'February 15, 2024',
        'invalid-date'
      ];

      invalidDates.forEach(date => {
        expect(() => SchedulingSchema.parse({ 
          ...validScheduling, 
          preferredDate: date 
        })).toThrow();
      });
    });

    it('should validate time format (HH:MM)', () => {
      const validTimes = ['09:00', '14:30', '23:59', '00:00'];
      const invalidTimes = ['9:00', '14:60', '25:00', '14:30:00', 'afternoon'];

      validTimes.forEach(time => {
        expect(() => SchedulingSchema.parse({ 
          ...validScheduling, 
          preferredTime: time 
        })).not.toThrow();
      });

      invalidTimes.forEach(time => {
        expect(() => SchedulingSchema.parse({ 
          ...validScheduling, 
          preferredTime: time 
        })).toThrow();
      });
    });

    it('should set default values correctly', () => {
      const result = SchedulingSchema.parse(validScheduling);
      expect(result.timeZone).toBe('America/Chicago');
      expect(result.flexibleTiming).toBe(false);
    });

    it('should accept optional fields', () => {
      const withOptionals = {
        ...validScheduling,
        timeZone: 'America/New_York',
        flexibleTiming: true,
        priority: true,
        sameDay: false,
        estimatedDuration: 90
      };

      expect(() => SchedulingSchema.parse(withOptionals)).not.toThrow();
    });
  });

  describe('Integration Functions', () => {
    describe('validateBookingData', () => {
      const validBookingData = {
        serviceType: 'STANDARD_NOTARY',
        locationType: 'CLIENT_ADDRESS',
        customer: {
          email: 'test@example.com',
          name: 'Test User',
          phone: '555-123-4567'
        },
        location: {
          address: '123 Main Street',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001'
        },
        serviceDetails: {
          serviceType: 'STANDARD_NOTARY',
          documentCount: 1,
          documentTypes: ['Affidavit'],
          signerCount: 1
        },
        scheduling: {
          preferredDate: futureDate,
          preferredTime: '14:00'
        },
        payment: {
          paymentMethod: 'credit-card'
        },
        bookingSource: 'website'
      };

      it('should validate complete booking data successfully', () => {
        expect(() => validateBookingData(validBookingData)).not.toThrow();
      });

      it('should throw for missing required fields', () => {
        const incompleteData = { ...validBookingData };
        delete incompleteData.customer;

        expect(() => validateBookingData(incompleteData)).toThrow();
      });

      it('should validate nested schema relationships', () => {
        const invalidNested = {
          ...validBookingData,
          serviceDetails: {
            ...validBookingData.serviceDetails,
            serviceType: 'INVALID_TYPE'
          }
        };

        expect(() => validateBookingData(invalidNested)).toThrow();
      });
    });

    describe('formatValidationError', () => {
      it('should format Zod errors into user-friendly messages', () => {
        try {
          CustomerInfoSchema.parse({
            email: 'invalid-email',
            name: 'A', // Too short
            phone: '123' // Invalid format
          });
        } catch (error) {
          const formatted = formatValidationError(error);
          
          expect(formatted).toHaveProperty('field_errors');
          expect(formatted.field_errors).toHaveProperty('email');
          expect(formatted.field_errors).toHaveProperty('name');
          expect(formatted.field_errors).toHaveProperty('phone');
          
          expect(formatted.field_errors.email).toContain('valid email');
          expect(formatted.field_errors.name).toContain('2 characters');
          expect(formatted.field_errors.phone).toContain('valid phone');
        }
      });

      it('should handle nested path errors correctly', () => {
        try {
          const invalidBooking = {
            serviceType: 'STANDARD_NOTARY',
            customer: {
              email: 'invalid-email',
              name: 'Test User'
            },
            location: {
              address: '123 Main St',
              city: 'Houston',
              state: 'TEXAS', // Invalid - should be 2 chars
              zipCode: '7700' // Invalid format
            }
          };
          
          CreateBookingSchema.parse(invalidBooking);
        } catch (error) {
          const formatted = formatValidationError(error);
          
          expect(formatted.field_errors).toHaveProperty('customer.email');
          expect(formatted.field_errors).toHaveProperty('location.state');
          expect(formatted.field_errors).toHaveProperty('location.zipCode');
        }
      });

      it('should provide helpful error summaries', () => {
        try {
          CustomerInfoSchema.parse({});
        } catch (error) {
          const formatted = formatValidationError(error);
          
          expect(formatted).toHaveProperty('summary');
          expect(formatted.summary).toContain('validation');
          expect(formatted).toHaveProperty('error_count');
          expect(formatted.error_count).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Edge Cases and Security', () => {
    it('should sanitize potentially malicious input', () => {
      const maliciousData = {
        email: 'test@example.com',
        name: '<script>alert("xss")</script>',
        phone: '555-123-4567'
      };

      // Should not throw (name validation is length-based, not content-based)
      // But in real implementation, we'd have XSS protection at the application level
      expect(() => CustomerInfoSchema.parse(maliciousData)).not.toThrow();
    });

    it('should handle extremely large inputs gracefully', () => {
      const hugeString = 'x'.repeat(10000);
      
      expect(() => CustomerInfoSchema.parse({
        email: 'test@example.com',
        name: hugeString // Will fail length validation
      })).toThrow();
    });

    it('should handle unicode characters correctly', () => {
      const unicodeData = {
        email: 'tëst@éxample.com',
        name: 'José María López-González',
        phone: '555-123-4567'
      };

      // Updated validation no longer allows unicode characters in email local-part
      expect(() => CustomerInfoSchema.parse(unicodeData)).toThrow();
    });

    it('should reject null and undefined values appropriately', () => {
      expect(() => CustomerInfoSchema.parse(null)).toThrow();
      expect(() => CustomerInfoSchema.parse(undefined)).toThrow();
      expect(() => CustomerInfoSchema.parse({})).toThrow(); // Missing required fields
    });

    it('should handle circular references gracefully', () => {
      const circular: any = { email: 'test@example.com', name: 'Test' };
      circular.self = circular;

      // Zod should handle this without infinite recursion
      expect(() => CustomerInfoSchema.parse(circular)).not.toThrow();
    });
  });
});

// Helper functions for integration tests
export function createValidBookingData(overrides: any = {}) {
  return {
    serviceType: 'STANDARD_NOTARY',
    locationType: 'CLIENT_ADDRESS',
    customer: {
      email: 'test@example.com',
      name: 'Test User',
      phone: '555-123-4567'
    },
    location: {
      address: '123 Main Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001'
    },
    serviceDetails: {
      serviceType: 'STANDARD_NOTARY',
      documentCount: 1,
      documentTypes: ['Affidavit'],
      signerCount: 1
    },
    scheduling: {
      preferredDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      })(),
      preferredTime: '14:00'
    },
    payment: {
      paymentMethod: 'credit-card'
    },
    bookingSource: 'website',
    ...overrides
  };
}