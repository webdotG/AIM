// security/utils/detectors.js
export class AttackDetector {
  static detectSQLInjection(input) {
    if (typeof input !== 'string') return false;
    
    const sqlPatterns = [
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/i,
      /\b(UNION|JOIN|WHERE|FROM|INTO)\b/i,
      /--|\/\*|\*\//, // SQL комментарии
      /['";]/ // Специальные символы
    ];
    
    const suspiciousWords = sqlPatterns.some(pattern => pattern.test(input));
    const unusualLength = input.length > 1000 && input.includes("'");
    
    return suspiciousWords && unusualLength;
  }

  static detectXSS(input) {
    if (typeof input !== 'string') return false;
    
    const xssPatterns = [
      /<script\b[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /expression\s*\(/i,
      /<iframe\b[^>]*>/i,
      /<object\b[^>]*>/i,
      /<embed\b[^>]*>/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  static detectCommandInjection(input) {
    if (typeof input !== 'string') return false;
    
    const cmdPatterns = [
      /;\s*\w+/, // Команда после точки с запятой
      /\|\s*\w+/, // Команда после пайпа
      /&&\s*\w+/, // Команда после &&
      /\$\s*\(/, // Command substitution
      /`[^`]*`/ // Backticks
    ];
    
    return cmdPatterns.some(pattern => pattern.test(input));
  }

  static detectSSRF(input) {
    if (typeof input !== 'string') return false;
    
    const ssrfPatterns = [
      /localhost|127\.0\.0\.1|0\.0\.0\.0/i,
      /192\.168\.\d+\.\d+/,
      /10\.\d+\.\d+\.\d+/,
      /172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+/,
      /file:\/\//,
      /gopher:\/\//,
      /dict:\/\//
    ];
    
    return ssrfPatterns.some(pattern => pattern.test(input));
  }

  static detectPathTraversal(input) {
    if (typeof input !== 'string') return false;
    
    const traversalPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /\/etc\/passwd/,
      /\/proc\/self/,
      /C:\\Windows\\/
    ];
    
    return traversalPatterns.some(pattern => pattern.test(input));
  }
}

export class InputClassifier {
  static classify(input) {
    const classifications = [];
    
    if (AttackDetector.detectSQLInjection(input)) {
      classifications.push('sql-injection');
    }
    
    if (AttackDetector.detectXSS(input)) {
      classifications.push('xss');
    }
    
    if (AttackDetector.detectCommandInjection(input)) {
      classifications.push('command-injection');
    }
    
    if (AttackDetector.detectSSRF(input)) {
      classifications.push('ssrf');
    }
    
    if (AttackDetector.detectPathTraversal(input)) {
      classifications.push('path-traversal');
    }
    
    return classifications;
  }
  
  static getRiskLevel(classifications) {
    const highRisk = ['sql-injection', 'command-injection'];
    const mediumRisk = ['xss', 'path-traversal'];
    const lowRisk = ['ssrf'];
    
    if (classifications.some(c => highRisk.includes(c))) {
      return 'high';
    }
    
    if (classifications.some(c => mediumRisk.includes(c))) {
      return 'medium';
    }
    
    if (classifications.some(c => lowRisk.includes(c))) {
      return 'low';
    }
    
    return 'none';
  }
}