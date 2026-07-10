import { BaseSanitizer } from '../sanitizers/base/BaseSanitizer';
import { SecurityViolationError } from '../errors/SecurityViolationError';

export class AsyncSanitizerPipeline {
  private sanitizers: BaseSanitizer[] = [];

  add(sanitizer: BaseSanitizer): this {
    this.sanitizers.push(sanitizer);
    return this;
  }

  async execute(input: unknown): Promise<unknown> {
    if (this.sanitizers.length === 0) {
      return input;
    }

    let result = input;
    for (const sanitizer of this.sanitizers) {
      try {
        result = await Promise.resolve(sanitizer.sanitize(result));
      } catch (error) {
        if (error instanceof SecurityViolationError && error.blocked) {
          throw error;
        }
        console.error(`[AsyncSanitizerPipeline] ${(sanitizer as any).name || 'unknown'} error:`, error);
      }
    }
    return result;
  }

  async executeDeep(input: unknown): Promise<unknown> {
    if (this.sanitizers.length === 0) {
      return input;
    }

    const clean = async (value: unknown): Promise<unknown> => {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return Promise.all(value.map(item => this.executeDeep(item)));
        }
        const cleaned: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
          cleaned[key] = await this.executeDeep(val);
        }
        return cleaned;
      }
      return this.execute(value);
    };

    return clean(input);
  }
}