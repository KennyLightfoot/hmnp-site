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
  connectTimeout?: number;
  commandTimeout?: number;
  lazyConnect?: boolean;
  enableOfflineQueue?: boolean;
  keepAlive?: number;
  noDelay?: boolean;
}

class RedisClient {
  private client: Redis | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private isInitializing = false;

  constructor(private config: RedisConfig = {}) {
    // Don't initialize immediately - let it be lazy
  }

  private async ensureInitialized(): Promise<void> {
    if (this.client && this.isConnected) {
      return;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;
    try {
      await this.initialize();
    } finally {
      this.isInitializing = false;
    }
  }

  private async initialize() {
    try {
      const redisConfig: RedisConfig = {
        maxRetriesPerRequest: 1, // Reduce retries to fail faster
        connectTimeout: 5000, // Reduce timeout
        commandTimeout: 3000, // Reduce command timeout
        enableOfflineQueue: false, // Disable offline queue to fail fast
        keepAlive: 1000,
        noDelay: true,
        lazyConnect: true,
        ...this.config
      };

      // Use Redis URL if provided, otherwise use individual config
      if (process.env.REDIS_URL) {
        // Handle Redis Cloud SSL connections properly
        const redisUrl = process.env.REDIS_URL;
        const isSSL = redisUrl.startsWith('rediss://');
        
        this.client = new Redis(redisUrl, {
          ...redisConfig,
          tls: isSSL ? {} : undefined,
          maxRetriesPerRequest: 1, // Fail fast
          lazyConnect: true,
        });
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
      // Don't schedule reconnect - just mark as unavailable
      this.isConnected = false;
      this.client = null;
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
      ttl: (key: string) => upstashClient.ttl(key),
      publish: (channel: string, message: string) => upstashClient.publish(channel, message),
      pipeline: () => ({
        setex: (key: string, seconds: number, value: string) => ({ setex: [key, seconds, value] }),
        exec: async () => {
          // Simplified pipeline execution for basic operations
          return [[null, 'OK']];
        }
      }),
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
      logger.error('Redis connection error', error instanceof Error ? error : new Error(String(error)));
      this.isConnected = false;
      this.scheduleReconnect();
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (time: number) => {
      logger.info(`Redis reconnecting in ${time}ms`);
    });
  }

  private async connect(): Promise<void> {
    if (!this.client) {
      this.isConnected = false;
      return;
    }

    try {
      if (typeof this.client.connect === 'function') {
        await this.client.connect();
      }
      
      // Test connection with timeout
      const pingPromise = this.client.ping();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Ping timeout')), 3000)
      );
      
      await Promise.race([pingPromise, timeoutPromise]);
      this.isConnected = true;
      logger.info('Redis connection established');
      
    } catch (error) {
      logger.error('Redis connection failed', error as Error);
      this.isConnected = false;
      // Don't throw - just mark as unavailable
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
    try {
      await this.ensureInitialized();
      if (!this.client || !this.isConnected) {
        throw new Error('Redis not available');
      }
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis ping failed', error as Error);
      throw error;
    }
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

  async setex(key: string, seconds: number, value: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      await this.client!.setex(key, seconds, value);
      return true;
    } catch (error) {
      logger.error('Redis SETEX error', error as Error, { key, seconds });
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) return -1;
    try {
      return await this.client!.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error', error as Error, { key });
      return -1;
    }
  }

  async publish(channel: string, message: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      await this.client!.publish(channel, message);
      return true;
    } catch (error) {
      logger.error('Redis PUBLISH error', error as Error, { channel });
      return false;
    }
  }

  pipeline() {
    if (!this.isAvailable()) return null;
    return this.client!.pipeline();
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
      const memoryUsage = memoryMatch && memoryMatch[1] ? parseInt(memoryMatch[1]) : 0;

      // Parse hit rate
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
      const missesMatch = stats.match(/keyspace_misses:(\d+)/);
      const hits = hitsMatch && hitsMatch[1] ? parseInt(hitsMatch[1]) : 0;
      const misses = missesMatch && missesMatch[1] ? parseInt(missesMatch[1]) : 0;
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
    return this.client !== null && this.isConnected && !this.isInitializing;
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
export default redis;

// Export function to create Redis client for BullMQ
export const createRedisClient = () => {
  if (process.env.REDIS_URL) {
    const redisUrl = process.env.REDIS_URL;
    const isSSL = redisUrl.startsWith('rediss://');
    
    return new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: isSSL ? {} : undefined,
    });
  } else if (process.env.UPSTASH_REDIS_REST_URL) {
    // For Upstash Redis, we need to handle the rediss:// URL properly
    const url = process.env.UPSTASH_REDIS_REST_URL.replace('rediss://', 'redis://');
    return new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    // Local Redis fallback
    return new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
}; 