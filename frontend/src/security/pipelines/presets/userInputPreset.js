import SanitizerPipeline from '../SanitizerPipeline.js';
import {
  TrimSanitizer,
  LengthSanitizer,
  XSSSanitizer,
  HTMLSanitizer,
  URLSanitizer
} from '../../sanitizers/index.js';

/**
 * Основной пресет для пользовательского ввода
 */
export function createUserInputPreset(config = {}) {
  const pipeline = new SanitizerPipeline({
    name: 'user-input-pipeline',
    stopOnError: config.stopOnError !== false,
    logErrors: config.logErrors !== false,
    ...config
  });

  // 1. Базовый текст (для полей ввода, комментариев, сообщений)
  pipeline.registerPreset('text', async (value, context = {}) => {
    const subPipeline = new SanitizerPipeline();
    
    // Конфигурация из контекста или дефолтная
    const maxLength = context.maxLength || config.maxLength || 5000;
    const allowedTags = context.allowedTags || config.allowedTags || [];
    const allowHtml = context.allowHtml || config.allowHtml || false;
    
    // Тримминг
    subPipeline.addSanitizer(new TrimSanitizer());
    
    // Проверка длины
    subPipeline.addSanitizer(new LengthSanitizer({
      max: maxLength,
      truncate: context.truncate !== false,
      truncateSuffix: '...'
    }));
    
    // XSS защита
    subPipeline.addSanitizer(new XSSSanitizer({
      stripScriptTags: true,
      stripInlineEvents: true,
      stripJavaScriptProtocols: true,
      stripVBScriptProtocols: true,
      stripDataProtocols: true
    }));
    
    // HTML обработка
    if (allowHtml && allowedTags.length > 0) {
      subPipeline.addSanitizer(new HTMLSanitizer({
        allowedTags,
        allowedAttributes: config.allowedAttributes || {
          'a': ['href', 'title', 'target'],
          'img': ['src', 'alt', 'width', 'height'],
          '*': ['class', 'style']
        },
        stripDisallowed: true
      }));
    } else {
      // Полное экранирование HTML
      subPipeline.addSanitizer(new HTMLSanitizer({
        allowedTags: [],
        allowedAttributes: {}
      }));
    }
    
    // Проверка на спам/ботов
    if (config.spamDetection !== false) {
      subPipeline.addSanitizer({
        async sanitize(val) {
          if (typeof val !== 'string') return val;
          
          const lowerVal = val.toLowerCase();
          
          // Проверка на слишком много ссылок
          const urlMatches = lowerVal.match(/https?:\/\/[^\s]+/g) || [];
          if (urlMatches.length > 3) {
            throw new Error('Too many URLs in text');
          }
          
          // Проверка на спам-слова
          const spamWords = [
            'купить', 'продать', 'дешево', 'скидка', 'акция',
            'быстро', 'срочно', 'гарантия', 'прибыль', 'заработок',
            'viagra', 'cialis', 'casino', 'poker', 'lottery'
          ];
          
          const foundSpamWords = spamWords.filter(word => 
            lowerVal.includes(word)
          );
          
          if (foundSpamWords.length > 2) {
            throw new Error('Text contains spam keywords');
          }
          
          // Проверка на повторяющиеся символы/слова (боты)
          const repeatedCharPattern = /(.)\1{10,}/;
          if (repeatedCharPattern.test(val)) {
            throw new Error('Text contains too many repeated characters');
          }
          
          // Проверка на капс лок
          const capsRatio = (val.match(/[A-ZА-Я]/g) || []).length / val.length;
          if (capsRatio > 0.5 && val.length > 20) {
            throw new Error('Text contains too many capital letters');
          }
          
          return val;
        }
      });
    }
    
    return await subPipeline.execute(value, context);
  });

  // 2. HTML контент (для редакторов, блогов)
  pipeline.registerPreset('html-content', async (value, context = {}) => {
    const subPipeline = new SanitizerPipeline();
    
    const maxLength = context.maxLength || config.maxLength || 20000;
    const allowedTags = context.allowedTags || config.allowedTags || [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'b', 'i', 'u', 'em', 'strong', 'code', 'pre',
      'blockquote', 'ul', 'ol', 'li', 'br', 'hr',
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ];
    
    // Проверка длины
    subPipeline.addSanitizer(new LengthSanitizer({
      max: maxLength,
      truncate: false
    }));
    
    // Интенсивная XSS защита для HTML
    subPipeline.addSanitizer(new XSSSanitizer({
      stripScriptTags: true,
      stripInlineEvents: true,
      stripJavaScriptProtocols: true,
      stripVBScriptProtocols: true,
      stripDataProtocols: true,
      stripUnsafeTags: true,
      stripComments: true
    }));
    
    // HTML санитизация с разрешенными тегами
    subPipeline.addSanitizer(new HTMLSanitizer({
      allowedTags,
      allowedAttributes: {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
        'table': ['border', 'cellpadding', 'cellspacing'],
        '*': ['class', 'style', 'id']
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      transformTags: {
        'a': (tagName, attribs) => {
          // Добавляем noopener/noreferrer для безопасности
          if (!attribs.rel) {
            attribs.rel = 'noopener noreferrer';
          }
          // Открываем в новой вкладке если target=_blank
          if (attribs.target === '_blank') {
            attribs.rel = (attribs.rel ? attribs.rel + ' ' : '') + 'noopener noreferrer';
          }
          return {
            tagName,
            attribs
          };
        },
        'img': (tagName, attribs) => {
          // Добавляем атрибуты для lazy loading
          if (!attribs.loading) {
            attribs.loading = 'lazy';
          }
          return {
            tagName,
            attribs
          };
        }
      }
    }));
    
    // Проверка URL внутри контента
    subPipeline.addSanitizer({
      async sanitize(val) {
        if (typeof val !== 'string') return val;
        
        // Ищем все URL в тексте
        const urlRegex = /(href|src)=["']([^"']+)["']/gi;
        let match;
        
        while ((match = urlRegex.exec(val)) !== null) {
          const url = match[2];
          try {
            // Проверяем каждый URL
            const urlSanitizer = new URLSanitizer({
              allowedProtocols: ['http:', 'https:', 'mailto:', 'tel:'],
              blockLocalhost: true,
              blockPrivateIPs: true
            });
            
            await urlSanitizer.sanitize(url);
          } catch (error) {
            throw new Error(`Dangerous URL found in content: ${url}`);
          }
        }
        
        return val;
      }
    });
    
    return await subPipeline.execute(value, context);
  });

  // 3. Числовой ввод
  pipeline.registerPreset('number', async (value, context = {}) => {
    const subPipeline = new SanitizerPipeline();
    
    const min = context.min !== undefined ? context.min : config.min;
    const max = context.max !== undefined ? context.max : config.max;
    const integerOnly = context.integerOnly || config.integerOnly || false;
    
    subPipeline.addSanitizer({
      async sanitize(val) {
        // Преобразуем строку в число если нужно
        if (typeof val === 'string') {
          const trimmed = val.trim();
          const num = Number(trimmed);
          
          if (isNaN(num)) {
            throw new Error('Invalid number format');
          }
          
          // Проверяем, что строка содержала только число
          if (trimmed !== num.toString() && trimmed !== num.toExponential()) {
            throw new Error('Input contains non-numeric characters');
          }
          
          val = num;
        }
        
        if (typeof val !== 'number' || isNaN(val)) {
          throw new Error('Value must be a number');
        }
        
        // Проверка на целое число
        if (integerOnly && !Number.isInteger(val)) {
          throw new Error('Value must be an integer');
        }
        
        // Проверка диапазона
        if (min !== undefined && val < min) {
          throw new Error(`Value must be at least ${min}`);
        }
        
        if (max !== undefined && val > max) {
          throw new Error(`Value must be at most ${max}`);
        }
        
        // Проверка на безопасные значения
        if (!Number.isFinite(val)) {
          throw new Error('Invalid number value');
        }
        
        // Проверка на слишком большие/маленькие числа
        if (Math.abs(val) > Number.MAX_SAFE_INTEGER) {
          throw new Error('Number is too large');
        }
        
        return val;
      }
    });
    
    return await subPipeline.execute(value, context);
  });

  // 4. Email ввод
  pipeline.registerPreset('email', async (value) => {
    const subPipeline = new SanitizerPipeline();
    
    subPipeline.addSanitizer(new TrimSanitizer());
    
    subPipeline.addSanitizer({
      async sanitize(val) {
        if (typeof val !== 'string') {
          throw new Error('Email must be a string');
        }
        
        const lowerVal = val.toLowerCase();
        
        // Базовый паттерн email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(lowerVal)) {
          throw new Error('Invalid email format');
        }
        
        // Проверка длины
        if (lowerVal.length > 254) {
          throw new Error('Email is too long');
        }
        
        const [localPart, domain] = lowerVal.split('@');
        
        // Проверка длины local part
        if (localPart.length > 64) {
          throw new Error('Local part of email is too long');
        }
        
        // Проверка disposable email
        const disposableDomains = [
          'tempmail.com', '10minutemail.com', 'guerrillamail.com',
          'mailinator.com', 'throwawaymail.com', 'yopmail.com',
          'fakeinbox.com', 'trashmail.com'
        ];
        
        if (disposableDomains.some(dd => domain.includes(dd))) {
          throw new Error('Disposable email addresses are not allowed');
        }
        
        // Проверка на временные/мусорные email
        if (localPart.includes('temp') || 
            localPart.includes('test') ||
            localPart.includes('fake') ||
            localPart.match(/^\d+$/)) {
          throw new Error('Email looks suspicious');
        }
        
        return lowerVal;
      }
    });
    
    return await subPipeline.execute(value);
  });

  // 5. URL ввод
  pipeline.registerPreset('url', async (value, context = {}) => {
    const subPipeline = new SanitizerPipeline();
    
    subPipeline.addSanitizer(new TrimSanitizer());
    
    // Используем URLSanitizer
    const urlSanitizer = new URLSanitizer({
      allowedProtocols: context.allowedProtocols || ['http:', 'https:'],
      requireHttps: context.requireHttps !== false,
      blockLocalhost: context.blockLocalhost !== false,
      blockPrivateIPs: context.blockPrivateIPs !== false,
      validateDomain: context.validateDomain !== false,
      allowedDomains: context.allowedDomains,
      blockedDomains: context.blockedDomains
    });
    
    subPipeline.addSanitizer(urlSanitizer);
    
    // Дополнительная проверка на редиректы
    subPipeline.addSanitizer({
      async sanitize(val) {
        try {
          const url = new URL(val);
          
          // Проверка параметров редиректа
          const redirectParams = ['redirect', 'return', 'url', 'next', 'goto'];
          redirectParams.forEach(param => {
            if (url.searchParams.has(param)) {
              const redirectValue = url.searchParams.get(param);
              if (redirectValue && !redirectValue.startsWith('/')) {
                throw new Error('Open redirect detected in URL parameters');
              }
            }
          });
          
          // Проверка на слишком длинные пути (возможность DoS)
          if (url.pathname.length > 500) {
            throw new Error('URL path is too long');
          }
          
          // Проверка на слишком много параметров
          if (url.searchParams.toString().length > 1000) {
            throw new Error('URL has too many parameters');
          }
          
          return val;
        } catch (error) {
          throw new Error(`URL validation failed: ${error.message}`);
        }
      }
    });
    
    return await subPipeline.execute(value);
  });

  // 6. Дата и время
  pipeline.registerPreset('datetime', async (value, context = {}) => {
    const subPipeline = new SanitizerPipeline();
    
    subPipeline.addSanitizer(new TrimSanitizer());
    
    subPipeline.addSanitizer({
      async sanitize(val) {
        let date;
        
        // Парсим дату из разных форматов
        if (typeof val === 'string') {
          date = new Date(val);
        } else if (typeof val === 'number') {
          // Unix timestamp
          date = new Date(val * 1000);
        } else if (val instanceof Date) {
          date = val;
        } else {
          throw new Error('Invalid date format');
        }
        
        // Проверка валидности даты
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        
        // Проверка на разумные границы дат
        const minDate = new Date('1900-01-01');
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 10); // +10 лет в будущее
        
        if (date < minDate) {
          throw new Error('Date is too far in the past');
        }
        
        if (date > maxDate) {
          throw new Error('Date is too far in the future');
        }
        
        // Проверка на подозрительные даты (например, timestamp атаки)
        const timestamp = date.getTime();
        const now = Date.now();
        
        // Если дата в будущем, проверяем что не слишком далеко
        if (timestamp > now) {
          const maxFuture = 365 * 24 * 60 * 60 * 1000; // 1 год
          if (timestamp - now > maxFuture) {
            throw new Error('Date is too far in the future');
          }
        }
        
        // Приводим к ISO формату для консистентности
        return date.toISOString();
      }
    });
    
    return await subPipeline.execute(value);
  });

  // 7. Выбор из списка (enum)
  pipeline.registerPreset('select', async (value, context = {}) => {
    const subPipeline = new SanitizerPipeline();
    
    const allowedValues = context.allowedValues || config.allowedValues || [];
    const multiple = context.multiple || config.multiple || false;
    
    subPipeline.addSanitizer({
      async sanitize(val) {
        if (multiple && Array.isArray(val)) {
          // Множественный выбор
          if (val.length === 0 && context.required) {
            throw new Error('At least one selection is required');
          }
          
          if (context.maxSelections && val.length > context.maxSelections) {
            throw new Error(`Too many selections (max: ${context.maxSelections})`);
          }
          
          // Проверяем каждое значение
          const invalidValues = val.filter(v => 
            !allowedValues.includes(v) && allowedValues.length > 0
          );
          
          if (invalidValues.length > 0) {
            throw new Error(`Invalid selections: ${invalidValues.join(', ')}`);
          }
          
          // Проверка на уникальность
          const uniqueValues = [...new Set(val)];
          if (uniqueValues.length !== val.length && context.uniqueItems) {
            throw new Error('Duplicate selections are not allowed');
          }
          
          return val;
        } else {
          // Одиночный выбор
          if (!allowedValues.includes(val) && allowedValues.length > 0) {
            throw new Error(`Value must be one of: ${allowedValues.join(', ')}`);
          }
          
          return val;
        }
      }
    });
    
    return await subPipeline.execute(value);
  });

  // 8. Файловые данные (метаданные)
  pipeline.registerPreset('file-meta', async (value, context = {}) => {
    const subPipeline = new SanitizerPipeline();
    
    const allowedTypes = context.allowedTypes || config.allowedTypes || [];
    const maxSize = context.maxSize || config.maxSize || 10 * 1024 * 1024; // 10MB
    
    subPipeline.addSanitizer({
      async sanitize(val) {
        if (!val || typeof val !== 'object') {
          throw new Error('Invalid file data');
        }
        
        // Проверка обязательных полей
        if (!val.originalname || typeof val.originalname !== 'string') {
          throw new Error('File name is required');
        }
        
        // Санитизация имени файла
        const fileName = val.originalname;
        const dangerousChars = /[<>:"\/\\|?*\x00-\x1F]/g;
        if (dangerousChars.test(fileName)) {
          throw new Error('File name contains dangerous characters');
        }
        
        // Проверка на слишком длинное имя
        if (fileName.length > 255) {
          throw new Error('File name is too long');
        }
        
        // Проверка расширения
        const extension = fileName.split('.').pop().toLowerCase();
        const dangerousExtensions = [
          'exe', 'bat', 'cmd', 'sh', 'php', 'py', 'js',
          'jar', 'war', 'dll', 'so', 'bin'
        ];
        
        if (dangerousExtensions.includes(extension)) {
          throw new Error('File type is not allowed');
        }
        
        // Проверка MIME типа
        if (val.mimetype && allowedTypes.length > 0) {
          if (!allowedTypes.includes(val.mimetype)) {
            throw new Error(`File type ${val.mimetype} is not allowed`);
          }
        }
        
        // Проверка размера
        if (val.size && val.size > maxSize) {
          throw new Error(`File size exceeds ${maxSize} bytes`);
        }
        
        return val;
      }
    });
    
    return await subPipeline.execute(value);
  });

  return pipeline;
}

/**
 * Вспомогательная функция для быстрой санитизации
 */
export async function sanitizeUserInput(input, type = 'text', options = {}) {
  const pipeline = createUserInputPreset(options);
  return await pipeline.executePreset(type, input, options);
}

/**
 * Создает пресет для форм
 */
export function createFormPreset(formConfig = {}) {
  return createUserInputPreset({
    maxLength: 5000,
    allowedTags: ['b', 'i', 'u', 'em', 'strong', 'a', 'code'],
    allowHtml: false,
    spamDetection: true,
    ...formConfig
  });
}

export default createUserInputPreset;