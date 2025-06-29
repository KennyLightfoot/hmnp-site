import { prisma } from './prisma'
import { BookingStatus, PaymentStatus, PaymentProvider } from '@prisma/client'
import { NotificationService } from './notifications'
import * as ghl from './ghl'
import { NotificationMethod } from '@prisma/client'

export interface PaymentReminderConfig {
  intervals: number[] // Hours after payment due
  maxReminders: number
  autoCancel: boolean
  autoCancelHours: number
}

export interface DunningSettings {
  enableDunning: boolean
  maxAttempts: number
  backoffMultiplier: number
  finalNoticeHours: number
}

interface PaymentServiceNotificationRecipient {
  email: string;
  firstName: string;
  phone?: string | null;
}

interface BookingWithUserAndService {
  id: string;
  signer?: {
    email: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  service?: {
    name?: string | null;
  } | null;
  scheduledDateTime?: Date | null;
}

export class PaymentAutomationService {
  private notificationService: NotificationService = NotificationService.getInstance()
  
  // Default payment reminder configuration
  private defaultReminderConfig: PaymentReminderConfig = {
    intervals: [2, 24, 48, 72], // Send reminders at 2hr, 24hr, 48hr, 72hr after payment due
    maxReminders: 4,
    autoCancel: true,
    autoCancelHours: 120 // Auto-cancel after 5 days
  }

  private dunningSettings: DunningSettings = {
    enableDunning: true,
    maxAttempts: 3,
    backoffMultiplier: 2,
    finalNoticeHours: 96
  }

  constructor() {
    // NotificationService is initialized above using getInstance()
  }

