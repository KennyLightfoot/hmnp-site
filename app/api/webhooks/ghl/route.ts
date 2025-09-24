import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Enhanced webhook signature verification - Fixed for GHL base64 signatures
function verifyGHLWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  try {
    // GHL v2 sends base64-encoded signatures
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('base64');
    
    // Direct string comparison for base64 signatures
    if (signature === expectedSignature) {
      return true;
    }
    
    // Try with sha256= prefix removed
    if (signature.startsWith('sha256=')) {
      const cleanSignature = signature.substring(7);
      return cleanSignature === expectedSignature;
    }
    
    // Fallback: Try hex comparison for older webhooks
    const expectedHex = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    if (signature === expectedHex || signature === `sha256=${expectedHex}`) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Signature verification error:', getErrorMessage(error));
    return false;
  }
}

// Helper function to detect GitHub notifications
function isGitHubNotification(body: any): boolean {
  // Check for GitHub-specific indicators
  if (body.messageType === 'Email' && 
      (body.from?.includes('notifications@github.com') || 
       body.subject?.includes('GitHub') ||
       body.subject?.includes('CI Pipeline') ||
       body.subject?.includes('Run failed') ||
       body.subject?.includes('workflow run'))) {
    return true;
  }
  
  // Check for HTML content containing GitHub elements
  if (body.body && typeof body.body === 'string' && 
      (body.body.includes('github.githubassets.com') ||
       body.body.includes('GitHub Actions') ||
       body.body.includes('workflow run'))) {
    return true;
  }
  
  return false;
}

// Define webhook event types
type WebhookEventType = 
  | 'ContactCreate'
  | 'ContactUpdate'
  | 'ContactTagUpdate'
  | 'OpportunityCreate'
  | 'OpportunityStatusUpdate'
  | 'AppointmentCreate'
  | 'AppointmentUpdate'
  | 'ContactCustomFieldUpdate'
  | 'FormSubmit'
  | 'TaskCreate'
  | 'TaskUpdate'
  | 'TaskComplete'
  | 'contact.created'
  | 'contact.updated'
  | 'contact.tag_update'
  | 'opportunity.created'
  | 'opportunity.status_update'
  | 'appointment.created'
  | 'appointment.scheduled'
  | 'appointment.updated'
  | 'appointment.cancelled'
  | 'InboundMessage';

