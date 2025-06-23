/**
 * Houston Mobile Notary Pros - API Server
 * Enhanced GHL Integration with Advanced Security
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import expressWinston from 'express-winston';

// Import middleware and utilities
import { webhookSecurity } from './middleware/webhookSecurity.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate, authorize, optionalAuthenticate, apiKeyAuth } from './middleware/auth.js';
import { sanitizeInputs } from './middleware/validator.js';
import { applyRateLimit } from './middleware/rateLimiter.js';
import bodyParser from 'body-parser';
import { requestLogger } from './middleware/requestLogger.js';

// Import route handlers
import bookingRoutes from './routes/bookings.js';
import webhookRoutes from './routes/webhooks.js';
import healthRoutes from './routes/health.js';
import calendarRoutes from './routes/calendar.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

// Database connection
import { connectDatabase } from './config/database.js';

// Initialize Express app
const app = express();
const PORT = process.env.API_PORT || 3001;

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'houston-mobile-notary-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'cdn.example.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      connectSrc: ["'self'", 'api.example.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Parse JSON requests
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Input sanitization middleware - after body parsing, before routes
app.use(sanitizeInputs);

// CORS configuration
app.use(cors({
  origin: (() => {
    // Allow explicit origins from env; fallback is environment-aware
    if (process.env.ALLOWED_ORIGINS) {
      return process.env.ALLOWED_ORIGINS.split(',');
    }
    // In development we can safely allow all origins for local testing
    if (process.env.NODE_ENV === 'development') {
      return '*';
    }
    // In production default to the primary site domain to prevent wildcard exposure
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://houstonmobilenotarypros.com';
  })(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
}));

// Advanced rate limiting - granular limits based on route and authentication
app.use(applyRateLimit);

// Request logging middleware
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function () { return false; }
}));

app.use(bodyParser.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook signature verification
    req.rawBody = buf;
  }
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(requestLogger);

// Health check route (no auth required)
app.use('/health', healthRoutes);

// Authentication routes (login/registration endpoints are public)
app.use('/api/auth', authRoutes);

// Webhook routes (with enhanced security)
// Allow access via webhook security or API key
app.use('/webhooks', (req, res, next) => {
  // Check for GHL signature first (webhookSecurity)
  if (req.headers['x-ghl-signature']) {
    return webhookSecurity(req, res, next);
  }
  // Otherwise, check for API key
  return apiKeyAuth(req, res, next);
}, webhookRoutes);

// API routes with authentication
// Public calendar routes (available slots) use optional authentication
app.use('/api/calendar/available-slots', optionalAuthenticate, calendarRoutes);

// Protected routes requiring authentication
app.use('/api/bookings', authenticate, bookingRoutes);
app.use('/api/calendar', authenticate, calendarRoutes);
app.use('/api/admin', authenticate, authorize(['ADMIN', 'STAFF']), adminRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Houston Mobile Notary Pros API',
    version: '1.0.0',
    status: 'operational',
    database: 'Neon PostgreSQL',
    endpoints: {
      health: '/health',
      bookings: '/api/bookings',
      webhooks: '/webhooks'
    },
    documentation: 'See HOUSTON_MOBILE_NOTARY_WORKFLOW_GUIDE.md'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/bookings/pending-payments',
      'POST /api/bookings/sync',
      'PATCH /api/bookings/pending-payments',
      'GET /api/calendar/available-slots',
      'GET /api/calendar/service-settings',
      'GET /api/admin/business-settings',
      'POST /api/admin/business-settings',
      'POST /webhooks/ghl',
      'POST /webhooks/stripe'
    ]
  });
});

// Error handling middleware (must be last)
app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Houston Mobile Notary API server running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`💾 Database: Neon PostgreSQL with Prisma`);
      logger.info(`🔒 Security features enabled: Helmet, CORS, Rate Limiting`);
      logger.info(`📡 Webhook endpoints ready for GHL integration`);

      if (process.env.NODE_ENV === 'development') {
        console.log('\n�� Development Mode - Available Endpoints:');
        console.log(`   GET  http://localhost:${PORT}/health`);
        console.log(`   GET  http://localhost:${PORT}/api/bookings/pending-payments`);
        console.log(`   POST http://localhost:${PORT}/api/bookings/sync`);
        console.log(`   POST http://localhost:${PORT}/webhooks/ghl`);
        console.log(`   POST http://localhost:${PORT}/webhooks/stripe`);
        console.log('\n📚 See HOUSTON_MOBILE_NOTARY_WORKFLOW_GUIDE.md for implementation details\n');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});