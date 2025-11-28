/**
 * V2 Individual Booking API - Houston Mobile Notary Pros
 * Provides individual booking data for payment pages.
 *
 * Hard-mode security:
 * - Supports signed payment-link tokens for unauthenticated access.
 * - Also allows authenticated ADMIN/STAFF/NOTARY or the booking owner (SIGNER) to fetch.
 * - Always returns a minimal, payment-focused projection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role } from '@/lib/prisma-types';
import { verifyBookingPaymentToken } from '@/lib/security/payment-link-tokens';

type BookingContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: BookingContext
) {
  try {
    const { id: bookingId } = await context.params;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    // Try authenticated access first
    const session = await getServerSession(authOptions);
    const user = session?.user as any | undefined;
    const userRole = (user?.role as Role | undefined) || undefined;
    const userId = (user?.id as string | undefined) || undefined;

    const isAdminLike =
      userRole === Role.ADMIN ||
      userRole === Role.STAFF ||
      userRole === Role.NOTARY;

    let canAccess = false;

    // 1) Authenticated staff/admin/notary can always access
    if (isAdminLike) {
      canAccess = true;
    }

    // 2) Authenticated signer/owner can access their own booking
    //    (we'll verify ownership after loading the booking).

    // 3) If not authenticated or not owner/admin, require a valid signed token
    const tokenIsValid = verifyBookingPaymentToken(token, bookingId);
    
    if (!session?.user && !tokenIsValid) {
      return NextResponse.json(
        { error: 'Unauthorized: valid payment link token required' },
        { status: 401 }
      );
    }

    // Fetch the booking with all related data needed for payment UI
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
      },
    });
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // If we have an authenticated non-admin session, enforce ownership.
    if (session?.user && !isAdminLike) {
      if (!userId || booking.signerId !== userId) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
      canAccess = true;
    }

    // If we got here via token-only, token was already validated above.
    if (!canAccess && !tokenIsValid) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Format booking for frontend compatibility (matching payment page expectations)
    // Restrict to a "public-safe" projection suitable for secret-link access.
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
      
      // Customer information (owner of this booking)
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: null, // customerPhone field doesn't exist on booking model

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

      // Additional data intentionally omitted for security:
      // - No internal notes
      // - No full address fields
      // - No user object
      // - No raw payment intent metadata

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