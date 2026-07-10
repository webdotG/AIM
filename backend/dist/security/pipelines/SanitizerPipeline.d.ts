import { BaseSanitizer } from '../sanitizers/base/BaseSanitizer';
export declare class SanitizerPipeline {
    private sanitizers;
    add(sanitizer: BaseSanitizer): this;
    execute(input: unknown): unknown;
    executeDeep(input: unknown): unknown;
}
//# sourceMappingURL=SanitizerPipeline.d.ts.map