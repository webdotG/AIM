import { BaseSanitizer } from '../sanitizers/base/BaseSanitizer';
import { SecurityViolationError } from '../errors/SecurityViolationError';

export class SanitizerPipeline {
  private sanitizers: BaseSanitizer[] = [];

  add(sanitizer: BaseSanitizer): this {
    this.sanitizers.push(sanitizer);
    return this;
  }

  execute(input: unknown): unknown {
    if (this.sanitizers.length === 0) {
      return input;
    }

    // Run synchronously for simple data
    let result = input;
    for (const sanitizer of this.sanitizers) {
      try {
        result = sanitizer.sanitize(result);
      } catch (error) {
        if (error instanceof SecurityViolationError && error.blocked) {
          throw error;
        }
        // Continue pipeline even if this sanitizer throws
        console.error(`[SanitizerPipeline] ${(sanitizer as any).name || 'unknown'} error:`, error);
      }
    }
    return result;
  }

  executeDeep(input: unknown): unknown {
    if (this.sanitizers.length === 0) {
      return input;
    }

    const clean = (value: unknown): unknown => {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.map(item => this.executeDeep(item));
        }
        const cleaned: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
          cleaned[key] = this.executeDeep(val);
        }
        return cleaned;
      }
      return this.execute(value);
    };

    return clean(input);
  }
}