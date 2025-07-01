/**
 * Enhanced Pricing Engine for Houston Mobile Notary Pros
 * Implements SOP_ENHANCED.md comprehensive pricing structure
 * 
 * SOP Pricing Requirements:
 * - Standard Notary: $75 (9am-5pm Mon-Fri, up to 2 docs, 1-2 signers, 15-mile travel)
 * - Extended Hours: $100 (7am-9pm Daily, up to 5 docs, 2 signers, 20-mile travel)  
 * - Loan Signing Specialist: $150 flat (unlimited docs, up to 4 signers, 90-min session)
 * - Additional signers: $5 each (Standard/Extended), $10 each (Loan beyond 4)
 * - Weekend surcharge: $40
 * - After-hours (outside Extended Hours): $30 surcharge + 24hr notice
 * - Travel Fee: $0.50/mile beyond primary service area
 */

import { EnhancedDistanceCalculator } from '@/lib/maps/distance-calculator';
import { logger } from '@/lib/logger';

// SOP Pricing Constants
const PRICING_CONFIG = {
  // Base Service Prices
  STANDARD_NOTARY: 75,
  EXTENDED_HOURS_PRICE: 100,
  LOAN_SIGNING: 150,
  
  // Signer Fees
  ADDITIONAL_SIGNER_STANDARD: 5,
  ADDITIONAL_SIGNER_LOAN: 10,
  
  // Time-based Surcharges
  WEEKEND_SURCHARGE: 40,
  AFTER_HOURS_SURCHARGE: 30,
  
  // Service Limits
  STANDARD_MAX_DOCS: 2,
  STANDARD_MAX_SIGNERS: 2,
  EXTENDED_MAX_DOCS: 5,
  EXTENDED_MAX_SIGNERS: 2,
  LOAN_MAX_SIGNERS_FREE: 4,
  
  // Business Hours (24-hour format)
  STANDARD_HOURS: {
    start: 9,  // 9 AM
    end: 17,   // 5 PM
    weekdays: [1, 2, 3, 4, 5] // Mon-Fri
  },
  EXTENDED_HOURS: {
    start: 7,  // 7 AM
    end: 21,   // 9 PM
    weekdays: [0, 1, 2, 3, 4, 5, 6] // All days
  }
} as const;

export interface ServiceDetails {
  id: string;
  type: 'STANDARD_NOTARY' | 'EXTENDED_HOURS_NOTARY' | 'LOAN_SIGNING_SPECIALIST' | 'BUSINESS_SOLUTIONS';
  name: string;
  basePrice: number;
  duration: number;
  maxDocuments?: number;
  maxSigners?: number;
}

export interface BookingInputs {
  serviceType: string;
  numberOfSigners: number;
  numberOfDocuments: number;
  appointmentDateTime: Date;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  isUrgent?: boolean;
  promoCode?: string;
  referralDiscount?: number;
}

export interface PricingBreakdown {
  basePrice: number;
  signerFees: {
    includedSigners: number;
    additionalSigners: number;
    additionalSignerFee: number;
    totalSignerFees: number;
  };
  timeSurcharges: {
    isWeekend: boolean;
    isAfterHours: boolean;
    weekendSurcharge: number;
    afterHoursSurcharge: number;
    totalTimeSurcharges: number;
  };
  locationFees: {
    distance: number;
    travelFee: number;
    isWithinServiceArea: boolean;
  };
  discounts: {
    promoCodeDiscount: number;
    referralDiscount: number;
    totalDiscounts: number;
  };
  subtotal: number;
  tax: number;
  total: number;
  depositRequired: boolean;
  depositAmount: number;
  balanceDue: number;
}

export interface PricingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  blockingIssues: string[];
}

export interface EnhancedPricingResult {
  success: boolean;
  pricing: PricingBreakdown;
  validation: PricingValidation;
  serviceDetails: ServiceDetails;
  metadata: {
    calculatedAt: string;
    requestId: string;
    version: string;
  };
}

export class EnhancedPricingEngine {
  private static readonly VERSION = '2.0.0';

