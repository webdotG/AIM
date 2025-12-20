import BaseSanitizer from '../base/BaseSanitizer.js';

class SQLInjectionSanitizer extends BaseSanitizer {
  sanitize(input) {
    // TODO: Implement SQL injection protection
    return input;
  }
}

export default SQLInjectionSanitizer;