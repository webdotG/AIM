import BaseSanitizer from '../base/BaseSanitizer.js';

class XSSSanitizer extends BaseSanitizer {
  sanitize(input) {
    // TODO: Implement XSS protection
    return input;
  }
}

export default XSSSanitizer;