  /**
   * Calculate comprehensive pricing with SOP compliance
   */
  static async calculatePricing(inputs: BookingInputs): Promise<EnhancedPricingResult> {
    const requestId = `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      logger.info('Starting enhanced pricing calculation', 'PRICING', {
        serviceType: inputs.serviceType,
        signers: inputs.numberOfSigners,
        requestId
      });

      // Get service details
      const serviceDetails = this.getServiceDetails(inputs.serviceType);
      
      // Validate inputs
      const validation = await this.validateInputs(inputs, serviceDetails);
      if (!validation.isValid && validation.blockingIssues.length > 0) {
        return {
          success: false,
          pricing: this.getEmptyPricing(),
          validation,
          serviceDetails,
          metadata: {
            calculatedAt: new Date().toISOString(),
            requestId,
            version: this.VERSION
          }
        };
      }

      // Calculate distance and travel fees
      const fullAddress = `${inputs.location.address}, ${inputs.location.city}, ${inputs.location.state} ${inputs.location.zip}`;
      const distanceResult = await EnhancedDistanceCalculator.calculateDistanceAndValidate(
        fullAddress,
        inputs.serviceType
      );

      // Build pricing breakdown
      const pricing = await this.buildPricingBreakdown(inputs, serviceDetails, distanceResult);
      
      const duration = Date.now() - startTime;
      logger.info('Enhanced pricing calculation completed', 'PRICING', {
        requestId,
        duration: `${duration}ms`,
        total: pricing.total,
        travelFee: pricing.locationFees.travelFee
      });

      return {
        success: true,
        pricing,
        validation,
        serviceDetails,
        metadata: {
          calculatedAt: new Date().toISOString(),
          requestId,
          version: this.VERSION
        }
      };

    } catch (error) {
      logger.error('Enhanced pricing calculation failed', 'PRICING', error as Error, {
        serviceType: inputs.serviceType,
        requestId
      });
      
      return {
        success: false,
        pricing: this.getEmptyPricing(),
        validation: {
          isValid: false,
          errors: ['Pricing calculation failed'],
          warnings: [],
          recommendations: [],
          blockingIssues: ['Unable to calculate pricing at this time']
        },
        serviceDetails: this.getServiceDetails(inputs.serviceType),
        metadata: {
          calculatedAt: new Date().toISOString(),
          requestId,
          version: this.VERSION
        }
      };
    }
  }

  /**
   * Get service details based on service type
   */
  private static getServiceDetails(serviceType: string): ServiceDetails {
    switch (serviceType) {
      case 'STANDARD_NOTARY':
        return {
          id: 'standard-notary',
          type: 'STANDARD_NOTARY',
          name: 'Standard Mobile Notary',
          basePrice: PRICING_CONFIG.STANDARD_NOTARY,
          duration: 90,
          maxDocuments: PRICING_CONFIG.STANDARD_MAX_DOCS,
          maxSigners: PRICING_CONFIG.STANDARD_MAX_SIGNERS
        };
      case 'EXTENDED_HOURS_NOTARY':
        return {
          id: 'extended-hours',
          type: 'EXTENDED_HOURS_NOTARY',
          name: 'Extended Hours Notary',
          basePrice: PRICING_CONFIG.EXTENDED_HOURS_PRICE,
          duration: 90,
          maxDocuments: PRICING_CONFIG.EXTENDED_MAX_DOCS,
          maxSigners: PRICING_CONFIG.EXTENDED_MAX_SIGNERS
        };
      case 'LOAN_SIGNING_SPECIALIST':
        return {
          id: 'loan-signing',
          type: 'LOAN_SIGNING_SPECIALIST',
          name: 'Loan Signing Specialist',
          basePrice: PRICING_CONFIG.LOAN_SIGNING,
          duration: 180
        };
      case 'BUSINESS_SOLUTIONS':
        return {
          id: 'business-solutions',
          type: 'BUSINESS_SOLUTIONS',
          name: 'Business Document Solutions',
          basePrice: PRICING_CONFIG.EXTENDED_HOURS_PRICE,
          duration: 120
        };
      default:
        return {
          id: 'standard-notary',
          type: 'STANDARD_NOTARY',
          name: 'Standard Mobile Notary',
          basePrice: PRICING_CONFIG.STANDARD_NOTARY,
          duration: 90
        };
    }
  }

  /**
   * Validate booking inputs against SOP requirements
   */
  private static async validateInputs(inputs: BookingInputs, serviceDetails: ServiceDetails): Promise<PricingValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const blockingIssues: string[] = [];

    // Service-specific validations
    if (serviceDetails.maxDocuments && inputs.numberOfDocuments > serviceDetails.maxDocuments) {
      errors.push(`${serviceDetails.name} service is limited to ${serviceDetails.maxDocuments} documents`);
      recommendations.push('Consider Extended Hours or Loan Signing service for more documents');
    }

    if (serviceDetails.maxSigners && inputs.numberOfSigners > serviceDetails.maxSigners) {
      if (serviceDetails.type === 'STANDARD_NOTARY' || serviceDetails.type === 'EXTENDED_HOURS_NOTARY') {
        // Additional signers allowed with fees
        warnings.push(`Additional signer fees will apply for ${inputs.numberOfSigners - serviceDetails.maxSigners} extra signers`);
      } else {
        errors.push(`${serviceDetails.name} service is limited to ${serviceDetails.maxSigners} signers`);
      }
    }

    // Time validations
    const timeValidation = this.validateAppointmentTime(inputs.appointmentDateTime, serviceDetails.type);
    if (!timeValidation.isValid) {
      errors.push(...timeValidation.errors);
      warnings.push(...timeValidation.warnings);
      recommendations.push(...timeValidation.recommendations);
    }

    // Location validation
    try {
      const fullAddress = `${inputs.location.address}, ${inputs.location.city}, ${inputs.location.state} ${inputs.location.zip}`;
      const locationValidation = await EnhancedDistanceCalculator.validateServiceArea(
        fullAddress,
        inputs.serviceType
      );
      
      if (!locationValidation.isAllowed) {
        blockingIssues.push(...locationValidation.blockingReasons);
      } else {
        warnings.push(...locationValidation.warnings);
        recommendations.push(...locationValidation.recommendations);
      }
    } catch (error) {
      warnings.push('Unable to validate service area - manual review may be required');
    }

    return {
      isValid: errors.length === 0 && blockingIssues.length === 0,
      errors,
      warnings,
      recommendations,
      blockingIssues
    };
  }

  /**
   * Validate appointment time against service hours
   */
  private static validateAppointmentTime(appointmentDateTime: Date, serviceType: string) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const dayOfWeek = appointmentDateTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = appointmentDateTime.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    switch (serviceType) {
      case 'STANDARD_NOTARY':
        if (isWeekend) {
          warnings.push('Weekend surcharge applies for Standard Notary services');
        }
        if (hour < PRICING_CONFIG.STANDARD_HOURS.start || hour >= PRICING_CONFIG.STANDARD_HOURS.end) {
          errors.push('Standard Notary services are only available 9 AM - 5 PM on weekdays');
          recommendations.push('Consider Extended Hours service for evening/weekend appointments');
        }
        break;

      case 'EXTENDED_HOURS_NOTARY':
        if (isWeekend) {
          warnings.push('Weekend surcharge applies for Extended Hours services');
        }
        if (hour < PRICING_CONFIG.EXTENDED_HOURS.start || hour >= PRICING_CONFIG.EXTENDED_HOURS.end) {
          warnings.push('After-hours surcharge applies outside 7 AM - 9 PM');
          recommendations.push('24-hour advance notice required for after-hours appointments');
        }
        break;

      case 'LOAN_SIGNING_SPECIALIST':
        if (isWeekend) {
          warnings.push('Weekend surcharge applies for Loan Signing services');
        }
        if (hour < 8 || hour >= 20) {
          warnings.push('Late hours may require additional coordination with title companies');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Build comprehensive pricing breakdown
   */
  private static async buildPricingBreakdown(
    inputs: BookingInputs,
    serviceDetails: ServiceDetails,
    distanceResult: any
  ): Promise<PricingBreakdown> {
    const basePrice = serviceDetails.basePrice;

    // Calculate signer fees
    const includedSigners = serviceDetails.maxSigners || 
      (serviceDetails.type === 'LOAN_SIGNING_SPECIALIST' ? PRICING_CONFIG.LOAN_MAX_SIGNERS_FREE : 1);
    const additionalSigners = Math.max(0, inputs.numberOfSigners - includedSigners);
    const additionalSignerFee = serviceDetails.type === 'LOAN_SIGNING_SPECIALIST' 
      ? PRICING_CONFIG.ADDITIONAL_SIGNER_LOAN 
      : PRICING_CONFIG.ADDITIONAL_SIGNER_STANDARD;
    const totalSignerFees = additionalSigners * additionalSignerFee;

    // Calculate time surcharges
    const isWeekend = this.isWeekend(inputs.appointmentDateTime);
    const isAfterHours = this.isAfterHours(inputs.appointmentDateTime, serviceDetails.type);
    const weekendSurcharge = isWeekend ? PRICING_CONFIG.WEEKEND_SURCHARGE : 0;
    const afterHoursSurcharge = isAfterHours ? PRICING_CONFIG.AFTER_HOURS_SURCHARGE : 0;
    const totalTimeSurcharges = weekendSurcharge + afterHoursSurcharge;

    // Location fees from distance calculation
    const travelFee = distanceResult.pricing.travelFee;

    // Calculate discounts
    const promoCodeDiscount = await this.calculatePromoDiscount(inputs.promoCode, basePrice);
    const referralDiscount = inputs.referralDiscount || 0;
    const totalDiscounts = promoCodeDiscount + referralDiscount;

    // Calculate totals
    const subtotal = basePrice + totalSignerFees + totalTimeSurcharges + travelFee - totalDiscounts;
    const tax = 0; // Notary services are typically not taxed in Texas
    const total = subtotal + tax;

    // Deposit calculation
    const depositRequired = total > 100;
    const depositAmount = depositRequired ? Math.round(total * 0.5) : 0;
    const balanceDue = total - depositAmount;

    return {
      basePrice,
      signerFees: {
        includedSigners,
        additionalSigners,
        additionalSignerFee,
        totalSignerFees
      },
      timeSurcharges: {
        isWeekend,
        isAfterHours,
        weekendSurcharge,
        afterHoursSurcharge,
        totalTimeSurcharges
      },
      locationFees: {
        distance: distanceResult.distance.miles,
        travelFee,
        isWithinServiceArea: distanceResult.serviceArea.isWithinStandardArea || distanceResult.serviceArea.isWithinExtendedArea
      },
      discounts: {
        promoCodeDiscount,
        referralDiscount,
        totalDiscounts
      },
      subtotal,
      tax,
      total,
      depositRequired,
      depositAmount,
      balanceDue
    };
  }

  /**
   * Check if appointment is on weekend
   */
  private static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  /**
   * Check if appointment is after hours for service type
   */
  private static isAfterHours(date: Date, serviceType: string): boolean {
    const hour = date.getHours();
    
    switch (serviceType) {
      case 'STANDARD_NOTARY':
        return hour < PRICING_CONFIG.STANDARD_HOURS.start || hour >= PRICING_CONFIG.STANDARD_HOURS.end;
      case 'EXTENDED_HOURS_NOTARY':
      case 'BUSINESS_SOLUTIONS':
        return hour < PRICING_CONFIG.EXTENDED_HOURS.start || hour >= PRICING_CONFIG.EXTENDED_HOURS.end;
      case 'LOAN_SIGNING_SPECIALIST':
        return hour < 8 || hour >= 20; // Loan signings have more flexible hours
      default:
        return false;
    }
  }

  /**
   * Calculate promo code discount
   */
  private static async calculatePromoDiscount(promoCode?: string, basePrice?: number): Promise<number> {
    if (!promoCode || !basePrice) return 0;
    
    // TODO: Integrate with promo code validation system
    // For now, return 0 until promo system is implemented
    return 0;
  }

  /**
   * Get empty pricing structure for error cases
   */
  private static getEmptyPricing(): PricingBreakdown {
    return {
      basePrice: 0,
      signerFees: {
        includedSigners: 0,
        additionalSigners: 0,
        additionalSignerFee: 0,
        totalSignerFees: 0
      },
      timeSurcharges: {
        isWeekend: false,
        isAfterHours: false,
        weekendSurcharge: 0,
        afterHoursSurcharge: 0,
        totalTimeSurcharges: 0
      },
      locationFees: {
        distance: 0,
        travelFee: 0,
        isWithinServiceArea: false
      },
      discounts: {
        promoCodeDiscount: 0,
        referralDiscount: 0,
        totalDiscounts: 0
      },
      subtotal: 0,
      tax: 0,
      total: 0,
      depositRequired: false,
      depositAmount: 0,
      balanceDue: 0
    };
  }
}

export default EnhancedPricingEngine;