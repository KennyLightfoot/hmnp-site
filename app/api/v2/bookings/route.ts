/**
 * V2 Bookings API - Houston Mobile Notary Pros
 * Provides booking data for frontend components (payment pages, RON dashboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, LocationType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication for certain operations
    const { searchParams } = request.nextUrl;
    const locationType = searchParams.get('locationType') as LocationType;
    
    // If requesting RON bookings, require authentication
    if (locationType === LocationType.REMOTE_ONLINE_NOTARIZATION) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // Build where clause
    const whereClause: any = {};
    
    // Filter by location type if provided
    if (locationType) {
      whereClause.locationType = locationType;
    }
    
    // Filter by user for RON bookings (only show user's own bookings)
    if (locationType === LocationType.REMOTE_ONLINE_NOTARIZATION && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole === Role.SIGNER) {
        whereClause.signerId = (session.user as any).id;
      }
      // For NOTARY and ADMIN roles, show all RON bookings
    }
    
    // Fetch bookings with all related data
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        payments: true
      },
      orderBy: [
        { scheduledDateTime: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    
    // Format bookings for frontend compatibility
    const formattedBookings = bookings.map(booking => {
      const customerPhone = 'N/A'; // Phone field doesn't exist in User model
      const user = null; // User relation doesn't exist in this include
      const specialInstructions = booking.notes || '';
      const internalNotes = booking.notes || '';
      const paymentStatus = booking.paymentStatus;
      const paymentMethod = booking.paymentMethod;
      const totalPaid = booking.totalPaid ? Number(booking.totalPaid) : 0;
      const amountDue = Math.max((booking.priceAtBooking ? Number(booking.priceAtBooking) : 0) - totalPaid, 0);
      return {
        id: booking.id,
        status: booking.status,
        userId: booking.signerId,
        serviceId: booking.serviceId,
        locationType: booking.locationType,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        scheduledDateTime: booking.scheduledDateTime?.toISOString(),
        finalPrice: booking.priceAtBooking ? Number(booking.priceAtBooking) : null,
        basePrice: booking.service?.basePrice ? Number(booking.service.basePrice) : null,
        depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: customerPhone,
        service: booking.service ? {
          id: booking.service.id,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.basePrice ? Number(booking.service.basePrice) : null,
          duration: booking.service.durationMinutes,
          requiresDeposit: booking.service.requiresDeposit,
          depositAmount: booking.service.depositAmount ? Number(booking.service.depositAmount) : null,
        } : null,
        Service: booking.service ? {
          id: booking.service.id,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.basePrice ? Number(booking.service.basePrice) : null,
          duration: booking.service.durationMinutes,
          requiresDeposit: booking.service.requiresDeposit,
          depositAmount: booking.service.depositAmount ? Number(booking.service.depositAmount) : null,
        } : null,
        user: user,
        payments: booking.payments.map(payment => ({
          ...payment,
          amount: Number(payment.amount),
        })),
        specialInstructions: specialInstructions,
        internalNotes: internalNotes,
        paymentStatus,
        paymentMethod,
        totalPaid,
        amountDue,
      };
    });
    
    return NextResponse.json(formattedBookings);
    
  } catch (error) {
    console.error('V2 Bookings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 