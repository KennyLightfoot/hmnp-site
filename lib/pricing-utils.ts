import { PrismaClient, Service, PromoCode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PricingCalculation {
  price: number;
  discount: number;
  finalPrice: number;
  depositAmount: number;
  totalDue: number;
  currency: string;
  breakdown: {
    servicePrice: number;
    promoDiscount: number;
    depositRequired: boolean;
    paymentRequired: boolean;
  };
}

export interface PromoCodeInfo {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  discount: number;
}

export class PricingUtils {
  private static readonly CURRENCY = 'USD';
  private static readonly CENTS_MULTIPLIER = 100;

  /**
   * Calculate comprehensive pricing for a service with optional promo code
   */
  static calculateServicePricing(
    Service: Service,
    promoCode?: PromoCode | null
  ): PricingCalculation {
    const price = Number(service.price);
    const depositAmount = service.requiresDeposit ? Number(service.depositAmount) : 0;

    let discount = 0;
    let promoDiscount = 0;

    // Calculate promo code discount
    if (promoCode && promoCode.isActive) {
      const now = new Date();
      const validFrom = new Date(promoCode.validFrom);
      const validUntil = promoCode.validUntil ? new Date(promoCode.validUntil) : null;

      // Check if promo code is currently valid
      if (now >= validFrom && (!validUntil || now <= validUntil)) {
        if (promoCode.discountType === 'PERCENTAGE') {
          promoDiscount = (price * Number(promoCode.discountValue)) / 100;
        } else if (promoCode.discountType === 'FIXED_AMOUNT') {
          promoDiscount = Number(promoCode.discountValue);
        }

        // Apply minimum amount check
        if (promoCode.minimumAmount && price < Number(promoCode.minimumAmount)) {
          promoDiscount = 0;
        }

        // Apply maximum discount limit
        if (promoCode.maxDiscountAmount && promoDiscount > Number(promoCode.maxDiscountAmount)) {
          promoDiscount = Number(promoCode.maxDiscountAmount);
        }

        discount = promoDiscount;
      }
    }

    const finalPrice = Math.max(0, price - discount);
    const totalDue = service.requiresDeposit ? depositAmount : finalPrice;

    return {
      price,
      discount,
      finalPrice,
      depositAmount,
      totalDue,
      currency: this.CURRENCY,
      breakdown: {
        servicePrice: price,
        promoDiscount,
        depositRequired: service.requiresDeposit,
        paymentRequired: totalDue > 0,
      }
    };
  }

  /**
   * Convert dollar amount to cents (for Stripe)
   */
  static toCents(amount: number | Decimal): number {
    const numAmount = typeof amount === 'number' ? amount : Number(amount);
    return Math.round(numAmount * this.CENTS_MULTIPLIER);
  }

  /**
   * Convert cents to dollars (from Stripe)
   */
  static fromCents(cents: number): number {
    return Math.round((cents / this.CENTS_MULTIPLIER) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format amount as currency string
   */
  static formatCurrency(amount: number | Decimal, currency: string = 'USD'): string {
    const numAmount = typeof amount === 'number' ? amount : Number(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(numAmount);
  }

  /**
   * Validate and normalize amount (ensure non-negative, round to 2 decimals)
   */
  static normalizeAmount(amount: number | string | Decimal): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    return Math.round(numAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  static calculateRefund(
    originalAmount: number | Decimal,
    hoursUntilAppointment: number,
    cancellationPolicy?: {
      fullRefundHours?: number;
      partialRefundHours?: number;
      partialRefundPercentage?: number;
    }
  ): {
    refundAmount: number;
    refundPercentage: number;
    cancellationFee: number;
    explanation: string;
  } {
    const amount = this.normalizeAmount(originalAmount);
    const policy = {
      fullRefundHours: 24,
      partialRefundHours: 4,
      partialRefundPercentage: 50,
      ...cancellationPolicy
    };

    let refundPercentage = 0;
    let explanation = '';

    if (hoursUntilAppointment >= policy.fullRefundHours) {
      refundPercentage = 100;
      explanation = `Full refund (cancelled ${hoursUntilAppointment}+ hours in advance)`;
    } else if (hoursUntilAppointment >= policy.partialRefundHours) {
      refundPercentage = policy.partialRefundPercentage;
      explanation = `${refundPercentage}% refund (cancelled ${hoursUntilAppointment} hours in advance)`;
    } else {
      refundPercentage = 0;
      explanation = `No refund (cancelled less than ${policy.partialRefundHours} hours in advance)`;
    }

    const refundAmount = Math.round(amount * (refundPercentage / 100) * 100) / 100;
    const cancellationFee = amount - refundAmount;

    return {
      refundAmount,
      refundPercentage,
      cancellationFee,
      explanation
    };
  }

  /**
   * Calculate promo code discount with validation
   */
  static calculatePromoDiscount(
    baseAmount: number,
    promoCode: PromoCode
  ): PromoCodeInfo & { discount: number; finalAmount: number } {
    const amount = this.normalizeAmount(baseAmount);
    let discount = 0;

    if (promoCode.discountType === 'PERCENTAGE') {
      discount = (amount * Number(promoCode.discountValue)) / 100;
    } else if (promoCode.discountType === 'FIXED_AMOUNT') {
      discount = Number(promoCode.discountValue);
    }

    // Apply constraints
    if (promoCode.minimumAmount && amount < Number(promoCode.minimumAmount)) {
      discount = 0;
    }

    if (promoCode.maxDiscountAmount && discount > Number(promoCode.maxDiscountAmount)) {
      discount = Number(promoCode.maxDiscountAmount);
    }

    // Ensure discount doesn't exceed the amount
    discount = Math.min(discount, amount);
    const finalAmount = Math.max(0, amount - discount);

    return {
      id: promoCode.id,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: Number(promoCode.discountValue),
      discount: this.normalizeAmount(discount),
      finalAmount: this.normalizeAmount(finalAmount)
    };
  }

  /**
   * Get consistent payment amount for booking
   * Returns the amount that should be charged (deposit if required, otherwise full price)
   */
  static getPaymentAmount(pricing: PricingCalculation): number {
    if (pricing.breakdown.depositRequired && pricing.depositAmount > 0) {
      return pricing.depositAmount;
    }
    return pricing.finalPrice;
  }

  /**
   * Validate that amounts are consistent across booking, payment, and Stripe
   */
  static validateAmountConsistency(data: {
    bookingAmount?: number | Decimal;
    paymentAmount?: number | Decimal;
    stripeAmount?: number; // in cents
    expectedAmount: number; // in dollars
  }): {
    isValid: boolean;
    errors: string[];
    normalizedAmounts: {
      booking?: number;
      payment?: number;
      stripe?: number; // in dollars
      expected: number;
    };
  } {
    const errors: string[] = [];
    const normalizedAmounts: any = {
      expected: this.normalizeAmount(data.expectedAmount)
    };

    try {
      // Normalize all amounts to dollars
      if (data.bookingAmount !== undefined) {
        normalizedAmounts.booking = this.normalizeAmount(data.bookingAmount);
      }

      if (data.paymentAmount !== undefined) {
        normalizedAmounts.payment = this.normalizeAmount(data.paymentAmount);
      }

      if (data.stripeAmount !== undefined) {
        normalizedAmounts.stripe = this.fromCents(data.stripeAmount);
      }

      // Check consistency
      const tolerance = 0.01; // 1 cent tolerance for rounding

      if (normalizedAmounts.booking !== undefined) {
        if (Math.abs(normalizedAmounts.booking - normalizedAmounts.expected) > tolerance) {
          errors.push(`Booking amount ${normalizedAmounts.booking} does not match expected ${normalizedAmounts.expected}`);
        }
      }

      if (normalizedAmounts.payment !== undefined) {
        if (Math.abs(normalizedAmounts.payment - normalizedAmounts.expected) > tolerance) {
          errors.push(`Payment amount ${normalizedAmounts.payment} does not match expected ${normalizedAmounts.expected}`);
        }
      }

      if (normalizedAmounts.stripe !== undefined) {
        if (Math.abs(normalizedAmounts.stripe - normalizedAmounts.expected) > tolerance) {
          errors.push(`Stripe amount ${normalizedAmounts.stripe} does not match expected ${normalizedAmounts.expected}`);
        }
      }

    } catch (error) {
      errors.push(`Amount validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedAmounts
    };
  }

  /**
   * Helper to get booking amount consistently
   */
  static getBookingAmount(booking: {
    priceAtBooking?: Decimal | null;
    depositAmount?: Decimal | null;
    service?: { requiresDeposit: boolean; depositAmount: Decimal };
  }): number {
    if (!booking.priceAtBooking) {
      throw new Error('Booking has no price information');
    }

    const baseAmount = Number(booking.priceAtBooking);
    
    // If deposit is required and available, use deposit amount
    if (booking.Service?.requiresDeposit && booking.depositAmount) {
      return Number(booking.depositAmount);
    }

    // If service requires deposit but booking doesn't have depositAmount, use service depositAmount
    if (booking.Service?.requiresDeposit && booking.Service.depositAmount) {
      return Number(booking.Service.depositAmount);
    }

    // Otherwise use full amount
    return baseAmount;
  }
} 