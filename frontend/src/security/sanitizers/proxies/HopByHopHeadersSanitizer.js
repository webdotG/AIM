import BaseSanitizer from '../base/BaseSanitizer.js';

/**
 * HopByHopHeadersSanitizer - защита от злоупотребления hop-by-hop заголовками
 * 
 * Атака: Манипуляция Connection header для удаления критичных заголовков
 * Защита: Валидация и фильтрация hop-by-hop заголовков
 * 
 * @example
 * const sanitizer = new HopByHopHeadersSanitizer({ strict: true });
 * const safeHeaders = sanitizer.sanitize(req.headers);
 */
class HopByHopHeadersSanitizer extends BaseSanitizer {
  constructor(config = {}) {
    super(config);
    
    // Стандартные hop-by-hop заголовки (RFC 2616)
    this.standardHopByHop = new Set([
      'connection',
      'keep-alive',
      'transfer-encoding',
      'te',
      'trailer',
      'upgrade',
      'proxy-authorization',
      'proxy-authenticate'
    ]);
    
    // Критичные заголовки, которые НИКОГДА не должны быть hop-by-hop
    this.protectedHeaders = new Set([
      'authorization',
      'cookie',
      'x-forwarded-for',
      'x-real-ip',
      'x-original-url',
      'x-rewrite-url',
      'x-forwarded-host',
      'x-forwarded-proto',
      'x-forwarded-server',
      'x-http-method-override',
      'x-auth-token',
      'api-key',
      'x-api-key'
    ]);
    
    // Строгий режим (блокировать попытки манипуляции)
    this.strict = config.strict ?? true;
    
    // Логировать подозрительную активность
    this.logSuspicious = config.logSuspicious ?? true;
  }
  
  /**
   * Основной метод санитизации заголовков
   * @param {Object} headers - HTTP заголовки из request
   * @returns {Object} - Очищенные заголовки
   */
  sanitize(headers) {
    if (!headers || typeof headers !== 'object') {
      return headers;
    }
    
    // Нормализуем заголовки (lowercase keys)
    const normalizedHeaders = this.normalizeHeaders(headers);
    
    // Парсим Connection header
    const connectionValue = normalizedHeaders['connection'];
    
    if (!connectionValue) {
      // Нет Connection header - ничего не делаем
      return headers;
    }
    
    // Извлекаем список hop-by-hop заголовков
    const declaredHopByHop = this.parseConnectionHeader(connectionValue);
    
    // Проверяем на попытку злоупотребления
    const violation = this.detectViolation(declaredHopByHop);
    
    if (violation) {
      this.handleViolation(violation, headers);
      
      if (this.strict) {
        // В строгом режиме - удаляем Connection header полностью
        const cleaned = { ...headers };
        delete cleaned.connection;
        delete cleaned.Connection;
        
        this.log(
          `Removed malicious Connection header: ${connectionValue}`,
          'warn'
        );
        
        return cleaned;
      }
    }
    
    // Фильтруем безопасные hop-by-hop заголовки
    return this.filterSafeHopByHop(headers, declaredHopByHop);
  }
  
  /**
   * Нормализация заголовков (lowercase keys)
   */
  normalizeHeaders(headers) {
    const normalized = {};
    
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    
    return normalized;
  }
  
  /**
   * Парсинг Connection header
   * "close, X-Forwarded-For, Keep-Alive" -> ["close", "x-forwarded-for", "keep-alive"]
   */
  parseConnectionHeader(connectionValue) {
    if (!connectionValue || typeof connectionValue !== 'string') {
      return [];
    }
    
    return connectionValue
      .split(',')
      .map(h => h.trim().toLowerCase())
      .filter(h => h.length > 0);
  }
  
