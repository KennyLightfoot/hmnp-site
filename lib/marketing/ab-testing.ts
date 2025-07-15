/**
 * A/B Testing Framework for Landing Pages
 * Houston Mobile Notary Pros - Conversion Optimization
 * 
 * Comprehensive A/B testing system for landing pages with support for
 * different value propositions, CTAs, and conversion tracking.
 */

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { AlertManager } from '@/lib/monitoring/alert-manager';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  type: 'VALUE_PROPOSITION' | 'CTA_BUTTON' | 'LAYOUT' | 'PRICING' | 'HEADLINE' | 'FORM';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  targetPage: string;
  trafficSplit: number; // Percentage of traffic to test variant
  variants: ABTestVariant[];
  metrics: ABTestMetrics;
  settings: ABTestSettings;
  results?: ABTestResults;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  isControl: boolean;
  trafficAllocation: number; // Percentage of test traffic
  configuration: {
    headline?: string;
    subheadline?: string;
    valueProposition?: string;
    ctaText?: string;
    ctaColor?: string;
    ctaSize?: 'small' | 'medium' | 'large';
    layout?: 'single_column' | 'two_column' | 'hero_banner';
    pricing?: {
      display: 'standard' | 'emphasized' | 'comparison';
      highlight?: string;
    };
    form?: {
      fields: string[];
      layout: 'vertical' | 'horizontal';
      buttonText?: string;
    };
    images?: {
      hero?: string;
      testimonials?: string[];
      badges?: string[];
    };
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
  performance: VariantPerformance;
}

export interface VariantPerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  revenuePerVisitor: number;
  bounceRate: number;
  timeOnPage: number;
}

export interface ABTestMetrics {
  primaryMetric: 'CONVERSION_RATE' | 'REVENUE' | 'CTR' | 'FORM_COMPLETION' | 'PHONE_CALLS';
  secondaryMetrics: string[];
  minimumSampleSize: number;
  minimumDetectableEffect: number; // Percentage
  confidenceLevel: number; // 0.95 for 95%
  statisticalPower: number; // 0.8 for 80%
}

export interface ABTestSettings {
  autoOptimize: boolean; // Automatically send more traffic to winning variant
  autoStop: boolean; // Stop test when statistical significance reached
  excludeReturningVisitors: boolean;
  deviceTargeting?: 'all' | 'mobile' | 'desktop';
  geoTargeting?: string[]; // Country codes
  timeTargeting?: {
    daysOfWeek: number[];
    hoursOfDay: number[];
  };
  audienceSegments?: string[];
}

export interface ABTestResults {
  winner?: string; // Variant ID
  confidence: number;
  pValue: number;
  effect: number; // Percentage improvement
  significance: 'SIGNIFICANT' | 'NOT_SIGNIFICANT' | 'INCONCLUSIVE';
  recommendation: string;
  detailedResults: {
    [variantId: string]: {
      performance: VariantPerformance;
      confidenceInterval: {
        lower: number;
        upper: number;
      };
    };
  };
}

export interface ABTestAssignment {
  testId: string;
  variantId: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface ABTestEvent {
  testId: string;
  variantId: string;
  sessionId: string;
  eventType: 'IMPRESSION' | 'CLICK' | 'CONVERSION' | 'FORM_SUBMIT' | 'PHONE_CALL';
  eventData?: any;
  timestamp: string;
  value?: number;
}

export class ABTestingService {
  private alertManager: AlertManager;

  constructor() {
    this.alertManager = new AlertManager();
  }

