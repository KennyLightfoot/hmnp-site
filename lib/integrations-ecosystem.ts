/**
 * Integration Ecosystem & API Marketplace
 * Provides comprehensive third-party integrations and partner API management
 */

import { logger } from './logger';
import { cache, cacheTTL } from './cache';
import { prisma } from './prisma';

export interface Integration {
  integrationId: string;
  name: string;
  category: 'CRM' | 'PAYMENT' | 'COMMUNICATION' | 'ANALYTICS' | 'PRODUCTIVITY' | 'COMPLIANCE';
  provider: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR';
  configuration: IntegrationConfig;
  capabilities: IntegrationCapability[];
  usage: IntegrationUsage;
  healthStatus: IntegrationHealth;
}

export interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  customSettings: Record<string, any>;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  authentication: {
    type: 'API_KEY' | 'OAUTH2' | 'JWT' | 'BASIC_AUTH';
    tokenUrl?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
}

export interface IntegrationCapability {
  capabilityId: string;
  name: string;
  description: string;
  methods: string[];
  dataFlow: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
  realTime: boolean;
  batchSupported: boolean;
}

export interface IntegrationUsage {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  dailyUsage: Record<string, number>;
  errorRate: number;
  lastUsed: Date;
}

export interface IntegrationHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptime: number;
  lastHealthCheck: Date;
  issues: HealthIssue[];
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
}

export interface HealthIssue {
  issueId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  impact: string;
}

export interface APIEndpoint {
  endpointId: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  authentication: boolean;
  rateLimit: number;
  requestSchema: any;
  responseSchema: any;
  examples: EndpointExample[];
  usage: EndpointUsage;
}

export interface EndpointExample {
  name: string;
  description: string;
  request: any;
  response: any;
}

export interface EndpointUsage {
  totalCalls: number;
  uniqueClients: number;
  averageResponseTime: number;
  errorRate: number;
  popularParameters: Record<string, number>;
}

export interface Partner {
  partnerId: string;
  name: string;
  type: 'TECHNOLOGY' | 'REFERRAL' | 'RESELLER' | 'AFFILIATE';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  apiAccess: PartnerAPIAccess;
  integration: Integration;
  performance: PartnerPerformance;
}

export interface PartnerAPIAccess {
  apiKey: string;
  permissions: string[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  allowedEndpoints: string[];
  ipWhitelist?: string[];
}

export interface PartnerPerformance {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  revenue: number;
  referrals: number;
  satisfaction: number;
}

class IntegrationEcosystem {
  private integrations = new Map<string, Integration>();
  private partners = new Map<string, Partner>();

  /**
   * Initialize integration ecosystem
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing integration ecosystem', 'INTEGRATIONS');

      // Load existing integrations
      await this.loadIntegrations();
      
      // Setup default integrations
      await this.setupDefaultIntegrations();
      
      // Health check all integrations
      await this.performHealthChecks();

      logger.info('Integration ecosystem initialized', 'INTEGRATIONS', {
        integrationCount: this.integrations.size,
        partnerCount: this.partners.size
      });
    } catch (error) {
      logger.error('Integration ecosystem initialization error', 'INTEGRATIONS', error as Error);
    }
  }

  /**
   * Add new integration
   */
  async addIntegration(integrationData: Partial<Integration>): Promise<Integration> {
    try {
      const integration: Integration = {
        integrationId: integrationData.integrationId || this.generateId('int'),
        name: integrationData.name || 'Unknown Integration',
        category: integrationData.category || 'PRODUCTIVITY',
        provider: integrationData.provider || 'Unknown',
        status: 'INACTIVE',
        configuration: integrationData.configuration || this.getDefaultConfig(),
        capabilities: integrationData.capabilities || [],
        usage: this.getDefaultUsage(),
        healthStatus: this.getDefaultHealth()
      };

      // Test integration connection
      const connectionTest = await this.testIntegrationConnection(integration);
      if (connectionTest.success) {
        integration.status = 'ACTIVE';
      } else {
        integration.status = 'ERROR';
        integration.healthStatus.issues.push({
          issueId: this.generateId('issue'),
          severity: 'HIGH',
          description: `Connection test failed: ${connectionTest.error}`,
          detectedAt: new Date(),
          impact: 'Integration cannot be used'
        });
      }

      // Store integration
      this.integrations.set(integration.integrationId, integration);
      
      // Cache integration data
      await cache.set(`integration:${integration.integrationId}`, integration, {
        ttl: cacheTTL.long,
        tags: ['integrations']
      });

      logger.info('Integration added', 'INTEGRATIONS', {
        integrationId: integration.integrationId,
        name: integration.name,
        status: integration.status
      });

      return integration;
    } catch (error) {
      logger.error('Add integration error', 'INTEGRATIONS', error as Error);
      throw error;
    }
  }

