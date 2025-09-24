import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { sendChat } from '@/lib/vertex';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

/**
 * Test API route for Gemini AI integration
 * GET /api/ai/test - Simple test message
 * POST /api/ai/test - Customer inquiry test
 */

// No need to instantiate – we call sendChat directly

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('public', 'ai_test_get')(async () => {
  try {
    const vertexResponse = await sendChat("Hello, I need to schedule a notary appointment in Houston.");
    const testResponse = { response: vertexResponse.text };

    return NextResponse.json({
      success: true,
      data: testResponse,
      message: 'Gemini AI integration working properly'
    });
  } catch (error) {
    console.error('AI test error:', error);
    return NextResponse.json({
      success: false,
      error: 'AI integration test failed',
      details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
    }, { status: 500 });
  }
})

const bodySchema = z.object({ message: z.string().min(1), context: z.any().optional() });

export const POST = withRateLimit('public', 'ai_test_post')(async (request: NextRequest) => {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    const { message, context } = parsed.data;

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    const vertexRes = await sendChat(message, context?.systemPrompt, context);
    const response = { response: vertexRes.text };

    return NextResponse.json({
      success: true,
      data: response,
      message: 'AI response generated successfully'
    });
  } catch (error) {
    console.error('AI test POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'AI request failed',
      details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
    }, { status: 500 });
  }
})
