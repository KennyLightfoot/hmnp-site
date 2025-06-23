/**
 * Advanced AI Integration System
 * Provides intelligent customer service, predictive analytics, and automated decision making
 */

import { logger } from '../logger';
import { cache, cacheTTL } from '../cache';
import { prisma } from '../prisma';
import { monitoring } from '../monitoring';

export interface AIResponse {
  response: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  suggestedActions: string[];
  escalationRequired: boolean;
}

export interface CustomerInsight {
  customerId: string;
  lifetimeValue: number;
  riskScore: number;
  preferredServices: string[];
  communicationPreference: 'email' | 'sms' | 'phone';
  nextBestAction: string;
  churnProbability: number;
}

export interface PredictiveAnalytics {
  bookingDemandForecast: Array<{
    date: string;
    predictedBookings: number;
    confidence: number;
    factors: string[];
  }>;
  revenueProjection: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  capacityRecommendations: Array<{
    timeSlot: string;
    recommendedCapacity: number;
    reasoning: string;
  }>;
}

class IntelligentAssistant {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Intelligent customer service chat
   */
  async handleCustomerInquiry(
    message: string,
    context: {
      customerId?: string;
      customerHistory?: any[];
      currentBookings?: any[];
      sessionData?: Record<string, any>;
    }
  ): Promise<AIResponse> {
    try {
      const cacheKey = `ai:inquiry:${this.hashMessage(message)}:${context.customerId}`;
      
      // Check cache for similar inquiries
      const cached = await cache.get<AIResponse>(cacheKey);
      if (cached && cached.confidence > 0.8) {
        return cached;
      }

      // Prepare context for AI
      const aiContextStr = await this.buildCustomerContext(context);
      
      // Call AI service
      const aiResponse = await this.callAIService({
        system: this.getSystemPrompt('customer_service'),
        user: message,
        context: { summary: aiContextStr }
      });

      const response: AIResponse = {
        response: aiResponse.content,
        confidence: aiResponse.confidence,
        intent: aiResponse.intent,
        entities: aiResponse.entities,
        suggestedActions: aiResponse.suggestedActions,
        escalationRequired: aiResponse.confidence < 0.7 || aiResponse.escalationRequired
      };

      // Cache high-confidence responses
      if (response.confidence > 0.8) {
        await cache.set(cacheKey, response, { 
          ttl: cacheTTL.long,
          tags: ['ai', 'customer-service']
        });
      }

      // Log AI interaction
      logger.info('AI customer service interaction', 'AI', {
        intent: response.intent,
        confidence: response.confidence,
        escalationRequired: response.escalationRequired,
        customerId: context.customerId
      });

      return response;
    } catch (error) {
      logger.error('AI customer service error', 'AI', error as Error);
      
      return {
        response: "I apologize, but I'm having technical difficulties. Please let me connect you with a human agent who can better assist you.",
        confidence: 0,
        intent: 'technical_error',
        entities: {},
        suggestedActions: ['escalate_to_human'],
        escalationRequired: true
      };
    }
  }

  /**
   * Intelligent booking routing and optimization
   */
  async optimizeBookingAssignment(
    bookingRequest: {
      serviceType: string;
      location: { lat: number; lng: number };
      preferredDateTime: Date;
      urgency: 'low' | 'medium' | 'high' | 'emergency';
      customerPreferences?: Record<string, any>;
    }
  ): Promise<{
    recommendedNotary: string;
    alternativeOptions: Array<{
      notaryId: string;
      score: number;
      reasoning: string;
      estimatedTravelTime: number;
    }>;
    pricingRecommendation: {
      basePrice: number;
      dynamicAdjustment: number;
      finalPrice: number;
      reasoning: string;
    };
  }> {
    try {
      // Get available notaries
      const availableNotaries = await this.getAvailableNotaries(
        bookingRequest.preferredDateTime
      );

      // Calculate optimal assignment using AI
      const assignments = await Promise.all(
        availableNotaries.map(async (notary) => {
          const score = await this.calculateNotaryScore(notary, bookingRequest);
          const travelTime = await this.estimateTravelTime(
            notary.location,
            bookingRequest.location
          );

          return {
            notaryId: notary.id,
            score,
            reasoning: this.generateAssignmentReasoning(notary, bookingRequest, score),
            estimatedTravelTime: travelTime
          };
        })
      );

      // Sort by score
      assignments.sort((a, b) => b.score - a.score);

      // Dynamic pricing
      const pricingRecommendation = await this.calculateDynamicPricing(
        bookingRequest,
        assignments[0]?.estimatedTravelTime || 0
      );

      return {
        recommendedNotary: assignments[0]?.notaryId,
        alternativeOptions: assignments.slice(1, 4),
        pricingRecommendation
      };
    } catch (error) {
      logger.error('Booking optimization error', 'AI', error as Error);
      throw error;
    }
  }

