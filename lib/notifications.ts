import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendSms, checkSmsConsent } from '@/lib/sms';
import * as ghl from '@/lib/ghl';
import { NotificationType, NotificationMethod, NotificationStatus, BookingStatus } from '@prisma/client';
import { withRetry } from '@/lib/utils/retry';
import { logger } from '@/lib/logger';

interface NotificationRecipient {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface NotificationContent {
  subject?: string; // For email
  message: string;
  metadata?: Record<string, any>;
}

interface SendNotificationOptions {
  bookingId: string;
  type: NotificationType;
  recipient: NotificationRecipient;
  content: NotificationContent;
  methods: NotificationMethod[];
  skipDuplicateCheck?: boolean;
  forceResend?: boolean;
}

export class NotificationService {
  private static instance: NotificationService | null = null;

  private constructor() {
    // Private constructor to prevent direct construction calls with the `new` operator
    if (NotificationService.instance) {
      throw new Error('Use NotificationService.getInstance() instead');
    }
  }

  /**
   * Gets the singleton instance of NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new this();
    }
    return NotificationService.instance;
  }

  /**
   * Static method to send a notification (delegates to instance method)
   */
  public static async sendNotification(options: SendNotificationOptions): Promise<{
    success: boolean;
    results: Array<{
      method: NotificationMethod;
      success: boolean;
      error?: string;
      notificationId?: string;
    }>;
  }> {
    return this.getInstance().sendInstanceNotification(options);
  }

  // Clear the singleton instance (for testing purposes)
  public static clearInstance(): void {
    NotificationService.instance = null;
  }

  /**
   * Check if a notification has already been sent to prevent duplicates
   */
  private async hasNotificationBeenSent(
    bookingId: string,
    type: NotificationType,
    method: NotificationMethod,
    recipientIdentifier: string
  ): Promise<boolean> {
    const existingNotification = await prisma.notificationLog.findFirst({
      where: {
        bookingId,
        notificationType: type,
        method,
        OR: [
          { recipientEmail: recipientIdentifier },
          { recipientPhone: recipientIdentifier }
        ],
        status: {
          in: [NotificationStatus.SENT, NotificationStatus.DELIVERED]
        }
      }
    });

    return !!existingNotification;
  }

  /**
   * Check if booking should receive notifications based on its current status
   */
  private shouldReceiveNotification(
    status: BookingStatus,
    type: NotificationType
  ): boolean {
    const statusNotificationMap: Record<BookingStatus, NotificationType[]> = {
      [BookingStatus.REQUESTED]: [
        NotificationType.BOOKING_CONFIRMATION,
        NotificationType.PAYMENT_REMINDER
      ],
      [BookingStatus.PAYMENT_PENDING]: [
        NotificationType.PAYMENT_REMINDER,
        NotificationType.PAYMENT_FAILED,
        NotificationType.PAYMENT_UPDATE
      ],
      [BookingStatus.CONFIRMED]: [
        NotificationType.PAYMENT_CONFIRMATION,
        NotificationType.APPOINTMENT_REMINDER_24HR,
        NotificationType.APPOINTMENT_REMINDER_2HR,
        NotificationType.APPOINTMENT_REMINDER_1HR
      ],
      [BookingStatus.SCHEDULED]: [
        NotificationType.APPOINTMENT_REMINDER_24HR,
        NotificationType.APPOINTMENT_REMINDER_2HR,
        NotificationType.APPOINTMENT_REMINDER_1HR,
        NotificationType.APPOINTMENT_REMINDER_NOW,
        NotificationType.NO_SHOW_CHECK
      ],
      [BookingStatus.AWAITING_CLIENT_ACTION]: [
        NotificationType.DOCUMENT_REMINDER,
        NotificationType.APPOINTMENT_REMINDER_24HR
      ],
      [BookingStatus.READY_FOR_SERVICE]: [
        NotificationType.APPOINTMENT_REMINDER_NOW,
        NotificationType.NO_SHOW_CHECK
      ],
      [BookingStatus.IN_PROGRESS]: [
        NotificationType.EMERGENCY_NOTIFICATION
      ],
      [BookingStatus.COMPLETED]: [
        NotificationType.POST_SERVICE_FOLLOWUP,
        NotificationType.REVIEW_REQUEST,
        NotificationType.DOCUMENT_READY
      ],
      [BookingStatus.CANCELLED_BY_CLIENT]: [],
      [BookingStatus.CANCELLED_BY_STAFF]: [],
      [BookingStatus.REQUIRES_RESCHEDULE]: [
        NotificationType.BOOKING_RESCHEDULED
      ],
      [BookingStatus.NO_SHOW]: [
        NotificationType.POST_SERVICE_FOLLOWUP
      ],
      [BookingStatus.ARCHIVED]: []
    };

    return statusNotificationMap[status]?.includes(type) || false;
  }