  /**
   * Process all pending payments and send reminders/take actions
   */
  async processPaymentReminders(): Promise<{
    remindersProcessed: number
    paymentsAutoCancelled: number
    errors: string[]
  }> {
    const results = {
      remindersProcessed: 0,
      paymentsAutoCancelled: 0,
      errors: [] as string[]
    }

    try {
      // Get all bookings with pending payments
      const pendingPaymentBookings = await prisma.booking.findMany({
        where: {
          status: {
            in: [BookingStatus.PAYMENT_PENDING, BookingStatus.REQUESTED]
          },
          Payment: {
            some: {
              status: PaymentStatus.PENDING,
              createdAt: {
                lt: new Date(Date.now() - 2 * 60 * 60 * 1000) // At least 2 hours old
              }
            }
          }
        },
        include: {
          Payment: {
            where: { status: PaymentStatus.PENDING }
          },
          User_Booking_signerIdToUser: true,
          service: true
        }
      })

      for (const booking of pendingPaymentBookings) {
        try {
          await this.processBookingPaymentReminders(booking)
          results.remindersProcessed++
        } catch (error) {
          console.error(`Error processing payment reminders for booking ${booking.id}:`, error)
          results.errors.push(`Booking ${booking.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Process auto-cancellations
      const autoCancelResults = await this.processAutoCancellations()
      results.paymentsAutoCancelled = autoCancelResults.cancelled
      results.errors.push(...autoCancelResults.errors)

    } catch (error) {
      console.error('Error in processPaymentReminders:', error)
      results.errors.push(`Global error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return results
  }

  /**
   * Process payment reminders for a specific booking
   */
  private async processBookingPaymentReminders(booking: any): Promise<void> {
    const pendingPayments = booking.Payment.filter((p: any) => p.status === PaymentStatus.PENDING)
    
    for (const payment of pendingPayments) {
      const hoursSinceCreated = (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60)
      
      // Check if we should send a reminder
      const remindersDue = this.defaultReminderConfig.intervals.filter(interval => 
        hoursSinceCreated >= interval
      )

      if (remindersDue.length === 0) continue

      // Count existing payment reminders
      const existingReminders = await prisma.notificationLog.count({
        where: {
          bookingId: booking.id,
          notificationType: 'PAYMENT_REMINDER'
        }
      })

      // Check if we need to send a new reminder
      const nextReminderInterval = remindersDue[remindersDue.length - 1]
      const shouldSendReminder = existingReminders < this.defaultReminderConfig.maxReminders &&
                                existingReminders < remindersDue.length

      if (shouldSendReminder) {
        await this.sendPaymentReminder(booking, payment, existingReminders + 1)
      }

      // Check for auto-cancellation
      if (this.defaultReminderConfig.autoCancel && 
          hoursSinceCreated >= this.defaultReminderConfig.autoCancelHours) {
        await this.autoCancelBooking(booking, 'Payment not received within required timeframe')
      }
    }
  }

  /**
   * Send payment reminder to client
   */
  private async sendPaymentReminder(booking: BookingWithUserAndService, payment: any, reminderNumber: number): Promise<void> {
    try {
      if (!booking?.User_Booking_signerIdToUser?.email) {
        throw new Error('Booking is missing required user information');
      }

      const isUrgent = reminderNumber >= 3;
      const paymentLink = `${process.env.NEXT_PUBLIC_BASE_URL}/pay/${booking.id}`;
      
      const serviceName = booking.Service?.name || 'your service';
      const scheduledTime = booking.scheduledDateTime?.toLocaleString() || 'the scheduled time';
      const baseMessage = `Payment reminder for your ${serviceName} appointment scheduled for ${scheduledTime}.`;
      
      let reminderMessage = '';
      if (reminderNumber === 1) {
        reminderMessage = `${baseMessage} Amount due: $${payment.amount}. Please complete your payment to secure your appointment: ${paymentLink}`
      } else if (reminderNumber === 2) {
        reminderMessage = `${baseMessage} This is your second reminder. Payment of $${payment.amount} is still pending. Complete payment now: ${paymentLink}`
      } else if (reminderNumber === 3) {
        reminderMessage = `URGENT: ${baseMessage} This is your final reminder. Your appointment may be cancelled if payment is not received soon. Pay now: ${paymentLink}`
      } else {
        reminderMessage = `FINAL NOTICE: ${baseMessage} Your appointment will be automatically cancelled if payment of $${payment.amount} is not received within 24 hours. Pay immediately: ${paymentLink}`
      }

      // Send email notification
      await NotificationService.sendNotification({
        bookingId: booking.id,
        type: 'PAYMENT_REMINDER',
        recipient: {
          email: booking.User_Booking_signerIdToUser?.email || undefined,
          firstName: booking.User_Booking_signerIdToUser?.name?.split(' ')[0] || 'there',
        },
        content: {
          subject: isUrgent ? 'URGENT: Payment Reminder' : 'Friendly Payment Reminder',
          message: `${baseMessage} ${reminderMessage}`,
          metadata: {
            reminderNumber,
            paymentAmount: Number(payment.amount),
            paymentId: payment.id
          }
        },
        methods: [NotificationMethod.EMAIL]
      })

      // Send SMS reminder if urgent
      if (isUrgent && booking.User_Booking_signerIdToUser?.phone) {
        await NotificationService.sendNotification({
          bookingId: booking.id,
          type: 'PAYMENT_REMINDER',
          recipient: {
            phone: booking.User_Booking_signerIdToUser.phone
          },
          content: {
            message: reminderMessage.replace(paymentLink, 'Check your email for payment link'),
            metadata: {
              reminderNumber,
              paymentAmount: Number(payment.amount),
              paymentId: payment.id
            }
          },
          methods: [NotificationMethod.SMS]
        })
      }

      // Update GHL
      await this.updateGHLForPaymentReminder(booking, reminderNumber)

    } catch (error) {
      console.error('Error sending payment reminder:', error)
      throw error
    }
  }

  /**
   * Process automatic cancellations for non-payment
   */
  private async processAutoCancellations(): Promise<{
    cancelled: number
    errors: string[]
  }> {
    const results = { cancelled: 0, errors: [] as string[] }

    try {
      const bookingsToCancel = await prisma.booking.findMany({
        where: {
          status: {
            in: [BookingStatus.PAYMENT_PENDING, BookingStatus.REQUESTED]
          },
          Payment: {
            some: {
              status: PaymentStatus.PENDING,
              createdAt: {
                lt: new Date(Date.now() - this.defaultReminderConfig.autoCancelHours * 60 * 60 * 1000)
              }
            }
          }
        },
        include: {
          User_Booking_signerIdToUser: true,
          service: true,
          Payment: true
        }
      })

      for (const booking of bookingsToCancel) {
        try {
          await this.autoCancelBooking(booking, 'Automatically cancelled due to non-payment')
          results.cancelled++
        } catch (error) {
          console.error(`Error auto-cancelling booking ${booking.id}:`, error)
          results.errors.push(`Booking ${booking.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

    } catch (error) {
      console.error('Error in processAutoCancellations:', error)
      results.errors.push(`Auto-cancellation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return results
  }

  /**
   * Auto-cancel a booking due to payment issues
   */
  private async autoCancelBooking(booking: any, reason: string): Promise<void> {
    try {
      if (!booking?.User_Booking_signerIdToUser?.email) {
        throw new Error('Booking is missing required user information');
      }

      // Update booking status
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED_BY_STAFF,
          notes: booking.notes ? 
            `${booking.notes}\n\nAuto-cancelled: ${reason}` :
            `Auto-cancelled: ${reason}`
        }
      })

      // Cancel pending payments
      await prisma.payment.updateMany({
        where: { 
          bookingId: booking.id,
          status: PaymentStatus.PENDING
        },
        data: { 
          status: PaymentStatus.VOIDED,
          notes: 'Auto-cancelled due to non-payment',
          updatedAt: new Date()
        }
      })

      // Send cancellation notification
      await NotificationService.sendNotification({
        bookingId: booking.id,
        type: 'BOOKING_CANCELLED',
        recipient: {
          email: booking.User_Booking_signerIdToUser?.email || undefined,
          firstName: booking.User_Booking_signerIdToUser?.name?.split(' ')[0] || 'there',
        },
        content: {
          subject: 'Your Booking Has Been Cancelled',
          message: `Your booking for ${booking.Service?.name || 'your service'} has been cancelled due to: ${reason}`,
          metadata: {
            cancellationReason: reason
          }
        },
        methods: ['EMAIL']
      })

      // Update GHL if we have user email
      if (booking.User_Booking_signerIdToUser?.email) {
        try {
          const contact = await ghl.getContactByEmail(booking.User_Booking_signerIdToUser.email);
          if (contact?.id) {
            await ghl.addTagsToContact(contact.id, [
              'status:auto_cancelled_nonpayment',
              'revenue_protection:payment_enforcement'
            ]);
          }
        } catch (error) {
          console.error('Failed to update GHL contact:', error);
          // Continue with the rest of the function even if GHL update fails
        }
      }

      // Log the auto-cancellation
      console.log(`Auto-cancelled booking ${booking.id} due to: ${reason}`)

    } catch (error) {
      console.error('Error in autoCancelBooking:', error)
      throw error
    }
  }

  /**
   * Processes a partial payment for a booking.
   * Updates the existing payment record to reflect the amount paid and marks it as COMPLETED.
   * Creates a new PENDING payment record for the remaining balance.
   * Sends a notification to the user about the partial payment.
   * Updates GHL contact tags with the partial payment status and remaining balance.
   * @param paymentId The ID of the payment being partially paid.
   * @param amountPaid The amount that was paid.
   * @returns A promise resolving to an object indicating success, a message, and the remaining balance.
   */
  async processPartialPayment(paymentId: string, amountPaid: number): Promise<{
    success: boolean;
    message: string;
    remainingBalance: number;
  }> {
    if (!paymentId || amountPaid <= 0) {
      return {
        success: false,
        message: 'Invalid payment ID or amount',
        remainingBalance: 0
      };
    }

    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          Booking: {
            include: {
              service: true,
              User_Booking_signerIdToUser: true
            }
          }
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (!payment.Booking) {
        throw new Error('Associated booking not found for payment');
      }

      const originalAmount = Number(payment.amount);
    const remainingBalance = originalAmount - amountPaid;
    const userEmail = payment.Booking.User_Booking_signerIdToUser?.email;
    const userName = payment.Booking.User_Booking_signerIdToUser?.name;

    if (remainingBalance <= 0) {
      // Full payment received
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.COMPLETED }
      });

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED }
      });

      // Update GHL if we have user email
      if (userEmail) {
        try {
          const contact = await ghl.getContactByEmail(userEmail);
          if (contact?.id) {
            await ghl.addTagsToContact(contact.id, [
              'Payment:Completed',
              'Balance_Due:$0.00'
            ]);
          }
        } catch (error) {
          console.error('Failed to update GHL contact with payment status:', error);
          // Continue with the rest of the function even if GHL update fails
        }
      }

      return {
        success: true,
        message: 'Payment completed successfully',
        remainingBalance: 0
      }
    }

