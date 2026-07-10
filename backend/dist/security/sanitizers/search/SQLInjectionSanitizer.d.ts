import { BaseSanitizer } from '../base/BaseSanitizer';
interface SQLInjectionSanitizerConfig {
    whitelist?: RegExp[];
    debug?: boolean;
}
export declare class SQLInjectionSanitizer extends BaseSanitizer {
    private whitelist;
    constructor(config?: SQLInjectionSanitizerConfig);
    sanitize(input: unknown): unknown;
    shouldSanitize(input: unknown): boolean;
}
export {};
//# sourceMappingURL=SQLInjectionSanitizer.d.ts.map