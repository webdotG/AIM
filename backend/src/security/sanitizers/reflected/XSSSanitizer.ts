import { BaseSanitizer } from '../base/BaseSanitizer';
import { SecurityViolationError } from '../../errors/SecurityViolationError';
import { ATTACK_PATTERNS } from '../../utils/patterns';

export interface XSSSanitizerConfig {
  allowedTags?: string[];
  debug?: boolean;
  strict?: boolean;
}

export class XSSSanitizer extends BaseSanitizer {
  private allowedTags: string[];

  constructor(config: XSSSanitizerConfig = {}) {
    super(config);
    this.allowedTags = config.allowedTags ?? [];
  }

  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) return input;

    const str = input as string;
    let sanitized = str;

    for (const pattern of ATTACK_PATTERNS.XSS) {
      if (pattern.test(sanitized)) {
        this.log('XSS pattern detected', 'warn', str, sanitized);
        break;
      }
    }

    // Remove dangerous tags
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<[^>]*(on\w+)\s*=/gi, '');

    // Escape remaining HTML
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Restore allowed tags
    for (const tag of this.allowedTags) {
      sanitized = sanitized.replace(`&lt;${tag}&gt;`, `<${tag}>`);
      sanitized = sanitized.replace(`&lt;/${tag}&gt;`, `</${tag}>`);
    }

    return sanitized;
  }

  shouldSanitize(input: unknown): boolean {
    return typeof input === 'string' && ATTACK_PATTERNS.XSS.some(p => p.test(input as string));
  }
}