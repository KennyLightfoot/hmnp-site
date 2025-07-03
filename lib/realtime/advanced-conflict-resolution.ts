/**
 * Advanced Conflict Resolution System
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Handles complex booking conflicts with sophisticated resolution strategies
 */

import { redis } from '../redis';
import { logger } from '../logger';
import { slotReservationEngine } from '../slot-reservation';
import { webSocketManager } from './websocket-manager';
import { z } from 'zod';

// Conflict Types
export enum ConflictType {
  SIMULTANEOUS_RESERVATION = 'simultaneous_reservation',
  EXPIRED_RESERVATION = 'expired_reservation',
  RESERVATION_RACE_CONDITION = 'reservation_race_condition',
  BOOKING_CONVERSION_CONFLICT = 'booking_conversion_conflict',
  EXTERNAL_CALENDAR_CONFLICT = 'external_calendar_conflict'
}

// Conflict Resolution Strategies
export enum ResolutionStrategy {
  FIRST_COME_FIRST_SERVED = 'first_come_first_served',
  PRIORITY_BASED = 'priority_based',
  PAYMENT_INTENT_PRIORITY = 'payment_intent_priority',
  RETURNING_CUSTOMER_PRIORITY = 'returning_customer_priority',
  MANUAL_RESOLUTION = 'manual_resolution'
}

// Conflict Resolution Request
const ConflictResolutionRequestSchema = z.object({
  datetime: z.string().datetime(),
  serviceType: z.string(),
  conflictType: z.nativeEnum(ConflictType),
  conflictingUsers: z.array(z.object({
    userId: z.string().optional(),
    customerEmail: z.string().email().optional(),
    reservationId: z.string().optional(),
    timestamp: z.string().datetime(),
    priority: z.number().min(0).max(10).default(5),
    hasPaymentIntent: z.boolean().default(false),
    isReturningCustomer: z.boolean().default(false),
    metadata: z.record(z.any()).optional()
  })),
  resolutionStrategy: z.nativeEnum(ResolutionStrategy).default(ResolutionStrategy.FIRST_COME_FIRST_SERVED),
  metadata: z.record(z.any()).optional()
});

// Conflict Resolution Result
export interface ConflictResolutionResult {
  success: boolean;
  winningUser?: {
    userId?: string;
    customerEmail?: string;
    reservationId?: string;
    reason: string;
  };
  losingUsers: Array<{
    userId?: string;
    customerEmail?: string;
    reservationId?: string;
    reason: string;
    suggestedAlternatives?: string[];
  }>;
  resolutionDetails: {
    strategy: ResolutionStrategy;
    timestamp: string;
    conflictId: string;
    resolutionTime: number;
  };
  message: string;
}

// Alternative Slot Suggestion
export interface AlternativeSlot {
  datetime: string;
  serviceType: string;
  availability: 'available' | 'high_demand' | 'last_available';
  price: number;
  discountApplied?: boolean;
  reason: string;
}

/**
 * Advanced Conflict Resolution Engine
 */
export class AdvancedConflictResolver {
  private readonly conflictKeyPrefix = 'conflict:';
  private readonly resolutionHistory = 'resolution_history';

