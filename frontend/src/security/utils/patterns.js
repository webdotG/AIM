// security/utils/patterns.js
export const Patterns = {
  // Email validation
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Username: letters, numbers, underscore, dash, 3-30 chars
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  
  // Strong password: min 8 chars, at least one uppercase, lowercase, number
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/,
  
  // Russian phone number
  PHONE_RU: /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/,
  
  // URL pattern
  URL: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
  
  // IP address
  IP: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  
  // UUID v4
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Date in YYYY-MM-DD format
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  
  // Base64
  BASE64: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
  
  // No HTML tags
  NO_HTML: /^[^<>]*$/,
  
  // Only alphanumeric and spaces
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]*$/,
  
  // Russian text with punctuation
  RUSSIAN_TEXT: /^[а-яА-ЯёЁ0-9\s.,!?;:"'()\-]*$/,
  
  // Hex color
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  // JWT token
  JWT: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  
  // File path (basic)
  FILE_PATH: /^[a-zA-Z0-9_\-./\\ ]+$/,
  
  // No SQL injection patterns
  NO_SQL: /^(?!.*\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION)\b).*$/i,
  
  // No XSS patterns
  NO_XSS: /^(?!.*<script\b)(?!.*javascript:)(?!.*on\w+\s*=).*$/i
};

export class PatternValidator {
  static validate(value, patternName) {
    if (!Patterns[patternName]) {
      throw new Error(`Pattern ${patternName} not found`);
    }
    
    if (typeof value !== 'string') {
      return false;
    }
    
    return Patterns[patternName].test(value);
  }
  
  static sanitize(value, patternName) {
    if (typeof value !== 'string') {
      return value;
    }
    
    const pattern = Patterns[patternName];
    if (!pattern) {
      return value;
    }
    
    // Удаляем все, что не соответствует паттерну
    let sanitized = '';
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const testString = sanitized + char;
      
      if (pattern.test(testString)) {
        sanitized = testString;
      }
    }
    
    return sanitized;
  }
  
  static validateMultiple(value, patterns) {
    if (typeof value !== 'string') {
      return false;
    }
    
    return patterns.every(patternName => 
      Patterns[patternName]?.test(value)
    );
  }
  
  static getPatternDescription(patternName) {
    const descriptions = {
      EMAIL: 'Valid email address',
      USERNAME: '3-30 characters, letters, numbers, underscore, dash',
      PASSWORD_STRONG: 'Min 8 chars, uppercase, lowercase, number',
      PHONE_RU: 'Russian phone number (+7 format)',
      URL: 'Valid URL (http/https optional)',
      IP: 'Valid IP address',
      UUID: 'Valid UUID v4',
      DATE_ISO: 'Date in YYYY-MM-DD format',
      BASE64: 'Valid Base64 string',
      NO_HTML: 'No HTML tags allowed',
      ALPHANUMERIC_SPACES: 'Only letters, numbers and spaces',
      RUSSIAN_TEXT: 'Only Russian text and punctuation',
      HEX_COLOR: 'Hex color (#RRGGBB or #RGB)',
      JWT: 'Valid JWT token format',
      FILE_PATH: 'Safe file path characters',
      NO_SQL: 'No SQL keywords',
      NO_XSS: 'No XSS patterns'
    };
    
    return descriptions[patternName] || 'No description available';
  }
}