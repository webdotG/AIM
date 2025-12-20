
import SanitizerPipeline from '../SanitizerPipeline.js';

import TrimSanitizer from '../../sanitizers/shared/TrimSanitizer.js';
import LengthSanitizer from '../../sanitizers/shared/LengthSanitizer.js';
import XSSSanitizer from '../../sanitizers/frontend/XSSSanitizer.js';
import HTMLSanitizer from '../../sanitizers/shared/HTMLSanitizer.js';
import URLSanitizer from '../../sanitizers/shared/URLSanitizer.js'; 

/**
 * Пресет для аутентификации и авторизации
 */
export function createAuthPreset(config = {}) {
  const pipeline = new SanitizerPipeline({
    name: 'auth-pipeline',
    stopOnError: true,
    ...config
  });

  // Регистрация схем для валидации (предполагаем, что они есть)
  pipeline.registerValidator('auth', config.authSchema);

  // 1. Общий пресет для ввода (username, email, password)
  pipeline.registerPreset('user-input', async (value, context) => {
    const subPipeline = new SanitizerPipeline();
    
    // Убираем пробелы по краям
    subPipeline.addSanitizer(new TrimSanitizer());
    
    // Проверяем длину (минимальная проверка)
    subPipeline.addSanitizer(new LengthSanitizer({
      min: context.field === 'password' ? 8 : 3,
      max: 100,
      truncate: false
    }));
    
    // Убираем XSS
    subPipeline.addSanitizer(new XSSSanitizer({
      stripScriptTags: true,
      stripEventHandlers: true,
      stripJavaScriptProtocols: true
    }));
    
    // Экранируем HTML если нужно
    if (context.allowHtml !== true) {
      subPipeline.addSanitizer(new HTMLSanitizer({
        allowedTags: [],
        allowedAttributes: {}
      }));
    }
    
    return await subPipeline.execute(value, context);
  });

  // 2. Специфичный для email
  pipeline.registerPreset('email', async (value) => {
    const subPipeline = new SanitizerPipeline();
    
    subPipeline.addSanitizer(new TrimSanitizer());
    
    // Приводим к нижнему регистру
    subPipeline.addSanitizer({
      async sanitize(val) {
        return typeof val === 'string' ? val.toLowerCase() : val;
      }
    });
    
    // Убираем опасные символы в email
    subPipeline.addSanitizer(new XSSSanitizer({
      stripScriptTags: true,
      stripInlineEvents: true
    }));
    
    return await subPipeline.execute(value);
  });

  // 3. Специфичный для пароля
  pipeline.registerPreset('password', async (value) => {
    const subPipeline = new SanitizerPipeline();
    
    // Для пароля не тримим пробелы внутри
    subPipeline.addSanitizer({
      async sanitize(val) {
        return typeof val === 'string' ? val.trim() : val;
      }
    });
    
    // Проверяем сложность пароля
    subPipeline.addSanitizer({
      async sanitize(val) {
        if (typeof val !== 'string') return val;
        
        const errors = [];
        
        // Проверка на минимальную длину
        if (val.length < 8) {
          errors.push('Password must be at least 8 characters long');
        }
        
        // Проверка на наличие цифр
        if (!/\d/.test(val)) {
          errors.push('Password must contain at least one number');
        }
        
        // Проверка на наличие букв в разных регистрах
        if (!/[a-z]/.test(val)) {
          errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[A-Z]/.test(val)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        
        // Проверка на наличие спецсимволов
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
          errors.push('Password must contain at least one special character');
        }
        
        // Проверка на слишком простые пароли
        const commonPasswords = [
          'password', '123456', 'qwerty', 'admin', 
          'welcome', 'monkey', 'password1'
        ];
        
        if (commonPasswords.includes(val.toLowerCase())) {
          errors.push('Password is too common');
        }
        
        // Проверка на последовательности
        const sequences = [
          '123', '234', '345', '456', '567', '678', '789',
          'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi',
          'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop'
        ];
        
        const lowerVal = val.toLowerCase();
        if (sequences.some(seq => lowerVal.includes(seq))) {
          errors.push('Password contains obvious sequences');
        }
        
        if (errors.length > 0) {
          throw new Error(`Password validation failed: ${errors.join(', ')}`);
        }
        
        return val;
      }
    });
    
    return await subPipeline.execute(value);
  });

  // 4. Для токенов (JWT, CSRF)
  pipeline.registerPreset('token', async (value) => {
    const subPipeline = new SanitizerPipeline();
    
    subPipeline.addSanitizer(new TrimSanitizer());
    
    // Проверяем формат токена
    subPipeline.addSanitizer({
      async sanitize(val) {
        if (typeof val !== 'string') {
          throw new Error('Token must be a string');
        }
        
        // Проверка JWT формата (три части разделенные точками)
        if (val.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)) {
          // JWT токен
          const parts = val.split('.');
          if (parts.length !== 3) {
            throw new Error('Invalid JWT token format');
          }
        }
        // CSRF токен обычно hex строка
        else if (!val.match(/^[a-f0-9]{32,}$/i)) {
          throw new Error('Invalid token format');
        }
        
        return val;
      }
    });
    
    return await subPipeline.execute(value);
  });

  // 5. Для URL редиректов (опасная зона!)
  pipeline.registerPreset('redirect-url', async (value) => {
    const subPipeline = new SanitizerPipeline();
    
    subPipeline.addSanitizer(new TrimSanitizer());
    
    // Используем URLSanitizer
    subPipeline.addSanitizer(new URLSanitizer({
      allowedProtocols: ['http:', 'https:'],
      requireHttps: true,
      blockLocalhost: true,
      blockPrivateIPs: true,
      validateDomain: true
    }));
    
    // Дополнительная проверка на открытые редиректы
    subPipeline.addSanitizer({
      async sanitize(val) {
        try {
          const url = new URL(val);
          
          // Проверяем, что редирект ведет на наш домен или разрешенный
          const allowedDomains = config.allowedRedirectDomains || [];
          const currentDomain = config.currentDomain || 'example.com';
          
          const urlDomain = url.hostname;
          
          // Разрешаем относительные пути
          if (val.startsWith('/')) {
            return val;
          }
          
          // Разрешаем наш домен
          if (urlDomain === currentDomain || urlDomain.endsWith(`.${currentDomain}`)) {
            return val;
          }
          
          // Проверяем разрешенные домены
          if (allowedDomains.includes(urlDomain)) {
            return val;
          }
          
          // Запрещаем все остальное
          throw new Error('Redirect to external domain is not allowed');
          
        } catch (error) {
          throw new Error(`Invalid redirect URL: ${error.message}`);
        }
      }
    });
    
    return await subPipeline.execute(value);
  });

  // 6. Для OAuth callback параметров
  pipeline.registerPreset('oauth-callback', async (value, context) => {
    const subPipeline = new SanitizerPipeline();
    
    subPipeline.addSanitizer(new TrimSanitizer());
    
    // Параметры OAuth должны быть безопасными
    subPipeline.addSanitizer({
      async sanitize(val) {
        if (typeof val !== 'string') return val;
        
        // Проверяем на опасные параметры
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /data:/i,
          /on\w+=/i
        ];
        
        if (dangerousPatterns.some(pattern => pattern.test(val))) {
          throw new Error('OAuth parameter contains dangerous content');
        }
        
        // Проверяем длину
        if (val.length > 1000) {
          throw new Error('OAuth parameter too long');
        }
        
        return val;
      }
    });
    
    return await subPipeline.execute(value);
  });

  return pipeline;
}

