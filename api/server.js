/**
 * Houston Mobile Notary Pros - API Server
 * Enhanced GHL Integration with Advanced Security
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import winston from 'winston';
import expressWinston from 'express-winston';

// Import middleware and utilities
import { webhookSecurity } from './middleware/webhookSecurity.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import route handlers
import bookingRoutes from './routes/bookings.js';
import webhookRoutes from './routes/webhooks.js';
import healthRoutes from './routes/health.js';

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

// Global rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://houstonmobilenotarypros.com', 'https://services.leadconnectorhq.com']
    : ['http://localhost:3000', 'https://services.leadconnectorhq.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-ghl-signature', 'x-webhook-source']
}));

// Apply rate limiting
app.use(limiter);

// Request logging middleware
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

// Body parsing middleware
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

// Webhook routes (with enhanced security)
app.use('/webhooks', webhookSecurity, webhookRoutes);

// API routes
app.use('/api/bookings', bookingRoutes);

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
        console.log('\n🔧 Development Mode - Available Endpoints:');
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