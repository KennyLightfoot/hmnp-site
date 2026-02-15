/**
 * 🤖 AI Analytics Tracker - Phase 4 Enhancement
 * Houston Mobile Notary Pros
 * 
 * Features:
 * - AI performance tracking
 * - Conversation analytics  
 * - Mobile interaction metrics
 * - Conversion tracking
 * - Error monitoring
 * - Real-time dashboards
 */

interface AIInteraction {
  sessionId: string;
  messageId: string;
  userMessage: string;
  aiResponse: string;
  confidence: number;
  intent: string;
  responseTime: number;
  context: {
    page: string;
    userAgent: string;
    isMobile: boolean;
    source: 'chat_widget' | 'booking_assistant' | 'mobile_optimizer';
  };
  timestamp: Date;
  outcome?: 'resolved' | 'escalated' | 'abandoned';
  conversionData?: {
    leadGenerated: boolean;
    bookingStarted: boolean;
    bookingCompleted: boolean;
    phoneCallMade: boolean;
    formSubmitted: boolean;
  };
}

interface AIPerformanceMetrics {
  totalInteractions: number;
  averageConfidence: number;
  responseTimeMs: number;
  resolutionRate: number;
  escalationRate: number;
  conversionRate: number;
  mobileUsageRate: number;
  topIntents: Array<{ intent: string; count: number; confidence: number }>;
  errorRate: number;
  userSatisfactionScore?: number;
}

interface ConversationFlow {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  resolved: boolean;
  leadScore: number;
  touchpoints: string[];
  conversionEvents: string[];
  deviceInfo: {
    isMobile: boolean;
    userAgent: string;
    viewport: { width: number; height: number };
  };
}

