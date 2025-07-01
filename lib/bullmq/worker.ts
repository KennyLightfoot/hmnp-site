import Bull from 'bull';
import { PrismaClient, BookingStatus, NotificationType, NotificationMethod, PaymentStatus, PaymentProvider } from '@prisma/client';
import { NotificationJob, BookingProcessingJob, PaymentProcessingJob, JobResult } from '../queue/types';
import { getQueues } from './config';
import { logger } from '../logger';
import { NotificationService } from '../notifications';
import * as ghl from '../ghl';

// Import our new type definitions
import { BookingWithRelations, Payment, Service } from '../types/prisma';
import { NotificationResult, SendNotificationRequest } from '../types/notifications';
import { GHLContact, GHLAppointment, GHLResponse } from '../types/ghl';

const prisma = new PrismaClient();

/**
 * BullQueueWorker service for processing background jobs with enhanced
 * reliability, retry logic, and concurrency control
 */
export class BullQueueWorker {
  private static instance: BullQueueWorker;
  private isProcessing: boolean = false;
  private queues: ReturnType<typeof getQueues> | null = null;
  
  // Configure concurrency for each queue
  private concurrency = {
    notifications: 5,         // Process 5 notifications at once
    bookingProcessing: 3,     // Process 3 booking jobs at once
    paymentProcessing: 2      // Process 2 payment jobs at once
  };
  