  /**
   * Generate customer insights using AI
   */
  async generateCustomerInsights(customerId: string): Promise<CustomerInsight> {
    try {
      const cacheKey = `ai:insights:${customerId}`;
      
      const cached = await cache.get<CustomerInsight>(cacheKey);
      if (cached) {
        return cached;
      }

      // Gather customer data
      const customerData = await this.gatherCustomerData(customerId);
      
      // AI analysis
      const analysis = await this.callAIService({
        system: this.getSystemPrompt('customer_analysis'),
        user: JSON.stringify(customerData),
        context: { task: 'customer_insights' },
      });

      const insights: CustomerInsight = {
        customerId,
        lifetimeValue: analysis.lifetimeValue || 0,
        riskScore: analysis.riskScore || 0,
        preferredServices: analysis.preferredServices || [],
        communicationPreference: analysis.communicationPreference || 'email',
        nextBestAction: analysis.nextBestAction || 'follow_up',
        churnProbability: analysis.churnProbability || 0
      };

      // Cache for 1 hour
      await cache.set(cacheKey, insights, { 
        ttl: cacheTTL.long,
        tags: ['ai', 'customer-insights', `customer:${customerId}`]
      });

      return insights;
    } catch (error) {
      logger.error('Customer insights generation error', 'AI', error as Error);
      throw error;
    }
  }

  /**
   * Predictive analytics for business planning
   */
  async generatePredictiveAnalytics(timeframe: 'week' | 'month' | 'quarter'): Promise<PredictiveAnalytics> {
    try {
      const cacheKey = `ai:predictive:${timeframe}`;
      
      const cached = await cache.get<PredictiveAnalytics>(cacheKey);
      if (cached) {
        return cached;
      }

      // Gather historical data
      const historicalData = await this.gatherHistoricalData(timeframe);
      
      // AI prediction
      const prediction = await this.callAIService({
        system: this.getSystemPrompt('predictive_analytics'),
        user: JSON.stringify(historicalData),
        context: { task: 'demand_forecasting', timeframe }
      });

      const analytics: PredictiveAnalytics = {
        bookingDemandForecast: prediction.bookingForecast || [],
        revenueProjection: prediction.revenueProjection || { nextMonth: 0, nextQuarter: 0, confidence: 0 },
        capacityRecommendations: prediction.capacityRecommendations || []
      };

      // Cache for 6 hours
      await cache.set(cacheKey, analytics, { 
        ttl: cacheTTL.long * 6,
        tags: ['ai', 'predictive-analytics']
      });

      return analytics;
    } catch (error) {
      logger.error('Predictive analytics error', 'AI', error as Error);
      throw error;
    }
  }

