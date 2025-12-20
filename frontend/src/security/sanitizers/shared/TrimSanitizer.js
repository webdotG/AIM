import BaseSanitizer from '../base/BaseSanitizer.js';

export default class TrimSanitizer extends BaseSanitizer {
  constructor(options = {}) {
    super({
      trimStart: true,
      trimEnd: true,
      collapseSpaces: true,
      ...options
    });
  }

  async process(input) {
    if (typeof input !== 'string') return input;
    
    let result = input;
    
    if (this.options.trimStart) {
      result = result.trimStart();
    }
    
    if (this.options.trimEnd) {
      result = result.trimEnd();
    }
    
    if (this.options.collapseSpaces) {
      result = result.replace(/\s+/g, ' ');
    }
    
    return result;
  }
}
