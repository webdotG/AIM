import { BaseSanitizer } from '../base/BaseSanitizer';
import { ATTACK_PATTERNS } from '../../utils/patterns';

// SQL Injection patterns (using ATTACK_PATTERNS.SQL_INJECTION from patterns.ts)
const SQL_PATTERNS: RegExp[] = ATTACK_PATTERNS.SQL_INJECTION;

interface SQLInjectionSanitizerConfig {
  whitelist?: RegExp[];
  debug?: boolean;
}

export class SQLInjectionSanitizer extends BaseSanitizer {
  private whitelist: RegExp[];

  constructor(config: SQLInjectionSanitizerConfig = {}) {
    super(config);
    this.whitelist = config.whitelist || [];
  }

  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) {
      return input;
    }

    const str = input as string;
    
    // Check if any whitelisted pattern matches
    if (this.whitelist.some(pattern => pattern.test(str))) {
      return input;
    }

    this.log('SQL injection attempt detected', 'warn', str);

    // Escape special SQL characters
    let sanitized = str
      .replace(/['"]/g, '$&$&')
      .replace(/(--\s*|#\s*|;)/g, '')
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b/gi, '')
      .replace(/\b(OR|AND)\b\s+\d+\s*=\s*\d+/gi, '')
      .replace(/\b(WAITFOR|BENCHMARK|SLEEP)\b/gi, '')
      .replace(/\binformation_schema\b/gi, '');

    this.log('Input sanitized', 'info', str, sanitized);
    return sanitized;
  }

  shouldSanitize(input: unknown): boolean {
    if (typeof input !== 'string') return false;
    
    for (const pattern of SQL_PATTERNS) {
      if (pattern.test(input)) {
        return true;
      }
    }
    return false;
  }
}