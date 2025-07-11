/**
 * Conversation History Tracker
 * Houston Mobile Notary Pros - Enhanced Customer Context
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface ConversationEntry {
  id: string;
  customerEmail: string;
  customerName: string;
  interactionType: 'contact_form' | 'booking_request' | 'phone_call' | 'email' | 'chat' | 'support_ticket' | 'appointment' | 'follow_up';
  source: 'website' | 'phone' | 'email' | 'chat' | 'admin' | 'system';
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  tags?: string[];
}

export interface ConversationHistory {
  customerEmail: string;
  customerName: string;
  interactions: ConversationEntry[];
  summary: {
    totalInteractions: number;
    firstContact: Date;
    lastContact: Date;
    preferredContactMethod: string;
    commonTopics: string[];
    serviceInterests: string[];
    specialNeeds: string[];
    bookingHistory: string[];
  };
}

export class ConversationTracker {
  
  /**
   * Track a new conversation/interaction
   */
  static async trackInteraction(data: {
    customerEmail: string;
    customerName: string;
    interactionType: ConversationEntry['interactionType'];
    source: ConversationEntry['source'];
    subject?: string;
    message: string;
    metadata?: Record<string, any>;
    tags?: string[];
  }): Promise<ConversationEntry> {
    try {
      // Create or update customer support history
      const historyEntry = await prisma.customerSupportHistory.create({
        data: {
          customerEmail: data.customerEmail,
          ticketId: `interaction-${Date.now()}`, // Temporary ID for non-ticket interactions
          interactionType: data.interactionType,
          description: data.message,
          metadata: {
            source: data.source,
            subject: data.subject,
            tags: data.tags,
            ...data.metadata
          }
        }
      });

      logger.info('Conversation tracked', 'CONVERSATION_TRACKER', {
        customerEmail: data.customerEmail,
        interactionType: data.interactionType,
        source: data.source
      });

      return {
        id: historyEntry.id,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        interactionType: data.interactionType,
        source: data.source,
        subject: data.subject,
        message: data.message,
        metadata: data.metadata,
        createdAt: historyEntry.createdAt,
        tags: data.tags
      };
    } catch (error) {
      logger.error('Failed to track conversation', 'CONVERSATION_TRACKER', error as Error);
      throw error;
    }
  }

  /**
   * Get conversation history for a customer
   */
  static async getConversationHistory(customerEmail: string): Promise<ConversationHistory | null> {
    try {
      // Get all customer interactions
      const interactions = await prisma.customerSupportHistory.findMany({
        where: { customerEmail },
        orderBy: { createdAt: 'asc' }
      });

      if (interactions.length === 0) {
        return null;
      }

      // Get customer name from most recent interaction
      const customerName = interactions[interactions.length - 1].metadata?.customerName as string || 'Customer';

      // Get booking history
      const bookings = await prisma.booking.findMany({
        where: { customerEmail },
        include: { service: true },
        orderBy: { createdAt: 'desc' }
      });

      const conversationEntries: ConversationEntry[] = interactions.map(interaction => ({
        id: interaction.id,
        customerEmail: interaction.customerEmail,
        customerName,
        interactionType: interaction.interactionType as ConversationEntry['interactionType'],
        source: (interaction.metadata as any)?.source || 'website',
        subject: (interaction.metadata as any)?.subject,
        message: interaction.description,
        metadata: interaction.metadata as Record<string, any>,
        createdAt: interaction.createdAt,
        tags: (interaction.metadata as any)?.tags
      }));

      // Analyze conversation patterns
      const summary = await this.analyzeConversationPatterns(conversationEntries, bookings);

      return {
        customerEmail,
        customerName,
        interactions: conversationEntries,
        summary
      };
    } catch (error) {
      logger.error('Failed to get conversation history', 'CONVERSATION_TRACKER', error as Error);
      return null;
    }
  }

  /**
   * Get conversation context for booking emails/calendar
   */
  static async getBookingContext(customerEmail: string, bookingId?: string): Promise<{
    initialInquiry?: string;
    serviceRequests?: string[];
    specialNeeds?: string[];
    previousInteractions?: Array<{
      date: string;
      type: string;
      summary: string;
    }>;
  }> {
    try {
      const history = await this.getConversationHistory(customerEmail);
      
      if (!history) {
        return {};
      }

      // Find initial inquiry
      const initialInquiry = history.interactions.find(i => 
        i.interactionType === 'contact_form' || i.interactionType === 'booking_request'
      )?.message;

      // Extract service requests
      const serviceRequests = history.interactions
        .filter(i => i.message.toLowerCase().includes('service') || i.message.toLowerCase().includes('notary'))
        .map(i => i.message.substring(0, 100) + (i.message.length > 100 ? '...' : ''))
        .slice(0, 3);

      // Extract special needs/accommodations
      const specialNeeds = history.interactions
        .filter(i => 
          i.message.toLowerCase().includes('special') ||
          i.message.toLowerCase().includes('accommodate') ||
          i.message.toLowerCase().includes('need') ||
          i.message.toLowerCase().includes('disability') ||
          i.message.toLowerCase().includes('access')
        )
        .map(i => i.message.substring(0, 100) + (i.message.length > 100 ? '...' : ''))
        .slice(0, 3);

      // Get recent interactions (last 5, excluding current booking)
      const previousInteractions = history.interactions
        .filter(i => !bookingId || !i.metadata?.bookingId || i.metadata.bookingId !== bookingId)
        .slice(-5)
        .map(i => ({
          date: i.createdAt.toLocaleDateString(),
          type: i.interactionType.replace('_', ' ').toUpperCase(),
          summary: i.message.substring(0, 80) + (i.message.length > 80 ? '...' : '')
        }));

      return {
        initialInquiry,
        serviceRequests: serviceRequests.length > 0 ? serviceRequests : undefined,
        specialNeeds: specialNeeds.length > 0 ? specialNeeds : undefined,
        previousInteractions: previousInteractions.length > 0 ? previousInteractions : undefined
      };
    } catch (error) {
      logger.error('Failed to get booking context', 'CONVERSATION_TRACKER', error as Error);
      return {};
    }
  }

  /**
   * Track contact form submission
   */
  static async trackContactForm(data: {
    customerEmail: string;
    customerName: string;
    subject: string;
    message: string;
    phone?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.trackInteraction({
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      interactionType: 'contact_form',
      source: 'website',
      subject: data.subject,
      message: data.message,
      metadata: {
        phone: data.phone,
        ...data.metadata
      },
      tags: ['contact_form', 'website_inquiry']
    });
  }

  /**
   * Track booking request
   */
  static async trackBookingRequest(data: {
    customerEmail: string;
    customerName: string;
    serviceType: string;
    bookingId: string;
    message?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.trackInteraction({
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      interactionType: 'booking_request',
      source: 'website',
      subject: `Booking Request - ${data.serviceType}`,
      message: data.message || `Requested ${data.serviceType} service`,
      metadata: {
        serviceType: data.serviceType,
        bookingId: data.bookingId,
        ...data.metadata
      },
      tags: ['booking_request', data.serviceType.toLowerCase()]
    });
  }

  /**
   * Track phone call
   */
  static async trackPhoneCall(data: {
    customerEmail: string;
    customerName: string;
    callType: 'inbound' | 'outbound';
    duration?: number;
    notes: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.trackInteraction({
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      interactionType: 'phone_call',
      source: 'phone',
      subject: `${data.callType === 'inbound' ? 'Inbound' : 'Outbound'} Phone Call`,
      message: data.notes,
      metadata: {
        callType: data.callType,
        duration: data.duration,
        ...data.metadata
      },
      tags: ['phone_call', data.callType]
    });
  }

  /**
   * Track appointment completion
   */
  static async trackAppointmentCompletion(data: {
    customerEmail: string;
    customerName: string;
    bookingId: string;
    serviceType: string;
    notes?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.trackInteraction({
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      interactionType: 'appointment',
      source: 'system',
      subject: `Appointment Completed - ${data.serviceType}`,
      message: data.notes || 'Appointment completed successfully',
      metadata: {
        bookingId: data.bookingId,
        serviceType: data.serviceType,
        status: 'completed',
        ...data.metadata
      },
      tags: ['appointment', 'completed', data.serviceType.toLowerCase()]
    });
  }

  /**
   * Analyze conversation patterns
   */
  private static async analyzeConversationPatterns(
    interactions: ConversationEntry[],
    bookings: any[]
  ): Promise<ConversationHistory['summary']> {
    const sourceCount = interactions.reduce((acc, i) => {
      acc[i.source] = (acc[i.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredContactMethod = Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'website';

    // Extract common topics from messages
    const allMessages = interactions.map(i => i.message.toLowerCase()).join(' ');
    const commonTopics = this.extractTopics(allMessages);

    // Extract service interests
    const serviceInterests = [...new Set(bookings.map(b => b.service?.name).filter(Boolean))];

    // Extract special needs
    const specialNeeds = interactions
      .filter(i => 
        i.message.toLowerCase().includes('special') ||
        i.message.toLowerCase().includes('accommodation') ||
        i.message.toLowerCase().includes('disability')
      )
      .map(i => i.message.substring(0, 50) + '...')
      .slice(0, 3);

    // Extract booking history
    const bookingHistory = bookings.map(b => 
      `${b.service?.name} (${b.createdAt.toLocaleDateString()})`
    ).slice(0, 5);

    return {
      totalInteractions: interactions.length,
      firstContact: interactions[0]?.createdAt || new Date(),
      lastContact: interactions[interactions.length - 1]?.createdAt || new Date(),
      preferredContactMethod,
      commonTopics,
      serviceInterests,
      specialNeeds,
      bookingHistory
    };
  }

  /**
   * Extract common topics from text
   */
  private static extractTopics(text: string): string[] {
    const keywords = [
      'notary', 'document', 'sign', 'power of attorney', 'loan', 'mortgage',
      'real estate', 'witness', 'acknowledgment', 'jurat', 'affidavit',
      'apostille', 'certified', 'copy', 'remote', 'online', 'mobile',
      'travel', 'urgent', 'same day', 'weekend', 'evening'
    ];

    return keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).slice(0, 5);
  }
} 