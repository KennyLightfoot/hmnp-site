import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
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

    // Get booking with all related data
    const booking = await prisma.Booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: {
          select: {
            id: true,
            name: true,
            description: true,
            durationMinutes: true,
            basePrice: true,
            serviceType: true,
          },
        },
        User_Booking_signerIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        User_Booking_notaryIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        PromoCode: {
          select: {
            id: true,
            code: true,
            description: true,
            discountType: true,
            discountValue: true,
          },
        },
        NotificationLog: {
          select: {
            id: true,
            notificationType: true,
            method: true,
            sentAt: true,
            status: true,
          },
          orderBy: {
            sentAt: 'desc',
          },
          take: 10, // Last 10 notifications
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedBooking = {
      id: booking.id,
      reference: `HMNP-${booking.id.slice(-8).toUpperCase()}`,
      status: booking.status,
      
      // Schedule Information
      scheduledDateTime: booking.scheduledDateTime,
      actualEndDateTime: booking.actualEndDateTime,
      
      // Service Information
      Service: {
        id: booking.Service.id,
        name: booking.Service.name,
        description: booking.Service.description,
        duration: booking.Service.durationMinutes,
        price: booking.Service.basePrice,
        type: booking.Service.serviceType,
      },
      
      // Customer Information
      customer: booking.User_Booking_signerIdToUser ? {
        id: booking.User_Booking_signerIdToUser.id,
        name: booking.User_Booking_signerIdToUser.name,
        email: booking.User_Booking_signerIdToUser.email,
      } : null,
      
      // Notary Information (if assigned)
      notary: booking.User_Booking_notaryIdToUser ? {
        id: booking.User_Booking_notaryIdToUser.id,
        name: booking.User_Booking_notaryIdToUser.name,
        email: booking.User_Booking_notaryIdToUser.email,
      } : null,
      
      // Location Information
      location: {
        type: booking.locationType,
        address: booking.addressStreet ? {
          street: booking.addressStreet,
          city: booking.addressCity,
          state: booking.addressState,
          zip: booking.addressZip,
        } : null,
        notes: booking.locationNotes,
      },
      
      // Pricing Information
      pricing: {
        price: Number(booking.Service.basePrice),
        priceAtBooking: Number(booking.priceAtBooking),
        promoDiscount: booking.promoCodeDiscount ? Number(booking.promoCodeDiscount) : 0,
        depositAmount: booking.depositAmount ? Number(booking.depositAmount) : 0,
        depositStatus: booking.depositStatus,
        promoCode: booking.PromoCode ? {
          code: booking.PromoCode.code,
          description: booking.PromoCode.description,
          discountType: booking.PromoCode.discountType,
          discountValue: Number(booking.PromoCode.discountValue),
        } : null,
      },
      
      // Additional Details
      notes: booking.notes,
      
      // Online Notarization Details (if applicable)
      dailyRoomUrl: booking.dailyRoomUrl,
      dailyRecordingId: booking.dailyRecordingId,
      kbaStatus: booking.kbaStatus,
      idVerificationStatus: booking.idVerificationStatus,
      notaryJournalEntry: booking.notaryJournalEntry,
      
      // Timestamps
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      
      // Communication History
      notifications: booking.NotificationLog.map(notification => ({
        id: notification.id,
        type: notification.notificationType,
        method: notification.method,
        sentAt: notification.sentAt,
        status: notification.status,
      })),
      
      // Status Tracking
      timestamps: {
        confirmationEmailSent: booking.confirmationEmailSentAt,
        confirmationSmsSent: booking.confirmationSmsSentAt,
        followUpSent: booking.followUpSentAt,
        lastReminderSent: booking.lastReminderSentAt,
        reminder24hrSent: booking.reminder24hrSentAt,
        reminder2hrSent: booking.reminder2hrSentAt,
        reminder1hrSent: booking.reminder1hrSentAt,
        noShowCheckPerformed: booking.noShowCheckPerformedAt,
      },
    };

    return NextResponse.json({
      success: true,
      booking: formattedBooking,
    });

  } catch (error) {
    console.error('Get booking error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  } finally {
    // singleton: do not disconnect
  }
}

// PATCH endpoint to update booking status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const bookingId = params.id;
    const body = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Validate the booking exists
    const existingBooking = await prisma.Booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update the booking
    const updatedBooking = await prisma.Booking.update({
      where: { id: bookingId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        Service: true,
        User_Booking_signerIdToUser: true,
        promoCode: true,
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt,
      },
    });

  } catch (error) {
    console.error('Update booking error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  } finally {
    // singleton: do not disconnect
  }
} 