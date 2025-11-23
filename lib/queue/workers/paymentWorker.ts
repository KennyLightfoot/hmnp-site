import { PaymentProcessingJob, JobResult } from '../types';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { PrismaClient } from '@/lib/prisma-types';
import { NotificationService } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { withRetry } from '@/lib/utils/retry';

const prisma = new PrismaClient();

/**
 * Worker to process payment-related jobs from the queue
 */
export async function processPaymentJob(job: PaymentProcessingJob): Promise<JobResult> {
  logger?.info(`Processing payment job: ${job?.id}`, { 
    jobType: job?.type, 
    action: job?.action,
    paymentId: job?.paymentId,
    bookingId: job?.bookingId 
  });
  
  try {
    const jobId = job?.id || `payment-${Date?.now()}`;
    const notificationService = NotificationService?.getInstance();
    
    // Handle different payment actions
    switch (job?.action) {
      case 'create': {
        if (!job?.bookingId || !job?.amount) {
          throw new Error('Missing required data (bookingId or amount) for payment creation');
        }
        
        logger?.info(`Creating payment for booking ${job?.bookingId} with amount ${job?.amount}`);
        
        // Get booking to verify it exists
        const booking = await prisma?.booking?.findUnique({
          where: { id: job?.bookingId },
          include: { User_Booking_signerIdToUser: true, service: true }
        });
        
        if (!booking) {
          throw new Error(`Booking ${job?.bookingId} not found`);
        }
        
        // Create payment record
        const payment = await withRetry(async () => {
          return await prisma?.payment?.create({
            data: {
              bookingId: job?.bookingId || '',
              amount: job?.amount || 0,
              status: 'PENDING',
              provider: 'STRIPE'
            }
          });
        }, { maxRetries: 3 });
        
        // Update booking status
        await withRetry(async () => {
          await prisma?.booking?.update({
            where: { id: job?.bookingId },
            data: { status: 'PAYMENT_PENDING' }
          });
          
          // Send payment request notification
          if (job?.bookingId && job?.amount) {
            await notificationService?.sendPaymentRequestNotification(
              job.bookingId,
              payment?.id,
              job.amount,
              'USD'
            );
          }
        }, { maxRetries: 3 });
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            paymentCreated: true,
            paymentId: payment?.id,
            bookingId: job?.bookingId,
            status: 'PENDING'
          }
        };
      }
      
      case 'capture': {
        if (!job?.paymentId) {
          throw new Error('Missing paymentId for payment capture');
        }
        
        logger?.info(`Capturing payment ${job?.paymentId}`);
        
        // Get payment to verify it exists and is in valid state
        const payment = await prisma?.payment?.findUnique({
          where: { id: job?.paymentId },
          include: { booking: true }
        });
        
        if (!payment) {
          throw new Error(`Payment ${job?.paymentId} not found`);
        }
        
        if (payment?.status !== 'PENDING') {
          throw new Error(`Cannot capture payment in status ${payment?.status}`);
        }
        
        // Update payment and booking statuses
        const updatedPayment = await withRetry(async () => {
          // Update payment status
          const result = await prisma?.payment?.update({
            where: { id: job?.paymentId },
            data: { 
              status: 'COMPLETED',
              notes: `Payment captured - ${new Date().toISOString()}`
            }
          });
          
          // Update booking status if needed
          if (payment?.booking && payment?.booking?.status === 'PAYMENT_PENDING') {
            await prisma?.booking?.update({
              where: { id: payment?.bookingId },
              data: { status: 'CONFIRMED' }
            });
          }
          
          // Send payment received notification
          await notificationService?.sendPaymentReceivedNotification(
            payment?.bookingId,
            Number(payment?.amount),
            'USD' // Default currency since currency field doesn't exist
          );
          
          return result;
        }, { maxRetries: 3 });
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            paymentCaptured: true,
            paymentId: updatedPayment?.id,
            bookingId: updatedPayment?.bookingId,
            newStatus: 'COMPLETED'
          }
        };
      }
      
      case 'refund': {
        if (!job?.paymentId) {
          throw new Error('Missing paymentId for refund');
        }
        
        logger?.info(`Processing refund for payment ${job?.paymentId}`);
        
        // Get payment to verify it exists and is in valid state
        const payment = await prisma?.payment?.findUnique({
          where: { id: job?.paymentId },
          include: { booking: true }
        });
        
        if (!payment) {
          throw new Error(`Payment ${job?.paymentId} not found`);
        }
        
        if (payment?.status !== 'COMPLETED') {
          throw new Error(`Cannot refund payment in status ${payment?.status}`);
        }
        
        // Calculate refund amount - full amount if not specified
        const refundAmount = job?.amount || payment?.amount;
        const isPartialRefund = refundAmount < payment?.amount;
        
        // Update payment status
        const updatedPayment = await withRetry(async () => {
          // Note: refund model doesn't exist in schema
          // In a real implementation, you'd create a Refund model
          logger?.info('Would create refund record', {
            paymentId: job?.paymentId,
            amount: refundAmount,
            reason: job?.metadata?.reason || 'Customer request'
          });
          
          const refund = { id: `refund_${Date.now()}` };
          
          // Update payment status
          const newPaymentStatus = isPartialRefund ? 'PARTIALLY_REFUNDED' : 'REFUNDED';
          const result = await prisma?.payment?.update({
            where: { id: job?.paymentId },
            data: { 
              status: newPaymentStatus,
              refundedAmount: {
                increment: refundAmount
              },
              notes: `Refund processed - ${new Date().toISOString()}`
            }
          });
          
          // Send refund notification
          await notificationService?.sendRefundNotification(
            payment?.bookingId,
            Number(refundAmount),
            'USD', // Default currency since currency field doesn't exist
            'Customer request' // Default reason since refund object doesn't have reason property
          );
          
          return result;
        }, { maxRetries: 3 });
        
        return {
          success: true,
          jobId,
          processedAt: new Date(),
          result: { 
            refundProcessed: true,
            paymentId: updatedPayment?.id,
            bookingId: updatedPayment?.bookingId,
            refundAmount: refundAmount,
            newStatus: updatedPayment?.status
          }
        };
      }
      
      case 'check-status': {
        if (!job?.paymentId && !job?.bookingId) {
          throw new Error('Either paymentId or bookingId is required for status check');
        }
        
        if (job?.paymentId) {
          logger?.info(`Checking status for payment ${job?.paymentId}`);
          
          // Get payment details
          const payment = await prisma?.payment?.findUnique({
            where: { id: job?.paymentId }
          });
          
          if (!payment) {
            throw new Error(`Payment ${job?.paymentId} not found`);
          }
          
          // Check for expired payments
          const now = new Date();
          const expiryTime = new Date(payment?.createdAt?.getTime() + 24 * 60 * 60 * 1000);
          if (payment?.status === 'PENDING' && expiryTime < now) {
            // Update expired payment
            await withRetry(async () => {
              await prisma?.payment?.update({
                where: { id: job?.paymentId },
                data: { status: 'FAILED' }
              });
              
              // If there's a booking, update its status too
              if (payment?.bookingId) {
                await prisma?.booking?.update({
                  where: { id: payment?.bookingId },
                  data: { status: 'CANCELLED_BY_CLIENT' }
                });
                
                // Send payment expired notification
                await notificationService?.sendPaymentExpiredNotification(payment?.bookingId);
              }
            }, { maxRetries: 3 });
            
            return {
              success: true,
              jobId,
              processedAt: new Date(),
              result: { 
                paymentId: payment?.id,
                bookingId: payment?.bookingId,
                previousStatus: payment?.status,
                newStatus: 'FAILED',
                expired: true
              }
            };
          }
          
          return {
            success: true,
            jobId,
            processedAt: new Date(),
            result: { 
              paymentId: payment?.id,
              bookingId: payment?.bookingId,
              status: payment?.status,
              expired: false
            }
          };
        } else {
          // Check by booking ID
          logger?.info(`Checking payment status for booking ${job?.bookingId}`);
          
          // Get the most recent payment
          const payment = await prisma?.payment?.findFirst({
            where: { bookingId: job?.bookingId },
            orderBy: { createdAt: 'desc' }
          });
          
          if (!payment) {
            return {
              success: true,
              jobId,
              processedAt: new Date(),
              result: { 
                bookingId: job?.bookingId,
                paymentFound: false
              }
            };
          }
          
          // Check for expired payments
          const now = new Date();
          const expiryTime = new Date(payment?.createdAt?.getTime() + 24 * 60 * 60 * 1000);
          if (payment?.status === 'PENDING' && expiryTime < now) {
            // Update expired payment
            await withRetry(async () => {
              await prisma?.payment?.update({
                where: { id: payment?.id },
                data: { status: 'FAILED' }
              });
              
              // Update booking status
              await prisma?.booking?.update({
                where: { id: job?.bookingId },
                data: { status: 'CANCELLED_BY_CLIENT' }
              });
              
              // Send payment expired notification
              if (job?.bookingId) {
                await notificationService?.sendPaymentExpiredNotification(job.bookingId);
              }
            }, { maxRetries: 3 });
            
            return {
              success: true,
              jobId,
              processedAt: new Date(),
              result: { 
                paymentId: payment?.id,
                bookingId: job?.bookingId,
                previousStatus: payment?.status,
                newStatus: 'FAILED',
                expired: true
              }
            };
          }
          
          return {
            success: true,
            jobId,
            processedAt: new Date(),
            result: { 
              paymentId: payment?.id,
              bookingId: job?.bookingId,
              status: payment?.status,
              expired: false
            }
          };
        }
      }
      
      default:
        throw new Error(`Unsupported payment action: ${job?.action}`);
    }
  } catch (error) {
    logger?.error(`Error processing payment job ${job?.id || 'unknown'}:`, { 
      error: error instanceof Error ? getErrorMessage(error) : String(error),
      jobDetails: job,
      stack: error instanceof Error ? error?.stack : undefined
    });
    
    return {
      success: false,
      jobId: job?.id || `payment-${Date?.now()}`,
      processedAt: new Date(),
      error: error instanceof Error ? getErrorMessage(error) : String(error)
    };
  }
}
