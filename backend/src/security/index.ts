// Base
export { BaseSanitizer } from './sanitizers/base/BaseSanitizer';
export type { SanitizerConfig, SanitizerResult } from './sanitizers/base/BaseSanitizer';

// Errors
export { SecurityViolationError } from './errors/SecurityViolationError';

// Utilities
export { SecurityLogger } from './utils/SecurityLogger';
export type { SecurityLevel, SecurityLogEntry } from './utils/SecurityLogger';
export { ATTACK_PATTERNS } from './utils/patterns';

// Pipelines
export { SanitizerPipeline } from './pipelines/SanitizerPipeline';
export { AsyncSanitizerPipeline } from './pipelines/AsyncSanitizerPipeline';

// Sanitizers - Shared
export { TrimSanitizer } from './sanitizers/shared/TrimSanitizer';
export { LengthSanitizer } from './sanitizers/shared/LengthSanitizer';
export { EncodingSanitizer } from './sanitizers/shared/EncodingSanitizer';

// Sanitizers - Reflected
export { XSSSanitizer } from './sanitizers/reflected/XSSSanitizer';
export { CommandInjectionSanitizer } from './sanitizers/reflected/CommandInjectionSanitizer';
export { CRLFSanitizer } from './sanitizers/reflected/CRLFSanitizer';
export { PathTraversalSanitizer } from './sanitizers/reflected/PathTraversalSanitizer';

// Sanitizers - Search
export { SQLInjectionSanitizer } from './sanitizers/search/SQLInjectionSanitizer';

// Presets
export { createUserInputPreset } from './presets/userInputPreset';
export { createSearchPreset } from './presets/searchPreset';
export { createApiPreset } from './presets/apiPreset';
export { createAuthPreset } from './presets/authPreset';

// Middleware
export { createSanitizerMiddleware } from './middleware/sanitizerMiddleware';