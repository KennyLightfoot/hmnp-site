/**
 * Real-time WebSocket Manager
 * Houston Mobile Notary Pros - Phase 2 Enhancement
 * 
 * Provides real-time slot availability updates and collaborative booking prevention
 */

import { getErrorMessage } from '@/lib/utils/error-utils';
import { redis } from '../redis';
import { logger } from '../logger';
import { z } from 'zod';

// Message Types
const ClientMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('subscribe'),
    channel: z.string(),
    userId: z.string().optional(),
    sessionId: z.string()
  }),
  z.object({
    type: z.literal('unsubscribe'),
    channel: z.string(),
    sessionId: z.string()
  }),
  z.object({
    type: z.literal('heartbeat'),
    sessionId: z.string()
  }),
  z.object({
    type: z.literal('slot_viewing'),
    datetime: z.string(),
    serviceType: z.string(),
    userId: z.string().optional(),
    sessionId: z.string()
  }),
  z.object({
    type: z.literal('slot_stop_viewing'),
    datetime: z.string(),
    serviceType: z.string(),
    sessionId: z.string()
  })
]);

// Server Message Types
export interface ServerMessage {
  type: 'slot_unavailable' | 'slot_available' | 'slot_viewing_count' | 'reservation_conflict' | 'heartbeat_response' | 'error';
  data?: any;
  timestamp: string;
}

export interface SlotViewingInfo {
  datetime: string;
  serviceType: string;
  viewerCount: number;
  activeViewers: string[];
}

export interface RealtimeSlotUpdate {
  datetime: string;
  serviceType: string;
  available: boolean;
  reservedBy?: string;
  reservationId?: string;
  viewerCount: number;
}

/**
 * WebSocket Manager for Real-time Slot Availability
 */
export class WebSocketManager {
  private wss: any | null = null; // Changed type to any
  private clients: Map<string, any> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private slotViewers: Map<string, Set<string>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds

