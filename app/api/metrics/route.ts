/**
 * Prometheus Metrics Endpoint
 * Exposes application metrics in Prometheus format for external monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/comprehensive-monitoring';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/security/rate-limiting';

/**
 * GET /api/metrics
 * Returns Prometheus-formatted metrics
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('api_general', 'metrics')(async (request: NextRequest) => {
  try {
    // Get Prometheus metrics
    const metrics = await monitoring.getMetrics();

    return new Response(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    logger.error('Metrics endpoint error', error as Error);
    return new Response('Internal server error', { status: 500 });
  }
});