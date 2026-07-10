export class SecurityViolationError extends Error {
  readonly sanitizer: string;
  readonly level: 'warning' | 'critical';
  readonly input: unknown;
  readonly blocked: boolean;

  constructor(message: string, sanitizer: string, level: 'warning' | 'critical' = 'critical', input: unknown = '') {
    super(message);
    this.name = 'SecurityViolationError';
    this.sanitizer = sanitizer;
    this.level = level;
    this.input = input;
    this.blocked = level === 'critical';
  }
}