  /**
   * Initialize WebSocket server
   */
  async initialize(server: any): Promise<void> {
    try {
      // Use dynamic import for 'ws'
      const { WebSocketServer } = await import('ws');
      this.wss = new WebSocketServer({ server });
      
      this.wss.on('connection', (ws: any, req: any) => {
        const sessionId = this.generateSessionId();
        
        // Store client connection
        this.clients.set(sessionId, {
          ws,
          sessionId,
          connectedAt: new Date(),
          lastHeartbeat: new Date(),
          subscriptions: new Set<string>(),
          viewingSlots: new Set<string>()
        });

        logger.info('WebSocket client connected', { sessionId });

        // Handle client messages
        ws.on('message', async (message: any) => {
          try {
            const parsed = JSON.parse(message.toString());
            await this.handleClientMessage(sessionId, parsed);
          } catch (error) {
            logger.error('Invalid WebSocket message', { sessionId, error: getErrorMessage(error) });
            this.sendError(sessionId, 'Invalid message format');
          }
        });

        // Handle client disconnect
        ws.on('close', () => {
          this.handleClientDisconnect(sessionId);
        });

        // Handle errors
        ws.on('error', (error: any) => {
          logger.error('WebSocket error', { sessionId, error: getErrorMessage(error) });
          this.handleClientDisconnect(sessionId);
        });
      });

      // Start heartbeat monitoring
      this.startHeartbeatMonitoring();
      
      // Subscribe to Redis for slot updates
      await this.subscribeToRedisUpdates();
      
      logger.info('WebSocket server initialized');
    } catch (error) {
      logger.error('Failed to initialize WebSocket server', { error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Handle client messages
   */
  private async handleClientMessage(sessionId: string, message: any): Promise<void> {
    try {
      const client = this.clients.get(sessionId);
      if (!client) return;

      const validatedMessage = ClientMessageSchema.parse(message);
      
      switch (validatedMessage.type) {
        case 'subscribe':
          await this.handleSubscribe(sessionId, validatedMessage.channel, validatedMessage.userId);
          break;
          
        case 'unsubscribe':
          await this.handleUnsubscribe(sessionId, validatedMessage.channel);
          break;
          
        case 'heartbeat':
          this.handleHeartbeat(sessionId);
          break;
          
        case 'slot_viewing':
          await this.handleSlotViewing(sessionId, validatedMessage);
          break;
          
        case 'slot_stop_viewing':
          await this.handleSlotStopViewing(sessionId, validatedMessage);
          break;
          
        default:
          this.sendError(sessionId, 'Unknown message type');
      }
    } catch (error) {
      logger.error('Error handling client message', { sessionId, error: getErrorMessage(error) });
      this.sendError(sessionId, 'Message processing error');
    }
  }

  /**
   * Handle channel subscription
   */
  private async handleSubscribe(sessionId: string, channel: string, userId?: string): Promise<void> {
    const client = this.clients.get(sessionId);
    if (!client) return;

    // Add to subscriptions
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(sessionId);
    client.subscriptions.add(channel);
    client.userId = userId;

    logger.info('Client subscribed to channel', { sessionId, channel, userId });
    
    // Send initial slot availability for booking channels
    if (channel.startsWith('booking:')) {
      await this.sendInitialSlotAvailability(sessionId, channel);
    }
  }

  /**
   * Handle channel unsubscription
   */
  private async handleUnsubscribe(sessionId: string, channel: string): Promise<void> {
    const client = this.clients.get(sessionId);
    if (!client) return;

    // Remove from subscriptions
    this.subscriptions.get(channel)?.delete(sessionId);
    client.subscriptions.delete(channel);

    logger.info('Client unsubscribed from channel', { sessionId, channel });
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(sessionId: string): void {
    const client = this.clients.get(sessionId);
    if (client) {
      client.lastHeartbeat = new Date();
      this.sendMessage(sessionId, {
        type: 'heartbeat_response',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle slot viewing tracking
   */
  private async handleSlotViewing(sessionId: string, message: any): Promise<void> {
    const { datetime, serviceType, userId } = message;
    const slotKey = `${datetime}:${serviceType}`;
    
    // Add to viewers
    if (!this.slotViewers.has(slotKey)) {
      this.slotViewers.set(slotKey, new Set());
    }
    this.slotViewers.get(slotKey)!.add(sessionId);
    
    // Track in client
    const client = this.clients.get(sessionId);
    if (client) {
      client.viewingSlots.add(slotKey);
      client.userId = userId;
    }

    // Broadcast viewer count update
    await this.broadcastSlotViewerCount(slotKey, datetime, serviceType);
    
    logger.info('Client viewing slot', { sessionId, datetime, serviceType, userId });
  }

  /**
   * Handle stop viewing slot
   */
  private async handleSlotStopViewing(sessionId: string, message: any): Promise<void> {
    const { datetime, serviceType } = message;
    const slotKey = `${datetime}:${serviceType}`;
    
    // Remove from viewers
    this.slotViewers.get(slotKey)?.delete(sessionId);
    
    // Remove from client
    const client = this.clients.get(sessionId);
    if (client) {
      client.viewingSlots.delete(slotKey);
    }

    // Broadcast updated viewer count
    await this.broadcastSlotViewerCount(slotKey, datetime, serviceType);
    
    logger.info('Client stopped viewing slot', { sessionId, datetime, serviceType });
  }

  /**
   * Broadcast slot availability update
   */
  async broadcastSlotUpdate(update: RealtimeSlotUpdate): Promise<void> {
    const channel = 'booking:slots';
    const subscribers = this.subscriptions.get(channel);
    
    if (!subscribers || subscribers.size === 0) return;

    const message: ServerMessage = {
      type: update.available ? 'slot_available' : 'slot_unavailable',
      data: update,
      timestamp: new Date().toISOString()
    };

    // Send to all subscribers
    for (const sessionId of subscribers) {
      this.sendMessage(sessionId, message);
    }

    logger.info('Broadcasted slot update', { 
      datetime: update.datetime, 
      serviceType: update.serviceType, 
      available: update.available,
      subscriberCount: subscribers.size 
    });
  }

  /**
   * Broadcast slot viewer count
   */
  private async broadcastSlotViewerCount(slotKey: string, datetime: string, serviceType: string): Promise<void> {
    const viewers = this.slotViewers.get(slotKey);
    const viewerCount = viewers ? viewers.size : 0;
    
    const channel = 'booking:slots';
    const subscribers = this.subscriptions.get(channel);
    
    if (!subscribers || subscribers.size === 0) return;

    const message: ServerMessage = {
      type: 'slot_viewing_count',
      data: {
        datetime,
        serviceType,
        viewerCount,
        activeViewers: Array.from(viewers || [])
      },
      timestamp: new Date().toISOString()
    };

    // Send to all subscribers
    for (const sessionId of subscribers) {
      this.sendMessage(sessionId, message);
    }
  }

  /**
   * Send message to specific client
   */
  private sendMessage(sessionId: string, message: ServerMessage): void {
    const client = this.clients.get(sessionId);
    if (!client || client.ws.readyState !== 1) return;

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error('Failed to send WebSocket message', { sessionId, error: getErrorMessage(error) });
      this.handleClientDisconnect(sessionId);
    }
  }

  /**
   * Send error message
   */
  private sendError(sessionId: string, error: string): void {
    this.sendMessage(sessionId, {
      type: 'error',
      data: { error },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send initial slot availability
   */
  private async sendInitialSlotAvailability(sessionId: string, channel: string): Promise<void> {
    // This would query current slot availability and send to the client
    // Implementation depends on your slot availability logic
    logger.info('Sending initial slot availability', { sessionId, channel });
  }

  /**
   * Handle client disconnect
   */
  private handleClientDisconnect(sessionId: string): void {
    const client = this.clients.get(sessionId);
    if (!client) return;

    // Remove from all subscriptions
    for (const subscription of client.subscriptions) {
      this.subscriptions.get(subscription)?.delete(sessionId);
    }

    // Remove from slot viewers
    for (const slotKey of client.viewingSlots) {
      this.slotViewers.get(slotKey)?.delete(sessionId);
      // Broadcast updated viewer count
      const [datetime, serviceType] = slotKey.split(':');
      this.broadcastSlotViewerCount(slotKey, datetime, serviceType);
    }

    // Remove client
    this.clients.delete(sessionId);
    
    logger.info('WebSocket client disconnected', { sessionId });
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const staleClients: string[] = [];

      for (const [sessionId, client] of this.clients) {
        const timeSinceLastHeartbeat = now.getTime() - client.lastHeartbeat.getTime();
        
        if (timeSinceLastHeartbeat > this.HEARTBEAT_INTERVAL * 2) {
          staleClients.push(sessionId);
        }
      }

      // Remove stale clients
      for (const sessionId of staleClients) {
        logger.info('Removing stale WebSocket client', { sessionId });
        this.handleClientDisconnect(sessionId);
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Subscribe to Redis updates
   */
  private async subscribeToRedisUpdates(): Promise<void> {
    try {
      // Subscribe to slot reservation updates
      const subscriber = (redis as any).duplicate();
      await subscriber.subscribe('slot_updates');
      
      subscriber.on('message', async (channel: any, message: any) => {
        try {
          const update = JSON.parse(message);
          await this.broadcastSlotUpdate(update);
        } catch (error) {
          logger.error('Failed to process Redis update', { channel, error: getErrorMessage(error) });
        }
      });
      
      logger.info('Subscribed to Redis slot updates');
    } catch (error) {
      logger.error('Failed to subscribe to Redis updates', { error: getErrorMessage(error) });
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get slot viewer count
   */
  getSlotViewerCount(datetime: string, serviceType: string): number {
    const slotKey = `${datetime}:${serviceType}`;
    return this.slotViewers.get(slotKey)?.size || 0;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.wss) {
      this.wss.close();
    }
    
    this.clients.clear();
    this.subscriptions.clear();
    this.slotViewers.clear();
    
    logger.info('WebSocket manager cleaned up');
  }
}

// Singleton instance
export const webSocketManager = new WebSocketManager();
