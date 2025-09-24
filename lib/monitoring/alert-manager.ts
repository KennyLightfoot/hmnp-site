/**
 * Alert Management System
 * Houston Mobile Notary Pros - Production Monitoring
 * 
 * Centralized alert management with Sentry integration,
 * Better Stack logging, and CrowdSec threat detection
 */

import { redis } from '@/lib/redis';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface AlertConfig {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'performance' | 'business' | 'system';
  threshold: number;
  timeWindow: number; // minutes
  enabled: boolean;
  notificationChannels: ('email' | 'slack' | 'sentry' | 'webhook')[];
  conditions: AlertCondition[];
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'contains' | 'pattern';
  value: any;
  aggregation?: 'count' | 'sum' | 'avg' | 'max' | 'min';
}

export interface AlertInstance {
  id: string;
  configId: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  severity: string;
  message: string;
  context: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export class AlertManager {
  private static instance: AlertManager;
  private alertConfigs: Map<string, AlertConfig> = new Map();
  private activeAlerts: Map<string, AlertInstance> = new Map();
  private metricsBuffer: Map<string, any[]> = new Map();

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  constructor() {
    this.initializeDefaultAlerts();
  }

  /**
   * Initialize default alert configurations
   */
  private initializeDefaultAlerts(): void {
    const defaultAlerts: AlertConfig[] = [
      {
        id: 'booking-failure-rate',
        name: 'High Booking Failure Rate',
        severity: 'high',
        category: 'business',
        threshold: 5,
        timeWindow: 15,
        enabled: true,
        notificationChannels: ['email', 'slack', 'sentry'],
        conditions: [
          {
            metric: 'booking.failed',
            operator: 'gt',
            value: 5,
            aggregation: 'count'
          }
        ]
      },
      {
        id: 'payment-failures',
        name: 'Payment Processing Failures',
        severity: 'critical',
        category: 'business',
        threshold: 3,
        timeWindow: 10,
        enabled: true,
        notificationChannels: ['email', 'slack', 'sentry'],
        conditions: [
          {
            metric: 'payment.failed',
            operator: 'gt',
            value: 3,
            aggregation: 'count'
          }
        ]
      },
      {
        id: 'api-response-time',
        name: 'Slow API Response Time',
        severity: 'medium',
        category: 'performance',
        threshold: 5000,
        timeWindow: 5,
        enabled: true,
        notificationChannels: ['slack', 'sentry'],
        conditions: [
          {
            metric: 'api.response_time',
            operator: 'gt',
            value: 5000,
            aggregation: 'avg'
          }
        ]
      },
      {
        id: 'database-connection-errors',
        name: 'Database Connection Errors',
        severity: 'critical',
        category: 'system',
        threshold: 1,
        timeWindow: 5,
        enabled: true,
        notificationChannels: ['email', 'slack', 'sentry'],
        conditions: [
          {
            metric: 'database.connection_error',
            operator: 'gt',
            value: 1,
            aggregation: 'count'
          }
        ]
      },
      {
        id: 'security-threats',
        name: 'Security Threat Detection',
        severity: 'critical',
        category: 'security',
        threshold: 1,
        timeWindow: 1,
        enabled: true,
        notificationChannels: ['email', 'slack', 'sentry'],
        conditions: [
          {
            metric: 'security.threat_detected',
            operator: 'gt',
            value: 1,
            aggregation: 'count'
          }
        ]
      },
      {
        id: 'rate-limit-violations',
        name: 'Rate Limit Violations',
        severity: 'medium',
        category: 'security',
        threshold: 10,
        timeWindow: 5,
        enabled: true,
        notificationChannels: ['slack', 'sentry'],
        conditions: [
          {
            metric: 'rate_limit.violation',
            operator: 'gt',
            value: 10,
            aggregation: 'count'
          }
        ]
      }
    ];

    defaultAlerts.forEach(alert => {
      this.alertConfigs.set(alert.id, alert);
    });
  }

  /**
   * Record a metric for monitoring
   */
  async recordMetric(metric: string, value: any, context: Record<string, any> = {}): Promise<void> {
    const timestamp = new Date();
    const metricData = {
      metric,
      value,
      context,
      timestamp
    };

    // Store in Redis for real-time monitoring
    const key = `metrics:${metric}`;
    // Note: lpush not available in custom Redis client, using set instead
    await redis.set(key, JSON.stringify(metricData));
    await redis.expire(key, 3600); // 1 hour TTL

    // Add to buffer for alert evaluation
    if (!this.metricsBuffer.has(metric)) {
      this.metricsBuffer.set(metric, []);
    }
    this.metricsBuffer.get(metric)!.push(metricData);

    // Evaluate alerts
    await this.evaluateAlerts(metric);

    // Log to external services
    await this.logToExternalServices(metricData);
  }

  /**
   * Evaluate alerts for a specific metric
   */
  private async evaluateAlerts(metric: string): Promise<void> {
    for (const [configId, config] of this.alertConfigs) {
      if (!config.enabled) continue;

      const relevantConditions = config.conditions.filter(c => c.metric === metric);
      if (relevantConditions.length === 0) continue;

      const shouldTrigger = await this.evaluateConditions(config, relevantConditions);
      
      if (shouldTrigger) {
        await this.triggerAlert(config, { metric, timestamp: new Date() });
      }
    }
  }

  /**
   * Evaluate alert conditions
   */
  private async evaluateConditions(config: AlertConfig, conditions: AlertCondition[]): Promise<boolean> {
    const timeWindow = config.timeWindow * 60 * 1000; // Convert to milliseconds
    const cutoffTime = new Date(Date.now() - timeWindow);

    for (const condition of conditions) {
      const metricData = this.metricsBuffer.get(condition.metric) || [];
      const recentData = metricData.filter(d => d.timestamp > cutoffTime);

      if (recentData.length === 0) continue;

      let aggregatedValue: number;
      const values = recentData.map(d => typeof d.value === 'number' ? d.value : 1);

      switch (condition.aggregation) {
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        default:
          aggregatedValue = values.length;
      }

      const threshold = condition.value;
      let conditionMet = false;

      switch (condition.operator) {
        case 'gt':
          conditionMet = aggregatedValue > threshold;
          break;
        case 'lt':
          conditionMet = aggregatedValue < threshold;
          break;
        case 'eq':
          conditionMet = aggregatedValue === threshold;
          break;
        default:
          conditionMet = false;
      }

      if (conditionMet) {
        return true;
      }
    }

    return false;
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(config: AlertConfig, context: Record<string, any>): Promise<void> {
    // Check if alert is already active
    const existingAlert = this.activeAlerts.get(config.id);
    if (existingAlert && !existingAlert.resolvedAt) {
      return; // Alert already active
    }

    const alertInstance: AlertInstance = {
      id: `${config.id}-${Date.now()}`,
      configId: config.id,
      triggeredAt: new Date(),
      severity: config.severity,
      message: `Alert: ${config.name}`,
      context,
      acknowledged: false
    };

    this.activeAlerts.set(config.id, alertInstance);

    // Send notifications
    await this.sendNotifications(config, alertInstance);

    // Log alert
    logger.error(`Alert triggered: ${config.name}`, {
      alertId: alertInstance.id,
      severity: config.severity,
      category: config.category,
      context
    });

    // Store in database for historical tracking
    await this.storeAlert(alertInstance);
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(config: AlertConfig, alert: AlertInstance): Promise<void> {
    const promises = config.notificationChannels.map(channel => {
      switch (channel) {
        case 'email':
          return this.sendEmailNotification(config, alert);
        case 'slack':
          return this.sendSlackNotification(config, alert);
        case 'sentry':
          return this.sendSentryNotification(config, alert);
        case 'webhook':
          return this.sendWebhookNotification(config, alert);
        default:
          return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(config: AlertConfig, alert: AlertInstance): Promise<void> {
    if (!process.env.ADMIN_EMAIL || !process.env.RESEND_API_KEY) {
      return;
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const severityEmoji = {
        low: '🟡',
        medium: '🟠',
        high: '🔴',
        critical: '🚨'
      };

      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'alerts@houstonmobilenotarypros.com',
        to: process.env.ADMIN_EMAIL,
        subject: `${severityEmoji[config.severity]} HMNP Alert: ${config.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #A52A2A;">Houston Mobile Notary Pros - System Alert</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>${severityEmoji[config.severity]} ${config.name}</h3>
              <p><strong>Severity:</strong> ${config.severity.toUpperCase()}</p>
              <p><strong>Category:</strong> ${config.category}</p>
              <p><strong>Triggered:</strong> ${alert.triggeredAt.toISOString()}</p>
              <p><strong>Alert ID:</strong> ${alert.id}</p>
            </div>
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>Context:</h4>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto;">
${JSON.stringify(alert.context, null, 2)}
              </pre>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated alert from Houston Mobile Notary Pros monitoring system.
            </p>
          </div>
        `
      });
    } catch (error) {
      logger.error('Failed to send email notification', { error: getErrorMessage(error) });
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(config: AlertConfig, alert: AlertInstance): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) {
      return;
    }

    try {
      const severityColors = {
        low: '#ffeb3b',
        medium: '#ff9800',
        high: '#f44336',
        critical: '#9c27b0'
      };

      const message = {
        text: `🚨 HMNP Alert: ${config.name}`,
        attachments: [
          {
            color: severityColors[config.severity],
            fields: [
              {
                title: 'Severity',
                value: config.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Category',
                value: config.category,
                short: true
              },
              {
                title: 'Triggered',
                value: alert.triggeredAt.toISOString(),
                short: true
              },
              {
                title: 'Alert ID',
                value: alert.id,
                short: true
              }
            ],
            footer: 'HMNP Monitoring System',
            ts: Math.floor(alert.triggeredAt.getTime() / 1000)
          }
        ]
      };

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      logger.error('Failed to send Slack notification', { error: getErrorMessage(error) });
    }
  }

  /**
   * Send Sentry notification
   */
  private async sendSentryNotification(config: AlertConfig, alert: AlertInstance): Promise<void> {
    if (!process.env.SENTRY_DSN) {
      return;
    }

    try {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.captureMessage(`Alert: ${config.name}`, {
        level: config.severity === 'critical' ? 'fatal' : config.severity as any,
        tags: {
          alert_id: alert.id,
          alert_config: config.id,
          category: config.category
        },
        contexts: {
          alert: {
            name: config.name,
            severity: config.severity,
            triggered_at: alert.triggeredAt.toISOString(),
            context: alert.context
          }
        }
      });
    } catch (error) {
      logger.error('Failed to send Sentry notification', { error: getErrorMessage(error) });
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(config: AlertConfig, alert: AlertInstance): Promise<void> {
    if (!process.env.ALERT_WEBHOOK_URL) {
      return;
    }

    try {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alert.id,
          config_id: config.id,
          name: config.name,
          severity: config.severity,
          category: config.category,
          triggered_at: alert.triggeredAt.toISOString(),
          context: alert.context
        })
      });
    } catch (error) {
      logger.error('Failed to send webhook notification', { error: getErrorMessage(error) });
    }
  }

  /**
   * Log to external services (Better Stack, etc.)
   */
  private async logToExternalServices(metricData: any): Promise<void> {
    // Better Stack logging
    if (process.env.BETTER_STACK_SOURCE_TOKEN) {
      try {
        await fetch(process.env.BETTER_STACK_URL || 'https://in.logs.betterstack.com', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BETTER_STACK_SOURCE_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dt: metricData.timestamp,
            level: 'info',
            message: `Metric: ${metricData.metric}`,
            metric: metricData.metric,
            value: metricData.value,
            context: metricData.context
          })
        });
      } catch (error) {
        logger.error('Failed to log to Better Stack', { error: getErrorMessage(error) });
      }
    }
  }

