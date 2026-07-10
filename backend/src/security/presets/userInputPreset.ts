import { SanitizerPipeline } from '../pipelines/SanitizerPipeline';
import { TrimSanitizer } from '../sanitizers/shared/TrimSanitizer';
import { LengthSanitizer } from '../sanitizers/shared/LengthSanitizer';
import { EncodingSanitizer } from '../sanitizers/shared/EncodingSanitizer';
import { XSSSanitizer } from '../sanitizers/reflected/XSSSanitizer';
import { CommandInjectionSanitizer } from '../sanitizers/reflected/CommandInjectionSanitizer';
import { PathTraversalSanitizer } from '../sanitizers/reflected/PathTraversalSanitizer';
import { CRLFSanitizer } from '../sanitizers/reflected/CRLFSanitizer';
import { SQLInjectionSanitizer } from '../sanitizers/search/SQLInjectionSanitizer';

export interface UserInputPresetConfig {
  maxLength?: number;
  allowedTags?: string[];
  debug?: boolean;
  strict?: boolean;
}

export function createUserInputPreset(config: UserInputPresetConfig = {}) {
  const pipeline = new SanitizerPipeline();

  pipeline
    .add(new TrimSanitizer({ debug: config.debug }))
    .add(new LengthSanitizer({ maxLength: config.maxLength, debug: config.debug, strict: config.strict }))
    .add(new EncodingSanitizer({ debug: config.debug }))
    .add(new SQLInjectionSanitizer({ debug: config.debug }))
    .add(new XSSSanitizer({ allowedTags: config.allowedTags, debug: config.debug, strict: config.strict }))
    .add(new CommandInjectionSanitizer({ debug: config.debug }))
    .add(new PathTraversalSanitizer({ debug: config.debug }))
    .add(new CRLFSanitizer({ debug: config.debug }));

  return pipeline;
}