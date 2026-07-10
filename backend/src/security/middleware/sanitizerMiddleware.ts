import { Request, Response, NextFunction } from 'express';
import { SanitizerPipeline } from '../pipelines/SanitizerPipeline';
import { AsyncSanitizerPipeline } from '../pipelines/AsyncSanitizerPipeline';
import { SecurityViolationError } from '../errors/SecurityViolationError';
import { createUserInputPreset, UserInputPresetConfig } from '../presets/userInputPreset';
import { createApiPreset, ApiPresetConfig } from '../presets/apiPreset';
import { createSearchPreset, SearchPresetConfig } from '../presets/searchPreset';
import { createAuthPreset } from '../presets/authPreset';

export type PresetType = 'userInput' | 'api' | 'search' | 'auth';

interface PipelineInterface {
  execute(input: unknown): unknown | Promise<unknown>;
  executeDeep(input: unknown): unknown | Promise<unknown>;
}

export interface SanitizerMiddlewareOptions {
  preset?: PresetType;
  presetConfig?: UserInputPresetConfig & ApiPresetConfig & SearchPresetConfig;
  skipPaths?: string[];
  debug?: boolean;
  allowedTags?: string[];
  maxLength?: number;
}

export function createSanitizerMiddleware(options: SanitizerMiddlewareOptions = {}) {
  const preset = options.preset || 'api';
  const presetConfig = {
    debug: options.debug ?? false,
    allowedTags: options.allowedTags || [],
    maxLength: options.maxLength || 10000,
    ...options.presetConfig,
  };

  let pipeline: PipelineInterface;
  switch (preset) {
    case 'userInput':
      pipeline = createUserInputPreset(presetConfig);
      break;
    case 'search':
      pipeline = createSearchPreset(presetConfig);
      break;
    case 'auth':
      pipeline = createAuthPreset(presetConfig);
      break;
    case 'api':
    default:
      pipeline = createApiPreset(presetConfig);
      break;
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip paths that don't need sanitization
      if (options.skipPaths?.includes(req.path)) {
        return next();
      }

      // Sanitize body
      if (req.body) {
        req.body = (await pipeline.executeDeep(req.body)) as any;
      }

      // Sanitize query params
      if (req.query) {
        req.query = (await pipeline.executeDeep(req.query)) as any;
      }

      // Sanitize params
      if (req.params) {
        req.params = (await pipeline.executeDeep(req.params)) as any;
      }

      // Sanitize headers if needed
      if (req.headers) {
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') {
            req.headers[key] = (await pipeline.execute(value)) as any;
          }
        }
      }

      next();
    } catch (error) {
      if (error instanceof SecurityViolationError && error.blocked) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input detected',
          detail: options.debug ? error.message : undefined,
        });
      }
      next(error);
    }
  };
}