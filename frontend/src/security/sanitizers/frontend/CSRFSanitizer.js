import BaseSanitizer from '../base/BaseSanitizer.js';

export default class CSRFSanitizer extends BaseSanitizer {
  constructor(options = {}) {
    super({
      tokenHeader: 'X-CSRF-Token',
      methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
      ...options
    });
  }

  async process(input, context = {}) {
    const { req, res } = context;
    
    if (!req || !this.shouldProcessRequest(req)) {
      return input;
    }

    const token = this.extractToken(req);
    
    if (!this.validateToken(token, req.session?.csrfToken)) {
      throw new Error('Invalid CSRF token');
    }

    // Удалить токен из input если он там был
    if (input && input._csrf) {
      const { _csrf, ...cleanInput } = input;
      return cleanInput;
    }

    return input;
  }

  shouldProcessRequest(req) {
    return this.options.methods.includes(req.method);
  }

  extractToken(req) {
    return req.headers[this.options.tokenHeader.toLowerCase()] || 
           req.body?._csrf || 
           req.query?._csrf;
  }

  validateToken(received, stored) {
    if (!received || !stored) return false;
    // Простая проверка для примера
    return received === stored;
  }
}