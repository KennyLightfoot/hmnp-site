/**
 * Database Connection Wrapper
 * Updated to use unified database connection for improved performance and consistency
 * 
 * MIGRATION: This file now exports from the unified database-connection.ts
 * All existing imports from '@/lib/db' will continue to work without changes
 */

// Export unified database connection components
export { 
  prisma, 
  disconnectPrisma, 
  prismaHealthCheck,
  withRetry,
  transaction,
  UnifiedDatabaseConnection 
} from './database-connection';

// Type re-exports for convenience
export type { PrismaClient } from '@prisma/client';