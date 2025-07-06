/**
 * Google Places Autocomplete API Proxy
 * Houston Mobile Notary Pros - CORS Fix Implementation
 * 
 * This endpoint proxies Google Places API calls to resolve CORS issues
 * and secure API key exposure in the browser.
 */

import { NextRequest, NextResponse } from 'next/server';

// Clean and validate API key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY?.replace(/\s+/g, '');

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100     // Generous limit for address prediction
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now - userLimit.timestamp > RATE_LIMIT.windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(ip)) {
      console.warn('Places API rate limit exceeded', { ip });
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          fallback: true
        },
        { status: 429 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    const sessionToken = searchParams.get('sessiontoken');
    
    // Validate required parameters
    if (!input || input.length < 3) {
      return NextResponse.json({
        predictions: [],
        status: 'INVALID_REQUEST'
      });
    }

    // Check API key availability
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      return NextResponse.json(
        { 
          error: 'Address service temporarily unavailable',
          fallback: true
        },
        { status: 503 }
      );
    }

    // Build Google Places API URL
    const apiUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    apiUrl.searchParams.set('input', input);
    apiUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    apiUrl.searchParams.set('components', 'country:us');
    apiUrl.searchParams.set('types', 'address');
    apiUrl.searchParams.set('region', 'US');
    
    if (sessionToken) {
      apiUrl.searchParams.set('sessiontoken', sessionToken);
    }

    console.log('Proxying Places API request', {
      input: input.substring(0, 20) + '...',
      hasSessionToken: !!sessionToken,
      ip: ip.substring(0, 10) + '...'
    });

    // Make server-side API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Houston Mobile Notary Pros Server'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Places API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    // Handle API response status
    switch (data.status) {
      case 'OK':
        console.log('Places API request successful', {
          resultCount: data.predictions?.length || 0,
          processingTime
        });
        return NextResponse.json(data);

      case 'ZERO_RESULTS':
        console.log('Places API returned no results', { input, processingTime });
        return NextResponse.json({
          predictions: [],
          status: 'ZERO_RESULTS'
        });

      case 'REQUEST_DENIED':
        console.error('Places API request denied', { 
          status: data.status,
          errorMessage: data.error_message 
        });
        return NextResponse.json(
          { 
            error: 'Address service temporarily unavailable',
            fallback: true
          },
          { status: 503 }
        );

      case 'OVER_QUERY_LIMIT':
        console.error('Places API quota exceeded', { 
          status: data.status,
          errorMessage: data.error_message 
        });
        return NextResponse.json(
          { 
            error: 'Service temporarily at capacity',
            fallback: true
          },
          { status: 503 }
        );

      case 'INVALID_REQUEST':
        console.warn('Places API invalid request', { 
          input,
          status: data.status,
          errorMessage: data.error_message 
        });
        return NextResponse.json(
          { 
            error: 'Invalid address format',
            fallback: true
          },
          { status: 400 }
        );

      default:
        console.error('Places API unexpected status', { 
          status: data.status,
          errorMessage: data.error_message 
        });
        return NextResponse.json(
          { 
            error: 'Address service error',
            fallback: true
          },
          { status: 500 }
        );
    }

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error('Places API request timeout', { processingTime });
      return NextResponse.json(
        { 
          error: 'Address service timeout',
          fallback: true
        },
        { status: 504 }
      );
    }

    console.error('Places API proxy error', {
      error: error.message,
      stack: error.stack,
      processingTime
    });

    return NextResponse.json(
      { 
        error: 'Address service temporarily unavailable',
        fallback: true
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Health check endpoint
export async function HEAD() {
  return NextResponse.json({
    status: 'healthy',
    service: 'places-autocomplete-proxy',
    hasApiKey: !!GOOGLE_MAPS_API_KEY,
    timestamp: new Date().toISOString()
  });
}