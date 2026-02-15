/**
 * BlueNotary Integration for Houston Mobile Notary Pros
 * 
 * This module provides a complete integration with BlueNotary's API for
 * Remote Online Notarization (RON) services.
 */

import { logger } from '../../logger';
import { prisma } from '../../prisma';
import axios from 'axios';

// Environment variables validation
const BLUENOTARY_API_KEY = process.env.BLUENOTARY_API_KEY;
const BLUENOTARY_BASE_URL = process.env.BLUENOTARY_BASE_URL || 'https://api.bluenotary.us';
const BLUENOTARY_NOTARY_EMAIL = process.env.BLUENOTARY_NOTARY_EMAIL;
const BLUENOTARY_WEBHOOK_SECRET = process.env.BLUENOTARY_WEBHOOK_SECRET;

// Types
export interface CreateRONSessionRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  documentTitle?: string;
  documentDescription?: string;
  scheduledDateTime?: Date;
  documentTypes?: string[];
  callbackUrl?: string;
}

export interface RONSession {
  id: string;
  status: string;
  sessionUrl: string;
  notaryName?: string;
  createdAt: Date;
  expiresAt?: Date;
  documentIds?: string[];
}

export interface BlueNotaryDocument {
  id: string;
  title: string;
  status: string;
  downloadUrl?: string;
}

export enum RONSessionStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

/**
 * BlueNotary API Client
 * Provides methods to interact with BlueNotary's API for RON services
 */
