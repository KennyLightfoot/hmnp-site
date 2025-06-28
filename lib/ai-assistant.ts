/**
 * AI Assistant System
 * Provides intelligent customer service and automated decision making
 */

import { logger } from './logger';
import { cache, cacheTTL } from './cache';
import { prisma } from './prisma';

export interface AIResponse {
  response: string;
  confidence: number;
  intent: string;
  escalationRequired: boolean;
}

export interface CustomerInsight {
  customerId: string;
  lifetimeValue: number;
  riskScore: number;
  preferredServices: string[];
  nextBestAction: string;
}

class AIAssistant {
  /**
   * Handle customer inquiries with AI
   */
  async handleCustomerInquiry(
    message: string,
    context: {
      customerId?: string;
      customerHistory?: any[];
    }
  ): Promise<AIResponse> {
    try {
      // Simple intent detection
      const intent = this.detectIntent(message);
      const confidence = this.calculateConfidence(message, intent);
      
      // Generate response based on intent
      const response = await this.generateResponse(intent, message, context);
      
      return {
        response,
        confidence,
        intent,
        escalationRequired: confidence < 0.7
      };
    } catch (error) {
      logger.error('AI customer service error', 'AI', error as Error);
      
      return {
        response: "I apologize, but I'm having technical difficulties. Please let me connect you with a human agent.",
        confidence: 0,
        intent: 'technical_error',
        escalationRequired: true
      };
    }
  }

  /**
   * Generate customer insights
   */
  async generateCustomerInsights(customerId: string): Promise<CustomerInsight> {
    try {
      const cacheKey = `ai:insights:${customerId}`;
      
      const cached = await cache.get<CustomerInsight>(cacheKey);
      if (cached) {
        return cached;
      }

      // Gather customer data
      const bookings = await prisma.Booking.findMany({
        where: { signerId: customerId },
        include: { Service: true },
      });

      // Calculate insights
      const totalSpent = bookings.reduce((sum: number, b: any) => sum + ((b as any).totalAmount || 0), 0);
      const preferredServices = this.getPreferredServices(bookings);
      const riskScore = this.calculateRiskScore(bookings);
      
      const insights: CustomerInsight = {
        customerId,
        lifetimeValue: totalSpent,
        riskScore,
        preferredServices,
        nextBestAction: this.suggestNextAction(bookings, riskScore)
      };

      // Cache for 1 hour
      await cache.set(cacheKey, insights, { 
        ttl: cacheTTL.long,
        tags: ['ai', 'customer-insights']
      });

      return insights;
    } catch (error) {
      logger.error('Customer insights error', 'AI', error as Error);
      throw error;
    }
  }

  /**
   * Optimize booking assignment
   */
  async optimizeBookingAssignment(bookingRequest: {
    serviceType: string;
    location: { lat: number; lng: number };
    urgency: 'low' | 'medium' | 'high';
  }): Promise<{
    recommendedNotary: string;
    pricingRecommendation: number;
    reasoning: string;
  }> {
    try {
      // Simple optimization logic
      const basePrice = 75;
      let adjustment = 0;
      
      // Urgency pricing
      if (bookingRequest.urgency === 'high') adjustment += 25;
      else if (bookingRequest.urgency === 'medium') adjustment += 10;
      
      const finalPrice = basePrice + adjustment;
      
      return {
        recommendedNotary: 'auto-assigned',
        pricingRecommendation: finalPrice,
        reasoning: `Base price $${basePrice} with $${adjustment} urgency adjustment`
      };
    } catch (error) {
      logger.error('Booking optimization error', 'AI', error as Error);
      throw error;
    }
  }

