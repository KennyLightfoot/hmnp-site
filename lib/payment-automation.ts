import { prisma } from './prisma'
import { BookingStatus, PaymentStatus, PaymentProvider } from '@prisma/client'
import { NotificationService } from './notifications'
import * as ghl from './ghl'

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

export class PaymentAutomationService {
  private notificationService: NotificationService
  
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
    this.notificationService = new NotificationService()
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
  private async sendPaymentReminder(booking: any, payment: any, reminderNumber: number): Promise<void> {
    try {
      const isUrgent = reminderNumber >= 3
      const paymentLink = `${process.env.NEXT_PUBLIC_BASE_URL}/pay/${booking.id}`
      
      const baseMessage = `Payment reminder for your ${booking.service.name} appointment scheduled for ${booking.scheduledDateTime?.toLocaleString()}.`
      
      let reminderMessage = ''
      if (reminderNumber === 1) {
        reminderMessage = `${baseMessage} Amount due: $${payment.amount}. Please complete your payment to secure your appointment: ${paymentLink}`
      } else if (reminderNumber === 2) {
        reminderMessage = `${baseMessage} This is your second reminder. Payment of $${payment.amount} is still pending. Complete payment now: ${paymentLink}`
      } else if (reminderNumber === 3) {
        reminderMessage = `URGENT: ${baseMessage} This is your final reminder. Your appointment may be cancelled if payment is not received soon. Pay now: ${paymentLink}`
      } else {
        reminderMessage = `FINAL NOTICE: ${baseMessage} Your appointment will be automatically cancelled if payment of $${payment.amount} is not received within 24 hours. Pay immediately: ${paymentLink}`
      }

      // Send email reminder
      await this.notificationService.sendNotification({
        bookingId: booking.id,
        notificationType: 'PAYMENT_REMINDER',
        recipientEmail: booking.User_Booking_signerIdToUser.email,
        subject: `${isUrgent ? 'URGENT: ' : ''}Payment Required - Houston Mobile Notary Pros`,
        message: reminderMessage,
        method: 'EMAIL',
        metadata: {
          reminderNumber,
          paymentAmount: payment.amount,
          paymentId: payment.id
        }
      })

      // Send SMS reminder if urgent
      if (isUrgent && booking.User_Booking_signerIdToUser.phone) {
        await this.notificationService.sendNotification({
          bookingId: booking.id,
          notificationType: 'PAYMENT_REMINDER',
          recipientPhone: booking.User_Booking_signerIdToUser.phone,
          message: reminderMessage.replace(paymentLink, 'Check your email for payment link'),
          method: 'SMS',
          metadata: {
            reminderNumber,
            paymentAmount: payment.amount,
            paymentId: payment.id
          }
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
          status: PaymentStatus.VOIDED
        }
      })

      // Send cancellation notification
      await this.notificationService.sendNotification({
        bookingId: booking.id,
        notificationType: 'BOOKING_CANCELLED',
        recipientEmail: booking.User_Booking_signerIdToUser.email,
        subject: 'Appointment Cancelled - Payment Not Received',
        message: `Your appointment for ${booking.service.name} scheduled for ${booking.scheduledDateTime?.toLocaleString()} has been cancelled due to non-payment. Please contact us if you'd like to reschedule and complete payment.`,
        method: 'EMAIL'
      })

      // Update GHL
      const contact = await ghl.getContactByEmail(booking.User_Booking_signerIdToUser.email)
      if (contact && contact.id) {
        await ghl.addTagsToContact(contact.id, [
          'Status:Auto_Cancelled_NonPayment',
          'Revenue_Protection:Payment_Enforcement'
        ])
      }

      // Log the auto-cancellation
      console.log(`Auto-cancelled booking ${booking.id} due to: ${reason}`)

    } catch (error) {
      console.error('Error in autoCancelBooking:', error)
      throw error
    }
  }

  /**
   * Handle partial payment scenarios
   */
  async processPartialPayment(paymentId: string, amountPaid: number): Promise<{
    success: boolean
    message: string
    remainingBalance: number
  }> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          Booking: {
            include: {
              User_Booking_signerIdToUser: true,
              service: true
            }
          }
        }
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      const originalAmount = Number(payment.amount)
      const remainingBalance = originalAmount - amountPaid

      if (remainingBalance <= 0) {
        // Full payment received
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.COMPLETED }
        })

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.CONFIRMED }
        })

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
      await this.notificationService.sendNotification({
        bookingId: payment.bookingId,
        notificationType: 'PAYMENT_CONFIRMATION',
        recipientEmail: payment.Booking.User_Booking_signerIdToUser.email,
        subject: 'Partial Payment Received - Balance Due',
        message: `Thank you for your partial payment of $${amountPaid}. You have a remaining balance of $${remainingBalance} for your ${payment.Booking.service.name} appointment. Please complete the remaining payment to confirm your booking.`,
        method: 'EMAIL',
        metadata: {
          partialAmount: amountPaid,
          remainingBalance,
          newPaymentId: newPayment.id
        }
      })

      // Update GHL
      await ghl.addTagsToContact(payment.Booking.User_Booking_signerIdToUser.email, [
        'Status:Partial_Payment_Received',
        `Balance_Due:$${remainingBalance}`
      ])

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
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          Booking: {
            include: {
              User_Booking_signerIdToUser: true,
              service: true
            }
          }
        }
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          notes: payment.notes ? 
            `${payment.notes}\n\nPayment failed: ${errorMessage}` :
            `Payment failed: ${errorMessage}`        }
      })

      // Send failure notification
      const retryLink = `${process.env.NEXT_PUBLIC_BASE_URL}/pay/${payment.bookingId}`
      
      await this.notificationService.sendNotification({
        bookingId: payment.bookingId,
        notificationType: 'PAYMENT_FAILED',
        recipientEmail: payment.Booking.User_Booking_signerIdToUser.email,
        subject: 'Payment Failed - Action Required',
        message: `Your payment for ${payment.Booking.service.name} could not be processed. Please try again or use a different payment method: ${retryLink}`,
        method: 'EMAIL',
        metadata: {
          errorMessage,
          paymentAmount: payment.amount,
          retryLink
        }
      })

      // Update GHL
      const contact = await ghl.getContactByEmail(payment.Booking.User_Booking_signerIdToUser.email)
      if (contact && contact.id) {
        await ghl.addTagsToContact(contact.id, [
          'Status:Payment_Failed',
          'Action_Required:Retry_Payment'
        ])
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
      })

    } catch (error) {
      console.error('Error handling failed payment:', error)
      throw error
    }
  }

  /**
   * Update GHL for payment reminders
   */
  private async updateGHLForPaymentReminder(booking: any, reminderNumber: number): Promise<void> {
    try {
      // Get contact ID first
      const contact = await ghl.getContactByEmail(booking.User_Booking_signerIdToUser.email)
      if (!contact || !contact.id) {
        console.warn(`Contact not found in GHL for email: ${booking.User_Booking_signerIdToUser.email}`)
        return
      }

      const tags = [`Payment_Reminder:${reminderNumber}`]
      
      if (reminderNumber >= 3) {
        tags.push('Status:Payment_Overdue')
      }

      await ghl.addTagsToContact(contact.id, tags)

      await ghl.upsertContact({
        email: booking.User_Booking_signerIdToUser.email,
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
