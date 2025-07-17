import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { alertManager } from '@/lib/monitoring/alert-manager';

const FALLBACK_CACHE: Map<string, string> = new Map();
const TTL_SECONDS = 60 * 60; // 1 hour

function hashKey(input: string): string {
  return crypto.createHash('sha1').update(input).digest('hex');
}

export async function getCachedChat(prompt: string, context?: any): Promise<string | null> {
  const rawKey = JSON.stringify({ prompt, context });
  const key = `chat:${hashKey(rawKey)}`;
  try {
    if (await redis?.isAvailable?.()) {
      const cached = await redis.get(key);
      if (cached) {
        logger.debug('chat-cache hit', { key });
        try { await alertManager.recordMetric('chat.cache_hit', 1, { key }); } catch (_) { /* ignore metrics errors */ }
        return cached;
      }
    } else if (FALLBACK_CACHE.has(key)) {
      try { await alertManager.recordMetric('chat.cache_hit', 1, { key, fallback: true }); } catch (_) {}
      return FALLBACK_CACHE.get(key)!;
    }
    // Cache miss
    try { await alertManager.recordMetric('chat.cache_miss', 1, { key }); } catch (_) {}
  } catch (err) {
    logger.warn('chat-cache error', err as Error);
  }
  return null;
}

export async function setCachedChat(prompt: string, context: any, response: string): Promise<void> {
  const rawKey = JSON.stringify({ prompt, context });
  const key = `chat:${hashKey(rawKey)}`;
  try {
    if (await redis?.isAvailable?.()) {
      await redis.set(key, response, TTL_SECONDS);
    } else {
      FALLBACK_CACHE.set(key, response);
      setTimeout(() => FALLBACK_CACHE.delete(key), TTL_SECONDS * 1000);
    }
    logger.debug('chat-cache set', { key });
    try { await alertManager.recordMetric('chat.cache_set', 1, { key }); } catch (_) {}
  } catch (err) {
    logger.warn('chat-cache set error', err as Error);
  }
} 