// EMERGENCY: Rate limiting to prevent webhook spam
const webhookRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 webhooks per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  
  const current = webhookRateLimit.get(key);
  if (!current || now > current.resetTime) {
    webhookRateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (current.count >= RATE_LIMIT_MAX) {
    logger.warn('Webhook rate limit exceeded', 'GHL_WEBHOOK', { ip });
    return false;
  }
  
  current.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // EMERGENCY: Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded - too many webhook requests'
      }, { status: 429 });
    }

    // Get the raw body for signature verification (if needed)
    const rawBody = await request.text();
    let body: any;
    
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    const eventType = body.type || body.event_type;
    
    // 🚫 Filter out GitHub notifications
    if (isGitHubNotification(body)) {
      console.log('🚫 Ignoring GitHub notification webhook');
      return NextResponse.json({ 
        status: 'ignored',
        message: 'GitHub notification - not processed',
        type: eventType,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('📥 GHL Webhook received:', {
      type: eventType,
      timestamp: new Date().toISOString(),
      hasData: !!body
    });

    // 🔧 DIAGNOSTIC: GHL Setup Mode - acknowledge but don't process during integration setup
    if (process.env.GHL_SETUP_MODE === 'true') {
      console.log('🔧 GHL Setup Mode: Acknowledging webhook but not processing');
      return NextResponse.json({ 
        status: 'acknowledged',
        message: 'Setup mode - webhook received but not processed',
        received: true,
        setupMode: true,
        eventType: eventType,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log the webhook event for debugging
    const headersList = await headers();
    console.log('GHL Webhook received:', {
      type: body.type,
      contactId: body.contactId,
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(headersList.entries()),
      payload: body
    });

    // Authentication: accept either signed global webhooks OR workflow shared-secret header
    const configuredSignatureSecret = process.env.GHL_WEBHOOK_SECRET;
    const configuredWorkflowSecret = process.env.GHL_WORKFLOW_SHARED_SECRET;

    // Only enforce auth if at least one secret is configured
    if (configuredSignatureSecret || configuredWorkflowSecret) {
      let signatureValid = false;
      let sharedSecretValid = false;

      // Try signed verification (global GHL webhooks)
      if (configuredSignatureSecret) {
        const signature = headersList.get('x-ghl-signature') || headersList.get('x-wh-signature');
        if (signature) {
          signatureValid = verifyGHLWebhookSignature(rawBody, signature, configuredSignatureSecret);
          if (signatureValid) {
            console.log('✅ Webhook signature verified');
          }
        }
      }

      // Try shared-secret header (workflow webhooks)
      if (!signatureValid && configuredWorkflowSecret) {
        const sharedSecretHeader =
          headersList.get('x-webhook-secret') ||
          headersList.get('x-shared-secret') ||
          headersList.get('x-workflow-secret');

        if (sharedSecretHeader && sharedSecretHeader === configuredWorkflowSecret) {
          sharedSecretValid = true;
          console.log('✅ Webhook shared-secret header verified');
        }
      }

      if (!signatureValid && !sharedSecretValid) {
        console.error('❌ Unauthorized webhook: missing or invalid auth');
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized webhook',
            details:
              'Provide a valid x-ghl-signature (with GHL global webhook signing) or a matching X-Webhook-Secret header (workflow secret).',
          },
          { status: 401 }
        );
      }
    }

    // Extract event type and data
    const { type, contactId, contact, opportunity, appointment, customField, form, task } = body;

    // Process different webhook events with mock handlers during setup
    switch (type as WebhookEventType) {
      case 'ContactCreate':
      case 'contact.created':
        console.log('📞 Contact created webhook:', contactId);
        return await handleContactWebhook(body);

      case 'ContactUpdate':
      case 'contact.updated':
        console.log('📞 Contact updated webhook:', contactId);
        return await handleContactWebhook(body);

      case 'ContactTagUpdate':
      case 'contact.tag_update':
        console.log('📞 Contact tags updated:', contactId);
        return await handleContactWebhook(body);

      case 'OpportunityCreate':
      case 'opportunity.created':
        console.log('💼 Opportunity created:', opportunity?.id);
        return await handleOpportunityWebhook(body);

      case 'OpportunityStatusUpdate':
      case 'opportunity.status_update':
        console.log('💼 Opportunity status updated:', opportunity?.id);
        return await handleOpportunityWebhook(body);

      case 'AppointmentCreate':
      case 'appointment.created':
      case 'appointment.scheduled':
        console.log('📅 Appointment created:', appointment?.id);
        return await handleAppointmentWebhook(body);

      case 'AppointmentUpdate':
      case 'appointment.updated':
      case 'appointment.cancelled':
        console.log('📅 Appointment updated:', appointment?.id);
        return await handleAppointmentWebhook(body);

      case 'ContactCustomFieldUpdate':
        console.log('📝 Custom field updated:', contactId);
        return await handleContactWebhook(body);

      case 'FormSubmit':
        console.log('Form submitted:', form?.id);
        await handleFormSubmit({ form, contactId, timestamp: body.timestamp });
        break;

      case 'TaskCreate':
      case 'TaskUpdate':
      case 'TaskComplete':
        console.log(`Task event ${type}:`, task?.id);
        await handleTaskEvent({ type, task, contactId, timestamp: body.timestamp });
        break;

      default:
        console.log('ℹ️ Unhandled webhook type:', type);
        return NextResponse.json({ 
          status: 'acknowledged', 
          type: type,
          message: 'Webhook type not yet implemented',
          timestamp: new Date().toISOString()
        });
    }

    // Store webhook data for analytics/debugging (optional)
    if (process.env.STORE_WEBHOOK_DATA === 'true') {
      await storeWebhookEvent({
        type,
        payload: body,
        timestamp: new Date().toISOString(),
        processed: true
      });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      type: type,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('GHL Webhook error:', getErrorMessage(error));
    
    // Log error details for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: getErrorMessage(error),
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Webhook processing failed',
        message: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 🔧 DIAGNOSTIC: Mock webhook handlers for GHL integration testing
async function handleContactWebhook(body: any) {
  console.log('📞 Contact webhook (mock implementation):', body.contact?.email || body.contactId);
  return NextResponse.json({ 
    status: 'acknowledged', 
    type: 'contact',
    mockProcessed: true,
    contactId: body.contactId,
    timestamp: new Date().toISOString()
  });
}

async function handleAppointmentWebhook(body: any) {
  console.log('📅 Appointment webhook (mock implementation):', body.appointment?.id);
  return NextResponse.json({ 
    status: 'acknowledged', 
    type: 'appointment',
    mockProcessed: true,
    appointmentId: body.appointment?.id,
    timestamp: new Date().toISOString()
  });
}

async function handleOpportunityWebhook(body: any) {
  console.log('💼 Opportunity webhook (mock implementation):', body.opportunity?.id);
  return NextResponse.json({ 
    status: 'acknowledged', 
    type: 'opportunity',
    mockProcessed: true,
    opportunityId: body.opportunity?.id,
    timestamp: new Date().toISOString()
  });
}

// Legacy handler functions for backward compatibility (unused in mock mode)
async function handleContactCreate(data: any) {
  console.log('📞 Contact created (legacy handler):', data.contactId);
}

async function handleContactUpdate(data: any) {
  console.log('📞 Contact updated (legacy handler):', data.contactId);
}

async function handleContactTagUpdate(data: any) {
  console.log('📞 Contact tags updated (legacy handler):', data.contactId);
}

async function handleOpportunityCreate(data: any) {
  console.log('💼 Opportunity created (legacy handler):', data.opportunity?.id);
}

async function handleOpportunityStatusUpdate(data: any) {
  console.log('💼 Opportunity status updated (legacy handler):', data.opportunity?.id);
}

async function handleAppointmentCreate(data: any) {
  console.log('📅 Appointment created (legacy handler):', data.appointment?.id);
}

async function handleAppointmentUpdate(data: any) {
  console.log('📅 Appointment updated (legacy handler):', data.appointment?.id);
}

async function handleCustomFieldUpdate(data: any) {
  console.log('📝 Custom field updated (legacy handler):', data.contactId);
}

async function handleFormSubmit(data: any) {
  console.log('📋 Form submitted (legacy handler):', data.form?.id);
}

async function handleTaskEvent(data: any) {
  console.log('✅ Task event (legacy handler):', data.task?.id);
}

async function storeWebhookEvent(data: any) {
  // Implement webhook storage logic if needed
  console.log('Storing webhook event:', data);
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    message: 'GHL Webhook endpoint is active',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, HEAD, OPTIONS',
      'Content-Type': 'application/json',
    },
  });
} 
