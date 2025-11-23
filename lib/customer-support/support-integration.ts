// lib/customer-support/support-integration?.ts

import { prisma } from '@/lib/db';
import { NotificationService } from '@/lib/notifications';
import {
  NotificationType,
  NotificationMethod,
  SupportPriority,
  SupportIssueType,
  SupportStatus,
} from '@/lib/prisma-types';
import type { Prisma, SupportTicket as PrismaSupportTicket } from '@/lib/prisma-types';
import { supportRequestEmail } from '@/lib/email/templates';
import { logger } from '@/lib/logger';

type SupportIssueTypeValue = SupportIssueType;
type SupportPriorityValue = SupportPriority;
type SupportStatusValue = SupportStatus;

export type SupportTicket = PrismaSupportTicket;

export interface SupportRequest {
  bookingId?: string;
  customerEmail: string;
  customerName: string;
  issueType: SupportIssueTypeValue;
  description: string;
  priority?: SupportPriorityValue;
  contactMethod?: 'email' | 'phone' | 'chat';
  preferredContactTime?: string;
  attachments?: string[];
}

export interface SupportResponse {
  ticketId: string;
  message: string;
  isAutomated: boolean;
  responseTime: number; // in minutes
  nextSteps?: string[];
  escalationNeeded: boolean;
}

export class CustomerSupportService {
  private static instance: CustomerSupportService;
  
  private constructor() {}
  
  static getInstance(): CustomerSupportService {
    if (!CustomerSupportService.instance) {
      CustomerSupportService.instance = new CustomerSupportService();
    }
    return CustomerSupportService.instance;
  }

  /**
   * Create a new support ticket
   */
  async createSupportTicket(request: SupportRequest): Promise<SupportTicket> {
    try {
      // Determine priority based on issue type and booking status
      const priority = this.determinePriority(request);
      
      // Check for existing open tickets
      const existingTicket = await this.findExistingTicket(request.customerEmail, request.issueType);
      
      if (existingTicket) {
        // Update existing ticket instead of creating new one
        return this.updateExistingTicket(existingTicket.id, request);
      }

      // Create new ticket
      const ticket = await prisma.supportTicket.create({
        data: {
          bookingId: request.bookingId,
          customerEmail: request.customerEmail,
          customerName: request.customerName,
          issueType: request.issueType,
          priority,
          description: request.description,
          status: SupportStatus.open,
          tags: this.generateTags(request),
          metadata: {
            contactMethod: request.contactMethod,
            preferredContactTime: request.preferredContactTime,
            attachments: request.attachments,
          }
        }
      });

      // Send confirmation to customer
      await this.sendSupportConfirmation(ticket);

      // Auto-assign based on issue type
      await this.autoAssignTicket(ticket.id, request.issueType);

      // Send notification to support team
      await this.notifySupportTeam(ticket);

      logger.info(`Support ticket created: ${ticket.id}`, 'CUSTOMER_SUPPORT');

      return ticket;
    } catch (error) {
      logger.error('Failed to create support ticket', 'CUSTOMER_SUPPORT', { error, request });
      throw error;
    }
  }

  /**
   * Determine ticket priority based on issue type and context
   */
  private determinePriority(request: SupportRequest): SupportPriorityValue {
    const urgentIssues: SupportIssueTypeValue[] = ['payment_issue', 'service_issue', 'complaint']
    const highPriorityIssues: SupportIssueTypeValue[] = ['reschedule_request', 'cancellation_request', 'billing_inquiry']
    
    if (urgentIssues.includes(request.issueType)) {
      return SupportPriority.urgent
    }
    
    if (highPriorityIssues.includes(request.issueType)) {
      return SupportPriority.high
    }
    
    if (request.priority) {
      return request.priority
    }
    
    return SupportPriority.medium
  }