    // Partial payment - create new payment record for remaining balance
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amount: amountPaid,
        status: PaymentStatus.COMPLETED
      }
    })

    const newPayment = await prisma.payment.create({
      data: {
        bookingId: payment.bookingId,
        amount: remainingBalance,
        status: PaymentStatus.PENDING,
        provider: payment.provider,
        notes: `Remaining balance from partial payment of original amount $${originalAmount}`
      }
    })

    // Send partial payment notification
    // const userEmail = payment.Booking?.User_Booking_signerIdToUser?.email; // Already declared above
    // const userName = payment.Booking?.User_Booking_signerIdToUser?.name; // Already declared above
    
    if (userEmail) {
      try {
        await NotificationService.sendNotification({
          bookingId: payment.bookingId,
          type: 'PAYMENT_UPDATE',
          recipient: {
            email: userEmail,
            firstName: userName?.split(' ')[0] || 'there',
          },
          content: {
            subject: `Payment Update: $${amountPaid.toFixed(2)} Received`,
            message: `We've received a payment of $${amountPaid.toFixed(2)} for your booking. ` +
                    `Remaining balance: $${remainingBalance.toFixed(2)}.`,
            metadata: {
              amountPaid,
              remainingBalance,
              paymentId: payment.id
            }
          },
          methods: ['EMAIL']
        });
      } catch (error) {
        console.error('Failed to send payment update notification:', error);
        // Continue with the rest of the function even if notification fails
      }
    }

    // Update GHL if we have user email
    // const userEmail = payment.Booking.User_Booking_signerIdToUser?.email; // Already declared above
    if (userEmail) {
      try {
        const contact = await ghl.getContactByEmail(userEmail);
        if (contact?.id) {
          await ghl.addTagsToContact(contact.id, [
            'Payment:Partial_Received',
            `Balance_Due:$${remainingBalance.toFixed(2)}`
          ]);
        }
      } catch (error) {
        console.error('Failed to update GHL contact with payment status:', error);
        // Continue with the rest of the function even if GHL update fails
      }
    }

    return {
      success: true,
      message: `Partial payment of $${amountPaid} received. Remaining balance: $${remainingBalance}`,
      remainingBalance
    }

  } catch (error) {
    console.error('Error processing partial payment:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process partial payment',
      remainingBalance: 0
    }
  }
}

