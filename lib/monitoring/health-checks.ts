/**
 * Production Health Checks and Monitoring
 * Comprehensive system health monitoring for all critical services
 */

import { prisma } from '@/lib/database-connection';
import { Prisma } from '@prisma/client';

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  details?: any;
  timestamp: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: string;
  uptime: number;
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Test critical tables
    const [bookingCount, serviceCount, userCount] = await Promise.all([
      prisma.booking.count(),
      prisma.service.count(),
      prisma.user.count(),
    ]);
    
    const responseTime = Date.now() - start;
    
    // Check for reasonable data
    if (serviceCount === 0) {
      return {
        name: 'database',
        status: 'degraded',
        responseTime,
        message: 'No services configured',
        timestamp: new Date().toISOString(),
      };
    }
    
    return {
      name: 'database',
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime,
      message: 'Database operational',
      details: {
        bookings: bookingCount,
        services: serviceCount,
        users: userCount,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * External services health check
 */
export async function checkExternalServices(): Promise<HealthCheckResult[]> {
  const checks: Promise<HealthCheckResult>[] = [];
  
  // Stripe health check
  checks.push(checkStripeHealth());
  
  // Google Maps health check
  checks.push(checkGoogleMapsHealth());
  
  // GoHighLevel health check
  checks.push(checkGHLHealth());
  
  return Promise.all(checks);
}

async function checkStripeHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        name: 'stripe',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: 'Stripe not configured',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Simple API call to test connectivity
    const response = await fetch('https://api.stripe.com/v1/payment_methods', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return {
        name: 'stripe',
        status: 'healthy',
        responseTime,
        message: 'Stripe API operational',
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        name: 'stripe',
        status: 'degraded',
        responseTime,
        message: `Stripe API returned ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      name: 'stripe',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Stripe API error',
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkGoogleMapsHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return {
        name: 'google_maps',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: 'Google Maps API key not configured',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Test geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Houston,TX&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const responseTime = Date.now() - start;
    const data = await response.json();
    
    if (data.status === 'OK') {
      return {
        name: 'google_maps',
        status: 'healthy',
        responseTime,
        message: 'Google Maps API operational',
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        name: 'google_maps',
        status: 'degraded',
        responseTime,
        message: `Google Maps API status: ${data.status}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      name: 'google_maps',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Google Maps API error',
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkGHLHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    if (!process.env.GHL_API_KEY) {
      return {
        name: 'gohighlevel',
        status: 'degraded',
        responseTime: Date.now() - start,
        message: 'GHL integration not configured',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Test GHL API connectivity
    const response = await fetch('https://rest.gohighlevel.com/v1/locations/', {
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      },
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return {
        name: 'gohighlevel',
        status: 'healthy',
        responseTime,
        message: 'GHL API operational',
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        name: 'gohighlevel',
        status: 'degraded',
        responseTime,
        message: `GHL API returned ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      name: 'gohighlevel',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'GHL API error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Critical business logic health checks
 */
export async function checkBusinessLogicHealth(): Promise<HealthCheckResult[]> {
  const checks: Promise<HealthCheckResult>[] = [];
  
  // Booking system health
  checks.push(checkBookingSystemHealth());
  
  // Payment system health
  checks.push(checkPaymentSystemHealth());
  
  // Pricing system health
  checks.push(checkPricingSystemHealth());
  
  return Promise.all(checks);
}

async function checkBookingSystemHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    // Test that we can fetch services and create mock booking data
    const services = await prisma.service.findMany({
      where: { isActive: true },
      take: 1,
    });
    
    if (services.length === 0) {
      return {
        name: 'booking_system',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        message: 'No active services available',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Check recent booking activity (last 24 hours)
    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });
    
    return {
      name: 'booking_system',
      status: 'healthy',
      responseTime: Date.now() - start,
      message: 'Booking system operational',
      details: {
        activeServices: services.length,
        recentBookings24h: recentBookings,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'booking_system',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Booking system error',
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkPaymentSystemHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    // Check for recent payment activity
    const recentPayments = await prisma.payment.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });
    
    const pendingPayments = await prisma.payment.count({
      where: {
        status: 'PENDING',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });
    
    // Test Stripe connectivity using centralized client (safe from header corruption)
    let stripeStatus = 'unknown';
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const { stripe } = await import('@/lib/stripe');
        // Simple API call to test connectivity without manual headers
        await stripe.balance.retrieve();
        stripeStatus = 'healthy';
      } else {
        stripeStatus = 'not_configured';
      }
    } catch (stripeError) {
      console.warn('[HEALTH_CHECK] Stripe connectivity test failed:', stripeError);
      stripeStatus = 'degraded';
    }
    
    return {
      name: 'payment_system',
      status: stripeStatus === 'healthy' ? 'healthy' : 'degraded',
      responseTime: Date.now() - start,
      message: `Payment system operational, Stripe: ${stripeStatus}`,
      details: {
        recentPayments24h: recentPayments,
        pendingPayments24h: pendingPayments,
        stripeConnectivity: stripeStatus,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'payment_system',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Payment system error',
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkPricingSystemHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    // Test pricing calculation for standard service
    const standardService = await prisma.service.findFirst({
      where: {
        serviceType: 'STANDARD_NOTARY',
        isActive: true,
      },
    });
    
    if (!standardService) {
      return {
        name: 'pricing_system',
        status: 'degraded',
        responseTime: Date.now() - start,
        message: 'No standard notary service configured',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Verify pricing is reasonable
    const basePrice = standardService.basePrice?.toNumber() || 0;
    const depositAmount = standardService.depositAmount?.toNumber() || 0;
    
    if (basePrice < 50 || basePrice > 500) {
      return {
        name: 'pricing_system',
        status: 'degraded',
        responseTime: Date.now() - start,
        message: `Unusual base price: $${basePrice}`,
        timestamp: new Date().toISOString(),
      };
    }
    
    return {
      name: 'pricing_system',
      status: 'healthy',
      responseTime: Date.now() - start,
      message: 'Pricing system operational',
      details: {
        basePrice,
        depositAmount,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'pricing_system',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Pricing system error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Run all health checks and return overall system status
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const startTime = Date.now();
  
  try {
    const [
      databaseHealth,
      externalServicesHealth,
      businessLogicHealth,
    ] = await Promise.all([
      checkDatabaseHealth(),
      checkExternalServices(),
      checkBusinessLogicHealth(),
    ]);
    
    const allChecks = [
      databaseHealth,
      ...externalServicesHealth,
      ...businessLogicHealth,
    ];
    
    // Determine overall status
    const unhealthyCount = allChecks.filter(check => check.status === 'unhealthy').length;
    const degradedCount = allChecks.filter(check => check.status === 'degraded').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    return {
      overall: overallStatus,
      checks: allChecks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  } catch (error) {
    return {
      overall: 'unhealthy',
      checks: [{
        name: 'health_check_system',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Health check system error',
        timestamp: new Date().toISOString(),
      }],
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}