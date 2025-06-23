/**
 * Unified Booking API Service
 * Consolidates all booking creation logic to ensure consistency across all endpoints
 */

import { prisma } from '@/lib/prisma';
import { BookingStatus, LocationType, PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import * as ghl from '@/lib/ghl/api';
import { FrontendServiceType, mapFrontendToPrisma, isValidFrontendServiceType } from '@/lib/types/service-types';

// Unified booking schema that all endpoints should use
export const UnifiedBookingSchema = z.object({
  // Required fields
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'), 
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledDateTime: z.string().datetime('Valid date/time is required'),
  
  // Location details
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'OUR_OFFICE', 'REMOTE_ONLINE_NOTARIZATION', 'PUBLIC_PLACE']),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(), 
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  locationNotes: z.string().optional(),
  
  // Optional booking details
  notes: z.string().optional(),
  numberOfSigners: z.number().min(1).default(1),
  promoCode: z.string().optional(),
  
  // Lead tracking
  leadSource: z.string().optional(),
  campaignName: z.string().optional(),
  referredBy: z.string().optional(),
  
  // User consent
  smsNotifications: z.boolean().default(false),
  emailUpdates: z.boolean().default(false),
  termsAccepted: z.boolean().default(true),
  
  // GHL specific (for sync endpoints)
  ghlContactId: z.string().optional(),
  workflowId: z.string().optional(),
  triggerSource: z.string().optional(),
});

export type UnifiedBookingRequest = z.infer<typeof UnifiedBookingSchema>;

export interface BookingResult {
  success: boolean;
  booking?: any;
  payment?: {
    clientSecret?: string;
    paymentIntentId?: string;
    amount: number;
    required: boolean;
  };
  ghlContact?: {
    id: string;
    created: boolean;
  };
  error?: string;
  validationErrors?: any[];
}

export class UnifiedBookingService {
  
  /**
   * Create a booking using unified logic
   */
  static async createBooking(
    requestData: UnifiedBookingRequest, 
    options: {
      userId?: string;
      isGuestBooking?: boolean;
      skipPayment?: boolean;
      source?: 'website' | 'ghl' | 'phone' | 'admin';
    } = {}
  ): Promise<BookingResult> {
    
    try {
      // 1. Validate input
      const validatedData = UnifiedBookingSchema.parse(requestData);
      
      // 2. Get service details
      const service = await prisma.service.findUnique({
        where: { id: validatedData.serviceId, active: true },
      });
      
      if (!service) {
        return { success: false, error: 'Service not found or inactive' };
      }
      
      // 3. Calculate pricing
      const pricing = await this.calculatePricing(service, validatedData);
      
      // 4. Handle user creation/lookup
      const bookingUser = await this.handleUserLookup(validatedData, options);
      
      // 5. Create booking in transaction
      const result = await prisma.$transaction(async (tx) => {
        
        // Create the booking
        const newBooking = await tx.booking.create({
          data: {
            // Service & Timing
            serviceId: service.id,
            scheduledDateTime: new Date(validatedData.scheduledDateTime),
            
            // User association
            signerId: bookingUser?.id,
            customerEmail: validatedData.customerEmail,
            
            // Location
            locationType: validatedData.locationType as LocationType,
            addressStreet: validatedData.addressStreet,
            addressCity: validatedData.addressCity,
            addressState: validatedData.addressState,
            addressZip: validatedData.addressZip,
            locationNotes: validatedData.locationNotes,
            
            // Pricing
            priceAtBooking: pricing.price,
            promoCodeId: pricing.promoCodeId,
            promoCodeDiscount: pricing.discountAmount,
            depositAmount: pricing.depositRequired ? pricing.depositAmount : null,
            
            // Status
            status: pricing.paymentRequired ? BookingStatus.PAYMENT_PENDING : BookingStatus.CONFIRMED,
            depositStatus: pricing.paymentRequired ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
            
            // Additional details
            notes: validatedData.notes,
            leadSource: validatedData.leadSource || options.source || 'website',
            campaignName: validatedData.campaignName,
            ghlContactId: validatedData.ghlContactId,
          },
          include: {
            service: true,
            promoCode: true,
            signer: {
              select: { id: true, name: true, email: true }
            }
          }
        });
        
        // Create payment intent if required
        let paymentClientSecret: string | undefined;
        if (pricing.paymentRequired && !options.skipPayment) {
          // Payment logic would go here
          // paymentClientSecret = await createStripePaymentIntent(...)
        }
        
        return {
          booking: newBooking,
          paymentClientSecret,
          pricing
        };
      });
      
      // 6. Handle GHL integration
      let ghlContactResult;
      if (validatedData.ghlContactId) {
        // Update existing GHL contact
        ghlContactResult = await this.updateGHLContact(validatedData.ghlContactId, result.booking, validatedData);
      } else {
        // Create new GHL contact
        ghlContactResult = await this.createGHLContact(result.booking, validatedData);
      }
      
      // 7. Update booking with GHL contact ID
      if (ghlContactResult?.id) {
        await prisma.booking.update({
          where: { id: result.booking.id },
          data: { ghlContactId: ghlContactResult.id }
        });
      }
      
      return {
        success: true,
        booking: result.booking,
        payment: {
          clientSecret: result.paymentClientSecret,
          amount: pricing.finalAmount,
          required: pricing.paymentRequired,
        },
        ghlContact: ghlContactResult,
      };
      
    } catch (error) {
      console.error('[UNIFIED_BOOKING] Creation failed:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking creation failed',
      };
    }
  }
  
