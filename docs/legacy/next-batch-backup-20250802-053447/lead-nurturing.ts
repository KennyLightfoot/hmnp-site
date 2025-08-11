import { prisma } from './prisma'
import { getErrorMessage } from '@/lib/utils/error-utils';
import { BookingStatus, NotificationType, NotificationMethod } from '@prisma/client'
import { NotificationService } from './notifications'
import { getContactsByTag, getContactByEmail, addTagsToContactByEmail } from './ghl'
import { logger } from '@/lib/logger'

export interface NurtureSequence {
  id: string
  name: string
  description: string
  trigger: NurtureTrigger
  steps: NurtureStep[]
  exitConditions: ExitCondition[]
}

export interface NurtureStep {
  stepNumber: number
  delayHours: number
  message: NurtureMessage
  channels: ('EMAIL' | 'SMS')[]
  condition?: StepCondition
}

export interface NurtureMessage {
  subject?: string
  content: string
  cta?: string
  ctaLink?: string
}

export interface NurtureTrigger {
  type: 'ABANDONED_BOOKING' | 'QUOTE_REQUEST' | 'WEBSITE_VISITOR' | 'INACTIVE_CLIENT' | 'POST_SERVICE'
  criteria: Record<string, any>
}

export interface ExitCondition {
  type: 'BOOKING_COMPLETED' | 'UNSUBSCRIBED' | 'RESPONDED' | 'TIME_LIMIT'
  value?: any
}

export interface StepCondition {
  type: 'TAG_PRESENT' | 'TAG_ABSENT' | 'FIELD_EQUALS' | 'TIME_BASED'
  field?: string
  value?: any
}

export interface LeadNurtureEnrollment {
  id: string
  contactEmail: string
  sequenceId: string
  currentStep: number
  enrolledAt: Date
  lastMessageSent?: Date
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'EXITED'
  exitReason?: string
}

export class LeadNurturingService {
  private notificationService: NotificationService
  
