/**
 * Synthetic Monitoring - Production Health Checks
 * Houston Mobile Notary Pros
 * 
 * Vercel Cron job that runs comprehensive smoke tests against production
 * Alerts on failures via Slack and logs metrics to monitoring systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminSecurity } from '@/lib/security/comprehensive-security';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

// Monitoring configuration
const MONITORING_CONFIG = {
  intervals: {
    health: 5 * 60 * 1000,     // 5 minutes
    booking: 15 * 60 * 1000,   // 15 minutes  
    fullFlow: 60 * 60 * 1000   // 1 hour
  },
  timeouts: {
    api: 10000,      // 10 seconds
    booking: 30000,  // 30 seconds
    fullFlow: 60000  // 60 seconds
  },
  thresholds: {
    responseTime: 2000,  // 2 seconds
    availability: 99.5,  // 99.5%
    errorRate: 1.0      // 1%
  }
};

interface MonitoringResult {
  timestamp: string;
  testType: 'health' | 'booking' | 'full-flow';
  success: boolean;
  duration: number;
  checks: HealthCheck[];
  errors: string[];
  metrics: Record<string, number>;
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration: number;
  message?: string;
  details?: any;
}

/**
 * Main monitoring endpoint - triggered by Vercel Cron
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminSecurity(async (request: NextRequest) => {
  const startTime = Date.now();
  
  try {
    // Verify this is a legitimate cron request
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine test type based on query params
    const url = new URL(request.url);
    const testType = url.searchParams.get('type') || 'health';
    
    logger.info('Starting synthetic monitoring', {
      testType,
      timestamp: new Date().toISOString()
    });

    let result: MonitoringResult;

    switch (testType) {
      case 'health':
        result = await runHealthChecks();
        break;
      case 'booking':
        result = await runBookingFlow();
        break;
      case 'full-flow':
        result = await runFullFlow();
        break;
      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    // Log results
    const duration = Date.now() - startTime;
    logger.info('Synthetic monitoring completed', {
      testType,
      success: result.success,
      duration,
      checksCount: result.checks.length,
      errorsCount: result.errors.length
    });

    // Send alerts if failures detected
    if (!result.success) {
      await sendAlert(result);
    }

    // Send metrics to monitoring systems
    await sendMetrics(result);

    return NextResponse.json({
      success: result.success,
      testType: result.testType,
      duration: result.duration,
      summary: {
        totalChecks: result.checks.length,
        passed: result.checks.filter(c => c.status === 'pass').length,
        failed: result.checks.filter(c => c.status === 'fail').length,
        warnings: result.checks.filter(c => c.status === 'warn').length
      },
      timestamp: result.timestamp
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Synthetic monitoring failed', {
      error: error instanceof Error ? getErrorMessage(error) : String(error),
      duration,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Send critical alert
    await sendCriticalAlert(error as Error);

    return NextResponse.json({
      success: false,
      error: 'Monitoring system failure',
      duration
    }, { status: 500 });
  }
})

/**
 * Run basic health checks
 */
async function runHealthChecks(): Promise<MonitoringResult> {
  const checks: HealthCheck[] = [];
  const errors: string[] = [];
  const startTime = Date.now();

  // Check API endpoints
  checks.push(await checkEndpoint('/api/health', 'API Health'));
  checks.push(await checkEndpoint('/api/booking/calculate-price', 'Pricing API', 'POST', {
    serviceType: 'STANDARD_NOTARY',
    documentCount: 1,
    signerCount: 1
  }));

  // Check database connectivity
  checks.push(await checkDatabase());

  // Check Redis connectivity  
  checks.push(await checkRedis());

  // Check external services
  checks.push(await checkStripeAPI());
  checks.push(await checkGoogleMapsAPI());

  const failedChecks = checks.filter(c => c.status === 'fail');
  const success = failedChecks.length === 0;

  if (!success) {
    errors.push(...failedChecks.map(c => c.message || c.name));
  }

  return {
    timestamp: new Date().toISOString(),
    testType: 'health',
    success,
    duration: Date.now() - startTime,
    checks,
    errors,
    metrics: {
      responseTime: checks.reduce((sum, c) => sum + c.duration, 0) / checks.length,
      availability: (checks.filter(c => c.status === 'pass').length / checks.length) * 100,
      errorRate: (failedChecks.length / checks.length) * 100
    }
  };
}

/**
 * Run booking flow test
 */
