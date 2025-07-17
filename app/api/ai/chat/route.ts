import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendChat } from '@/lib/vertex';
import { ConversationTracker } from '@/lib/conversation-tracker';

// Vertex-based chat helper does not need initialisation

/**
 * 🤖 AI Chat API - Universal Customer Assistant
 * POST /api/ai/chat - Handle chat conversations
 * 
 * Features:
 * - Context-aware responses
 * - Conversation tracking
 * - Intent detection
 * - Proactive suggestions
 * - Escalation handling
 */

interface ChatRequest {
  message: string;
  context?: {
    type: 'homepage' | 'services' | 'booking' | 'faq' | 'contact' | 'general';
    path: string;
    intent: 'discovery' | 'comparison' | 'conversion' | 'support' | 'connection' | 'assistance';
    metadata?: Record<string, any>;
  };
  locationContext?: {
    zipCode?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    preferredDateTime?: string;
    serviceType?: string;
  };
  sessionId?: string;
  conversationHistory?: Array<{
    id: string;
    type: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
  }>;
  customerId?: string;
}

// Context-specific system prompts
const CONTEXT_PROMPTS = {
  homepage: `You are a friendly AI assistant for Houston Mobile Notary Pros. The user is on the homepage exploring our services. 
    Help them understand our services, get quotes, or book appointments. Be welcoming and guide them toward the right solution.
    
    Key Services to mention:
    - Standard Mobile Notary ($75) - Perfect for routine documents
    - Extended Hours ($100) - Evening/weekend availability 
    - Loan Signing Specialist ($150) - Real estate expertise
    - Remote Online Notarization ($35) - Sign from anywhere
    
    Always offer to help them book or get a quote.`,
    
  services: `You are an expert service advisor for Houston Mobile Notary Pros. The user is comparing our services.
    Help them understand the differences and choose the right service for their needs.
    
    Service Comparison:
    - Quick-Stamp Local ($50) - Basic, 1 document, 10-mile radius
    - Standard Notary ($75) - Most popular, 2 documents, 30-mile radius
    - Extended Hours ($100) - 7am-9pm, same-day guarantee, 5 documents
    - Loan Signing ($150) - Real estate expertise, unlimited documents
    - RON Services ($35) - Remote online, 24/7 availability
    
    Ask about their specific needs: document type, timeline, location, number of signers.`,
    
  booking: `You are a booking specialist for Houston Mobile Notary Pros. The user is trying to book an appointment.
    Guide them through the process step by step and help with any issues.
    
    Booking Process:
    1. Service Selection - Help them choose the right service
    2. Contact Information - Name, email, phone
    3. Location - Address for mobile services (not needed for RON)
    4. Scheduling - Date and time preferences
    5. Review & Payment - Confirm details and payment
    
    Offer to help with any step they're stuck on.`,
    
  faq: `You are a knowledgeable support agent for Houston Mobile Notary Pros. Answer questions about our services,
    policies, and procedures. Be thorough but friendly.
    
    Common Topics:
    - Service pricing and what's included
    - Scheduling and availability
    - Document requirements and ID needs
    - Travel fees and service areas
    - RON (Remote Online Notarization) process
    - Payment methods and policies
    
    If you don't know something, offer to connect them with our team.`,
    
  contact: `You are a customer service representative for Houston Mobile Notary Pros. The user wants to get in touch.
    Help them immediately or connect them with the right person.
    
    Contact Options:
    - Immediate AI assistance (you!)
    - Phone: (832) 617-4285
    - Email: support@houstonmobilenotarypros.com
    - Online booking for appointments
    - Contact form for detailed inquiries
    
    Try to help them right away, but offer human contact if needed.`,
    
  general: `You are a helpful AI assistant for Houston Mobile Notary Pros. Provide friendly, professional assistance
    with any questions about our notary services.`
};

