/**
 * Simulated RON Checkout API (DEV ONLY)
 * 
 * This endpoint simulates a successful Stripe checkout and webhook for RON services
 * without requiring an actual Stripe payment. For development and testing purposes only.
 * 
 * IMPORTANT: This should never be deployed to production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Import handlers
let stripeWebhookHandler: any;
try {
  // Dynamic import to avoid circular dependencies
  const stripeWebhookModule = require('../../webhooks/stripe/route');
  stripeWebhookHandler = stripeWebhookModule.handleWebhookEvent;
} catch (error) {
  console.error('Failed to import Stripe webhook handler:', error);
}

// Validation schema
const SimulateRONCheckoutSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().optional(),
  documentType: z.string().default('GENERAL'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Prevent this endpoint from being used in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is not available in production' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request
    const validationResult = SimulateRONCheckoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Create mock Stripe session
    const mockSession = {
      id: `cs_test_${Date.now()}`,
      payment_intent: `pi_test_${Date.now()}`,
      payment_status: 'paid',
      status: 'complete',
      customer_details: {
        email: data.customerEmail,
        name: data.customerName
      },
      metadata: {
        isRON: 'true',
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone || '',
        documentType: data.documentType,
        notes: data.notes || '',
        source: 'dev_test_tool'
      },
      amount_total: 3500,
      currency: 'usd'
    };
    
    // Create mock webhook event
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: mockSession
      }
    };

    // Log simulation
    logger.info('Simulating RON checkout and webhook', {
      session: mockSession.id,
      customer: mockSession.metadata.customerName,
      email: mockSession.metadata.customerEmail
    });
    
    // Call webhook handler directly if available
    let webhookResult = { message: 'Webhook handler not available' };
    if (stripeWebhookHandler) {
      try {
        webhookResult = await stripeWebhookHandler(mockEvent);
        logger.info('Webhook handler executed', { result: webhookResult });
      } catch (webhookError: any) {
        logger.error('Webhook handler failed', { error: webhookError.message });
        webhookResult = { 
          error: true,
          message: 'Webhook handler failed: ' + webhookError.message 
        };
      }
    }
    
    // Return simulation result
    return NextResponse.json({
      success: true,
      message: 'Successfully simulated RON checkout session',
      session: mockSession,
      webhookResult
    });
    
  } catch (error: any) {
    logger.error('Error simulating RON checkout', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to simulate checkout', message: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';