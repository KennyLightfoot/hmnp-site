/**
 * EMERGENCY HOTFIX: Compatibility endpoint for services-compatible
 * 
 * This endpoint was being called by cached service workers or old client code,
 * causing 404 storms. This provides backward compatibility while we investigate.
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.warn('⚠️ DEPRECATED: /api/services-compatible called - redirecting to /api/services');
  
  try {
    // Redirect to the main services endpoint
    const url = new URL(request.url);
    const servicesUrl = `${url.origin}/api/services${url.search}`;
    
    // Fetch from the real services endpoint
    const response = await fetch(servicesUrl, {
      headers: {
        'User-Agent': 'Internal-Compatibility-Layer'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Services endpoint failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the same data but add a deprecation warning
    return NextResponse.json({
      ...data,
      _deprecated: true,
      _message: 'This endpoint is deprecated. Use /api/services instead.',
      _timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Services-compatible endpoint error:', error);
    
    // Return a basic fallback response to prevent cascading failures
    return NextResponse.json({
      success: false,
      error: 'Services temporarily unavailable',
      _deprecated: true,
      _message: 'This endpoint is deprecated. Use /api/services instead.',
      _fallback: true
    }, { status: 503 });
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed',
    _deprecated: true,
    _message: 'This endpoint is deprecated. Use /api/services instead.'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    error: 'Method not allowed', 
    _deprecated: true,
    _message: 'This endpoint is deprecated. Use /api/services instead.'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Method not allowed',
    _deprecated: true, 
    _message: 'This endpoint is deprecated. Use /api/services instead.'
  }, { status: 405 });
}