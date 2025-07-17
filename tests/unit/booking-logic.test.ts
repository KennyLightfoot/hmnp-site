import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addDays, format, isAfter, isBefore } from 'date-fns';

// Freeze timers to allow deterministic date testing across environments
vi.useFakeTimers();

/**
 * Unit Tests for Critical Booking Business Logic
 * 
 * Tests core business rules for booking system including:
 * - Pricing calculations
 * - Availability validation
 * - Booking constraints
 * - Payment validation
 */

// Mock implementations for testing
const mockPrisma = {
  booking: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  service: {
    findUnique: vi.fn(),
  },
  availability: {
    findMany: vi.fn(),
  },
};

// Import or define the functions we're testing
// These would normally come from your business logic modules
interface BookingData {
  serviceId: string;
  scheduledDateTime: Date;
  location: {
    address: string;
    city: string;
    zipCode: string;
  };
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  additionalServices?: string[];
  promoCode?: string;
}

interface Service {
  id: string;
  name: string;
  basePrice: number;
  durationMinutes: number; // in minutes
  category: string;
  isActive: boolean;
}

interface PricingCalculation {
  basePrice: number;
  travelFee: number;
  additionalServicesFee: number;
  discount: number;
  totalPrice: number;
  breakdown: {
    service: number;
    travel: number;
    additional: number;
    discount: number;
  };
}

// Business logic functions to test
class BookingService {
  static calculateTravelFee(distance: number): number {
    const perMileRate = 0.50; // SOP: $0.50 per mile beyond service radius
    const freeRadius = 15; // SOP: 15-mile standard service radius from ZIP 77591
    
    if (distance <= freeRadius) {
      return 0;
    }
    
    const chargeableMiles = distance - freeRadius;
    return chargeableMiles * perMileRate; // No base fee, just per-mile beyond radius
  }

  static calculatePricing(
    service: Service,
    distance: number,
    additionalServices: string[] = [],
    promoCode?: string
  ): PricingCalculation {
    const price = service.basePrice;
    const travelFee = this.calculateTravelFee(distance);
    
    // Additional services pricing
    const additionalServicePrices: Record<string, number> = {
      'witness': 25,
      'copy_certification': 5,
      'journal_entry': 10,
      'same_day_service': 50,
      'evening_weekend': 25,
    };
    
    const additionalServicesFee = additionalServices.reduce(
      (total, service) => total + (additionalServicePrices[service] || 0),
      0
    );
    
    // Promo code discounts
    const promoDiscounts: Record<string, number> = {
      'FIRST20': 0.20, // 20% off
      'SENIOR15': 0.15, // 15% off
      'REPEAT10': 0.10, // 10% off
    };
    
    const discountRate = promoCode ? (promoDiscounts[promoCode] || 0) : 0;
    const subtotal = price + travelFee + additionalServicesFee;
    const discount = subtotal * discountRate;
    const totalPrice = subtotal - discount;
    
    return {
      basePrice: price,
      travelFee,
      additionalServicesFee,
      discount,
      totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      breakdown: {
        service: price,
        travel: travelFee,
        additional: additionalServicesFee,
        discount: discount,
      }
    };
  }

  static validateBookingTime(scheduledDateTime: Date): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const now = new Date();
    const businessHours = {
      start: 8, // 8 AM
      end: 18,  // 6 PM
    };
    
    // Must be at least 2 hours in the future
    const minAdvanceTime = addDays(now, 0);
    minAdvanceTime.setHours(now.getHours() + 2);
    
    if (isBefore(scheduledDateTime, minAdvanceTime)) {
      errors.push('Booking must be at least 2 hours in advance');
    }
    
    // Must be within business hours
    const hour = scheduledDateTime.getHours();
    if (hour < businessHours.start || hour >= businessHours.end) {
      errors.push(`Appointments must be between ${businessHours.start}:00 AM and ${businessHours.end}:00 PM`);
    }
    
    // No bookings on Sundays
    if (scheduledDateTime.getDay() === 0) {
      errors.push('Sunday appointments are not available');
    }
    
    // Must be within next 90 days
    const maxAdvanceDate = addDays(now, 90);
    if (isAfter(scheduledDateTime, maxAdvanceDate)) {
      errors.push('Bookings cannot be made more than 90 days in advance');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateBookingData(data: BookingData): {
    isValid: boolean;
    errors: Record<string, string[]>;
  } {
    const errors: Record<string, string[]> = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.clientInfo.email || !emailRegex.test(data.clientInfo.email)) {
      errors.email = ['Please provide a valid email address'];
    }
    
    // Phone validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!data.clientInfo.phone || !phoneRegex.test(data.clientInfo.phone)) {
      errors.phone = ['Please provide a valid phone number'];
    }
    
    // Name validation
    if (!data.clientInfo.firstName?.trim()) {
      errors.firstName = ['First name is required'];
    }
    