  constructor() {
    this.queues = getQueues();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BullQueueWorker {
    if (!BullQueueWorker.instance) {
      BullQueueWorker.instance = new BullQueueWorker();
    }
    return BullQueueWorker.instance;
  }

  /**
   * Process a notification job
   */
  private async processNotificationJob(job: Bull.Job<NotificationJob>): Promise<JobResult> {
    const jobData = job.data;
    logger.info(`Processing notification job ${job.id}`, {
      type: jobData.type,
      notificationType: jobData.notificationType,
      recipientId: jobData.recipientId,
      bookingId: jobData.bookingId
    });
    
    try {
      // Extract recipient information - this could come from jobData directly or we may need to query
      // the database if only recipientId is provided
      const recipient = {
        email: jobData.recipientId, // Assuming recipientId contains an email
        firstName: jobData.templateData?.firstName,
        lastName: jobData.templateData?.lastName
      };
      
      // Extract content information from job data
      const content = {
        subject: jobData.subject,
        message: jobData.message || '',
        metadata: jobData.templateData
      };
      
      // Determine which methods to use, default to EMAIL if not specified
      const methods: NotificationMethod[] = [NotificationMethod.EMAIL];
      
      // Send the notification using the NotificationService
      const notificationResult = await NotificationService.sendNotification({
        bookingId: jobData.bookingId || '',
        type: jobData.notificationType as NotificationType,
        recipient,
        content,
        methods,
        skipDuplicateCheck: true, // Since we're processing from a queue, assume duplication already handled
        forceResend: true // Force sending even if previously sent
      });
      
      logger.info(`Notification processing complete`, { 
        success: notificationResult.success,
        results: notificationResult.results 
      });
      
      return {
        success: notificationResult.success,
        jobId: job.id?.toString() || 'unknown',
        processedAt: new Date(),
        result: notificationResult.results
      };
    } catch (error: any) {
      logger.error(`Error processing notification job: ${error?.message || 'Unknown error'}`, { error, jobId: job.id });
      
      // Determine if we should retry based on attempt count
      const maxRetries = 3; // Default max retries
      const attempts = job.attemptsMade || 0;
      const shouldRetry = attempts < maxRetries;
      
      if (shouldRetry) {
        throw error; // This will trigger Bull's retry mechanism
      }
      
      return {
        success: false,
        jobId: job.id?.toString() || 'unknown',
        processedAt: new Date(),
        error: error.message || 'Unknown error'
      };
    }
  }
  
  // Process a booking job with proper error handling
  private async processBookingJob(job: Bull.Job<BookingProcessingJob>): Promise<JobResult> {
    const jobData = job.data;
    logger.info(`Processing booking job ${job.id} for booking ${jobData.bookingId} - action: ${jobData.action}`);
    
    try {
      const { bookingId, action, metadata } = jobData;
      
      // Get the booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          User_Booking_signerIdToUser: true,
          Service: true,
          Payment: true
        }
      });
      
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }
      
      // Process based on action type
      switch (action) {
        case 'confirm':
          // Handle booking confirmation
          const confirmResult = await this.confirmBooking(booking);
          await this.syncBookingToGHL(booking, 'confirmed');
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: confirmResult
          };
          
        case 'cancel':
          // Handle booking cancellation
          const cancelResult = await this.cancelBooking(booking, metadata?.reason as string, metadata?.cancelledByStaff as boolean);
          await this.syncBookingToGHL(booking, 'cancelled');
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: cancelResult
          };
          
        case 'reschedule':
          // Handle booking rescheduling
          if (!metadata?.newDateTime) {
            throw new Error('Missing newDateTime for reschedule action');
          }
          
          const rescheduleResult = await this.rescheduleBooking(
            booking,
            new Date(metadata.newDateTime as string)
          );
          await this.syncBookingToGHL(booking, 'rescheduled');
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: rescheduleResult
          };
          
        case 'reminder':
          // Send reminder notification
          const reminderResult = await NotificationService.sendNotification({
            bookingId,
            type: NotificationType.APPOINTMENT_REMINDER_24HR,
            recipient: {
              email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail || '',
            },
            content: {
              subject: 'Appointment Reminder',
              message: 'This is a reminder for your upcoming appointment.',
            },
            methods: [NotificationMethod.EMAIL],
          });
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: reminderResult
          };
          
        case 'follow-up':
          // Send follow-up notification after service
          const followUpResult = await NotificationService.sendNotification({
            bookingId,
            type: NotificationType.POST_SERVICE_FOLLOWUP,
            recipient: {
              email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail || '',
            },
            content: {
              subject: 'How did we do?',
              message: 'We hope your service went well. Let us know if you have any feedback!',
            },
            methods: [NotificationMethod.EMAIL],
          });
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: followUpResult
          };
          
        case 'payment-check':
          // Check if payment is still pending and take appropriate action
          const paymentCheckResult = await this.checkBookingPaymentStatus(booking);
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: paymentCheckResult
          };
          
        default:
          throw new Error(`Unknown booking action: ${action}`);
      }
    } catch (error: any) {
      logger.error(`Error processing booking job: ${error?.message || 'Unknown error'}`, { error, jobId: job.id });
      
      // Determine if we should retry based on error type and retry count
      const shouldRetry = (jobData.retryCount ?? 0) < (jobData.maxRetries || 3);
      
      if (shouldRetry) {
        throw error; // This will trigger Bull's retry mechanism
      }
      
      return {
        success: false,
        jobId: job.id?.toString() || 'unknown',
        processedAt: new Date(),
        error: error.message || 'Unknown error',
      };
    }
  }
  
  // Helper: Confirm a booking
  private async confirmBooking(booking: any): Promise<any> {
    try {
      // Update booking to confirmed status
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CONFIRMED }
      });
      
      // Send confirmation email
      await NotificationService.sendNotification({
        bookingId: booking.id,
        type: NotificationType.BOOKING_CONFIRMATION,
        recipient: { email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail || '' },
        methods: [NotificationMethod.EMAIL],
        content: {
          subject: 'Your booking is confirmed',
          message: `Your booking for ${booking.Service?.name || 'our service'} has been confirmed.`
        }
      });
      
      // Sync updated status to GHL
      await this.syncBookingToGHL(booking, 'confirmed');
      
      return { success: true, booking: updatedBooking };
    } catch (error: any) {
      logger.error(`Error confirming booking ${booking.id}:`, error);
      throw error;
    }
  }
  
  // Helper: Cancel a booking
  private async cancelBooking(booking: any, reason?: string, cancelledByStaff?: boolean): Promise<any> {
    try {
      // Determine status based on who cancelled
      const status = cancelledByStaff ? 
        BookingStatus.CANCELLED_BY_STAFF : 
        BookingStatus.CANCELLED_BY_CLIENT;
      
      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: { 
          status,
          notes: booking.notes 
            ? `${booking.notes}\n\nCancellation: ${reason || 'No reason provided'} - ${new Date().toISOString()}` 
            : `Cancellation: ${reason || 'No reason provided'} - ${new Date().toISOString()}`
        }
      });
      
      // Send cancellation email
      await NotificationService.sendNotification({
        bookingId: booking.id,
        type: NotificationType.BOOKING_CANCELLED,
        recipient: { email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail || '' },
        methods: [NotificationMethod.EMAIL],
        content: {
          subject: 'Your booking has been cancelled',
          message: `Your booking for ${booking.Service?.name || 'our service'} has been cancelled. ${reason ? 'Reason: ' + reason : ''}`
        }
      });
      
      // Sync cancellation to GHL
      await this.syncBookingToGHL(booking, 'cancelled');
      
      return { success: true, booking: updatedBooking };
    } catch (error: any) {
      logger.error(`Error cancelling booking ${booking.id}:`, error);
      throw error;
    }
  }
  
  // Helper: Reschedule a booking
  private async rescheduleBooking(booking: any, newDateTime: Date): Promise<any> {
    try {
      // Update booking with new scheduled time
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: { 
          status: BookingStatus.SCHEDULED,
          scheduledDateTime: newDateTime,
          notes: booking.notes 
            ? `${booking.notes}\n\nRescheduled to ${newDateTime.toISOString()} - ${new Date().toISOString()}` 
            : `Rescheduled to ${newDateTime.toISOString()} - ${new Date().toISOString()}`
        }
      });
      
      // Send reschedule notification
      await NotificationService.sendNotification({
        bookingId: booking.id,
        type: NotificationType.BOOKING_RESCHEDULED,
        recipient: { email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail || '' },
        methods: [NotificationMethod.EMAIL],
        content: {
          subject: 'Your booking has been rescheduled',
          message: `Your booking for ${booking.Service?.name || 'our service'} has been rescheduled to ${new Date(newDateTime).toLocaleString()}.`
        }
      });
      
      // Sync rescheduling to GHL
      await this.syncBookingToGHL(booking, 'rescheduled');
      
      return { success: true, booking: updatedBooking };
    } catch (error: any) {
      logger.error(`Error rescheduling booking ${booking.id}:`, error);
      throw error;
    }
  }
  
  // Helper: Check booking payment status
  private async checkBookingPaymentStatus(booking: any): Promise<any> {
    try {
      const pendingPayments = booking.Payment.filter((p: any) => p.status === PaymentStatus.PENDING);
      
      if (pendingPayments.length === 0) {
        logger.info(`No pending payments found for booking ${booking.id}`);
        return { success: true, hasPendingPayments: false };
      }
      
      // This is just a check - actual payment reminder logic is handled by the scheduler
      logger.info(`Found ${pendingPayments.length} pending payments for booking ${booking.id}`);
      
      return { 
        success: true, 
        hasPendingPayments: true,
        pendingPaymentCount: pendingPayments.length
      };
    } catch (error: any) {
      logger.error(`Error checking payment status for booking ${booking.id}:`, error);
      throw error;
    }
  }
  
  // Helper: Sync booking to GHL
  private async syncBookingToGHL(booking: any, eventType: 'created' | 'confirmed' | 'cancelled' | 'rescheduled'): Promise<any> {
    try {
      // Skip GHL sync if no email is available
      const userEmail = booking.User_Booking_signerIdToUser?.email || booking.customerEmail;
      if (!userEmail) {
        logger.warn(`Cannot sync booking ${booking.id} to GHL: No email available`);
        return { success: false, reason: 'No email available' };
      }
      
      // Get contact from GHL
      const contact = await ghl.getContactByEmail(userEmail);
      
      if (!contact || !contact.id) {
        logger.warn(`Contact not found in GHL for email: ${userEmail}`);
        return { success: false, reason: 'Contact not found in GHL' };
      }
      
      // Add appropriate tags based on event type
      const tags = [`Booking:${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`];
      
      if (eventType === 'confirmed') {
        tags.push('Status:Booking_Confirmed');
      } else if (eventType === 'cancelled') {
        tags.push('Status:Booking_Cancelled');
      }
      
      // Add tags to contact
      await ghl.addTagsToContact(contact.id, tags);
      
      // Update custom fields with booking information
      const serviceName = booking.Service?.name || 'Unknown Service';
      const scheduledDate = booking.scheduledDateTime 
        ? new Date(booking.scheduledDateTime).toISOString().split('T')[0] 
        : 'Unscheduled';
        
      await ghl.upsertContact({
        email: userEmail,
        customFields: [
          { id: 'cf_last_booking_service', value: serviceName },
          { id: 'cf_last_booking_date', value: scheduledDate },
          { id: 'cf_booking_status', value: booking.status },
          { id: 'cf_booking_id', value: booking.id }
        ]
      });
      
      logger.info(`Successfully synced booking ${booking.id} to GHL contact ${contact.id}`);
      return { success: true };
    } catch (error: any) {
      logger.error(`Error syncing booking ${booking.id} to GHL:`, error);
      // Don't throw here - GHL sync failure shouldn't fail the whole job
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Process a payment job with proper error handling
   */
  private async processPaymentJob(job: Bull.Job<PaymentProcessingJob>): Promise<JobResult> {
    const jobData = job.data;
    logger.info(`Processing payment job ${job.id} - action: ${jobData.action}`);
    
    try {
      const { bookingId, paymentId, action, amount, currency, metadata } = jobData;
      
      // Validate required fields based on action type
      if (action === 'create' && !bookingId) {
        throw new Error('Missing bookingId for payment creation');
      }
      
      if ((action === 'capture' || action === 'refund') && !paymentId) {
        throw new Error(`Missing paymentId for payment ${action} action`);
      }
      
      // Process based on action type
      switch (action) {
        case 'create':
          // Create a new payment record
          const createResult = await this.createPayment(bookingId!, amount, currency, metadata);
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: createResult
          };
          
        case 'capture':
          // Capture an authorized payment
          const captureResult = await this.capturePayment(paymentId!, metadata);
          
          // Update GHL with payment status
          if (captureResult.success && bookingId) {
            const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: { User_Booking_signerIdToUser: true }
            });
            
            if (booking) {
              await this.updateGHLPaymentStatus(booking, 'completed');
            }
          }
          
          return {
            success: captureResult.success,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: captureResult
          };
          
        case 'refund':
          // Process a payment refund
          const refundResult = await this.refundPayment(paymentId!, amount, metadata);
          
          // Update GHL with refund status
          if (refundResult.success && bookingId) {
            const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: { User_Booking_signerIdToUser: true }
            });
            
            if (booking) {
              await this.updateGHLPaymentStatus(booking, 'refunded');
            }
          }
          
          return {
            success: refundResult.success,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: refundResult
          };
          
        case 'check-status':
          // Check payment status with payment provider
          const checkResult = await this.checkPaymentStatus(paymentId || '', bookingId || '');
          return {
            success: true,
            jobId: job.id?.toString() || 'unknown',
            processedAt: new Date(),
            result: checkResult
          };
          
        default:
          throw new Error(`Unknown payment action: ${action}`);
      }
    } catch (error: any) {
      logger.error(`Error processing payment job: ${error?.message || 'Unknown error'}`, { error, jobId: job.id });
      
      // Determine if we should retry based on error type and retry count
      const maxRetries = jobData.maxRetries || 3;
      const attempts = job.attemptsMade || 0;
      const shouldRetry = attempts < maxRetries;
      
      if (shouldRetry) {
        throw error; // This will trigger Bull's retry mechanism
      }
      
      return {
        success: false,
        jobId: job.id?.toString() || 'unknown',
        processedAt: new Date(),
        error: error.message || 'Unknown error'
      };
    }
  }
  
  // Helper: Create a payment
  private async createPayment(bookingId: string, amount?: number, currency?: string, metadata?: Record<string, any>): Promise<any> {
    try {
      // Get booking details first
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { Service: true }
      });
      
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }
      
      // Use service price if amount not specified
      const paymentAmount = amount || Number(booking.Service?.price || 0);
      const paymentCurrency = currency || 'USD';
      
      if (paymentAmount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: paymentAmount,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          notes: metadata?.notes || null,
          paymentIntentId: metadata?.paymentIntentId || null
        }
      });
      
      // If payment needs to be processed immediately with Stripe
      if (metadata?.processImmediately && payment.paymentIntentId) {
        // Call Stripe API to confirm payment intent
        // This would use your Stripe service
        // Mocked for now
        logger.info(`Payment ${payment.id} would be processed immediately with Stripe`);
      }
      
      return { success: true, payment };
    } catch (error: any) {
      logger.error(`Error creating payment for booking ${bookingId}:`, error);
      throw error;
    }
  }
  
  // Helper: Capture a payment
  private async capturePayment(paymentId: string, metadata?: Record<string, any>): Promise<any> {
    try {
      // Get payment details
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });
      
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }
      
      if (payment.status === PaymentStatus.COMPLETED) {
        logger.info(`Payment ${paymentId} already completed, skipping capture`);  
        return { success: true, payment, alreadyCompleted: true };
      }
      
      // Process with payment provider (usually Stripe)
      // This would call your Stripe service to capture the payment
      // Mocked for now
      
      // Update payment record
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          notes: payment.notes 
            ? `${payment.notes}\n\nCaptured: ${new Date().toISOString()}` 
            : `Captured: ${new Date().toISOString()}`
        }
      });
      
      // Update booking status if needed
      if (updatedPayment.bookingId) {
        const booking = await prisma.booking.findUnique({
          where: { id: updatedPayment.bookingId },
          include: { User_Booking_signerIdToUser: true }
        });
        
        if (booking && (booking.status === BookingStatus.PAYMENT_PENDING || booking.status === BookingStatus.REQUESTED)) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: BookingStatus.CONFIRMED }
          });
        }
      }
      
      return { success: true, payment: updatedPayment };
    } catch (error: any) {
      logger.error(`Error capturing payment ${paymentId}:`, error);
      throw error;
    }
  }
  
  // Helper: Refund a payment
  private async refundPayment(paymentId: string, amount?: number, metadata?: Record<string, any>): Promise<any> {
    try {
      // Get payment details
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });
      
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }
      
      if (payment.status === PaymentStatus.REFUNDED) {
        logger.info(`Payment ${paymentId} already refunded, skipping`);  
        return { success: true, payment, alreadyRefunded: true };
      }
      
      // Process refund with payment provider (usually Stripe)
      // This would call your Stripe service to process the refund
      // Mocked for now
      
      // Update payment record
      const refundAmount = amount || Number(payment.amount);
      const reason = metadata?.reason || 'Requested refund';
      
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          notes: payment.notes 
            ? `${payment.notes}\n\nRefunded: ${reason} - ${new Date().toISOString()}` 
            : `Refunded: ${reason} - ${new Date().toISOString()}`
        }
      });
      
      return { success: true, payment: updatedPayment };
    } catch (error: any) {
      logger.error(`Error refunding payment ${paymentId}:`, error);
      throw error;
    }
  }
  
  // Helper: Check payment status
  private async checkPaymentStatus(paymentId: string, bookingId: string): Promise<any> {
    try {
      // Both paymentId and bookingId can't be empty
      if (!paymentId && !bookingId) {
        throw new Error('Either paymentId or bookingId must be provided');
      }
      
      let payment;
      
      // If payment ID provided, look up directly
      if (paymentId) {
        payment = await prisma.payment.findUnique({
          where: { id: paymentId }
        });
      } 
      // Otherwise find latest payment for booking
      else if (bookingId) {
        const payments = await prisma.payment.findMany({
          where: { bookingId },
          orderBy: { createdAt: 'desc' },
          take: 1
        });
        payment = payments[0];
      }
      
      if (!payment) {
        throw new Error(`Payment not found for ID: ${paymentId} or booking: ${bookingId}`);
      }
      
      // Check with provider (Stripe) for latest payment status
      // This would call your Stripe service to check payment status
      // Mocked for now - just return current database status
      
      return { 
        success: true, 
        payment, 
        status: payment.status,
        needsAttention: payment.status === PaymentStatus.PENDING && 
          new Date().getTime() - new Date(payment.createdAt).getTime() > 24 * 60 * 60 * 1000 // Over 24h old
      };
    } catch (error: any) {
      logger.error(`Error checking payment status:`, error);
      throw error;
    }
  }
  
  // Helper: Update GHL with payment status
  private async updateGHLPaymentStatus(booking: any, status: 'completed' | 'refunded' | 'failed'): Promise<any> {
    try {
      // Skip GHL update if no email is available
      const userEmail = booking.User_Booking_signerIdToUser?.email || booking.customerEmail;
      if (!userEmail) {
        logger.warn(`Cannot update GHL payment status: No email available for booking ${booking.id}`);
        return { success: false, reason: 'No email available' };
      }
      
      // Get contact from GHL
      const contact = await ghl.getContactByEmail(userEmail);
      
      if (!contact || !contact.id) {
        logger.warn(`Contact not found in GHL for email: ${userEmail}`);
        return { success: false, reason: 'Contact not found in GHL' };
      }
      
      // Add appropriate tags based on payment status
      let tags: string[] = [];
      switch (status) {
        case 'completed':
          tags = ['Payment:Completed', 'Status:Paid'];
          break;
        case 'refunded':
          tags = ['Payment:Refunded'];
          break;
        case 'failed':
          tags = ['Payment:Failed', 'Status:Payment_Issue'];
          break;
        default:
          tags = [];
      }
      
      // Only proceed if we have tags to add
      if (tags.length > 0) {
        // Add tags to contact
        await ghl.addTagsToContact(contact.id, tags);
        
        // Update custom fields with payment information
        await ghl.upsertContact({
          email: userEmail,
          customFields: [
            { id: 'cf_payment_status', value: status },
            { id: 'cf_last_payment_date', value: new Date().toISOString().split('T')[0] }
          ]
        });
        
        logger.info(`Successfully updated payment status to ${status} in GHL for contact ${contact.id}`);
        return { success: true };
      }
      
      return { success: false, reason: 'No tags to update' };
    } catch (error: any) {
      logger.error(`Error updating GHL payment status for booking ${booking.id}:`, error);
      // Don't throw here - GHL sync failure shouldn't fail the whole job
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize all queue processors
   */
  public async startProcessing(): Promise<void> {
    if (!this.queues) {
      logger.error('Cannot start processing: Bull queues not available');
      return;
    }
    
    try {
      this.isProcessing = true;
      const { notificationsQueue, bookingProcessingQueue, paymentProcessingQueue } = this.queues;
      
      // Process notifications
      notificationsQueue.process('process-notification', this.concurrency.notifications, 
        async (job) => this.processNotificationJob(job));
      
      // Process booking jobs
      bookingProcessingQueue.process('process-booking', this.concurrency.bookingProcessing,
        async (job) => this.processBookingJob(job));
        
      // Process payment jobs
      paymentProcessingQueue.process('process-payment', this.concurrency.paymentProcessing,
        async (job) => this.processPaymentJob(job));
      
      // Log startup of processors
      logger.info(`Started BullMQ processors with concurrency:`, {
        notifications: this.concurrency.notifications,
        bookings: this.concurrency.bookingProcessing,
        payments: this.concurrency.paymentProcessing
      });
      
      // Set up global event handlers for all queues
      [notificationsQueue, bookingProcessingQueue, paymentProcessingQueue].forEach(queue => {
        queue.on('error', (error) => {
          logger.error(`Queue error in ${queue.name}:`, error);
        });
        
        queue.on('failed', (job, error) => {
          logger.error(`Job ${job.id} failed in ${queue.name} queue:`, { 
            error: error.message, 
            jobData: job.data,
            attemptsMade: job.attemptsMade
          });
        });
        
        queue.on('completed', (job) => {
          logger.info(`Job ${job.id} completed in ${queue.name} queue`);
        });
      });
      
      logger.info('All Bull queue processors started successfully');
    } catch (error) {
      logger.error('Error starting Bull queue processors', 'BULL_QUEUE_WORKER', error as Error);
      this.isProcessing = false;
    }
  }

  /**
   * Stop all queue processors
   */
  public async stopProcessing(): Promise<void> {
    if (!this.queues) return;
    
    try {
      const { notificationsQueue, bookingProcessingQueue, paymentProcessingQueue } = this.queues;
      
      await Promise.all([
        notificationsQueue.pause(), 
        bookingProcessingQueue.pause(),
        paymentProcessingQueue.pause()
      ]);
      
      this.isProcessing = false;
      logger.info('All Bull queue processors stopped');
    } catch (error) {
      logger.error('Error stopping Bull queue processors', 'BULL_QUEUE_WORKER', error as Error);
    }
  }
}
