import { BaseSanitizer } from '../base/BaseSanitizer';
export interface LengthSanitizerConfig {
    maxLength?: number;
    minLength?: number;
    errorMessage?: string;
    debug?: boolean;
    strict?: boolean;
}
export declare class LengthSanitizer extends BaseSanitizer {
    private maxLength;
    private minLength;
    constructor(config?: LengthSanitizerConfig);
    sanitize(input: unknown): unknown;
    shouldSanitize(input: unknown): boolean;
}
//# sourceMappingURL=LengthSanitizer.d.ts.map