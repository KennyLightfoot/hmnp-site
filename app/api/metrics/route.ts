/**
 * Prometheus Metrics Endpoint
 * Exposes application metrics in Prometheus format for external monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/comprehensive-monitoring';
import { rateLimiters, rateLimitConfigs } from '@/lib/rate-limiting';
import { logger } from '@/lib/logger';

/**
 * GET /api/metrics
 * Returns Prometheus-formatted metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for metrics endpoint
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimiters.api.checkRateLimit(
      `metrics:${clientIP}`,
      { ...rateLimitConfigs.api, maxRequests: 60 } // Higher limit for monitoring
    );

    if (!rateLimitResult.allowed) {
      return new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
        },
      });
    }

    // Get Prometheus metrics
    const metrics = await monitoring.getMetrics();

    return new Response(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
      },
    });

  } catch (error) {
    logger.error('Metrics endpoint error', error as Error);
    return new Response('Internal server error', { status: 500 });
  }
} 