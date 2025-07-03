/**
 * Redis Client Configuration
 * Provides Redis connection with connection pooling, error handling, and monitoring
 */

import Redis from 'ioredis';
import { logger } from './logger';

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  connectTimeout?: number;
  commandTimeout?: number;
  lazyConnect?: boolean;
}

class RedisClient {
  private client: Redis | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds

  constructor(private config: RedisConfig = {}) {
    this.initialize();
  }

  private async initialize() {
    try {
      const redisConfig: RedisConfig = {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        connectTimeout: 10000,
        commandTimeout: 5000,
        lazyConnect: true,
        ...this.config
      };

      // Use Redis URL if provided, otherwise use individual config
      if (process.env.REDIS_URL) {
        this.client = new Redis(process.env.REDIS_URL, redisConfig);
      } else if (process.env.UPSTASH_REDIS_REST_URL) {
        // Upstash Redis (for Vercel deployment)
        const { Redis: UpstashRedis } = await import('@upstash/redis');
        // We'll create a wrapper to make it compatible with ioredis interface
        const upstashClient = new UpstashRedis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        this.client = this.createUpstashWrapper(upstashClient);
      } else {
        // Local Redis configuration
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
          ...redisConfig
        });
      }

      this.setupEventListeners();
      await this.connect();
      
    } catch (error) {
      logger.error('Redis initialization failed', error as Error);
      this.scheduleReconnect();
    }
  }

  private createUpstashWrapper(upstashClient: any): any {
    // Create a wrapper to make Upstash Redis compatible with ioredis interface
    return {
      get: (key: string) => upstashClient.get(key),
      set: (key: string, value: string, ...args: any[]) => {
        if (args.length >= 2 && args[0] === 'EX') {
          return upstashClient.setex(key, args[1], value);
        }
        return upstashClient.set(key, value);
      },
      setex: (key: string, seconds: number, value: string) => upstashClient.setex(key, seconds, value),
      del: (key: string) => upstashClient.del(key),
      exists: (key: string) => upstashClient.exists(key),
      incr: (key: string) => upstashClient.incr(key),
      expire: (key: string, seconds: number) => upstashClient.expire(key, seconds),
      keys: (pattern: string) => upstashClient.keys(pattern),
      flushdb: () => upstashClient.flushdb(),
      info: (section?: string) => upstashClient.info(section),
      dbsize: () => upstashClient.dbsize(),
      ping: () => upstashClient.ping(),
      quit: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      status: 'ready',
      on: () => {},
      off: () => {},
    };
  }

  private setupEventListeners() {
    if (!this.client || typeof this.client.on !== 'function') return;

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
      this.isConnected = true;
      this.connectionAttempts = 0;
    });

    this.client.on('ready', () => {
      logger.info('Redis ready for commands');
    });

    this.client.on('error', (error) => {
      logger.error('Redis connection error', error);
      this.isConnected = false;
      this.scheduleReconnect();
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (time) => {
      logger.info(`Redis reconnecting in ${time}ms`);
    });
  }

  private async connect(): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');

    try {
      if (typeof this.client.connect === 'function') {
        await this.client.connect();
      }
      
      // Test connection
      await this.ping();
      this.isConnected = true;
      logger.info('Redis connection established');
      
    } catch (error) {
      logger.error('Redis connection failed', error as Error);
      this.isConnected = false;
      throw error;
    }
  }

  private scheduleReconnect() {
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      logger.error('Max Redis connection attempts reached, giving up');
      return;
    }

    this.connectionAttempts++;
    setTimeout(() => {
      logger.info(`Attempting Redis reconnection ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
      this.initialize();
    }, this.reconnectInterval);
  }

  // Public methods
  async ping(): Promise<string> {
    if (!this.client) throw new Error('Redis client not available');
    return await this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      return await this.client!.get(key);
    } catch (error) {
      logger.error('Redis GET error', error as Error, { key });
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (ttlSeconds) {
        await this.client!.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client!.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error', error as Error, { key, ttlSeconds });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error', error as Error, { key });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const result = await this.client!.exists(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis EXISTS error', error as Error, { key });
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isAvailable()) return 0;
    try {
      return await this.client!.incr(key);
    } catch (error) {
      logger.error('Redis INCR error', error as Error, { key });
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      await this.client!.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Redis EXPIRE error', error as Error, { key, seconds });
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.isAvailable()) return [];
    try {
      return await this.client!.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error', error as Error, { pattern });
      return [];
    }
  }

  async flushdb(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      await this.client!.flushdb();
      return true;
    } catch (error) {
      logger.error('Redis FLUSHDB error', error as Error);
      return false;
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    keyCount: number;
    memoryUsage: number;
    hitRate: number;
  }> {
    if (!this.isAvailable()) {
      return { connected: false, keyCount: 0, memoryUsage: 0, hitRate: 0 };
    }

    try {
      const info = await this.client!.info('memory');
      const stats = await this.client!.info('stats');
      const keyCount = await this.client!.dbsize();

      // Parse memory usage
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      // Parse hit rate
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
      const missesMatch = stats.match(/keyspace_misses:(\d+)/);
      const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
      const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
      const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0;

      return {
        connected: this.isConnected,
        keyCount,
        memoryUsage,
        hitRate,
      };
    } catch (error) {
      logger.error('Redis getStats error', error as Error);
      return { connected: false, keyCount: 0, memoryUsage: 0, hitRate: 0 };
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.client && typeof this.client.quit === 'function') {
      try {
        await this.client.quit();
      } catch (error) {
        logger.error('Redis disconnect error', error as Error);
      }
    }
    this.isConnected = false;
    this.client = null;
  }
}

// Create singleton instance
export const redis = new RedisClient();

// Add debugging for development
if (process.env.NODE_ENV === 'development') {
  console.log('Redis client methods:', Object.getOwnPropertyNames(redis));
  console.log('Redis setex available:', typeof (redis as any).setex === 'function');
}

// Export types and utilities
export type { RedisConfig };
export default redis; 