    if (!data.clientInfo.lastName?.trim()) {
      errors.lastName = ['Last name is required'];
    }
    
    // Address validation
    if (!data.location.address?.trim()) {
      errors.address = ['Address is required'];
    }
    
    if (!data.location.zipCode?.match(/^\d{5}(-\d{4})?$/)) {
      errors.zipCode = ['Please provide a valid ZIP code'];
    }
    
    // Service validation
    if (!data.serviceId) {
      errors.service = ['Please select a service'];
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

describe('BookingService', () => {
  describe('calculateTravelFee', () => {
    it('should return 0 for distances within free radius', () => {
      expect(BookingService.calculateTravelFee(5)).toBe(0);
      expect(BookingService.calculateTravelFee(10)).toBe(0);
      expect(BookingService.calculateTravelFee(15)).toBe(0); // SOP: 15-mile free radius
    });

    it('should calculate correct travel fee for distances beyond free radius', () => {
      // SOP: 16 miles: 1 chargeable mile = 1 * $0.50 = $0.50
      expect(BookingService.calculateTravelFee(16)).toBe(0.50);
      
      // SOP: 20 miles: 5 chargeable miles = 5 * $0.50 = $2.50
      expect(BookingService.calculateTravelFee(20)).toBe(2.50);
      
      // SOP: 25 miles: 10 chargeable miles = 10 * $0.50 = $5.00
      expect(BookingService.calculateTravelFee(25)).toBe(5.00);
    });

    it('should handle edge cases', () => {
      expect(BookingService.calculateTravelFee(0)).toBe(0);
      // SOP: 15.1 miles: 0.1 chargeable miles = 0.1 * $0.50 = $0.05
      expect(BookingService.calculateTravelFee(15.1)).toBeCloseTo(0.05);
    });
  });

  describe('calculatePricing', () => {
    const mockService: Service = {
      id: '1',
      name: 'Standard Notary Services',
      basePrice: 75,
      durationMinutes: 60,
      category: 'standard-notary',
      isActive: true,
    };

    it('should calculate base pricing correctly', () => {
      const pricing = BookingService.calculatePricing(mockService, 5); // Within free radius
      
      expect(pricing.basePrice).toBe(75);
      expect(pricing.travelFee).toBe(0);
      expect(pricing.additionalServicesFee).toBe(0);
      expect(pricing.discount).toBe(0);
      expect(pricing.totalPrice).toBe(75);
    });

    it('should include travel fee for distant locations', () => {
      const pricing = BookingService.calculatePricing(mockService, 20); // 5 miles beyond 15-mile free radius
      
      expect(pricing.basePrice).toBe(75);
      expect(pricing.travelFee).toBe(2.50); // SOP: 5 miles * $0.50 = $2.50
      expect(pricing.totalPrice).toBe(77.50); // $75 + $2.50
    });

    it('should calculate additional services correctly', () => {
      const additionalServices = ['witness', 'copy_certification'];
      const pricing = BookingService.calculatePricing(mockService, 5, additionalServices);
      
      expect(pricing.additionalServicesFee).toBe(30); // 25 + 5
      expect(pricing.totalPrice).toBe(105); // 75 + 0 + 30
    });

    it('should apply promo code discounts correctly', () => {
      const pricing = BookingService.calculatePricing(mockService, 5, [], 'FIRST20');
      
      expect(pricing.discount).toBe(15); // 20% of $75
      expect(pricing.totalPrice).toBe(60); // $75 - $15
    });

    it('should combine all pricing components', () => {
      const additionalServices = ['witness', 'same_day_service'];
      const pricing = BookingService.calculatePricing(mockService, 20, additionalServices, 'SENIOR15'); // 20 miles = 5 miles beyond free radius
      
      const expectedSubtotal = 75 + 2.50 + 75; // base + travel (5 * $0.50) + additional services
      const expectedDiscount = expectedSubtotal * 0.15; // 15% senior discount
      const expectedTotal = expectedSubtotal - expectedDiscount;
      
      expect(pricing.totalPrice).toBe(Math.round(expectedTotal * 100) / 100);
    });

    it('should handle invalid promo codes', () => {
      const pricing = BookingService.calculatePricing(mockService, 5, [], 'INVALID');
      
      expect(pricing.discount).toBe(0);
      expect(pricing.totalPrice).toBe(75);
    });
  });

  describe('validateBookingTime', () => {
    beforeEach(() => {
      // Mock current time as Tuesday 10:00 AM
      vi.setSystemTime(new Date('2024-02-13T10:00:00Z'));
    });

    it('should accept valid booking times', () => {
      const validTime = new Date('2024-02-13T14:00:00Z'); // Today 2:00 PM (4+ hours advance)
      const validation = BookingService.validateBookingTime(validTime);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject bookings with insufficient advance notice', () => {
      const tooSoon = new Date('2024-02-13T11:00:00Z'); // Only 1 hour advance
      const validation = BookingService.validateBookingTime(tooSoon);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Booking must be at least 2 hours in advance');
    });

    it('should reject bookings outside business hours', () => {
      const tooEarly = new Date(2024, 1, 14, 6, 0, 0); // 6:00 AM local next day
      const tooLate = new Date(2024, 1, 14, 23, 0, 0); // 11:00 PM local next day (outside business hrs)
      
      expect(BookingService.validateBookingTime(tooEarly).isValid).toBe(false);
      expect(BookingService.validateBookingTime(tooLate).isValid).toBe(false);
    });

    it('should reject Sunday bookings', () => {
      const sunday = new Date('2024-02-18T14:00:00Z'); // Sunday 2:00 PM
      const validation = BookingService.validateBookingTime(sunday);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Sunday appointments are not available');
    });

    it('should reject bookings too far in advance', () => {
      const tooFar = new Date('2024-05-20T14:00:00Z'); // More than 90 days
      const validation = BookingService.validateBookingTime(tooFar);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Bookings cannot be made more than 90 days in advance');
    });
  });

  describe('validateBookingData', () => {
    const validBookingData: BookingData = {
      serviceId: 'service-1',
      scheduledDateTime: new Date('2024-02-15T14:00:00Z'),
      location: {
        address: '123 Main St',
        city: 'Houston',
        zipCode: '77001',
      },
      clientInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
      },
    };

    it('should accept valid booking data', () => {
      const validation = BookingService.validateBookingData(validBookingData);
      
      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    it('should reject invalid email addresses', () => {
      const invalidData = {
        ...validBookingData,
        clientInfo: {
          ...validBookingData.clientInfo,
          email: 'invalid-email',
        },
      };
      
      const validation = BookingService.validateBookingData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.email).toContain('Please provide a valid email address');
    });

    it('should reject invalid phone numbers', () => {
      const invalidData = {
        ...validBookingData,
        clientInfo: {
          ...validBookingData.clientInfo,
          phone: '123',
        },
      };
      
      const validation = BookingService.validateBookingData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.phone).toContain('Please provide a valid phone number');
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        ...validBookingData,
        clientInfo: {
          ...validBookingData.clientInfo,
          firstName: '',
          lastName: '',
        },
        location: {
          ...validBookingData.location,
          address: '',
        },
        serviceId: '',
      };
      
      const validation = BookingService.validateBookingData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.firstName).toContain('First name is required');
      expect(validation.errors.lastName).toContain('Last name is required');
      expect(validation.errors.address).toContain('Address is required');
      expect(validation.errors.service).toContain('Please select a service');
    });

    it('should validate ZIP codes correctly', () => {
      const invalidZip = {
        ...validBookingData,
        location: {
          ...validBookingData.location,
          zipCode: '123',
        },
      };
      
      const validation = BookingService.validateBookingData(invalidZip);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.zipCode).toContain('Please provide a valid ZIP code');
    });

    it('should accept extended ZIP codes', () => {
      const extendedZip = {
        ...validBookingData,
        location: {
          ...validBookingData.location,
          zipCode: '77001-1234',
        },
      };
      
      const validation = BookingService.validateBookingData(extendedZip);
      
      expect(validation.isValid).toBe(true);
    });
  });
});

