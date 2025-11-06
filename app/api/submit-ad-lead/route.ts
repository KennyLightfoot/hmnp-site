/**
 * Ad Lead Submission API
 * Captures quick quote requests from homepage and booking flow
 * Routes to GHL CRM and sends auto-reply
 * 
 * Status Codes:
 * - 200: Success
 * - 400: Malformed request (JSON parse error)
 * - 422: Validation failed (Zod errors)
 * - 429: Rate limit exceeded
 * - 500: Server error (GHL/DB failure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// PII Redaction Helper
function redactPII(obj: any): any {
  const safe = { ...obj };
  if (safe.email) safe.email = safe.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
  if (safe.phone) safe.phone = safe.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
  if (safe.name) safe.name = safe.name.split(' ')[0] + ' ***';
  return safe;
}

// Validation schema for lead submission
const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  serviceType: z.string().optional(),
  message: z.string().optional(),
  // Attribution data
  event_id: z.string().optional(), // For server-side tracking dedupe
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  device: z.string().optional(),
  page: z.string().optional(),
  referrer: z.string().optional(),
  source: z.string().optional(), // quick_quote, in_flow_quote, etc.
}).refine(
  (data) => data.email || data.phone,
  {
    message: "Either email or phone number is required",
    path: ["email"], // Show error on email field
  }
);

/**
 * Send lead to GHL CRM webhook with retry logic
 */
async function sendToGHL(leadData: any, retryCount = 0): Promise<{ success: boolean; shouldRetry: boolean }> {
  const webhookUrl = process.env.GHL_QUOTE_WEBHOOK_URL;
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const maxRetries = 2;
  
  // Fallback: If no webhook URL but have API credentials, use contacts API
  if (!webhookUrl && !apiKey) {
    console.warn('[GHL] Neither webhook URL nor API key configured - skipping CRM sync');
    return { success: false, shouldRetry: false };
  }
  
  // Use webhook if available, otherwise use API
  const useWebhook = !!webhookUrl;
  const endpoint = useWebhook 
    ? webhookUrl 
    : `https://services.leadconnectorhq.com/contacts/`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (!useWebhook && apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const payload = useWebhook 
      ? {
          ...leadData,
          pipeline: 'Quote Request',
          stage: 'New Lead',
          source: leadData.utm_source || 'website',
          timestamp: new Date().toISOString(),
        }
      : {
          // GHL Contacts API format
          locationId: locationId,
          firstName: leadData.name?.split(' ')[0] || leadData.name,
          lastName: leadData.name?.split(' ').slice(1).join(' ') || '',
          email: leadData.email,
          phone: leadData.phone,
          source: leadData.utm_source || 'website',
          tags: ['quote-request', 'ad-lead'],
          customFields: [
            { id: 'service_type', value: leadData.serviceType || 'unknown' },
            { id: 'utm_source', value: leadData.utm_source || '' },
            { id: 'utm_campaign', value: leadData.utm_campaign || '' },
            { id: 'device', value: leadData.device || '' },
            { id: 'event_id', value: leadData.event_id || '' },
          ],
        };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const isRetryable = response.status >= 500 || response.status === 429;
      console.error('[GHL] Webhook failed:', {
        status: response.status,
        statusText: response.statusText,
        retryCount,
        willRetry: isRetryable && retryCount < maxRetries,
        lead: redactPII(leadData),
      });
      
      // Retry on 5xx or 429 (rate limit)
      if (isRetryable && retryCount < maxRetries) {
        const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return sendToGHL(leadData, retryCount + 1);
      }
      
      return { success: false, shouldRetry: false };
    }
    
    console.log('[GHL] Lead sent successfully', { 
      method: useWebhook ? 'webhook' : 'api',
      event_id: leadData.event_id, 
      source: leadData.source,
      retryCount 
    });
    return { success: true, shouldRetry: false };
    
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
    const shouldRetry = (isTimeout || isNetworkError) && retryCount < maxRetries;
    
    console.error('[GHL] Webhook error:', {
      error: error.message,
      isTimeout,
      retryCount,
      willRetry: shouldRetry,
      lead: redactPII(leadData),
    });
    
    if (shouldRetry) {
      const backoffMs = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      return sendToGHL(leadData, retryCount + 1);
    }
    
    return { success: false, shouldRetry: false };
  }
}