  /**
   * Resolve booking conflict with advanced strategies
   */
  async resolveConflict(request: z.infer<typeof ConflictResolutionRequestSchema>): Promise<ConflictResolutionResult> {
    const startTime = Date.now();
    const conflictId = this.generateConflictId();
    
    try {
      // Validate request
      const validatedRequest = ConflictResolutionRequestSchema.parse(request);
      const { datetime, serviceType, conflictType, conflictingUsers, resolutionStrategy, metadata } = validatedRequest;
      
      logger.info('Starting conflict resolution', {
        conflictId,
        datetime,
        serviceType,
        conflictType,
        userCount: conflictingUsers.length,
        strategy: resolutionStrategy
      });

      // Check if slot is still in conflict
      const isStillInConflict = await this.validateConflictState(datetime, serviceType, conflictingUsers);
      if (!isStillInConflict) {
        return {
          success: false,
          losingUsers: [],
          resolutionDetails: {
            strategy: resolutionStrategy,
            timestamp: new Date().toISOString(),
            conflictId,
            resolutionTime: Date.now() - startTime
          },
          message: 'Conflict has been resolved by another process'
        };
      }

      // Apply resolution strategy
      let resolutionResult: ConflictResolutionResult;
      
      switch (resolutionStrategy) {
        case ResolutionStrategy.FIRST_COME_FIRST_SERVED:
          resolutionResult = await this.resolveByFirstCome(datetime, serviceType, conflictingUsers, conflictId);
          break;
          
        case ResolutionStrategy.PRIORITY_BASED:
          resolutionResult = await this.resolveByPriority(datetime, serviceType, conflictingUsers, conflictId);
          break;
          
        case ResolutionStrategy.PAYMENT_INTENT_PRIORITY:
          resolutionResult = await this.resolveByPaymentIntent(datetime, serviceType, conflictingUsers, conflictId);
          break;
          
        case ResolutionStrategy.RETURNING_CUSTOMER_PRIORITY:
          resolutionResult = await this.resolveByCustomerStatus(datetime, serviceType, conflictingUsers, conflictId);
          break;
          
        case ResolutionStrategy.MANUAL_RESOLUTION:
          resolutionResult = await this.flagForManualResolution(datetime, serviceType, conflictingUsers, conflictId);
          break;
          
        default:
          resolutionResult = await this.resolveByFirstCome(datetime, serviceType, conflictingUsers, conflictId);
      }

      // Record resolution in history
      await this.recordResolution(conflictId, resolutionResult, validatedRequest);
      
      // Notify affected users
      await this.notifyConflictResolution(resolutionResult);
      
      // Broadcast real-time updates
      await this.broadcastConflictResolution(datetime, serviceType, resolutionResult);
      
      // Suggest alternatives for losing users
      await this.suggestAlternatives(resolutionResult.losingUsers, datetime, serviceType);
      
      resolutionResult.resolutionDetails.resolutionTime = Date.now() - startTime;
      
      logger.info('Conflict resolution completed', {
        conflictId,
        success: resolutionResult.success,
        strategy: resolutionStrategy,
        resolutionTime: resolutionResult.resolutionDetails.resolutionTime
      });
      
      return resolutionResult;
      
    } catch (error) {
      logger.error('Conflict resolution failed', {
        conflictId,
        error: error.message,
        request: this.sanitizeRequest(request)
      });
      
      return {
        success: false,
        losingUsers: [],
        resolutionDetails: {
          strategy: request.resolutionStrategy || ResolutionStrategy.FIRST_COME_FIRST_SERVED,
          timestamp: new Date().toISOString(),
          conflictId,
          resolutionTime: Date.now() - startTime
        },
        message: 'Conflict resolution failed. Please try again.'
      };
    }
  }

  /**
   * Resolve by first-come-first-served basis
   */
  private async resolveByFirstCome(
    datetime: string,
    serviceType: string,
    conflictingUsers: any[],
    conflictId: string
  ): Promise<ConflictResolutionResult> {
    // Sort by timestamp
    const sortedUsers = [...conflictingUsers].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const winner = sortedUsers[0];
    const losers = sortedUsers.slice(1);
    
    // Ensure winner still has valid reservation
    if (winner.reservationId) {
      const reservationStatus = await slotReservationEngine.getReservationStatus(winner.reservationId);
      if (!reservationStatus.active) {
        // Winner's reservation expired, try next user
        if (losers.length > 0) {
          return this.resolveByFirstCome(datetime, serviceType, losers, conflictId);
        }
      }
    }
    
    return {
      success: true,
      winningUser: {
        userId: winner.userId,
        customerEmail: winner.customerEmail,
        reservationId: winner.reservationId,
        reason: 'First to reserve the slot'
      },
      losingUsers: losers.map(loser => ({
        userId: loser.userId,
        customerEmail: loser.customerEmail,
        reservationId: loser.reservationId,
        reason: 'Another customer reserved this slot first'
      })),
      resolutionDetails: {
        strategy: ResolutionStrategy.FIRST_COME_FIRST_SERVED,
        timestamp: new Date().toISOString(),
        conflictId,
        resolutionTime: 0
      },
      message: 'Conflict resolved by first-come-first-served'
    };
  }