// Additional tests for edge cases and error scenarios
describe('Booking Edge Cases', () => {
  it('should handle null/undefined inputs gracefully', () => {
    expect(() => BookingService.calculateTravelFee(null as any)).not.toThrow();
    expect(() => BookingService.calculateTravelFee(undefined as any)).not.toThrow();
  });

  it('should handle extreme values', () => {
    expect(BookingService.calculateTravelFee(1000)).toBeGreaterThan(0);
    expect(BookingService.calculateTravelFee(-5)).toBe(0); // Negative distance should be 0
  });

  it('should round pricing calculations correctly', () => {
    const service: Service = {
      id: '1',
      name: 'Test Service',
      basePrice: 33.33,
      durationMinutes: 60,
      category: 'test',
      isActive: true,
    };
    
    const pricing = BookingService.calculatePricing(service, 11.7, [], 'FIRST20');
    
    // Should round to 2 decimal places
    expect(pricing.totalPrice.toString()).not.toMatch(/\.\d{3,}/);
  });
});

// Mock service data for testing
const mockService = {
  id: 'service-1',
  name: 'Standard Notary Services',  // SOP: was likely 'Essential Service'
  serviceType: 'standard-notary',     // SOP: was likely "standard-notary"
  price: 75.00,
  basePrice: 75.00,
  durationMinutes: 90,
  category: 'standard',
  isActive: true,
};

// Mock promo codes for testing
const mockPromoCodes = {
  'WELCOME10': { discount: 0.10, maxDiscount: 50 },
  'SENIOR15': { discount: 0.15, maxDiscount: 100 },
  'SAVE25': { discount: 25, minAmount: 100 },
}; 