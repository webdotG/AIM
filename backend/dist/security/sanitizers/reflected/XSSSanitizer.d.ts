import { BaseSanitizer } from '../base/BaseSanitizer';
export interface XSSSanitizerConfig {
    allowedTags?: string[];
    debug?: boolean;
    strict?: boolean;
}
export declare class XSSSanitizer extends BaseSanitizer {
    private allowedTags;
    constructor(config?: XSSSanitizerConfig);
    sanitize(input: unknown): unknown;
    shouldSanitize(input: unknown): boolean;
}
//# sourceMappingURL=XSSSanitizer.d.ts.map