  /**
   * Generate marketing content
   */
  async generateMarketingContent(
    type: 'email' | 'sms',
    context: {
      customerName: string;
      serviceType: string;
      tone: 'professional' | 'friendly';
    }
  ): Promise<{
    content: string;
    subject?: string;
  }> {
    const templates: Record<'email' | 'sms', any> = {
      email: {
        professional: {
          subject: `Your ${context.serviceType} appointment confirmation`,
          content: `Dear ${context.customerName}, thank you for choosing Houston Mobile Notary Pros for your ${context.serviceType} needs. We look forward to serving you.`
        },
        friendly: {
          subject: `Hey ${context.customerName}! Your notary appointment is confirmed`,
          content: `Hi ${context.customerName}! We're excited to help you with your ${context.serviceType}. See you soon!`
        }
      },
      sms: {
        professional: {
          content: `${context.customerName}, your ${context.serviceType} appointment with Houston Mobile Notary Pros is confirmed.`
        },
        friendly: {
          content: `Hi ${context.customerName}! Your ${context.serviceType} appointment is all set. Can't wait to see you!`
        }
      }
    };

    const template = templates[type][context.tone];
    
    return {
      content: template.content,
      subject: template.subject
    };
  }

  /**
   * Private helper methods
   */
  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      return 'booking_request';
    }
    if (lowerMessage.includes('cancel') || lowerMessage.includes('reschedule')) {
      return 'booking_change';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'pricing_inquiry';
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('what')) {
      return 'service_inquiry';
    }
    
    return 'general_inquiry';
  }

  private calculateConfidence(message: string, intent: string): number {
    // Simple confidence calculation
    const keywords: Record<string, string[]> = {
      booking_request: ['book', 'appointment', 'schedule'],
      booking_change: ['cancel', 'reschedule', 'change'],
      pricing_inquiry: ['price', 'cost', 'fee', 'charge'],
      service_inquiry: ['service', 'what', 'do', 'help'],
      general_inquiry: []
    };
    
    const intentKeywords = keywords[intent] || [];
    const lowerMessage = message.toLowerCase();
    
    const matches = intentKeywords.filter(keyword => 
      lowerMessage.includes(keyword)
    ).length;
    
    return Math.min(0.9, 0.5 + (matches * 0.2));
  }

  private async generateResponse(
    intent: string,
    message: string,
    context: any
  ): Promise<string> {
    const responses: Record<string, string> = {
      booking_request: "I'd be happy to help you schedule an appointment! Let me connect you with our booking system or a team member who can assist you with available times and services.",
      
      booking_change: "I understand you need to make changes to your appointment. Let me help you with that. I can connect you with our booking team to reschedule or cancel your appointment.",
      
      pricing_inquiry: "Our pricing varies depending on the service type and location. For the most accurate quote, I'd recommend speaking with our team who can provide specific pricing for your needs.",
      
      service_inquiry: "Houston Mobile Notary Pros offers a wide range of notary services including document notarization, loan signings, real estate transactions, and more. What specific service are you interested in?",
      
      general_inquiry: "Thank you for contacting Houston Mobile Notary Pros! I'm here to help. Could you please provide more details about what you need assistance with?"
    };
    
    return responses[intent] || responses.general_inquiry;
  }

  private getPreferredServices(bookings: any[]): string[] {
    const serviceCounts: Record<string, number> = {};
    
    bookings.forEach(booking => {
      const serviceName = booking.Service?.name || 'Unknown';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    
    return Object.entries(serviceCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([service]) => service);
  }

  private calculateRiskScore(bookings: any[]): number {
    if (bookings.length === 0) return 0.5;
    
    const recentBookings = bookings.filter(
      b => new Date(b.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const cancelRate = cancelledBookings / bookings.length;
    
    // Low risk if recent activity and low cancellation rate
    if (recentBookings.length > 0 && cancelRate < 0.2) return 0.1;
    if (recentBookings.length === 0 && cancelRate > 0.5) return 0.8;
    
    return 0.3; // Medium risk
  }

  private suggestNextAction(bookings: any[], riskScore: number): string {
    if (riskScore > 0.7) {
      return 'retention_campaign';
    }
    
    if (bookings.length === 0) {
      return 'welcome_sequence';
    }
    
    const lastBooking = bookings[bookings.length - 1];
    const daysSinceLastBooking = Math.floor(
      (Date.now() - new Date(lastBooking.createdAt).getTime()) / (24 * 60 * 60 * 1000)
    );
    
    if (daysSinceLastBooking > 60) {
      return 'reengagement_campaign';
    }
    
    return 'upsell_opportunity';
  }
}

export const aiAssistant = new AIAssistant(); 