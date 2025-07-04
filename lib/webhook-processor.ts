import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import Stripe from 'stripe';

// Webhook event processing statuses
export enum WebhookProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

// Webhook event log for idempotency
interface WebhookEventLog {
  id: string;
  eventId: string;
  eventType: string;
  status: WebhookProcessingStatus;
  attempts: number;
  lastAttemptAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class WebhookProcessor {
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCK_TIMEOUT_MS = 30000; // 30 seconds

  /**
   * Process webhook with generic interface (for compatibility)
   */
  async processWebhook(options: {
    source: string;
    eventId: string;
    eventType: string;
    data: any;
    rawPayload: string;
    processor: () => Promise<any>;
  }): Promise<{ success: boolean; error?: string; processingTime?: number }> {
    const startTime = Date.now();
    
    try {
      // Use the static processEvent method with a mock Stripe event
      const mockEvent = {
        id: options.eventId,
        type: options.eventType,
        data: { object: options.data }
      };

      const result = await WebhookProcessor.processEvent(
        mockEvent as any,
        async () => {
          return await options.processor();
        }
      );

      const processingTime = Date.now() - startTime;

      return {
        success: result.success,
        error: result.error,
        processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      };
    }
  }

  /**
   * Process a Stripe webhook event with idempotency and race condition protection
   */
  static async processEvent<T>(
    event: Stripe.Event,
    processor: (eventData: T, eventId: string) => Promise<void>
  ): Promise<{ success: boolean; skipped: boolean; error?: string }> {
    const eventId = event.id;
    const eventType = event.type;
    
    console.log(`🎯 Processing webhook event: ${eventType} (${eventId})`);

    try {
      // Step 1: Check if event was already processed (idempotency)
      const existingEvent = await prisma.systemLog.findUnique({
        where: { 
          id: `webhook_${eventId}` 
        }
      });

      if (existingEvent) {
        if (existingEvent.level === 'INFO' && existingEvent.message.includes('COMPLETED')) {
          console.log(`✅ Event ${eventId} already processed successfully, skipping`);
          return { success: true, skipped: true };
        }
        
        if (existingEvent.level === 'ERROR') {
          console.log(`⚠️ Event ${eventId} previously failed, retrying...`);
        }
      }

      // Step 2: Create/update event log with PROCESSING status (acts as a lock)
      const eventLog = await prisma.systemLog.upsert({
        where: { id: `webhook_${eventId}` },
        update: {
          level: 'WARN', // PROCESSING status
          message: `PROCESSING webhook ${eventType}`,
          metadata: {
            eventType,
            attempts: existingEvent ? (existingEvent.metadata as any)?.attempts + 1 || 1 : 1,
            lastAttemptAt: new Date().toISOString(),
            processingStartedAt: new Date().toISOString()
          }
        },
        create: {
          id: `webhook_${eventId}`,
          level: 'WARN', // PROCESSING status
          message: `PROCESSING webhook ${eventType}`,
          source: 'stripe_webhook',
          metadata: {
            eventId,
            eventType,
            attempts: 1,
            lastAttemptAt: new Date().toISOString(),
            processingStartedAt: new Date().toISOString()
          }
        }
      });

      // Step 3: Check if we've exceeded max attempts
      const attempts = (eventLog.metadata as any)?.attempts || 1;
      if (attempts > this.MAX_ATTEMPTS) {
        console.error(`❌ Event ${eventId} exceeded max attempts (${this.MAX_ATTEMPTS})`);
        
        await prisma.systemLog.update({
          where: { id: `webhook_${eventId}` },
          data: {
            level: 'ERROR',
            message: `FAILED webhook ${eventType} - max attempts exceeded`,
            metadata: {
              ...(eventLog.metadata as any),
              finalStatus: 'MAX_ATTEMPTS_EXCEEDED',
              completedAt: new Date().toISOString()
            }
          }
        });
        
        return { success: false, skipped: false, error: 'Max attempts exceeded' };
      }

      // Step 4: Check for concurrent processing (race condition protection)
      const processingStartTime = new Date((eventLog.metadata as any)?.processingStartedAt);
      const now = new Date();
      const timeDiff = now.getTime() - processingStartTime.getTime();
      
      if (timeDiff < this.LOCK_TIMEOUT_MS && attempts > 1) {
        console.log(`⏳ Event ${eventId} is currently being processed by another instance, skipping`);
        return { success: true, skipped: true };
      }

      // Step 5: Process the event within a transaction
      const result = await prisma.$transaction(async (tx) => {
        try {
          await processor(event.data.object as T, eventId);
          
          // Mark as completed
          await tx.systemLog.update({
            where: { id: `webhook_${eventId}` },
            data: {
              level: 'INFO',
              message: `COMPLETED webhook ${eventType}`,
              metadata: {
                ...(eventLog.metadata as any),
                finalStatus: 'COMPLETED',
                completedAt: new Date().toISOString(),
                processingDurationMs: Date.now() - processingStartTime.getTime()
              }
            }
          });

          return { success: true };
        } catch (processingError) {
          console.error(`❌ Error processing webhook ${eventId}:`, processingError);
          
          // Mark as failed
          await tx.systemLog.update({
            where: { id: `webhook_${eventId}` },
            data: {
              level: 'ERROR',
              message: `FAILED webhook ${eventType}: ${processingError instanceof Error ? processingError.message : 'Unknown error'}`,
              metadata: {
                ...(eventLog.metadata as any),
                finalStatus: 'FAILED',
                errorMessage: processingError instanceof Error ? processingError.message : 'Unknown error',
                errorStack: processingError instanceof Error ? processingError.stack : undefined,
                failedAt: new Date().toISOString()
              }
            }
          });

          throw processingError;
        }
      }, {
        maxWait: 5000, // 5 seconds
        timeout: 30000, // 30 seconds
      });

      console.log(`✅ Successfully processed webhook event: ${eventType} (${eventId})`);
      return result;

    } catch (error) {
      console.error(`❌ Failed to process webhook event ${eventId}:`, error);
      return { 
        success: false, 
        skipped: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Clean up old webhook logs (call this periodically)
   */
  static async cleanupOldWebhookLogs(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.systemLog.deleteMany({
      where: {
        source: 'stripe_webhook',
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🧹 Cleaned up ${result.count} old webhook logs`);
    return result.count;
  }

  /**
   * Get webhook processing statistics
   */
  static async getWebhookStats(days: number = 7): Promise<{
    total: number;
    completed: number;
    failed: number;
    processing: number;
    successRate: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [total, completed, failed, processing] = await Promise.all([
      prisma.systemLog.count({
        where: {
          source: 'stripe_webhook',
          createdAt: { gte: cutoffDate }
        }
      }),
      prisma.systemLog.count({
        where: {
          source: 'stripe_webhook',
          level: 'INFO',
          message: { contains: 'COMPLETED' },
          createdAt: { gte: cutoffDate }
        }
      }),
      prisma.systemLog.count({
        where: {
          source: 'stripe_webhook',
          level: 'ERROR',
          createdAt: { gte: cutoffDate }
        }
      }),
      prisma.systemLog.count({
        where: {
          source: 'stripe_webhook',
          level: 'WARN',
          message: { contains: 'PROCESSING' },
          createdAt: { gte: cutoffDate }
        }
      })
    ]);

    const successRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      failed,
      processing,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}

// Export singleton instance for compatibility
export const webhookProcessor = new WebhookProcessor(); 