  // Predefined nurture sequences
  private sequences: NurtureSequence[] = [
    // Abandoned Booking Recovery
    {
      id: 'abandoned-booking',
      name: 'Abandoned Booking Recovery',
      description: 'Re-engage users who started but didn\'t complete a booking',
      trigger: {
        type: 'ABANDONED_BOOKING',
        criteria: { minutesInactive: 30 }
      },
      steps: [
        {
          stepNumber: 1,
          delayHours: 1,
          channels: ['EMAIL'],
          message: {
            subject: 'Complete Your Notary Booking - We\'re Here to Help',
            content: `Hi {firstName},

We noticed you started booking a notary service but didn't complete the process. We're here to help!

Complete your booking now and secure your preferred time slot. Our mobile notaries are ready to serve you at your convenience.

{ctaButton}

Questions? Reply to this email or call us at (713) 893-3300.

Best regards,
Houston Mobile Notary Pros`,
            cta: 'Complete Your Booking',
            ctaLink: '/booking'
          }
        },
        {
          stepNumber: 2,
          delayHours: 24,
          channels: ['EMAIL', 'SMS'],
          message: {
            subject: 'Special Offer: $10 Off Your First Notary Service',
            content: `Hi {firstName},

We'd love to help you with your notary needs! As a special welcome offer, we're giving you $10 off your first service.

✅ Mobile service at your location
✅ Licensed and insured notaries  
✅ Available 7 days a week
✅ Same-day appointments available

Use code: WELCOME10

{ctaButton}

This offer expires in 48 hours.`,
            cta: 'Claim Your Discount',
            ctaLink: '/booking?promo=WELCOME10'
          }
        },
        {
          stepNumber: 3,
          delayHours: 72,
          channels: ['EMAIL'],
          message: {
            subject: 'Your Documents Need Notarization - We Make It Easy',
            content: `Hi {firstName},

Did you know that improperly notarized documents can cause serious legal issues and delays?

Our certified notaries ensure your documents are handled correctly the first time:

• Real Estate Transactions
• Legal Documents  
• Business Contracts
• Powers of Attorney
• And more...

Don't risk delays or rejections. Let our experts handle your notarization needs.

{ctaButton}`,
            cta: 'Schedule Your Appointment',
            ctaLink: '/booking'
          }
        }
      ],
      exitConditions: [
        { type: 'BOOKING_COMPLETED' },
        { type: 'UNSUBSCRIBED' },
        { type: 'TIME_LIMIT', value: 168 } // 7 days
      ]
    },

    // Quote Follow-up Sequence
    {
      id: 'quote-followup',
      name: 'Quote Follow-up Sequence',
      description: 'Follow up on quote requests that haven\'t converted',
      trigger: {
        type: 'QUOTE_REQUEST',
        criteria: { hoursWithoutResponse: 4 }
      },
      steps: [
        {
          stepNumber: 1,
          delayHours: 4,
          channels: ['EMAIL'],
          message: {
            subject: 'Your Notary Quote - Questions?',
            content: `Hi {firstName},

Thank you for requesting a quote for {serviceType}. We've prepared a competitive estimate for your notary needs.

If you have any questions about our pricing or services, we're here to help! 

{ctaButton}

Many of our clients appreciate:
• Transparent, upfront pricing
• No hidden fees
• Professional, licensed notaries
• Flexible scheduling

Ready to book? It only takes 2 minutes to secure your appointment.`,
            cta: 'Book Your Service',
            ctaLink: '/booking'
          }
        },
        {
          stepNumber: 2,
          delayHours: 48,
          channels: ['EMAIL'],
          message: {
            subject: 'Price Match Guarantee + Free Consultation',
            content: `Hi {firstName},

We want to earn your business! That's why we offer:

🎯 Price Match Guarantee - Found a lower price? We'll match it
📞 Free 10-minute consultation to discuss your needs
⏰ Same-day service available
🚗 No travel fees within our service area

Don't settle for less than the best. Our 5-star rated notaries are ready to serve you.

{ctaButton}

Questions? Call us at (713) 893-3300 for immediate assistance.`,
            cta: 'Get Your Free Consultation',
            ctaLink: '/booking'
          }
        }
      ],
      exitConditions: [
        { type: 'BOOKING_COMPLETED' },
        { type: 'RESPONDED' },
        { type: 'TIME_LIMIT', value: 120 } // 5 days
      ]
    },

    // Educational Sequence for New Leads
    {
      id: 'educational-sequence',
      name: 'Educational Nurture Sequence',
      description: 'Educate leads about notary services and build trust',
      trigger: {
        type: 'WEBSITE_VISITOR',
        criteria: { pagesViewed: 3, noBooking: true }
      },
      steps: [
        {
          stepNumber: 1,
          delayHours: 24,
          channels: ['EMAIL'],
          message: {
            subject: 'The Complete Guide to Notary Services in Houston',
            content: `Hi {firstName},

Thanks for visiting our website! We've put together a helpful guide to notary services in Houston.

📚 What you'll learn:
• When you need a notary (it's more often than you think!)
• How to prepare your documents  
• What to bring to your appointment
• How mobile notary saves you time and money

{ctaButton}

This free guide has helped thousands of Houstonians handle their notary needs efficiently.

Questions? We're always here to help!`,
            cta: 'Download Free Guide',
            ctaLink: '/resources/notary-guide'
          }
        },
        {
          stepNumber: 2,
          delayHours: 72,
          channels: ['EMAIL'],
          message: {
            subject: 'Why Mobile Notary is Perfect for Busy Professionals',
            content: `Hi {firstName},

As a busy professional, your time is valuable. That's why mobile notary service is perfect for you:

⏰ Save 2-3 hours per appointment
🏢 We come to your office or home
📅 Flexible scheduling including evenings/weekends  
💼 Discrete, professional service
✅ All documents handled correctly the first time

Real client testimonial:
"HMNP saved me from taking time off work. The notary came to my office and handled everything professionally. Will definitely use again!" - Sarah M.

{ctaButton}`,
            cta: 'See Our Services',
            ctaLink: '/services'
          }
        },
        {
          stepNumber: 3,
          delayHours: 120,
          channels: ['EMAIL'],
          message: {
            subject: 'Common Notary Mistakes That Cost Time & Money',
            content: `Hi {firstName},

Did you know that 40% of notarized documents have errors that cause delays?

Common mistakes we see:
❌ Incorrect ID requirements
❌ Missing signatures  
❌ Wrong notary type for the document
❌ Incomplete acknowledgments

Don't risk delays or legal issues. Our certified notaries ensure everything is done right the first time.

{ctaButton}

When you need notary services, trust the experts with 500+ 5-star reviews.`,
            cta: 'Book Professional Service',
            ctaLink: '/booking'
          }
        }
      ],
      exitConditions: [
        { type: 'BOOKING_COMPLETED' },
        { type: 'UNSUBSCRIBED' },
        { type: 'TIME_LIMIT', value: 336 } // 14 days
      ]
    },

    // Re-engagement for Inactive Clients
    {
      id: 'reengagement-inactive',
      name: 'Win-Back Inactive Clients',
      description: 'Re-engage past clients who haven\'t used services recently',
      trigger: {
        type: 'INACTIVE_CLIENT',
        criteria: { daysSinceLastService: 180 }
      },
      steps: [
        {
          stepNumber: 1,
          delayHours: 0,
          channels: ['EMAIL'],
          message: {
            subject: 'We Miss You! 20% Off Your Next Notary Service',
            content: `Hi {firstName},

We noticed it's been a while since we helped you with notary services. We miss having you as a client!

As a returning customer, we're offering you 20% off your next service:

🎁 20% OFF with code: WELCOME_BACK
📞 Priority scheduling  
🚗 Same-day service available
⭐ Our improved 5-star rated service

Whether you need help with real estate documents, legal papers, or business contracts, we're here for you.

{ctaButton}

This exclusive offer expires in 30 days.`,
            cta: 'Claim Your 20% Discount',
            ctaLink: '/booking?promo=WELCOME_BACK'
          }
        },
        {
          stepNumber: 2,
          delayHours: 168, // 1 week later
          channels: ['EMAIL'],
          message: {
            subject: 'New Services Available + Your 20% Discount Still Valid',
            content: `Hi {firstName},

Your 20% discount is still available! Plus, we've added new services you might find useful:

🆕 Loan Signing Services
🆕 Business Document Packages  
🆕 Estate Planning Notarization
🆕 Remote Online Notarization (RON)

Code: WELCOME_BACK (expires soon!)

{ctaButton}

P.S. Many clients tell us they wish they had known about our services earlier. Don't wait for the last minute!`,
            cta: 'See New Services & Book',
            ctaLink: '/services?promo=WELCOME_BACK'
          }
        }
      ],
      exitConditions: [
        { type: 'BOOKING_COMPLETED' },
        { type: 'UNSUBSCRIBED' },
        { type: 'TIME_LIMIT', value: 720 } // 30 days
      ]
    }
  ]

