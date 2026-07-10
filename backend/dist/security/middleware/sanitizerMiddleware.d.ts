import { Request, Response, NextFunction } from 'express';
import { UserInputPresetConfig } from '../presets/userInputPreset';
import { ApiPresetConfig } from '../presets/apiPreset';
import { SearchPresetConfig } from '../presets/searchPreset';
export type PresetType = 'userInput' | 'api' | 'search' | 'auth';
export interface SanitizerMiddlewareOptions {
    preset?: PresetType;
    presetConfig?: UserInputPresetConfig & ApiPresetConfig & SearchPresetConfig;
    skipPaths?: string[];
    debug?: boolean;
    allowedTags?: string[];
    maxLength?: number;
}
export declare function createSanitizerMiddleware(options?: SanitizerMiddlewareOptions): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=sanitizerMiddleware.d.ts.map