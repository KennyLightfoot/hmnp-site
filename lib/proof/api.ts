/**
 * Proof RON API Integration
 * Houston Mobile Notary Pros
 * 
 * Handles all Proof.co API interactions for Remote Online Notarization
 */

import { logger } from '@/lib/logging/logger';

// Environment configuration
const PROOF_CONFIG = {
  apiKey: process.env.PROOF_API_KEY,
  baseUrl: process.env.PROOF_API_BASE_URL || process.env.PROOF_BASE_URL || 'https://api.proof.com',
  webhookSecret: process.env.PROOF_WEBHOOK_SECRET,
  organizationId: process.env.PROOF_ORGANIZATION_ID,
  environment: process.env.PROOF_ENVIRONMENT || 'sandbox',
  redirectUrl: process.env.PROOF_REDIRECT_URL,
  redirectMessage: process.env.PROOF_REDIRECT_MESSAGE,
  forceRedirect: process.env.PROOF_FORCE_REDIRECT === 'true'
} as const;

// Proof API Types
export interface ProofSigner {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: {
    country_code: string;
    number: string;
  };
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
}

export interface ProofDocument {
  resource: string; // URL or base64
  document_name: string;
  requirement?: 'notarization' | 'witness' | 'acknowledgment';
}

export interface ProofTransaction {
  id: string;
  status: string;
  detailed_status: string;
  date_created: string;
  date_updated: string;
  signer_info: {
    email: string;
    first_name: string;
    last_name: string;
    transaction_access_link: string;
  };
  documents: Array<{
    id: string;
    document_name: string;
    final_document_url?: string;
  }>;
  notarization_record?: string;
}

export interface CreateTransactionRequest {
  signers: ProofSigner[];
  documents?: ProofDocument[];
  transaction_name?: string;
  transaction_type?: string;
  message_to_signer?: string;
  external_id?: string;
  suppress_email?: boolean;
  redirect?: {
    url?: string;
    message?: string;
    force?: boolean;
  };
}

export interface ProofWebhookEvent {
  event: string;
  data: {
    transaction_id: string;
    status?: string;
    detailed_status?: string;
    details?: string;
  };
}

export class ProofAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public proofError?: any
  ) {
    super(message);
    this.name = 'ProofAPIError';
  }
}

/**
 * Proof API Client
 */
export class ProofAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || PROOF_CONFIG.apiKey || '';
    this.baseUrl = baseUrl || PROOF_CONFIG.baseUrl;

    if (!this.apiKey) {
      throw new ProofAPIError('Proof API key is required');
    }
  }

  /**
   * Make authenticated request to Proof API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use v2 for production API (per latest Proof docs)
    const apiVersion = PROOF_CONFIG.environment === 'production' ? 'v2' : 'v1';
    const url = `${this.baseUrl}/${apiVersion}/${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'ApiKey': this.apiKey,
        'Content-Type': 'application/json',
        // Add User-Agent for better API tracking
        'User-Agent': 'Houston-Mobile-Notary-Pros/1.0',
        ...options.headers,
      },
    };

    logger.info(`Making Proof API request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        logger.error(`Proof API error: ${response.status} ${response.statusText}`, {
          error: data
        });
        
        throw new ProofAPIError(
          (typeof data === 'object' && data?.message) || 
          (typeof data === 'object' && data?.error) || 
          `Proof API error: ${response.statusText}`,
          response.status,
          data
        );
      }

      logger.info(`Proof API request successful: ${endpoint} - ${response.status}`);
      return data;
    } catch (error) {
      if (error instanceof ProofAPIError) {
        throw error;
      }
      
      logger.error(`Proof API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new ProofAPIError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new notarization transaction
   */
  async createTransaction(request: CreateTransactionRequest): Promise<ProofTransaction> {
    return this.request<ProofTransaction>('transactions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Add documents to an existing transaction
   */
  async addDocument(
    transactionId: string,
    document: ProofDocument
  ): Promise<void> {
    return this.request(`transactions/${transactionId}/documents`, {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  /**
   * Get transaction details
   */
  async getTransaction(transactionId: string): Promise<ProofTransaction> {
    return this.request<ProofTransaction>(`transactions/${transactionId}`);
  }

  /**
   * Get notarization record (available after completion)
   */
  async getNotarizationRecord(
    transactionId: string,
    recordId: string
  ): Promise<any> {
    return this.request(
      `transactions/${transactionId}/notarization_records/${recordId}`
    );
  }

  /**
   * Download completed document
   */
  async downloadDocument(documentUrl: string): Promise<Response> {
    return fetch(documentUrl, {
      headers: {
        'ApiKey': this.apiKey,
      },
    });
  }

  /**
   * Cancel/delete a transaction
   */
  async cancelTransaction(transactionId: string): Promise<void> {
    return this.request(`transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Webhook signature verification
 * Per Proof docs: uses API key as the secret with SHA256 HMAC
 */
export function verifyProofWebhook(
  payload: string,
  signature: string
): boolean {
  // Use API key as secret per Proof documentation
  const secret = PROOF_CONFIG.apiKey;

  if (!secret || !signature) {
    logger.warn('Proof webhook verification failed: missing API key or signature');
    return false;
  }

  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Proof sends signature in format: just the hex string (no prefix)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      logger.warn('Proof webhook signature verification failed', {
        expected: expectedSignature,
        received: signature
      });
    }

    return isValid;
  } catch (error) {
    logger.error('Proof webhook verification error:', error);
    return false;
  }
}

/**
 * Default Proof API instance
 */
export const proofAPI = new ProofAPI();

/**
 * Proof transaction status mappings
 */
export const PROOF_STATUS_MAP = {
  // Proof statuses -> Our booking statuses
  'started': 'AWAITING_CLIENT_ACTION',
  'sent': 'READY_FOR_SERVICE', 
  'received': 'READY_FOR_SERVICE',
  'completed': 'COMPLETED',
  'completed_with_rejections': 'REQUIRES_ATTENTION',
  'deleted': 'CANCELLED',
  'expired': 'EXPIRED',
} as const;

export const PROOF_DETAILED_STATUS_MAP = {
  'draft': 'Documents being prepared',
  'active': 'Ready for signing',
  'sent_to_signer': 'Invitation sent to signer',
  'viewed': 'Signer has viewed documents',
  'meeting_in_progress': 'Notary session in progress',
  'attempted': 'Session was interrupted',
  'complete': 'Notarization completed successfully',
  'complete_with_rejections': 'Completed with some document rejections',
  'awaiting_payment': 'Waiting for payment processing',
} as const; 