  /**
   * Execute integration request
   */
  async executeIntegrationRequest(
    integrationId: string,
    capability: string,
    payload: any,
    options: {
      timeout?: number;
      retries?: number;
      async?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    responseTime: number;
    requestId: string;
  }> {
    const startTime = Date.now();
    const requestId = this.generateId('req');

    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error(`Integration ${integrationId} not found`);
      }

      if (integration.status !== 'ACTIVE') {
        throw new Error(`Integration ${integrationId} is not active`);
      }

      // Check rate limits
      const rateLimitCheck = await this.checkRateLimit(integration);
      if (!rateLimitCheck.allowed) {
        throw new Error('Rate limit exceeded');
      }

      // Find capability
      const capabilityConfig = integration.capabilities.find(c => c.capabilityId === capability);
      if (!capabilityConfig) {
        throw new Error(`Capability ${capability} not found`);
      }

      // Execute request based on integration type
      const result = await this.executeRequest(integration, capabilityConfig, payload, options);

      // Update usage statistics
      await this.updateUsageStats(integrationId, true, Date.now() - startTime);

      return {
        success: true,
        data: result,
        responseTime: Date.now() - startTime,
        requestId
      };
    } catch (error) {
      // Update usage statistics for failed request
      await this.updateUsageStats(integrationId, false, Date.now() - startTime);

      logger.error('Integration request error', 'INTEGRATIONS', error as Error, {
        integrationId,
        capability,
        requestId
      });

      return {
        success: false,
        error: (error as Error).message,
        responseTime: Date.now() - startTime,
        requestId
      };
    }
  }

