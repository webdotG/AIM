"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtBlacklist = exports.JWTBlacklistService = void 0;
const pool_1 = require("../redis/pool");
class JWTBlacklistService {
    async blacklistToken(jti, expiresIn) {
        if (expiresIn <= 0)
            return;
        const redis = await (0, pool_1.getRedis)();
        await redis.set(`jwt:blacklist:${jti}`, 'revoked', 'EX', expiresIn + 60);
    }
    async isBlacklisted(jti) {
        const redis = await (0, pool_1.getRedis)();
        const result = await redis.exists(`jwt:blacklist:${jti}`);
        return result === 1;
    }
    async removeToken(jti) {
        const redis = await (0, pool_1.getRedis)();
        await redis.del(`jwt:blacklist:${jti}`);
    }
}
exports.JWTBlacklistService = JWTBlacklistService;
exports.jwtBlacklist = new JWTBlacklistService();
//# sourceMappingURL=JWTBlacklistService.js.map