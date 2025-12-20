// security/utils/encoders.js
export class Encoder {
  static htmlEncode(input) {
    if (typeof input !== 'string') return input;
    
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return input.replace(/[&<>"'\/]/g, char => escapeMap[char] || char);
  }

  static htmlDecode(input) {
    if (typeof input !== 'string') return input;
    
    const unescapeMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/'
    };
    
    return input.replace(
      /&(amp|lt|gt|quot|#x27|#x2F);/g,
      (match, entity) => unescapeMap[match] || match
    );
  }

  static urlEncode(input) {
    if (typeof input !== 'string') return input;
    
    return encodeURIComponent(input)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E');
  }

  static urlDecode(input) {
    if (typeof input !== 'string') return input;
    
    try {
      return decodeURIComponent(input.replace(/\+/g, ' '));
    } catch {
      return input; // Если декодирование не удалось, возвращаем оригинал
    }
  }

  static base64Encode(input) {
    if (typeof input !== 'string') return input;
    
    try {
      return btoa(unescape(encodeURIComponent(input)));
    } catch {
      return input;
    }
  }

  static base64Decode(input) {
    if (typeof input !== 'string') return input;
    
    try {
      return decodeURIComponent(escape(atob(input)));
    } catch {
      return input;
    }
  }

  static jsEncode(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  static jsonEncode(input) {
    try {
      return JSON.stringify(input);
    } catch {
      return 'null';
    }
  }

  static jsonDecode(input) {
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  }
}

export class EncodingSanitizer {
  constructor(options = {}) {
    this.options = {
      encodeFor: 'html', // html, url, js, json, base64
      decodeFirst: false,
      ...options
    };
  }

  async sanitize(input) {
    let result = input;
    
    if (this.options.decodeFirst && typeof result === 'string') {
      result = this.decode(result, this.options.encodeFor);
    }
    
    if (typeof result === 'string') {
      result = this.encode(result, this.options.encodeFor);
    }
    
    return result;
  }

  encode(input, type) {
    switch (type) {
      case 'html':
        return Encoder.htmlEncode(input);
      case 'url':
        return Encoder.urlEncode(input);
      case 'js':
        return Encoder.jsEncode(input);
      case 'json':
        return Encoder.jsonEncode(input);
      case 'base64':
        return Encoder.base64Encode(input);
      default:
        return input;
    }
  }

  decode(input, type) {
    switch (type) {
      case 'html':
        return Encoder.htmlDecode(input);
      case 'url':
        return Encoder.urlDecode(input);
      case 'json':
        return Encoder.jsonDecode(input);
      case 'base64':
        return Encoder.base64Decode(input);
      default:
        return input;
    }
  }
}