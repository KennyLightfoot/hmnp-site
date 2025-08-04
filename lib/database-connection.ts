/**
 * Unified Database Connection Utility
 * Consolidated from multiple Prisma connection implementations
 * Optimized for production with pooling, error handling, and edge compatibility
 */

import { PrismaClient } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils/error-utils';

declare global {
  var __prisma: PrismaClient | undefined;
}

interface DatabaseConfig {
  maxRetries?: number;
  retryDelay?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
}

class UnifiedDatabaseConnection {
  private static instance: PrismaClient | null = null;
  private static config: DatabaseConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    connectionTimeout: 10000,
    queryTimeout: 30000,
  };

  public static getInstance(): PrismaClient {
    if (!UnifiedDatabaseConnection.instance) {
      UnifiedDatabaseConnection.instance = global.__prisma || new PrismaClient({
        log: UnifiedDatabaseConnection.getLogLevel(),
        errorFormat: 'pretty',
      });

      // Store in global for hot reload in development
      if (process.env.NODE_ENV === 'development') {
        global.__prisma = UnifiedDatabaseConnection.instance;
      }

      // Setup graceful shutdown handlers
      UnifiedDatabaseConnection.setupShutdownHandlers();
    }

    return UnifiedDatabaseConnection.instance;
  }

  private static getLogLevel(): Array<'query' | 'info' | 'warn' | 'error'> {
    if (process.env.NODE_ENV === 'development') {
      return ['query', 'error', 'warn'];
    }
    if (process.env.NODE_ENV === 'test') {
      return ['error'];
    }
    return ['error'];
  }

  private static setupShutdownHandlers(): void {
    const cleanup = async () => {
      await UnifiedDatabaseConnection.disconnect();
    };

    process.on('beforeExit', cleanup);
    process.on('SIGINT', async () => {
      await cleanup();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await cleanup();
      process.exit(0);
    });
  }

  public static async disconnect(): Promise<void> {
    if (UnifiedDatabaseConnection.instance) {
      await UnifiedDatabaseConnection.instance.$disconnect();
      UnifiedDatabaseConnection.instance = null;
      if (global.__prisma) {
        global.__prisma = undefined;
      }
    }
  }

  public static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      const client = UnifiedDatabaseConnection.getInstance();
      await client.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      };
    }
  }

  public static async withRetry<T>(
    operation: (client: PrismaClient) => Promise<T>,
    retries: number = UnifiedDatabaseConnection.config.maxRetries!
  ): Promise<T> {
    const client = UnifiedDatabaseConnection.getInstance();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation(client);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        const delay = UnifiedDatabaseConnection.config.retryDelay! * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  public static async transaction<T>(
    operations: (client: PrismaClient) => Promise<T>
  ): Promise<T> {
    const client = UnifiedDatabaseConnection.getInstance();
    return client.$transaction(async (tx) => {
      return operations(tx as PrismaClient);
    });
  }
}

// Export the singleton instance
export const prisma = UnifiedDatabaseConnection.getInstance();

// Export utilities
export const disconnectPrisma = UnifiedDatabaseConnection.disconnect;
export const prismaHealthCheck = UnifiedDatabaseConnection.healthCheck;
export const withRetry = UnifiedDatabaseConnection.withRetry;
export const transaction = UnifiedDatabaseConnection.transaction;

// Export for testing
export { UnifiedDatabaseConnection };

// Type exports for convenience
export type { PrismaClient } from '@prisma/client';