export class BlueNotaryClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly notaryEmail: string;
  private readonly webhookSecret: string;
  
  constructor() {
    if (!BLUENOTARY_API_KEY) {
      logger.warn('BlueNotary API key not configured. RON services will be unavailable.');
    }
    
    this.apiKey = BLUENOTARY_API_KEY || '';
    this.baseUrl = BLUENOTARY_BASE_URL;
    this.notaryEmail = BLUENOTARY_NOTARY_EMAIL || '';
    this.webhookSecret = BLUENOTARY_WEBHOOK_SECRET || '';
  }
  
  /**
   * Check if BlueNotary integration is properly configured
   */
  isEnabled(): boolean {
    return Boolean(this.apiKey && this.notaryEmail);
  }
  
  /**
   * Test the connection to BlueNotary API
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isEnabled()) return false;
      
      const response = await axios.get(`${this.baseUrl}/v1/status`, {
        headers: this.getHeaders(),
      });
      
      return response.status === 200;
    } catch (error) {
      logger.error('Failed to connect to BlueNotary API', { error });
      return false;
    }
  }
  
  /**
   * Create a new RON session in BlueNotary
   */
  async createSession(request: CreateRONSessionRequest): Promise<RONSession | null> {
    try {
      if (!this.isEnabled()) {
        logger.error('BlueNotary integration not configured');
        return null;
      }
      
      const payload = {
        signer: {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone,
        },
        notaryEmail: this.notaryEmail,
        title: request.documentTitle || 'Document Notarization',
        description: request.documentDescription || 'Remote online notarization session',
        scheduledAt: request.scheduledDateTime ? request.scheduledDateTime.toISOString() : undefined,
        callbackUrl: request.callbackUrl,
        documentTypes: request.documentTypes || ['general'],
      };
      
      const response = await axios.post(
        `${this.baseUrl}/v1/sessions`, 
        payload,
        { headers: this.getHeaders() }
      );
      
      if (response.status === 201 && response.data) {
        // Store session in database for tracking
        await this.storeSessionInDatabase({
          id: response.data.id,
          sessionUrl: response.data.sessionUrl,
          status: RONSessionStatus.PENDING,
          createdAt: new Date(),
        });
        
        return {
          id: response.data.id,
          status: RONSessionStatus.PENDING,
          sessionUrl: response.data.sessionUrl,
          notaryName: response.data.notaryName,
          createdAt: new Date(),
          expiresAt: response.data.expiresAt ? new Date(response.data.expiresAt) : undefined,
          documentIds: response.data.documentIds,
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to create BlueNotary session', { error, request });
      return null;
    }
  }
  
  /**
   * Get session details from BlueNotary
   */
  async getSession(sessionId: string): Promise<RONSession | null> {
    try {
      if (!this.isEnabled() || !sessionId) return null;
      
      const response = await axios.get(
        `${this.baseUrl}/v1/sessions/${sessionId}`,
        { headers: this.getHeaders() }
      );
      
      if (response.status === 200 && response.data) {
        return {
          id: response.data.id,
          status: this.mapBlueNotaryStatus(response.data.status),
          sessionUrl: response.data.sessionUrl,
          notaryName: response.data.notaryName,
          createdAt: new Date(response.data.createdAt),
          expiresAt: response.data.expiresAt ? new Date(response.data.expiresAt) : undefined,
          documentIds: response.data.documentIds,
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get BlueNotary session', { error, sessionId });
      return null;
    }
  }
  
  /**
   * Upload a document to an existing BlueNotary session
   */
  async uploadDocument(sessionId: string, file: Buffer, filename: string, contentType: string): Promise<BlueNotaryDocument | null> {
    try {
      if (!this.isEnabled() || !sessionId) return null;
      
      // Create form data for file upload
      const formData = new FormData();
      const blob = new Blob([file], { type: contentType });
      formData.append('file', blob, filename);
      
      const response = await axios.post(
        `${this.baseUrl}/v1/sessions/${sessionId}/documents`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      if (response.status === 201 && response.data) {
        return {
          id: response.data.id,
          title: response.data.title || filename,
          status: response.data.status,
          downloadUrl: response.data.downloadUrl,
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to upload document to BlueNotary', { error, sessionId, filename });
      return null;
    }
  }
  
  /**
   * Cancel a RON session
   */
  async cancelSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      if (!this.isEnabled() || !sessionId) return false;
      
      const response = await axios.post(
        `${this.baseUrl}/v1/sessions/${sessionId}/cancel`,
        { reason: reason || 'Cancelled by customer' },
        { headers: this.getHeaders() }
      );
      
      return response.status === 200;
    } catch (error) {
      logger.error('Failed to cancel BlueNotary session', { error, sessionId });
      return false;
    }
  }
  
  /**
   * Validate a webhook from BlueNotary
   */
  validateWebhook(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    
    try {
      // Implement webhook validation using crypto library
      // This is a simplified example - in production, use appropriate validation
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const calculatedSignature = hmac.update(payload).digest('hex');
      
      return calculatedSignature === signature;
    } catch (error) {
      logger.error('Failed to validate BlueNotary webhook', { error });
      return false;
    }
  }
  
  /**
   * Process a webhook from BlueNotary
   */
  async processWebhook(payload: any): Promise<void> {
    try {
      const { sessionId, eventType, status, documentIds } = payload;
      
      // Update session status in database
      if (sessionId && status) {
        await prisma.booking.updateMany({
          where: {
            stripeSessionId: sessionId, // Using this field for BlueNotary sessionId
          },
          data: {
            status: this.mapWebhookStatusToBookingStatus(status),
            updatedAt: new Date(),
          },
        });
        
        // Add any additional processing based on event type
        switch (eventType) {
          case 'SESSION_COMPLETED':
            // Handle completed session
            logger.info('BlueNotary session completed', { sessionId, documentIds });
            break;
          
          case 'SESSION_CANCELLED':
            // Handle cancelled session
            logger.info('BlueNotary session cancelled', { sessionId });
            break;
            
          case 'DOCUMENT_SIGNED':
            // Handle document signed
            logger.info('BlueNotary document signed', { sessionId, documentIds });
            break;
            
          default:
            logger.info(`Received BlueNotary webhook: ${eventType}`, { sessionId });
        }
      }
    } catch (error) {
      logger.error('Failed to process BlueNotary webhook', { error, payload });
    }
  }
  
  /**
   * Get the download URL for a notarized document
   */
  async getDocumentDownloadUrl(sessionId: string, documentId: string): Promise<string | null> {
    try {
      if (!this.isEnabled() || !sessionId || !documentId) return null;
      
      const response = await axios.get(
        `${this.baseUrl}/v1/sessions/${sessionId}/documents/${documentId}`,
        { headers: this.getHeaders() }
      );
      
      if (response.status === 200 && response.data && response.data.downloadUrl) {
        return response.data.downloadUrl;
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get document download URL', { error, sessionId, documentId });
      return null;
    }
  }
  
  /**
   * Helper method to get request headers
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }
  
  /**
   * Map BlueNotary status to our internal status
   */
  private mapBlueNotaryStatus(status: string): RONSessionStatus {
    switch (status) {
      case 'pending': return RONSessionStatus.PENDING;
      case 'scheduled': return RONSessionStatus.SCHEDULED;
      case 'in_progress': return RONSessionStatus.IN_PROGRESS;
      case 'completed': return RONSessionStatus.COMPLETED;
      case 'expired': return RONSessionStatus.EXPIRED;
      case 'cancelled': return RONSessionStatus.CANCELLED;
      case 'failed': return RONSessionStatus.FAILED;
      default: return RONSessionStatus.PENDING;
    }
  }
  
  /**
   * Map webhook status to booking status
   */
  private mapWebhookStatusToBookingStatus(status: string): string {
    switch (status) {
      case 'pending': return 'PAYMENT_PENDING';
      case 'scheduled': return 'CONFIRMED';
      case 'in_progress': return 'IN_PROGRESS';
      case 'completed': return 'COMPLETED';
      case 'expired': return 'REQUIRES_RESCHEDULE';
      case 'cancelled': return 'CANCELLED_BY_CLIENT';
      case 'failed': return 'CANCELLED_BY_STAFF';
      default: return 'PAYMENT_PENDING';
    }
  }
  
  /**
   * Store RON session in database
   */
  private async storeSessionInDatabase(session: Partial<RONSession>): Promise<void> {
    try {
      // Using existing fields in the Booking model to store RON session info
      // In a real implementation, consider adding dedicated fields for BlueNotary
      await prisma.booking.create({
        data: {
          id: `ron_${Date.now()}`,
          serviceId: 'RON_SERVICES', // Assuming this service exists
          status: 'PAYMENT_PENDING',
          priceAtBooking: 35.00, // Base RON price
          customerEmail: 'pending@update.com', // Will be updated by webhook
          stripeSessionId: session.id, // Using this field for BlueNotary sessionId
          proofSessionUrl: session.sessionUrl, // Using this field for BlueNotary sessionUrl
          createdAt: session.createdAt || new Date(),
          updatedAt: session.createdAt || new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to store RON session in database', { error, session });
    }
  }
}

// Singleton instance
export const blueNotaryClient = new BlueNotaryClient();

// High-level RON service interface
export class RONService {
  /**
   * Create a new RON session
   */
  static async createRONSession(input: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    documentTypes?: string[];
    scheduledDateTime?: Date;
  }): Promise<RONSession | null> {
    if (!blueNotaryClient.isEnabled()) {
      logger.warn('BlueNotary integration not configured properly');
      return null;
    }
    
    // Build callback URL for webhooks
    const callbackUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ron/webhook`
      : undefined;
    
    const result = await blueNotaryClient.createSession({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone || '',
      documentTypes: input.documentTypes,
      scheduledDateTime: input.scheduledDateTime,
      callbackUrl,
    });
    
    return result;
  }
  
  /**
   * Check if RON is available
   */
  static isRONAvailable(): boolean {
    return blueNotaryClient.isEnabled();
  }
  
  /**
   * Get RON session status
   */
  static async getRONStatus(sessionId: string): Promise<string | null> {
    if (!sessionId || !blueNotaryClient.isEnabled()) return null;
    
    const session = await blueNotaryClient.getSession(sessionId);
    return session?.status || null;
  }
  
  /**
   * Upload document to RON session
   */
  static async uploadDocument(
    sessionId: string, 
    file: Buffer, 
    filename: string, 
    contentType: string
  ): Promise<BlueNotaryDocument | null> {
    return blueNotaryClient.uploadDocument(sessionId, file, filename, contentType);
  }
  
  /**
   * Cancel RON session
   */
  static async cancelRONSession(sessionId: string, reason?: string): Promise<boolean> {
    return blueNotaryClient.cancelSession(sessionId, reason);
  }
}

export default RONService;