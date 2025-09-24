import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { proofAPI } from '@/lib/proof/api';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Webhook handler for Proof.com RON session updates
 * Handles transaction status changes and updates booking records
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-proof-signature') || '';
    const webhookSecret = process.env.PROOF_WEBHOOK_SECRET || '';

    // Validate webhook signature (if secret is configured)
    if (webhookSecret) {
      const isValid = proofAPI.validateWebhook(body, signature, webhookSecret);
      if (!isValid) {
        logger.warn('Invalid Proof.com webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    logger.info('Proof.com webhook received', {
      type: event.type,
      transactionId: event.transactionId,
      timestamp: event.timestamp
    });

    // Handle different event types
    switch (event.type) {
      case 'transaction.created':
        await handleTransactionCreated(event);
        break;
      
      case 'transaction.started':
        await handleTransactionStarted(event);
        break;
        
      case 'transaction.completed':
        await handleTransactionCompleted(event);
        break;
        
      case 'transaction.cancelled':
        await handleTransactionCancelled(event);
        break;
        
      case 'document.signed':
        await handleDocumentSigned(event);
        break;
        
      default:
        logger.info('Unknown Proof.com webhook event type', { type: event.type });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Proof.com webhook processing failed', {
      error: error instanceof Error ? getErrorMessage(error) : String(error)
    });
    
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}

async function handleTransactionCreated(event: any) {
  // Transaction created - update booking status
  await updateBookingFromProofEvent(event.transactionId, {
    idVerificationStatus: 'created',
    notes: 'Proof.com RON session created and ready'
  });
}

async function handleTransactionStarted(event: any) {
  // Customer joined the session
  await updateBookingFromProofEvent(event.transactionId, {
    idVerificationStatus: 'in_progress',
    notes: 'RON session started - customer joined'
  });
}

async function handleTransactionCompleted(event: any) {
  // Notarization completed successfully
  await updateBookingFromProofEvent(event.transactionId, {
    idVerificationStatus: 'completed',
    status: 'COMPLETED',
    notes: 'RON session completed successfully'
  });
}

async function handleTransactionCancelled(event: any) {
  // Session was cancelled
  await updateBookingFromProofEvent(event.transactionId, {
    idVerificationStatus: 'cancelled',
    notes: 'RON session was cancelled'
  });
}

async function handleDocumentSigned(event: any) {
  // Document signing completed
  await updateBookingFromProofEvent(event.transactionId, {
    idVerificationStatus: 'signed',
    notes: 'Document signed in RON session'
  });
}

async function updateBookingFromProofEvent(transactionId: string, updates: any) {
  try {
    // Find booking by Proof transaction ID (stored in kbaStatus field)
    const booking = await prisma.booking.findFirst({
      where: {
        kbaStatus: {
          contains: transactionId
        }
      }
    });

    if (!booking) {
      logger.warn('Booking not found for Proof transaction', { transactionId });
      return;
    }

    // Update booking with new status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        ...updates,
        notes: `${booking.notes || ''}\n${new Date().toISOString()}: ${updates.notes}`
      }
    });

    logger.info('Booking updated from Proof webhook', {
      bookingId: booking.id,
      transactionId,
      updates
    });

  } catch (error) {
    logger.error('Failed to update booking from Proof event', {
      transactionId,
      error: error instanceof Error ? getErrorMessage(error) : String(error)
    });
  }
} 
