// security/utils/logger.js
export class SecurityLogger {
  constructor(options = {}) {
    this.options = {
      enabled: true,
      logLevel: 'warn', // debug, info, warn, error
      includeStackTrace: false,
      maxMessageLength: 1000,
      ...options
    };
    
    this.logs = [];
    this.maxLogs = options.maxLogs || 1000;
  }

  debug(message, data = {}) {
    this.log('debug', message, data);
  }

  info(message, data = {}) {
    this.log('info', message, data);
  }

  warn(message, data = {}) {
    this.log('warn', message, data);
  }

  error(message, data = {}) {
    this.log('error', message, data);
  }

  security(event, data = {}) {
    this.log('security', event, {
      ...data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  log(level, message, data = {}) {
    if (!this.options.enabled) return;
    
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      security: 4
    };
    
    if (levels[level] < levels[this.options.logLevel]) {
      return;
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: message.substring(0, this.options.maxMessageLength),
      data: this.sanitizeData(data)
    };
    
    if (this.options.includeStackTrace && level === 'error') {
      logEntry.stack = new Error().stack;
    }
    
    // Сохраняем в памяти
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Отправляем в консоль
    const consoleMethod = console[level] || console.log;
    consoleMethod(`[Security/${level.toUpperCase()}] ${message}`, data);
    
    // Отправляем на сервер для критичных событий
    if (level === 'security' || level === 'error') {
      this.sendToServer(logEntry);
    }
  }

  sanitizeData(data) {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth',
      'credit_card', 'cvv', 'ssn', 'passport'
    ];
    
    const sanitized = { ...data };
    
    for (const key in sanitized) {
      const keyLower = key.toLowerCase();
      if (sensitiveFields.some(field => keyLower.includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
      
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].substring(0, 100) + '...';
      }
    }
    
    return sanitized;
  }

  async sendToServer(logEntry) {
    try {
      // Можно отправлять через navigator.sendBeacon для надежности
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(logEntry)], {
          type: 'application/json'
        });
        navigator.sendBeacon('/api/security-logs', blob);
      } else {
        // Fallback через fetch
        await fetch('/api/security-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry),
          keepalive: true
        });
      }
    } catch (error) {
      console.error('Failed to send security log:', error);
    }
  }

  getLogs(filter = {}) {
    let filtered = this.logs;
    
    if (filter.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }
    
    if (filter.since) {
      const sinceDate = new Date(filter.since);
      filtered = filtered.filter(log => new Date(log.timestamp) >= sinceDate);
    }
    
    return filtered;
  }

  clear() {
    this.logs = [];
  }
}

// Синглтон для глобального использования
export const securityLogger = new SecurityLogger({
  enabled: process.env.NODE_ENV !== 'production',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn'
});