  /**
   * Send a notification via specified methods with duplicate prevention
   * This is the instance method that does the actual work
   */
  async sendInstanceNotification({
    bookingId,
    type,
    recipient,
    content,
    methods,
    skipDuplicateCheck = false,
    forceResend = false
  }: SendNotificationOptions): Promise<{
    success: boolean;
    results: Array<{
      method: NotificationMethod;
      success: boolean;
      error?: string;
      notificationId?: string;
    }>;
  }> {
    const results: Array<{
      method: NotificationMethod;
      success: boolean;
      error?: string;
      notificationId?: string;
    }> = [];

    // Get booking to check current status
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        User_Booking_signerIdToUser: true,
        service: true
      }
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Check if this booking should receive this type of notification
    if (!this.shouldReceiveNotification(booking.status, type)) {
      console.log(`Booking ${bookingId} with status ${booking.status} should not receive ${type} notifications`);
      return { success: false, results: [] };
    }

    for (const method of methods) {
      try {
        const recipientIdentifier = method === NotificationMethod.EMAIL 
          ? recipient.email 
          : recipient.phone;

        if (!recipientIdentifier) {
          results.push({
            method,
            success: false,
            error: `Missing ${method.toLowerCase()} for recipient`
          });
          continue;
        }

        // Check for duplicates unless explicitly skipped or forced
        if (!skipDuplicateCheck && !forceResend) {
          const alreadySent = await this.hasNotificationBeenSent(
            bookingId,
            type,
            method,
            recipientIdentifier
          );

          if (alreadySent) {
            console.log(`Duplicate ${type} ${method} notification prevented for booking ${bookingId}`);
            results.push({
              method,
              success: false,
              error: 'Duplicate notification prevented'
            });
            continue;
          }
        }

        let sendResult = { success: false, error: 'Unknown error' };

        // Send via appropriate method
        if (method === NotificationMethod.EMAIL && recipient.email) {
          if (!content.subject) {
            results.push({
              method,
              success: false,
              error: 'Subject required for email notifications'
            });
            continue;
          }

          sendResult = await this.sendEmailNotification(
            recipient.email,
            content.subject,
            content.message
          );
        } else if (method === NotificationMethod.SMS && recipient.phone) {
          // Check SMS consent
          if (recipient.email) {
            const hasConsent = await checkSmsConsent(recipient.email);
            if (!hasConsent) {
              results.push({
                method,
                success: false,
                error: 'No SMS consent'
              });
              continue;
            }
          }

          sendResult = await this.sendSmsNotification(
            recipient.phone,
            content.message
          );
        }

        // Log the notification attempt
        const notificationLog = await prisma.notificationLog.create({
          data: {
            bookingId,
            notificationType: type,
            method,
            recipientEmail: method === NotificationMethod.EMAIL ? recipient.email : null,
            recipientPhone: method === NotificationMethod.SMS ? recipient.phone : null,
            subject: content.subject,
            message: content.message,
            status: sendResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
            errorMessage: sendResult.error,
            metadata: content.metadata || {}
          }
        });

        results.push({
          method,
          success: sendResult.success,
          error: sendResult.error,
          notificationId: notificationLog.id
        });

        // Update booking with notification timestamp
        await this.updateBookingNotificationTimestamp(bookingId, type);

      } catch (error: any) {
        console.error(`Error sending ${method} notification for booking ${bookingId}:`, error);
        results.push({
          method,
          success: false,
          error: error.message
        });
      }
    }

