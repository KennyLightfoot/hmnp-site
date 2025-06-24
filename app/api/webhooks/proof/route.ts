import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyProofWebhook, ProofWebhookEvent, PROOF_STATUS_MAP } from '@/lib/proof/api';
import { logger } from '@/lib/logging/logger';
import { BookingStatus } from '@prisma/client';
import * as ghl from '@/lib/ghl';

/**
 * POST /api/webhooks/proof
 * Handle webhooks from Proof for transaction status updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-notarize-signature') || '';

    // Verify webhook signature (uses API key as secret per Proof docs)
    if (!verifyProofWebhook(body, signature)) {
      logger.warn('Invalid Proof webhook signature', { signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: ProofWebhookEvent = JSON.parse(body);
    
    logger.info('Received Proof webhook', {
      event: event.event,
      transactionId: event.data.transaction_id,
      status: event.data.status
    });

    // Find booking by Proof transaction ID
    const booking = await prisma.booking.findFirst({
      where: {
        proofTransactionId: event.data.transaction_id
      },
      include: {
        signer: true,
        service: true
      }
    });

    if (!booking) {
      logger.warn('No booking found for Proof transaction', {
        transactionId: event.data.transaction_id
      });
      return NextResponse.json({ 
        error: 'Booking not found',
        received: true // Still return 200 to prevent retries
      });
    }

    // Handle different webhook events
    switch (event.event) {
      case 'transaction_status_update':
        await handleTransactionStatusUpdate(event, booking);
        break;
      
      case 'user_failed_transaction':
        await handleUserFailedTransaction(event, booking);
        break;
      
      case 'meeting_started':
        await handleMeetingStarted(event, booking);
        break;
      
      case 'meeting_ended':
        await handleMeetingEnded(event, booking);
        break;
      
      default:
        logger.info('Unhandled Proof webhook event', { event: event.event });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('Failed to process Proof webhook:', error);
    
    return NextResponse.json(
      { error: 'Failed to process webhook' }, 
      { status: 500 }
    );
  }
}

/**
 * Handle transaction status updates
 */
async function handleTransactionStatusUpdate(
  event: ProofWebhookEvent, 
  booking: any
) {
  const { status, detailed_status } = event.data;
  
  if (!status) return;

  // Map Proof status to our booking status
  const newBookingStatus = PROOF_STATUS_MAP[status as keyof typeof PROOF_STATUS_MAP];
  
  const updateData: any = {
    proofStatus: status,
    updatedAt: new Date()
  };

  // Update booking status if we have a mapping
  if (newBookingStatus && newBookingStatus !== booking.status) {
    updateData.status = newBookingStatus;
  }

  // Handle specific statuses
  switch (status) {
    case 'sent':
      // Signer has been notified
      updateData.confirmationEmailSentAt = new Date();
      break;
      
    case 'received':
      // Signer has opened the invitation
      break;
      
    case 'completed':
      // Notarization completed successfully
      updateData.status = BookingStatus.COMPLETED;
      updateData.actualEndDateTime = new Date();
      break;
      
    case 'completed_with_rejections':
      // Some documents were rejected
      updateData.status = BookingStatus.REQUIRES_ATTENTION;
      updateData.notes = (booking.notes || '') + '\n\nSome documents were rejected during notarization.';
      break;
      
    case 'expired':
      updateData.status = BookingStatus.EXPIRED;
      break;
      
    case 'deleted':
      updateData.status = BookingStatus.CANCELLED;
      break;
  }

  // Update booking
  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: updateData
  });

  // Update GHL contact if applicable
  if (booking.ghlContactId) {
    try {
      await updateGHLContactForProofStatus(booking.ghlContactId, status, detailed_status);
    } catch (ghlError) {
      logger.error('Failed to update GHL contact for Proof status:', ghlError);
    }
  }

  logger.info('Updated booking from Proof webhook', {
    bookingId: booking.id,
    oldStatus: booking.status,
    newStatus: updatedBooking.status,
    proofStatus: status
  });
}

/**
 * Handle user failed transaction
 */
