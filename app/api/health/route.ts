import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Production Health Check Endpoint
 * 
 * This endpoint provides comprehensive health status for the application,
 * including database connectivity, external services, and system resources.
 * 
 * Used by:
 * - Vercel health monitoring
 * - External monitoring services
 * - Load balancers
 * - Kubernetes health probes
 */

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthStatus;
    redis?: HealthStatus;
    stripe?: HealthStatus;
    ghl?: HealthStatus;
    sentry?: HealthStatus;
  };
  system: {
    memory: {
      used: number;
      free: number;
      total: number;
    };
    node_version: string;
  };
}

interface HealthStatus {
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const healthResult: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        stripe: await checkStripe(),
        ghl: await checkGHL(),
        sentry: await checkSentry(),
      },
      system: {
        memory: {
          used: process.memoryUsage().heapUsed,
          free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
        },
        node_version: process.version,
      },
    };

    // Determine overall status based on individual checks
    const criticalServices = ['database'];
    const hasCriticalFailures = criticalServices.some(
      service => healthResult.checks[service as keyof typeof healthResult.checks]?.status === 'fail'
    );

    const hasAnyFailures = Object.values(healthResult.checks).some(
      check => check?.status === 'fail'
    );

    const hasWarnings = Object.values(healthResult.checks).some(
      check => check?.status === 'warn'
    );

    if (hasCriticalFailures) {
      healthResult.status = 'unhealthy';
    } else if (hasAnyFailures || hasWarnings) {
      healthResult.status = 'degraded';
    }

    const statusCode = healthResult.status === 'healthy' ? 200 : 
                      healthResult.status === 'degraded' ? 200 : 503;

    // Log health check result
    logger.info('Health check completed', {
      status: healthResult.status,
      responseTime: Date.now() - startTime,
      checks: Object.entries(healthResult.checks).reduce((acc, [key, value]) => {
        acc[key] = value?.status;
        return acc;
      }, {} as Record<string, string>),
    });

    return NextResponse.json(healthResult, { status: statusCode });

  } catch (error) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 503 });
  }
}

async function checkDatabase(): Promise<HealthStatus> {
  const startTime = Date.now();
  try {
    // Simple query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
      message: 'Database connection successful',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkRedis(): Promise<HealthStatus | undefined> {
  if (!process.env.REDIS_URL) {
    return undefined; // Redis not configured
  }

  const startTime = Date.now();
  try {
    // Dynamically import Redis client
    const { createClient } = await import('redis');
    const client = createClient({ url: process.env.REDIS_URL });
    
    await client.connect();
    await client.ping();
    await client.disconnect();
    
    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
      message: 'Redis connection successful',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'warn', // Redis failure is not critical
      responseTime: Date.now() - startTime,
      message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkStripe(): Promise<HealthStatus | undefined> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return undefined; // Stripe not configured
  }

  const startTime = Date.now();
  try {
    // Simple Stripe API call to verify connectivity
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    await stripe.balance.retrieve();
    
    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
      message: 'Stripe API connection successful',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'warn', // Stripe failure affects payments but isn't critical for basic operation
      responseTime: Date.now() - startTime,
      message: `Stripe API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkGHL(): Promise<HealthStatus | undefined> {
  if (!process.env.GHL_API_KEY) {
    return undefined; // GHL not configured
  }

  const startTime = Date.now();
  try {
    // Simple GHL API call to verify connectivity
    const response = await fetch(`${process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com'}/locations/${process.env.GHL_LOCATION_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'Version': '2021-07-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GHL API returned ${response.status}`);
    }

    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
      message: 'GHL API connection successful',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'warn', // GHL failure affects automation but isn't critical
      responseTime: Date.now() - startTime,
      message: `GHL API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkSentry(): Promise<HealthStatus | undefined> {
  if (!process.env.SENTRY_DSN) {
    return undefined; // Sentry not configured
  }

  // Sentry is passive, so we just verify configuration
  return {
    status: 'pass',
    message: 'Sentry monitoring configured',
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Simple health check endpoint for basic monitoring
 * GET /api/health/simple
 */
export async function HEAD(request: NextRequest) {
  try {
    // Simple database ping
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
} 