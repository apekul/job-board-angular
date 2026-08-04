import { Redis } from '@upstash/redis';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null;

const memoryStore = new Map<string, { value: unknown; expiresAt: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const value = await redis.get<T>(key);
      if (value !== null && value !== undefined) return value;
    } catch {
      // fall back to the in-memory store
    }
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // fall back to the in-memory store
    }
  }
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function invalidateCache(prefix: string): Promise<void> {
  if (redis) {
    try {
      const keys = await redis.keys(`${prefix}:*`);
      if (keys.length) await redis.del(...keys);
      return;
    } catch {
      // fall back to the in-memory store
    }
  }
  for (const key of [...memoryStore.keys()]) {
    if (key.startsWith(`${prefix}:`)) memoryStore.delete(key);
  }
}

export function isCacheAvailable(): boolean {
  return redis !== null;
}
