import { BaseSanitizer } from '../base/BaseSanitizer';
import { SecurityViolationError } from '../../errors/SecurityViolationError';
import { ATTACK_PATTERNS } from '../../utils/patterns';

export class CommandInjectionSanitizer extends BaseSanitizer {
  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) return input;

    const str = input as string;
    let sanitized = str;

    // Remove shell metacharacters
    sanitized = sanitized.replace(/[;|&$`\\!<>{}()]/g, '');

    // Remove command patterns
    for (const pattern of ATTACK_PATTERNS.COMMAND_INJECTION) {
      if (pattern.test(sanitized)) {
        this.log('Command injection pattern detected', 'error', str);
      }
    }

    return sanitized;
  }

  shouldSanitize(input: unknown): boolean {
    return typeof input === 'string' && ATTACK_PATTERNS.COMMAND_INJECTION.some(p => p.test(input as string));
  }
}