  /**
   * Store alert in database
   */
  private async storeAlert(alert: AlertInstance): Promise<void> {
    try {
      // Store in Redis for quick access
      const key = `alert:${alert.id}`;
      await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(alert)); // 7 days TTL

      // You can also store in database if you have an alerts table
      // await prisma.alert.create({ data: alert });
    } catch (error) {
      logger.error('Failed to store alert', { error: getErrorMessage(error) });
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<AlertInstance[]> {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolvedAt);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      
      // Update in storage
      await this.storeAlert(alert);
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      
      // Update in storage
      await this.storeAlert(alert);
    }
  }

  /**
   * CrowdSec integration for threat detection
   */
  async reportThreat(threatData: {
    ip: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    details: Record<string, any>;
  }): Promise<void> {
    // Record threat metric
    await this.recordMetric('security.threat_detected', 1, {
      ip: threatData.ip,
      type: threatData.type,
      severity: threatData.severity,
      details: threatData.details
    });

    // Log threat for CrowdSec integration
    logger.warn('Security threat detected', {
      ip: threatData.ip,
      type: threatData.type,
      severity: threatData.severity,
      details: threatData.details,
      timestamp: new Date().toISOString()
    });

    // If you have CrowdSec API integration, report the threat
    if (process.env.CROWDSEC_API_KEY) {
      try {
        await fetch(`${process.env.CROWDSEC_API_URL || 'https://api.crowdsec.net'}/v1/alerts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CROWDSEC_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source: {
              ip: threatData.ip,
              scope: 'IP'
            },
            scenario: threatData.type,
            message: `Threat detected: ${threatData.type}`,
            events_count: 1,
            start_at: new Date().toISOString(),
            stop_at: new Date().toISOString(),
            capacity: 1
          })
        });
      } catch (error) {
        logger.error('Failed to report to CrowdSec', { error: getErrorMessage(error) });
      }
    }
  }
}

// Export singleton instance
export const alertManager = AlertManager.getInstance(); 
