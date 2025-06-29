/**
 * Enhanced Stripe Webhook Processing
 * Features: Exponential backoff, comprehensive error handling, monitoring, alerting
 */

import type Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';
import { BookingStatus } from '@prisma/client';
import * as ghl from '@/lib/ghl';

const webhookEnhancedLogger = logger.forService('StripeWebhookEnhanced');

export interface WebhookProcessingResult {
  success: boolean;
  eventId: string;
  processed: boolean;
  skipped: boolean;
  error?: string;
  retryCount?: number;
  processingTimeMs?: number;
}

export interface WebhookMetrics {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  errorRate: number;
  retryRate: number;
}

export class EnhancedStripeWebhookProcessor {
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY_MS = 1000; // 1 second
  private static readonly MAX_DELAY_MS = 10000; // 10 seconds
  private static readonly IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours

  /**
   * Process Stripe webhook with enhanced error handling and retry logic
   */
  static async processWebhook(
    event: Stripe.Event,
    processor: (data: any, eventId: string) => Promise<void>
  ): Promise<WebhookProcessingResult> {
    const startTime = Date.now();
    const eventId = event.id;
    
    // Memory leak prevention: Create sanitized event copy with only essential data
    const sanitizedEventData = {
      id: event.id,
      type: event.type,
      created: event.created,
      // Only include essential data to prevent large object retention
      data: {
        object: {
          id: event.data.object?.id,
          object: event.data.object?.object,
          // Add other essential fields as needed, but avoid deep copying large objects
        }
      }
    };
    
    webhookEnhancedLogger.info('Processing Stripe webhook', {
      eventId,
      eventType: event.type,
      created: new Date(event.created * 1000),
    });

    try {
      // Check for duplicate/already processed events
      const isDuplicate = await this.checkAndMarkEventProcessing(eventId);
      if (isDuplicate) {
        webhookEnhancedLogger.info('Event already processed, skipping', { eventId });
        return {
          success: true,
          eventId,
          processed: false,
          skipped: true,
          processingTimeMs: Date.now() - startTime,
        };
      }

      // Process with retry logic - use original event for processing
      const result = await this.processWithRetry(event, processor);
      
      // Mark as successfully processed
      await this.markEventCompleted(eventId, true);
      
      // Record metrics
      await this.recordMetrics(event.type, true, Date.now() - startTime, result.retryCount || 0);
      
      webhookEnhancedLogger.info('Webhook processed successfully', {
        eventId,
        eventType: event.type,
        processingTimeMs: Date.now() - startTime,
        retryCount: result.retryCount,
      });

      // Clear event data references to prevent memory leaks
      this.clearEventReferences(event);

      return {
        success: true,
        eventId,
        processed: true,
        skipped: false,
        processingTimeMs: Date.now() - startTime,
        retryCount: result.retryCount,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Mark as failed
      await this.markEventCompleted(eventId, false, errorMessage);
      
      // Record failure metrics
      await this.recordMetrics(event.type, false, Date.now() - startTime, this.MAX_RETRIES);
      
      // Send alert for critical errors - use sanitized data to prevent memory leaks
      await this.sendErrorAlert(sanitizedEventData as any, error);
      
      webhookEnhancedLogger.error('Webhook processing failed after all retries', {
        eventId,
        eventType: event.type,
        error: errorMessage,
        processingTimeMs: Date.now() - startTime,
      });

      // Clear event data references to prevent memory leaks
      this.clearEventReferences(event);

      return {
        success: false,
        eventId,
        processed: false,
        skipped: false,
        error: errorMessage,
        processingTimeMs: Date.now() - startTime,
        retryCount: this.MAX_RETRIES,
      };
    }
  }

  /**
   * Process webhook with exponential backoff retry logic
   */
  private static async processWithRetry(
    event: Stripe.Event,
    processor: (data: any, eventId: string) => Promise<void>
  ): Promise<{ retryCount: number }> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await processor(event.data.object, event.id);
        return { retryCount: attempt };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        webhookEnhancedLogger.warn('Webhook processing attempt failed', {
          eventId: event.id,
          attempt: attempt + 1,
          maxRetries: this.MAX_RETRIES + 1,
          error: lastError.message,
        });

        // Don't retry on the last attempt
        if (attempt === this.MAX_RETRIES) {
          break;
        }

        // Calculate exponential backoff delay
        const delay = Math.min(
          this.BASE_DELAY_MS * Math.pow(2, attempt),
          this.MAX_DELAY_MS
        );

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;
        const totalDelay = delay + jitter;

        webhookEnhancedLogger.info('Retrying webhook processing', {
          eventId: event.id,
          attempt: attempt + 1,
          delayMs: totalDelay,
        });

        await this.sleep(totalDelay);
      }
    }

    // All retries exhausted
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Check if event is already being processed (idempotency)
   */
  private static async checkAndMarkEventProcessing(eventId: string): Promise<boolean> {
    const cacheKey = `stripe_webhook:${eventId}`;
    
    try {
      // Try to set processing flag atomically
      const wasAlreadySet = await cache.get(cacheKey);
      if (wasAlreadySet) {
        return true; // Already processing or processed
      }

      // Mark as processing
      await cache.set(cacheKey, 'processing', { ttl: this.IDEMPOTENCY_TTL });
      return false;
    } catch (error) {
      webhookEnhancedLogger.error('Failed to check event idempotency', { eventId, error });
      // On cache failure, allow processing to continue
      return false;
    }
  }

  /**
   * Mark event as completed (success or failure)
   */
  private static async markEventCompleted(
    eventId: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    const cacheKey = `stripe_webhook:${eventId}`;
    const status = success ? 'completed' : 'failed';
    
    try {
      await cache.set(cacheKey, {
        status,
        completedAt: new Date().toISOString(),
        error: errorMessage,
      }, { ttl: this.IDEMPOTENCY_TTL });
    } catch (error) {
      webhookEnhancedLogger.error('Failed to mark event as completed', { eventId, error });
    }
  }

  /**
   * Record processing metrics
   */
  private static async recordMetrics(
    eventType: string,
    success: boolean,
    processingTimeMs: number,
    retryCount: number
  ): Promise<void> {
    try {
      const metricsKey = `stripe_webhook_metrics:${eventType}`;
      const dailyKey = `stripe_webhook_daily:${new Date().toISOString().split('T')[0]}`;
      
      // Update event type specific metrics
      const currentMetrics = await cache.get<WebhookMetrics>(metricsKey) || {
        totalProcessed: 0,
        successRate: 0,
        averageProcessingTime: 0,
        errorRate: 0,
        retryRate: 0,
      };

      const newTotal = currentMetrics.totalProcessed + 1;
      const newSuccessRate = success 
        ? (currentMetrics.successRate * currentMetrics.totalProcessed + 1) / newTotal
        : (currentMetrics.successRate * currentMetrics.totalProcessed) / newTotal;
      
      const newErrorRate = !success
        ? (currentMetrics.errorRate * currentMetrics.totalProcessed + 1) / newTotal
        : (currentMetrics.errorRate * currentMetrics.totalProcessed) / newTotal;

      const newRetryRate = retryCount > 0
        ? (currentMetrics.retryRate * currentMetrics.totalProcessed + 1) / newTotal
        : (currentMetrics.retryRate * currentMetrics.totalProcessed) / newTotal;

      const newAvgTime = (currentMetrics.averageProcessingTime * currentMetrics.totalProcessed + processingTimeMs) / newTotal;

      const updatedMetrics: WebhookMetrics = {
        totalProcessed: newTotal,
        successRate: newSuccessRate,
        averageProcessingTime: newAvgTime,
        errorRate: newErrorRate,
        retryRate: newRetryRate,
      };

      await cache.set(metricsKey, updatedMetrics, { ttl: 7 * 24 * 60 * 60 }); // 7 days

      // Update daily metrics
      const dailyStats = await cache.get(dailyKey) || { total: 0, success: 0, failed: 0 };
      dailyStats.total += 1;
      if (success) {
        dailyStats.success += 1;
      } else {
        dailyStats.failed += 1;
      }
      
      await cache.set(dailyKey, dailyStats, { ttl: 30 * 24 * 60 * 60 }); // 30 days

    } catch (error) {
      webhookEnhancedLogger.error('Failed to record webhook metrics', { eventType, error });
    }
  }

  /**
   * Send error alerts for critical failures (memory-safe version)
   */
  private static async sendErrorAlert(event: Stripe.Event, error: unknown): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Memory leak prevention: Only store essential alert data
      const alertData = {
        title: 'Critical Stripe Webhook Failure',
        message: `Failed to process Stripe webhook after ${this.MAX_RETRIES} retries`,
        details: {
          eventId: event.id,
          eventType: event.type,
          error: errorMessage.substring(0, 500), // Limit error message length
          timestamp: new Date().toISOString(),
          // Store only essential event data to prevent large object retention
          eventDataId: event.data?.object?.id || 'unknown',
          eventObjectType: event.data?.object?.object || 'unknown',
        },
        severity: 'critical' as const,
        source: 'stripe-webhook',
      };

      // Log critical alert
      webhookEnhancedLogger.error('CRITICAL: Stripe webhook processing failed', alertData);

      // Store alert for monitoring dashboard with shorter TTL to prevent memory buildup
      await cache.set(
        `alert:stripe_webhook:${event.id}`,
        alertData,
        { ttl: 24 * 60 * 60 } // 24 hours instead of 7 days
      );

      // If configured, send to external monitoring service
      if (process.env.WEBHOOK_ALERT_URL) {
        await this.sendExternalAlert(alertData);
      }

    } catch (alertError) {
      webhookEnhancedLogger.error('Failed to send error alert', { alertError });
    }
  }

  /**
   * Send alert to external monitoring service
   */
  private static async sendExternalAlert(alertData: any): Promise<void> {
    try {
      const response = await fetch(process.env.WEBHOOK_ALERT_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_ALERT_TOKEN || ''}`,
        },
        body: JSON.stringify(alertData),
      });

      if (!response.ok) {
        throw new Error(`Alert service responded with ${response.status}`);
      }
    } catch (error) {
      webhookEnhancedLogger.error('Failed to send external alert', { error });
    }
  }

  /**
   * Get webhook processing metrics
   */
  static async getMetrics(eventType?: string): Promise<WebhookMetrics | Record<string, WebhookMetrics>> {
    try {
      if (eventType) {
        const metricsKey = `stripe_webhook_metrics:${eventType}`;
        return await cache.get<WebhookMetrics>(metricsKey) || {
          totalProcessed: 0,
          successRate: 0,
          averageProcessingTime: 0,
          errorRate: 0,
          retryRate: 0,
        };
      }

      // Get metrics for all event types
      const eventTypes = [
        'checkout.session.completed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'charge.refunded',
      ];

      const allMetrics: Record<string, WebhookMetrics> = {};
      
      for (const type of eventTypes) {
        const metricsKey = `stripe_webhook_metrics:${type}`;
        allMetrics[type] = await cache.get<WebhookMetrics>(metricsKey) || {
          totalProcessed: 0,
          successRate: 0,
          averageProcessingTime: 0,
          errorRate: 0,
          retryRate: 0,
        };
      }

      return allMetrics;
    } catch (error) {
      webhookEnhancedLogger.error('Failed to get webhook metrics', { error });
      return eventType ? {
        totalProcessed: 0,
        successRate: 0,
        averageProcessingTime: 0,
        errorRate: 0,
        retryRate: 0,
      } : {};
    }
  }

  /**
   * Enhanced database transaction with retry logic
   */
  static async executeWithDatabaseRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Check if it's a retryable database error
        if (this.isRetryableDatabaseError(error)) {
          const delay = Math.min(500 * Math.pow(2, attempt), 2000);
          await this.sleep(delay);
          continue;
        }

        // Non-retryable error, throw immediately
        throw error;
      }
    }

    throw new Error('Database operation failed after all retries');
  }

  /**
   * Check if database error is retryable
   */
  private static isRetryableDatabaseError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const retryablePatterns = [
      'connection',
      'timeout',
      'deadlock',
      'lock',
      'busy',
      'temporary',
    ];

    return retryablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }

  /**
   * Validate webhook event data
   */
  static validateEventData(event: Stripe.Event): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.id) {
      errors.push('Event ID is missing');
    }

    if (!event.type) {
      errors.push('Event type is missing');
    }

    if (!event.data?.object) {
      errors.push('Event data object is missing');
    }

    if (!event.created || event.created <= 0) {
      errors.push('Event creation timestamp is invalid');
    }

    // Check event age (reject events older than 1 hour)
    const eventAge = Date.now() - (event.created * 1000);
    if (eventAge > 60 * 60 * 1000) {
      errors.push('Event is too old (older than 1 hour)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear event data references to prevent memory leaks
   */
  private static clearEventReferences(event: Stripe.Event): void {
    try {
      // Clear large data objects that might cause memory leaks
      if (event.data?.object) {
        // Clear complex nested objects but preserve essential fields
        const eventObject = event.data.object as any;
        
        // Clear potential large data fields
        delete eventObject.metadata;
        delete eventObject.receipt_email;
        delete eventObject.receipt_url;
        delete eventObject.charges;
        delete eventObject.invoice;
        delete eventObject.latest_charge;
        delete eventObject.payment_method;
        delete eventObject.setup_intent;
        delete eventObject.source;
        delete eventObject.transfer_data;
        
        // Clear any custom or large nested objects
        for (const key in eventObject) {
          if (typeof eventObject[key] === 'object' && eventObject[key] !== null) {
            if (Array.isArray(eventObject[key]) && eventObject[key].length > 10) {
              // Clear large arrays
              eventObject[key] = [];
            } else if (typeof eventObject[key] === 'object' && Object.keys(eventObject[key]).length > 20) {
              // Clear objects with many properties
              eventObject[key] = { id: eventObject[key].id || null };
            }
          }
        }
      }
    } catch (error) {
      webhookEnhancedLogger.warn('Failed to clear event references', { 
        eventId: event.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Sleep utility function
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up old webhook processing records
   */
  static async cleanupOldRecords(): Promise<void> {
    try {
      // This would typically be run as a scheduled job
      webhookEnhancedLogger.info('Cleaning up old webhook processing records');
      
      // The cache TTL handles most cleanup automatically,
      // but we could add additional cleanup logic here if needed
      
    } catch (error) {
      webhookEnhancedLogger.error('Failed to cleanup old webhook records', { error });
    }
  }
}

export default EnhancedStripeWebhookProcessor;