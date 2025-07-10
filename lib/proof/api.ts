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
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const response = await this.makeRequest('GET', '/transactions?limit=1');
      return response.ok;
    } catch (error) {
      logger.error('Proof API connection test failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Create a new RON transaction with minimal required fields
   */
  async createTransaction(request: CreateTransactionRequest): Promise<ProofTransaction | null> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot create transaction');
      return null;
    }

    try {
      logger.info('Creating Proof transaction', {
        signerCount: request.signers.length,
        title: request.title
      });

      // OFFICIAL PROOF.COM APPROACH: Use draft for transactions without documents
      const payload = {
        signers: request.signers.map(signer => ({
          email: signer.email,
          first_name: signer.name.split(' ')[0] || 'Customer',
          last_name: signer.name.split(' ').slice(1).join(' ') || 'User',
          // Only include phone if it exists
          ...(signer.phone && {
            phone: {
              country_code: "1",
              number: signer.phone.replace(/\D/g, '')
            }
          }),
          external_id: request.metadata?.bookingId || signer.email
        })),
        // CRITICAL: Create as draft when no documents (official Proof.com approach)
        draft: true
      };

      logger.info('Sending official Proof.com draft payload', { payload });

      const response = await this.makeRequest('POST', '/transactions', payload);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        logger.error('Proof API error details', {
          status: response.status,
          statusText: response.statusText,
          error: error,
          sentPayload: payload
        });
        throw new Error(`Proof API error: ${error.message || response.statusText}`);
      }

      const transaction = await response.json();

      logger.info('✅ Proof transaction created successfully', {
        transactionId: transaction.id,
        status: transaction.status,
        signerEmail: request.signers[0]?.email?.replace(/(.{2}).*(@.*)/, '$1***$2')
      });

      return {
        id: transaction.id,
        status: transaction.status || 'draft',
        title: request.title,
        signers: request.signers,
        documents: [], // Empty initially - draft transactions
        sessionUrl: transaction.signer_info?.transaction_access_link || null,
        createdAt: transaction.date_created || new Date().toISOString(),
        updatedAt: transaction.date_updated || new Date().toISOString(),
        metadata: request.metadata
      };

    } catch (error) {
      logger.error('❌ Failed to create Proof transaction', {
        error: error instanceof Error ? error.message : String(error),
        signerEmail: request.signers[0]?.email?.replace(/(.{2}).*(@.*)/, '$1***$2')
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
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Add document to an existing transaction
   */
  async addDocument(
    transactionId: string,
    document: ProofDocument
  ): Promise<boolean> {
    if (!this.isEnabled()) {
      logger.warn('Proof API not enabled - cannot add document');
      return false;
    }

    try {
      logger.info('Adding document to Proof transaction', {
        transactionId,
        documentName: document.name,
        contentType: document.contentType
      });

      // Format document for Proof API
      const documentPayload = {
        resource: document.content.startsWith('http') 
          ? document.content 
          : document.content.startsWith('data:') 
            ? document.content  // Already has data URL prefix
            : `data:application/pdf;base64,${document.content}`, // Add prefix only if needed
        document_name: document.name,
        requirement: document.requiresNotarization ? "notarization" : "esign"
      };

      const response = await this.makeRequest('POST', `/transactions/${transactionId}/documents`, documentPayload);

      if (!response.ok) {
        const error = await response.json() as any;
        logger.error('Failed to add document to Proof transaction', {
          transactionId,
          status: response.status,
          statusText: response.statusText,
          error: error
        });
        throw new Error(`Proof API error: ${error.message || response.statusText}`);
      }

      const result = await response.json();

      logger.info('Document added to Proof transaction', {
        transactionId,
        documentId: result.id,
        documentName: document.name,
        status: result.processing_state || 'added'
      });

      return true;

    } catch (error) {
      logger.error('Failed to add document to Proof transaction', {
        transactionId,
        documentName: document.name,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
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

    } catch (error: any) {
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

    } catch (error: any) {
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

    } catch (error: any) {
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

    } catch (error: any) {
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
    } catch (error: any) {
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
      'ApiKey': this.apiKey,
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
   * Create a complete RON session for a booking - SIMPLIFIED APPROACH
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
      logger.info('🔐 Creating RON session', {
        bookingId: booking.id,
        customerEmail: booking.customerEmail.replace(/(.{2}).*(@.*)/, '$1***$2')
      });

      // SIMPLIFIED: Only essential signer info
      const signers: ProofSigner[] = [
        {
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          role: 'signer',
          authenticationMethod: 'id_verification'
        }
      ];

      // SIMPLIFIED: Minimal transaction request
      const transaction = await proofAPI.createTransaction({
        title: `RON Session - ${booking.customerName}`,
        description: `Remote notarization for booking #${booking.id}`,
        signers,
        documents: [], // Always start empty
        metadata: {
          bookingId: booking.id,
          service: 'RON_SERVICES'
        }
      });

      if (transaction) {
        logger.info('✅ RON session created successfully', {
          bookingId: booking.id,
          transactionId: transaction.id,
          customerEmail: booking.customerEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
          sessionUrl: transaction.sessionUrl || 'No URL provided'
        });
        return transaction;
      } else {
        logger.error('❌ RON session creation returned null', {
          bookingId: booking.id,
          customerEmail: booking.customerEmail.replace(/(.{2}).*(@.*)/, '$1***$2')
        });
        return null;
      }

    } catch (error) {
      logger.error('❌ RON session creation failed', {
        bookingId: booking.id,
        customerEmail: booking.customerEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
        error: error instanceof Error ? error.message : String(error)
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