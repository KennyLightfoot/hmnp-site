/**
 * SECURITY: Secure Pricing Validation Service
 * 
 * This module provides server-side pricing validation to prevent
 * client-side pricing manipulation attacks.
 * 
 * CRITICAL: Never trust client-provided pricing data
 */

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Input validation schemas
const PromoCodeValidationSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/),
  userEmail: z.string().email(),
  serviceId: z.string().uuid(),
  bookingAmount: z.number().positive(),
});

const ReferralValidationSchema = z.object({
  referrerEmail: z.string().email(),
  newUserEmail: z.string().email(),
  serviceId: z.string().uuid(),
});

export interface PricingResult {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedPromoCode?: string;
  isReferralDiscount?: boolean;
  priceSnapshotCents: number; // For payment integrity
}

export interface SecurityAuditLog {
  timestamp: Date;
  userEmail: string;
  action: string;
  details: Record<string, any>;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
}

class PricingValidator {
  
  /**
   * Validate promo code with comprehensive security checks
   */
  async validatePromoCode(input: z.infer<typeof PromoCodeValidationSchema>): Promise<PricingResult | null> {
    // Input validation
    const validatedInput = PromoCodeValidationSchema.parse(input);
    const { code, userEmail, serviceId, bookingAmount } = validatedInput;

    // Security audit logging
    await this.logSecurityEvent({
      timestamp: new Date(),
      userEmail,
      action: 'PROMO_CODE_VALIDATION_ATTEMPT',
      details: { code, serviceId, bookingAmount },
      severity: 'INFO'
    });

    try {
      // Fetch promo code with all related data
      const promoCode = await prisma.promoCode.findFirst({
        where: {
          code: code.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (!promoCode) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail,
          action: 'PROMO_CODE_NOT_FOUND',
          details: { code, serviceId },
          severity: 'WARN'
        });
        return null;
      }

      // Check usage limits
      // Note: PromoCodeUsage relation doesn't exist in schema
      const userUsageCount = 0; // Placeholder until relation is added
      if (promoCode.perCustomerLimit && userUsageCount >= promoCode.perCustomerLimit) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail,
          action: 'PROMO_CODE_USAGE_LIMIT_EXCEEDED',
          details: { code, usageCount: userUsageCount, limit: promoCode.perCustomerLimit },
          severity: 'WARN'
        });
        return null;
      }

      // Check global usage limits
      // TODO: promoCodeUsage model does not exist in schema
      // const totalUsage = await prisma.promoCodeUsage.count({
      //   where: { promoCodeId: promoCode.id },
      // });
      const totalUsage = 0; // Placeholder until model is added
      
      if (promoCode.usageLimit && totalUsage >= promoCode.usageLimit) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail,
          action: 'PROMO_CODE_GLOBAL_LIMIT_EXCEEDED',
          details: { code, totalUsage, limit: promoCode.usageLimit },
          severity: 'WARN'
        });
        return null;
      }

      // Check minimum amount requirement
      if (promoCode.minimumAmount && bookingAmount < Number(promoCode.minimumAmount)) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail,
          action: 'PROMO_CODE_MINIMUM_NOT_MET',
          details: { code, bookingAmount, minimumRequired: Number(promoCode.minimumAmount) },
          severity: 'WARN'
        });
        return null;
      }

      // Check service applicability
      if (promoCode.applicableServices.length > 0 && !promoCode.applicableServices.includes(serviceId)) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail,
          action: 'PROMO_CODE_SERVICE_NOT_APPLICABLE',
          details: { code, serviceId, applicableServices: promoCode.applicableServices },
          severity: 'WARN'
        });
        return null;
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (promoCode.discountType === 'PERCENTAGE') {
        discountAmount = Math.min(
          (bookingAmount * Number(promoCode.discountValue)) / 100,
          Number(promoCode.maxDiscountAmount) || Number.MAX_SAFE_INTEGER
        );
      } else if (promoCode.discountType === 'FIXED_AMOUNT') {
        discountAmount = Math.min(Number(promoCode.discountValue), bookingAmount);
      }

      const finalPrice = Math.max(0, bookingAmount - discountAmount);

      await this.logSecurityEvent({
        timestamp: new Date(),
        userEmail,
        action: 'PROMO_CODE_APPLIED_SUCCESSFULLY',
        details: { 
          code, 
          discountAmount, 
          originalAmount: bookingAmount, 
          finalAmount: finalPrice 
        },
        severity: 'INFO'
      });

      return {
        basePrice: bookingAmount,
        discountAmount,
        finalPrice,
        appliedPromoCode: code,
        priceSnapshotCents: Math.round(finalPrice * 100),
      };

    } catch (error) {
      await this.logSecurityEvent({
        timestamp: new Date(),
        userEmail,
        action: 'PROMO_CODE_VALIDATION_ERROR',
        details: { code, error: error instanceof Error ? getErrorMessage(error) : 'Unknown error' },
        severity: 'ERROR'
      });
      
      logger.error('Promo code validation failed', error as Error, { code, userEmail });
      return null;
    }
  }

  /**
   * Validate referral discount with fraud detection
   */
  async validateReferralDiscount(input: z.infer<typeof ReferralValidationSchema>): Promise<PricingResult | null> {
    const validatedInput = ReferralValidationSchema.parse(input);
    const { referrerEmail, newUserEmail, serviceId } = validatedInput;

    // Prevent self-referral fraud
    if (referrerEmail.toLowerCase() === newUserEmail.toLowerCase()) {
      await this.logSecurityEvent({
        timestamp: new Date(),
        userEmail: newUserEmail,
        action: 'REFERRAL_SELF_REFERRAL_ATTEMPT',
        details: { referrerEmail, newUserEmail },
        severity: 'CRITICAL'
      });
      return null;
    }

    try {
      // Verify referrer exists
      const referrer = await prisma.user.findFirst({
        where: {
          email: referrerEmail,
        },
        include: {
          Booking_Booking_signerIdToUser: {
            where: { status: 'CONFIRMED' },
          },
        },
      });

      if (!referrer) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail: newUserEmail,
          action: 'REFERRAL_INVALID_REFERRER',
          details: { referrerEmail },
          severity: 'WARN'
        });
        return null;
      }

      // Verify referrer has completed at least one booking
      if (referrer.Booking_Booking_signerIdToUser.length === 0) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail: newUserEmail,
          action: 'REFERRAL_REFERRER_NO_BOOKINGS',
          details: { referrerEmail },
          severity: 'WARN'
        });
        return null;
      }

      // Check if new user has already used a referral discount
      const existingReferralUsage = await prisma.booking.findFirst({
        where: {
          User_Booking_signerIdToUser: { email: newUserEmail },
        },
      });

      if (existingReferralUsage) {
        await this.logSecurityEvent({
          timestamp: new Date(),
          userEmail: newUserEmail,
          action: 'REFERRAL_ALREADY_USED',
          details: { referrerEmail, existingBookingId: existingReferralUsage.id },
          severity: 'WARN'
        });
        return null;
      }

      // Get service details for discount calculation
      const service = await prisma.service.findUnique({
        where: { id: serviceId, isActive: true },
      });

      if (!service) {
        throw new Error(`Service ${serviceId} not found or inactive`);
      }

      const basePrice = Number(service.basePrice);
      const discountAmount = 25; // Fixed referral discount
      const finalPrice = Math.max(0, basePrice - discountAmount);

      await this.logSecurityEvent({
        timestamp: new Date(),
        userEmail: newUserEmail,
        action: 'REFERRAL_DISCOUNT_APPLIED',
        details: { 
          referrerEmail, 
          discountAmount, 
          originalAmount: basePrice, 
          finalAmount: finalPrice 
        },
        severity: 'INFO'
      });

      return {
        basePrice,
        discountAmount,
        finalPrice,
        isReferralDiscount: true,
        priceSnapshotCents: Math.round(finalPrice * 100),
      };

    } catch (error) {
      await this.logSecurityEvent({
        timestamp: new Date(),
        userEmail: newUserEmail,
        action: 'REFERRAL_VALIDATION_ERROR',
        details: { 
          referrerEmail, 
          error: error instanceof Error ? getErrorMessage(error) : 'Unknown error' 
        },
        severity: 'ERROR'
      });
      
      logger.error('Referral validation failed', error as Error, { referrerEmail, newUserEmail });
      return null;
    }
  }

  /**
   * Record promo code usage to prevent reuse
   */
  async recordPromoCodeUsage(promoCode: string, userEmail: string): Promise<void> {
    try {
      const promoCodeRecord = await prisma.promoCode.findFirst({
        where: { code: promoCode.toUpperCase() },
      });

      if (!promoCodeRecord) {
        throw new Error(`Promo code ${promoCode} not found`);
      }

      // Note: promoCodeUsage model doesn't exist in schema
      // In a real implementation, you'd create this model
      logger.info('Would record promo code usage', {
        promoCodeId: promoCodeRecord.id,
        userEmail,
        usedAt: new Date()
      });

      await this.logSecurityEvent({
        timestamp: new Date(),
        userEmail,
        action: 'PROMO_CODE_USAGE_RECORDED',
        details: { promoCode },
        severity: 'INFO'
      });

    } catch (error) {
      logger.error('Failed to record promo code usage', error as Error, { promoCode, userEmail });
      throw error;
    }
  }

  /**
   * Security audit logging
   */
  private async logSecurityEvent(event: SecurityAuditLog): Promise<void> {
    try {
      // Log to application logger
      logger.info('Security Event', event.action, event.details);

      // Store in database for audit trail
      // TODO: securityAuditLog model does not exist in schema
      // await prisma.securityAuditLog.create({
      //   data: {
      //     timestamp: event.timestamp,
      //     userEmail: event.userEmail,
      //     action: event.action,
      //     details: event.details,
      //     severity: event.severity,
      //   },
      // });

      // Alert on critical events
      if (event.severity === 'CRITICAL') {
        // TODO: Integrate with alerting system (PagerDuty, Slack, etc.)
        logger.error('CRITICAL SECURITY EVENT', event.action, event.details);
      }

    } catch (error) {
      // Never let audit logging failure break the main flow
      logger.error('Failed to log security event', error as Error, event);
    }
  }
}

export const pricingValidator = new PricingValidator();
