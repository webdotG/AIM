import { AsyncSanitizerPipeline } from '../pipelines/AsyncSanitizerPipeline';
import { TrimSanitizer } from '../sanitizers/shared/TrimSanitizer';
import { LengthSanitizer } from '../sanitizers/shared/LengthSanitizer';
import { EncodingSanitizer } from '../sanitizers/shared/EncodingSanitizer';
import { XSSSanitizer } from '../sanitizers/reflected/XSSSanitizer';
import { SQLInjectionSanitizer } from '../sanitizers/search/SQLInjectionSanitizer';
import { CommandInjectionSanitizer } from '../sanitizers/reflected/CommandInjectionSanitizer';
import { PathTraversalSanitizer } from '../sanitizers/reflected/PathTraversalSanitizer';
import { CRLFSanitizer } from '../sanitizers/reflected/CRLFSanitizer';

export function createAuthPreset(config: { debug?: boolean } = {}) {
  const pipeline = new AsyncSanitizerPipeline();

  pipeline
    .add(new TrimSanitizer({ debug: config.debug }))
    .add(new LengthSanitizer({ maxLength: 100, debug: config.debug, strict: true }))
    .add(new EncodingSanitizer({ debug: config.debug }))
    .add(new SQLInjectionSanitizer({ debug: config.debug }))
    .add(new XSSSanitizer({ debug: config.debug, strict: true }))
    .add(new CommandInjectionSanitizer({ debug: config.debug }))
    .add(new PathTraversalSanitizer({ debug: config.debug }))
    .add(new CRLFSanitizer({ debug: config.debug }));

  return pipeline;
}