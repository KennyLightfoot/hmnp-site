import { prisma } from './prisma'
import { BookingStatus, PaymentStatus } from '@prisma/client'
import { sendSms } from './sms'
import { NotificationService } from './notifications'
import * as ghl from './ghl'

export interface CancellationRequest {
  bookingId: string
  reason?: string
  requestedBy: 'CLIENT' | 'STAFF'
  cancellationFeeWaived?: boolean
}

export interface ReschedulingRequest {
  bookingId: string
  newDateTime: Date
  reason?: string
  requestedBy: 'CLIENT' | 'STAFF'
}

export interface RefundCalculation {
  totalRefund: number
  cancellationFee: number
  netRefund: number
  processingFee: number
  refundDeadline: Date
}

export class CancellationReschedulingService {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  /**
   * Calculate refund amount based on cancellation timing and business rules
   */
  async calculateRefund(bookingId: string): Promise<RefundCalculation> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        Payment: true
      }
    })

    if (!booking || !booking.scheduledDateTime) {
      throw new Error('Booking not found or not scheduled')
    }

    const totalPaid = booking.Payment
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const hoursUntilAppointment = (booking.scheduledDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
    
    let cancellationFee = 0
    let processingFee = 5 // Base processing fee

    // Business rules for cancellation fees
    if (hoursUntilAppointment < 2) {
      // Less than 2 hours: No refund (100% fee)
      cancellationFee = totalPaid
    } else if (hoursUntilAppointment < 24) {
      // Less than 24 hours: 50% cancellation fee
      cancellationFee = totalPaid * 0.5
    } else if (hoursUntilAppointment < 48) {
      // Less than 48 hours: $25 cancellation fee
      cancellationFee = Math.min(25, totalPaid * 0.25)
    } else {
      // More than 48 hours: $10 processing fee only
      cancellationFee = 0
      processingFee = 10
    }

    const netRefund = Math.max(0, totalPaid - cancellationFee - processingFee)
    
    // Refund deadline (within 5-7 business days)
    const refundDeadline = new Date()
    refundDeadline.setDate(refundDeadline.getDate() + 7)

    return {
      totalRefund: totalPaid,
      cancellationFee,
      netRefund,
      processingFee,
      refundDeadline
    }
  }

  /**
   * Process booking cancellation with automated refund
   */
  async processCancellation(request: CancellationRequest): Promise<{
    success: boolean
    refundCalculation: RefundCalculation
    message: string
  }> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: request.bookingId },
        include: {
          Service: true,
          Payment: true,
          User_Booking_signerIdToUser: true,
          User_Booking_notaryIdToUser: true
        }
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Check if booking can be cancelled
      if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED_BY_CLIENT, BookingStatus.CANCELLED_BY_STAFF].includes(booking.status as any)) {
        throw new Error('Booking cannot be cancelled - invalid status')
      }

      // Calculate refund
      const refundCalculation = await this.calculateRefund(request.bookingId)
      
      // If fee is waived by staff, adjust calculation
      if (request.cancellationFeeWaived && request.requestedBy === 'STAFF') {
        refundCalculation.cancellationFee = 0
        refundCalculation.netRefund = refundCalculation.totalRefund - refundCalculation.processingFee
      }

      // Update booking status
      const cancelStatus = request.requestedBy === 'CLIENT' 
        ? BookingStatus.CANCELLED_BY_CLIENT 
        : BookingStatus.CANCELLED_BY_STAFF

      await prisma.booking.update({
        where: { id: request.bookingId },
        data: {
          status: cancelStatus,
          notes: booking.notes ? 
            `${booking.notes}\n\nCancelled: ${request.reason || 'No reason provided'}` :
            `Cancelled: ${request.reason || 'No reason provided'}`
        }
      })

      // Process refund if applicable
      if (refundCalculation.netRefund > 0) {
        await this.processRefund(request.bookingId, refundCalculation)
      }

      // Send notifications
      await this.sendCancellationNotifications(booking, refundCalculation, request)

      // Update GHL
      await this.updateGHLForCancellation(booking, refundCalculation)

      // Check waitlist for this time slot
      await this.notifyWaitlist(booking.scheduledDateTime, booking.Service.id)

      return {
        success: true,
        refundCalculation,
        message: `Booking cancelled successfully. ${refundCalculation.netRefund > 0 ? `Refund of $${refundCalculation.netRefund} will be processed within 5-7 business days.` : 'No refund applicable due to cancellation timing.'}`
      }

    } catch (error) {
      console.error('Error processing cancellation:', error)
      return {
        success: false,
        refundCalculation: {
          totalRefund: 0,
          cancellationFee: 0,
          netRefund: 0,
          processingFee: 0,
          refundDeadline: new Date()
        },
        message: error instanceof Error ? error.message : 'Failed to process cancellation'
      }
    }
  }

  /**
   * Process refund through payment provider
   */
  private async processRefund(bookingId: string, refundCalculation: RefundCalculation): Promise<void> {
    const payments = await prisma.payment.findMany({
      where: { 
        bookingId,
        status: PaymentStatus.COMPLETED
      },
      orderBy: { createdAt: 'desc' }
    })

    let remainingRefund = refundCalculation.netRefund

    for (const payment of payments) {
      if (remainingRefund <= 0) break

      const refundAmount = Math.min(remainingRefund, Number(payment.amount))
      
      try {
        // TODO: Integrate with actual payment processor (Stripe/Square)
        // For now, we'll mark the refund in our system
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            refundedAmount: refundAmount,
            refundedAt: new Date(),
            status: refundAmount === Number(payment.amount) ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED
          }
        })

        remainingRefund -= refundAmount

        // TODO: Call actual payment processor API
        // await stripe.refunds.create({
        //   payment_intent: payment.paymentIntentId,
        //   amount: refundAmount * 100,
        //   reason: 'requested_by_customer'
        // })

      } catch (error) {
        console.error(`Failed to process refund for payment ${payment.id}:`, error)
        // Continue with other payments even if one fails
      }
    }
  }

  /**
   * Handle rescheduling request
   */
  async processRescheduling(request: ReschedulingRequest): Promise<{
    success: boolean
    message: string
    newBookingDetails?: any
  }> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: request.bookingId },
        include: {
          Service: true,
          User_Booking_signerIdToUser: true
        }
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Check if booking can be rescheduled
      if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED_BY_CLIENT, BookingStatus.CANCELLED_BY_STAFF].includes(booking.status as any)) {
        throw new Error('Booking cannot be rescheduled - invalid status')
      }

      // Check if new time is available
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          scheduledDateTime: request.newDateTime,
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.SCHEDULED, BookingStatus.READY_FOR_SERVICE]
          },
          id: { not: request.bookingId }
        }
      })

      if (conflictingBooking) {
        throw new Error('Requested time slot is not available')
      }

      // Calculate if reschedule fee applies
      const currentTime = new Date()
      const hoursUntilOriginal = booking.scheduledDateTime ? 
        (booking.scheduledDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60) : 0

      let rescheduleFee = 0
      if (hoursUntilOriginal < 24 && request.requestedBy === 'CLIENT') {
        rescheduleFee = 15 // $15 reschedule fee for less than 24 hours notice
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id: request.bookingId },
        data: {
          scheduledDateTime: request.newDateTime,
          status: BookingStatus.SCHEDULED,
          notes: booking.notes ? 
            `${booking.notes}\n\nRescheduled from ${booking.scheduledDateTime?.toISOString()} to ${request.newDateTime.toISOString()}. Reason: ${request.reason || 'Not specified'}` :
            `Rescheduled to ${request.newDateTime.toISOString()}. Reason: ${request.reason || 'Not specified'}`
        }
      })

      // Process reschedule fee if applicable
      if (rescheduleFee > 0) {
        await prisma.payment.create({
          data: {
            bookingId: request.bookingId,
            amount: rescheduleFee,
            status: PaymentStatus.PENDING,
            provider: 'STRIPE', // Default provider
            notes: `Reschedule fee for less than 24 hours notice`
          }
        })
      }

      // Send notifications
      await this.sendReschedulingNotifications(booking, request.newDateTime, rescheduleFee)

      // Update GHL
      await this.updateGHLForReschedule(booking, request.newDateTime)

      // Clear reminder timestamps so new reminders will be sent
      await prisma.booking.update({
        where: { id: request.bookingId },
        data: {
          reminder24hrSentAt: null,
          reminder2hrSentAt: null,
          reminder1hrSentAt: null
        }
      })

      return {
        success: true,
        message: `Booking successfully rescheduled to ${request.newDateTime.toLocaleString()}${rescheduleFee > 0 ? ` (Reschedule fee: $${rescheduleFee})` : ''}`,
        newBookingDetails: updatedBooking
      }

    } catch (error) {
      console.error('Error processing rescheduling:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process rescheduling'
      }
    }
  }

  /**
   * Send cancellation notifications to all parties
   */
  private async sendCancellationNotifications(
    booking: any, 
    refundCalculation: RefundCalculation, 
    request: CancellationRequest
  ): Promise<void> {
    try {
      // Send to client
      const clientMessage = `Your appointment scheduled for ${booking.scheduledDateTime?.toLocaleString()} has been cancelled. ${
        refundCalculation.netRefund > 0 
          ? `A refund of $${refundCalculation.netRefund} will be processed within 5-7 business days.`
          : 'Due to the cancellation timing, no refund is applicable.'
      }`

      const recipient = {
        email: booking.User_Booking_signerIdToUser.email,
        phone: booking.User_Booking_signerIdToUser.phone,
        firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
      }

      const content = {
        subject: 'Appointment Cancelled - Houston Mobile Notary Pros',
        message: clientMessage,
        metadata: {
          refundAmount: refundCalculation.netRefund,
          cancellationReason: request.reason
        }
      }

      await NotificationService.sendNotification({
        bookingId: booking.id,
        type: 'BOOKING_CANCELLED',
        recipient,
        content,
        methods: ['EMAIL', 'SMS']
      })

      // Notify staff
      const staffMessage = `Booking ${booking.id} has been cancelled by ${request.requestedBy}. 
        Client: ${booking.User_Booking_signerIdToUser.name}
        Original time: ${booking.scheduledDateTime?.toLocaleString()}
        Reason: ${request.reason || 'Not provided'}
        Refund amount: $${refundCalculation.netRefund}`

      // TODO: Send to staff notification channel (Slack, email, etc.)
      console.log('Staff notification:', staffMessage)

    } catch (error) {
      console.error('Error sending cancellation notifications:', error)
    }
  }

  /**
   * Send rescheduling notifications
   */
  private async sendReschedulingNotifications(
    booking: any,
    newDateTime: Date,
    rescheduleFee: number
  ): Promise<void> {
    try {
      const message = `Your appointment has been rescheduled to ${newDateTime.toLocaleString()}.${
        rescheduleFee > 0 ? ` A reschedule fee of $${rescheduleFee} applies.` : ''
      } We'll send you reminders as the appointment approaches.`

      const recipient = {
        email: booking.User_Booking_signerIdToUser.email,
        phone: booking.User_Booking_signerIdToUser.phone,
        firstName: booking.User_Booking_signerIdToUser.name?.split(' ')[0]
      }

      const content = {
        subject: 'Appointment Rescheduled - Houston Mobile Notary Pros',
        message: message,
        metadata: {
          newDateTime: newDateTime.toISOString(),
          rescheduleFee
        }
      }

      await NotificationService.sendNotification({
        bookingId: booking.id,
        type: 'BOOKING_RESCHEDULED',
        recipient,
        content,
        methods: ['EMAIL', 'SMS']
      })

    } catch (error) {
      console.error('Error sending rescheduling notifications:', error)
    }
  }

  /**
   * Update GHL contact for cancellation
   */
  private async updateGHLForCancellation(booking: any, refundCalculation: RefundCalculation): Promise<void> {
    try {
      // Get contact ID first
      const contact = await ghl.getContactByEmail(booking.User_Booking_signerIdToUser.email)
      if (!contact || !contact.id) {
        console.warn(`Contact not found in GHL for email: ${booking.User_Booking_signerIdToUser.email}`)
        return
      }

      // Update contact tags and fields
      await ghl.addTagsToContact(contact.id, [
        'Status:Booking_Cancelled',
        `Refund_Amount:$${refundCalculation.netRefund}`
      ])

      // Update custom fields using upsertContact
      await ghl.upsertContact({
        email: booking.User_Booking_signerIdToUser.email,
        customFields: [
          { id: 'cf_last_booking_status', value: 'CANCELLED' },
          { id: 'cf_last_cancellation_date', value: new Date().toISOString() },
          { id: 'cf_refund_amount', value: refundCalculation.netRefund.toString() }
        ]
      })

    } catch (error) {
      console.error('Error updating GHL for cancellation:', error)
    }
  }

  /**
   * Update GHL contact for rescheduling
   */
  private async updateGHLForReschedule(booking: any, newDateTime: Date): Promise<void> {
    try {
      // Get contact ID first
      const contact = await ghl.getContactByEmail(booking.User_Booking_signerIdToUser.email)
      if (!contact || !contact.id) {
        console.warn(`Contact not found in GHL for email: ${booking.User_Booking_signerIdToUser.email}`)
        return
      }

      await ghl.addTagsToContact(contact.id, [
        'Status:Booking_Rescheduled'
      ])

      await ghl.upsertContact({
        email: booking.User_Booking_signerIdToUser.email,
        customFields: [
          { id: 'cf_booking_date_time', value: newDateTime.toISOString() },
          { id: 'cf_last_reschedule_date', value: new Date().toISOString() }
        ]
      })

    } catch (error) {
      console.error('Error updating GHL for rescheduling:', error)
    }
  }

  /**
   * Notify people on waitlist about available slot
   */
  private async notifyWaitlist(dateTime: Date | null, serviceId: string): Promise<void> {
    if (!dateTime) return

    try {
      // TODO: Implement waitlist functionality
      // This would query a waitlist table and notify contacts about available slots
      console.log(`Notifying waitlist about available slot: ${dateTime.toISOString()} for service ${serviceId}`)
      
      // Example implementation:
      // const waitlistEntries = await prisma.waitlist.findMany({
      //   where: {
      //     serviceId,
      //     preferredDate: { lte: dateTime },
      //     notified: false
      //   },
      //   orderBy: { createdAt: 'asc' },
      //   take: 5 // Notify top 5 on waitlist
      // })

      // for (const entry of waitlistEntries) {
      //   await this.notificationService.sendNotification({
      //     notificationType: 'WAITLIST_SLOT_AVAILABLE',
      //     recipientEmail: entry.email,
      //     subject: 'Appointment Slot Available!',
      //     message: `A slot has opened up for ${dateTime.toLocaleString()}. Book now!`
      //   })
      // }

    } catch (error) {
      console.error('Error notifying waitlist:', error)
    }
  }
}

export const cancellationReschedulingService = new CancellationReschedulingService() 