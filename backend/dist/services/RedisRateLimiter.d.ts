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
export declare class RateLimiter {
    private config;
    constructor(config?: RateLimitConfig);
    check(userId: number, endpoint: string): Promise<RateLimitResult>;
    reset(userId: number, endpoint: string): Promise<void>;
}
export declare const rateLimiters: {
    auth: RateLimiter;
    api: RateLimiter;
    search: RateLimiter;
    ai: RateLimiter;
};
export {};
//# sourceMappingURL=RedisRateLimiter.d.ts.map