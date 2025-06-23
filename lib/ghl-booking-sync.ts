/**
 * Booking Status Synchronization System
 * Keeps booking statuses synchronized between our database and GHL
 */

import { prisma } from './prisma';
import { BookingStatus } from '@prisma/client';
import { logger, logBookingEvent } from './logger';
import * as ghl from './ghl/api';

export interface BookingSyncResult {
  success: boolean;
  bookingId: string;
  previousStatus?: BookingStatus;
  newStatus: BookingStatus;
  ghlUpdated: boolean;
  error?: string;
  changesApplied: string[];
}

/**
 * Update booking status and sync with GHL
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  reason?: string
): Promise<BookingSyncResult> {
  const result: BookingSyncResult = {
    success: false,
    bookingId,
    newStatus,
    ghlUpdated: false,
    changesApplied: []
  };

  try {
    // Get current booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        signer: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    if (!booking) {
      result.error = 'Booking not found';
      return result;
    }

    result.previousStatus = booking.status;

    // Check if status actually changed
    if (booking.status === newStatus) {
      result.success = true;
      return result;
    }

    // Update booking in database
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        notes: reason ? 
          `${booking.notes || ''}\n[${new Date().toISOString()}] Status: ${newStatus} - ${reason}`.trim() :
          booking.notes,
        updatedAt: new Date()
      }
    });

    result.changesApplied.push(`Status updated: ${result.previousStatus} → ${newStatus}`);
    
    logBookingEvent('Status Updated', bookingId, {
      previousStatus: result.previousStatus,
      newStatus,
      reason
    });

    // Sync with GHL
    if (booking.ghlContactId) {
      try {
        await syncBookingWithGHL(updatedBooking, newStatus, reason);
        result.ghlUpdated = true;
        result.changesApplied.push('GHL contact updated');
      } catch (ghlError) {
        logger.error('Failed to sync booking status with GHL', 'BOOKING_SYNC', ghlError as Error, {
          bookingId,
          newStatus,
          contactId: booking.ghlContactId
        });
      }
    }

    result.success = true;
    return result;

  } catch (error) {
    logger.error('Failed to update booking status', 'BOOKING_SYNC', error as Error, {
      bookingId,
      newStatus,
      reason
    });
    result.error = (error as Error).message;
    return result;
  }
}

/**
 * Sync booking data with GHL
 */
async function syncBookingWithGHL(booking: any, status: BookingStatus, reason?: string): Promise<void> {
  if (!booking.ghlContactId) {
    throw new Error('No GHL contact ID available for sync');
  }

  // Determine GHL tags based on status
  const tagsToAdd: string[] = [];
  const tagsToRemove: string[] = [
    'status:booking_confirmed',
    'status:booking_pendingpayment',
    'status:booking_cancelled',
    'status:booking_completed',
    'status:booking_inprogress'
  ];

  // Add new status tag
  switch (status) {
    case BookingStatus.CONFIRMED:
      tagsToAdd.push('status:booking_confirmed');
      break;
    case BookingStatus.PAYMENT_PENDING:
      tagsToAdd.push('status:booking_pendingpayment');
      break;
    case BookingStatus.CANCELLED_BY_CLIENT:
    case BookingStatus.CANCELLED_BY_STAFF:
      tagsToAdd.push('status:booking_cancelled');
      break;
    case BookingStatus.COMPLETED:
      tagsToAdd.push('status:booking_completed');
      break;
    case BookingStatus.IN_PROGRESS:
      tagsToAdd.push('status:booking_inprogress');
      break;
  }

  // Update custom fields
  const customFields = {
    cf_booking_status: status,
    cf_status_updated_at: new Date().toISOString(),
    cf_booking_id: booking.id
  };

  if (reason) {
    customFields.cf_last_status_reason = reason;
  }

  // Remove old tags and add new ones
  await ghl.removeTagsFromContact(booking.ghlContactId, tagsToRemove);
  await ghl.addTagsToContact(booking.ghlContactId, tagsToAdd);
  await ghl.updateContactCustomFields(booking.ghlContactId, customFields);

  logger.info('Booking synced with GHL successfully', 'BOOKING_SYNC', {
    bookingId: booking.id,
    contactId: booking.ghlContactId,
    status,
    tagsAdded: tagsToAdd
  });
}

/**
 * Sync all booking statuses (periodic sync)
 */
export async function syncAllBookings(): Promise<{ synced: number; errors: string[] }> {
  const result = { synced: 0, errors: [] as string[] };

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ghlContactId: { not: null },
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.PAYMENT_PENDING,
            BookingStatus.IN_PROGRESS
          ]
        }
      },
      include: {
        service: true
      }
    });

    for (const booking of bookings) {
      try {
        await syncBookingWithGHL(booking, booking.status);
        result.synced++;
      } catch (error) {
        const errorMsg = `Failed to sync booking ${booking.id}: ${(error as Error).message}`;
        result.errors.push(errorMsg);
      }
    }

  } catch (error) {
    result.errors.push(`Sync failed: ${(error as Error).message}`);
  }

  return result;
} 