async function runBookingFlow(): Promise<MonitoringResult> {
  const checks: HealthCheck[] = [];
  const errors: string[] = [];
  const startTime = Date.now();

  try {
    // Test booking creation flow
    const bookingData = {
      serviceType: 'STANDARD_NOTARY',
      locationType: 'CLIENT_ADDRESS',
      customer: {
        email: 'monitor@example.com',
        name: 'Monitoring Test',
        phone: '555-000-0000'
      },
      location: {
        address: '123 Monitor St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001'
      },
      serviceDetails: {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        documentTypes: ['Monitoring Test'],
        signerCount: 1
      },
      scheduling: {
        preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        preferredTime: '14:00'
      },
      payment: {
        paymentMethod: 'credit-card'
      },
      agreedToTerms: true,
      bookingSource: 'synthetic-monitor'
    };

    // Step 1: Price calculation
    checks.push(await checkBookingPricing(bookingData));

    // Step 2: Slot reservation  
    checks.push(await checkSlotReservation());

    // Step 3: Mock booking creation (don't create real bookings)
    checks.push(await checkBookingValidation(bookingData));

  } catch (error) {
    checks.push({
      name: 'Booking Flow',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Booking flow error: ${error instanceof Error ? getErrorMessage(error) : String(error)}`
    });
    errors.push(`Booking flow failed: ${error instanceof Error ? getErrorMessage(error) : String(error)}`);
  }

  const failedChecks = checks.filter(c => c.status === 'fail');
  const success = failedChecks.length === 0;

  return {
    timestamp: new Date().toISOString(),
    testType: 'booking',
    success,
    duration: Date.now() - startTime,
    checks,
    errors,
    metrics: {
      responseTime: checks.reduce((sum, c) => sum + c.duration, 0) / checks.length,
      availability: (checks.filter(c => c.status === 'pass').length / checks.length) * 100,
      errorRate: (failedChecks.length / checks.length) * 100
    }
  };
}

/**
 * Run full end-to-end flow
 */
async function runFullFlow(): Promise<MonitoringResult> {
  const healthResult = await runHealthChecks();
  const bookingResult = await runBookingFlow();

  // Combine results
  const allChecks = [...healthResult.checks, ...bookingResult.checks];
  const allErrors = [...healthResult.errors, ...bookingResult.errors];
  const success = healthResult.success && bookingResult.success;

  return {
    timestamp: new Date().toISOString(),
    testType: 'full-flow',
    success,
    duration: healthResult.duration + bookingResult.duration,
    checks: allChecks,
    errors: allErrors,
    metrics: {
      responseTime: allChecks.reduce((sum, c) => sum + c.duration, 0) / allChecks.length,
      availability: (allChecks.filter(c => c.status === 'pass').length / allChecks.length) * 100,
      errorRate: (allErrors.length / allChecks.length) * 100
    }
  };
}

/**
 * Check API endpoint
 */
async function checkEndpoint(
  path: string, 
  name: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';
    const url = `${baseUrl}${path}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HMNP-SyntheticMonitor/1.0'
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(MONITORING_CONFIG.timeouts.api)
    });

    const duration = Date.now() - startTime;
    const isSuccess = response.ok;
    const isSlowResponse = duration > MONITORING_CONFIG.thresholds.responseTime;

    return {
      name,
      status: isSuccess ? (isSlowResponse ? 'warn' : 'pass') : 'fail',
      duration,
      message: isSuccess ? 
        (isSlowResponse ? `Slow response: ${duration}ms` : undefined) :
        `HTTP ${response.status}: ${response.statusText}`,
      details: {
        status: response.status,
        responseTime: duration,
        url
      }
    };

  } catch (error) {
    return {
      name,
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Request failed: ${error instanceof Error ? getErrorMessage(error) : String(error)}`,
      details: { error: error instanceof Error ? getErrorMessage(error) : String(error) }
    };
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Import Prisma client dynamically to avoid issues
    const { prisma } = await import('@/lib/prisma');
    
    // Simple query to test connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      name: 'Database',
      status: 'pass',
      duration: Date.now() - startTime
    };

  } catch (error) {
    return {
      name: 'Database',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Database error: ${getErrorMessage(error)}`
    };
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const { redis } = await import('@/lib/redis');
    
    // Test Redis with ping
    const result = await redis.ping();
    
    if (result !== 'PONG') {
      throw new Error('Invalid Redis response');
    }
    
    return {
      name: 'Redis',
      status: 'pass',
      duration: Date.now() - startTime
    };

  } catch (error) {
    return {
      name: 'Redis',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Redis error: ${getErrorMessage(error)}`
    };
  }
}

/**
 * Check Stripe API
 */
async function checkStripeAPI(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        name: 'Stripe API',
        status: 'warn',
        duration: Date.now() - startTime,
        message: 'Stripe not configured'
      };
    }

    // Simple Stripe API test (retrieve account)
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      },
      signal: AbortSignal.timeout(MONITORING_CONFIG.timeouts.api)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return {
      name: 'Stripe API',
      status: 'pass',
      duration: Date.now() - startTime
    };

  } catch (error) {
    return {
      name: 'Stripe API',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Stripe error: ${getErrorMessage(error)}`
    };
  }
}

/**
 * Check Google Maps API
 */