  /**
   * Resolve by priority levels
   */
  private async resolveByPriority(
    datetime: string,
    serviceType: string,
    conflictingUsers: any[],
    conflictId: string
  ): Promise<ConflictResolutionResult> {
    // Sort by priority (descending) then by timestamp
    const sortedUsers = [...conflictingUsers].sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    const winner = sortedUsers[0];
    const losers = sortedUsers.slice(1);
    
    return {
      success: true,
      winningUser: {
        userId: winner.userId,
        customerEmail: winner.customerEmail,
        reservationId: winner.reservationId,
        reason: `Highest priority (${winner.priority}/10)`
      },
      losingUsers: losers.map(loser => ({
        userId: loser.userId,
        customerEmail: loser.customerEmail,
        reservationId: loser.reservationId,
        reason: `Lower priority (${loser.priority}/10)`
      })),
      resolutionDetails: {
        strategy: ResolutionStrategy.PRIORITY_BASED,
        timestamp: new Date().toISOString(),
        conflictId,
        resolutionTime: 0
      },
      message: 'Conflict resolved by priority level'
    };
  }

  /**
   * Resolve by payment intent status
   */
  private async resolveByPaymentIntent(
    datetime: string,
    serviceType: string,
    conflictingUsers: any[],
    conflictId: string
  ): Promise<ConflictResolutionResult> {
    // Users with payment intent get priority
    const usersWithPayment = conflictingUsers.filter(user => user.hasPaymentIntent);
    const usersWithoutPayment = conflictingUsers.filter(user => !user.hasPaymentIntent);
    
    if (usersWithPayment.length === 0) {
      // No one has payment intent, fall back to first-come-first-served
      return this.resolveByFirstCome(datetime, serviceType, conflictingUsers, conflictId);
    }
    
    // Among users with payment intent, choose first come
    const sortedUsersWithPayment = usersWithPayment.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const winner = sortedUsersWithPayment[0];
    const losers = [...sortedUsersWithPayment.slice(1), ...usersWithoutPayment];
    
    return {
      success: true,
      winningUser: {
        userId: winner.userId,
        customerEmail: winner.customerEmail,
        reservationId: winner.reservationId,
        reason: 'Has payment intent ready'
      },
      losingUsers: losers.map(loser => ({
        userId: loser.userId,
        customerEmail: loser.customerEmail,
        reservationId: loser.reservationId,
        reason: loser.hasPaymentIntent ? 'Another customer with payment intent was first' : 'No payment intent'
      })),
      resolutionDetails: {
        strategy: ResolutionStrategy.PAYMENT_INTENT_PRIORITY,
        timestamp: new Date().toISOString(),
        conflictId,
        resolutionTime: 0
      },
      message: 'Conflict resolved by payment intent priority'
    };
  }

  /**
   * Resolve by customer status (returning vs new)
   */
  private async resolveByCustomerStatus(
    datetime: string,
    serviceType: string,
    conflictingUsers: any[],
    conflictId: string
  ): Promise<ConflictResolutionResult> {
    // Returning customers get priority
    const returningCustomers = conflictingUsers.filter(user => user.isReturningCustomer);
    const newCustomers = conflictingUsers.filter(user => !user.isReturningCustomer);
    
    if (returningCustomers.length === 0) {
      // No returning customers, fall back to first-come-first-served
      return this.resolveByFirstCome(datetime, serviceType, conflictingUsers, conflictId);
    }
    
    // Among returning customers, choose first come
    const sortedReturningCustomers = returningCustomers.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const winner = sortedReturningCustomers[0];
    const losers = [...sortedReturningCustomers.slice(1), ...newCustomers];
    
    return {
      success: true,
      winningUser: {
        userId: winner.userId,
        customerEmail: winner.customerEmail,
        reservationId: winner.reservationId,
        reason: 'Returning customer priority'
      },
      losingUsers: losers.map(loser => ({
        userId: loser.userId,
        customerEmail: loser.customerEmail,
        reservationId: loser.reservationId,
        reason: loser.isReturningCustomer ? 'Another returning customer was first' : 'New customer (returning customers have priority)'
      })),
      resolutionDetails: {
        strategy: ResolutionStrategy.RETURNING_CUSTOMER_PRIORITY,
        timestamp: new Date().toISOString(),
        conflictId,
        resolutionTime: 0
      },
      message: 'Conflict resolved by customer status'
    };
  }

