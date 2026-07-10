import { BaseSanitizer } from '../base/BaseSanitizer';

export class TrimSanitizer extends BaseSanitizer {
  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) return input;
    return (input as string).trim();
  }

  shouldSanitize(input: unknown): boolean {
    return typeof input === 'string' && input.trim().length !== input.length;
  }
}