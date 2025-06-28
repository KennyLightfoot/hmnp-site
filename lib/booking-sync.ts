/**
 * Booking Status Synchronization System
 * Keeps booking statuses synchronized between our database and GHL
 */

import { prisma } from './prisma';
import { BookingStatus } from '@prisma/client';
import { logger, logBookingEvent } from './logger';
import * as ghl from './ghl/api';
import { ghlApiRequest } from './ghl/error-handler';
import { BookingWithUserAndService } from './types/prismaHelpers';

export interface BookingSyncResult {
  success: boolean;
  bookingId: string;
  previousStatus?: BookingStatus;
  newStatus: BookingStatus;
  ghlUpdated: boolean;
  error?: string;
  changesApplied: string[];
}

export interface SyncJob {
  id: string;
  bookingId: string;
  action: 'STATUS_UPDATE' | 'CUSTOM_FIELDS' | 'TAGS' | 'FULL_SYNC';
  data: any;
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  createdAt: Date;
}

// In-memory queue for sync jobs (in production, use Redis or database)
const syncQueue: SyncJob[] = [];
const MAX_SYNC_ATTEMPTS = 3;
const SYNC_RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

/**
 * Update booking status and sync with GHL
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  reason?: string,
  metadata?: Record<string, any>
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
    const booking = await prisma.Booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        User_Booking_signerIdToUser: {
          select: { name: true, email: true }
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
      logger.info(`Booking status unchanged: ${newStatus}`, 'BOOKING_SYNC', {
        bookingId,
        status: newStatus
      });
      result.success = true;
      return result;
    }

    // Update booking in database
    const updatedBooking = await prisma.Booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        notes: reason ? 
          `${booking.notes || ''}\n\n[${new Date().toISOString()}] Status changed to ${newStatus}: ${reason}`.trim() :
          booking.notes,
        ...metadata
      }
    });

    result.changesApplied.push(`Status updated: ${result.previousStatus} → ${newStatus}`);
    
    logBookingEvent('Status Updated', bookingId, {
      previousStatus: result.previousStatus,
      newStatus,
      reason,
      metadata
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
        
        // Queue for retry
        queueSyncJob(bookingId, 'STATUS_UPDATE', { newStatus, reason, metadata });
        result.changesApplied.push('GHL sync queued for retry');
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
  const tagsToRemove: string[] = [];

  // Remove old status tags
  const oldStatusTags = [
    'status:booking_confirmed',
    'status:booking_pendingpayment',
    'status:booking_cancelled',
    'status:booking_completed',
    'status:booking_inprogress'
  ];
  tagsToRemove.push(...oldStatusTags);

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
  const customFields: any = {
    cf_booking_status: status,
    cf_status_updated_at: new Date().toISOString(),
    cf_booking_id: booking.id,
    ...(reason ? { cf_last_status_reason: reason } : {})
  };

  // Remove old tags
  if (tagsToRemove.length > 0) {
    await ghl.removeTagsFromContact(booking.ghlContactId, tagsToRemove);
  }

  // Add new tags
  if (tagsToAdd.length > 0) {
    await ghl.addTagsToContact(booking.ghlContactId, tagsToAdd);
  }

  // Update custom fields
  await ghl.updateContactCustomFields(booking.ghlContactId, customFields);

  logger.info('Booking synced with GHL successfully', 'BOOKING_SYNC', {
    bookingId: booking.id,
    contactId: booking.ghlContactId,
    status,
    tagsAdded: tagsToAdd,
    tagsRemoved: tagsToRemove
  });
}

/**
 * Full sync of booking data with GHL
 */
export async function fullSyncBookingWithGHL(bookingId: string): Promise<BookingSyncResult> {
  const result: BookingSyncResult = {
    success: false,
    bookingId,
    newStatus: BookingStatus.PAYMENT_PENDING, // Will be updated
    ghlUpdated: false,
    changesApplied: []
  };

  try {
    const booking = await prisma.Booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        User_Booking_signerIdToUser: {
          select: { name: true, email: true }
        }
      }
    });

    if (!booking) {
      result.error = 'Booking not found';
      return result;
    }

    result.newStatus = booking.status;

    if (!booking.ghlContactId) {
      result.error = 'No GHL contact ID available';
      return result;
    }

    // Sync all booking data with GHL
    const customFields = {
      cf_booking_id: booking.id,
      cf_booking_status: booking.status,
      cf_service_type: booking.Service?.name || 'Unknown',
              cf_appointment_date: booking.scheduledDateTime ?
          new Date(booking.scheduledDateTime).toLocaleDateString('en-US') : '',
        cf_appointment_time: booking.scheduledDateTime ?
          new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }) : '',
      cf_service_address: booking.serviceAddress || '',
      cf_total_amount: booking.totalAmount?.toString() || '0',
      cf_deposit_status: booking.depositStatus || 'NOT_REQUIRED',
      cf_payment_url: booking.stripePaymentUrl || ''
    };

    await ghl.updateContactCustomFields(booking.ghlContactId, customFields);
    result.changesApplied.push('All custom fields synced');

    // Sync tags
    await syncBookingWithGHL(booking, booking.status);
    result.changesApplied.push('Tags synced');

    result.ghlUpdated = true;
    result.success = true;

    logger.info('Full booking sync with GHL completed', 'BOOKING_SYNC', {
      bookingId,
      contactId: booking.ghlContactId,
      changesApplied: result.changesApplied
    });

    return result;

  } catch (error) {
    logger.error('Failed to perform full sync with GHL', 'BOOKING_SYNC', error as Error, {
      bookingId
    });
    result.error = (error as Error).message;
    return result;
  }
}

