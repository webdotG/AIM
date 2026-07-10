import { SanitizerPipeline } from '../pipelines/SanitizerPipeline';
export interface UserInputPresetConfig {
    maxLength?: number;
    allowedTags?: string[];
    debug?: boolean;
    strict?: boolean;
}
export declare function createUserInputPreset(config?: UserInputPresetConfig): SanitizerPipeline;
//# sourceMappingURL=userInputPreset.d.ts.map