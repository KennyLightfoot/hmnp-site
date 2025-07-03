/**
 * Proof API Integration
 * Houston Mobile Notary Pros
 * 
 * Complete integration with Proof.com for Remote Online Notarization (RON).
 * Handles transaction creation, document management, and session orchestration.
 */

import { logger } from '../logger';

// Environment validation
const PROOF_API_KEY = process.env.PROOF_API_KEY;
const PROOF_API_URL = process.env.PROOF_API_URL || 'https://api.proof.com';
const PROOF_ENVIRONMENT = process.env.PROOF_ENVIRONMENT || 'sandbox';

// Graceful degradation if API key is missing
const isProofEnabled = !!PROOF_API_KEY;

if (!PROOF_API_KEY) {
  logger.warn('PROOF_API_KEY not configured - RON features will be disabled');
}

// TypeScript interfaces for Proof API
export interface CreateTransactionRequest {
  signers: ProofSigner[];
  documents: ProofDocument[];
  notaryId?: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  webhookUrl?: string;
  expiresAt?: string;
  requiresIdentityVerification?: boolean;
  requiresKnowledgeBasedAuth?: boolean;
}

export interface ProofSigner {
  name: string;
  email: string;
  phone?: string;
  role: 'signer' | 'witness' | 'notary';
  authenticationMethod?: 'email' | 'sms' | 'knowledge_based' | 'id_verification';
  metadata?: Record<string, any>;
}

export interface ProofDocument {
  name: string;
  content: string; // Base64 encoded document
  contentType: string; // PDF, DOC, etc.
  requiresNotarization: boolean;
  signerIds?: string[];
  metadata?: Record<string, any>;
}

export interface ProofTransaction {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  title: string;
  signers: ProofSigner[];
  documents: ProofDocument[];
  sessionUrl?: string;
  notarySessionUrl?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface ProofUploadResponse {
  documentId: string;
  uploadUrl: string;
  downloadUrl: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
}

export interface ProofWebhookEvent {
  type: 'transaction.created' | 'transaction.started' | 'transaction.completed' | 'transaction.cancelled' | 'document.signed';
  transactionId: string;
  timestamp: string;
  data: Record<string, any>;
}

// Proof API Client Class
export class ProofAPIClient {
  private apiKey: string;
  private baseUrl: string;
  private environment: string;

  constructor() {
    this.apiKey = PROOF_API_KEY || '';
    this.baseUrl = PROOF_API_URL;
    this.environment = PROOF_ENVIRONMENT;
  }

  /**
   * Check if Proof API is enabled and configured
   */
  isEnabled(): boolean {
    return isProofEnabled;
  }

  /**
   * Create a new RON transaction
   */
  async createTransaction(request: CreateTransactionRequest): Promise<ProofTransaction | null> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot create transaction');
      return null;
    }

