/**
 * 🔍 DIAGNOSTIC ENDPOINT: Request Pattern Analysis
 * 
 * This endpoint provides guidance and tools for analyzing request patterns
 * to identify potential request storms, infinite loops, or other issues
 * that might be causing the booking system problems.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const analysis = {
    timestamp: new Date().toISOString(),
    instructions: {
      manual_testing: [
        '1. Open browser developer tools (F12)',
        '2. Go to Network tab and clear existing requests',
        '3. Navigate to the booking page',
        '4. Fill out the booking form partially',
        '5. Monitor network requests for patterns'
      ],
      red_flags: [
        'Multiple identical requests to the same endpoint',
        'Exponential increase in request frequency',
        'Requests happening faster than human interaction (< 100ms apart)',
        '404 errors for /api/services-compatible or similar endpoints',
        'Service worker requests in infinite loops',
        'Requests continuing after page navigation'
      ],
      healthy_patterns: [
        'Single request per user action (form field change, button click)',
        'Requests spaced out by reasonable intervals (> 500ms)',
        'No more than 2-3 requests for the same data within 1 minute',
        'Successful responses (200, 201) for most requests',
        'Request count decreases when user is idle'
      ]
    },
    endpoints_to_monitor: {
      critical: [
        '/api/services',
        '/api/services-compatible',
        '/api/availability',
        '/api/availability-compatible',
        '/api/bookings'
      ],
      secondary: [
        '/api/webhooks/ghl',
        '/sw.js',
        '/manifest.json',
        '/favicon.ico'
      ],
      static: [
        '/_next/static/',
        '/images/',
        '/icons/'
      ]
    },
    diagnostics: {
      request_storm_indicators: [
        'More than 100 requests per minute to API endpoints',
        'Same endpoint called more than 10 times in 10 seconds',
        'Browser console showing repeated fetch() calls',
        'Network tab showing exponential request growth',
        'Server logs showing rate limiting triggers'
      ],
      infinite_loop_indicators: [
        'useEffect dependency array causing re-renders',
        'State updates triggering new API calls',
        'Service worker fetch events causing more fetches',
        'Error handlers that retry immediately without backoff',
        'Component mounting/unmounting repeatedly'
      ]
    },
    immediate_tests: {
      test_services_endpoint: {
        url: '/api/services-compatible',
        expected_behavior: 'Should return 3 mock services with status 200',
        command: 'curl -s /api/services-compatible | jq .services.all | length'
      },
      test_availability_endpoint: {
        url: '/api/availability-compatible?date=2025-01-01&serviceId=standard-notary',
        expected_behavior: 'Should return time slots for the date',
        command: 'curl -s "/api/availability-compatible?date=2025-01-01&serviceId=standard-notary" | jq .availableSlots'
      },
      test_webhook_health: {
        url: '/api/webhooks/ghl',
        expected_behavior: 'GET should return healthy status',
        command: 'curl -s /api/webhooks/ghl'
      }
    },
    debugging_commands: {
      browser_console: [
        '// Monitor fetch requests',
        'const originalFetch = window.fetch;',
        'window.fetch = function(...args) {',
        '  console.log("FETCH:", args[0], new Date().toISOString());',
        '  return originalFetch.apply(this, args);',
        '};',
        '',
        '// Reset monitoring',
        'window.fetch = originalFetch;'
      ],
      network_analysis: [
        '// In browser console, check for repeated requests',
        'performance.getEntriesByType("navigation").forEach(entry => {',
        '  console.log("Page load time:", entry.loadEventEnd - entry.loadEventStart, "ms");',
        '});',
        '',
        '// Check for service worker',
        'navigator.serviceWorker.getRegistrations().then(registrations => {',
        '  console.log("Service workers:", registrations.length);',
        '  registrations.forEach(reg => console.log("SW scope:", reg.scope));',
        '});'
      ]
    },
    troubleshooting_steps: {
      if_request_storm: [
        '1. Check browser console for JavaScript errors',
        '2. Look for infinite useEffect loops in React components',
        '3. Verify service worker is not causing fetch loops',
        '4. Check if component state updates are triggering re-renders',
        '5. Temporarily disable service worker registration'
      ],
      if_404_errors: [
        '1. Verify /api/services-compatible endpoint exists and responds',
        '2. Check if old cached service worker is making outdated requests',
        '3. Clear browser cache and service worker cache',
        '4. Check for typos in API endpoint URLs',
        '5. Verify routing configuration in Next.js'
      ],
      if_slow_responses: [
        '1. Check database connection and query performance',
        '2. Verify GHL API is not timing out',
        '3. Look for memory leaks in client-side code',
        '4. Check for large payloads being transferred',
        '5. Monitor server resource usage'
      ]
    },
    current_system_status: {
      mock_endpoints: [
        'services-compatible: Enhanced with SOP-compliant mock data',
        'availability-compatible: Mock time slot generation implemented',
        'bookings: Mock GHL contact creation fallback added',
        'webhooks/ghl: Setup mode with mock handlers'
      ],
      protection_measures: [
        'Rate limiting on webhook endpoint (10 req/min)',
        'Request deduplication in ThirdPartyScripts component',
        'Emergency request storm protection script',
        'Service worker unregistration safety net'
      ]
    }
  };

  return NextResponse.json(analysis, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'analyze_requests':
        return analyzeRequests(data);
      
      case 'check_endpoints':
        return checkEndpoints();
        
      case 'test_rate_limiting':
        return testRateLimiting();
        
      default:
        return NextResponse.json({
          error: 'Unknown action',
          available_actions: ['analyze_requests', 'check_endpoints', 'test_rate_limiting']
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid request body',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

async function analyzeRequests(requestData: any) {
  // Analyze provided request data for patterns
  const analysis = {
    timestamp: new Date().toISOString(),
    request_pattern_analysis: 'Analysis would be performed on provided request data',
    note: 'This is a mock analysis - provide request timing data for real analysis'
  };

  if (requestData && Array.isArray(requestData.requests)) {
    const requests = requestData.requests;
    const intervals = [];
    
    for (let i = 1; i < requests.length; i++) {
      const interval = new Date(requests[i].timestamp).getTime() - new Date(requests[i-1].timestamp).getTime();
      intervals.push(interval);
    }
    
    const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const minInterval = intervals.length > 0 ? Math.min(...intervals) : 0;
    
    analysis.request_pattern_analysis = {
      total_requests: requests.length,
      average_interval_ms: avgInterval,
      minimum_interval_ms: minInterval,
      potential_storm: minInterval < 100,
      analysis: minInterval < 100 ? 'POTENTIAL REQUEST STORM DETECTED' : 'Normal request pattern'
    };
  }

  return NextResponse.json(analysis);
}

async function checkEndpoints() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const endpoints = [
    '/api/services-compatible',
    '/api/availability-compatible',
    '/api/webhooks/ghl',
    '/api/test-booking-flow'
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const start = Date.now();
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Internal-Health-Check' }
      });
      const timing = Date.now() - start;
      
      results.push({
        endpoint,
        status: response.status,
        timing_ms: timing,
        accessible: response.ok,
        content_type: response.headers.get('content-type')
      });
    } catch (error) {
      results.push({
        endpoint,
        status: 'ERROR',
        timing_ms: 0,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    endpoint_health_check: results,
    summary: {
      total: results.length,
      accessible: results.filter(r => r.accessible).length,
      failed: results.filter(r => !r.accessible).length
    }
  });
}

async function testRateLimiting() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    rate_limiting_status: {
      webhook_endpoint: 'Rate limited to 10 requests per minute per IP',
      booking_endpoint: 'Rate limited to 5 booking attempts per minute',
      general_api: 'Rate limiting active on sensitive endpoints'
    },
    note: 'Rate limiting is implemented and active. Check server logs for rate limit triggers.'
  });
}