/**
 * Handle failed payment attempts
 */
  async handleFailedPayment(paymentId: string, errorMessage: string): Promise<void> {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        Booking: {
          include: {
            service: true,
            User_Booking_signerIdToUser: true
          }
        }
      }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.Booking) {
      throw new Error('Associated booking not found for payment');
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        notes: payment.notes ? 
          `${payment.notes}\n\nPayment failed: ${errorMessage}` :
          `Payment failed: ${errorMessage}`,
        updatedAt: new Date()
      }
    });

    const userEmail = payment.Booking.User_Booking_signerIdToUser?.email;
    const userName = payment.Booking.User_Booking_signerIdToUser?.name;
    // Phone is not available on signer based on current types/query
    const userPhone: string | null = null;

    if (userEmail) {
      const notificationRecipient: PaymentServiceNotificationRecipient = {
        email: userEmail,
        firstName: userName?.split(' ')[0] || 'there'
      };

      // Ensure phone is string | undefined for NotificationService compatibility
      notificationRecipient.phone = userPhone ?? undefined;

      try {
        await NotificationService.sendNotification({
          bookingId: payment.bookingId,
          type: 'PAYMENT_UPDATE',
          recipient: notificationRecipient,
          content: {
            subject: 'Payment Failed',
            message: `We were unable to process your payment. Please update your payment information to avoid service interruption. Error: ${errorMessage}`,
            metadata: {
              error: errorMessage,
              paymentId: payment.id,
              notificationType: 'PAYMENT_FAILED'
            }
          },
          methods: ['EMAIL']
        });
      } catch (error) {
        console.error('Failed to send payment failed notification:', error);
        // Continue with the rest of the function even if notification fails
      }
    }

    // Create new pending payment for retry
    await prisma.payment.create({
      data: {
        bookingId: payment.bookingId,
        amount: payment.amount,
        status: PaymentStatus.PENDING,
        provider: payment.provider,
        notes: `Retry payment after failure: ${errorMessage}`
      }
    });

    // Update GHL with payment status if we have user email
    if (userEmail) {
      try {
        const contact = await ghl.getContactByEmail(userEmail);
        if (contact?.id) {
          await ghl.addTagsToContact(contact.id, [
            'Payment:Failed',
            `Balance_Due:$${payment.amount.toFixed(2)}`
          ]);
        }
      } catch (error) {
        console.error('Failed to update GHL contact with payment status:', error);
        // Continue with the rest of the function even if GHL update fails
      }
    }
    } catch (error) { // This is the main catch for the try block that started after initial checks
      console.error('Error handling failed payment:', error);
      throw error; // Re-throw the error to be handled by the caller or a global error handler
    }
  } // Closes the handleFailedPayment method

  /**
   * Update GHL for payment reminders
   */
  private async updateGHLForPaymentReminder(booking: BookingWithUserAndService, reminderNumber: number): Promise<void> {
    try {
      // Get contact ID first
      const userEmail = booking.User_Booking_signerIdToUser?.email;
      if (!userEmail) {
        console.warn(`User email not found for booking ID: ${booking.id} in updateGHLForPaymentReminder`);
        return;
      }
      const contact = await ghl.getContactByEmail(userEmail);
      if (!contact || !contact.id) {
        console.warn(`Contact not found in GHL for email: ${userEmail}`)
        return
      }

      const tags = [`Payment_Reminder:${reminderNumber}`]
      
      if (reminderNumber >= 3) {
        tags.push('Status:Payment_Overdue')
      }

      await ghl.addTagsToContact(contact.id, tags)

      await ghl.upsertContact({
        email: userEmail || undefined, // Ensure it's string or undefined, though userEmail should be string here
        customFields: [
          { id: 'cf_payment_reminders_sent', value: reminderNumber.toString() },
          { id: 'cf_last_payment_reminder', value: new Date().toISOString() }
        ]
      })

    } catch (error) {
      console.error('Error updating GHL for payment reminder:', error)
    }
  }

  /**
   * Generate payment report for revenue protection
   */
  async generatePaymentReport(days: number = 30): Promise<{
    totalPendingPayments: number
    totalOverdueAmount: number
    autoCancellations: number
    remindersSent: number
    conversionRate: number
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [
      pendingPayments,
      reminders,
      autoCancellations,
      completedPayments
    ] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.PENDING,
          createdAt: { gte: startDate }
        }
      }),
      prisma.notificationLog.count({
        where: {
          notificationType: 'PAYMENT_REMINDER',
          createdAt: { gte: startDate }
        }
      }),
      prisma.booking.count({
        where: {
          status: BookingStatus.CANCELLED_BY_STAFF,
          updatedAt: { gte: startDate },
          notes: { contains: 'Auto-cancelled' }
        }
      }),
      prisma.payment.count({
        where: {
          status: PaymentStatus.COMPLETED,
          updatedAt: { gte: startDate }
        }
      })
    ])

    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const overduePayments = pendingPayments.filter(p => 
      (Date.now() - p.createdAt.getTime()) > 24 * 60 * 60 * 1000
    )
    const totalOverdueAmount = overduePayments.reduce((sum, p) => sum + Number(p.amount), 0)

    const totalPaymentAttempts = pendingPayments.length + completedPayments + autoCancellations
    const conversionRate = totalPaymentAttempts > 0 ? (completedPayments / totalPaymentAttempts) * 100 : 0

    return {
      totalPendingPayments: totalPendingAmount,
      totalOverdueAmount,
      autoCancellations,
      remindersSent: reminders,
      conversionRate: Math.round(conversionRate * 100) / 100
    }
  }
}

export const paymentAutomationService = new PaymentAutomationService() 