  /**
   * Calculate pricing with promo codes and discounts
   */
  private static async calculatePricing(service: any, data: UnifiedBookingRequest) {
    let price = Number(service.price);
    let discountAmount = 0;
    let promoCodeId: string | undefined;
    
    // Apply promo code if provided
    if (data.promoCode) {
      const promoCode = await prisma.promoCode.findUnique({
        where: { 
          code: data.promoCode,
          active: true,
        }
      });
      
      if (promoCode && promoCode.validUntil && promoCode.validUntil > new Date()) {
        if (promoCode.discountType === 'PERCENTAGE') {
          discountAmount = (price * Number(promoCode.discountValue)) / 100;
        } else {
          discountAmount = Number(promoCode.discountValue);
        }
        promoCodeId = promoCode.id;
      }
    }
    
    const finalAmount = Math.max(0, price - discountAmount);
    const depositRequired = service.requiresDeposit && finalAmount > 0;
    const depositAmount = depositRequired ? Number(service.depositAmount) : 0;
    
    return {
      price,
      discountAmount,
      finalAmount,
      depositRequired,
      depositAmount,
      paymentRequired: finalAmount > 0,
      promoCodeId,
    };
  }
  
  /**
   * Handle user lookup/creation for bookings
   */
  private static async handleUserLookup(
    data: UnifiedBookingRequest, 
    options: { userId?: string; isGuestBooking?: boolean }
  ) {
    if (options.userId) {
      // Use existing authenticated user
      return await prisma.user.findUnique({
        where: { id: options.userId }
      });
    }
    
    if (options.isGuestBooking) {
      // For guest bookings, try to find existing user or create new one
      let user = await prisma.user.findUnique({
        where: { email: data.customerEmail }
      });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: data.customerName,
            email: data.customerEmail,
            role: 'SIGNER',
          }
        });
      }
      
      return user;
    }
    
    return null; // For cases where no user association is needed
  }
  
  /**
   * Create GHL contact for new bookings
   */
  private static async createGHLContact(booking: any, data: UnifiedBookingRequest) {
    try {
      const contactData = {
        email: data.customerEmail,
        firstName: data.customerName.split(' ')[0],
        lastName: data.customerName.split(' ').slice(1).join(' ') || '',
        phone: data.customerPhone,
        source: data.leadSource || 'Website Booking',
        customField: {
          cf_booking_id: booking.id,
          cf_service_type: booking.service.name,
          cf_booking_status: booking.status,
          cf_appointment_date: new Date(booking.scheduledDateTime).toLocaleDateString('en-US'),
          cf_appointment_time: new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
        }
      };
      
      const ghlContact = await ghl.createContact(contactData);
      
      // Add appropriate tags
      const tags = [
        'status:booking_created',
        `service:${booking.service.serviceType}`,
      ];
      
      if (booking.status === BookingStatus.PAYMENT_PENDING) {
        tags.push('status:booking_pendingpayment');
      } else {
        tags.push('status:booking_confirmed');
      }
      
      await ghl.addTagsToContact(ghlContact.id, tags);
      
      return { id: ghlContact.id, created: true };
      
    } catch (error) {
      console.error('[UNIFIED_BOOKING] GHL contact creation failed:', error);
      return null;
    }
  }
  
  /**
   * Update existing GHL contact with booking information
   */
  private static async updateGHLContact(contactId: string, booking: any, data: UnifiedBookingRequest) {
    try {
      const customFields = {
        cf_booking_id: booking.id,
        cf_service_type: booking.service.name,
        cf_booking_status: booking.status,
        cf_appointment_date: new Date(booking.scheduledDateTime).toLocaleDateString('en-US'),
        cf_appointment_time: new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
      };
      
      await ghl.updateContactCustomFields(contactId, customFields);
      
      const tags = [
        'status:booking_created',
        `service:${booking.service.serviceType}`,
      ];
      
      if (booking.status === BookingStatus.PAYMENT_PENDING) {
        tags.push('status:booking_pendingpayment');
      } else {
        tags.push('status:booking_confirmed');
      }
      
      await ghl.addTagsToContact(contactId, tags);
      
      return { id: contactId, created: false };
      
    } catch (error) {
      console.error('[UNIFIED_BOOKING] GHL contact update failed:', error);
      return null;
    }
  }
} 