export async function POST(request: NextRequest) {
  try {
    // -------------------------------------------------------------------
    // 🔓 Authentication guard
    // -------------------------------------------------------------------
    let session = await getServerSession(authOptions);

    // Dev bypass: allow requests that present x-internal-api-key: dev when
    // running locally so we can curl / automate tests without a full login.
    if (process.env.NODE_ENV === 'development' && !session?.user) {
      const apiKey = request.headers.get('x-internal-api-key');
      if (apiKey === 'dev') {
        session = { user: { id: 'dev', name: 'Dev User', email: 'dev@localhost' } } as any;
      }
    }

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { message, context, locationContext, sessionId, conversationHistory, customerId } = body;
    
    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }
    
    // Build enhanced context for AI
    const enhancedContext = {
      pageContext: context?.type || 'general',
      currentPath: context?.path || '/',
      userIntent: context?.intent || 'assistance',
      locationContext: locationContext,
      conversationHistory: conversationHistory || [],
      sessionId: sessionId || `session-${Date.now()}`,
      customerId: customerId,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'web_chat',
        ...context?.metadata
      }
    };
    
    // Get context-specific system prompt
    const systemPrompt = CONTEXT_PROMPTS[context?.type || 'general'];
    
    // Call Vertex AI via sendChat with system prompt and context
    let vertexResult: any;
    try {
      vertexResult = await sendChat(message, systemPrompt, enhancedContext);
    } catch (vertexErr: any) {
      console.error('Vertex AI upstream error:', vertexErr);
      return NextResponse.json({
        success: false,
        error: 'Upstream AI service unavailable. Please retry shortly.'
      }, {
        status: 502,
        headers: {
          'Retry-After': '30'
        }
      });
    }
    const aiResponse = {
      response: vertexResult.text || 'Sorry, I could not process that.',
      confidence: 1,
      intent: 'unknown',
      suggestedActions: [],
      escalationRequired: false
    };
    
    // Track conversation if we have customer info
    if (customerId) {
      try {
        await ConversationTracker.trackInteraction({
          customerEmail: customerId,
          customerName: 'Web Chat User',
          interactionType: 'chat',
          source: 'chat',
          subject: `Chat: ${message.substring(0, 50)}...`,
          message: message,
          metadata: {
            aiResponse: aiResponse.response,
            intent: aiResponse.intent,
            confidence: aiResponse.confidence,
            context: enhancedContext
          },
          tags: ['ai_chat', context?.type || 'general']
        });
      } catch (trackingError) {
        console.error('Conversation tracking error:', trackingError);
        // Don't fail the request if tracking fails
      }
    }
    
    // Enhance response with context-specific suggestions
    const enhancedResponse = enhanceResponseWithContext(aiResponse, context);
    
    return NextResponse.json({
      success: true,
      response: enhancedResponse.response,
      confidence: enhancedResponse.confidence,
      intent: enhancedResponse.intent,
      suggestedActions: enhancedResponse.suggestedActions,
      escalationRequired: enhancedResponse.escalationRequired,
      metadata: {
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        context: context?.type
      }
    });
    
  } catch (error) {
    console.error('AI Chat API error:', error);
    
    return NextResponse.json({
      success: false,
      response: "I apologize, but I'm experiencing technical difficulties. Please try again or contact our team directly at (832) 617-4285.",
      confidence: 0,
      intent: 'technical_error',
      suggestedActions: ['call_now', 'try_again'],
      escalationRequired: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Enhance AI response with context-specific suggestions and actions
 */
function enhanceResponseWithContext(aiResponse: any, context?: any) {
  const contextEnhancements: Record<string, any> = {
    homepage: {
      suggestedActions: ['get_quote', 'book_now', 'view_services', 'call_now'],
      callToAction: 'Ready to get started? I can help you book an appointment or get a quote!'
    },
    services: {
      suggestedActions: ['compare_services', 'get_quote', 'book_now', 'ask_question'],
      callToAction: 'Would you like me to help you choose the perfect service for your needs?'
    },
    booking: {
      suggestedActions: ['continue_booking', 'get_help', 'call_now', 'save_for_later'],
      callToAction: 'Let me guide you through the booking process step by step!'
    },
    faq: {
      suggestedActions: ['ask_another', 'book_now', 'call_now', 'view_services'],
      callToAction: 'Have any other questions? I\'m here to help!'
    },
    contact: {
      suggestedActions: ['call_now', 'book_now', 'send_message', 'get_quote'],
      callToAction: 'How would you like to get in touch with us?'
    }
  };
  
  const enhancement = contextEnhancements[context?.type || 'general'];
  
  if (enhancement) {
    // Add context-specific suggestions if not already provided
    if (!aiResponse.suggestedActions || aiResponse.suggestedActions.length === 0) {
      aiResponse.suggestedActions = enhancement.suggestedActions;
    }
    
    // Add call to action if confidence is high
    if (aiResponse.confidence > 0.7 && !aiResponse.response.includes('?')) {
      aiResponse.response += `\n\n${enhancement.callToAction}`;
    }
  }
  
  // Add booking-specific enhancements
  if (context?.type === 'booking') {
    // Detect common booking issues
    if (aiResponse.intent === 'booking_issue' || aiResponse.confidence < 0.6) {
      aiResponse.suggestedActions = ['get_human_help', 'call_now', 'restart_booking'];
      aiResponse.response += '\n\nIf you\'re having trouble, I can connect you with our team who can help you complete your booking over the phone.';
    }
  }
  
  // Add service-specific enhancements
  if (context?.type === 'services') {
    // Detect service selection needs
    if (aiResponse.intent === 'service_comparison' || aiResponse.response.includes('service')) {
      aiResponse.suggestedActions = ['quick_stamp', 'standard_notary', 'extended_hours', 'loan_signing', 'ron_services'];
    }
  }
  
  return aiResponse;
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 