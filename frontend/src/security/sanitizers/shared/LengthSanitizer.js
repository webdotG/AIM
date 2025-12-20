import BaseSanitizer from '../base/BaseSanitizer.js';

export default class LengthSanitizer extends BaseSanitizer {
  constructor(options = {}) {
    super({
      maxLength: 1000,
      minLength: 0,
      truncate: true,
      ...options
    });
  }

  async process(input) {
    if (typeof input !== 'string') return input;
    
    const { maxLength, minLength, truncate } = this.options;
    
    if (input.length < minLength) {
      throw new Error(`Input too short (min: ${minLength}, actual: ${input.length})`);
    }
    
    if (input.length > maxLength) {
      if (truncate) {
        return input.substring(0, maxLength);
      } else {
        throw new Error(`Input too long (max: ${maxLength}, actual: ${input.length})`);
      }
    }
    
    return input;
  }
}
