import { getRedis } from '../redis/pool';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig = { windowMs: 15 * 60 * 1000, maxRequests: 100 }) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyPrefix: config.keyPrefix || 'ratelimit',
    };
  }

  async check(userId: number, endpoint: string): Promise<RateLimitResult> {
    const redis = await getRedis();
    const key = `${this.config.keyPrefix}:${userId}:${endpoint}`;
    const windowSec = Math.ceil(this.config.windowMs / 1000);
    
    const result = await redis.incr(key);
    
    if (result === 1) {
      await redis.expire(key, windowSec);
    }
    
    const remaining = Math.max(0, this.config.maxRequests - result);
    const resetIn = await redis.ttl(key);
    
    return {
      allowed: result <= this.config.maxRequests,
      remaining,
      resetIn,
    };
  }

  async reset(userId: number, endpoint: string): Promise<void> {
    const redis = await getRedis();
    const key = `${this.config.keyPrefix}:${userId}:${endpoint}`;
    await redis.del(key);
  }
}

// Export common rate limiter configurations
export const rateLimiters = {
  auth: new RateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'ratelimit:auth' }),
  api: new RateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100, keyPrefix: 'ratelimit:api' }),
  search: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'ratelimit:search' }),
  ai: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'ratelimit:ai' }),
};