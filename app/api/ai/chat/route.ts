import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendChat } from '@/lib/vertex';
import { scrubPII } from '@/lib/security/pii-scrubber';
import { getCachedChat, setCachedChat } from '@/lib/ai/chat-cache';
import { getUserTier } from '@/lib/auth/user-tier';
import { ConversationTracker } from '@/lib/conversation-tracker';
import { redis } from '@/lib/redis';
import { alertManager } from '@/lib/monitoring/alert-manager';

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
    /* -----------------------------------------------------------
       Parse request body early so we can validate/sanitize before
       performing heavier operations like rate-limiting or cache checks.
    -----------------------------------------------------------*/
    const body: ChatRequest = await request.json();
    const { message, context, locationContext, sessionId, conversationHistory, customerId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // -------------------------------------------------------------------
    // 🛡️ Redis-backed Rate Limiting (tiered + burst)
    // -------------------------------------------------------------------
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') || 'unknown';

    const userTier = await getUserTier();

    const WINDOW_SEC = 300; // 5 minutes
    const SHORT_WINDOW_SEC = 10;

    const TIER_LIMITS: Record<string, number> = {
      anon: 20,
      auth: 50,
      premium: 100
    };
    const tierMax = TIER_LIMITS[userTier] || 20;
    const BURST_MAX = 4; // 4 per 10 seconds

    // Keys
    const longKey = `rl:l:${ip}`;
    const burstKey = `rl:s:${ip}`;

    // Increment counters only if Redis is available
    const redisAvailable = typeof (redis as any).isAvailable === 'function' ? (redis as any).isAvailable() : true;
    const canRateLimit = redisAvailable && typeof (redis as any).incr === 'function' && typeof (redis as any).expire === 'function';
    if (canRateLimit) {
      const longCount = await redis.incr(longKey);
      if (longCount === 1) await redis.expire(longKey, WINDOW_SEC);

      const burstCount = await redis.incr(burstKey);
      if (burstCount === 1) await redis.expire(burstKey, SHORT_WINDOW_SEC);

      const burstExceeded = burstCount > BURST_MAX;
      const tierExceeded = longCount > tierMax;

      if (burstExceeded || tierExceeded) {
        const ttl = burstExceeded ? await redis.ttl(burstKey) : await redis.ttl(longKey);
        try { await alertManager.recordMetric('rate_limit.violation', 1, { ip, burstExceeded, tierExceeded, userTier }); } catch (_) {}
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please slow down.' },
          { status: 429, headers: { 'Retry-After': Math.max(ttl,1).toString() } }
        );
      }
    }

    // -------------------------------------------------------------------
    // 🔓 Optional Dev bypass session (still useful for local conversation tracking)
    // -------------------------------------------------------------------
    let session = await getServerSession(authOptions);
    if (process.env.NODE_ENV === 'development' && !session?.user) {
      const apiKey = request.headers.get('x-internal-api-key');
      if (apiKey === 'dev') {
        session = { user: { id: 'dev', name: 'Dev User', email: 'dev@localhost' } } as any;
      }
    }

    // -------------------------------------------------------------------
    // 🫥 PII Scrub – redact sensitive info before any downstream processing
    // -------------------------------------------------------------------
    const cleanPrompt = scrubPII(message);

    // userTier determined earlier for rate limiting; reuse later if needed

    // -------------------------------------------------------------------
    // ⚡ Cache lookup – skip expensive LLM call on duplicate prompts
    // -------------------------------------------------------------------
    const cacheCandidate = await getCachedChat(cleanPrompt, context?.type);
    if (cacheCandidate) {
      return NextResponse.json({
        success: true,
        response: cacheCandidate,
        fromCache: true,
        metadata: {
          sessionId,
          timestamp: new Date().toISOString(),
          context: context?.type
        }
      });
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
      vertexResult = await sendChat(cleanPrompt, systemPrompt, enhancedContext);
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
    // If Vertex returns nothing or malformed data, treat as upstream error so we don't 500.
    if (!vertexResult || typeof vertexResult.text !== 'string' || !vertexResult.text.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Upstream AI service unavailable. Please retry shortly.'
      }, {
        status: 502,
        headers: { 'Retry-After': '30' }
      });
    }

    const aiResponse = {
      response: vertexResult.text,
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

    // -------------------------------------------------------------------
    // 🗄️ Store in cache for 1h (skip if function calls present – naive check)
    // -------------------------------------------------------------------
    if (!vertexResult?.functionCalls || vertexResult.functionCalls.length === 0) {
      await setCachedChat(cleanPrompt, context?.type, enhancedResponse.response);
    }
    
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
  
  const enhancement = contextEnhancements[context?.type || 'general' as keyof typeof contextEnhancements];
  
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