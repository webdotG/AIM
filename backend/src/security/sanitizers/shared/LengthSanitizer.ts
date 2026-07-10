import { BaseSanitizer } from '../base/BaseSanitizer';
import { SecurityViolationError } from '../../errors/SecurityViolationError';

export interface LengthSanitizerConfig {
  maxLength?: number;
  minLength?: number;
  errorMessage?: string;
  debug?: boolean;
  strict?: boolean;
}

export class LengthSanitizer extends BaseSanitizer {
  private maxLength: number;
  private minLength: number;

  constructor(config: LengthSanitizerConfig = {}) {
    super(config);
    this.maxLength = config.maxLength ?? 10000;
    this.minLength = config.minLength ?? 0;
  }

  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) return input;

    const str = input as string;
    if (str.length > this.maxLength) {
      this.log(`Length ${str.length} exceeds max ${this.maxLength}`, 'warn', str);
      return str.substring(0, this.maxLength);
    }

    if (str.length < this.minLength) {
      if (this.config.strict) {
        throw new SecurityViolationError(
          this.config.errorMessage || `Length ${str.length} is below minimum ${this.minLength}`,
          this.name,
          'critical',
          str
        );
      }
      this.log(`Length ${str.length} is below minimum ${this.minLength}`, 'warn', str);
      return input;
    }

    return input;
  }

  shouldSanitize(input: unknown): boolean {
    return typeof input === 'string';
  }
}