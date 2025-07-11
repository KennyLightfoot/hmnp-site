/**
 * Enhanced Booking Service
 * Houston Mobile Notary Pros - Comprehensive Meeting Information Integration
 */

import { ConversationTracker } from './conversation-tracker';
import { bookingConfirmationEmail } from './email/templates/booking-confirmation';
import { getGoogleCalendar } from './google-calendar';
import { NotificationService } from './notifications';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export class EnhancedBookingService {
  
  /**
   * Process a new booking with comprehensive context
   */
  static async processBooking(bookingData: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    serviceType: string;
    serviceName: string;
    scheduledDateTime: Date;
    addressStreet?: string;
    addressCity?: string;
    addressState?: string;
    addressZip?: string;
    locationNotes?: string;
    specialInstructions?: string;
    numberOfSigners: number;
    numberOfDocuments: number;
    totalAmount: number;
    paymentStatus: string;
    bookingManagementLink: string;
    metadata?: Record<string, any>;
  }): Promise<{
    emailSent: boolean;
    calendarEventCreated: boolean;
    conversationTracked: boolean;
    errors: string[];
  }> {
    
    const errors: string[] = [];
    let emailSent = false;
    let calendarEventCreated = false;
    let conversationTracked = false;

    try {
      // 1. Track the booking request conversation
      await ConversationTracker.trackBookingRequest({
        customerEmail: bookingData.customerEmail,
        customerName: bookingData.customerName,
        serviceType: bookingData.serviceType,
        bookingId: bookingData.bookingId,
        message: `Booking created for ${bookingData.serviceName} on ${bookingData.scheduledDateTime.toLocaleDateString()}`,
        metadata: {
          scheduledDateTime: bookingData.scheduledDateTime.toISOString(),
          totalAmount: bookingData.totalAmount,
          numberOfSigners: bookingData.numberOfSigners,
          numberOfDocuments: bookingData.numberOfDocuments,
          ...bookingData.metadata
        }
      });
      conversationTracked = true;

      // 2. Get conversation history for context
      const conversationHistory = await ConversationTracker.getBookingContext(
        bookingData.customerEmail,
        bookingData.bookingId
      );

      // 3. Get notary information (if available)
      const notaryInfo = await this.getNotaryInfo(bookingData.bookingId);

      // 4. Send enhanced confirmation email
      try {
        const client = {
          firstName: bookingData.customerName.split(' ')[0],
          lastName: bookingData.customerName.split(' ').slice(1).join(' '),
          email: bookingData.customerEmail
        };

        const booking = {
          bookingId: bookingData.bookingId,
          serviceName: bookingData.serviceName,
          serviceType: bookingData.serviceType,
          date: bookingData.scheduledDateTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: bookingData.scheduledDateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          address: bookingData.addressStreet ? 
            `${bookingData.addressStreet}, ${bookingData.addressCity}, ${bookingData.addressState} ${bookingData.addressZip}` : 
            undefined,
          numberOfSigners: bookingData.numberOfSigners,
          numberOfDocuments: bookingData.numberOfDocuments,
          status: 'CONFIRMED',
          paymentStatus: bookingData.paymentStatus,
          totalAmount: bookingData.totalAmount,
          bookingManagementLink: bookingData.bookingManagementLink,
          specialInstructions: bookingData.specialInstructions,
          locationNotes: bookingData.locationNotes,
          witnessRequired: bookingData.serviceType === 'LOAN_SIGNING' // Example logic
        };

        const emailTemplate = bookingConfirmationEmail(client, booking, conversationHistory, notaryInfo);
        
        await NotificationService.sendNotification({
          bookingId: bookingData.bookingId,
          type: 'BOOKING_CONFIRMATION' as any,
          recipient: { email: bookingData.customerEmail },
          content: {
            subject: emailTemplate.subject,
            message: emailTemplate.html
          },
          methods: ['EMAIL' as any]
        });

        emailSent = true;
        logger.info('Enhanced booking confirmation email sent', 'ENHANCED_BOOKING', {
          bookingId: bookingData.bookingId,
          customerEmail: bookingData.customerEmail
        });
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        errors.push(`Email sending failed: ${errorMessage}`);
        logger.error('Enhanced booking email failed', 'ENHANCED_BOOKING', emailError as Error);
      }

      // 5. Create enhanced Google Calendar event
      try {
        const googleCalendar = getGoogleCalendar();
        
        const bookingForCalendar = {
          id: bookingData.bookingId,
          Service: {
            name: bookingData.serviceName,
            serviceType: bookingData.serviceType,
            durationMinutes: this.getServiceDuration(bookingData.serviceType)
          },
          customerEmail: bookingData.customerEmail,
          customerName: bookingData.customerName,
          scheduledDateTime: bookingData.scheduledDateTime,
          addressStreet: bookingData.addressStreet,
          addressCity: bookingData.addressCity,
          addressState: bookingData.addressState,
          addressZip: bookingData.addressZip,
          locationNotes: bookingData.locationNotes,
          specialInstructions: bookingData.specialInstructions,
          numberOfSigners: bookingData.numberOfSigners,
          numberOfDocuments: bookingData.numberOfDocuments,
          priceAtBooking: bookingData.totalAmount,
          status: 'CONFIRMED',
          notes: bookingData.specialInstructions
        };

        const calendarEvent = await googleCalendar.createBookingEvent(
          bookingForCalendar, 
          conversationHistory, 
          notaryInfo
        );

        // Store calendar event ID for future updates
        await prisma.booking.update({
          where: { id: bookingData.bookingId },
          data: {
            notes: `${bookingData.specialInstructions || ''}\nGoogle Calendar Event ID: ${calendarEvent.id}`
          }
        });

        calendarEventCreated = true;
        logger.info('Enhanced Google Calendar event created', 'ENHANCED_BOOKING', {
          bookingId: bookingData.bookingId,
          eventId: calendarEvent.id
        });
      } catch (calendarError) {
        const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unknown error';
        errors.push(`Calendar event creation failed: ${errorMessage}`);
        logger.error('Enhanced calendar event failed', 'ENHANCED_BOOKING', calendarError as Error);
      }

      return {
        emailSent,
        calendarEventCreated,
        conversationTracked,
        errors
      };
    } catch (error) {
      logger.error('Enhanced booking processing failed', 'ENHANCED_BOOKING', error as Error);
      return {
        emailSent,
        calendarEventCreated,
        conversationTracked,
        errors: [...errors, `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Update booking with new information
   */
  static async updateBooking(bookingData: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    changes: Record<string, any>;
    updateReason: string;
  }): Promise<{
    emailSent: boolean;
    calendarEventUpdated: boolean;
    conversationTracked: boolean;
    errors: string[];
  }> {
    
    const errors: string[] = [];
    let emailSent = false;
    let calendarEventUpdated = false;
    let conversationTracked = false;

    try {
      // 1. Track the update conversation
      await ConversationTracker.trackInteraction({
        customerEmail: bookingData.customerEmail,
        customerName: bookingData.customerName,
        interactionType: 'booking_request',
        source: 'system',
        subject: `Booking Updated - ${bookingData.bookingId}`,
        message: `Booking updated: ${bookingData.updateReason}`,
        metadata: {
          bookingId: bookingData.bookingId,
          changes: bookingData.changes,
          updateReason: bookingData.updateReason
        },
        tags: ['booking_update', 'system']
      });
      conversationTracked = true;

      // 2. Get updated booking data
      const booking = await prisma.booking.findUnique({
        where: { id: bookingData.bookingId },
        include: { service: true }
      });

      if (!booking) {
        errors.push('Booking not found');
        return { emailSent, calendarEventUpdated, conversationTracked, errors };
      }

      // 3. Update Google Calendar event if it exists
      try {
        const googleCalendar = getGoogleCalendar();
        
        // Extract calendar event ID from booking notes
        const calendarEventId = this.extractCalendarEventId(booking.notes);
        
        if (calendarEventId) {
          const conversationHistory = await ConversationTracker.getBookingContext(
            bookingData.customerEmail,
            bookingData.bookingId
          );
          const notaryInfo = await this.getNotaryInfo(bookingData.bookingId);

          await googleCalendar.updateBookingEvent(
            calendarEventId,
            booking,
            conversationHistory,
            notaryInfo
          );
          
          calendarEventUpdated = true;
          logger.info('Google Calendar event updated', 'ENHANCED_BOOKING', {
            bookingId: bookingData.bookingId,
            eventId: calendarEventId
          });
        }
              } catch (calendarError) {
          const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unknown error';
          errors.push(`Calendar update failed: ${errorMessage}`);
          logger.error('Calendar update failed', 'ENHANCED_BOOKING', calendarError as Error);
        }

        // 4. Send update notification email if significant changes
        if (this.isSignificantChange(bookingData.changes)) {
          try {
            await NotificationService.sendNotification({
              bookingId: bookingData.bookingId,
              type: 'BOOKING_RESCHEDULED' as any,
              recipient: { email: bookingData.customerEmail },
              content: {
                subject: `Booking Updated - ${booking.service?.name}`,
                message: `Your booking has been updated: ${bookingData.updateReason}`
              },
              methods: ['EMAIL' as any]
            });
            
            emailSent = true;
            logger.info('Booking update email sent', 'ENHANCED_BOOKING', {
              bookingId: bookingData.bookingId,
              customerEmail: bookingData.customerEmail
            });
          } catch (emailError) {
            const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
            errors.push(`Update email failed: ${errorMessage}`);
            logger.error('Update email failed', 'ENHANCED_BOOKING', emailError as Error);
          }
        }

        return {
          emailSent,
          calendarEventUpdated,
          conversationTracked,
          errors
        };
      } catch (error) {
        logger.error('Enhanced booking update failed', 'ENHANCED_BOOKING', error as Error);
        return {
          emailSent,
          calendarEventUpdated,
          conversationTracked,
          errors: [...errors, `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        };
      }
  }

  /**
   * Complete booking with post-service follow-up
   */
  static async completeBooking(bookingData: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    serviceType: string;
    completionNotes?: string;
    documentsCompleted: string[];
    nextSteps?: string[];
  }): Promise<void> {
    try {
      // 1. Track completion
      await ConversationTracker.trackAppointmentCompletion({
        customerEmail: bookingData.customerEmail,
        customerName: bookingData.customerName,
        bookingId: bookingData.bookingId,
        serviceType: bookingData.serviceType,
        notes: bookingData.completionNotes,
        metadata: {
          documentsCompleted: bookingData.documentsCompleted,
          nextSteps: bookingData.nextSteps
        }
      });

      // 2. Send completion email with next steps
      await NotificationService.sendNotification({
        bookingId: bookingData.bookingId,
        type: 'POST_SERVICE_FOLLOWUP' as any,
        recipient: { email: bookingData.customerEmail },
        content: {
          subject: 'Service Completed - Next Steps',
          message: `Your ${bookingData.serviceType} service has been completed. ${bookingData.nextSteps?.join(', ') || ''}`
        },
        methods: ['EMAIL' as any]
      });

      logger.info('Booking completed with follow-up', 'ENHANCED_BOOKING', {
        bookingId: bookingData.bookingId,
        customerEmail: bookingData.customerEmail
      });
    } catch (error) {
      logger.error('Booking completion failed', 'ENHANCED_BOOKING', error as Error);
    }
  }

  /**
   * Get notary information for booking
   */
  private static async getNotaryInfo(bookingId: string): Promise<any> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          User_Booking_notaryIdToUser: {
            include: {
              notary_profiles: true
            }
          }
        }
      });

      if (booking?.User_Booking_notaryIdToUser) {
        const notary = booking.User_Booking_notaryIdToUser;
        return {
          name: notary.name,
          email: notary.email,
          phone: typeof notary.customer_preferences?.phone === 'string' ? notary.customer_preferences.phone : null,
          commissionNumber: notary.notary_profiles?.commission_number,
          estimatedArrival: null // Would be calculated based on travel time
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to get notary info', 'ENHANCED_BOOKING', error as Error);
      return null;
    }
  }

  /**
   * Get service duration based on type
   */
  private static getServiceDuration(serviceType: string): number {
    const durations = {
      'QUICK_STAMP_LOCAL': 15,
      'STANDARD_NOTARY': 30,
      'EXTENDED_HOURS': 45,
      'LOAN_SIGNING': 90,
      'RON_SERVICES': 30,
      'BUSINESS_ESSENTIALS': 60,
      'BUSINESS_GROWTH': 90
    };

    return durations[serviceType as keyof typeof durations] || 30;
  }

  /**
   * Extract calendar event ID from booking notes
   */
  private static extractCalendarEventId(notes: string | null): string | null {
    if (!notes) return null;
    
    const match = notes.match(/Google Calendar Event ID: ([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Check if changes are significant enough to warrant notification
   */
  private static isSignificantChange(changes: Record<string, any>): boolean {
    const significantFields = [
      'scheduledDateTime', 'addressStreet', 'addressCity', 'addressState', 'addressZip',
      'serviceId', 'numberOfSigners', 'numberOfDocuments', 'priceAtBooking'
    ];

    return Object.keys(changes).some(field => significantFields.includes(field));
  }
} 