/**
 * Database Connection Wrapper (Legacy)
 * Updated to use unified database connection
 * 
 * MIGRATION: This file now exports from the unified database-connection.ts
 * All existing imports from '@/lib/prisma' will continue to work without changes
 * 
 * @deprecated Consider migrating to '@/lib/database-connection' directly for new code
 */

// Export unified database connection components
export { 
  prisma, 
  disconnectPrisma, 
  prismaHealthCheck,
  withRetry,
  transaction 
} from './database-connection';

// Type re-exports for convenience
export type { PrismaClient } from '@prisma/client';