import { NextResponse } from 'next/server';
import { BookingAutomationService } from '@/lib/booking-automation';
import { BookingStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: bookingId } = params;
    const body = await request.json();
    const { status, notes, triggeredBy } = body;

    // Validate that status is a valid BookingStatus
    if (!Object.values(BookingStatus).includes(status)) {
      return NextResponse.json({
        error: `Invalid status: ${status}. Valid statuses: ${Object.values(BookingStatus).join(', ')}`
      }, { status: 400 });
    }

    // Transition the booking status
    const result = await BookingAutomationService.transitionBookingStatus(
      bookingId,
      status as BookingStatus,
      notes,
      triggeredBy || 'manual-api'
    );

    if (!result.success) {
      return NextResponse.json({
        error: result.error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      previousStatus: result.previousStatus,
      newStatus: result.newStatus,
      message: `Booking status updated from ${result.previousStatus} to ${result.newStatus}`
    });

  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: bookingId } = params;

    // Get current booking status and details
    const booking = await prisma.Booking.findUnique({
      where: { id: bookingId },
      include: {
        User_Booking_signerIdToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        Service: {
          select: {
            id: true,
            name: true,
            serviceType: true
          }
        },
        Payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            provider: true,
            paidAt: true
          }
        },
        NotificationLog: {
          select: {
            id: true,
            notificationType: true,
            method: true,
            sentAt: true,
            status: true
          },
          orderBy: {
            sentAt: 'desc'
          },
          take: 10 // Last 10 notifications
        }
      }
    });

    if (!booking) {
      return NextResponse.json({
        error: 'Booking not found'
      }, { status: 404 });
    }

    // Get valid next statuses
    const currentStatus = booking.status;
    const validTransitions = getValidTransitions(currentStatus);

    // Check if booking needs any automatic updates
    const automationResult = await BookingAutomationService.progressBookingStatus(
      bookingId,
      'status-check'
    );

    return NextResponse.json({
      booking: {
        id: booking.id,
        status: booking.status,
        scheduledDateTime: booking.scheduledDateTime,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        user: booking.User_Booking_signerIdToUser,
        Service: booking.Service,
        payments: booking.Payment,
        recentNotifications: booking.NotificationLog
      },
      statusInfo: {
        currentStatus,
        validTransitions,
        automationCheck: {
          canAutoProgress: automationResult.success && automationResult.previousStatus !== automationResult.newStatus,
          suggestedStatus: automationResult.newStatus,
          actionsSuggested: automationResult.actionsTaken
        }
      }
    });

  } catch (error: any) {
    console.error('Error getting booking status:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function getValidTransitions(currentStatus: BookingStatus): BookingStatus[] {
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.REQUESTED]: [
      BookingStatus.PAYMENT_PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.PAYMENT_PENDING]: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.CONFIRMED]: [
      BookingStatus.SCHEDULED,
      BookingStatus.REQUIRES_RESCHEDULE,
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.SCHEDULED]: [
      BookingStatus.READY_FOR_SERVICE,
      BookingStatus.IN_PROGRESS,
      BookingStatus.REQUIRES_RESCHEDULE,
      BookingStatus.NO_SHOW,
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.AWAITING_CLIENT_ACTION]: [
      BookingStatus.CONFIRMED,
      BookingStatus.SCHEDULED,
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.READY_FOR_SERVICE]: [
      BookingStatus.IN_PROGRESS,
      BookingStatus.NO_SHOW,
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.IN_PROGRESS]: [
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.COMPLETED]: [
      BookingStatus.ARCHIVED
    ],
    [BookingStatus.CANCELLED_BY_CLIENT]: [
      BookingStatus.ARCHIVED
    ],
    [BookingStatus.CANCELLED_BY_STAFF]: [
      BookingStatus.ARCHIVED
    ],
    [BookingStatus.REQUIRES_RESCHEDULE]: [
      BookingStatus.SCHEDULED,
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.CANCELLED_BY_STAFF
    ],
    [BookingStatus.NO_SHOW]: [
      BookingStatus.SCHEDULED, // If they contact to reschedule
      BookingStatus.CANCELLED_BY_CLIENT,
      BookingStatus.ARCHIVED
    ],
    [BookingStatus.ARCHIVED]: [] // Terminal state
  };

  return validTransitions[currentStatus] || [];
} 