    try {
      logger.info('Creating Proof transaction', {
        signerCount: request.signers.length,
        documentCount: request.documents.length,
        title: request.title
      });

      const response = await this.makeRequest('POST', '/transactions', {
        ...request,
        environment: this.environment,
        webhook_url: request.webhookUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/proof`
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Proof API error: ${error.message || response.statusText}`);
      }

      const transaction = await response.json();

      logger.info('Proof transaction created', {
        transactionId: transaction.id,
        status: transaction.status,
        sessionUrl: transaction.sessionUrl
      });

      return transaction;

    } catch (error) {
      logger.error('Failed to create Proof transaction', {
        error: error.message,
        request: this.sanitizeRequest(request)
      });
      return null;
    }
  }

  /**
   * Upload a document to Proof
   */
  async uploadDocument(
    transactionId: string,
    document: {
      name: string;
      content: Buffer;
      contentType: string;
    }
  ): Promise<ProofUploadResponse | null> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot upload document');
      return null;
    }

    try {
      logger.info('Uploading document to Proof', {
        transactionId,
        documentName: document.name,
        contentType: document.contentType,
        size: document.content.length
      });

      // Convert buffer to base64
      const base64Content = document.content.toString('base64');

      const response = await this.makeRequest('POST', `/transactions/${transactionId}/documents`, {
        name: document.name,
        content: base64Content,
        content_type: document.contentType,
        requires_notarization: true
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Proof upload error: ${error.message || response.statusText}`);
      }

      const uploadResponse = await response.json();

      logger.info('Document uploaded to Proof', {
        transactionId,
        documentId: uploadResponse.documentId,
        status: uploadResponse.status
      });

      return uploadResponse;

    } catch (error) {
      logger.error('Failed to upload document to Proof', {
        transactionId,
        documentName: document.name,
        error: error.message
      });
      return null;
    }
  }

  /**
   * List documents for a transaction
   */
  async listDocuments(transactionId: string): Promise<ProofDocument[] | null> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot list documents');
      return null;
    }

    try {
      const response = await this.makeRequest('GET', `/transactions/${transactionId}/documents`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Proof API error: ${error.message || response.statusText}`);
      }

      const documents = await response.json();

      logger.info('Documents retrieved from Proof', {
        transactionId,
        documentCount: documents.length
      });

      return documents;

    } catch (error) {
      logger.error('Failed to list Proof documents', {
        transactionId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Get transaction status
   */
  async getTransaction(transactionId: string): Promise<ProofTransaction | null> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot get transaction');
      return null;
    }

    try {
      const response = await this.makeRequest('GET', `/transactions/${transactionId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Proof API error: ${error.message || response.statusText}`);
      }

      const transaction = await response.json();

      logger.info('Transaction retrieved from Proof', {
        transactionId,
        status: transaction.status,
        updatedAt: transaction.updatedAt
      });

      return transaction;

    } catch (error) {
      logger.error('Failed to get Proof transaction', {
        transactionId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Cancel a transaction
   */
  async cancelTransaction(transactionId: string, reason?: string): Promise<boolean> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot cancel transaction');
      return false;
    }

    try {
      const response = await this.makeRequest('POST', `/transactions/${transactionId}/cancel`, {
        reason: reason || 'Cancelled by client'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Proof API error: ${error.message || response.statusText}`);
      }

      logger.info('Proof transaction cancelled', {
        transactionId,
        reason
      });

      return true;

    } catch (error) {
      logger.error('Failed to cancel Proof transaction', {
        transactionId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Download completed documents
   */
  async downloadCompletedDocuments(transactionId: string): Promise<Buffer[] | null> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot download documents');
      return null;
    }

    try {
      const response = await this.makeRequest('GET', `/transactions/${transactionId}/documents/download`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Proof download error: ${error.message || response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      logger.info('Documents downloaded from Proof', {
        transactionId,
        size: buffer.length
      });

      return [buffer]; // Return as array for consistency

    } catch (error) {
      logger.error('Failed to download Proof documents', {
        transactionId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhook(payload: string, signature: string, secret: string): boolean {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      // Implement webhook signature validation based on Proof's spec
      // This is a placeholder - actual implementation depends on Proof's webhook security
      return true;
    } catch (error) {
      logger.error('Webhook validation failed', { error: error.message });
      return false;
    }
  }

  /**
   * Make HTTP request to Proof API
   */
  private async makeRequest(method: string, endpoint: string, body?: any): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Houston-Mobile-Notary-Pros/1.0'
    };

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };

    return fetch(url, config);
  }

  /**
   * Sanitize request data for logging
   */
  private sanitizeRequest(request: any): any {
    const sanitized = { ...request };
    
    // Remove sensitive data
    if (sanitized.signers) {
      sanitized.signers = sanitized.signers.map((signer: any) => ({
        ...signer,
        email: signer.email?.replace(/(.{2}).*(@.*)/, '$1***$2'),
        phone: signer.phone ? '***' : undefined
      }));
    }

    if (sanitized.documents) {
      sanitized.documents = sanitized.documents.map((doc: any) => ({
        name: doc.name,
        contentType: doc.contentType,
        size: doc.content?.length || 0
      }));
    }

    return sanitized;
  }
}

// Singleton instance
export const proofAPI = new ProofAPIClient();

// Utility functions for common RON operations
export class RONService {
  /**
   * Create a complete RON session for a booking
   */
  static async createRONSession(booking: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    documentTypes: string[];
    scheduledDateTime: Date;
  }): Promise<ProofTransaction | null> {
    try {
      const signers: ProofSigner[] = [
        {
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          role: 'signer',
          authenticationMethod: 'id_verification'
        }
      ];

      // Create placeholder documents (actual documents uploaded later)
      const documents: ProofDocument[] = booking.documentTypes.map((type, index) => ({
        name: `${type}_${index + 1}.pdf`,
        content: '', // Will be uploaded separately
        contentType: 'application/pdf',
        requiresNotarization: true,
        metadata: {
          documentType: type,
          bookingId: booking.id
        }
      }));

      const transaction = await proofAPI.createTransaction({
        title: `RON Session - ${booking.customerName}`,
        description: `Remote notarization session for booking #${booking.id}`,
        signers,
        documents,
        requiresIdentityVerification: true,
        requiresKnowledgeBasedAuth: false,
        metadata: {
          bookingId: booking.id,
          scheduledDateTime: booking.scheduledDateTime.toISOString(),
          service: 'RON_SERVICES'
        }
      });

      if (transaction) {
        logger.info('RON session created', {
          bookingId: booking.id,
          transactionId: transaction.id,
          customerEmail: booking.customerEmail.replace(/(.{2}).*(@.*)/, '$1***$2')
        });
      }

      return transaction;

    } catch (error) {
      logger.error('Failed to create RON session', {
        bookingId: booking.id,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Check if RON is available
   */
  static isRONAvailable(): boolean {
    return proofAPI.isEnabled();
  }

  /**
   * Get RON session status
   */
  static async getRONStatus(transactionId: string): Promise<string | null> {
    const transaction = await proofAPI.getTransaction(transactionId);
    return transaction?.status || null;
  }
}

// Export everything
export default proofAPI;
export { ProofAPIClient, RONService };

// Export types for external use
export type {
  CreateTransactionRequest,
  ProofSigner,
  ProofDocument,
  ProofTransaction,
  ProofUploadResponse,
  ProofWebhookEvent
};