/**
 * Краткая функция для быстрой санитизации данных аутентификации
 */
export async function sanitizeAuthData(data, type = 'login') {
  const pipeline = createAuthPreset();
  
  const sanitized = {};
  
  // В зависимости от типа обрабатываем разные поля
  switch (type) {
    case 'register':
      if (data.username) {
        sanitized.username = await pipeline.executePreset('user-input', data.username, {
          field: 'username'
        });
      }
      if (data.email) {
        sanitized.email = await pipeline.executePreset('email', data.email);
      }
      if (data.password) {
        sanitized.password = await pipeline.executePreset('password', data.password);
      }
      break;
      
    case 'login':
      if (data.usernameOrEmail) {
        // Определяем, это username или email
        const isEmail = data.usernameOrEmail.includes('@');
        if (isEmail) {
          sanitized.email = await pipeline.executePreset('email', data.usernameOrEmail);
        } else {
          sanitized.username = await pipeline.executePreset('user-input', data.usernameOrEmail, {
            field: 'username'
          });
        }
      }
      if (data.password) {
        sanitized.password = await pipeline.executePreset('password', data.password);
      }
      break;
      
    case 'reset-password':
      if (data.email) {
        sanitized.email = await pipeline.executePreset('email', data.email);
      }
      if (data.token) {
        sanitized.token = await pipeline.executePreset('token', data.token);
      }
      if (data.newPassword) {
        sanitized.newPassword = await pipeline.executePreset('password', data.newPassword);
      }
      break;
      
    case 'change-password':
      if (data.currentPassword) {
        sanitized.currentPassword = await pipeline.executePreset('password', data.currentPassword);
      }
      if (data.newPassword) {
        sanitized.newPassword = await pipeline.executePreset('password', data.newPassword);
      }
      break;
  }
  
  return sanitized;
}

export default createAuthPreset;