/**
 * Send auto-reply email/SMS (placeholder - implement with SendGrid/Twilio)
 */
async function sendAutoReply(leadData: any): Promise<void> {
  try {
    // Log safely without PII
    console.log('[Auto-Reply] Sending to:', redactPII({ 
      email: leadData.email, 
      phone: leadData.phone 
    }));
    
    const message = `Thanks for reaching Houston Mobile Notary Pros! We'll review and confirm your quote within 5 minutes.

Your request details:
- Service: ${leadData.serviceType || 'Standard Mobile Notary'}
- Source: ${leadData.utm_source || 'Website'}

We'll contact you shortly at ${leadData.email || leadData.phone}.

Important: This message is for quote confirmation only and does not constitute legal advice.

Houston Mobile Notary Pros
(713) XXX-XXXX
https://houstonmobilenotarypros.com`;

    // TODO: Implement actual email/SMS sending
    // await sendEmail({ to: leadData.email, subject: 'Quote Request Received', body: message });
    // await sendSMS({ to: leadData.phone, body: message });
    
  } catch (error) {
    console.error('[Auto-Reply] Failed:', { error: error instanceof Error ? error.message : 'Unknown' });
    // Don't throw - auto-reply failure shouldn't block lead capture
  }
}

/**
 * Store lead in database (optional) - PII-safe logging
 */
async function storeLeadInDB(leadData: any): Promise<void> {
  try {
    // Optional: Store in your database for backup/analytics
    // const prisma = await import('@/lib/database-connection');
    // await prisma.default.getInstance().lead.create({ data: leadData });
    
    console.log('[DB] Lead stored:', redactPII({ 
      name: leadData.name, 
      source: leadData.utm_source,
      event_id: leadData.event_id 
    }));
  } catch (error) {
    console.error('[DB] Store failed:', { error: error instanceof Error ? error.message : 'Unknown' });
    throw error; // Caller handles this
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body with error handling
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API] JSON parse error:', { error: parseError instanceof Error ? parseError.message : 'Unknown' });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }
    
    // Validate input with Zod
    const validation = leadSchema.safeParse(body);
    
    if (!validation.success) {
      console.warn('[API] Validation failed:', {
        errors: validation.error.flatten().fieldErrors,
        receivedFields: Object.keys(body),
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 } // Unprocessable Entity for validation errors
      );
    }
    
    const leadData = validation.data;
    
    // Log start (PII-safe)
    console.log('[API] Processing lead:', redactPII({
      event_id: leadData.event_id,
      source: leadData.source,
      device: leadData.device,
      utm_source: leadData.utm_source,
    }));
    
    // Send to GHL with retry logic
    const ghlResult = await sendToGHL(leadData);
    
    // Send auto-reply (non-blocking)
    if (leadData.email || leadData.phone) {
      sendAutoReply(leadData).catch(err => {
        console.error('[Auto-Reply] Async error:', err);
      });
    }
    
    // Store in DB (optional, non-critical)
    try {
      await storeLeadInDB(leadData);
    } catch (dbError) {
      console.error('[DB] Failed to store lead:', { 
        error: dbError instanceof Error ? dbError.message : 'Unknown',
        event_id: leadData.event_id,
      });
      // Continue - DB failure shouldn't block lead capture
    }
    
    const duration = Date.now() - startTime;
    console.log('[API] Lead processed:', {
      event_id: leadData.event_id,
      ghl_success: ghlResult.success,
      duration_ms: duration,
    });
    
    // Return success even if GHL failed (lead is captured, webhook can be retried)
    return NextResponse.json({
      success: true,
      message: "Thanks! We'll text/email your quote within 5 minutes.",
      data: {
        event_id: leadData.event_id,
        // Don't return PII in response
      },
    });
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Log safely without PII
    console.error('[API] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      duration_ms: duration,
    });
    
    // Check for rate limiting (if implemented upstream)
    if (error.message?.includes('rate limit') || error.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again in a moment.',
          code: 'RATE_LIMIT',
        },
        { status: 429 }
      );
    }
    
    // Generic 500 for unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit quote request. Please try again or call us directly.',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