  /**
   * Register new partner
   */
  async registerPartner(partnerData: Partial<Partner>): Promise<Partner> {
    try {
      const apiKey = this.generateAPIKey();
      
      const partner: Partner = {
        partnerId: partnerData.partnerId || this.generateId('partner'),
        name: partnerData.name || 'Unknown Partner',
        type: partnerData.type || 'TECHNOLOGY',
        status: 'PENDING',
        apiAccess: {
          apiKey,
          permissions: partnerData.apiAccess?.permissions || ['read:bookings', 'read:services'],
          rateLimits: partnerData.apiAccess?.rateLimits || {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          allowedEndpoints: partnerData.apiAccess?.allowedEndpoints || ['/api/public/*'],
          ipWhitelist: partnerData.apiAccess?.ipWhitelist
        },
        integration: {} as Integration, // Temporary placeholder
        performance: {
          totalRequests: 0,
          successRate: 100,
          averageResponseTime: 0,
          revenue: 0,
          referrals: 0,
          satisfaction: 0
        }
      };

      // Now create the integration with the fully defined partner
      partner.integration = await this.createPartnerIntegration(partner);

      // Store partner
      this.partners.set(partner.partnerId, partner);
      
      // Cache partner data
      await cache.set(`partner:${partner.partnerId}`, partner, {
        ttl: cacheTTL.long,
        tags: ['partners']
      });

      logger.info('Partner registered', 'INTEGRATIONS', {
        partnerId: partner.partnerId,
        name: partner.name,
        type: partner.type
      });

      return partner;
    } catch (error) {
      logger.error('Partner registration error', 'INTEGRATIONS', error as Error);
      throw error;
    }
  }

  /**
   * Get integration ecosystem status
   */
  async getEcosystemStatus(): Promise<{
    integrations: Array<{
      id: string;
      name: string;
      status: string;
      health: string;
      usage: number;
    }>;
    partners: Array<{
      id: string;
      name: string;
      status: string;
      performance: number;
    }>;
    systemHealth: {
      overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
      activeIntegrations: number;
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
    };
  }> {
    try {
      const integrationStatus = Array.from(this.integrations.values()).map(integration => ({
        id: integration.integrationId,
        name: integration.name,
        status: integration.status,
        health: integration.healthStatus.status,
        usage: integration.usage.totalRequests
      }));

      const partnerStatus = Array.from(this.partners.values()).map(partner => ({
        id: partner.partnerId,
        name: partner.name,
        status: partner.status,
        performance: partner.performance.successRate
      }));

      // Calculate system health
      const activeIntegrations = integrationStatus.filter(i => i.status === 'ACTIVE').length;
      const totalRequests = integrationStatus.reduce((sum, i) => sum + i.usage, 0);
      const healthyIntegrations = integrationStatus.filter(i => i.health === 'HEALTHY').length;
      
      let overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
      if (healthyIntegrations / integrationStatus.length < 0.5) {
        overallHealth = 'UNHEALTHY';
      } else if (healthyIntegrations / integrationStatus.length < 0.8) {
        overallHealth = 'DEGRADED';
      }

      return {
        integrations: integrationStatus,
        partners: partnerStatus,
        systemHealth: {
          overallHealth,
          activeIntegrations,
          totalRequests,
          averageResponseTime: 250, // Mock data
          errorRate: 0.02
        }
      };
    } catch (error) {
      logger.error('Ecosystem status error', 'INTEGRATIONS', error as Error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async loadIntegrations(): Promise<void> {
    // Load integrations from database or cache
    // This is a mock implementation - in a real app, you'd load from database
    // For now, we'll just set up default integrations
    await this.setupDefaultIntegrations();
  }

  private async setupDefaultIntegrations(): Promise<void> {
    const defaultIntegrations = [
      {
        name: 'GoHighLevel CRM',
        category: 'CRM' as const,
        provider: 'GoHighLevel',
        capabilities: [
          {
            capabilityId: 'create-contact',
            name: 'Create Contact',
            description: 'Create a new contact in GHL',
            methods: ['POST'],
            dataFlow: 'OUTBOUND' as const,
            realTime: true,
            batchSupported: true
          }
        ]
      },
      {
        name: 'Stripe Payments',
        category: 'PAYMENT' as const,
        provider: 'Stripe',
        capabilities: [
          {
            capabilityId: 'create-payment',
            name: 'Create Payment Intent',
            description: 'Create a payment intent for booking',
            methods: ['POST'],
            dataFlow: 'OUTBOUND' as const,
            realTime: true,
            batchSupported: false
          }
        ]
      },
      {
        name: 'Twilio SMS',
        category: 'COMMUNICATION' as const,
        provider: 'Twilio',
        capabilities: [
          {
            capabilityId: 'send-sms',
            name: 'Send SMS',
            description: 'Send SMS notifications',
            methods: ['POST'],
            dataFlow: 'OUTBOUND' as const,
            realTime: true,
            batchSupported: true
          }
        ]
      }
    ];

    for (const integrationData of defaultIntegrations) {
      const existingIntegration = Array.from(this.integrations.values())
        .find(i => i.name === integrationData.name);
      
      if (!existingIntegration) {
        await this.addIntegration(integrationData);
      }
    }
  }

  private async performHealthChecks(): Promise<void> {
    const healthChecks = Array.from(this.integrations.values()).map(async (integration) => {
      try {
        const health = await this.checkIntegrationHealth(integration);
        integration.healthStatus = health;
        integration.healthStatus.lastHealthCheck = new Date();
      } catch (error) {
        integration.healthStatus.status = 'UNHEALTHY';
        integration.healthStatus.issues.push({
          issueId: this.generateId('issue'),
          severity: 'HIGH',
          description: `Health check failed: ${(error as Error).message}`,
          detectedAt: new Date(),
          impact: 'Integration may not be functioning properly'
        });
      }
    });

    await Promise.all(healthChecks);
  }

  private async testIntegrationConnection(integration: Integration): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Mock connection test - replace with actual implementation
      if (integration.name.includes('Test')) {
        return { success: false, error: 'Test integration always fails' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async checkIntegrationHealth(integration: Integration): Promise<IntegrationHealth> {
    // Mock health check - replace with actual implementation
    return {
      status: 'HEALTHY',
      uptime: 99.9,
      lastHealthCheck: new Date(),
      issues: [],
      performance: {
        responseTime: 250,
        throughput: 100,
        errorRate: 0.01
      }
    };
  }

  private async checkRateLimit(integration: Integration): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const key = `ratelimit:integration:${integration.integrationId}`;
    const current = await cache.increment(key, 60); // 1 minute window
    const limit = integration.configuration.rateLimits.requestsPerMinute;

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime: new Date(Date.now() + 60 * 1000)
    };
  }

  private async executeRequest(
    integration: Integration,
    capability: IntegrationCapability,
    payload: any,
    options: any
  ): Promise<any> {
    // Mock request execution - replace with actual implementation
    const delay = options.timeout || 1000;
    await new Promise(resolve => setTimeout(resolve, Math.random() * delay));
    
    return {
      success: true,
      data: { message: 'Mock response from integration', payload },
      timestamp: new Date()
    };
  }

  private async updateUsageStats(
    integrationId: string,
    success: boolean,
    responseTime: number
  ): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) return;

    integration.usage.totalRequests++;
    integration.usage.lastUsed = new Date();
    
    if (success) {
      integration.usage.successfulRequests++;
    } else {
      integration.usage.failedRequests++;
    }

    // Update average response time
    integration.usage.averageResponseTime = 
      (integration.usage.averageResponseTime + responseTime) / 2;

    // Update error rate
    integration.usage.errorRate = 
      integration.usage.failedRequests / integration.usage.totalRequests;

    // Cache updated usage
    await cache.set(`integration:${integrationId}`, integration, {
      ttl: cacheTTL.long,
      tags: ['integrations']
    });
  }

  private async createPartnerIntegration(partner: Partial<Partner>): Promise<Integration> {
    return {
      integrationId: this.generateId('partner-int'),
      name: `${partner.name} API Integration`,
      category: 'PRODUCTIVITY',
      provider: 'Partner',
      status: 'ACTIVE',
      configuration: this.getDefaultConfig(),
      capabilities: [
        {
          capabilityId: 'partner-webhook',
          name: 'Partner Webhook',
          description: 'Receive webhooks from partner',
          methods: ['POST'],
          dataFlow: 'INBOUND',
          realTime: true,
          batchSupported: false
        }
      ],
      usage: this.getDefaultUsage(),
      healthStatus: this.getDefaultHealth()
    };
  }

  private getDefaultConfig(): IntegrationConfig {
    return {
      customSettings: {},
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      authentication: {
        type: 'API_KEY'
      }
    };
  }

  private getDefaultUsage(): IntegrationUsage {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      dailyUsage: {},
      errorRate: 0,
      lastUsed: new Date()
    };
  }

  private getDefaultHealth(): IntegrationHealth {
    return {
      status: 'HEALTHY',
      uptime: 100,
      lastHealthCheck: new Date(),
      issues: [],
      performance: {
        responseTime: 0,
        throughput: 0,
        errorRate: 0
      }
    };
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAPIKey(): string {
    return `hmnp_${Math.random().toString(36).substr(2, 32)}`;
  }
}

export const integrationEcosystem = new IntegrationEcosystem(); 