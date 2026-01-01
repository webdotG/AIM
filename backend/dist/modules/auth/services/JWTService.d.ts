export interface JWTPayload {
    userId: number;
    login: string;
    [key: string]: any;
}
export declare class JWTService {
    sign(payload: JWTPayload): string;
    verify(token: string): JWTPayload;
}
export declare const jwtService: JWTService;
//# sourceMappingURL=JWTService.d.ts.map