  /**
   * Intelligent content generation
   */
  async generateMarketingContent(
    type: 'email' | 'sms' | 'social' | 'blog',
    context: {
      audience: string;
      goal: string;
      tone: 'professional' | 'friendly' | 'urgent';
      data?: Record<string, any>;
    }
  ): Promise<{
    content: string;
    subject?: string;
    callToAction: string;
    personalizations: Record<string, string>;
  }> {
    try {
      const prompt = this.buildContentPrompt(type, context);
      
      const response = await this.callAIService({
        system: this.getSystemPrompt('content_generation'),
        user: prompt,
        context: { type, audience: context.audience }
      });

      return {
        content: response.content,
        subject: response.subject,
        callToAction: response.callToAction,
        personalizations: response.personalizations || {}
      };
    } catch (error) {
      logger.error('Content generation error', 'AI', error as Error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async callAIService(params: {
    system: string;
    user: string;
    context: Record<string, any>;
  }): Promise<any> {
    // Mock AI response for now - replace with actual OpenAI API call
    const mockResponse = {
      content: "This is a mock AI response. In production, this would call OpenAI API.",
      confidence: 0.85,
      intent: 'information_request',
      entities: {},
      suggestedActions: ['provide_information'],
      escalationRequired: false,
      lifetimeValue: 1250,
      riskScore: 0.2,
      preferredServices: ['Essential Notary Service'],
      communicationPreference: 'email',
      nextBestAction: 'follow_up_service_reminder',
      churnProbability: 0.15,
      bookingForecast: [
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedBookings: 12,
          confidence: 0.8,
          factors: ['historical_trend', 'seasonal_pattern']
        }
      ],
      revenueProjection: {
        nextMonth: 15000,
        nextQuarter: 45000,
        confidence: 0.75
      },
      capacityRecommendations: [
        {
          timeSlot: '09:00-12:00',
          recommendedCapacity: 3,
          reasoning: 'High demand period based on historical data'
        }
      ],
      subject: 'Your Houston Notary Service Appointment',
      callToAction: 'Book your appointment today!',
      personalizations: {
        customerName: '[Customer Name]',
        serviceType: '[Service Type]'
      }
    };

    // Track AI usage
    monitoring.trackPerformance({
      metric: 'ai_api_calls',
      value: 1,
      unit: 'count',
      tags: {
        type: params.context.task || 'general',
        system: 'openai'
      }
    });

    return mockResponse;
  }

  private async buildCustomerContext(context: any): Promise<string> {
    const parts = [];
    
    if (context.customerId) {
      parts.push(`Customer ID: ${context.customerId}`);
    }
    
    if (context.customerHistory?.length) {
      parts.push(`Previous bookings: ${context.customerHistory.length}`);
    }
    
    if (context.currentBookings?.length) {
      parts.push(`Active bookings: ${context.currentBookings.length}`);
    }

    return parts.join('\n');
  }

  private getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      customer_service: `You are an expert customer service AI for Houston Mobile Notary Pros. 
        Provide helpful, professional, and accurate information about notary services. 
        Always be courteous and solution-oriented. If you're unsure, recommend speaking with a human agent.`,
      
      customer_analysis: `You are an expert data analyst specializing in customer behavior and lifetime value prediction. 
        Analyze the provided customer data and generate actionable insights.`,
      
      predictive_analytics: `You are an expert business analyst specializing in demand forecasting and capacity planning. 
        Use historical data to predict future trends and recommend optimal resource allocation.`,
      
      content_generation: `You are an expert copywriter specializing in notary services marketing. 
        Create compelling, professional content that drives engagement and conversions.`
    };

    return prompts[type] || 'You are a helpful AI assistant.';
  }

