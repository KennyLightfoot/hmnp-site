/**
 * Proof.com RON integration — DECOMMISSIONED
 *
 * RON sessions are now handled via Notary Hub UI and no longer via Proof.com.
 * This module is kept as a thin stub so existing imports continue to compile,
 * but all methods either return safe defaults or clearly indicate that the
 * legacy integration has been removed.
 */

import { logger } from '../logger';

// ---------------------------------------------------------------------------
// Shared types (kept minimal for compatibility)
// ---------------------------------------------------------------------------

// Matches the name used by existing callers; payload shape is now loosely typed.
export interface CreateTransactionRequest {
  title: string;
  description?: string;
  signers?: any[];
  documents?: any[];
  suppress_email?: boolean;
  metadata?: Record<string, any>;
}

// Minimal transaction shape used by callers; keeps existing type imports compiling.
export interface ProofTransaction {
  id: string;
  status: string;
  sessionUrl?: string;
  documents?: any[];
}

export interface ProofUploadResponse {
  documentId: string;
  uploadUrl?: string;
  downloadUrl?: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Stub client implementation
// ---------------------------------------------------------------------------

class ProofAPIClientStub {
  /**
   * Proof.com is no longer used; always returns false.
   */
  isEnabled(): boolean {
    return false;
  }

  /**
   * Legacy connection test – always false.
   */
  async testConnection(): Promise<boolean> {
    logger.info(
      '[ProofAPI] testConnection called but Proof.com integration is decommissioned. ' +
        'RON is now handled via Notary Hub UI.',
    );
    return false;
  }

  /**
   * Legacy transaction creation – logs and returns null.
   */
  async createTransaction(_request: CreateTransactionRequest): Promise<ProofTransaction | null> {
    logger.warn(
      '[ProofAPI] createTransaction called but Proof.com integration has been removed. ' +
        'RON sessions must be scheduled and managed via Notary Hub UI.',
    );
    return null;
  }

  /**
   * Legacy getTransaction – logs and returns null.
   */
  async getTransaction(_transactionId: string): Promise<ProofTransaction | null> {
    logger.warn(
      '[ProofAPI] getTransaction called but Proof.com integration has been removed. ' +
        'No Proof transaction details are available.',
    );
    return null;
  }

  /**
   * Legacy addDocument – logs and no-ops.
   */
  async addDocument(
    _transactionId: string,
    _document: {
      name: string;
      content: string;
      contentType: string;
      requiresNotarization?: boolean;
    },
  ): Promise<ProofUploadResponse | null> {
    logger.warn(
      '[ProofAPI] addDocument called but Proof.com integration has been removed. ' +
        'Document uploads must be handled via Notary Hub or the active RON provider.',
    );
    return {
      documentId: 'proof-decommissioned',
      status: 'noop',
    };
  }

  /**
   * Webhook validation stub – always returns false and logs once.
   */
  validateWebhook(_payload: string, _signature: string, _secret: string): boolean {
    logger.warn(
      '[ProofAPI] validateWebhook called but Proof.com webhooks are no longer supported. ' +
        'Any incoming Proof webhooks are ignored.',
    );
    return false;
  }
}

export const proofAPI = new ProofAPIClientStub();

// ---------------------------------------------------------------------------
// High-level RON service (stub)
// ---------------------------------------------------------------------------

/**
 * High-level RON service interface (stub).
 *
 * Kept for backwards compatibility. Returns `null` and logs that RON is now
 * handled via Notary Hub UI instead of Proof.com.
 */
export class RONService {
  static async createRONSession(input: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    documentTypes?: string[];
    scheduledDateTime?: Date;
  }): Promise<ProofTransaction | null> {
    logger.warn(
      '[RONService] createRONSession called but Proof.com RON integration has been decommissioned. ' +
        'RON sessions must be created and managed via Notary Hub UI.',
      {
        bookingId: input.id,
        customerEmail: input.customerEmail,
      },
    );
    return null;
  }

  static isRONAvailable(): boolean {
    return false;
  }

  static async getRONStatus(_transactionId: string): Promise<string | null> {
    logger.warn(
      '[RONService] getRONStatus called but Proof.com RON integration has been decommissioned. ' +
        'No Proof transaction status is available.',
    );
    return null;
  }
}

export default proofAPI;


