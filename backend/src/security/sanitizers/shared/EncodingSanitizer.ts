import { BaseSanitizer } from '../base/BaseSanitizer';

export class EncodingSanitizer extends BaseSanitizer {
  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) return input;

    const str = input as string;
    let sanitized = str;

    // Normalize Unicode
    sanitized = sanitized.normalize('NFC');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Decode double-encoded sequences
    sanitized = this.decodeDoubleEncoded(sanitized);

    return sanitized;
  }

  shouldSanitize(input: unknown): boolean {
    return typeof input === 'string';
  }

  private decodeDoubleEncoded(str: string): string {
    const decoded = decodeURIComponent(str);
    if (decoded !== str) {
      return this.decodeDoubleEncoded(decoded);
    }
    return str;
  }
}