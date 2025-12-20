export default {
  // Общий поиск
  general: {
    query: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100,
      validate: (value) => {
        // Проверка на поисковый спам/инъекции
        const dangerousPatterns = [
          /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/i,
          /(--|\/\*|\*\/|;)/,
          /(\$where|\$gt|\$lt|\$ne)/,
          /(<script|javascript:)/i
        ];
        
        if (dangerousPatterns.some(pattern => pattern.test(value))) {
          return 'Search query contains suspicious patterns';
        }
        
        // Слишком много спецсимволов
        const specialCharCount = (value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
        if (specialCharCount > value.length * 0.3) {
          return 'Search query contains too many special characters';
        }
      }
    },
    page: {
      type: 'number',
      required: false,
      min: 1,
      max: 100,
      default: 1
    },
    limit: {
      type: 'number',
      required: false,
      min: 1,
      max: 100,
      default: 20
    },
    sortBy: {
      type: 'string',
      required: false,
      enum: ['relevance', 'date', 'title', 'popularity'],
      default: 'relevance'
    },
    filters: {
      type: 'object',
      required: false,
      validate: (value) => {
        // Ограничение глубины вложенности
        const jsonString = JSON.stringify(value);
        const depth = (jsonString.match(/{/g) || []).length;
        if (depth > 5) {
          return 'Filter nesting too deep';
        }
        
        // Ограничение размера
        if (jsonString.length > 1000) {
          return 'Filter too large';
        }
      }
    }
  },

  // Расширенный поиск
  advanced: {
    keywords: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 200
    },
    exactPhrase: {
      type: 'string',
      required: false,
      maxLength: 100
    },
    excludeWords: {
      type: 'array',
      required: false,
      maxItems: 10,
      items: {
        type: 'string',
        maxLength: 50
      }
    },
    dateRange: {
      type: 'object',
      required: false,
      validate: (value) => {
        if (value) {
          const { from, to } = value;
          const fromDate = new Date(from);
          const toDate = new Date(to);
          const now = new Date();
          
          if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return 'Invalid date range';
          }
          
          if (fromDate > toDate) {
            return 'From date cannot be after to date';
          }
          
          if (fromDate > now) {
            return 'From date cannot be in the future';
          }
          
          // Максимальный диапазон - 1 год
          const oneYearMs = 365 * 24 * 60 * 60 * 1000;
          if (toDate - fromDate > oneYearMs) {
            return 'Date range cannot exceed 1 year';
          }
        }
      }
    },
    contentType: {
      type: 'array',
      required: false,
      maxItems: 5,
      items: {
        type: 'string',
        enum: ['article', 'news', 'blog', 'document', 'image', 'video']
      }
    },
    minRelevance: {
      type: 'number',
      required: false,
      min: 0,
      max: 100,
      default: 0
    },
    language: {
      type: 'string',
      required: false,
      pattern: /^[a-z]{2}(-[A-Z]{2})?$/
    }
  },

  // Автодополнение поиска
  autocomplete: {
    query: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 50,
      validate: (value) => {
        // Запретить потенциально опасные запросы
        const dangerousQueries = [
          'admin', 'root', 'password', 'secret', 'token', 'key',
          '../', '..\\', 'file://', 'http://localhost'
        ];
        
        if (dangerousQueries.some(dq => value.toLowerCase().includes(dq))) {
          return 'Query contains restricted terms';
        }
      }
    },
    limit: {
      type: 'number',
      required: false,
      min: 1,
      max: 20,
      default: 10
    },
    source: {
      type: 'string',
      required: false,
      enum: ['titles', 'tags', 'users', 'all'],
      default: 'all'
    }
  },

  // Поиск пользователей
  users: {
    username: {
      type: 'string',
      required: false,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_.-]+$/
    },
    email: {
      type: 'string',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    role: {
      type: 'string',
      required: false,
      enum: ['user', 'moderator', 'admin']
    },
    isActive: {
      type: 'boolean',
      required: false
    },
    createdAfter: {
      type: 'date',
      required: false
    },
    limit: {
      type: 'number',
      required: false,
      min: 1,
      max: 50,
      default: 20
    }
  },

  // Поиск по тегам
  tags: {
    tag: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_\-.#]+$/
    },
    minCount: {
      type: 'number',
      required: false,
      min: 0,
      default: 1
    },
    sortBy: {
      type: 'string',
      required: false,
      enum: ['name', 'count', 'recent'],
      default: 'count'
    }
  }
};