async function checkGoogleMapsAPI(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return {
        name: 'Google Maps API',
        status: 'warn',
        duration: Date.now() - startTime,
        message: 'Google Maps not configured'
      };
    }

    // Test geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Houston,TX&key=${apiKey}`,
      { signal: AbortSignal.timeout(MONITORING_CONFIG.timeouts.api) }
    );

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    return {
      name: 'Google Maps API',
      status: 'pass',
      duration: Date.now() - startTime
    };

  } catch (error) {
    return {
      name: 'Google Maps API',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Google Maps error: ${getErrorMessage(error)}`
    };
  }
}

/**
 * Check booking pricing
 */
async function checkBookingPricing(bookingData: any): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';
    const response = await fetch(`${baseUrl}/api/booking/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType: bookingData.serviceType,
        documentCount: bookingData.serviceDetails.documentCount,
        signerCount: bookingData.serviceDetails.signerCount
      }),
      signal: AbortSignal.timeout(MONITORING_CONFIG.timeouts.booking)
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Pricing calculation failed');
    }

    return {
      name: 'Booking Pricing',
      status: 'pass',
      duration: Date.now() - startTime,
      details: { totalPrice: result.data.total }
    };

  } catch (error) {
    return {
      name: 'Booking Pricing',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Pricing error: ${getErrorMessage(error)}`
    };
  }
}

/**
 * Check slot reservation
 */
async function checkSlotReservation(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';
    const response = await fetch(`${baseUrl}/api/booking/reserve-slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'STANDARD_NOTARY',
        customerEmail: 'monitor@example.com',
        estimatedDuration: 60
      }),
      signal: AbortSignal.timeout(MONITORING_CONFIG.timeouts.booking)
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Slot reservation failed');
    }

    return {
      name: 'Slot Reservation',
      status: 'pass',
      duration: Date.now() - startTime,
      details: { reservationId: result.reservation?.id }
    };

  } catch (error) {
    return {
      name: 'Slot Reservation',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Reservation error: ${getErrorMessage(error)}`
    };
  }
}

/**
 * Check booking validation (without creating)
 */
async function checkBookingValidation(bookingData: any): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Import validation directly to test it
    const { validateBookingData } = await import('@/lib/booking-validation');
    
    validateBookingData(bookingData);

    return {
      name: 'Booking Validation',
      status: 'pass',
      duration: Date.now() - startTime
    };

  } catch (error) {
    return {
      name: 'Booking Validation',
      status: 'fail',
      duration: Date.now() - startTime,
      message: `Validation error: ${getErrorMessage(error)}`
    };
  }
}

/**
 * Send alert for failures
 */
async function sendAlert(result: MonitoringResult): Promise<void> {
  try {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhook) return;

    const failedChecks = result.checks.filter(c => c.status === 'fail');
    const warningChecks = result.checks.filter(c => c.status === 'warn');

    const message = {
      text: `🚨 HMNP Monitoring Alert - ${result.testType}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 Monitoring Alert: ${result.testType.toUpperCase()}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:* ${result.success ? '✅ Pass' : '❌ Fail'}`
            },
            {
              type: 'mrkdwn', 
              text: `*Duration:* ${result.duration}ms`
            },
            {
              type: 'mrkdwn',
              text: `*Failed Checks:* ${failedChecks.length}`
            },
            {
              type: 'mrkdwn',
              text: `*Warnings:* ${warningChecks.length}`
            }
          ]
        }
      ]
    };

    if (failedChecks.length > 0) {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Failed Checks:*\n${failedChecks.map(c => `• ${c.name}: ${c.message}`).join('\n')}`
        }
      });
    }

    await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

  } catch (error) {
    logger.error('Failed to send alert', { error: getErrorMessage(error) });
  }
}

/**
 * Send critical alert for system failures
 */
async function sendCriticalAlert(error: Error): Promise<void> {
  try {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhook) return;

    const message = {
      text: `🆘 CRITICAL: HMNP Monitoring System Failure`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🆘 CRITICAL ALERT: Monitoring System Failure'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `The synthetic monitoring system has failed:\n\`\`\`${getErrorMessage(error)}\`\`\``
          }
        }
      ]
    };

    await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

  } catch (alertError) {
    logger.error('Failed to send critical alert', { error: getErrorMessage(alertError) });
  }
}

/**
 * Send metrics to monitoring systems
 */
async function sendMetrics(result: MonitoringResult): Promise<void> {
  try {
    // Send to custom metrics endpoint
    const metricsEndpoint = process.env.METRICS_ENDPOINT;
    if (metricsEndpoint) {
      await fetch(metricsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: result.timestamp,
          service: 'hmnp-synthetic-monitor',
          metrics: result.metrics,
          tags: {
            testType: result.testType,
            success: result.success.toString()
          }
        })
      });
    }

    // Log structured metrics for Logflare/etc
    logger.info('Synthetic monitoring metrics', {
      timestamp: result.timestamp,
      testType: result.testType,
      success: result.success,
      metrics: result.metrics,
      checks: result.checks.length
    });

  } catch (error) {
    logger.error('Failed to send metrics', { error: getErrorMessage(error) });
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
    },
  });
}
