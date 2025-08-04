/**
 * V2 Individual Booking API - Houston Mobile Notary Pros
 * Provides individual booking data for payment pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            durationMinutes: true,
            requiresDeposit: true,
            depositAmount: true,
          },
        },
        User_Booking_signerIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentIntentId: true,
            paidAt: true,
          },
        },
      },
    });
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Format booking for frontend compatibility (matching payment page expectations)
    const formattedBooking = {
      id: booking.id,
      status: booking.status,
      userId: booking.signerId, // Using signerId as closest equivalent to userId
      serviceId: booking.serviceId,
      locationType: booking.locationType,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      scheduledDateTime: booking.scheduledDateTime?.toISOString(),
      
      // Payment-related fields (what payment page expects)
      totalAmount: booking.priceAtBooking ? Number(booking.priceAtBooking) : null,
      finalPrice: booking.priceAtBooking ? Number(booking.priceAtBooking) : null,
      basePrice: booking.service?.basePrice ? Number(booking.service.basePrice) : null,
      depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
      
      // Customer information
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: null, // customerPhone field doesn't exist on booking model,
      
      // Location information
      addressStreet: booking.addressStreet,
      addressCity: booking.addressCity,
      addressState: booking.addressState,
      addressZip: booking.addressZip,
      locationNotes: booking.locationNotes,
      
      // Service information
      service: booking.service ? {
        id: booking.service.id,
        name: booking.service.name,
        description: booking.service.description,
        price: booking.service.basePrice ? Number(booking.service.basePrice) : null,
        duration: booking.service.durationMinutes,
        requiresDeposit: booking.service.requiresDeposit,
        depositAmount: booking.service.depositAmount ? Number(booking.service.depositAmount) : null,
      } : null,
      
      // Compatibility alias
      Service: booking.service ? {
        id: booking.service.id,
        name: booking.service.name,
        description: booking.service.description,
        price: booking.service.basePrice ? Number(booking.service.basePrice) : null,
        duration: booking.service.durationMinutes,
        requiresDeposit: booking.service.requiresDeposit,
        depositAmount: booking.service.depositAmount ? Number(booking.service.depositAmount) : null,
      } : null,
      
      // Additional data
      specialInstructions: null, // specialInstructions doesn't exist on Booking model
      internalNotes: null, // internalNotes doesn't exist on Booking model
      user: booking.User_Booking_signerIdToUser,
      payments: booking.payments.map(payment => ({
        ...payment,
        amount: Number(payment.amount),
      })),
      
      // Payment processing fields
      paymentStatus: booking.depositStatus, // Using depositStatus as closest equivalent
      stripePaymentIntentId: null, // stripePaymentIntentId doesn't exist on Booking model
    };
    
    return NextResponse.json({
      booking: formattedBooking
    });
    
  } catch (error) {
    console.error('V2 Individual Booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
} 