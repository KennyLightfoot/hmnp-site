/**
 * Enhanced Booking Service
 * Handles booking creation with integrated payment options
 */

import { prisma } from '@/lib/database-connection';
import { Prisma } from '@prisma/client';

export interface BookingCreationOptions {
  serviceId: string;
  customerData: {
    email: string;
    name: string;
    phone?: string;
  };
  scheduledDateTime?: Date;
  locationData?: {
    type: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
  };
  paymentPreference: 'STRIPE_ONLINE' | 'CASH_ON_SERVICE' | 'ADMIN_OVERRIDE';
  promoCode?: string;
  notes?: string;
}

export interface BookingResult {
  success: boolean;
  booking?: any;
  paymentRequired: boolean;
  checkoutUrl?: string;
  depositAmount?: number;
  message: string;
  error?: string;
}

export class EnhancedBookingService {
  
  /**
   * Create booking with integrated payment handling
   */
  static async createBookingWithPayment(options: BookingCreationOptions): Promise<BookingResult> {
    try {
      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: options.serviceId, isActive: true },
        select: {
          id: true,
          name: true,
          basePrice: true,
          depositAmount: true,
          requiresDeposit: true,
          durationMinutes: true
        }
      });

      if (!service) {
        return {
          success: false,
          paymentRequired: false,
          message: 'Service not found or inactive',
          error: 'INVALID_SERVICE'
        };
      }

      // Validate promo code if provided
      let promoCodeResult = null;
      if (options.promoCode) {
        promoCodeResult = await this.validatePromoCode(
          options.promoCode,
          service.id,
          service.basePrice.toNumber()
        );
      }

      // Calculate pricing
      const basePrice = service.basePrice.toNumber();
      const discountAmount = promoCodeResult?.discountAmount || 0;
      const finalPrice = Math.max(0, basePrice - discountAmount);
      const depositAmount = service.requiresDeposit ? (service.depositAmount?.toNumber() || 0) : 0;

      // Check if deposit is required
      const depositRequired = service.requiresDeposit && 
                             depositAmount > 0 && 
                             !(promoCodeResult?.skipDeposit) &&
                             options.paymentPreference !== 'ADMIN_OVERRIDE';

      // Determine initial booking status
      let initialStatus = 'CONFIRMED';
      let depositStatus = 'NOT_REQUIRED';

      if (depositRequired) {
        initialStatus = 'PAYMENT_PENDING';
        depositStatus = 'PENDING';
      }

      // Create booking in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create booking
        const booking = await tx.booking.create({
          data: {
            Service: { connect: { id: service.id } },
            scheduledDateTime: options.scheduledDateTime || null,
            status: initialStatus as any,
            locationType: (options.locationData?.type as any) || 'CLIENT_SPECIFIED_ADDRESS',
            addressStreet: options.locationData?.street,
            addressCity: options.locationData?.city,
            addressState: options.locationData?.state,
            addressZip: options.locationData?.zip,
            locationNotes: options.locationData?.notes,
            customerEmail: options.customerData.email,
            signerName: options.customerData.name,
            signerPhone: options.customerData.phone,
            basePrice: new Prisma.Decimal(basePrice),
            finalPrice: new Prisma.Decimal(finalPrice),
            depositAmount: new Prisma.Decimal(depositAmount),
            promoDiscount: new Prisma.Decimal(discountAmount),
            appliedPromoCode: options.promoCode?.toUpperCase(),
            paymentMethod: options.paymentPreference,
            depositStatus: depositStatus as any,
            notes: options.notes,
            price_snapshot_cents: Math.round(finalPrice * 100),
            pricing_calculated_at: new Date(),
            is_first_time_discount_applied: false,
            is_referral_discount_applied: false,
          },
          include: {
            Service: {
              select: {
                name: true,
                basePrice: true,
                depositAmount: true,
                requiresDeposit: true
              }
            }
          }
        });

        // Create payment record if deposit required
        if (depositRequired) {
          await tx.payment.create({
            data: {
              bookingId: booking.id,
              amount: new Prisma.Decimal(depositAmount),
              status: 'PENDING',
              paymentMethod: options.paymentPreference === 'STRIPE_ONLINE' ? 'STRIPE_CHECKOUT' : 'CASH_ON_SERVICE',
              notes: `Deposit payment for booking ${booking.id}`
            }
          });
        }

        return booking;
      });

      // Handle payment creation based on preference
      if (depositRequired && options.paymentPreference === 'STRIPE_ONLINE') {
        // Create Stripe checkout session
        const checkoutUrl = await this.createStripeCheckoutSession(result, depositAmount);
        
        return {
          success: true,
          booking: result,
          paymentRequired: true,
          checkoutUrl,
          depositAmount,
          message: 'Booking created - payment required to confirm'
        };
      }

      if (depositRequired && options.paymentPreference === 'CASH_ON_SERVICE') {
        // Update booking for cash payment
        await prisma.booking.update({
          where: { id: result.id },
          data: { 
            status: 'CONFIRMED',
            depositStatus: 'CASH_ON_SERVICE'
          }
        });

        return {
          success: true,
          booking: result,
          paymentRequired: false,
          depositAmount,
          message: 'Booking confirmed - cash payment on service date'
        };
      }

      // No deposit required or admin override
      return {
        success: true,
        booking: result,
        paymentRequired: false,
        message: 'Booking confirmed'
      };

    } catch (error) {
      console.error('Enhanced booking creation failed:', error);
      return {
        success: false,
        paymentRequired: false,
        message: 'Booking creation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate promo code
   */
  private static async validatePromoCode(code: string, serviceId: string, basePrice: number) {
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          serviceId,
          price: basePrice
        })
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return {
        discountAmount: result.pricing?.discountAmount || 0,
        skipDeposit: result.promoCode?.skipDeposit || false,
        promoCodeData: result.promoCode
      };
    } catch (error) {
      console.error('Promo code validation failed:', error);
      return null;
    }
  }

  /**
   * Create Stripe checkout session
   */
  private static async createStripeCheckoutSession(booking: any, depositAmount: number): Promise<string | null> {
    try {
      const response = await fetch('/api/payments/create-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethod: 'STRIPE_ONLINE'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const result = await response.json();
      return result.checkoutUrl || null;
    } catch (error) {
      console.error('Stripe checkout session creation failed:', error);
      return null;
    }
  }

  /**
   * Get booking payment status
   */
  static async getBookingPaymentStatus(bookingId: string) {
    try {
      const response = await fetch(`/api/payments/verify-deposit?bookingId=${bookingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get booking payment status:', error);
      return null;
    }
  }

  /**
   * Verify deposit payment
   */
  static async verifyDepositPayment(sessionId: string, bookingId: string) {
    try {
      const response = await fetch('/api/payments/verify-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          bookingId,
          paymentMethod: 'STRIPE_ONLINE'
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment verification failed:', error);
      return null;
    }
  }
}