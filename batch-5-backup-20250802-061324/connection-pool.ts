/**
 * Database Connection Pool Management
 * Optimizes database connections for performance and reliability
 */

import { PrismaClient } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from '@/lib/logger';

// Connection pool configuration
const CONNECTION_POOL_CONFIG = {
  // Maximum number of connections in the pool
  connection_limit: parseInt(process?.env?.DATABASE_CONNECTION_LIMIT || '20'),
  
  // Connection timeout in milliseconds
  connect_timeout: parseInt(process?.env?.DATABASE_CONNECT_TIMEOUT || '10000'),
  
  // Query timeout in milliseconds  
  query_timeout: parseInt(process?.env?.DATABASE_QUERY_TIMEOUT || '30000'),
  
  // Pool timeout in milliseconds
  pool_timeout: parseInt(process?.env?.DATABASE_POOL_TIMEOUT || '10000'),
  
  // SSL configuration
  sslmode: process?.env?.DATABASE_SSL_MODE || 'require',
  
  // Transaction isolation level
  transaction_isolation: process?.env?.DATABASE_TRANSACTION_ISOLATION || 'READ_COMMITTED',
};

// Enhanced Prisma client with connection pooling
class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private prismaClient: PrismaClient;
  private connectionCount = 0;
  private queryCount = 0;
  private errorCount = 0;
  private startTime = Date?.now();

  private constructor() {
    this?.prismaClient = new PrismaClient({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'query', emit: 'event' },
      ],
      datasources: {
        db: {
          url: this?.buildDatabaseUrl()
        }
      }
    });

    this?.setupEventListeners();
    this?.setupGracefulShutdown();
  }

  private buildDatabaseUrl(): string {
    const baseUrl = process?.env?.DATABASE_URL;
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Parse existing URL
    const url = new URL(baseUrl);
    
    // Add connection pool parameters
    url?.searchParams?.set('connection_limit', CONNECTION_POOL_CONFIG?.connection_limit?.toString());
    url?.searchParams?.set('connect_timeout', CONNECTION_POOL_CONFIG?.connect_timeout?.toString());
    url?.searchParams?.set('pool_timeout', CONNECTION_POOL_CONFIG?.pool_timeout?.toString());
    url?.searchParams?.set('sslmode', CONNECTION_POOL_CONFIG?.sslmode);
    url?.searchParams?.set('statement_cache_size', '100');
    url?.searchParams?.set('prepared_statement_cache_size', '100');
    
    // Add pgbouncer optimization if using PostgreSQL
    if (url?.protocol === 'postgresql:' || url?.protocol === 'postgres:') {
      url?.searchParams?.set('pgbouncer', 'true');
      url?.searchParams?.set('schema', 'public');
    }

    logger?.info('Database connection pool configured', {
      connectionLimit: CONNECTION_POOL_CONFIG?.connection_limit,
      connectTimeout: CONNECTION_POOL_CONFIG?.connect_timeout,
      poolTimeout: CONNECTION_POOL_CONFIG?.pool_timeout
    });

    return url?.toString();
  }

  private setupEventListeners(): void {
    // Query event logging
    this?.prismaClient.$on('query', (event) => {
      this?.queryCount++;
      
      if (event?.duration > 1000) { // Log slow queries
        logger?.warn('Slow database query detected', {
          query: event?.query?.substring(0, 200) + '...',
          duration: event?.duration,
          params: event?.params
        });
      }
      
      if (process?.env?.NODE_ENV === 'development' && event?.duration > 100) {
        console?.log(`[DB QUERY] ${event?.duration}ms: ${event?.query?.substring(0, 100)}...`);
      }
    });

    // Error event logging
    this?.prismaClient.$on('error', (event) => {
      this?.errorCount++;
      logger?.error('Database error occurred', {
        message: event?.message,
        target: event?.target
      });
    });

    // Info event logging
    this?.prismaClient.$on('info', (event) => {
      logger?.info('Database info', {
        message: event?.message,
        target: event?.target
      });
    });

    // Warning event logging
    this?.prismaClient.$on('warn', (event) => {
      logger?.warn('Database warning', {
        message: event?.message,
        target: event?.target
      });
    });
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async () => {
      logger?.info('Shutting down database connection pool gracefully...');
      await this?.disconnect();
      process?.exit(0);
    };

    process?.on('SIGINT', gracefulShutdown);
    process?.on('SIGTERM', gracefulShutdown);
    process?.on('SIGUSR2', gracefulShutdown); // Nodemon restart
  }

  public static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool?.instance) {
      DatabaseConnectionPool?.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool?.instance;
  }

  public getClient(): PrismaClient {
    return this?.prismaClient;
  }

  public async connect(): Promise<void> {
    try {
      await this?.prismaClient.$connect();
      this?.connectionCount++;
      logger?.info('Database connection pool initialized successfully', {
        connectionCount: this?.connectionCount,
        config: CONNECTION_POOL_CONFIG
      });
    } catch (error) {
      this?.errorCount++;
      logger?.error('Failed to initialize database connection pool', {
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
        config: CONNECTION_POOL_CONFIG
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this?.prismaClient.$disconnect();
      logger?.info('Database connection pool disconnected successfully');
    } catch (error) {
      logger?.error('Error disconnecting database connection pool', {
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      });
    }
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    metrics: DatabaseMetrics;
  }> {
    const startTime = Date?.now();
    
    try {
      // Test basic connectivity
      await this?.prismaClient.$queryRaw`SELECT 1 as health_check`;
      
      const responseTime = Date?.now() - startTime;
      const uptime = Date?.now() - this?.startTime;
      
      return {
        status: 'healthy',
        metrics: {
          responseTime,
          uptime,
          connectionCount: this?.connectionCount,
          queryCount: this?.queryCount,
          errorCount: this?.errorCount,
          poolConfig: CONNECTION_POOL_CONFIG,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this?.errorCount++;
      const responseTime = Date?.now() - startTime;
      
      return {
        status: 'unhealthy',
        metrics: {
          responseTime,
          uptime: Date?.now() - this?.startTime,
          connectionCount: this?.connectionCount,
          queryCount: this?.queryCount,
          errorCount: this?.errorCount,
          poolConfig: CONNECTION_POOL_CONFIG,
          error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  public getMetrics(): DatabaseMetrics {
    return {
      responseTime: 0, // Not applicable for this context
      uptime: Date?.now() - this?.startTime,
      connectionCount: this?.connectionCount,
      queryCount: this?.queryCount,
      errorCount: this?.errorCount,
      poolConfig: CONNECTION_POOL_CONFIG,
      timestamp: new Date().toISOString()
    };
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this?.errorCount++;
        
        if (attempt === maxRetries) {
          logger?.error('Database operation failed after all retries', {
            error: getErrorMessage(lastError),
            attempts: attempt,
            maxRetries
          });
          throw lastError;
        }
        
        logger?.warn('Database operation failed, retrying...', {
          error: getErrorMessage(lastError),
          attempt,
          maxRetries,
          retryDelay
        });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  public async transaction<T>(
    operation: (tx: any) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
    }
  ): Promise<T> {
    const maxWait = options?.maxWait || 5000; // 5 seconds
    const timeout = options?.timeout || 30000; // 30 seconds
    
    return this?.executeWithRetry(async () => {
      return this?.prismaClient.$transaction(operation, {
        maxWait,
        timeout
      });
    });
  }
}

export interface DatabaseMetrics {
  responseTime: number;
  uptime: number;
  connectionCount: number;
  queryCount: number;
  errorCount: number;
  poolConfig: typeof CONNECTION_POOL_CONFIG;
  error?: string;
  timestamp: string;
}

// Export singleton instance
export const dbPool = DatabaseConnectionPool?.getInstance();

// Export the Prisma client from the pool
export const prisma = dbPool?.getClient();

// Initialize connection on module load
if (process?.env?.NODE_ENV !== 'test') {
  dbPool?.connect().catch((error) => {
    logger?.error('Failed to initialize database connection pool on startup', {
      error: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
    });
  });
}

// Export utilities
export const executeWithRetry = dbPool?.executeWithRetry?.bind(dbPool);
export const transaction = dbPool?.transaction?.bind(dbPool);
export const getDatabaseMetrics = dbPool?.getMetrics?.bind(dbPool);
export const getDatabaseHealth = dbPool?.healthCheck?.bind(dbPool);
