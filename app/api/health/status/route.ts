import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealth } from '@/lib/monitoring/health-checks';
import { withErrorHandling } from '@/lib/monitoring/api-error-handler';

/**
 * Comprehensive system health check endpoint
 * Returns detailed status of all critical systems
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get('detailed') === 'true';
  
  try {
    const health = await getSystemHealth();
    
    // Return simplified response for load balancers/uptime checks
    if (!detailed) {
      return NextResponse.json(
        {
          status: health.overall,
          timestamp: health.timestamp,
          uptime: health.uptime,
        },
        { 
          status: health.overall === 'healthy' ? 200 : 503,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Return detailed response for monitoring dashboards
    return NextResponse.json(
      health,
      { 
        status: health.overall === 'healthy' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('[HEALTH_CHECK] System health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check system failure',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        }
      }
    );
  }
});

// Health check endpoint should not be cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;