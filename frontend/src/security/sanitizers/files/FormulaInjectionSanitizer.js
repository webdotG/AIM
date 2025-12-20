import BaseSanitizer from '../base/BaseSanitizer.js';

export default class FormulaInjectionSanitizer extends BaseSanitizer {
  constructor(options = {}) {
    super(options);
    this.prefixes = options.prefixes || [
      '=', '+', '-', '@', '\t', '\r'
    ];
  }
  
  async sanitize(input) {
    if (typeof input !== 'string') return input;
    
    let result = input;
    
    // Удаляем опасные префиксы в начале строки
    for (const prefix of this.prefixes) {
      if (result.startsWith(prefix)) {
        result = result.substring(prefix.length).trim();
      }
    }
    
    // Экранируем формульные символы
    result = result.replace(/^[=+\-@\t\r]/, '\\$&');
    
    return result;
  }
}
