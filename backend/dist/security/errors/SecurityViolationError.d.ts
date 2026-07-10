export declare class SecurityViolationError extends Error {
    readonly sanitizer: string;
    readonly level: 'warning' | 'critical';
    readonly input: unknown;
    readonly blocked: boolean;
    constructor(message: string, sanitizer: string, level?: 'warning' | 'critical', input?: unknown);
}
//# sourceMappingURL=SecurityViolationError.d.ts.map