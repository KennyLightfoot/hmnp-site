import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

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
  | 'TaskComplete';

export async function POST(request: NextRequest) {
  try {
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
    
    // Log the webhook event for debugging
    const headersList = await headers();
    console.log('GHL Webhook received:', {
      type: body.type,
      contactId: body.contactId,
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(headersList.entries()),
      payload: body
    });

    // Verify webhook signature if configured (optional but recommended)
    if (process.env.GHL_WEBHOOK_SECRET) {
      // Add signature verification logic here
      // const signature = headers().get('x-ghl-signature');
      // const isValid = verifyWebhookSignature(rawBody, signature, process.env.GHL_WEBHOOK_SECRET);
      // if (!isValid) {
      //   return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
      // }
    }

    // Extract event type and data
    const { type, contactId, contact, opportunity, appointment, customField, form, task } = body;

    // Process different webhook events
    switch (type as WebhookEventType) {
      case 'ContactCreate':
        console.log('New contact created:', contactId);
        await handleContactCreate({ contactId, contact, timestamp: body.timestamp });
        break;

      case 'ContactUpdate':
        console.log('Contact updated:', contactId);
        await handleContactUpdate({ contactId, contact, timestamp: body.timestamp });
        break;

      case 'ContactTagUpdate':
        console.log('Contact tags updated:', contactId);
        await handleContactTagUpdate({ 
          contactId, 
          contact, 
          addedTags: body.addedTags || [], 
          removedTags: body.removedTags || [],
          timestamp: body.timestamp 
        });
        break;

      case 'OpportunityCreate':
        console.log('New opportunity created:', opportunity?.id);
        await handleOpportunityCreate({ opportunity, timestamp: body.timestamp });
        break;

      case 'OpportunityStatusUpdate':
        console.log('Opportunity status updated:', opportunity?.id);
        await handleOpportunityStatusUpdate({ 
          opportunity, 
          previousStatus: body.previousStatus,
          newStatus: body.newStatus,
          timestamp: body.timestamp 
        });
        break;

      case 'AppointmentCreate':
        console.log('New appointment created:', appointment?.id);
        await handleAppointmentCreate({ appointment, contactId, timestamp: body.timestamp });
        break;

      case 'AppointmentUpdate':
        console.log('Appointment updated:', appointment?.id);
        await handleAppointmentUpdate({ appointment, contactId, timestamp: body.timestamp });
        break;

      case 'ContactCustomFieldUpdate':
        console.log('Custom field updated:', contactId);
        await handleCustomFieldUpdate({ 
          contactId, 
          customField, 
          updatedFields: body.updatedFields || {},
          timestamp: body.timestamp 
        });
        break;

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
        console.log('Unknown webhook type:', type);
        // Still return success to prevent retries for unknown events
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
    console.error('GHL Webhook error:', error);
    
    // Log error details for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handler functions (implement these based on your business logic)
async function handleContactCreate(data: any) {
  // Implement your contact creation logic
  console.log('Processing contact creation:', data);
}

async function handleContactUpdate(data: any) {
  // Implement your contact update logic
  console.log('Processing contact update:', data);
}

async function handleContactTagUpdate(data: any) {
  // Implement your tag update logic
  console.log('Processing tag update:', data);
}

async function handleOpportunityCreate(data: any) {
  // Implement your opportunity creation logic
  console.log('Processing opportunity creation:', data);
}

async function handleOpportunityStatusUpdate(data: any) {
  // Implement your opportunity status update logic
  console.log('Processing opportunity status update:', data);
}

async function handleAppointmentCreate(data: any) {
  // Implement your appointment creation logic
  console.log('Processing appointment creation:', data);
}

async function handleAppointmentUpdate(data: any) {
  // Implement your appointment update logic
  console.log('Processing appointment update:', data);
}

async function handleCustomFieldUpdate(data: any) {
  // Implement your custom field update logic
  console.log('Processing custom field update:', data);
}

async function handleFormSubmit(data: any) {
  // Implement your form submission logic
  console.log('Processing form submission:', data);
}

async function handleTaskEvent(data: any) {
  // Implement your task event logic
  console.log('Processing task event:', data);
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