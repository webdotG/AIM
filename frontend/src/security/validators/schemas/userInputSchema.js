export default {
  // Общий пользовательский ввод (текст)
  text: {
    value: {
      type: 'string',
      required: true,
      maxLength: 5000,
      validate: (value) => {
        // Проверка на XSS атаки
        const xssPatterns = [
          /<script\b[^>]*>/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /data:/i,
          /vbscript:/i
        ];
        
        if (xssPatterns.some(pattern => pattern.test(value))) {
          return 'Input contains potentially dangerous content';
        }
        
        // Проверка на инъекции
        const injectionPatterns = [
          /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b/i,
          /(--|\/\*|\*\/|;)/,
          /(\$where|\$gt|\$lt)/,
          /(eval\(|exec\(|system\()/i
        ];
        
        if (injectionPatterns.some(pattern => pattern.test(value))) {
          return 'Input contains suspicious patterns';
        }
        
        // Проверка на спам (повторяющиеся символы/слова)
        const repeatedChars = /(.)\1{10,}/;
        if (repeatedChars.test(value)) {
          return 'Input contains too many repeated characters';
        }
        
        // Проверка на слишком много ссылок
        const urlCount = (value.match(/https?:\/\/[^\s]+/gi) || []).length;
        if (urlCount > 3) {
          return 'Too many URLs in input';
        }
      }
    },
    allowHtml: {
      type: 'boolean',
      required: false,
      default: false
    },
    allowedTags: {
      type: 'array',
      required: false,
      items: {
        type: 'string',
        enum: ['b', 'i', 'u', 'em', 'strong', 'a', 'code', 'pre', 'p', 'br']
      }
    },
    sanitizeUrls: {
      type: 'boolean',
      required: false,
      default: true
    }
  },

  // Числовой ввод
  number: {
    value: {
      type: 'number',
      required: true,
      validate: (value) => {
        // Проверка на слишком большие/маленькие числа
        if (value > Number.MAX_SAFE_INTEGER) {
          return 'Number is too large';
        }
        if (value < Number.MIN_SAFE_INTEGER) {
          return 'Number is too small';
        }
        
        // Проверка на NaN/Infinity
        if (!Number.isFinite(value)) {
          return 'Invalid number';
        }
        
        // Проверка на целочисленные атаки
        if (Number.isInteger(value) && value > 1000000) {
          return 'Number is suspiciously large';
        }
      }
    },
    min: {
      type: 'number',
      required: false
    },
    max: {
      type: 'number',
      required: false
    },
    integerOnly: {
      type: 'boolean',
      required: false,
      default: false
    },
    allowNegative: {
      type: 'boolean',
      required: false,
      default: true
    }
  },

  // Email ввод
  email: {
    value: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254,
      validate: (value) => {
        // Дополнительные проверки email
        
        // Проверка длины каждой части
        const [localPart, domain] = value.split('@');
        if (localPart.length > 64) {
          return 'Local part of email is too long';
        }
        if (domain.length > 253) {
          return 'Domain part of email is too long';
        }
        
        // Проверка на disposable email
        const disposableDomains = [
          'tempmail.com', '10minutemail.com', 'guerrillamail.com',
          'mailinator.com', 'throwawaymail.com', 'yopmail.com'
        ];
        
        const domainLower = domain.toLowerCase();
        if (disposableDomains.some(dd => domainLower.includes(dd))) {
          return 'Disposable email addresses are not allowed';
        }
        
        // Проверка на существование MX записи (асинхронная, здесь только заглушка)
        // В реальности можно сделать DNS запрос
        
        // Проверка на подозрительные email
        const suspiciousPatterns = [
          /admin@/i,
          /root@/i,
          /test@/i,
          /noreply@/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(value))) {
          return 'Email looks suspicious';
        }
      }
    },
    requireMx: {
      type: 'boolean',
      required: false,
      default: false
    },
    allowSubaddressing: {
      type: 'boolean',
      required: false,
      default: true
    }
  },

  // URL ввод
  url: {
    value: {
      type: 'string',
      required: true,
      maxLength: 2000,
      validate: (value) => {
        try {
          const url = new URL(value);
          
          // Проверка протокола
          const allowedProtocols = ['http:', 'https:', 'ftp:', 'mailto:'];
          if (!allowedProtocols.includes(url.protocol)) {
            return `Protocol ${url.protocol} is not allowed`;
          }
          
          // Проверка домена
          const domain = url.hostname;
          
          // Запрещенные домены
          const blockedDomains = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            'internal',
            'intranet',
            'test'
          ];
          
          if (blockedDomains.some(bd => domain.includes(bd))) {
            return 'URL contains blocked domain';
          }
          
          // Проверка на IP адреса
          const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
          if (ipPattern.test(domain)) {
            return 'IP addresses in URLs are not allowed';
          }
          
          // Проверка на открытые редиректы
          const redirectParams = ['redirect', 'return', 'url', 'next', 'goto'];
          if (redirectParams.some(param => url.searchParams.has(param))) {
            const redirectValue = url.searchParams.get(redirectParams.find(p => url.searchParams.has(p)));
            if (redirectValue && !redirectValue.startsWith('/')) {
              return 'Open redirect detected';
            }
          }
          
          // Проверка на слишком длинный путь
          if (url.pathname.length > 1000) {
            return 'URL path is too long';
          }
          
          // Проверка на подозрительные параметры
          const suspiciousParams = ['<script>', 'javascript:', 'data:'];
          if (suspiciousParams.some(sp => url.toString().toLowerCase().includes(sp))) {
            return 'URL contains suspicious content';
          }
          
        } catch (error) {
          return 'Invalid URL format';
        }
      }
    },
    allowedDomains: {
      type: 'array',
      required: false,
      items: {
        type: 'string',
        pattern: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      }
    },
    blockedDomains: {
      type: 'array',
      required: false,
      items: {
        type: 'string'
      }
    },
    requireHttps: {
      type: 'boolean',
      required: false,
      default: true
    },
    allowQueryParams: {
      type: 'boolean',
      required: false,
      default: true
    },
    allowFragments: {
      type: 'boolean',
      required: false,
      default: false
    }
  },

  // Дата и время
  datetime: {
    value: {
      type: 'date',
      required: true,
      validate: (value) => {
        const date = new Date(value);
        const now = new Date();
        
        if (isNaN(date.getTime())) {
          return 'Invalid date/time';
        }
        
        // Проверка на слишком старые даты
        const minDate = new Date('1900-01-01');
        if (date < minDate) {
          return 'Date is too far in the past';
        }
        
        // Проверка на слишком будущие даты
        const maxFuture = new Date();
        maxFuture.setFullYear(maxFuture.getFullYear() + 10);
        if (date > maxFuture) {
          return 'Date is too far in the future';
        }
        
        // Проверка на временные атаки (миллисекунды)
        const timestamp = date.getTime();
        if (timestamp % 1000 !== 0 && timestamp < Date.now() - 31536000000) { // 1 год
          return 'Suspicious timestamp detected';
        }
      }
    },
    minDate: {
      type: 'date',
      required: false
    },
    maxDate: {
      type: 'date',
      required: false
    },
    format: {
      type: 'string',
      required: false,
      enum: ['iso', 'timestamp', 'custom']
    },
    timezone: {
      type: 'string',
      required: false,
      pattern: /^[A-Za-z_]+\/[A-Za-z_]+$/
    }
  },

  // Выбор из списка (enum)
  select: {
    value: {
      type: 'string',
      required: true,
      validate: (value, data) => {
        const allowedValues = data.options?.allowedValues || [];
        
        if (allowedValues.length > 0 && !allowedValues.includes(value)) {
          return `Value must be one of: ${allowedValues.join(', ')}`;
        }
        
        // Проверка на инъекцию в значение
        if (value.includes(';') || value.includes('--') || value.includes('/*')) {
          return 'Value contains suspicious characters';
        }
      }
    },
    allowedValues: {
      type: 'array',
      required: false,
      items: {
        type: 'string',
        maxLength: 100
      }
    },
    multiple: {
      type: 'boolean',
      required: false,
      default: false
    },
    minSelections: {
      type: 'number',
      required: false,
      min: 1
    },
    maxSelections: {
      type: 'number',
      required: false,
      max: 100
    }
  },

  // Булево значение
  boolean: {
    value: {
      type: 'boolean',
      required: true,
      validate: (value) => {
        // Проверка на строковые представления
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
            return 'Invalid boolean value';
          }
        }
      }
    },
    strict: {
      type: 'boolean',
      required: false,
      default: true
    }
  },

  // Файловый ввод
  file: {
    value: {
      type: 'object',
      required: true,
      validate: (value, data) => {
        if (!value || typeof value !== 'object') {
          return 'Invalid file object';
        }
        
        // Проверка MIME типа
        const allowedTypes = data.options?.allowedTypes || [
          'image/jpeg', 'image/png', 'image/gif',
          'application/pdf', 'text/plain'
        ];
        
        if (value.mimetype && !allowedTypes.includes(value.mimetype)) {
          return `File type ${value.mimetype} is not allowed`;
        }
        
        // Проверка расширения
        const allowedExtensions = data.options?.allowedExtensions || [
          'jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'
        ];
        
        if (value.originalname) {
          const extension = value.originalname.split('.').pop().toLowerCase();
          if (!allowedExtensions.includes(extension)) {
            return `File extension .${extension} is not allowed`;
          }
        }
        
        // Проверка размера
        const maxSize = data.options?.maxSize || 5 * 1024 * 1024; // 5MB
        if (value.size && value.size > maxSize) {
          return `File size exceeds ${maxSize} bytes`;
        }
        
        // Базовые проверки безопасности
        if (value.buffer) {
          // Проверка на пустой файл
          if (value.buffer.length === 0) {
            return 'File is empty';
          }
          
          // Проверка на слишком большой файл в памяти
          if (value.buffer.length > 100 * 1024 * 1024) { // 100MB
            return 'File is too large for processing';
          }
          
          // Проверка первых байтов на сигнатуры
          const header = value.buffer.slice(0, 4).toString('hex');
          const validImageHeaders = [
            'ffd8ffe0', // JPEG
            '89504e47', // PNG
            '47494638', // GIF
            '25504446'  // PDF
          ];
          
          if (value.mimetype?.startsWith('image/') && !validImageHeaders.some(h => header.startsWith(h))) {
            return 'Invalid image file signature';
          }
        }
      }
    },
    allowedTypes: {
      type: 'array',
      required: false,
      items: {
        type: 'string'
      }
    },
    allowedExtensions: {
      type: 'array',
      required: false,
      items: {
        type: 'string',
        pattern: /^[a-zA-Z0-9]{1,10}$/
      }
    },
    maxSize: {
      type: 'number',
      required: false,
      min: 1,
      max: 100 * 1024 * 1024 // 100MB
    },
    requireOriginalName: {
      type: 'boolean',
      required: false,
      default: true
    },
    scanForViruses: {
      type: 'boolean',
      required: false,
      default: false
    }
  },

  // Массив/список значений
  array: {
    value: {
      type: 'array',
      required: true,
      validate: (value, data) => {
        const maxItems = data.options?.maxItems || 100;
        const minItems = data.options?.minItems || 0;
        
        if (value.length > maxItems) {
          return `Array cannot have more than ${maxItems} items`;
        }
        
        if (value.length < minItems) {
          return `Array must have at least ${minItems} items`;
        }
        
        // Проверка на уникальность если требуется
        if (data.options?.uniqueItems) {
          const uniqueSet = new Set(value);
          if (uniqueSet.size !== value.length) {
            return 'Array items must be unique';
          }
        }
        
        // Проверка каждого элемента если есть схема
        if (data.options?.itemSchema) {
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            // Здесь можно добавить рекурсивную валидацию
            if (typeof item === 'string' && item.length > 1000) {
              return `Item at index ${i} is too long`;
            }
          }
        }
      }
    },
    minItems: {
      type: 'number',
      required: false,
      min: 0,
      default: 0
    },
    maxItems: {
      type: 'number',
      required: false,
      max: 1000,
      default: 100
    },
    uniqueItems: {
      type: 'boolean',
      required: false,
      default: false
    },
    itemSchema: {
      type: 'object',
      required: false
    }
  }
};