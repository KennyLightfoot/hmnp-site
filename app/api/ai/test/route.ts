import { NextRequest, NextResponse } from 'next/server';
import { sendChat } from '@/lib/vertex';

/**
 * Test API route for Gemini AI integration
 * GET /api/ai/test - Simple test message
 * POST /api/ai/test - Customer inquiry test
 */

// No need to instantiate – we call sendChat directly

export async function GET() {
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    const vertexRes = await sendChat(message);
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 