/**
 * Centralized Prisma Client Singleton
 * Replaces multiple Prisma client instances across the codebase
 * Prevents connection exhaustion and ensures consistent behavior
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // Prevent multiple instances during hot reload in development
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern for Prisma client
class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = global.__prisma || new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
        errorFormat: 'pretty',
      });

      // Store in global for hot reload in development
      if (process.env.NODE_ENV === 'development') {
        global.__prisma = PrismaClientSingleton.instance;
      }

      // Graceful shutdown handlers
      process.on('beforeExit', async () => {
        await PrismaClientSingleton.instance?.$disconnect();
      });

      process.on('SIGINT', async () => {
        await PrismaClientSingleton.instance?.$disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await PrismaClientSingleton.instance?.$disconnect();
        process.exit(0);
      });
    }

    return PrismaClientSingleton.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
      if (global.__prisma) {
        global.__prisma = undefined;
      }
    }
  }

  public static async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime?: number; error?: string }> {
    try {
      const start = Date.now();
      const client = PrismaClientSingleton.getInstance();
      await client.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export the singleton instance
export const prisma = PrismaClientSingleton.getInstance();

// Export utilities
export const disconnectPrisma = PrismaClientSingleton.disconnect;
export const prismaHealthCheck = PrismaClientSingleton.healthCheck;

// Export for testing
export { PrismaClientSingleton }; 