import { BaseSanitizer } from '../sanitizers/base/BaseSanitizer';
export declare class AsyncSanitizerPipeline {
    private sanitizers;
    add(sanitizer: BaseSanitizer): this;
    execute(input: unknown): Promise<unknown>;
    executeDeep(input: unknown): Promise<unknown>;
}
//# sourceMappingURL=AsyncSanitizerPipeline.d.ts.map