class AIAnalyticsTracker {
  private interactions: AIInteraction[] = [];
  private conversationFlows: Map<string, ConversationFlow> = new Map();
  private performanceBuffer: AIInteraction[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Auto-flush metrics periodically
    setInterval(() => {
      this.flushMetrics();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Track AI interaction
   */
  trackInteraction(interaction: Omit<AIInteraction, 'timestamp'>): void {
    const fullInteraction: AIInteraction = {
      ...interaction,
      timestamp: new Date()
    };

    this.interactions.push(fullInteraction);
    this.performanceBuffer.push(fullInteraction);

    // Update conversation flow
    this.updateConversationFlow(fullInteraction);

    // Auto-flush if buffer is full
    if (this.performanceBuffer.length >= this.BUFFER_SIZE) {
      this.flushMetrics();
    }

    // Log for debugging (will be removed in production)
    console.log('🤖 AI Interaction Tracked:', {
      intent: interaction.intent,
      confidence: interaction.confidence,
      responseTime: interaction.responseTime,
      isMobile: interaction.context.isMobile
    });
  }

  /**
   * Track conversation start
   */
  startConversation(sessionId: string, context: { page: string; isMobile: boolean; userAgent: string }): void {
    const conversation: ConversationFlow = {
      sessionId,
      startTime: new Date(),
      messageCount: 0,
      resolved: false,
      leadScore: 0,
      touchpoints: [context.page],
      conversionEvents: [],
      deviceInfo: {
        isMobile: context.isMobile,
        userAgent: context.userAgent,
        viewport: {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0
        }
      }
    };

    this.conversationFlows.set(sessionId, conversation);
  }

  /**
   * Track conversation end
   */
  endConversation(sessionId: string, outcome: 'resolved' | 'escalated' | 'abandoned'): void {
    const conversation = this.conversationFlows.get(sessionId);
    if (conversation) {
      conversation.endTime = new Date();
      conversation.resolved = outcome === 'resolved';
      
      // Calculate lead score based on engagement
      conversation.leadScore = this.calculateLeadScore(conversation);
      
      // Mark last interaction with outcome
      const lastInteraction = this.interactions
        .filter(i => i.sessionId === sessionId)
        .pop();
      
      if (lastInteraction) {
        lastInteraction.outcome = outcome;
      }
    }
  }

  /**
   * Track conversion event
   */
  trackConversion(sessionId: string, event: keyof AIInteraction['conversionData']): void {
    const conversation = this.conversationFlows.get(sessionId);
    if (conversation) {
      conversation.conversionEvents.push(event);
    }

    // Update recent interactions for this session
    this.interactions
      .filter(i => i.sessionId === sessionId)
      .forEach(interaction => {
        if (!interaction.conversionData) {
          interaction.conversionData = {
            leadGenerated: false,
            bookingStarted: false,
            bookingCompleted: false,
            phoneCallMade: false,
            formSubmitted: false
          };
        }
        (interaction.conversionData as any)[event] = true;
      });
  }

  /**
   * Track mobile-specific events
   */
  trackMobileEvent(sessionId: string, event: string, data?: any): void {
    const mobileInteraction: Partial<AIInteraction> = {
      sessionId,
      messageId: `mobile_${Date.now()}`,
      userMessage: `Mobile Event: ${event}`,
      aiResponse: data?.message || 'Mobile interaction processed',
      confidence: 1.0,
      intent: 'mobile_engagement',
      responseTime: 0,
      context: {
        page: data?.page || window.location.pathname,
        userAgent: navigator.userAgent,
        isMobile: true,
        source: 'mobile_optimizer'
      },
      timestamp: new Date()
    };

    this.trackInteraction(mobileInteraction as Omit<AIInteraction, 'timestamp'>);
  }

  /**
   * Get real-time performance metrics
   */
  getPerformanceMetrics(timeRange?: { start: Date; end: Date }): AIPerformanceMetrics {
    let interactions = this.interactions;
    
    if (timeRange) {
      interactions = interactions.filter(
        i => i.timestamp >= timeRange.start && i.timestamp <= timeRange.end
      );
    }

    if (interactions.length === 0) {
      return {
        totalInteractions: 0,
        averageConfidence: 0,
        responseTimeMs: 0,
        resolutionRate: 0,
        escalationRate: 0,
        conversionRate: 0,
        mobileUsageRate: 0,
        topIntents: [],
        errorRate: 0
      };
    }

    const totalInteractions = interactions.length;
    const averageConfidence = interactions.reduce((sum, i) => sum + i.confidence, 0) / totalInteractions;
    const responseTimeMs = interactions.reduce((sum, i) => sum + i.responseTime, 0) / totalInteractions;
    
    const resolvedCount = interactions.filter(i => i.outcome === 'resolved').length;
    const escalatedCount = interactions.filter(i => i.outcome === 'escalated').length;
    const mobileCount = interactions.filter(i => i.context.isMobile).length;
    const conversionCount = interactions.filter(i => 
      i.conversionData && (
        i.conversionData.bookingCompleted || 
        i.conversionData.phoneCallMade || 
        i.conversionData.leadGenerated
      )
    ).length;

    // Calculate intent distribution
    const intentCounts = new Map<string, { count: number; totalConfidence: number }>();
    interactions.forEach(i => {
      const current = intentCounts.get(i.intent) || { count: 0, totalConfidence: 0 };
      intentCounts.set(i.intent, {
        count: current.count + 1,
        totalConfidence: current.totalConfidence + i.confidence
      });
    });

    const topIntents = Array.from(intentCounts.entries())
      .map(([intent, data]) => ({
        intent,
        count: data.count,
        confidence: data.totalConfidence / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const errorRate = interactions.filter(i => i.confidence < 0.5).length / totalInteractions;

    return {
      totalInteractions,
      averageConfidence,
      responseTimeMs,
      resolutionRate: resolvedCount / totalInteractions,
      escalationRate: escalatedCount / totalInteractions,
      conversionRate: conversionCount / totalInteractions,
      mobileUsageRate: mobileCount / totalInteractions,
      topIntents,
      errorRate
    };
  }

  /**
   * Get conversation analytics
   */
  getConversationAnalytics(): {
    activeConversations: number;
    averageSessionLength: number;
    highValueLeads: number;
    mobileConversations: number;
    conversionFunnel: {
      totalSessions: number;
      leadsGenerated: number;
      bookingsStarted: number;
      bookingsCompleted: number;
    };
  } {
    const conversations = Array.from(this.conversationFlows.values());
    const activeConversations = conversations.filter(c => !c.endTime).length;
    
    const completedConversations = conversations.filter(c => c.endTime);
    const averageSessionLength = completedConversations.length > 0
      ? completedConversations.reduce((sum, c) => {
          const duration = c.endTime!.getTime() - c.startTime.getTime();
          return sum + duration;
        }, 0) / completedConversations.length / 1000 // Convert to seconds
      : 0;

    const highValueLeads = conversations.filter(c => c.leadScore >= 80).length;
    const mobileConversations = conversations.filter(c => c.deviceInfo.isMobile).length;

    // Conversion funnel
    const totalSessions = conversations.length;
    const leadsGenerated = conversations.filter(c => 
      c.conversionEvents.includes('leadGenerated')
    ).length;
    const bookingsStarted = conversations.filter(c => 
      c.conversionEvents.includes('bookingStarted')
    ).length;
    const bookingsCompleted = conversations.filter(c => 
      c.conversionEvents.includes('bookingCompleted')
    ).length;

    return {
      activeConversations,
      averageSessionLength,
      highValueLeads,
      mobileConversations,
      conversionFunnel: {
        totalSessions,
        leadsGenerated,
        bookingsStarted,
        bookingsCompleted
      }
    };
  }

  /**
   * Update conversation flow
   */
  private updateConversationFlow(interaction: AIInteraction): void {
    const conversation = this.conversationFlows.get(interaction.sessionId);
    if (conversation) {
      conversation.messageCount++;
      
      // Add touchpoint if new page
      if (!conversation.touchpoints.includes(interaction.context.page)) {
        conversation.touchpoints.push(interaction.context.page);
      }

      // Update lead score based on engagement
      conversation.leadScore = this.calculateLeadScore(conversation);
    }
  }

  /**
   * Calculate lead score
   */
  private calculateLeadScore(conversation: ConversationFlow): number {
    let score = 0;

    // Message engagement (0-30 points)
    score += Math.min(conversation.messageCount * 3, 30);

    // Page touchpoints (0-20 points)
    score += Math.min(conversation.touchpoints.length * 5, 20);

    // Conversion events (0-50 points)
    const conversionPoints = {
      'leadGenerated': 15,
      'bookingStarted': 25,
      'bookingCompleted': 50,
      'phoneCallMade': 30,
      'formSubmitted': 20
    };
    
    conversation.conversionEvents.forEach(event => {
      score += conversionPoints[event as keyof typeof conversionPoints] || 0;
    });

    return Math.min(score, 100);
  }

  /**
   * Flush metrics to persistent storage
   */
  private async flushMetrics(): Promise<void> {
    if (this.performanceBuffer.length === 0) return;

    try {
      // In production, this would send to analytics service
      // For now, we'll log to console and localStorage
      const metrics = this.getPerformanceMetrics();
      const analytics = this.getConversationAnalytics();

      console.log('📊 AI Analytics Flush:', {
        bufferSize: this.performanceBuffer.length,
        metrics,
        analytics
      });

      // Store in localStorage for demo purposes
      if (typeof window !== 'undefined') {
        localStorage.setItem('ai_analytics_metrics', JSON.stringify(metrics));
        localStorage.setItem('ai_analytics_conversations', JSON.stringify(analytics));
      }

      // Clear buffer
      this.performanceBuffer = [];

    } catch (error) {
      console.error('Failed to flush AI analytics:', error);
    }
  }

  /**
   * Export data for external analytics
   */
  exportData(): {
    interactions: AIInteraction[];
    conversations: ConversationFlow[];
    metrics: AIPerformanceMetrics;
  } {
    return {
      interactions: this.interactions,
      conversations: Array.from(this.conversationFlows.values()),
      metrics: this.getPerformanceMetrics()
    };
  }
}

// Singleton instance
export const aiAnalytics = new AIAnalyticsTracker();

// Helper functions for easy integration
export const trackAIInteraction = (interaction: Omit<AIInteraction, 'timestamp'>) => {
  aiAnalytics.trackInteraction(interaction);
};

export const trackMobileEvent = (sessionId: string, event: string, data?: any) => {
  aiAnalytics.trackMobileEvent(sessionId, event, data);
};

export const trackConversion = (sessionId: string, event: keyof AIInteraction['conversionData']) => {
  aiAnalytics.trackConversion(sessionId, event);
};

export const getAIMetrics = () => aiAnalytics.getPerformanceMetrics();

export const getConversationAnalytics = () => aiAnalytics.getConversationAnalytics();

// Export types
export type { AIInteraction, AIPerformanceMetrics, ConversationFlow }; 