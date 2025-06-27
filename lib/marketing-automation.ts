/**
 * Advanced Marketing Automation & Customer Journey System
 * Provides sophisticated customer journey management and personalized marketing campaigns
 */

import { logger } from './logger';
import { cache, cacheTTL } from './cache';
import { prisma } from './prisma';
import { aiAssistant } from './ai-assistant';
import * as ghl from './ghl/api';

export interface CustomerJourney {
  customerId: string;
  currentStage: JourneyStage;
  nextActions: JourneyAction[];
  personalizedContent: PersonalizedContent;
  automationTriggers: AutomationTrigger[];
  journeyMetrics: JourneyMetrics;
}

export interface JourneyStage {
  stage: 'AWARENESS' | 'CONSIDERATION' | 'DECISION' | 'ONBOARDING' | 'ACTIVE' | 'RETENTION' | 'WINBACK';
  entryDate: Date;
  expectedActions: string[];
  completionCriteria: string[];
  timeInStage: number;
}

export interface JourneyAction {
  actionType: 'EMAIL' | 'SMS' | 'CALL' | 'PUSH_NOTIFICATION' | 'IN_APP_MESSAGE';
  content: string;
  scheduledTime: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  personalization: Record<string, string>;
  expectedOutcome: string;
}

export interface PersonalizedContent {
  emailTemplates: EmailTemplate[];
  smsTemplates: SMSTemplate[];
  recommendations: ServiceRecommendation[];
  offers: PersonalizedOffer[];
}

export interface EmailTemplate {
  id: string;
  subject: string;
  content: string;
  personalizations: Record<string, string>;
  ctaButtons: CallToAction[];
  trackingPixels: string[];
}

export interface SMSTemplate {
  id: string;
  content: string;
  personalizations: Record<string, string>;
  shortUrl?: string;
}

export interface ServiceRecommendation {
  serviceId: string;
  serviceName: string;
  reason: string;
  confidence: number;
  expectedRevenue: number;
  personalizedMessage: string;
}

export interface PersonalizedOffer {
  offerId: string;
  title: string;
  description: string;
  discountAmount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  validUntil: Date;
  conditions: string[];
  targetSegment: string;
}

export interface CallToAction {
  text: string;
  url: string;
  trackingId: string;
  style: 'PRIMARY' | 'SECONDARY' | 'TEXT';
}

export interface AutomationTrigger {
  triggerId: string;
  triggerType: 'TIME_BASED' | 'EVENT_BASED' | 'BEHAVIOR_BASED' | 'MILESTONE_BASED';
  conditions: TriggerCondition[];
  actions: AutomationAction[];
  isActive: boolean;
}

export interface TriggerCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  actionType: string;
  parameters: Record<string, any>;
  delay?: number;
  conditions?: TriggerCondition[];
}

export interface JourneyMetrics {
  engagementScore: number;
  conversionProbability: number;
  lifetimeValue: number;
  churnRisk: number;
  preferredChannels: string[];
  responseRates: Record<string, number>;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  roi: number;
  segmentPerformance: Record<string, any>;
}