  /**
   * Find existing open ticket for same customer and issue type
   */
  private async findExistingTicket(customerEmail: string, issueType: SupportIssueTypeValue): Promise<SupportTicket | null> {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        customerEmail,
        issueType,
        status: {
          in: [SupportStatus.open, SupportStatus.in_progress, SupportStatus.waiting_customer],
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return ticket
  }

  /**
   * Update existing ticket with new information
   */
  private async updateExistingTicket(ticketId: string, request: SupportRequest): Promise<SupportTicket> {
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        description: `${request.description}\n\n--- Additional Information ---\n${new Date().toISOString()}`,
        updatedAt: new Date(),
        metadata: {
          additionalRequests: true,
          lastUpdate: new Date().toISOString(),
        },
      },
    })

    logger.info(`Updated existing support ticket: ${ticketId}`, 'CUSTOMER_SUPPORT')
    return updatedTicket
  }

  /**
   * Generate tags for the ticket
   */
  private generateTags(request: SupportRequest): string[] {
    const tags: string[] = [request.issueType];
    
    if (request.bookingId) {
      tags.push('has_booking');
    }
    
    if (request.contactMethod) {
      tags.push(`contact_${request.contactMethod}`);
    }
    
    return tags;
  }

  /**
   * Send confirmation email to customer
   */
  private async sendSupportConfirmation(ticket: SupportTicket): Promise<void> {
    try {
      const client = {
        firstName: ticket.customerName?.split(' ')[0] || '',
        lastName: ticket.customerName?.split(' ').slice(1).join(' ') || '',
        email: ticket.customerEmail,
      };

      const supportDetails = {
        issueType: this.formatIssueType(ticket.issueType),
        description: ticket.description,
        priority: ticket.priority,
        bookingId: ticket.bookingId ?? undefined,
      };

      const emailContent = supportRequestEmail(client, supportDetails);

      await NotificationService.sendNotification({
        bookingId: ticket.bookingId || 'support',
        type: NotificationType.BOOKING_CONFIRMATION, // Using existing type for now
        recipient: { email: ticket.customerEmail },
        content: {
          subject: emailContent.subject,
          message: emailContent.html,
        },
        methods: [NotificationMethod.EMAIL],
      });

      logger.info(`Support confirmation sent for ticket: ${ticket.id}`, 'CUSTOMER_SUPPORT');
    } catch (error) {
      logger.error(`Failed to send support confirmation for ticket: ${ticket.id}`, 'CUSTOMER_SUPPORT', { error });
    }
  }

  /**
   * Format issue type for display
   */
  private formatIssueType(issueType: SupportIssueTypeValue): string {
    const formats: Record<SupportIssueTypeValue, string> = {
      booking_question: 'Booking Question',
      payment_issue: 'Payment Issue',
      reschedule_request: 'Reschedule Request',
      cancellation_request: 'Cancellation Request',
      service_issue: 'Service Issue',
      technical_support: 'Technical Support',
      billing_inquiry: 'Billing Inquiry',
      general_inquiry: 'General Inquiry',
      complaint: 'Complaint',
      feedback: 'Feedback'
    } as Record<SupportIssueTypeValue, string>;
    
    return formats[issueType] || issueType;
  }

  /**
   * Auto-assign ticket based on issue type
   */
  private async autoAssignTicket(ticketId: string, issueType: SupportIssueTypeValue): Promise<void> {
    // This would integrate with your team management system
    // For now, we'll just log the assignment logic
    const assignmentMap: Partial<Record<SupportIssueTypeValue, string>> = {
      payment_issue: 'billing_team',
      service_issue: 'operations_team',
      technical_support: 'tech_team',
      complaint: 'management_team'
    };

    const assignedTeam = assignmentMap[issueType] || 'general_support';
    
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedTo: assignedTeam,
        metadata: {
          autoAssigned: true,
          assignedTeam
        }
      }
    });

    logger.info(`Ticket ${ticketId} auto-assigned to ${assignedTeam}`, 'CUSTOMER_SUPPORT');
  }

  /**
   * Notify support team of new ticket
   */
  private async notifySupportTeam(ticket: SupportTicket): Promise<void> {
    // This would integrate with your team notification system
    // For now, we'll just log the notification
    logger.info(`Support team notified of new ticket: ${ticket.id}`, 'CUSTOMER_SUPPORT', {
      ticketId: ticket.id,
      priority: ticket.priority,
      issueType: ticket.issueType,
      customerEmail: ticket.customerEmail
    });
  }

  /**
   * Get automated response for common issues
   */
  async getAutomatedResponse(ticket: SupportTicket): Promise<SupportResponse | null> {
    const automatedResponses: Partial<Record<SupportIssueTypeValue, {
      message: string;
      nextSteps: string[];
      escalationNeeded: boolean;
    }>> = {
      booking_question: {
        message: `Thank you for your booking question! Our team will review your inquiry and respond within 24 hours. In the meantime, you can check our FAQ section for common questions.`,
        nextSteps: ['Review FAQ section', 'Check booking status', 'Wait for team response'],
        escalationNeeded: false
      },
      payment_issue: {
        message: `We understand you're experiencing a payment issue. Our billing team will investigate and contact you within 2 hours. Please ensure your payment method is valid and has sufficient funds.`,
        nextSteps: ['Verify payment method', 'Check account balance', 'Wait for billing team contact'],
        escalationNeeded: true
      },
      reschedule_request: {
        message: `We'll help you reschedule your appointment. Please provide your preferred date and time, and we'll check availability and confirm the change within 1 hour.`,
        nextSteps: ['Provide preferred date/time', 'Check availability', 'Confirm new appointment'],
        escalationNeeded: false
      },
      cancellation_request: {
        message: `We're sorry to hear you need to cancel. Please confirm your cancellation request, and we'll process any applicable refunds within 24 hours.`,
        nextSteps: ['Confirm cancellation', 'Process refund', 'Send confirmation'],
        escalationNeeded: false
      }
    };

    const response = automatedResponses[ticket.issueType];
    if (!response) return null;

    return {
      ticketId: ticket.id,
      message: response.message,
      isAutomated: true,
      responseTime: 5, // 5 minutes
      nextSteps: response.nextSteps,
      escalationNeeded: response.escalationNeeded
    };
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportStatusValue, notes?: string): Promise<SupportTicket> {
    const updateData: Prisma.SupportTicketUpdateInput = {
      status,
      updatedAt: new Date(),
    };

    if (status === SupportStatus.resolved) {
      updateData.resolvedAt = new Date();
    }

    if (notes) {
      updateData.description = `${notes}\n${new Date().toISOString()}`;
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Send status update to customer
    await this.sendStatusUpdate(ticket, status, notes);

    logger.info(`Ticket status updated: ${ticketId} -> ${status}`, 'CUSTOMER_SUPPORT');

    return ticket;
  }

  /**
   * Send status update to customer
   */
  private async sendStatusUpdate(ticket: SupportTicket, status: SupportStatusValue, notes?: string): Promise<void> {
    const statusMessages: Partial<Record<SupportStatusValue, string>> = {
      in_progress: 'We are currently working on your request.',
      waiting_customer: 'We need additional information from you to proceed.',
      resolved: 'Your request has been resolved. Please let us know if you need anything else.',
      closed: 'This ticket has been closed. Thank you for contacting us.'
    };

    const message = statusMessages[status] || 'Your ticket status has been updated.';
    const fullMessage = notes ? `${message}\n\nAdditional notes: ${notes}` : message;

    await NotificationService.sendNotification({
      bookingId: ticket.bookingId || 'support',
      type: NotificationType.BOOKING_CONFIRMATION,
      recipient: { email: ticket.customerEmail },
      content: {
        subject: `Support Ticket Update - ${ticket.id}`,
        message: fullMessage,
      },
      methods: [NotificationMethod.EMAIL],
    });
  }

  /**
   * Get customer support history
   */
  async getCustomerSupportHistory(customerEmail: string): Promise<SupportTicket[]> {
    return prisma.supportTicket.findMany({
      where: { customerEmail },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Get support metrics
   */
  async getSupportMetrics(): Promise<{
    totalTickets: number;
    openTickets: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    ticketsByPriority: Record<SupportPriority, number>;
    ticketsByType: Record<SupportIssueType, number>;
  }> {
    const [
      totalTickets,
      openTickets,
      ticketsByPriority,
      ticketsByType,
      satisfactionData,
    ]: [
      number,
      number,
      Array<{ priority: SupportPriorityValue; _count: { priority: number } }>,
      Array<{ issueType: SupportIssueTypeValue; _count: { issueType: number } }>,
      { _avg: { customerSatisfaction: number | null } }
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: { in: [SupportStatus.open, SupportStatus.in_progress] } } }),
      prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: { priority: true },
      }),
      prisma.supportTicket.groupBy({
        by: ['issueType'],
        _count: { issueType: true },
      }),
      prisma.supportTicket.aggregate({
        _avg: { customerSatisfaction: true },
      }),
    ]);

    return {
      totalTickets,
      openTickets,
      averageResponseTime: 0, // Would calculate from actual response times
      customerSatisfaction: satisfactionData._avg?.customerSatisfaction || 0,
      ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<SupportPriorityValue, number>),
      ticketsByType: ticketsByType.reduce((acc, item) => {
        acc[item.issueType] = item._count.issueType;
        return acc;
      }, {} as Record<SupportIssueTypeValue, number>),
    };
  }
}

// Export convenience functions
export const createSupportTicket = async (request: SupportRequest): Promise<SupportTicket> => {
  const service = CustomerSupportService.getInstance()
  return service.createSupportTicket(request)
}

export const updateTicketStatus = async (ticketId: string, status: SupportStatusValue, notes?: string): Promise<SupportTicket> => {
  const service = CustomerSupportService.getInstance()
  return service.updateTicketStatus(ticketId, status, notes)
}

export const getCustomerSupportHistory = async (customerEmail: string): Promise<SupportTicket[]> => {
  const service = CustomerSupportService.getInstance()
  return service.getCustomerSupportHistory(customerEmail)
}

export const getSupportMetrics = async () => {
  const service = CustomerSupportService.getInstance()
  return service.getSupportMetrics()
}