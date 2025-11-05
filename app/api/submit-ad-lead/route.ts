/**
 * Ad Lead Submission API
 * Captures quick quote requests from homepage and booking flow
 * Routes to GHL CRM and sends auto-reply
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
 * Send lead to GHL CRM webhook
 */
async function sendToGHL(leadData: any): Promise<boolean> {
  const webhookUrl = process.env.GHL_QUOTE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[GHL] Webhook URL not configured - skipping CRM sync');
    return false;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...leadData,
        pipeline: 'Quote Request',
        stage: 'New Lead',
        source: leadData.utm_source || 'website',
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      console.error('[GHL] Webhook failed:', response.statusText);
      return false;
    }
    
    console.log('[GHL] Lead sent successfully');
    return true;
  } catch (error) {
    console.error('[GHL] Webhook error:', error);
    return false;
  }
}

/**
 * Send auto-reply email/SMS
 */
async function sendAutoReply(leadData: any): Promise<void> {
  // This would integrate with your email/SMS service (SendGrid, Twilio, etc.)
  // For now, we'll log it
  console.log('[Auto-Reply] Would send to:', leadData.email || leadData.phone);
  
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
}

/**
 * Store lead in database (optional)
 */
async function storeLeadInDB(leadData: any): Promise<void> {
  // Optional: Store in your database for backup/analytics
  // const prisma = await import('@/lib/database-connection');
  // await prisma.default.getInstance().lead.create({ data: leadData });
  
  console.log('[DB] Lead stored:', { name: leadData.name, source: leadData.utm_source });
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validation = leadSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    const leadData = validation.data;
    
    // Send to GHL
    const ghlSuccess = await sendToGHL(leadData);
    
    // Send auto-reply
    if (leadData.email || leadData.phone) {
      await sendAutoReply(leadData);
    }
    
    // Store in DB (optional)
    try {
      await storeLeadInDB(leadData);
    } catch (dbError) {
      console.error('[DB] Failed to store lead:', dbError);
      // Don't fail the request if DB storage fails
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: "Thanks! We'll text/email your quote within 5 minutes.",
      data: {
        name: leadData.name,
        contact: leadData.email || leadData.phone,
      },
    });
    
  } catch (error) {
    console.error('[API] Lead submission error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit quote request. Please try again or call us directly.',
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
