/**
 * Client-side WebSocket Manager
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Handles real-time communication from the client side
 */

export interface ClientWebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface SlotAvailabilityUpdate {
  datetime: string;
  serviceType: string;
  available: boolean;
  reservationId?: string;
  viewerCount: number;
}

export interface SlotViewingUpdate {
  datetime: string;
  serviceType: string;
  viewerCount: number;
  activeViewers: string[];
}

export type WebSocketEventHandler = {
  onSlotAvailable?: (update: SlotAvailabilityUpdate) => void;
  onSlotUnavailable?: (update: SlotAvailabilityUpdate) => void;
  onSlotViewingCount?: (update: SlotViewingUpdate) => void;
  onReservationConflict?: (data: any) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onReconnecting?: (attempt: number) => void;
};

/**
 * Client-side WebSocket Manager
 */
export class ClientWebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<ClientWebSocketConfig>;
  private handlers: WebSocketEventHandler = {};
  private sessionId: string;
  private userId?: string;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private subscribedChannels = new Set<string>();
  private viewingSlots = new Map<string, { datetime: string; serviceType: string }>();

  constructor(config: ClientWebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };
    this.sessionId = this.generateSessionId();
  }

  /**
   * Connect to WebSocket server
   */
  async connect(userId?: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.userId = userId;
    
    try {
      this.ws = new WebSocket(this.config.url);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.handlers.onConnected?.();
        
        // Resubscribe to channels
        this.resubscribeToChannels();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.handlers.onDisconnected?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handlers.onError?.('WebSocket connection error');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.handlers.onError?.('Failed to connect to real-time updates');
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscribedChannels.clear();
    this.viewingSlots.clear();
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: WebSocketEventHandler): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Subscribe to booking slot updates
   */
  subscribeToSlotUpdates(): void {
    this.subscribe('booking:slots');
  }

  /**
   * Unsubscribe from booking slot updates
   */
  unsubscribeFromSlotUpdates(): void {
    this.unsubscribe('booking:slots');
  }

  /**
   * Start viewing a specific slot
   */
  startViewingSlot(datetime: string, serviceType: string): void {
    const slotKey = `${datetime}:${serviceType}`;
    
    if (this.viewingSlots.has(slotKey)) {
      return; // Already viewing
    }

    this.viewingSlots.set(slotKey, { datetime, serviceType });
    
    this.sendMessage({
      type: 'slot_viewing',
      datetime,
      serviceType,
      userId: this.userId,
      sessionId: this.sessionId
    });
  }

  /**
   * Stop viewing a specific slot
   */
  stopViewingSlot(datetime: string, serviceType: string): void {
    const slotKey = `${datetime}:${serviceType}`;
    
    if (!this.viewingSlots.has(slotKey)) {
      return; // Not viewing
    }

    this.viewingSlots.delete(slotKey);
    
    this.sendMessage({
      type: 'slot_stop_viewing',
      datetime,
      serviceType,
      sessionId: this.sessionId
    });
  }

  /**
   * Get connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get viewer count for a slot
   */
  getSlotViewerCount(datetime: string, serviceType: string): number {
    // This would be updated from server messages
    return 0;
  }

  // Private methods
  private subscribe(channel: string): void {
    if (!this.subscribedChannels.has(channel)) {
      this.subscribedChannels.add(channel);
      this.sendMessage({
        type: 'subscribe',
        channel,
        userId: this.userId,
        sessionId: this.sessionId
      });
    }
  }

  private unsubscribe(channel: string): void {
    if (this.subscribedChannels.has(channel)) {
      this.subscribedChannels.delete(channel);
      this.sendMessage({
        type: 'unsubscribe',
        channel,
        sessionId: this.sessionId
      });
    }
  }

  private resubscribeToChannels(): void {
    for (const channel of this.subscribedChannels) {
      this.sendMessage({
        type: 'subscribe',
        channel,
        userId: this.userId,
        sessionId: this.sessionId
      });
    }
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'slot_available':
          this.handlers.onSlotAvailable?.(message.data);
          break;
          
        case 'slot_unavailable':
          this.handlers.onSlotUnavailable?.(message.data);
          break;
          
        case 'slot_viewing_count':
          this.handlers.onSlotViewingCount?.(message.data);
          break;
          
        case 'reservation_conflict':
          this.handlers.onReservationConflict?.(message.data);
          break;
          
        case 'heartbeat_response':
          // Heartbeat acknowledged
          break;
          
        case 'error':
          this.handlers.onError?.(message.data.error);
          break;
          
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({
        type: 'heartbeat',
        sessionId: this.sessionId
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.handlers.onError?.('Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.handlers.onReconnecting?.(this.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.userId);
    }, this.config.reconnectInterval);
  }

  private generateSessionId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
let clientWebSocketManager: ClientWebSocketManager | null = null;

export function getClientWebSocketManager(): ClientWebSocketManager {
  if (!clientWebSocketManager) {
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://your-domain.com/api/realtime/websocket'
      : 'ws://localhost:3000/api/realtime/websocket';
      
    clientWebSocketManager = new ClientWebSocketManager({ url: wsUrl });
  }
  
  return clientWebSocketManager;
}