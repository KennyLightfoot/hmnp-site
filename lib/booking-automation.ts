import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { NotificationService } from '@/lib/notifications';
import { NotificationType, NotificationMethod } from '@prisma/client';

export class BookingAutomationService {
  /**
   * Auto-progress booking to the next appropriate status based on business rules
   */
  static async progressBookingStatus(bookingId: string, triggeredBy?: string): Promise<{
    success: boolean;
    previousStatus?: BookingStatus;
    newStatus?: BookingStatus;
    actionsTaken: string[];
    errors: string[];
  }> {
    const actionsTaken: string[] = [];
    const errors: string[] = [];

    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          User_Booking_signerIdToUser: true,
          service: true,
          Payment: true
        }
      });

      if (!booking) {
        return {
          success: false,
          actionsTaken,
          errors: ['Booking not found']
        };
      }

      const previousStatus = booking.status;
      let newStatus = previousStatus;
      let shouldUpdate = false;

      // Define status progression rules
      switch (booking.status) {
        case BookingStatus.REQUESTED:
          // REQUESTED can progress to PAYMENT_PENDING if no payment exists
          // or CONFIRMED if payment is completed
          const hasPayment = booking.Payment.some(p => p.status === 'COMPLETED');
          if (hasPayment) {
            newStatus = BookingStatus.CONFIRMED;
            shouldUpdate = true;
            actionsTaken.push('Progressed to CONFIRMED due to completed payment');
          } else {
            newStatus = BookingStatus.PAYMENT_PENDING;
            shouldUpdate = true;
            actionsTaken.push('Progressed to PAYMENT_PENDING - awaiting payment');
          }
          break;

        case BookingStatus.PAYMENT_PENDING:
          // Check if payment was completed
          const completedPayment = booking.Payment.find(p => p.status === 'COMPLETED');
          if (completedPayment) {
            newStatus = BookingStatus.CONFIRMED;
            shouldUpdate = true;
            actionsTaken.push('Payment completed - progressed to CONFIRMED');
          }
          break;

        case BookingStatus.CONFIRMED:
          // CONFIRMED can progress to SCHEDULED when time slot is assigned
          if (booking.scheduledDateTime) {
            newStatus = BookingStatus.SCHEDULED;
            shouldUpdate = true;
            actionsTaken.push('Time slot assigned - progressed to SCHEDULED');
          }
          break;

        case BookingStatus.SCHEDULED:
          // SCHEDULED can progress to READY_FOR_SERVICE on day of service
          if (booking.scheduledDateTime) {
            const now = new Date();
            const appointmentDate = new Date(booking.scheduledDateTime);
            const isToday = now.toDateString() === appointmentDate.toDateString();
            const isWithinServiceWindow = now.getTime() >= (appointmentDate.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before

            if (isToday && isWithinServiceWindow) {
              newStatus = BookingStatus.READY_FOR_SERVICE;
              shouldUpdate = true;
              actionsTaken.push('Service day arrived - progressed to READY_FOR_SERVICE');
            }
          }
          break;

        case BookingStatus.READY_FOR_SERVICE:
          // This status typically requires manual intervention when notary arrives
          // But we can check for no-shows
          if (booking.scheduledDateTime) {
            const now = new Date();
            const appointmentTime = new Date(booking.scheduledDateTime);
            const minutesLate = (now.getTime() - appointmentTime.getTime()) / (1000 * 60);

            if (minutesLate > 60) { // More than 1 hour late
              newStatus = BookingStatus.NO_SHOW;
              shouldUpdate = true;
              actionsTaken.push('Booking marked as NO_SHOW due to 1+ hour delay');
            }
          }
          break;

        case BookingStatus.IN_PROGRESS:
          // This status typically requires manual completion
          // Could add auto-completion based on time if needed
          break;

        case BookingStatus.COMPLETED:
          // Completed bookings can be archived after a certain period
          const completedDaysAgo = booking.actualEndDateTime ? 
            (new Date().getTime() - new Date(booking.actualEndDateTime).getTime()) / (1000 * 60 * 60 * 24) : 0;
          
          if (completedDaysAgo > 30) { // Archive after 30 days
            newStatus = BookingStatus.ARCHIVED;
            shouldUpdate = true;
            actionsTaken.push('Archived booking after 30 days');
          }
          break;

        default:
          // No automatic progression for other statuses
          break;
      }

      // Update booking status if needed
      if (shouldUpdate && newStatus !== previousStatus) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { 
            status: newStatus,
            updatedAt: new Date()
          }
        });

        // Log the status change
        actionsTaken.push(`Status updated: ${previousStatus} → ${newStatus}`);

        // Trigger status-specific actions
        await this.handleStatusChangeActions(bookingId, previousStatus, newStatus, triggeredBy);
      }

      return {
        success: true,
        previousStatus,
        newStatus,
        actionsTaken,
        errors
      };

    } catch (error: any) {
      console.error('Error in booking status progression:', error);
      errors.push(error.message);
      return {
        success: false,
        actionsTaken,
        errors
      };
    }
  }

  /**
   * Handle actions that should be triggered when status changes
   */
  private static async handleStatusChangeActions(
    bookingId: string,
    previousStatus: BookingStatus,
    newStatus: BookingStatus,
    triggeredBy?: string
  ): Promise<void> {
    try {
      console.log(`Handling status change for booking ${bookingId}: ${previousStatus} → ${newStatus}`);

      switch (newStatus) {
        case BookingStatus.CONFIRMED:
          // Send confirmation notification
          await this.sendBookingConfirmation(bookingId);
          break;

        case BookingStatus.SCHEDULED:
          // Set up appointment reminders
          await this.scheduleAppointmentReminders(bookingId);
          break;

        case BookingStatus.READY_FOR_SERVICE:
          // Send day-of-service notification
          await this.sendDayOfServiceNotification(bookingId);
          break;

        case BookingStatus.NO_SHOW:
          // Handle no-show workflow
          await this.handleNoShowWorkflow(bookingId);
          break;

        case BookingStatus.COMPLETED:
          // Trigger post-service workflow
          await this.triggerPostServiceWorkflow(bookingId);
          break;

        case BookingStatus.CANCELLED_BY_CLIENT:
        case BookingStatus.CANCELLED_BY_STAFF:
          // Handle cancellation workflow
          await this.handleCancellationWorkflow(bookingId, newStatus);
          break;
      }

    } catch (error: any) {
      console.error(`Error handling status change actions for booking ${bookingId}:`, error);
    }
  }

  /**
   * Send booking confirmation notification
   */
  private static async sendBookingConfirmation(bookingId: string): Promise<void> {
    try {
      const { sendBookingConfirmation } = await import('@/lib/notifications');
      await sendBookingConfirmation(bookingId);
    } catch (error: any) {
      console.error(`Error sending booking confirmation for ${bookingId}:`, error);
    }
  }

  /**
   * Schedule appointment reminders for the booking
   */
  private static async scheduleAppointmentReminders(bookingId: string): Promise<void> {
    // Note: In a production system, you'd integrate with a job scheduler like Upstash QStash
    // For now, we'll rely on the cron jobs to pick up the reminders
    console.log(`Appointment reminders will be picked up by cron jobs for booking ${bookingId}`);
  }

  /**
   * Send day-of-service notification
   */
  private static async sendDayOfServiceNotification(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          User_Booking_signerIdToUser: true,
          service: true
        }
      });

      if (!booking) return;

      const recipient = {
        email: booking.User_Booking_signerIdToUser.email,
        firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
      };

      const content = {
        subject: 'Your notary appointment is today - Houston Mobile Notary Pros',
        message: `Hi ${recipient.firstName}, this is a reminder that your notary appointment for ${booking.service.name} is scheduled for today. Our notary will contact you shortly before the appointment time.`,
        metadata: {
          serviceId: booking.serviceId,
          appointmentTime: booking.scheduledDateTime?.toISOString()
        }
      };

      await NotificationService.sendNotification({
        bookingId,
        type: NotificationType.APPOINTMENT_REMINDER_NOW,
        recipient,
        content,
        methods: [NotificationMethod.EMAIL, NotificationMethod.SMS]
      });

    } catch (error: any) {
      console.error(`Error sending day-of-service notification for ${bookingId}:`, error);
    }
  }

  /**
   * Handle no-show workflow
   */
  private static async handleNoShowWorkflow(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          User_Booking_signerIdToUser: true,
          service: true
        }
      });

      if (!booking) return;

      const recipient = {
        email: booking.User_Booking_signerIdToUser.email,
        firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
      };

      const content = {
        subject: 'Missed Appointment - Houston Mobile Notary Pros',
        message: `Hi ${recipient.firstName}, we missed you at your scheduled notary appointment today. Please contact us to reschedule or discuss your needs. We're here to help.`,
        metadata: {
          originalAppointmentTime: booking.scheduledDateTime?.toISOString(),
          missedAppointmentProcessed: new Date().toISOString()
        }
      };

      await NotificationService.sendNotification({
        bookingId,
        type: NotificationType.POST_SERVICE_FOLLOWUP,
        recipient,
        content,
        methods: [NotificationMethod.EMAIL]
      });

      // TODO: Implement additional no-show logic like:
      // - Charging no-show fees
      // - Offering rescheduling with fee
      // - Adding to waitlist for urgent openings

    } catch (error: any) {
      console.error(`Error handling no-show workflow for ${bookingId}:`, error);
    }
  }

  /**
   * Trigger post-service workflow
   */
  private static async triggerPostServiceWorkflow(bookingId: string): Promise<void> {
    try {
      // Schedule follow-up communications for later
      // In production, this would be handled by a job scheduler
      console.log(`Post-service workflow initiated for booking ${bookingId}`);
      
      // Mark actual end time if not set
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          actualEndDateTime: new Date()
        }
      });

    } catch (error: any) {
      console.error(`Error triggering post-service workflow for ${bookingId}:`, error);
    }
  }

  /**
   * Handle cancellation workflow
   */
  private static async handleCancellationWorkflow(
    bookingId: string,
    cancellationType: BookingStatus
  ): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          User_Booking_signerIdToUser: true,
          service: true
        }
      });

      if (!booking) return;

      const recipient = {
        email: booking.User_Booking_signerIdToUser.email,
        firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
      };

      const isByClient = cancellationType === BookingStatus.CANCELLED_BY_CLIENT;
      const subject = isByClient 
        ? 'Booking Cancellation Confirmed - Houston Mobile Notary Pros'
        : 'Appointment Cancelled - Houston Mobile Notary Pros';

      const message = isByClient
        ? `Hi ${recipient.firstName}, your cancellation has been processed. If you need to reschedule or have questions about refunds, please contact us.`
        : `Hi ${recipient.firstName}, unfortunately we need to cancel your upcoming appointment. Our team will contact you to reschedule. We apologize for any inconvenience.`;

      const content = {
        subject,
        message,
        metadata: {
          cancellationType,
          originalAppointmentTime: booking.scheduledDateTime?.toISOString(),
          cancelledAt: new Date().toISOString()
        }
      };

      await NotificationService.sendNotification({
        bookingId,
        type: NotificationType.BOOKING_CANCELLED,
        recipient,
        content,
        methods: [NotificationMethod.EMAIL, NotificationMethod.SMS]
      });

      // TODO: Implement additional cancellation logic like:
      // - Processing refunds
      // - Updating notary schedules
      // - Offering waitlist spots to other clients

    } catch (error: any) {
      console.error(`Error handling cancellation workflow for ${bookingId}:`, error);
    }
  }

  /**
   * Manually transition booking to a specific status with validation
   */
  static async transitionBookingStatus(
    bookingId: string,
    targetStatus: BookingStatus,
    notes?: string,
    triggeredBy?: string
  ): Promise<{
    success: boolean;
    previousStatus?: BookingStatus;
    newStatus?: BookingStatus;
    error?: string;
  }> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (!booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      const previousStatus = booking.status;

      // Validate transition is allowed
      const isValidTransition = this.isValidStatusTransition(previousStatus, targetStatus);
      if (!isValidTransition) {
        return {
          success: false,
          previousStatus,
          error: `Invalid status transition from ${previousStatus} to ${targetStatus}`
        };
      }

      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: targetStatus,
          notes: notes ? `${booking.notes || ''}\n[${new Date().toISOString()}] ${notes}` : booking.notes,
          updatedAt: new Date()
        }
      });

      // Trigger status change actions
      await this.handleStatusChangeActions(bookingId, previousStatus, targetStatus, triggeredBy);

      return {
        success: true,
        previousStatus,
        newStatus: targetStatus
      };

    } catch (error: any) {
      console.error('Error transitioning booking status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a status transition is valid
   */
  private static isValidStatusTransition(
    fromStatus: BookingStatus,
    toStatus: BookingStatus
  ): boolean {
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

    return validTransitions[fromStatus]?.includes(toStatus) || false;
  }

  /**
   * Process all bookings that need status updates
   */
  static async processAllBookingStatusUpdates(): Promise<{
    processed: number;
    updated: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      updated: 0,
      errors: [] as string[]
    };

    try {
      // Get all active bookings (not archived or completed)
      const activeBookings = await prisma.booking.findMany({
        where: {
          status: {
            notIn: [BookingStatus.ARCHIVED, BookingStatus.COMPLETED]
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      console.log(`Processing ${activeBookings.length} active bookings for status updates`);

      for (const booking of activeBookings) {
        try {
          results.processed++;
          const result = await this.progressBookingStatus(booking.id, 'automated-process');
          
          if (result.success && result.previousStatus !== result.newStatus) {
            results.updated++;
            console.log(`Updated booking ${booking.id}: ${result.previousStatus} → ${result.newStatus}`);
          }

          if (result.errors.length > 0) {
            results.errors.push(...result.errors.map(e => `Booking ${booking.id}: ${e}`));
          }

        } catch (error: any) {
          results.errors.push(`Booking ${booking.id}: ${error.message}`);
        }
      }

    } catch (error: any) {
      results.errors.push(`Process error: ${error.message}`);
    }

    return results;
  }
} 