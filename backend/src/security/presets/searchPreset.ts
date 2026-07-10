import { SanitizerPipeline } from '../pipelines/SanitizerPipeline';
import { TrimSanitizer } from '../sanitizers/shared/TrimSanitizer';
import { LengthSanitizer } from '../sanitizers/shared/LengthSanitizer';
import { EncodingSanitizer } from '../sanitizers/shared/EncodingSanitizer';
import { SQLInjectionSanitizer } from '../sanitizers/search/SQLInjectionSanitizer';

export interface SearchPresetConfig {
  maxLength?: number;
  debug?: boolean;
}

export function createSearchPreset(config: SearchPresetConfig = {}) {
  const pipeline = new SanitizerPipeline();

  pipeline
    .add(new TrimSanitizer({ debug: config.debug }))
    .add(new LengthSanitizer({ maxLength: config.maxLength ?? 500, debug: config.debug }))
    .add(new EncodingSanitizer({ debug: config.debug }))
    .add(new SQLInjectionSanitizer({ debug: config.debug }));

  return pipeline;
}