  constructor() {
    this.notificationService = NotificationService
  }

  /**
   * Process all active nurture sequences
   */
  async processNurtureSequences(): Promise<{
    sequencesProcessed: number
    messagesScheduled: number
    enrollmentsCompleted: number
    errors: string[]
  }> {
    const results = {
      sequencesProcessed: 0,
      messagesScheduled: 0,
      enrollmentsCompleted: 0,
      errors: [] as string[]
    }

    try {
      // Process abandoned bookings
      await this.processAbandonedBookings()
      results.sequencesProcessed++

      // Process quote follow-ups
      await this.processQuoteFollowups()
      results.sequencesProcessed++

      // Process inactive client re-engagement
      await this.processInactiveClients()
      results.sequencesProcessed++

      // Process all active enrollments
      const activeEnrollments = await this.getActiveEnrollments()
      
      for (const enrollment of activeEnrollments) {
        try {
          const processed = await this.processEnrollment(enrollment)
          if (processed.messageSent) results.messagesScheduled++
          if (processed.completed) results.enrollmentsCompleted++
        } catch (error) {
          logger.error(`Error processing enrollment ${enrollment.id}`, 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
          results.errors.push(`Enrollment ${enrollment.id}: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`)
        }
      }

    } catch (error) {
      logger.error('Error in processNurtureSequences', 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
      results.errors.push(`Global error: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`)
    }

    return results
  }

  /**
   * Identify and enroll abandoned bookings
   */
  private async processAbandonedBookings(): Promise<void> {
    try {
      // Find potential abandoned bookings (website visitors who didn't complete booking)
      // This would typically come from analytics or session tracking
      
      // For now, we'll check for bookings that were started but not completed
      const incompleteBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.REQUESTED,
          createdAt: {
            lt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000) // within last 24 hours
          }
        },
        include: {
          User_Booking_signerIdToUser: true
        }
      })

