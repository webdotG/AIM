import { BaseSanitizer } from '../base/BaseSanitizer';
import { ATTACK_PATTERNS } from '../../utils/patterns';

export class PathTraversalSanitizer extends BaseSanitizer {
  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) return input;

    const str = input as string;
    let sanitized = str;

    // Remove path traversal sequences
    sanitized = sanitized.replace(/\.\.[\\/]/g, '');
    sanitized = sanitized.replace(/[\\\/]/g, '/');
    sanitized = sanitized.replace(/\.\.\//g, '');

    // Remove URL-encoded patterns
    sanitized = sanitized.replace(/%2e%2e/gi, '');
    sanitized = sanitized.replace(/%252e%252e/gi, '');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
  }

  shouldSanitize(input: unknown): boolean {
    return typeof input === 'string' && ATTACK_PATTERNS.PATH_TRAVERSAL.some(p => p.test(input as string));
  }
}