  private hashMessage(message: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  private async getAvailableNotaries(dateTime: Date) {
    // Mock data - replace with actual notary availability query
    return [
      {
        id: 'notary-1',
        name: 'John Doe',
        location: { lat: 29.7604, lng: -95.3698 },
        rating: 4.8,
        specialties: ['Real Estate', 'Legal Documents']
      }
    ];
  }

  private async calculateNotaryScore(notary: any, request: any): Promise<number> {
    // AI-based scoring algorithm
    let score = 0;
    
    // Base rating
    score += notary.rating * 20;
    
    // Specialty match
    if (notary.specialties.includes(request.serviceType)) {
      score += 30;
    }
    
    // Availability (mock calculation)
    score += 25;
    
    // Distance factor (closer is better)
    const distance = this.calculateDistance(notary.location, request.location);
    score += Math.max(0, 25 - distance);
    
    return Math.min(100, score);
  }

  private async estimateTravelTime(from: any, to: any): Promise<number> {
    // Mock travel time calculation - replace with actual maps API
    const distance = this.calculateDistance(from, to);
    return distance * 2; // Assume 2 minutes per mile
  }

  private calculateDistance(point1: any, point2: any): number {
    // Simple distance calculation
    const latDiff = point1.lat - point2.lat;
    const lngDiff = point1.lng - point2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough miles conversion
  }

  private generateAssignmentReasoning(notary: any, request: any, score: number): string {
    return `Score: ${score}/100. High rating (${notary.rating}), specialty match, good availability.`;
  }

  private async calculateDynamicPricing(request: any, travelTime: number) {
    const basePrice = 75; // Base notary fee
    let adjustment = 0;
    
    // Urgency pricing
    if (request.urgency === 'emergency') adjustment += 50;
    else if (request.urgency === 'high') adjustment += 25;
    
    // Travel time adjustment
    if (travelTime > 30) adjustment += 25;
    else if (travelTime > 15) adjustment += 10;
    
    return {
      basePrice,
      dynamicAdjustment: adjustment,
      finalPrice: basePrice + adjustment,
      reasoning: `Base: $${basePrice}, Urgency: ${request.urgency}, Travel: ${travelTime}min`
    };
  }

  private async gatherCustomerData(customerId: string) {
    // Gather comprehensive customer data
    const bookings = await prisma.booking.findMany({
      where: { signerId: customerId },
      include: { service: true },
    });

    return {
      totalBookings: bookings.length,
      totalSpent: bookings.reduce((sum: number, b: any) => sum + ((b as any).totalAmount || 0), 0),
      averageBookingValue: bookings.length > 0 ? bookings.reduce((sum: number, b: any) => sum + ((b as any).totalAmount || 0), 0) / bookings.length : 0,
      lastBookingDate: bookings.length > 0 ? bookings[bookings.length - 1].createdAt : null,
      preferredServices: bookings.map(b => b.service?.name).filter(Boolean),
      bookingFrequency: bookings.length > 0 ? this.calculateFrequency(bookings) : 0
    };
  }

  private async gatherHistoricalData(timeframe: string) {
    const daysBack = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: { service: true }
    });

    return {
      totalBookings: bookings.length,
      dailyAverages: this.calculateDailyAverages(bookings),
      serviceDistribution: this.calculateServiceDistribution(bookings),
      revenueByDay: this.calculateDailyRevenue(bookings)
    };
  }

  private calculateFrequency(bookings: any[]): number {
    if (bookings.length < 2) return 0;
    
    const dates = bookings.map(b => new Date(b.createdAt).getTime()).sort();
    const intervals = [];
    
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i] - dates[i-1]);
    }
    
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return Math.round(averageInterval / (24 * 60 * 60 * 1000)); // Days between bookings
  }

  private calculateDailyAverages(bookings: any[]) {
    const dailyCounts: Record<string, number> = {};
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    return Object.values(dailyCounts);
  }

  private calculateServiceDistribution(bookings: any[]) {
    const distribution: Record<string, number> = {};
    bookings.forEach(booking => {
      const service = booking.service?.name || 'Unknown';
      distribution[service] = (distribution[service] || 0) + 1;
    });
    
    return distribution;
  }

  private calculateDailyRevenue(bookings: any[]) {
    const dailyRevenue: Record<string, number> = {};
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + ((booking as any).totalAmount || 0);
    });
    
    return dailyRevenue;
  }

  private buildContentPrompt(type: string, context: any): string {
    return `Create ${type} content for ${context.audience} with goal: ${context.goal}. Tone: ${context.tone}`;
  }
}

export const intelligentAssistant = new IntelligentAssistant(); 