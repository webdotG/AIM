import BaseSanitizer from '../base/BaseSanitizer.js';

class XSSISanitizer extends BaseSanitizer {
  sanitize(input) {
    // TODO: Implement XSSI protection
    return input;
  }
}

export default XSSISanitizer;