/**
 * Queue a sync job for later processing
 */
function queueSyncJob(
  bookingId: string,
  action: SyncJob['action'],
  data: any,
  delay = 0
): void {
  const job: SyncJob = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bookingId,
    action,
    data,
    attempts: 0,
    maxAttempts: MAX_SYNC_ATTEMPTS,
    scheduledFor: new Date(Date.now() + delay),
    createdAt: new Date()
  };

  syncQueue.push(job);
  
  logger.info('Sync job queued', 'BOOKING_SYNC', {
    jobId: job.id,
    bookingId,
    action,
    scheduledFor: job.scheduledFor
  });
}

/**
 * Process queued sync jobs
 */
export async function processSyncQueue(): Promise<void> {
  const now = new Date();
  const readyJobs = syncQueue.filter(job => 
    job.scheduledFor <= now && job.attempts < job.maxAttempts
  );

  if (readyJobs.length === 0) {
    return;
  }

  logger.info(`Processing ${readyJobs.length} sync jobs`, 'BOOKING_SYNC');

  for (const job of readyJobs) {
    try {
      job.attempts++;
      
      logger.info(`Processing sync job ${job.id} (attempt ${job.attempts})`, 'BOOKING_SYNC', {
        bookingId: job.bookingId,
        action: job.action
      });

      switch (job.action) {
        case 'STATUS_UPDATE':
          await updateBookingStatus(
            job.bookingId,
            job.data.newStatus,
            job.data.reason,
            job.data.metadata
          );
          break;
        case 'FULL_SYNC':
          await fullSyncBookingWithGHL(job.bookingId);
          break;
        case 'CUSTOM_FIELDS':
          const booking = await prisma.Booking.findUnique({
            where: { id: job.bookingId }
          });
          if (booking?.ghlContactId) {
            await ghl.updateContactCustomFields(booking.ghlContactId, job.data);
          }
          break;
        case 'TAGS':
          const bookingForTags = await prisma.Booking.findUnique({
            where: { id: job.bookingId }
          });
          if (bookingForTags?.ghlContactId) {
            if (job.data.add?.length > 0) {
              await ghl.addTagsToContact(bookingForTags.ghlContactId, job.data.add);
            }
            if (job.data.remove?.length > 0) {
              await ghl.removeTagsFromContact(bookingForTags.ghlContactId, job.data.remove);
            }
          }
          break;
      }

      // Remove successful job
      const jobIndex = syncQueue.findIndex(j => j.id === job.id);
      if (jobIndex !== -1) {
        syncQueue.splice(jobIndex, 1);
      }

      logger.info(`Sync job ${job.id} completed successfully`, 'BOOKING_SYNC');

    } catch (error) {
      logger.error(`Sync job ${job.id} failed (attempt ${job.attempts})`, 'BOOKING_SYNC', error as Error, {
        bookingId: job.bookingId,
        action: job.action
      });

      if (job.attempts >= job.maxAttempts) {
        // Remove failed job after max attempts
        const jobIndex = syncQueue.findIndex(j => j.id === job.id);
        if (jobIndex !== -1) {
          syncQueue.splice(jobIndex, 1);
        }
        
        logger.error(`Sync job ${job.id} permanently failed after ${job.attempts} attempts`, 'BOOKING_SYNC', undefined, {
          bookingId: job.bookingId,
          action: job.action
        });
      } else {
        // Schedule retry with exponential backoff
        job.scheduledFor = new Date(Date.now() + SYNC_RETRY_DELAYS[job.attempts - 1]);
      }
    }
  }
}

/**
 * Sync all booking statuses from GHL (periodic full sync)
 */
export async function syncAllBookingsFromGHL(): Promise<{ synced: number; errors: string[] }> {
  const result = { synced: 0, errors: [] as string[] };

  try {
    // Get all active bookings with GHL contact IDs
    const bookings = await prisma.Booking.findMany({
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
      select: {
        id: true,
        ghlContactId: true,
        status: true
      }
    });

    logger.info(`Starting full sync for ${bookings.length} bookings`, 'BOOKING_SYNC');

    for (const booking of bookings) {
      try {
        await fullSyncBookingWithGHL(booking.id);
        result.synced++;
      } catch (error) {
        const errorMsg = `Failed to sync booking ${booking.id}: ${(error as Error).message}`;
        result.errors.push(errorMsg);
        logger.error(errorMsg, 'BOOKING_SYNC', error as Error);
      }
    }

    logger.info(`Full sync completed: ${result.synced} synced, ${result.errors.length} errors`, 'BOOKING_SYNC');

  } catch (error) {
    logger.error('Failed to perform full sync', 'BOOKING_SYNC', error as Error);
    result.errors.push(`Full sync failed: ${(error as Error).message}`);
  }

  return result;
}

/**
 * Get sync queue status
 */
export function getSyncQueueStatus(): {
  totalJobs: number;
  pendingJobs: number;
  failedJobs: number;
  nextJob?: Date;
} {
  const now = new Date();
  const pendingJobs = syncQueue.filter(job => job.attempts < job.maxAttempts);
  const failedJobs = syncQueue.filter(job => job.attempts >= job.maxAttempts);
  
  const nextJob = pendingJobs
    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())[0]?.scheduledFor;

  return {
    totalJobs: syncQueue.length,
    pendingJobs: pendingJobs.length,
    failedJobs: failedJobs.length,
    nextJob
  };
}

// Auto-process sync queue every 30 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(processSyncQueue, 30000);
} 