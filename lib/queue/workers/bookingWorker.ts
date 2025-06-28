import { BookingProcessingJob, JobResult } from '../types';
import { PrismaClient, BookingStatus, PaymentStatus } from '@prisma/client';
import { NotificationService } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { withRetry } from '@/lib/utils/retry';

const prisma = new PrismaClient();

/**
 * Worker to process booking-related jobs from the queue
 */
export async function processBookingJob(job: BookingProcessingJob): Promise<JobResult> {
  logger.info(`Processing booking job: ${job.id}`, { jobType: job.type, action: job.action });
  
  try {
    const jobId = job.id || `booking-${Date.now()}`;
    const notificationService = NotificationService.getInstance();
    
    // First verify the booking exists and get current status
    const booking = await withRetry(() => prisma.Booking.findUnique({
      where: { id: job.bookingId },
      include: {
        User_Booking_signerIdToUser: true,
        Service: true,
        Payment: true,
      }
    }), { maxRetries: 3 });
    
    if (!booking) {
      throw new Error(`Booking ${job.bookingId} not found`);
    }
    
    // Handle different booking actions
    switch (job.action) {
      case 'confirm': {
        logger.info(`Confirming booking ${job.bookingId}`);
        
        const updatedBooking = await withRetry(async () => {
          // Update booking status to confirmed
          const result = await prisma.Booking.update({
            where: { id: job.bookingId },
            data: { status: 'CONFIRMED' }
          });
          
          // Send confirmation notification
          await notificationService.sendBookingConfirmation(job.bookingId);
          
          return result;
        }, { maxRetries: 3 });
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            updated: true, 
            bookingId: job.bookingId,
            newStatus: updatedBooking.status
          }
        };
      }
      
      case 'cancel': {
        logger.info(`Cancelling booking ${job.bookingId}`);
        
        // Get cancellation reason from metadata if available
        const cancelReason = job.metadata?.reason || 'No reason provided';
        const cancelledBy = job.metadata?.cancelledBy || 'SYSTEM';
        
        let cancellationStatus: BookingStatus = BookingStatus.CANCELLED_BY_STAFF;
        if (cancelledBy === 'CLIENT') {
          cancellationStatus = BookingStatus.CANCELLED_BY_CLIENT;
        } else if (cancelledBy === 'STAFF') {
          cancellationStatus = BookingStatus.CANCELLED_BY_STAFF;
        }
        
        const updatedBooking = await withRetry(async () => {
          // Update booking status to cancelled with reason
          const result = await prisma.Booking.update({
            where: { id: job.bookingId },
            data: { 
              status: cancellationStatus,
              notes: `${booking.notes || ''}\n[CANCELLED] ${cancelReason}`.trim()
            }
          });
          
          // Send cancellation notification
          await notificationService.sendBookingCancellation(
            job.bookingId, 
            cancelReason, 
            cancelledBy
          );
          
          return result;
        }, { maxRetries: 3 });
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            updated: true, 
            bookingId: job.bookingId,
            newStatus: updatedBooking.status
          }
        };
      }
      
      case 'reschedule': {
        if (!job.metadata?.newDateTime) {
          throw new Error('Missing new date/time for reschedule action');
        }
        
        logger.info(`Rescheduling booking ${job.bookingId} to ${job.metadata.newDateTime}`);
        
        const newDateTime = new Date(job.metadata.newDateTime);
        const oldDateTime = booking.scheduledDateTime;
        
        const updatedBooking = await withRetry(async () => {
          // Update booking with new date/time
          const result = await prisma.Booking.update({
            where: { id: job.bookingId },
            data: { 
              scheduledDateTime: newDateTime,
              status: 'CONFIRMED', // Reset to confirmed if it was pending
              notes: `${booking.notes || ''}\n[RESCHEDULED] From ${oldDateTime.toISOString()} to ${newDateTime.toISOString()}`.trim()
            }
          });
          
          // Send reschedule notification
          await notificationService.sendBookingReschedule(job.bookingId, oldDateTime ?? new Date());
          
          return result;
        }, { maxRetries: 3 });
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            updated: true, 
            bookingId: job.bookingId,
            oldDateTime: (oldDateTime ?? new Date()).toISOString(),
            newDateTime: (updatedBooking.scheduledDateTime ?? new Date()).toISOString()
          }
        };
      }
      
      case 'reminder': {
        logger.info(`Sending reminder for booking ${job.bookingId}`);
        
        await notificationService.sendAppointmentReminder(job.bookingId);
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            reminderSent: true, 
            bookingId: job.bookingId
          }
        };
      }
      
      case 'follow-up': {
        logger.info(`Sending follow-up for booking ${job.bookingId}`);
        
        await notificationService.sendAppointmentFollowUp(job.bookingId);
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            followUpSent: true, 
            bookingId: job.bookingId
          }
        };
      }
      
      case 'payment-check': {
        logger.info(`Checking payment status for booking ${job.bookingId}`);
        
        // Check if payment is completed or expired
        const payment = await prisma.Payment.findFirst({
          where: { bookingId: job.bookingId },
          orderBy: { createdAt: 'desc' }
        });
        
        if (!payment) {
          logger.warn(`No payment found for booking ${job.bookingId}`);
          return {
            success: true,
            jobId,
            processedAt: new Date(),
            result: { 
              paymentFound: false, 
              bookingId: job.bookingId
            }
          };
        }
        
        const now = new Date();
        const expiryTime = new Date(payment.createdAt.getTime() + 24 * 60 * 60 * 1000);
        const paymentExpired = payment.status === 'PENDING' && expiryTime < now;
        
        if (paymentExpired) {
          logger.info(`Payment ${payment.id} for booking ${job.bookingId} has expired`);
          
          await withRetry(async () => {
            // Update payment status
            await prisma.Payment.update({
              where: { id: payment.id },
              data: { status: PaymentStatus.FAILED }
            });
            
            // Update booking status if necessary
            if (booking.status === 'PAYMENT_PENDING') {
              await prisma.Booking.update({
                where: { id: job.bookingId },
                data: { status: BookingStatus.CANCELLED_BY_CLIENT }
              });
            }
            
            // Send payment expired notification
            await notificationService.sendPaymentExpiredNotification(job.bookingId);
          }, { maxRetries: 3 });
        }
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            paymentFound: true,
            paymentStatus: paymentExpired ? 'EXPIRED' : payment.status,
            bookingId: job.bookingId
          }
        };
      }
      
      default:
        throw new Error(`Unsupported booking action: ${job.action}`);
    }
  } catch (error) {
    logger.error(`Error processing booking job ${job.id || 'unknown'}:`, { 
      error: error.message,
      jobDetails: job,
      stack: error.stack
    });
    
    return {
      success: false,
      jobId: job.id || `booking-${Date.now()}`,
      processedAt: new Date(),
      error: error.message
    };
  }
}
