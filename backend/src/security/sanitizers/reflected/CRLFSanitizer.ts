import { BaseSanitizer } from '../base/BaseSanitizer';
import { ATTACK_PATTERNS } from '../../utils/patterns';

export class CRLFSanitizer extends BaseSanitizer {
  sanitize(input: unknown): unknown {
    if (!this.shouldSanitize(input)) return input;

    const str = input as string;
    return str.replace(/[\r\n]/g, '').replace(/%0[dD]|%0[aA]/g, '');
  }

  shouldSanitize(input: unknown): boolean {
    return typeof input === 'string' && ATTACK_PATTERNS.CRLF.some(p => p.test(input as string));
  }
}