      for (const booking of incompleteBookings) {
        // Check if user has email before processing
        const userEmail = booking.User_Booking_signerIdToUser.email
        if (!userEmail) {
          logger.warn(`Skipping booking ${booking.id} - no email for user`, 'LEAD_NURTURING')
          continue
        }

        // Check if already enrolled
        const existingEnrollment = await this.findEnrollment(
          userEmail,
          'abandoned-booking'
        )

        if (!existingEnrollment) {
          await this.enrollInSequence(
            userEmail,
            'abandoned-booking',
            { bookingId: booking.id }
          )
        }
      }

    } catch (error) {
      logger.error('Error processing abandoned bookings', 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Process quote follow-ups for unresponded quotes
   */
  private async processQuoteFollowups(): Promise<void> {
    try {
      // This would integrate with your quote/pricing system
      // For now, we'll simulate with contacts tagged as quote requests
      
      const quoteContacts = await getContactsByTag('Status:Quote_Requested')
      
      for (const contact of quoteContacts) {
        // Check if quote was sent more than 4 hours ago without booking
        const quoteSentDate = contact.customFields?.cf_quote_sent_date
        if (!quoteSentDate) continue
        
        const quoteSentHours = this.getHoursSince(new Date(quoteSentDate))
        
        if (quoteSentHours >= 4 && !contact.tags?.includes('Status:Booking_Completed')) {
          const existingEnrollment = await this.findEnrollment(contact.email, 'quote-followup')
          
          if (!existingEnrollment) {
            await this.enrollInSequence(contact.email, 'quote-followup', {
              serviceType: contact.customFields?.cf_service_type || 'notary service'
            })
          }
        }
      }

    } catch (error) {
      logger.error('Error processing quote follow-ups', 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Process inactive client re-engagement
   */
  private async processInactiveClients(): Promise<void> {
    try {
      // Find clients with completed bookings but no recent activity
      const inactiveClients = await prisma.booking.findMany({
        where: {
          status: BookingStatus.COMPLETED,
          updatedAt: {
            lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 180 days ago
          }
        },
        include: {
          User_Booking_signerIdToUser: true
        },
        distinct: ['signerId']
      })

      for (const booking of inactiveClients) {
        // Check if user has email before processing
        const userEmail = booking.User_Booking_signerIdToUser.email
        if (!userEmail) {
          logger.warn(`Skipping booking ${booking.id} - no email for user`, 'LEAD_NURTURING')
          continue
        }

        // Check for more recent bookings
        const recentBooking = await prisma.booking.findFirst({
          where: {
            signerId: booking.signerId,
            createdAt: {
              gt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
            }
          }
        })

        if (!recentBooking) {
          const existingEnrollment = await this.findEnrollment(
            userEmail,
            'reengagement-inactive'
          )

          if (!existingEnrollment) {
            await this.enrollInSequence(
              userEmail,
              'reengagement-inactive',
              { lastServiceDate: booking.updatedAt }
            )
          }
        }
      }

    } catch (error) {
      logger.error('Error processing inactive clients', 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Enroll a contact in a nurture sequence
   */
  async enrollInSequence(
    email: string,
    sequenceId: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Create enrollment record (you'd need to add this table to your schema)
      // For now, we'll track in NotificationLog with special type
      
      await prisma.notificationLog.create({
        data: {
          bookingId: metadata.bookingId || 'nurture-sequence',
          notificationType: NotificationType.LEAD_NURTURING,
          method: NotificationMethod.EMAIL,
          recipientEmail: email,
          message: `Enrolled in sequence: ${sequenceId}`,
          status: 'SENT',
          metadata: {
            sequenceId,
            enrolledAt: new Date().toISOString(),
            currentStep: 0,
            status: 'ACTIVE',
            ...metadata
          }
        }
      })

      // Update GHL with nurture tags
      const contact = await getContactByEmail(email)
      if (contact && contact.id) {
        await addTagsToContactByEmail(email, [
          `Nurture:${sequenceId}`,
          'Status:Lead_Nurturing'
        ])
      }

      logger.info(`Enrolled ${email} in sequence: ${sequenceId}`, 'LEAD_NURTURING')

    } catch (error) {
      logger.error('Error enrolling in sequence', 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Process an individual enrollment
   */
  private async processEnrollment(enrollment: any): Promise<{
    messageSent: boolean
    completed: boolean
  }> {
    try {
      const sequence = this.sequences.find(s => s.id === enrollment.sequenceId)
      if (!sequence) {
        throw new Error(`Sequence not found: ${enrollment.sequenceId}`)
      }

      // Check exit conditions
      if (await this.shouldExit(enrollment, sequence)) {
        await this.exitEnrollment(enrollment, 'Exit condition met')
        return { messageSent: false, completed: true }
      }

      // Find next step to process
      const nextStep = sequence.steps.find(step => 
        step.stepNumber === enrollment.currentStep + 1
      )

      if (!nextStep) {
        await this.completeEnrollment(enrollment)
        return { messageSent: false, completed: true }
      }

      // Check if delay period has passed
      const hoursSinceLastMessage = enrollment.lastMessageSent ?
        this.getHoursSince(enrollment.lastMessageSent) : 
        this.getHoursSince(enrollment.enrolledAt)

      if (hoursSinceLastMessage >= nextStep.delayHours) {
        await this.sendNurtureMessage(enrollment, nextStep)
        await this.updateEnrollmentStep(enrollment, nextStep.stepNumber)
        return { messageSent: true, completed: false }
      }

      return { messageSent: false, completed: false }

    } catch (error) {
      logger.error('Error processing enrollment', 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
      return { messageSent: false, completed: false }
    }
  }

  /**
   * Send a nurture message
   */
  private async sendNurtureMessage(enrollment: any, step: NurtureStep): Promise<void> {
    try {
      // Get contact details from GHL
      const contact = await getContactByEmail(enrollment.contactEmail)
      
      // Personalize message
      const personalizedMessage = this.personalizeMessage(
        step.message.content,
        contact,
        enrollment.metadata
      )

      const personalizedSubject = step.message.subject ? 
        this.personalizeMessage(step.message.subject, contact, enrollment.metadata) :
        'Important Information from Houston Mobile Notary Pros'

      // Send via requested channels
      for (const channel of step.channels) {
        if (channel === 'EMAIL') {
          await NotificationService.sendNotification({
            bookingId: enrollment.bookingId || 'nurture',
            type: NotificationType.LEAD_NURTURING,
            recipient: {
              email: enrollment.contactEmail,
              firstName: contact?.firstName || contact?.name?.split(' ')[0]
            },
            content: {
              subject: personalizedSubject,
              message: personalizedMessage,
              metadata: {
                sequenceId: enrollment.sequenceId,
                stepNumber: step.stepNumber,
                cta: step.message.cta,
                ctaLink: step.message.ctaLink
              }
            },
            methods: [NotificationMethod.EMAIL]
          })
        }

        if (channel === 'SMS' && contact?.phone) {
          const smsMessage = this.stripHTMLAndShorten(personalizedMessage, 320)
          
          await NotificationService.sendNotification({
            bookingId: enrollment.bookingId || 'nurture',
            type: NotificationType.LEAD_NURTURING,
            recipient: {
              phone: contact.phone,
              firstName: contact?.firstName || contact?.name?.split(' ')[0]
            },
            content: {
              message: smsMessage,
              metadata: {
                sequenceId: enrollment.sequenceId,
                stepNumber: step.stepNumber
              }
            },
            methods: [NotificationMethod.SMS]
          })
        }
      }

      // Update GHL with step completion
      if (enrollment.contactEmail) {
        await addTagsToContactByEmail(enrollment.contactEmail, [
          `Nurture:${enrollment.sequenceId}:Step${step.stepNumber}`
        ])
      }

    } catch (error) {
      logger.error('Error sending nurture message', 'LEAD_NURTURING', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Helper functions
   */
  private getHoursSince(date: Date | string): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return (Date.now() - dateObj.getTime()) / (1000 * 60 * 60)
  }

  private personalizeMessage(template: string, contact: any, metadata: any): string {
    return template
      .replace(/{firstName}/g, contact?.firstName || contact?.name?.split(' ')[0] || 'there')
      .replace(/{lastName}/g, contact?.lastName || contact?.name?.split(' ')[1] || '')
      .replace(/{serviceType}/g, metadata?.serviceType || 'notary service')
      .replace(/{ctaButton}/g, '[BOOK NOW BUTTON]') // Would be actual button in email template
  }

  private stripHTMLAndShorten(html: string, maxLength: number): string {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
  }

  private async findEnrollment(email: string, sequenceId: string): Promise<any> {
    // This would query your enrollment table
    // For now, check NotificationLog
    return await prisma.notificationLog.findFirst({
      where: {
        recipientEmail: email,
        notificationType: NotificationType.LEAD_NURTURING,
        metadata: {
          path: ['sequenceId'],
          equals: sequenceId
        }
      }
    })
  }

  private async getActiveEnrollments(): Promise<any[]> {
    // This would query your enrollment table
    // For now, simulate with NotificationLog entries
    const enrollments = await prisma.notificationLog.findMany({
      where: {
        notificationType: NotificationType.LEAD_NURTURING,
        message: { startsWith: 'Enrolled in sequence:' }
      }
    })

    return enrollments.map(log => ({
      id: log.id,
      contactEmail: log.recipientEmail,
      sequenceId: (log.metadata as any)?.sequenceId,
      currentStep: (log.metadata as any)?.currentStep || 0,
      enrolledAt: new Date((log.metadata as any)?.enrolledAt || log.createdAt),
      lastMessageSent: (log.metadata as any)?.lastMessageSent ? new Date((log.metadata as any).lastMessageSent) : null,
      status: (log.metadata as any)?.status || 'ACTIVE',
      metadata: log.metadata
    }))
  }

  private async shouldExit(enrollment: any, sequence: NurtureSequence): Promise<boolean> {
    // Check each exit condition
    for (const condition of sequence.exitConditions) {
      if (condition.type === 'BOOKING_COMPLETED') {
        const booking = await prisma.booking.findFirst({
          where: {
            User_Booking_signerIdToUser: {
              email: enrollment.contactEmail
            },
            status: BookingStatus.COMPLETED,
            createdAt: { gte: enrollment.enrolledAt }
          }
        })
        if (booking) return true
      }

      if (condition.type === 'TIME_LIMIT' && condition.value) {
        const hoursEnrolled = this.getHoursSince(enrollment.enrolledAt)
        if (hoursEnrolled >= condition.value) return true
      }

      // Add more exit condition checks as needed
    }

    return false
  }

  private async exitEnrollment(enrollment: any, reason: string): Promise<void> {
    // Update enrollment status
    await prisma.notificationLog.update({
      where: { id: enrollment.id },
      data: {
        metadata: {
          ...enrollment.metadata,
          status: 'EXITED',
          exitReason: reason,
          exitedAt: new Date().toISOString()
        }
      }
    })

    // Update GHL
    if (enrollment.contactEmail) {
      await addTagsToContactByEmail(enrollment.contactEmail, [
        `Nurture:${enrollment.sequenceId}:Exited`
      ])
    }
  }

  private async completeEnrollment(enrollment: any): Promise<void> {
    // Mark as completed
    await prisma.notificationLog.update({
      where: { id: enrollment.id },
      data: {
        metadata: {
          ...enrollment.metadata,
          status: 'COMPLETED',
      // completedAt: new Date(), // Property does not exist on Booking model
        }
      }
    })

    // Update GHL
    if (enrollment.contactEmail) {
      await addTagsToContactByEmail(enrollment.contactEmail, [
        `Nurture:${enrollment.sequenceId}:Completed`
      ])
    }
  }

  private async updateEnrollmentStep(enrollment: any, stepNumber: number): Promise<void> {
    await prisma.notificationLog.update({
      where: { id: enrollment.id },
      data: {
        metadata: {
          ...enrollment.metadata,
          currentStep: stepNumber,
          lastMessageSent: new Date().toISOString()
        }
      }
    })
  }
}

export const leadNurturingService = new LeadNurturingService() 
