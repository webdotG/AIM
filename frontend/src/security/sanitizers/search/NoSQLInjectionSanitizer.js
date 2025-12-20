import BaseSanitizer from '../base/BaseSanitizer.js';

class NoSQLInjectionSanitizer extends BaseSanitizer {
  sanitize(input) {
    // TODO: Implement NoSQL injection protection
    return input;
  }
}

export default NoSQLInjectionSanitizer;