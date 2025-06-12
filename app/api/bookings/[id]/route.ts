import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
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
        promoCode: {
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
      service: {
        id: booking.service.id,
        name: booking.service.name,
        description: booking.service.description,
        duration: booking.service.durationMinutes,
        basePrice: booking.service.basePrice,
        type: booking.service.serviceType,
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
        basePrice: Number(booking.service.basePrice),
        priceAtBooking: Number(booking.priceAtBooking),
        promoDiscount: booking.promoCodeDiscount ? Number(booking.promoCodeDiscount) : 0,
        depositAmount: booking.depositAmount ? Number(booking.depositAmount) : 0,
        depositStatus: booking.depositStatus,
        promoCode: booking.promoCode ? {
          code: booking.promoCode.code,
          description: booking.promoCode.description,
          discountType: booking.promoCode.discountType,
          discountValue: Number(booking.promoCode.discountValue),
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
    await prisma.$disconnect();
  }
}

// PATCH endpoint to update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const body = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Validate the booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        service: true,
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
    await prisma.$disconnect();
  }
} 