  /**
   * Flag for manual resolution
   */
  private async flagForManualResolution(
    datetime: string,
    serviceType: string,
    conflictingUsers: any[],
    conflictId: string
  ): Promise<ConflictResolutionResult> {
    // Store conflict for manual review
    await redis.hset(`${this.conflictKeyPrefix}manual:${conflictId}`, {
      datetime,
      serviceType,
      conflictingUsers: JSON.stringify(conflictingUsers),
      status: 'pending_manual_review',
      createdAt: new Date().toISOString()
    });
    
    return {
      success: false,
      losingUsers: conflictingUsers.map(user => ({
        userId: user.userId,
        customerEmail: user.customerEmail,
        reservationId: user.reservationId,
        reason: 'Conflict requires manual resolution'
      })),
      resolutionDetails: {
        strategy: ResolutionStrategy.MANUAL_RESOLUTION,
        timestamp: new Date().toISOString(),
        conflictId,
        resolutionTime: 0
      },
      message: 'Conflict flagged for manual resolution by administrator'
    };
  }

  /**
   * Suggest alternative slots for losing users
   */
  private async suggestAlternatives(
    losingUsers: any[],
    originalDatetime: string,
    serviceType: string
  ): Promise<void> {
    // This would integrate with your calendar system to find alternatives
    // For now, we'll log that alternatives should be suggested
    logger.info('Suggesting alternatives for losing users', {
      userCount: losingUsers.length,
      originalDatetime,
      serviceType
    });
  }

  /**
   * Broadcast conflict resolution to connected clients
   */
  private async broadcastConflictResolution(
    datetime: string,
    serviceType: string,
    result: ConflictResolutionResult
  ): Promise<void> {
    try {
      await webSocketManager.broadcastSlotUpdate({
        datetime,
        serviceType,
        available: false,
        reservationId: result.winningUser?.reservationId,
        viewerCount: 0
      });
    } catch (error) {
      logger.error('Failed to broadcast conflict resolution', { error: error.message });
    }
  }

  /**
   * Notify users of conflict resolution
   */
  private async notifyConflictResolution(result: ConflictResolutionResult): Promise<void> {
    // This would integrate with your notification system
    logger.info('Notifying users of conflict resolution', {
      winningUser: result.winningUser?.userId || result.winningUser?.customerEmail,
      losingUserCount: result.losingUsers.length
    });
  }

  // Helper methods
  private async validateConflictState(datetime: string, serviceType: string, conflictingUsers: any[]): Promise<boolean> {
    // Check if the slot is still available or if reservations are still active
    const isSlotAvailable = await slotReservationEngine.isSlotAvailable(datetime, serviceType);
    if (isSlotAvailable) {
      return false; // No conflict if slot is available
    }
    
    // Check if any of the conflicting users still have active reservations
    for (const user of conflictingUsers) {
      if (user.reservationId) {
        const status = await slotReservationEngine.getReservationStatus(user.reservationId);
        if (status.active) {
          return true; // Conflict still exists
        }
      }
    }
    
    return false; // No active reservations found
  }

  private async recordResolution(conflictId: string, result: ConflictResolutionResult, request: any): Promise<void> {
    try {
      const record = {
        conflictId,
        datetime: request.datetime,
        serviceType: request.serviceType,
        conflictType: request.conflictType,
        strategy: request.resolutionStrategy,
        result: JSON.stringify(result),
        timestamp: new Date().toISOString()
      };
      
      await redis.lpush(this.resolutionHistory, JSON.stringify(record));
      await redis.ltrim(this.resolutionHistory, 0, 999); // Keep last 1000 records
    } catch (error) {
      logger.error('Failed to record conflict resolution', { conflictId, error: error.message });
    }
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeRequest(request: any): any {
    const sanitized = { ...request };
    if (sanitized.conflictingUsers) {
      sanitized.conflictingUsers = sanitized.conflictingUsers.map((user: any) => ({
        ...user,
        customerEmail: user.customerEmail ? this.maskEmail(user.customerEmail) : undefined
      }));
    }
    return sanitized;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }
}

// Singleton instance
export const advancedConflictResolver = new AdvancedConflictResolver();