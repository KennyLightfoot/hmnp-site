import { NextRequest, NextResponse } from 'next/server';
import { IntelligentAssistant } from '@/lib/ai/intelligent-assistant';

/**
 * Test API route for Gemini AI integration
 * GET /api/ai/test - Simple test message
 * POST /api/ai/test - Customer inquiry test
 */

const ai = new IntelligentAssistant();

export async function GET() {
  try {
    const testResponse = await ai.handleCustomerInquiry(
      "Hello, I need to schedule a notary appointment in Houston.",
      {
        sessionData: { source: 'test' }
      }
    );

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

    const response = await ai.handleCustomerInquiry(message, context || {});

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