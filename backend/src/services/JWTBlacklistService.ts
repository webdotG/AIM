import { getRedis } from '../redis/pool';

export class JWTBlacklistService {
  async blacklistToken(jti: string, expiresIn: number): Promise<void> {
    if (expiresIn <= 0) return;
    
    const redis = await getRedis();
    await redis.set(`jwt:blacklist:${jti}`, 'revoked', 'EX', expiresIn + 60);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const redis = await getRedis();
    const result = await redis.exists(`jwt:blacklist:${jti}`);
    return result === 1;
  }

  async removeToken(jti: string): Promise<void> {
    const redis = await getRedis();
    await redis.del(`jwt:blacklist:${jti}`);
  }
}

export const jwtBlacklist = new JWTBlacklistService();