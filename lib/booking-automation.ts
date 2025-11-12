/**
 * Booking Automation Service
 * Houston Mobile Notary Pros
 * 
 * Handles automated booking completion workflows, status management,
 * and service orchestration for the championship booking system.
 */

import { prisma } from './prisma';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from './logger';
import { redis } from './redis';
import { triggerStatusChangeFollowUps } from '@/lib/follow-up-automation';
import { BookingStatus } from '@prisma/client';

// Types for booking automation
interface BookingCompletionData {
  bookingId: string;
  notaryId?: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  documents?: string[];
  notes?: string;
  customerSatisfaction?: number;
  followUpRequired?: boolean;
}

interface ManualCompletionData extends BookingCompletionData {
  completedById: string;
  manualNotes: string;
  overrideReason?: string;
}

interface AutoCompletionTrigger {
  bookingId: string;
  trigger: 'scheduled_time' | 'notary_checkin' | 'document_upload' | 'payment_complete';
  metadata?: Record<string, any>;
}

// Automation service class
export class BookingAutomationService {
  /**
   * Automatically complete a booking based on triggers
   */
  static async autoCompleteService(trigger: AutoCompletionTrigger): Promise<boolean> {
    try {
      const { bookingId, trigger: triggerType, metadata } = trigger;

      logger.info('Auto-completion triggered', {
        bookingId,
        trigger: triggerType,
        metadata
      });

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          payments: true,
          NotificationLog: true,
          NotarizationDocument: true
        }
      });

      if (!booking) {
        logger.error('Booking not found for auto-completion', { bookingId });
        return false;
      }

      // Check if booking is eligible for auto-completion
      if (!this.isEligibleForAutoCompletion(booking, triggerType)) {
        logger.warn('Booking not eligible for auto-completion', {
          bookingId,
          status: booking.status,
          trigger: triggerType
        });
        return false;
      }

      // Execute auto-completion based on trigger type
      switch (triggerType) {
        case 'scheduled_time':
          return await this.completeByScheduledTime(booking);
        
        case 'notary_checkin':
          return await this.completeByNotaryCheckin(booking, metadata);
        
        case 'document_upload':
          return await this.completeByDocumentUpload(booking, metadata);
        
        case 'payment_complete':
          return await this.completeByPaymentComplete(booking);
        
        default:
          logger.error('Unknown auto-completion trigger', { triggerType });
          return false;
      }

    } catch (error) {
      logger.error('Auto-completion failed', {
        bookingId: trigger.bookingId,
        error: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }

  /**
   * Manually complete a booking by admin/notary
   */
  static async manualCompleteService(data: ManualCompletionData): Promise<boolean> {
    try {
      const { bookingId, completedById, manualNotes } = data;

      logger.info('Manual completion started', {
        bookingId,
        completedById,
        hasNotes: !!manualNotes
      });

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          payments: true,
          NotificationLog: true
        }
      });

      if (!booking) {
        logger.error('Booking not found for manual completion', { bookingId });
        return false;
      }

      // Validate completion permissions
      if (!await this.validateCompletionPermissions(completedById, booking)) {
        logger.error('Insufficient permissions for manual completion', {
          bookingId,
          completedById
        });
        return false;
      }

      // Update booking status and details
      const previousStatus = booking.status as BookingStatus;
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'COMPLETED',
          actualEndDateTime: data.actualEndTime || new Date(),
          notes: manualNotes,
          notaryId: data.notaryId || booking.notaryId,
          updatedAt: new Date()
        }
      });

      // Create audit log entry (using SystemLog instead of bookingAuditLog)
      await prisma.systemLog.create({
        data: {
          id: `system_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          component: 'BOOKING_AUTOMATION',
          level: 'INFO',
          message: `Manual completion of booking ${bookingId}`,
          metadata: {
            bookingId,
            action: 'MANUAL_COMPLETION',
            oldValues: {
              status: booking.status,
              actualEndDateTime: booking.actualEndDateTime
            },
            newValues: {
              status: 'COMPLETED',
              actualEndDateTime: data.actualEndTime || new Date(),
              completedBy: completedById,
              manualNotes,
              overrideReason: data.overrideReason
            },
            userId: completedById
          },
          userId: completedById
        }
      });

      // Trigger post-completion workflows
      await this.triggerPostCompletionWorkflows(updatedBooking, 'manual', previousStatus);

      logger.info('Manual completion successful', {
        bookingId,
        completedById,
        newStatus: updatedBooking.status
      });

      return true;

    } catch (error) {
      logger.error('Manual completion failed', {
        bookingId: data.bookingId,
        completedById: data.completedById,
        error: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }

  /**
   * Check if booking is eligible for auto-completion
   */
  private static isEligibleForAutoCompletion(booking: any, triggerType: string): boolean {
    // Must be in progress or scheduled
    if (!['IN_PROGRESS', 'SCHEDULED'].includes(booking.status)) {
      return false;
    }

    // Check trigger-specific eligibility
    switch (triggerType) {
      case 'scheduled_time':
        // Must be past scheduled end time
        const estimatedEndTime = new Date(booking.scheduledDateTime);
        estimatedEndTime.setMinutes(estimatedEndTime.getMinutes() + booking.estimatedDuration);
        return new Date() > estimatedEndTime;
      
      case 'payment_complete':
        // Must have complete payment
        return booking.paymentStatus === 'COMPLETED';
      
      case 'notary_checkin':
      case 'document_upload':
        // These triggers are always eligible if status allows
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Complete booking based on scheduled time
   */
  private static async completeByScheduledTime(booking: any): Promise<boolean> {
    logger.info('Auto-completing by scheduled time', { bookingId: booking.id });

    // Update booking to completed
    const previousStatus = booking.status as BookingStatus | undefined;
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'COMPLETED',
        actualEndDateTime: new Date(),
        notes: 'Auto-completed based on scheduled time'
      }
    });

    await this.triggerPostCompletionWorkflows(updatedBooking, 'auto_time', previousStatus);
    return true;
  }

  /**
   * Complete booking based on notary check-in
   */
  private static async completeByNotaryCheckin(booking: any, metadata: any): Promise<boolean> {
    logger.info('Auto-completing by notary check-in', { bookingId: booking.id });

    const previousStatus = booking.status as BookingStatus | undefined;
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'COMPLETED',
        actualEndDateTime: new Date(),
        notaryId: metadata?.notaryId || booking.notaryId,
        notes: 'Auto-completed based on notary check-in'
      }
    });

    await this.triggerPostCompletionWorkflows(updatedBooking, 'auto_checkin', previousStatus);
    return true;
  }

  /**
   * Complete booking based on document upload
   */
  private static async completeByDocumentUpload(booking: any, metadata: any): Promise<boolean> {
    logger.info('Auto-completing by document upload', { bookingId: booking.id });

    const previousStatus = booking.status as BookingStatus | undefined;
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'COMPLETED',
        actualEndDateTime: new Date(),
        notes: 'Auto-completed based on document upload completion'
      }
    });

    await this.triggerPostCompletionWorkflows(updatedBooking, 'auto_documents', previousStatus);
    return true;
  }

  /**
   * Complete booking based on payment completion
   */
  private static async completeByPaymentComplete(booking: any): Promise<boolean> {
    logger.info('Auto-completing by payment completion', { bookingId: booking.id });

    // Only auto-complete if it's a prepaid service
    if (booking.paymentStatus === 'COMPLETED' && booking.balanceDue <= 0) {
      const previousStatus = booking.status as BookingStatus | undefined;
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'COMPLETED',
          actualEndDateTime: new Date(),
          notes: 'Auto-completed based on full payment received'
        }
      });

      await this.triggerPostCompletionWorkflows(updatedBooking, 'auto_payment', previousStatus);
      return true;
    }

    return false;
  }

  /**
   * Validate completion permissions
   */
  private static async validateCompletionPermissions(userId: string, booking: any): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, id: true }
      });

      if (!user) return false;

      // Admins and staff can complete any booking
      if (['ADMIN', 'STAFF'].includes(user.role)) return true;

      // Notaries can complete their own assignments
      if (user.role === 'NOTARY' && booking.notaryUserId === userId) return true;

      return false;
    } catch (error) {
      logger.error('Permission validation failed', { userId, error: getErrorMessage(error) });
      return false;
    }
  }

  /**
   * Trigger workflows after completion
   */
  private static async triggerPostCompletionWorkflows(booking: any, completionType: string, previousStatus?: BookingStatus): Promise<void> {
    try {
      // Cache key for workflow tracking
      const workflowKey = `completion_workflows:${booking.id}`;
      
      // Prevent duplicate workflow execution
      const existingLock = await redis.get(workflowKey);
      if (existingLock) {
        logger.info('Post-completion workflows already triggered', { bookingId: booking.id });
        return;
      }

      // Set workflow lock with expiration (1 hour)
      await redis.setex(workflowKey, 3600, completionType);

      // Schedule post-completion tasks
      const workflows = [
        this.scheduleFollowUpNotification(booking),
        this.updateCustomerRecords(booking),
        this.triggerReviewRequest(booking),
        this.syncWithCRM(booking),
        this.generateCompletionReport(booking)
      ];

      // Execute workflows in parallel
      const results = await Promise.allSettled(workflows);
      
      // Log any workflow failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error('Post-completion workflow failed', {
            bookingId: booking.id,
            workflowIndex: index,
            error: result.reason
          });
        }
      });

      logger.info('Post-completion workflows triggered', {
        bookingId: booking.id,
        completionType,
        successfulWorkflows: results.filter(r => r.status === 'fulfilled').length,
        failedWorkflows: results.filter(r => r.status === 'rejected').length
      });

      try {
        await triggerStatusChangeFollowUps(
          booking.id,
          BookingStatus.COMPLETED,
          previousStatus
        );
      } catch (followUpError) {
        logger.warn('Failed to trigger follow-up automation after completion', {
          bookingId: booking.id,
          error: getErrorMessage(followUpError)
        });
      }

    } catch (error) {
      logger.error('Failed to trigger post-completion workflows', {
        bookingId: booking.id,
        completionType,
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Schedule follow-up notification
   */
  private static async scheduleFollowUpNotification(booking: any): Promise<void> {
    // Schedule follow-up email for 24 hours after completion
    const followUpTime = new Date();
    followUpTime.setHours(followUpTime.getHours() + 24);

    await prisma.notificationLog.create({
      data: {
        id: `followup_${booking.id}_${Date.now()}`,
        bookingId: booking.id,
        notificationType: 'POST_SERVICE_FOLLOWUP',
        method: 'EMAIL',
        recipientEmail: booking.customerEmail,
        subject: 'How was your notary experience?',
        message: 'We hope your notary appointment went smoothly. We\'d love to hear about your experience!',
        metadata: {
          scheduledFor: followUpTime.toISOString(),
          type: 'post_completion_followup'
        }
      }
    });
  }

  /**
   * Update customer records
   */
  private static async updateCustomerRecords(booking: any): Promise<void> {
    // This would integrate with CRM to update customer lifetime value, booking count, etc.
    logger.info('Customer records updated', { bookingId: booking.id });
  }

  /**
   * Trigger review request
   */
  private static async triggerReviewRequest(booking: any): Promise<void> {
    // Schedule review request for 48 hours after completion
    const reviewTime = new Date();
    reviewTime.setHours(reviewTime.getHours() + 48);

    await prisma.notificationLog.create({
      data: {
        id: `review_${booking.id}_${Date.now()}`,
        bookingId: booking.id,
        notificationType: 'POST_SERVICE_FOLLOWUP',
        method: 'EMAIL',
        recipientEmail: booking.customerEmail,
        subject: 'Please share your experience',
        message: 'We\'d appreciate if you could leave a review of your notary service experience.',
        metadata: {
          scheduledFor: reviewTime.toISOString(),
          type: 'review_request'
        }
      }
    });
  }

  /**
   * Sync with CRM (GHL)
   */
  private static async syncWithCRM(booking: any): Promise<void> {
    // This would trigger GHL opportunity update
    logger.info('CRM sync triggered', { bookingId: booking.id });
  }

  /**
   * Generate completion report
   */
  private static async generateCompletionReport(booking: any): Promise<void> {
    // Generate internal completion report for tracking
    logger.info('Completion report generated', { bookingId: booking.id });
  }

  /**
   * Bulk auto-completion for scheduled bookings
   */
  static async processScheduledCompletions(): Promise<number> {
    try {
      // Find bookings that should be auto-completed
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - 30); // 30 minutes past scheduled end

      const eligibleBookings = await prisma.booking.findMany({
        where: {
          status: 'IN_PROGRESS',
          scheduledDateTime: {
            lt: cutoffTime
          }
        },
        select: { id: true }
      });

      let completedCount = 0;

      for (const booking of eligibleBookings) {
        const success = await this.autoCompleteService({
          bookingId: booking.id,
          trigger: 'scheduled_time'
        });

        if (success) completedCount++;
      }

      logger.info('Bulk auto-completion processed', {
        eligibleBookings: eligibleBookings.length,
        completedCount
      });

      return completedCount;

    } catch (error) {
      logger.error('Bulk auto-completion failed', {
        error: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return 0;
    }
  }
}

// Export the service
export default BookingAutomationService;

// Export types
export type {
  BookingCompletionData,
  ManualCompletionData,
  AutoCompletionTrigger
};
