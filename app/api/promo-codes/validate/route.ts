import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schema
const validatePromoCodeSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = validatePromoCodeSchema.parse(body);
    const { code, serviceId, basePrice } = validatedData;

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Promo code not found',
      });
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'This promo code is no longer active',
      });
    }

    // Check date validity
    const now = new Date();
    if (promoCode.validFrom > now) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'This promo code is not yet valid',
      });
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'This promo code has expired',
      });
    }

    // Check usage limits
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'This promo code has reached its usage limit',
      });
    }

    // Check if service is applicable
    if (promoCode.applicableServices.length > 0 && !promoCode.applicableServices.includes(serviceId)) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'This promo code is not applicable to the selected service',
      });
    }

    // Check minimum amount requirement
    if (promoCode.minimumAmount && basePrice < Number(promoCode.minimumAmount)) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Minimum order amount of $${promoCode.minimumAmount} required for this promo code`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = basePrice * (Number(promoCode.discountValue) / 100);
    } else {
      discountAmount = Number(promoCode.discountValue);
    }

    // Apply maximum discount limit if set
    if (promoCode.maxDiscountAmount && discountAmount > Number(promoCode.maxDiscountAmount)) {
      discountAmount = Number(promoCode.maxDiscountAmount);
    }

    // Ensure discount doesn't exceed base price
    discountAmount = Math.min(discountAmount, basePrice);

    const finalPrice = Math.max(0, basePrice - discountAmount);

    return NextResponse.json({
      success: true,
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: Number(promoCode.discountValue),
        maxDiscountAmount: promoCode.maxDiscountAmount ? Number(promoCode.maxDiscountAmount) : null,
        minimumAmount: promoCode.minimumAmount ? Number(promoCode.minimumAmount) : null,
        validUntil: promoCode.validUntil,
        usageCount: promoCode.usageCount,
        usageLimit: promoCode.usageLimit,
        remainingUses: promoCode.usageLimit ? promoCode.usageLimit - promoCode.usageCount : null,
      },
      pricing: {
        basePrice,
        discountAmount,
        finalPrice,
        savings: discountAmount,
        discountPercentage: basePrice > 0 ? Math.round((discountAmount / basePrice) * 100) : 0,
      },
    });

  } catch (error) {
    console.error('Promo code validation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          valid: false,
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        valid: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 