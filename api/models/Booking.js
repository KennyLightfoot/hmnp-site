/**
 * Booking Model - Prisma/PostgreSQL Implementation
 * Houston Mobile Notary Pros
 */

import { getPrismaClient } from '../config/database.js';
import moment from 'moment-timezone';

class BookingModel {
  constructor() {
    this.defaultTimezone = 'America/Chicago';
  }

  /**
   * Get Prisma client
   */
  getPrisma() {
    return getPrismaClient();
  }

  /**
   * Generate unique booking ID
   */
  generateBookingId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `HMNP-${timestamp}-${random}`;
  }

  /**
   * Calculate urgency level based on payment age and amount
   */
  calculateUrgencyLevel(hoursOld, paymentAmount) {
    const amount = parseFloat(paymentAmount);
    
    if (hoursOld >= 48) return 'critical';
    if (hoursOld >= 24) return 'high';
    if (hoursOld >= 2) return 'medium';
    return 'new';
  }

  /**
   * Calculate hours since booking was created
   */
  calculateHoursOld(createdAt) {
    return moment().diff(moment(createdAt), 'hours');
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    const prisma = this.getPrisma();
    
    try {
      const bookingId = this.generateBookingId();
      const now = new Date();
      const paymentExpiresAt = new Date(now.getTime() + (parseFloat(process.env.PAYMENT_EXPIRATION_HOURS || 72) * 60 * 60 * 1000));

      const booking = await prisma.apiBooking.create({
        data: {
          bookingId,
          ghlContactId: bookingData.contactId,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          serviceName: bookingData.serviceName || 'Standard Mobile Notary',
          serviceDescription: bookingData.serviceDescription,
          servicePrice: parseFloat(bookingData.servicePrice || 85),
          paymentAmount: parseFloat(bookingData.paymentAmount || bookingData.servicePrice || 85),
          scheduledDateTime: new Date(bookingData.scheduledDateTime),
          duration: bookingData.duration || 30,
          timezone: bookingData.timezone || this.defaultTimezone,
          locationType: bookingData.locationType || 'CLIENT_SPECIFIED_ADDRESS',
          addressStreet: bookingData.addressStreet,
          addressCity: bookingData.addressCity || 'Houston',
          addressState: bookingData.addressState || 'TX',
          addressZip: bookingData.addressZip,
          addressFormatted: bookingData.addressFormatted,
          locationNotes: bookingData.locationNotes,
          paymentUrl: bookingData.paymentUrl,
          paymentIntentId: bookingData.paymentIntentId,
          paymentExpiresAt,
          leadSource: bookingData.leadSource || 'Unknown',
          campaignName: bookingData.campaignName,
          referralCode: bookingData.referralCode,
          ghlWorkflowId: bookingData.workflowId,
          triggerSource: bookingData.triggerSource,
          notes: bookingData.notes,
          internalNotes: bookingData.internalNotes,
          createdBy: bookingData.createdBy || 'system'
        }
      });

      // Create initial workflow trigger record
      if (bookingData.workflowId) {
        await prisma.apiWorkflowTrigger.create({
          data: {
            bookingId: booking.bookingId,
            workflowName: 'booking_created',
            status: 'completed',
            completedAt: now
          }
        });
      }

      return {
        success: true,
        bookingId: booking.bookingId,
        booking: this.formatBookingResponse(booking)
      };

    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Get pending payments with urgency calculation
   */
  async getPendingPayments(options = {}) {
    const prisma = this.getPrisma();
    
    try {
      const {
        limit = 50,
        contactId = null,
        includeExpired = false,
        urgencyLevel = null,
        hoursOld = null
      } = options;

      const where = {
        paymentStatus: 'pending'
      };

      if (contactId) {
        where.ghlContactId = contactId;
      }

      if (!includeExpired) {
        where.paymentExpiresAt = {
          gt: new Date()
        };
      }

      if (urgencyLevel) {
        where.urgencyLevel = urgencyLevel;
      }

      const bookings = await prisma.apiBooking.findMany({
        where,
        take: limit,
        orderBy: [
          { urgencyLevel: 'desc' },
          { createdAt: 'asc' }
        ],
        include: {
          paymentActions: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      });

      // Calculate current urgency and hours old
      const enrichedBookings = bookings.map(booking => {
        const hoursOld = this.calculateHoursOld(booking.createdAt);
        const computedUrgencyLevel = this.calculateUrgencyLevel(hoursOld, booking.paymentAmount);

        return {
          ...booking,
          originalUrgencyLevel: booking.urgencyLevel, // keep track of stored value
          hoursOld,
          urgencyLevel: computedUrgencyLevel,
          paymentInfo: {
            urgencyLevel: computedUrgencyLevel,
            hoursOld,
            remindersSent: booking.remindersSent,
            lastReminderAt: booking.lastReminderAt,
            expiresAt: booking.paymentExpiresAt,
            timeRemaining: moment(booking.paymentExpiresAt).diff(moment(), 'hours')
          }
        };
      });

      // Update urgency levels in database
      for (const booking of enrichedBookings) {
        if (booking.originalUrgencyLevel !== booking.urgencyLevel) {
          await prisma.apiBooking.update({
            where: { id: booking.id },
            data: { 
              urgencyLevel: booking.urgencyLevel,
              hoursOld: booking.hoursOld
            }
          });
        }
      }

      // Calculate summary statistics
      const summary = {
        totalPending: enrichedBookings.length,
        totalValue: enrichedBookings.reduce((sum, b) => sum + parseFloat(b.paymentAmount), 0),
        urgencyBreakdown: {
          new: enrichedBookings.filter(b => b.urgencyLevel === 'new').length,
          medium: enrichedBookings.filter(b => b.urgencyLevel === 'medium').length,
          high: enrichedBookings.filter(b => b.urgencyLevel === 'high').length,
          critical: enrichedBookings.filter(b => b.urgencyLevel === 'critical').length
        },
        criticalUrgency: enrichedBookings.filter(b => b.urgencyLevel === 'critical').length,
        oldestBookingHours: enrichedBookings.length > 0 ? Math.max(...enrichedBookings.map(b => b.hoursOld)) : 0
      };

      return {
        success: true,
        bookings: enrichedBookings.map(this.formatBookingResponse),
        summary
      };

    } catch (error) {
      console.error('Error getting pending payments:', error);
      throw error;
    }
  }

  /**
   * Update payment action
   */
  async updatePaymentAction(bookingId, actionData) {
    const prisma = this.getPrisma();
    
    try {
      const booking = await prisma.apiBooking.findUnique({
        where: { bookingId }
      });

      if (!booking) {
        throw new Error(`Booking ${bookingId} not found`);
      }

      // Create payment action record
      await prisma.apiPaymentAction.create({
        data: {
          bookingId,
          actionType: actionData.action,
          reminderType: actionData.reminderType,
          notes: actionData.notes
        }
      });

      // Update booking based on action
      const updateData = {};
      
      switch (actionData.action) {
        case 'send_reminder':
          updateData.remindersSent = { increment: 1 };
          updateData.lastReminderAt = new Date();
          break;
          
        case 'mark_contacted':
          // Update last reminder time but don't increment count
          updateData.lastReminderAt = new Date();
          break;
          
        case 'mark_expired':
          updateData.paymentStatus = 'expired';
          break;
          
        case 'payment_completed':
          updateData.paymentStatus = 'completed';
          updateData.paidAt = new Date();
          break;
      }

      const updatedBooking = await prisma.apiBooking.update({
        where: { bookingId },
        data: updateData
      });

      return {
        success: true,
        message: `Payment action '${actionData.action}' recorded for booking ${bookingId}`,
        booking: this.formatBookingResponse(updatedBooking)
      };

    } catch (error) {
      console.error('Error updating payment action:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    const prisma = this.getPrisma();
    
    try {
      const booking = await prisma.apiBooking.findUnique({
        where: { bookingId },
        include: {
          paymentActions: {
            orderBy: { timestamp: 'desc' }
          },
          workflowTriggers: {
            orderBy: { triggeredAt: 'desc' }
          },
          documents: true
        }
      });

      if (!booking) {
        return { success: false, message: 'Booking not found' };
      }

      const hoursOld = this.calculateHoursOld(booking.createdAt);
      const urgencyLevel = this.calculateUrgencyLevel(hoursOld, booking.paymentAmount);

      return {
        success: true,
        booking: {
          ...this.formatBookingResponse(booking),
          hoursOld,
          urgencyLevel: urgencyLevel,
          paymentInfo: {
            urgencyLevel,
            hoursOld,
            remindersSent: booking.remindersSent,
            lastReminderAt: booking.lastReminderAt,
            expiresAt: booking.paymentExpiresAt,
            timeRemaining: moment(booking.paymentExpiresAt).diff(moment(), 'hours')
          }
        }
      };

    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  /**
   * Get business intelligence metrics
   */
  async getBusinessIntelligence(days = 7) {
    const prisma = this.getPrisma();
    
    try {
      const startDate = moment().subtract(days, 'days').startOf('day').toDate();
      const endDate = moment().endOf('day').toDate();

      const bookings = await prisma.apiBooking.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const metrics = {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.paymentAmount), 0),
        averageBookingValue: bookings.length > 0 ? 
          bookings.reduce((sum, b) => sum + parseFloat(b.paymentAmount), 0) / bookings.length : 0,
        
        paymentStatus: {
          pending: bookings.filter(b => b.paymentStatus === 'pending').length,
          completed: bookings.filter(b => b.paymentStatus === 'completed').length,
          failed: bookings.filter(b => b.paymentStatus === 'failed').length,
          expired: bookings.filter(b => b.paymentStatus === 'expired').length
        },
        
        leadSources: {
          website: bookings.filter(b => b.leadSource.includes('Website')).length,
          phone: bookings.filter(b => b.leadSource.includes('Phone')).length,
          form: bookings.filter(b => b.leadSource.includes('Form')).length,
          referral: bookings.filter(b => b.leadSource.includes('Referral')).length,
          ads: bookings.filter(b => b.leadSource.includes('Ad')).length
        },
        
        conversionRate: bookings.length > 0 ? 
          (bookings.filter(b => b.paymentStatus === 'completed').length / bookings.length * 100) : 0,
          
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days
        }
      };

      return {
        success: true,
        metrics,
        recommendations: this.generateRecommendations(metrics)
      };

    } catch (error) {
      console.error('Error getting business intelligence:', error);
      throw error;
    }
  }

  /**
   * Generate business recommendations based on metrics
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.conversionRate < 60) {
      recommendations.push('Low conversion rate detected. Consider improving payment follow-up workflows.');
    }
    
    if (metrics.paymentStatus.pending > metrics.paymentStatus.completed) {
      recommendations.push('High pending payments detected. Trigger aggressive recovery workflows.');
    }
    
    if (metrics.leadSources.phone > metrics.leadSources.website) {
      recommendations.push('Phone leads are strong. Consider increasing phone-to-booking automation.');
    }
    
    return recommendations;
  }

  /**
   * Format booking response for API
   */
  formatBookingResponse(booking) {
    return {
      bookingId: booking.bookingId,
      ghlContactId: booking.ghlContactId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      serviceName: booking.serviceName,
      servicePrice: parseFloat(booking.servicePrice),
      paymentAmount: parseFloat(booking.paymentAmount),
      paymentStatus: booking.paymentStatus,
      paymentUrl: booking.paymentUrl,
      scheduledDateTime: booking.scheduledDateTime,
      appointmentStatus: booking.appointmentStatus,
      location: {
        type: booking.locationType,
        street: booking.addressStreet,
        city: booking.addressCity,
        state: booking.addressState,
        zip: booking.addressZip,
        formatted: booking.addressFormatted,
        notes: booking.locationNotes
      },
      leadSource: booking.leadSource,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      paymentActions: booking.paymentActions || [],
      workflowTriggers: booking.workflowTriggers || [],
      documents: booking.documents || []
    };
  }
}

export default new BookingModel(); 