export declare class JWTBlacklistService {
    blacklistToken(jti: string, expiresIn: number): Promise<void>;
    isBlacklisted(jti: string): Promise<boolean>;
    removeToken(jti: string): Promise<void>;
}
export declare const jwtBlacklist: JWTBlacklistService;
//# sourceMappingURL=JWTBlacklistService.d.ts.map