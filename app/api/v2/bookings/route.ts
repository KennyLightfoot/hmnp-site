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
    if (locationType === 'REMOTE_ONLINE') {
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
    if (locationType === 'REMOTE_ONLINE' && session?.user) {
      const userRole = (session.user as any).role;
      if (userRole === Role.CUSTOMER) {
        whereClause.userId = (session.user as any).id;
      }
      // For NOTARY and ADMIN roles, show all RON bookings
    }
    
    // Fetch bookings with all related data
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            duration: true,
            depositRequired: true,
            depositAmount: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: [
        { scheduledDateTime: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    
    // Format bookings for frontend compatibility
    const formattedBookings = bookings.map(booking => {
      return {
        id: booking.id,
        status: booking.status,
        userId: booking.userId,
        serviceId: booking.serviceId,
        locationType: booking.locationType,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        scheduledDateTime: booking.scheduledDateTime?.toISOString(),
        finalPrice: booking.finalPrice ? Number(booking.finalPrice) : null,
        basePrice: booking.basePrice ? Number(booking.basePrice) : null,
        depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        service: booking.service ? {
          id: booking.service.id,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.basePrice ? Number(booking.service.basePrice) : null,
          duration: booking.service.duration,
          requiresDeposit: booking.service.depositRequired,
          depositAmount: booking.service.depositAmount ? Number(booking.service.depositAmount) : null,
        } : null,
        Service: booking.service ? {
          id: booking.service.id,
          name: booking.service.name,
          description: booking.service.description,
          price: booking.service.basePrice ? Number(booking.service.basePrice) : null,
          duration: booking.service.duration,
          requiresDeposit: booking.service.depositRequired,
          depositAmount: booking.service.depositAmount ? Number(booking.service.depositAmount) : null,
        } : null,
        user: booking.user,
        payments: booking.payments.map(payment => ({
          ...payment,
          amount: Number(payment.amount),
        })),
        specialInstructions: booking.specialInstructions,
        internalNotes: booking.internalNotes,
        paymentStatus: booking.paymentStatus,
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