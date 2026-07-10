export type SecurityLevel = 'info' | 'warn' | 'error' | 'critical';
export interface SecurityLogEntry {
    timestamp: string;
    sanitizer: string;
    level: SecurityLevel;
    blocked: boolean;
    input: string;
    output?: string;
    userId?: number;
    ip?: string;
    userAgent?: string;
    httpMethod?: string;
    httpPath?: string;
}
export declare class SecurityLogger {
    private static logger;
    private static handler?;
    static init(): void;
    static setHandler(handler: (entry: SecurityLogEntry) => void): void;
    static log(entry: SecurityLogEntry): void;
}
//# sourceMappingURL=SecurityLogger.d.ts.map