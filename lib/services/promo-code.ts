import { PrismaClient, PromoCode, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

export interface PromoCodeValidationResult {
  isValid: boolean;
  promoCode?: PromoCode;
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export interface CreatePromoCodeData {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  validFrom?: Date;
  validUntil?: Date;
  applicableServices?: string[];
  createdById?: string;
}

class PromoCodeService {
  
  async createPromoCode(data: CreatePromoCodeData): Promise<PromoCode> {
    try {
      return await prisma.promoCode.create({
        data: {
          code: data.code.toUpperCase().trim(),
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minimumAmount: data.minimumAmount,
          maxDiscountAmount: data.maxDiscountAmount,
          usageLimit: data.usageLimit,
          perCustomerLimit: data.perCustomerLimit || 1,
          validFrom: data.validFrom || new Date(),
          validUntil: data.validUntil,
          applicableServices: data.applicableServices || [],
          createdById: data.createdById,
        }
      });
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw new Error('Failed to create promo code');
    }
  }

  async validatePromoCode(
    code: string, 
    serviceId: string, 
    originalAmount: number, 
    customerEmail?: string
  ): Promise<PromoCodeValidationResult> {
    try {
      const promoCode = await prisma.promoCode.findUnique({
        where: { 
          code: code.toUpperCase().trim() 
        }
      });

      if (!promoCode) {
        return {
          isValid: false,
          error: 'Promo code not found'
        };
      }

      // Check if promo code is active
      if (!promoCode.active) {
        return {
          isValid: false,
          error: 'Promo code is no longer active'
        };
      }

      // Check if promo code is within valid date range
      const now = new Date();
      if (promoCode.validFrom && now < promoCode.validFrom) {
        return {
          isValid: false,
          error: 'Promo code is not yet valid'
        };
      }

      if (promoCode.validUntil && now > promoCode.validUntil) {
        return {
          isValid: false,
          error: 'Promo code has expired'
        };
      }

      // Check usage limit
      if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
        return {
          isValid: false,
          error: 'Promo code usage limit exceeded'
        };
      }

      // Check if service is applicable
      if (promoCode.applicableServices.length > 0 && !promoCode.applicableServices.includes(serviceId)) {
        return {
          isValid: false,
          error: 'Promo code is not applicable to this service'
        };
      }

      // Check minimum amount requirement
      if (promoCode.minimumAmount && originalAmount < Number(promoCode.minimumAmount)) {
        return {
          isValid: false,
          error: `Minimum order amount of $${promoCode.minimumAmount} required`
        };
      }

      // Check per-customer usage limit
      if (customerEmail && promoCode.perCustomerLimit) {
        const customerUsage = await this.getCustomerUsageCount(promoCode.id, customerEmail);
        if (customerUsage >= promoCode.perCustomerLimit) {
          return {
            isValid: false,
            error: 'You have already used this promo code the maximum number of times'
          };
        }
      }

      // Calculate discount
      const discountAmount = this.calculateDiscount(promoCode, originalAmount);
      const finalAmount = Math.max(0, originalAmount - discountAmount);

      return {
        isValid: true,
        promoCode,
        discountAmount,
        finalAmount
      };

    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        isValid: false,
        error: 'Error validating promo code'
      };
    }
  }

  private calculateDiscount(promoCode: PromoCode, originalAmount: number): number {
    let discount = 0;

    if (promoCode.discountType === DiscountType.PERCENTAGE) {
      discount = (originalAmount * Number(promoCode.discountValue)) / 100;
    } else if (promoCode.discountType === DiscountType.FIXED_AMOUNT) {
      discount = Number(promoCode.discountValue);
    }

    // Apply maximum discount limit if set
    if (promoCode.maxDiscountAmount && discount > Number(promoCode.maxDiscountAmount)) {
      discount = Number(promoCode.maxDiscountAmount);
    }

    // Ensure discount doesn't exceed original amount
    return Math.min(discount, originalAmount);
  }

  async applyPromoCode(promoCodeId: string, bookingId: string): Promise<void> {
    try {
      // Increment usage count
      await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: {
          usageCount: {
            increment: 1
          }
        }
      });

      // The booking relationship is already established through the booking creation
      console.log(`Promo code ${promoCodeId} applied to booking ${bookingId}`);
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw new Error('Failed to apply promo code');
    }
  }

  async getCustomerUsageCount(promoCodeId: string, customerEmail: string): Promise<number> {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          promoCodeId,
          signer: {
            email: customerEmail
          }
        }
      });

      return bookings.length;
    } catch (error) {
      console.error('Error getting customer usage count:', error);
      return 0;
    }
  }

  async getPromoCodeById(id: string): Promise<PromoCode | null> {
    try {
      return await prisma.promoCode.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('Error fetching promo code:', error);
      return null;
    }
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | null> {
    try {
      return await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase().trim() }
      });
    } catch (error) {
      console.error('Error fetching promo code:', error);
      return null;
    }
  }

  async listPromoCodes(filters?: {
    active?: boolean;
    createdById?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    promoCodes: PromoCode[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
          if (filters?.active !== undefined) {
      where.active = filters.active;
      }
      if (filters?.createdById) {
        where.createdById = filters.createdById;
      }

      const [promoCodes, totalCount] = await Promise.all([
        prisma.promoCode.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.promoCode.count({ where })
      ]);

      return {
        promoCodes,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      console.error('Error listing promo codes:', error);
      throw new Error('Failed to list promo codes');
    }
  }

  async updatePromoCode(id: string, updates: Partial<CreatePromoCodeData>): Promise<PromoCode> {
    try {
      const updateData: any = {};
      
      if (updates.code) updateData.code = updates.code.toUpperCase().trim();
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.discountType) updateData.discountType = updates.discountType;
      if (updates.discountValue !== undefined) updateData.discountValue = updates.discountValue;
      if (updates.minimumAmount !== undefined) updateData.minimumAmount = updates.minimumAmount;
      if (updates.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = updates.maxDiscountAmount;
      if (updates.usageLimit !== undefined) updateData.usageLimit = updates.usageLimit;
      if (updates.perCustomerLimit !== undefined) updateData.perCustomerLimit = updates.perCustomerLimit;
      if (updates.validFrom !== undefined) updateData.validFrom = updates.validFrom;
      if (updates.validUntil !== undefined) updateData.validUntil = updates.validUntil;
      if (updates.applicableServices !== undefined) updateData.applicableServices = updates.applicableServices;

      return await prisma.promoCode.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error('Error updating promo code:', error);
      throw new Error('Failed to update promo code');
    }
  }

  async deactivatePromoCode(id: string): Promise<PromoCode> {
    try {
      return await prisma.promoCode.update({
        where: { id },
        data: { active: false }
      });
    } catch (error) {
      console.error('Error deactivating promo code:', error);
      throw new Error('Failed to deactivate promo code');
    }
  }

  // Bulk create common promo codes for initial setup
  async createCommonPromoCodes(createdById?: string): Promise<void> {
    const commonCodes = [
      {
        code: 'WELCOME10',
        description: 'Welcome discount - 10% off',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        maxDiscountAmount: 50,
        usageLimit: 100,
        perCustomerLimit: 1,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        createdById
      },
      {
        code: 'SAVE25',
        description: '$25 off any service',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 25,
        minimumAmount: 100,
        usageLimit: 50,
        perCustomerLimit: 1,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        createdById
      }
    ];

    for (const codeData of commonCodes) {
      try {
        const existing = await this.getPromoCodeByCode(codeData.code);
        if (!existing) {
          await this.createPromoCode(codeData);
        }
      } catch (error) {
        console.error(`Error creating promo code ${codeData.code}:`, error);
      }
    }
  }
}

export const promoCodeService = new PromoCodeService();
export default promoCodeService; 