import Redis from 'ioredis';

let redis: Redis | null = null;

export async function getRedis(): Promise<Redis> {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redis = new Redis(redisUrl, {
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 100, 2000);
      if (times > 3) {
        console.warn('[Redis] Connecting failed after 3 retries. Continuing without Redis.');
        return null;
      }
      return delay;
    },
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
  });

  redis.on('error', (err: Error) => {
    console.error('[Redis] Error:', err.message);
  });

  redis.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  await redis.connect();
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export function isRedisConnected(): boolean {
  return redis?.status === 'ready';
}