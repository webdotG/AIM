import BaseSanitizer from '../base/BaseSanitizer.js';

export default class PDFInjectionSanitizer extends BaseSanitizer {
  async sanitize(input) {
    if (typeof input !== 'string') return input;
    
    // Защита от PDF инъекций
    let result = input
      .replace(/\/JavaScript\b/gi, '\\/JavaScript')
      .replace(/\/JS\b/gi, '\\/JS')
      .replace(/\/Launch\b/gi, '\\/Launch')
      .replace(/\/URI\b/gi, '\\/URI');
    
    return result;
  }
}
