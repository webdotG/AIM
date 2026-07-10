import { SecurityLogger, SecurityLogEntry } from '../../utils/SecurityLogger';

export interface SanitizerConfig {
  debug?: boolean;
  strict?: boolean;
  [key: string]: any;
}

export interface SanitizerResult {
  input: unknown;
  output: unknown;
  blocked: boolean;
  sanitized: boolean;
  level: 'info' | 'warn' | 'error' | 'critical';
}

export abstract class BaseSanitizer {
  protected config: Required<SanitizerConfig>;
  protected name: string;

  constructor(config: SanitizerConfig = {}) {
    this.config = {
      debug: false,
      strict: false,
      ...config,
    };
    this.name = this.constructor.name;
  }

  abstract sanitize(input: unknown): unknown;

  abstract shouldSanitize(input: unknown): boolean;

  protected log(message: string, level: 'info' | 'warn' | 'error' | 'critical' = 'info', input?: string, output?: string) {
    if (!this.config.debug && level === 'info') return;

    const entry: SecurityLogEntry = {
      timestamp: new Date().toISOString(),
      sanitizer: this.name,
      level,
      blocked: level === 'critical',
      input: (input || message).substring(0, 200),
      output: output ? output.substring(0, 200) : undefined,
    };

    SecurityLogger.log(entry);
  }

  protected deepClean(value: unknown, sanitizer?: (input: unknown) => unknown): unknown {
    if (sanitizer === undefined) {
      sanitizer = (input: unknown) => this.sanitize(input);
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return sanitizer(value);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.deepClean(item, sanitizer));
    }

    if (typeof value === 'object') {
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        cleaned[key] = this.deepClean(val, sanitizer);
      }
      return cleaned;
    }

    return value;
  }
}