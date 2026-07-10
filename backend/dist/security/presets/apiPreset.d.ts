import { AsyncSanitizerPipeline } from '../pipelines/AsyncSanitizerPipeline';
export interface ApiPresetConfig {
    maxLength?: number;
    allowedTags?: string[];
    debug?: boolean;
    strict?: boolean;
}
export declare function createApiPreset(config?: ApiPresetConfig): AsyncSanitizerPipeline;
//# sourceMappingURL=apiPreset.d.ts.map