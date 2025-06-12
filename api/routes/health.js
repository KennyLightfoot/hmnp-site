/**
 * Health Check Routes
 * Houston Mobile Notary Pros API
 */

import express from 'express';
import { healthCheck } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/', asyncHandler(async (req, res) => {
  const startTime = process.hrtime.bigint();
  
  try {
    // Check database health
    const dbHealth = await healthCheck();
    
    // Calculate response time
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // System information
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    };

    // Overall health status
    const isHealthy = dbHealth.status === 'healthy';
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime.toFixed(2)}ms`,
      version: '1.0.0',
      service: 'Houston Mobile Notary API',
      checks: {
        database: dbHealth,
        server: {
          status: 'healthy',
          uptime: `${Math.floor(systemInfo.uptime)}s`,
          memory: {
            used: `${Math.round(systemInfo.memory.heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(systemInfo.memory.heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(systemInfo.memory.rss / 1024 / 1024)}MB`
          }
        },
        environment: {
          node: systemInfo.nodeVersion,
          platform: systemInfo.platform,
          env: systemInfo.environment
        }
      }
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message,
      service: 'Houston Mobile Notary API'
    });
  }
}));

/**
 * GET /health/detailed
 * Detailed health check with all subsystems
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const checks = {};
  const startTime = Date.now();
  
  try {
    // Database check
    checks.database = await healthCheck();
    
    // Environment variables check
    checks.environment = {
      status: 'healthy',
      variables: {
        port: !!process.env.PORT,
        mongoUri: !!process.env.MONGODB_URI,
        ghlApiKey: !!process.env.GHL_API_KEY,
        ghlWebhookSecret: !!process.env.GHL_WEBHOOK_SECRET,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    };

    // Memory check
    const memory = process.memoryUsage();
    const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
    checks.memory = {
      status: memoryUsagePercent < 90 ? 'healthy' : 'warning',
      usage: `${memoryUsagePercent.toFixed(2)}%`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`
    };

    // Disk space check (basic)
    checks.disk = {
      status: 'healthy',
      message: 'Disk space monitoring not implemented'
    };

    // External services check
    checks.externalServices = {
      ghl: {
        status: process.env.GHL_API_KEY ? 'configured' : 'not_configured',
        baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com'
      },
      stripe: {
        status: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not_configured'
      }
    };

    // Calculate overall health
    const allHealthy = Object.values(checks).every(check => 
      check.status === 'healthy' || check.status === 'configured'
    );

    const responseTime = Date.now() - startTime;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      service: 'Houston Mobile Notary API',
      uptime: `${Math.floor(process.uptime())}s`,
      checks
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed',
      message: error.message,
      service: 'Houston Mobile Notary API',
      checks
    });
  }
}));

/**
 * GET /health/ready
 * Kubernetes/Docker readiness probe
 */
router.get('/ready', asyncHandler(async (req, res) => {
  try {
    // Quick database ping
    const dbHealth = await healthCheck();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        reason: 'Database not healthy',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * GET /health/live
 * Kubernetes/Docker liveness probe
 */
router.get('/live', (req, res) => {
  // Simple liveness check - if the server can respond, it's alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

export default router; 