async function handleUserFailedTransaction(
  event: ProofWebhookEvent, 
  booking: any
) {
  const reason = event.data.details || 'Transaction failed';
  
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: BookingStatus.REQUIRES_ATTENTION,
      proofStatus: 'failed',
      notes: (booking.notes || '') + `\n\nProof transaction failed: ${reason}`,
      updatedAt: new Date()
    }
  });

  // Update GHL
  if (booking.ghlContactId) {
    try {
      await ghl.addTagsToContact(booking.ghlContactId, ['status:ron_failed']);
      await ghl.updateContact({
        id: booking.ghlContactId,
        customField: {
          cf_ron_session_status: 'FAILED',
          cf_ron_failure_reason: reason
        },
        locationId: process.env.GHL_LOCATION_ID || ''
      });
    } catch (ghlError) {
      logger.error('Failed to update GHL for failed transaction:', ghlError);
    }
  }

  logger.info('Handled failed Proof transaction', {
    bookingId: booking.id,
    reason
  });
}

/**
 * Handle meeting started
 */
async function handleMeetingStarted(
  event: ProofWebhookEvent, 
  booking: any
) {
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: BookingStatus.IN_PROGRESS,
      proofStatus: 'meeting_in_progress',
      updatedAt: new Date()
    }
  });

  // Update GHL
  if (booking.ghlContactId) {
    try {
      await ghl.updateContact({
        id: booking.ghlContactId,
        customField: {
          cf_ron_session_status: 'IN_PROGRESS',
          cf_ron_session_start_time: new Date().toISOString()
        },
        locationId: process.env.GHL_LOCATION_ID || ''
      });
    } catch (ghlError) {
      logger.error('Failed to update GHL for meeting start:', ghlError);
    }
  }

  logger.info('RON meeting started', {
    bookingId: booking.id,
    transactionId: event.data.transaction_id
  });
}

/**
 * Handle meeting ended
 */
async function handleMeetingEnded(
  event: ProofWebhookEvent, 
  booking: any
) {
  // Meeting ended - we'll wait for the transaction_status_update to determine final status
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      proofStatus: 'meeting_ended',
      updatedAt: new Date()
    }
  });

  logger.info('RON meeting ended', {
    bookingId: booking.id,
    transactionId: event.data.transaction_id
  });
}

/**
 * Update GHL contact with Proof status
 */
async function updateGHLContactForProofStatus(
  ghlContactId: string,
  status: string,
  detailedStatus?: string
) {
  const customFields: any = {
    cf_ron_session_status: status.toUpperCase(),
  };

  if (detailedStatus) {
    customFields.cf_ron_detailed_status = detailedStatus;
  }

  // Add status-specific updates
  switch (status) {
    case 'sent':
      customFields.cf_ron_invitation_sent_date = new Date().toISOString();
      break;
      
    case 'completed':
      customFields.cf_ron_completion_date = new Date().toISOString();
      customFields.cf_booking_status = 'COMPLETED';
      break;
      
    case 'expired':
      customFields.cf_booking_status = 'EXPIRED';
      break;
  }

  // Add appropriate tags
  const tagsToAdd: string[] = [];
  const tagsToRemove: string[] = [];

  switch (status) {
    case 'sent':
      tagsToAdd.push('status:ron_invited');
      tagsToRemove.push('status:ron_pending');
      break;
      
    case 'completed':
      tagsToAdd.push('status:ron_completed', 'status:service_completed');
      tagsToRemove.push('status:ron_in_progress', 'status:ron_invited');
      break;
      
    case 'expired':
      tagsToAdd.push('status:ron_expired');
      tagsToRemove.push('status:ron_invited', 'status:ron_in_progress');
      break;
  }

  if (tagsToAdd.length > 0) {
    await ghl.addTagsToContact(ghlContactId, tagsToAdd);
  }
  
  if (tagsToRemove.length > 0) {
    await ghl.removeTagsFromContact(ghlContactId, tagsToRemove);
  }

  await ghl.updateContact({
    id: ghlContactId,
    customField: customFields,
    locationId: process.env.GHL_LOCATION_ID || ''
  });
} 