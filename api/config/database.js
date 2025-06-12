/**
 * Database Configuration - Neon PostgreSQL Connection
 * Houston Mobile Notary Pros API
 */

import { PrismaClient } from '@prisma/client';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Prisma client instance
let prisma = null;
let isConnected = false;

// Connection options
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
};

/**
 * Connect to Neon PostgreSQL database
 */
async function connectDatabase() {
  if (isConnected && prisma) {
    logger.info('Database already connected');
    return prisma;
  }

  try {
    logger.info('Connecting to Neon PostgreSQL...');
    
    // Create Prisma client
    prisma = new PrismaClient(prismaOptions);
    
    // Test connection with a simple query
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    
    isConnected = true;
    logger.info('✅ Neon PostgreSQL connected successfully');
    
    // Connection event handlers
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
      logger.info('Prisma disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      logger.info('Neon PostgreSQL connection closed through app termination');
      process.exit(0);
    });

    return prisma;

  } catch (error) {
    logger.error('❌ Neon PostgreSQL connection failed:', error.message);
    isConnected = false;
    throw error;
  }
}

/**
 * Get Prisma client instance
 */
function getPrismaClient() {
  if (!prisma) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return prisma;
}

/**
 * Get connection status
 */
function getConnectionStatus() {
  return {
    isConnected,
    databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not_configured',
    provider: 'postgresql',
    platform: 'neon'
  };
}

/**
 * Health check for database
 */
async function healthCheck() {
  try {
    if (!isConnected || !prisma) {
      throw new Error('Database not connected');
    }

    // Simple query to verify connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get database info
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        version() as version,
        current_database() as database_name,
        current_user as user_name
    `;
    
    return {
      status: 'healthy',
      message: 'Neon PostgreSQL connection is active',
      details: {
        ...getConnectionStatus(),
        dbInfo: dbInfo[0],
        testQuery: result[0]
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Neon PostgreSQL connection failed',
      error: error.message,
      details: getConnectionStatus()
    };
  }
}

/**
 * Execute raw SQL query
 */
async function executeRawQuery(query, params = []) {
  try {
    if (!prisma) {
      throw new Error('Database not connected');
    }
    
    const result = await prisma.$queryRawUnsafe(query, ...params);
    return result;
  } catch (error) {
    logger.error('Raw query execution failed:', error.message);
    throw error;
  }
}

/**
 * Begin transaction
 */
async function beginTransaction(callback) {
  try {
    if (!prisma) {
      throw new Error('Database not connected');
    }
    
    return await prisma.$transaction(callback);
  } catch (error) {
    logger.error('Transaction failed:', error.message);
    throw error;
  }
}

export {
  connectDatabase,
  getPrismaClient,
  getConnectionStatus,
  healthCheck,
  executeRawQuery,
  beginTransaction
}; 