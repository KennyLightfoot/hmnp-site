import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate CSRF token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Get session info for validation
    const userAgent = (await headers()).get('user-agent') || '';
    const forwarded = (await headers()).get('x-forwarded-for') || '';
    
    // Create signed token with timestamp
    const timestamp = Date.now();
    const payload = `${token}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', process.env.CSRF_SECRET || 'fallback-secret')
      .update(`${payload}:${userAgent}:${forwarded}`)
      .digest('hex');
    
    const signedToken = `${payload}:${signature}`;
    
    return NextResponse.json({
      success: true,
      csrfToken: signedToken,
      expiresAt: timestamp + (15 * 60 * 1000) // 15 minutes
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('[CSRF] Token generation failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate CSRF token'
    }, { status: 500 });
  }
}