  /**
   * Create a new A/B test
   */
  async createTest(testConfig: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTest> {
    try {
      const test: ABTest = {
        ...testConfig,
        id: `ab_test_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Validate test configuration
      this.validateTestConfiguration(test);

      // Save test to database
      await this.saveTest(test);

      logger.info('A/B test created', 'MARKETING', {
        testId: test.id,
        name: test.name,
        type: test.type,
        variants: test.variants.length
      });

      return test;
    } catch (error) {
      logger.error('Failed to create A/B test', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Get variant assignment for a user/session
   */
  async getVariantAssignment(testId: string, sessionId: string, userAgent: string, ipAddress: string): Promise<ABTestAssignment | null> {
    try {
      // Check if test exists and is active
      const test = await this.getTest(testId);
      if (!test || test.status !== 'ACTIVE') {
        return null;
      }

      // Check for existing assignment
      const existingAssignment = await this.getExistingAssignment(testId, sessionId);
      if (existingAssignment) {
        return existingAssignment;
      }

      // Check if user should be included in test
      if (!this.shouldIncludeInTest(test, userAgent, ipAddress)) {
        return null;
      }

      // Assign variant based on traffic split
      const variant = this.assignVariant(test, sessionId);
      if (!variant) {
        return null;
      }

      // Create assignment record
      const assignment: ABTestAssignment = {
        testId,
        variantId: variant.id,
        sessionId,
        timestamp: new Date().toISOString(),
        userAgent,
        ipAddress
      };

      // Save assignment
      await this.saveAssignment(assignment);

      // Track impression
      await this.trackEvent({
        testId,
        variantId: variant.id,
        sessionId,
        eventType: 'IMPRESSION',
        timestamp: new Date().toISOString()
      });

      return assignment;
    } catch (error) {
      logger.error('Failed to get variant assignment', 'MARKETING', error as Error);
      return null;
    }
  }

  /**
   * Track A/B test event
   */
  async trackEvent(event: ABTestEvent): Promise<void> {
    try {
      // Save event to database
      await this.saveEvent(event);

      // Update variant performance metrics
      await this.updateVariantPerformance(event);

      // Check for statistical significance
      if (event.eventType === 'CONVERSION') {
        await this.checkStatisticalSignificance(event.testId);
      }

      logger.info('A/B test event tracked', 'MARKETING', {
        testId: event.testId,
        variantId: event.variantId,
        eventType: event.eventType,
        value: event.value
      });
    } catch (error) {
      logger.error('Failed to track A/B test event', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Get test results and analysis
   */
  async getTestResults(testId: string): Promise<ABTestResults | null> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        return null;
      }

      // Calculate performance metrics for each variant
      const variantResults: { [variantId: string]: any } = {};
      
      for (const variant of test.variants) {
        const performance = await this.calculateVariantPerformance(testId, variant.id);
        const confidenceInterval = this.calculateConfidenceInterval(performance, test.metrics.confidenceLevel);
        
        variantResults[variant.id] = {
          performance,
          confidenceInterval
        };
      }

      // Determine winner and significance
      const statisticalAnalysis = this.performStatisticalAnalysis(test, variantResults);

      const results: ABTestResults = {
        winner: statisticalAnalysis.winner,
        confidence: statisticalAnalysis.confidence,
        pValue: statisticalAnalysis.pValue,
        effect: statisticalAnalysis.effect,
        significance: statisticalAnalysis.significance,
        recommendation: this.generateRecommendation(test, statisticalAnalysis),
        detailedResults: variantResults
      };

      // Update test with results
      await this.updateTestResults(testId, results);

      return results;
    } catch (error) {
      logger.error('Failed to get test results', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Start an A/B test
   */
  async startTest(testId: string): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (test.status !== 'DRAFT') {
        throw new Error('Test must be in DRAFT status to start');
      }

      // Update test status
      await this.updateTestStatus(testId, 'ACTIVE');

      logger.info('A/B test started', 'MARKETING', {
        testId,
        name: test.name,
        variants: test.variants.length
      });

      // Send alert
      await this.alertManager.sendAlert({
        type: 'AB_TEST_STARTED',
        severity: 'INFO',
        message: `A/B test "${test.name}" has been started`,
        metadata: { testId, testName: test.name }
      });
    } catch (error) {
      logger.error('Failed to start A/B test', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Stop an A/B test
   */
  async stopTest(testId: string, reason?: string): Promise<void> {
    try {
      const test = await this.getTest(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      // Get final results
      const results = await this.getTestResults(testId);

      // Update test status
      await this.updateTestStatus(testId, 'COMPLETED', reason);

      logger.info('A/B test stopped', 'MARKETING', {
        testId,
        name: test.name,
        reason,
        winner: results?.winner
      });

      // Send alert with results
      await this.alertManager.sendAlert({
        type: 'AB_TEST_COMPLETED',
        severity: 'INFO',
        message: `A/B test "${test.name}" completed. Winner: ${results?.winner || 'No clear winner'}`,
        metadata: { 
          testId, 
          testName: test.name, 
          winner: results?.winner,
          effect: results?.effect,
          confidence: results?.confidence
        }
      });
    } catch (error) {
      logger.error('Failed to stop A/B test', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Get all active tests for a page
   */
  async getActiveTestsForPage(page: string): Promise<ABTest[]> {
    try {
      // In production, this would query the database
      // For now, return mock data
      return [];
    } catch (error) {
      logger.error('Failed to get active tests for page', 'MARKETING', error as Error);
      throw error;
    }
  }

  /**
   * Create predefined landing page tests
   */
  async createLandingPageTests(): Promise<ABTest[]> {
    const tests: ABTest[] = [];

    // Test 1: Value Proposition Test
    const valuePropositionTest = await this.createTest({
      name: 'Houston Mobile Notary - Value Proposition Test',
      description: 'Test different value propositions for mobile notary services',
      type: 'VALUE_PROPOSITION',
      status: 'DRAFT',
      startDate: new Date().toISOString(),
      targetPage: '/lp/google-loan-signing',
      trafficSplit: 50,
      variants: [
        {
          id: 'control',
          name: 'Control - Current Value Prop',
          isControl: true,
          trafficAllocation: 50,
          configuration: {
            headline: 'Professional Mobile Notary Services',
            subheadline: 'Convenient, reliable notarization at your location',
            valueProposition: 'Save time with our mobile notary service. We come to you!'
          },
          performance: this.getEmptyPerformance()
        },
        {
          id: 'variant_a',
          name: 'Variant A - Time-Focused',
          isControl: false,
          trafficAllocation: 50,
          configuration: {
            headline: 'Skip the Trip - We Come to You',
            subheadline: 'Professional notary services at your location in 30 minutes',
            valueProposition: 'No more waiting in lines or driving across town. Get documents notarized in under 30 minutes.'
          },
          performance: this.getEmptyPerformance()
        }
      ],
      metrics: {
        primaryMetric: 'CONVERSION_RATE',
        secondaryMetrics: ['CTR', 'FORM_COMPLETION'],
        minimumSampleSize: 1000,
        minimumDetectableEffect: 10,
        confidenceLevel: 0.95,
        statisticalPower: 0.8
      },
      settings: {
        autoOptimize: false,
        autoStop: true,
        excludeReturningVisitors: false,
        deviceTargeting: 'all'
      }
    });

    tests.push(valuePropositionTest);

    // Test 2: CTA Button Test
    const ctaButtonTest = await this.createTest({
      name: 'Houston Mobile Notary - CTA Button Test',
      description: 'Test different call-to-action button styles and text',
      type: 'CTA_BUTTON',
      status: 'DRAFT',
      startDate: new Date().toISOString(),
      targetPage: '/lp/facebook-campaign',
      trafficSplit: 50,
      variants: [
        {
          id: 'control',
          name: 'Control - Standard CTA',
          isControl: true,
          trafficAllocation: 33,
          configuration: {
            ctaText: 'Get Quote Now',
            ctaColor: '#A52A2A',
            ctaSize: 'medium'
          },
          performance: this.getEmptyPerformance()
        },
        {
          id: 'variant_a',
          name: 'Variant A - Urgent CTA',
          isControl: false,
          trafficAllocation: 33,
          configuration: {
            ctaText: 'Book Now - Available Today',
            ctaColor: '#FF6B35',
            ctaSize: 'large'
          },
          performance: this.getEmptyPerformance()
        },
        {
          id: 'variant_b',
          name: 'Variant B - Value CTA',
          isControl: false,
          trafficAllocation: 34,
          configuration: {
            ctaText: 'Save Time - Book Mobile Notary',
            ctaColor: '#2E8B57',
            ctaSize: 'large'
          },
          performance: this.getEmptyPerformance()
        }
      ],
      metrics: {
        primaryMetric: 'CTR',
        secondaryMetrics: ['CONVERSION_RATE', 'FORM_COMPLETION'],
        minimumSampleSize: 1500,
        minimumDetectableEffect: 15,
        confidenceLevel: 0.95,
        statisticalPower: 0.8
      },
      settings: {
        autoOptimize: true,
        autoStop: true,
        excludeReturningVisitors: false,
        deviceTargeting: 'all'
      }
    });

    tests.push(ctaButtonTest);

    // Test 3: Form Layout Test
    const formLayoutTest = await this.createTest({
      name: 'Houston Mobile Notary - Form Layout Test',
      description: 'Test different form layouts and field configurations',
      type: 'FORM',
      status: 'DRAFT',
      startDate: new Date().toISOString(),
      targetPage: '/lp/linkedin-b2b-solutions',
      trafficSplit: 50,
      variants: [
        {
          id: 'control',
          name: 'Control - Standard Form',
          isControl: true,
          trafficAllocation: 50,
          configuration: {
            form: {
              fields: ['firstName', 'lastName', 'email', 'phone', 'company'],
              layout: 'vertical',
              buttonText: 'Request Quote'
            }
          },
          performance: this.getEmptyPerformance()
        },
        {
          id: 'variant_a',
          name: 'Variant A - Minimal Form',
          isControl: false,
          trafficAllocation: 50,
          configuration: {
            form: {
              fields: ['name', 'email', 'phone'],
              layout: 'horizontal',
              buttonText: 'Get Started'
            }
          },
          performance: this.getEmptyPerformance()
        }
      ],
      metrics: {
        primaryMetric: 'FORM_COMPLETION',
        secondaryMetrics: ['CONVERSION_RATE', 'CTR'],
        minimumSampleSize: 800,
        minimumDetectableEffect: 20,
        confidenceLevel: 0.95,
        statisticalPower: 0.8
      },
      settings: {
        autoOptimize: false,
        autoStop: true,
        excludeReturningVisitors: false,
        deviceTargeting: 'all'
      }
    });

    tests.push(formLayoutTest);

    return tests;
  }

  // Private helper methods

  private validateTestConfiguration(test: ABTest): void {
    // Validate traffic allocation adds up to 100%
    const totalAllocation = test.variants.reduce((sum, variant) => sum + variant.trafficAllocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error('Variant traffic allocation must add up to 100%');
    }

    // Validate at least one control variant
    const hasControl = test.variants.some(variant => variant.isControl);
    if (!hasControl) {
      throw new Error('At least one variant must be marked as control');
    }

    // Validate minimum sample size
    if (test.metrics.minimumSampleSize < 100) {
      throw new Error('Minimum sample size must be at least 100');
    }
  }

  private shouldIncludeInTest(test: ABTest, userAgent: string, ipAddress: string): boolean {
    // Check device targeting
    if (test.settings.deviceTargeting) {
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
      if (test.settings.deviceTargeting === 'mobile' && !isMobile) {
        return false;
      }
      if (test.settings.deviceTargeting === 'desktop' && isMobile) {
        return false;
      }
    }

    // Additional targeting logic would go here
    return true;
  }

  private assignVariant(test: ABTest, sessionId: string): ABTestVariant | null {
    // Use session ID to determine if user should be in test
    const hash = this.hashString(sessionId);
    const testThreshold = test.trafficSplit / 100;
    
    if (hash > testThreshold) {
      return null; // User not in test
    }

    // Assign variant based on traffic allocation
    const variantHash = this.hashString(sessionId + test.id);
    let cumulativeAllocation = 0;
    
    for (const variant of test.variants) {
      cumulativeAllocation += variant.trafficAllocation / 100;
      if (variantHash <= cumulativeAllocation) {
        return variant;
      }
    }

    return test.variants[0]; // Fallback to first variant
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private getEmptyPerformance(): VariantPerformance {
    return {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      ctr: 0,
      conversionRate: 0,
      revenuePerVisitor: 0,
      bounceRate: 0,
      timeOnPage: 0
    };
  }

  private performStatisticalAnalysis(test: ABTest, variantResults: any): any {
    // Simplified statistical analysis
    // In production, this would use proper statistical tests
    
    const control = test.variants.find(v => v.isControl);
    if (!control) {
      return {
        winner: null,
        confidence: 0,
        pValue: 1,
        effect: 0,
        significance: 'INCONCLUSIVE'
      };
    }

    const controlResults = variantResults[control.id];
    let bestVariant = control;
    let bestPerformance = controlResults.performance[test.metrics.primaryMetric.toLowerCase()];

    // Find best performing variant
    for (const variant of test.variants) {
      if (variant.isControl) continue;
      
      const variantPerformance = variantResults[variant.id].performance[test.metrics.primaryMetric.toLowerCase()];
      if (variantPerformance > bestPerformance) {
        bestVariant = variant;
        bestPerformance = variantPerformance;
      }
    }

    // Calculate improvement
    const controlPerformance = controlResults.performance[test.metrics.primaryMetric.toLowerCase()];
    const effect = ((bestPerformance - controlPerformance) / controlPerformance) * 100;

    return {
      winner: bestVariant.id,
      confidence: 0.95, // Mock confidence
      pValue: 0.05, // Mock p-value
      effect,
      significance: effect > test.metrics.minimumDetectableEffect ? 'SIGNIFICANT' : 'NOT_SIGNIFICANT'
    };
  }

  private generateRecommendation(test: ABTest, analysis: any): string {
    if (analysis.significance === 'SIGNIFICANT') {
      return `Implement ${analysis.winner} variant. It shows a ${analysis.effect.toFixed(1)}% improvement over control.`;
    } else if (analysis.significance === 'NOT_SIGNIFICANT') {
      return 'No significant difference found. Consider running test longer or trying different variations.';
    } else {
      return 'Results are inconclusive. Consider collecting more data or revising test design.';
    }
  }

  private calculateConfidenceInterval(performance: VariantPerformance, confidenceLevel: number): { lower: number; upper: number } {
    // Simplified confidence interval calculation
    const margin = 0.05; // 5% margin of error
    const rate = performance.conversionRate / 100;
    
    return {
      lower: Math.max(0, rate - margin),
      upper: Math.min(1, rate + margin)
    };
  }

  // Database operations (mocked for now)
  private async saveTest(test: ABTest): Promise<void> {
    logger.info('Saving A/B test', 'MARKETING', { testId: test.id });
  }

  private async getTest(testId: string): Promise<ABTest | null> {
    // Mock implementation
    return null;
  }

  private async saveAssignment(assignment: ABTestAssignment): Promise<void> {
    logger.info('Saving A/B test assignment', 'MARKETING', { testId: assignment.testId });
  }

  private async getExistingAssignment(testId: string, sessionId: string): Promise<ABTestAssignment | null> {
    // Mock implementation
    return null;
  }

  private async saveEvent(event: ABTestEvent): Promise<void> {
    logger.info('Saving A/B test event', 'MARKETING', { testId: event.testId, eventType: event.eventType });
  }

  private async updateVariantPerformance(event: ABTestEvent): Promise<void> {
    logger.info('Updating variant performance', 'MARKETING', { testId: event.testId, variantId: event.variantId });
  }

  private async calculateVariantPerformance(testId: string, variantId: string): Promise<VariantPerformance> {
    // Mock performance data
    return this.getEmptyPerformance();
  }

  private async checkStatisticalSignificance(testId: string): Promise<void> {
    // Check if test has reached statistical significance
    const results = await this.getTestResults(testId);
    if (results && results.significance === 'SIGNIFICANT') {
      const test = await this.getTest(testId);
      if (test?.settings.autoStop) {
        await this.stopTest(testId, 'Statistical significance reached');
      }
    }
  }

  private async updateTestResults(testId: string, results: ABTestResults): Promise<void> {
    logger.info('Updating test results', 'MARKETING', { testId, winner: results.winner });
  }

  private async updateTestStatus(testId: string, status: ABTest['status'], reason?: string): Promise<void> {
    logger.info('Updating test status', 'MARKETING', { testId, status, reason });
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService(); 