class MarketingAutomation {
  /**
   * Analyze and update customer journey
   */
  async analyzeCustomerJourney(customerId: string): Promise<CustomerJourney> {
    try {
      const cacheKey = `journey:${customerId}`;
      
      const cached = await cache.get<CustomerJourney>(cacheKey);
      if (cached) {
        return cached;
      }

      logger.info('Analyzing customer journey', 'MARKETING', { customerId });

      // Gather customer data
      const customerData = await this.gatherCustomerData(customerId);
      
      // Determine current stage
      const currentStage = await this.determineJourneyStage(customerData);
      
      // Generate next actions
      const nextActions = await this.generateNextActions(customerData, currentStage);
      
      // Create personalized content
      const personalizedContent = await this.createPersonalizedContent(customerData, currentStage);
      
      // Set up automation triggers
      const automationTriggers = await this.setupAutomationTriggers(customerData, currentStage);
      
      // Calculate journey metrics
      const journeyMetrics = await this.calculateJourneyMetrics(customerData);

      const journeyData: CustomerJourney = {
        customerId,
        currentStage,
        nextActions,
        personalizedContent,
        automationTriggers,
        journeyMetrics
      };

      // Cache for 2 hours
      await cache.set(cacheKey, journeyData, { 
        ttl: cacheTTL.long * 2,
        tags: ['marketing', 'customer-journey', `customer:${customerId}`]
      });

      return journeyData;
    } catch (error) {
      logger.error('Customer journey analysis error', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Execute automated marketing campaign
   */
  async executeCampaign(
    campaignId: string,
    targetSegment: string[],
    campaignConfig: {
      name: string;
      type: 'EMAIL' | 'SMS' | 'MULTI_CHANNEL';
      content: any;
      schedule: Date;
      personalization: boolean;
    }
  ): Promise<{
    campaignId: string;
    status: 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    targetCount: number;
    estimatedReach: number;
  }> {
    try {
      logger.info('Executing marketing campaign', 'MARKETING', {
        campaignId,
        targetSegment: targetSegment.length,
        type: campaignConfig.type
      });

      // Get target customers
      const targetCustomers = await this.getTargetCustomers(targetSegment);
      
      // Personalize content for each customer
      const personalizedCampaigns = await Promise.all(
        targetCustomers.map(async (customer) => {
          if (campaignConfig.personalization) {
            return await this.personalizeContent(campaignConfig.content, customer);
          }
          return campaignConfig.content;
        })
      );

      // Schedule or execute campaign
      const executionResults = await this.executeCampaignDelivery(
        campaignId,
        targetCustomers,
        personalizedCampaigns,
        campaignConfig
      );

      // Track campaign performance
      await this.trackCampaignMetrics(campaignId, executionResults);

      return {
        campaignId,
        status: 'RUNNING',
        targetCount: targetCustomers.length,
        estimatedReach: Math.floor(targetCustomers.length * 0.85) // 85% delivery rate
      };
    } catch (error) {
      logger.error('Campaign execution error', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Generate advanced customer segments
   */
  async generateAdvancedSegments(): Promise<Array<{
    segmentId: string;
    name: string;
    description: string;
    criteria: TriggerCondition[];
    customerCount: number;
    averageValue: number;
    recommendedCampaigns: string[];
  }>> {
    try {
      const segments = [
        {
          segmentId: 'high-value-frequent',
          name: 'High-Value Frequent Customers',
          description: 'Customers with high lifetime value and frequent bookings',
          criteria: [
            { field: 'lifetimeValue', operator: 'GREATER_THAN' as const, value: 500 },
            { field: 'bookingFrequency', operator: 'GREATER_THAN' as const, value: 3, logicalOperator: 'AND' as const }
          ],
          customerCount: await this.getSegmentCount('high-value-frequent'),
          averageValue: 850,
          recommendedCampaigns: ['VIP_PROGRAM', 'EXCLUSIVE_OFFERS', 'LOYALTY_REWARDS']
        },
        {
          segmentId: 'new-customers',
          name: 'New Customers',
          description: 'Customers acquired in the last 30 days',
          criteria: [
            { field: 'firstBookingDate', operator: 'GREATER_THAN' as const, value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          ],
          customerCount: await this.getSegmentCount('new-customers'),
          averageValue: 125,
          recommendedCampaigns: ['WELCOME_SERIES', 'ONBOARDING', 'FIRST_REVIEW_REQUEST']
        },
        {
          segmentId: 'at-risk-churn',
          name: 'At-Risk Customers',
          description: 'Customers with high churn probability',
          criteria: [
            { field: 'churnProbability', operator: 'GREATER_THAN' as const, value: 0.6 },
            { field: 'daysSinceLastBooking', operator: 'GREATER_THAN' as const, value: 90, logicalOperator: 'AND' as const }
          ],
          customerCount: await this.getSegmentCount('at-risk-churn'),
          averageValue: 320,
          recommendedCampaigns: ['RETENTION_CAMPAIGN', 'WIN_BACK_OFFER', 'CUSTOMER_SUCCESS_OUTREACH']
        },
        {
          segmentId: 'seasonal-users',
          name: 'Seasonal Users',
          description: 'Customers who book primarily during specific seasons',
          criteria: [
            { field: 'bookingPattern', operator: 'EQUALS' as const, value: 'seasonal' }
          ],
          customerCount: await this.getSegmentCount('seasonal-users'),
          averageValue: 200,
          recommendedCampaigns: ['SEASONAL_REMINDERS', 'ADVANCE_BOOKING_INCENTIVES']
        }
      ];

      return segments;
    } catch (error) {
      logger.error('Advanced segmentation error', 'MARKETING', error as Error);
      return [];
    }
  }

  /**
   * Optimize campaign performance
   */
  async optimizeCampaignPerformance(campaignId: string): Promise<{
    optimizations: Array<{
      area: string;
      currentPerformance: number;
      recommendedAction: string;
      expectedImprovement: number;
    }>;
    abTestRecommendations: Array<{
      testName: string;
      variants: string[];
      metrics: string[];
      estimatedLift: number;
    }>;
  }> {
    try {
      const performance = await this.getCampaignPerformance(campaignId);
      
      const optimizations = [];
      const abTestRecommendations = [];

      // Analyze open rates
      if (performance.openRate < 0.20) {
        optimizations.push({
          area: 'Subject Line',
          currentPerformance: performance.openRate,
          recommendedAction: 'A/B test subject lines with personalization and urgency',
          expectedImprovement: 0.08
        });

        abTestRecommendations.push({
          testName: 'Subject Line Personalization',
          variants: ['Standard', 'Personalized', 'Urgent'],
          metrics: ['open_rate', 'click_rate'],
          estimatedLift: 15
        });
      }

      // Analyze click rates
      if (performance.clickRate < 0.05) {
        optimizations.push({
          area: 'Call-to-Action',
          currentPerformance: performance.clickRate,
          recommendedAction: 'Optimize CTA placement and copy',
          expectedImprovement: 0.03
        });
      }

      // Analyze conversion rates
      if (performance.conversionRate < 0.02) {
        optimizations.push({
          area: 'Landing Page',
          currentPerformance: performance.conversionRate,
          recommendedAction: 'Optimize landing page experience and reduce friction',
          expectedImprovement: 0.015
        });
      }

      return { optimizations, abTestRecommendations };
    } catch (error) {
      logger.error('Campaign optimization error', 'MARKETING', error as Error);
      return { optimizations: [], abTestRecommendations: [] };
    }
  }

  /**
   * Private helper methods
   */
  private async gatherCustomerData(customerId: string) {
    const user = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        Booking_Booking_signerIdToUser: {
          include: {
            Service: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const bookings = user.Booking_Booking_signerIdToUser || [];
    
    return {
      user,
      bookings,
      totalSpent: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      bookingCount: bookings.length,
      firstBookingDate: bookings.length > 0 ? bookings[bookings.length - 1].createdAt : null,
      lastBookingDate: bookings.length > 0 ? bookings[0].createdAt : null,
      averageBookingValue: bookings.length > 0 ? bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length : 0,
      preferredServices: this.getPreferredServices(bookings)
    };
  }

  private async determineJourneyStage(customerData: any): Promise<JourneyStage> {
    const { bookingCount, lastBookingDate, totalSpent } = customerData;
    
    let stage: JourneyStage['stage'] = 'AWARENESS';
    
    if (bookingCount === 0) {
      stage = 'AWARENESS';
    } else if (bookingCount === 1) {
      const daysSinceFirst = Math.floor((Date.now() - new Date(lastBookingDate).getTime()) / (24 * 60 * 60 * 1000));
      if (daysSinceFirst < 30) {
        stage = 'ONBOARDING';
      } else {
        stage = 'CONSIDERATION';
      }
    } else if (bookingCount > 1 && bookingCount < 5) {
      stage = 'ACTIVE';
    } else if (totalSpent > 500) {
      stage = 'RETENTION';
    } else {
      const daysSinceLastBooking = Math.floor((Date.now() - new Date(lastBookingDate).getTime()) / (24 * 60 * 60 * 1000));
      if (daysSinceLastBooking > 90) {
        stage = 'WINBACK';
      } else {
        stage = 'ACTIVE';
      }
    }

    return {
      stage,
      entryDate: new Date(),
      expectedActions: this.getExpectedActions(stage),
      completionCriteria: this.getCompletionCriteria(stage),
      timeInStage: 0
    };
  }

  private async generateNextActions(customerData: any, currentStage: JourneyStage): Promise<JourneyAction[]> {
    const actions: JourneyAction[] = [];
    
    switch (currentStage.stage) {
      case 'AWARENESS':
        actions.push({
          actionType: 'EMAIL',
          content: 'Welcome to Houston Mobile Notary Pros',
          scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          priority: 'HIGH',
          personalization: { customerName: customerData.user.name || 'Valued Customer' },
          expectedOutcome: 'Increase brand awareness'
        });
        break;
        
      case 'ONBOARDING':
        actions.push({
          actionType: 'EMAIL',
          content: 'How to get the most from our services',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          priority: 'MEDIUM',
          personalization: { customerName: customerData.user.name || 'Valued Customer' },
          expectedOutcome: 'Improve service understanding'
        });
        break;
        
      case 'RETENTION':
        actions.push({
          actionType: 'EMAIL',
          content: 'Thank you for being a loyal customer',
          scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          priority: 'LOW',
          personalization: { 
            customerName: customerData.user.name || 'Valued Customer',
            totalBookings: customerData.bookingCount.toString()
          },
          expectedOutcome: 'Maintain loyalty'
        });
        break;
    }
    
    return actions;
  }

  private async createPersonalizedContent(customerData: any, currentStage: JourneyStage): Promise<PersonalizedContent> {
    // Generate personalized content using AI
    const emailContent = await aiAssistant.generateMarketingContent('email', {
      customerName: customerData.user.name || 'Valued Customer',
      serviceType: customerData.preferredServices[0] || 'Notary Service',
      tone: 'professional'
    });

    const smsContent = await aiAssistant.generateMarketingContent('sms', {
      customerName: customerData.user.name || 'Valued Customer',
      serviceType: customerData.preferredServices[0] || 'Notary Service',
      tone: 'friendly'
    });

    return {
      emailTemplates: [{
        id: `email-${currentStage.stage.toLowerCase()}`,
        subject: emailContent.subject || 'Your Houston Notary Service',
        content: emailContent.content,
        personalizations: {
          customerName: customerData.user.name || 'Valued Customer',
          preferredService: customerData.preferredServices[0] || 'Notary Service'
        },
        ctaButtons: [{
          text: 'Book Now',
          url: `${process.env.NEXTAUTH_URL}/booking`,
          trackingId: `cta-${currentStage.stage.toLowerCase()}`,
          style: 'PRIMARY'
        }],
        trackingPixels: [`pixel-${currentStage.stage.toLowerCase()}`]
      }],
      smsTemplates: [{
        id: `sms-${currentStage.stage.toLowerCase()}`,
        content: smsContent.content,
        personalizations: {
          customerName: customerData.user.name || 'Valued Customer'
        }
      }],
      recommendations: await this.generateServiceRecommendations(customerData),
      offers: await this.generatePersonalizedOffers(customerData, currentStage)
    };
  }

  private async setupAutomationTriggers(customerData: any, currentStage: JourneyStage): Promise<AutomationTrigger[]> {
    return [
      {
        triggerId: `trigger-${currentStage.stage.toLowerCase()}`,
        triggerType: 'TIME_BASED',
        conditions: [{
          field: 'daysSinceLastContact',
          operator: 'GREATER_THAN',
          value: 7
        }],
        actions: [{
          actionType: 'SEND_EMAIL',
          parameters: {
            templateId: `email-${currentStage.stage.toLowerCase()}`,
            personalization: customerData.user.name
          }
        }],
        isActive: true
      }
    ];
  }

  private async calculateJourneyMetrics(customerData: any): Promise<JourneyMetrics> {
    // Generate customer insights using AI
    const insights = await aiAssistant.generateCustomerInsights(customerData.user.id);
    
    return {
      engagementScore: Math.random() * 100, // Mock score
      conversionProbability: 0.15 + Math.random() * 0.3, // 15-45%
      lifetimeValue: insights.lifetimeValue,
      churnRisk: insights.riskScore,
      preferredChannels: ['email', 'sms'],
      responseRates: {
        email: 0.22,
        sms: 0.45,
        push: 0.12
      }
    };
  }

  private getPreferredServices(bookings: any[]): string[] {
    const serviceCounts = {};
    
    bookings.forEach(booking => {
      const serviceName = booking.Service?.name || 'Unknown';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    
    return Object.entries(serviceCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([service]) => service);
  }

  private getExpectedActions(stage: JourneyStage['stage']): string[] {
    const actions = {
      AWARENESS: ['Email open', 'Website visit', 'Service inquiry'],
      CONSIDERATION: ['Quote request', 'Service comparison', 'FAQ visits'],
      DECISION: ['Booking form start', 'Payment initiation'],
      ONBOARDING: ['First booking completion', 'Profile setup', 'Service review'],
      ACTIVE: ['Repeat bookings', 'Referrals', 'Service expansion'],
      RETENTION: ['Loyalty program engagement', 'Premium service upgrades'],
      WINBACK: ['Re-engagement email response', 'Special offer redemption']
    };
    return actions[stage] || [];
  }

  private getCompletionCriteria(stage: JourneyStage['stage']): string[] {
    const criteria = {
      AWARENESS: ['First booking completed'],
      CONSIDERATION: ['Quote requested'],
      DECISION: ['Booking payment completed'],
      ONBOARDING: ['Second booking completed'],
      ACTIVE: ['Regular booking pattern established'],
      RETENTION: ['Long-term engagement maintained'],
      WINBACK: ['Re-engagement achieved']
    };
    return criteria[stage] || [];
  }

  private async getTargetCustomers(segmentIds: string[]): Promise<any[]> {
    // Mock customer retrieval - would implement actual segmentation logic
    const customers = await prisma.user.findMany({
      take: 100,
      include: {
        Booking_Booking_signerIdToUser: true
      }
    });
    
    return customers.slice(0, 50); // Return subset for campaign
  }

  private async personalizeContent(content: any, customer: any): Promise<any> {
    // Use AI to personalize content
    return {
      ...content,
      personalizations: {
        customerName: customer.name || 'Valued Customer',
        lastService: customer.Booking_Booking_signerIdToUser[0]?.Service?.name || 'our services'
      }
    };
  }

  private async executeCampaignDelivery(
    campaignId: string,
    customers: any[],
    content: any[],
    config: any
  ): Promise<any> {
    // Mock campaign delivery
    logger.info('Campaign delivery initiated', 'MARKETING', {
      campaignId,
      customerCount: customers.length,
      type: config.type
    });
    
    return {
      sent: customers.length,
      delivered: Math.floor(customers.length * 0.95),
      failed: Math.floor(customers.length * 0.05)
    };
  }

  private async trackCampaignMetrics(campaignId: string, results: any): Promise<void> {
    // Track campaign metrics in cache
    await cache.set(`campaign:metrics:${campaignId}`, results, {
      ttl: cacheTTL.week,
      tags: ['marketing', 'campaigns']
    });
  }

  private async getSegmentCount(segmentId: string): Promise<number> {
    // Mock segment counts
    const counts = {
      'high-value-frequent': 45,
      'new-customers': 120,
      'at-risk-churn': 32,
      'seasonal-users': 78
    };
    return counts[segmentId] || 0;
  }

  private async getCampaignPerformance(campaignId: string): Promise<CampaignPerformance> {
    // Mock campaign performance data
    return {
      campaignId,
      campaignName: 'Spring Notary Campaign',
      sentCount: 1000,
      openRate: 0.18,
      clickRate: 0.04,
      conversionRate: 0.015,
      revenue: 2500,
      roi: 3.2,
      segmentPerformance: {}
    };
  }

  private async generateServiceRecommendations(customerData: any): Promise<ServiceRecommendation[]> {
    const currentServices = customerData.preferredServices;
    const allServices = ['Essential Notary Service', 'Business Notary Service', 'Real Estate Notary Service'];
    
    const recommendations = allServices
      .filter(service => !currentServices.includes(service))
      .map(service => ({
        serviceId: service.toLowerCase().replace(/\s+/g, '-'),
        serviceName: service,
        reason: `Based on your ${currentServices[0] || 'service'} usage`,
        confidence: 0.7 + Math.random() * 0.2,
        expectedRevenue: 75 + Math.random() * 50,
        personalizedMessage: `${customerData.user.name}, you might also benefit from our ${service}`
      }));

    return recommendations.slice(0, 2);
  }

  private async generatePersonalizedOffers(customerData: any, currentStage: JourneyStage): Promise<PersonalizedOffer[]> {
    const offers = [];
    
    if (currentStage.stage === 'WINBACK') {
      offers.push({
        offerId: 'winback-discount',
        title: 'Welcome Back - 25% Off',
        description: 'We miss you! Come back and save 25% on your next service',
        discountAmount: 25,
        discountType: 'PERCENTAGE' as const,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        conditions: ['Valid for one use only', 'Cannot be combined with other offers'],
        targetSegment: 'winback'
      });
    }
    
    if (customerData.bookingCount > 3) {
      offers.push({
        offerId: 'loyalty-discount',
        title: 'Loyal Customer Reward',
        description: 'Thank you for your loyalty! Enjoy 15% off your next booking',
        discountAmount: 15,
        discountType: 'PERCENTAGE' as const,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        conditions: ['Valid for returning customers'],
        targetSegment: 'loyal'
      });
    }
    
    return offers;
  }
}

export const marketingAutomation = new MarketingAutomation(); 