    const overallSuccess = results.some(r => r.success);
    return { success: overallSuccess, results };
  }

  /**
   * Update booking notification timestamps
   */
  private async updateBookingNotificationTimestamp(
    bookingId: string,
    type: NotificationType
  ): Promise<void> {
    const now = new Date();
    const updateData: any = { lastReminderSentAt: now };

    switch (type) {
      case NotificationType.APPOINTMENT_REMINDER_24HR:
        updateData.reminder24hrSentAt = now;
        break;
      case NotificationType.APPOINTMENT_REMINDER_2HR:
        updateData.reminder2hrSentAt = now;
        break;
      case NotificationType.APPOINTMENT_REMINDER_1HR:
        updateData.reminder1hrSentAt = now;
        break;
      case NotificationType.BOOKING_CONFIRMATION:
        updateData.confirmationEmailSentAt = now;
        break;
      case NotificationType.POST_SERVICE_FOLLOWUP:
        updateData.followUpSentAt = now;
        break;
      case NotificationType.NO_SHOW_CHECK:
        updateData.noShowCheckPerformedAt = now;
        break;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });
  }

  /**
   * Send email notification with retry mechanism
   */
  private async sendEmailNotification(
    to: string,
    subject: string,
    html: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await withRetry(
        async () => {
          await sendEmail({
            to,
            subject,
            html
          });
        },
        {
          maxRetries: 3,
          retryDelay: 2000,
          onRetry: (error, attempt) => {
            logger.warn(`Email delivery retry attempt ${attempt} for ${to}: ${error.message}`);
          },
          isRetryable: (error) => {
            // Determine if this error is worth retrying
            // Don't retry invalid email addresses
            if (error.message && (
                error.message.includes('invalid email') ||
                error.message.includes('invalid recipient') ||
                error.message.includes('rejected')
              )) {
              return false;
            }
            return true;
          }
        }
      );
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send email to ${to} after retries`, { error });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification with retry mechanism
   */
  private async sendSmsNotification(
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First check for consent
      const hasConsent = await checkSmsConsent(to);
      if (!hasConsent) {
        return { success: false, error: 'No SMS consent provided' };
      }
      
      // Use retry mechanism with the correct function signature
      const result = await withRetry(
        async () => {
          return await sendSms({ to, body: message });
        },
        {
          maxRetries: 3,
          retryDelay: 2000,
          onRetry: (error, attempt) => {
            logger.warn(`SMS delivery retry attempt ${attempt} for ${to}: ${error.message}`);
          },
          isRetryable: (error) => {
            // Don't retry invalid phone numbers
            if (error.message && (
                error.message.includes('invalid phone') ||
                error.message.includes('invalid number') ||
                error.message.includes('not a valid')
              )) {
              return false;
            }
            return true;
          }
        }
      );
      
      // Return the result from GHL's SMS service
      return { 
        success: result.success, 
        error: result.error 
      };
    } catch (error) {
      logger.error(`Failed to send SMS to ${to} after retries`, { error });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification history for a booking
   */
  static async getNotificationHistory(bookingId: string) {
    return await prisma.notificationLog.findMany({
      where: { bookingId },
      orderBy: { sentAt: 'desc' }
    });
  }

  /**
   * Check if booking needs any pending notifications
   */
  static async checkPendingNotifications(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        User_Booking_signerIdToUser: true,
        service: true
      }
    });

    if (!booking) return [];

    const now = new Date();
    const pendingNotifications = [];

    // Check for appointment reminders
    if (booking.scheduledDateTime && booking.status === BookingStatus.SCHEDULED) {
      const appointmentTime = new Date(booking.scheduledDateTime);
      const timeDiff = appointmentTime.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);

      // 24 hour reminder
      if (hoursUntil <= 24 && hoursUntil > 2 && !booking.reminder24hrSentAt) {
        pendingNotifications.push(NotificationType.APPOINTMENT_REMINDER_24HR);
      }

      // 2 hour reminder
      if (hoursUntil <= 2 && hoursUntil > 1 && !booking.reminder2hrSentAt) {
        pendingNotifications.push(NotificationType.APPOINTMENT_REMINDER_2HR);
      }

      // 1 hour reminder
      if (hoursUntil <= 1 && hoursUntil > 0 && !booking.reminder1hrSentAt) {
        pendingNotifications.push(NotificationType.APPOINTMENT_REMINDER_1HR);
      }

      // No-show check (30 minutes past appointment)
      if (hoursUntil < -0.5 && !booking.noShowCheckPerformedAt) {
        pendingNotifications.push(NotificationType.NO_SHOW_CHECK);
      }
    }

    return pendingNotifications;
  }

  /**
   * Instance method for sendNotification to match worker API expectations
   */
  async sendNotification(options: {
    bookingId: string;
    type: NotificationType;
    method?: NotificationMethod;
    templateId?: string;
    templateData?: Record<string, any>;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Get booking to determine recipient
      const booking = await prisma.booking.findUnique({
        where: { id: options.bookingId },
        include: {
          User_Booking_signerIdToUser: true,
          service: true
        }
      });

      if (!booking) {
        return { success: false, error: `Booking ${options.bookingId} not found` };
      }

      const recipient: NotificationRecipient = {
        email: booking.customerEmail || booking.User_Booking_signerIdToUser?.email,
        firstName: booking.User_Booking_signerIdToUser?.name?.split(' ')[0],
        lastName: booking.User_Booking_signerIdToUser?.name?.split(' ').slice(1).join(' ')
      };

      // Default to email if no method specified
      const methods = options.method ? [options.method] : [NotificationMethod.EMAIL];
      
      // Generate content based on type and template data
      const content = await this.generateNotificationContent(options.type, options.templateData || {});

      const result = await this.sendInstanceNotification({
        bookingId: options.bookingId,
        type: options.type,
        recipient,
        content,
        methods
      });

      return { 
        success: result.success, 
        error: result.success ? undefined : result.results[0]?.error || 'Failed to send notification'
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Generate notification content based on type and data
   */
  private async generateNotificationContent(
    type: NotificationType, 
    data: Record<string, any>
  ): Promise<NotificationContent> {
    // This is a basic implementation - you might want to use proper templates
    const templates: Record<NotificationType, { subject: string; message: string }> = {
      [NotificationType.BOOKING_CONFIRMATION]: {
        subject: 'Booking Confirmation',
        message: 'Your booking has been confirmed.'
      },
      [NotificationType.APPOINTMENT_REMINDER_24HR]: {
        subject: '24 Hour Reminder',
        message: 'Reminder: You have an appointment in 24 hours.'
      },
      [NotificationType.APPOINTMENT_REMINDER_2HR]: {
        subject: '2 Hour Reminder',
        message: 'Reminder: You have an appointment in 2 hours.'
      },
      [NotificationType.APPOINTMENT_REMINDER_1HR]: {
        subject: '1 Hour Reminder',
        message: 'Reminder: You have an appointment in 1 hour.'
      },
      [NotificationType.PAYMENT_CONFIRMATION]: {
        subject: 'Payment Confirmed',
        message: 'Your payment has been confirmed.'
      },
      [NotificationType.PAYMENT_REMINDER]: {
        subject: 'Payment Reminder',
        message: 'Please complete your payment.'
      },
      [NotificationType.PAYMENT_FAILED]: {
        subject: 'Payment Failed',
        message: 'Your payment could not be processed.'
      },
      [NotificationType.BOOKING_CANCELLED]: {
        subject: 'Booking Cancelled',
        message: 'Your booking has been cancelled.'
      },
      // Add more templates as needed
    } as any;

    const template = templates[type] || {
      subject: 'Notification',
      message: 'You have a new notification.'
    };

    return {
      subject: template.subject,
      message: template.message,
      metadata: data
    };
  }
}

// Export NotificationManager as an alias to NotificationService for backward compatibility
export const NotificationManager = NotificationService;

// Export convenience functions for common notification types
export const sendBookingConfirmation = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      User_Booking_signerIdToUser: true,
      service: true
    }
  });

  if (!booking) throw new Error('Booking not found');

  const recipient = {
    email: booking.User_Booking_signerIdToUser.email,
    phone: undefined, // Will be fetched from GHL if needed
    firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
  };

  // Get phone from GHL if email exists
  if (recipient.email) {
    try {
      const ghlContact = await ghl.getContactByEmail(recipient.email);
      if (ghlContact?.phone) {
        recipient.phone = ghlContact.phone;
      }
    } catch (error) {
      console.warn('Could not fetch phone from GHL:', error);
    }
  }

  const content = {
    subject: 'Booking Confirmation - Houston Mobile Notary Pros',
    message: `Hi ${recipient.firstName}, your booking for ${booking.service.name} has been confirmed. Details will be sent via email.`,
    metadata: {
      serviceId: booking.serviceId,
      serviceName: booking.service.name
    }
  };

  return await NotificationService.sendNotification({
    bookingId,
    type: NotificationType.BOOKING_CONFIRMATION,
    recipient,
    content,
    methods: [NotificationMethod.EMAIL, NotificationMethod.SMS]
  });
};

export const sendAppointmentReminder = async (
  bookingId: string,
  reminderType: '24hr' | '2hr' | '1hr'
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      User_Booking_signerIdToUser: true,
      service: true
    }
  });

  if (!booking) throw new Error('Booking not found');

  const typeMap = {
    '24hr': NotificationType.APPOINTMENT_REMINDER_24HR,
    '2hr': NotificationType.APPOINTMENT_REMINDER_2HR,
    '1hr': NotificationType.APPOINTMENT_REMINDER_1HR
  };

  const recipient = {
    email: booking.User_Booking_signerIdToUser.email,
    phone: undefined,
    firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
  };

  // Get phone from GHL
  if (recipient.email) {
    try {
      const ghlContact = await ghl.getContactByEmail(recipient.email);
      if (ghlContact?.phone) {
        recipient.phone = ghlContact.phone;
      }
    } catch (error) {
      console.warn('Could not fetch phone from GHL:', error);
    }
  }

  // Import SMS templates
  const { appointmentReminderSms } = await import('@/lib/sms/templates');
  
  const bookingDetails = {
    serviceName: booking.service.name,
    date: booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
    time: booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase() : 'TBD',
    addressShort: booking.addressCity || 'TBD'
  };

  const smsMessage = appointmentReminderSms(
    { firstName: recipient.firstName },
    bookingDetails,
    reminderType
  );

  // Create email content
  let timeDescription = '';
  switch (reminderType) {
    case '24hr': timeDescription = 'tomorrow'; break;
    case '2hr': timeDescription = 'in approximately 2 hours'; break;
    case '1hr': timeDescription = 'in approximately 1 hour'; break;
  }

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Appointment Reminder</h2>
      <p>Hi ${recipient.firstName},</p>
      <p>This is a friendly reminder that you have a notary appointment scheduled ${timeDescription}.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Appointment Details:</h3>
        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Date:</strong> ${booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}</p>
        <p><strong>Time:</strong> ${booking.scheduledDateTime ? new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD'}</p>
        <p><strong>Location:</strong> ${booking.addressStreet && booking.addressCity && booking.addressState && booking.addressZip ? 
          `${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}` : 'Address TBD'}</p>
        ${booking.locationNotes ? `<p><strong>Notes:</strong> ${booking.locationNotes}</p>` : ''}
      </div>
      
      <p>Please ensure you have all required documents and identification ready for your appointment.</p>
      <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
      
      <p>Best regards,<br>Houston Mobile Notary Pros</p>
    </div>
  `;

  const content = {
    subject: `Reminder: Your notary appointment ${timeDescription}`,
    message: smsMessage,
    metadata: {
      reminderType,
      serviceId: booking.serviceId,
      scheduledDateTime: booking.scheduledDateTime?.toISOString()
    }
  };

  return await NotificationService.sendNotification({
    bookingId,
    type: typeMap[reminderType],
    recipient,
    content: {
      ...content,
      message: emailHtml // Use HTML for email, SMS template for SMS
    },
    methods: [NotificationMethod.EMAIL, NotificationMethod.SMS]
  });
}; 