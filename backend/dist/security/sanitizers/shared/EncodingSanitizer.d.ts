import { BaseSanitizer } from '../base/BaseSanitizer';
export declare class EncodingSanitizer extends BaseSanitizer {
    sanitize(input: unknown): unknown;
    shouldSanitize(input: unknown): boolean;
    private decodeDoubleEncoded;
}
//# sourceMappingURL=EncodingSanitizer.d.ts.map