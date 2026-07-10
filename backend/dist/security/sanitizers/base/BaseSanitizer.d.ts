export interface SanitizerConfig {
    debug?: boolean;
    strict?: boolean;
    [key: string]: any;
}
export interface SanitizerResult {
    input: unknown;
    output: unknown;
    blocked: boolean;
    sanitized: boolean;
    level: 'info' | 'warn' | 'error' | 'critical';
}
export declare abstract class BaseSanitizer {
    protected config: Required<SanitizerConfig>;
    protected name: string;
    constructor(config?: SanitizerConfig);
    abstract sanitize(input: unknown): unknown;
    abstract shouldSanitize(input: unknown): boolean;
    protected log(message: string, level?: 'info' | 'warn' | 'error' | 'critical', input?: string, output?: string): void;
    protected deepClean(value: unknown, sanitizer?: (input: unknown) => unknown): unknown;
}
//# sourceMappingURL=BaseSanitizer.d.ts.map