  /**
   * Детекция попытки злоупотребления
   * @returns {Object|null} - Информация о нарушении или null
   */
  detectViolation(declaredHopByHop) {
    // Проверяем, пытаются ли пометить защищенные заголовки как hop-by-hop
    for (const header of declaredHopByHop) {
      if (this.protectedHeaders.has(header)) {
        return {
          type: 'protected_header_abuse',
          header: header,
          severity: 'high',
          description: `Attempt to mark protected header as hop-by-hop: ${header}`
        };
      }
    }
    
    // Проверяем на подозрительное количество заголовков
    if (declaredHopByHop.length > 10) {
      return {
        type: 'excessive_hop_by_hop',
        count: declaredHopByHop.length,
        severity: 'medium',
        description: `Excessive hop-by-hop headers declared: ${declaredHopByHop.length}`
      };
    }
    
    // Проверяем на попытку удаления важных заголовков через паттерны
    const suspiciousPatterns = [
      'auth', 'token', 'api', 'key', 'session',
      'forwarded', 'real-ip', 'original'
    ];
    
    for (const header of declaredHopByHop) {
      for (const pattern of suspiciousPatterns) {
        if (header.includes(pattern)) {
          return {
            type: 'suspicious_pattern',
            header: header,
            pattern: pattern,
            severity: 'medium',
            description: `Suspicious hop-by-hop header pattern: ${header}`
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Обработка обнаруженного нарушения
   */
  handleViolation(violation, originalHeaders) {
    if (this.logSuspicious) {
      this.log(
        `SECURITY VIOLATION: ${violation.type} - ${violation.description}`,
        'error'
      );
      
      // Логируем для security monitoring
      this.logSecurityEvent({
        type: 'hop_by_hop_abuse',
        severity: violation.severity,
        violation: violation,
        headers: this.sanitizeHeadersForLogging(originalHeaders),
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Фильтрация безопасных hop-by-hop заголовков
   * Оставляем только стандартные hop-by-hop, удаляем кастомные
   */
  filterSafeHopByHop(headers, declaredHopByHop) {
    const cleaned = { ...headers };
    
    // Фильтруем Connection header - оставляем только безопасные значения
    const safeValues = declaredHopByHop.filter(h => 
      this.standardHopByHop.has(h)
    );
    
    if (safeValues.length > 0) {
      cleaned.connection = safeValues.join(', ');
      cleaned.Connection = safeValues.join(', ');
    } else {
      delete cleaned.connection;
      delete cleaned.Connection;
    }
    
    this.log(
      `Filtered Connection header. Original: ${headers.connection || headers.Connection}, ` +
      `Safe: ${safeValues.join(', ') || 'none'}`,
      'info'
    );
    
    return cleaned;
  }
  
  /**
   * Санитизация заголовков для логирования (удаляем sensitive data)
   */
  sanitizeHeadersForLogging(headers) {
    const safe = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'api-key', 'x-api-key'];
    
    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        safe[key] = '[REDACTED]';
      } else {
        safe[key] = value;
      }
    }
    
    return safe;
  }
  
  /**
   * Логирование security событий
   * (Интеграция с security_logs таблицей)
   */
  logSecurityEvent(event) {
    if (this.config.securityLogger) {
      this.config.securityLogger(event);
    } else {
      console.error('[SECURITY]', JSON.stringify(event, null, 2));
    }
  }
  
  /**
   * Проверка, является ли заголовок стандартным hop-by-hop
   */
  isStandardHopByHop(header) {
    return this.standardHopByHop.has(header.toLowerCase());
  }
  
  /**
   * Проверка, является ли заголовок защищенным
   */
  isProtectedHeader(header) {
    return this.protectedHeaders.has(header.toLowerCase());
  }
}

export default HopByHopHeadersSanitizer;

// Оригинальная статья: https://nathandavison.com/blog/abusing-http-hop-by-hop-request-headers
// RFC 2616 (HTTP/1.1): https://www.rfc-editor.org/rfc/rfc2616#section-13.5.1
// OWASP: https://owasp.org/www-community/attacks/HTTP_Response_Splitting
// https://book.hacktricks.wiki/en/pentesting-web/abusing-hop-by-hop-headers.html