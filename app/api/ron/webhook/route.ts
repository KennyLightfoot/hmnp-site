/**
 * BlueNotary Webhook Handler
 * 
 * This API route handles incoming webhooks from BlueNotary
 * for status updates on RON sessions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { blueNotaryClient } from '@/lib/ron/bluenotary';

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature validation
    const rawBody = await request.text();
    
    // Get the signature from the headers
    const signature = request.headers.get('x-bluenotary-signature') || '';
    
    // Validate the webhook
    const isValid = blueNotaryClient.validateWebhook(rawBody, signature);
    
    if (!isValid) {
      logger.warn('Invalid BlueNotary webhook signature', {
        signature,
      });
      
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      logger.error('Failed to parse BlueNotary webhook payload', { error });
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    
    // Process the webhook
    await blueNotaryClient.processWebhook(payload);
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing BlueNotary webhook', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}