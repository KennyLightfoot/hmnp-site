/**
 * V2 Bookings API - Houston Mobile Notary Pros
 * Provides booking data for frontend components (payment pages, RON dashboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, LocationType, Prisma } from '@/lib/prisma-types';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  locationType: z.nativeEnum(LocationType).optional(),
});

export const GET = withRateLimit('public', 'bookings_v2')(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    // Require authentication for all v2 bookings access
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role as Role | undefined;
    const userId = (session.user as any).id as string | undefined;
    const isAdminLike =
      userRole === Role.ADMIN ||
      userRole === Role.STAFF ||
      userRole === Role.NOTARY;

    // Parse and validate query params
    const rawParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = querySchema.safeParse({ locationType: rawParams.locationType as any });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
    const locationType = parsed.data.locationType as LocationType;

    // Build where clause
    const whereClause: any = {};

    // Filter by location type if provided
    if (locationType) {
      whereClause.locationType = locationType;
    }

    // Enforce ownership for non-admin-like users:
    // - ADMIN / STAFF / NOTARY: can see all bookings (subject to filters)
    // - SIGNER / CLIENT: only see their own bookings
    if (!isAdminLike) {
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      whereClause.signerId = userId;
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
    const formattedBookings = bookings.map((booking: Prisma.BookingGetPayload<{
      include: {
        service: true;
        payments: true;
      };
    }>) => {
      const customerPhone = 'N/A'; // Phone field doesn't exist in User model
      const user = null; // User relation doesn't exist in this include
      const specialInstructions = booking.notes || '';
      // Only expose internal notes to admin-like roles; hide for signer/client views
      const internalNotes = isAdminLike ? booking.notes || '' : '';
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
        payments: booking.payments.map((payment: (typeof booking.payments)[number]) => ({
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
})