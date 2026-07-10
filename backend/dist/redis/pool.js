"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedis = getRedis;
exports.closeRedis = closeRedis;
exports.isRedisConnected = isRedisConnected;
const ioredis_1 = __importDefault(require("ioredis"));
let redis = null;
async function getRedis() {
    if (redis)
        return redis;
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new ioredis_1.default(redisUrl, {
        retryStrategy: (times) => {
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
    redis.on('error', (err) => {
        console.error('[Redis] Error:', err.message);
    });
    redis.on('connect', () => {
        console.log('[Redis] Connected successfully');
    });
    await redis.connect();
    return redis;
}
async function closeRedis() {
    if (redis) {
        await redis.quit();
        redis = null;
    }
}
function isRedisConnected() {
    return redis?.status === 'ready';
}
//# sourceMappingURL=pool.js.map