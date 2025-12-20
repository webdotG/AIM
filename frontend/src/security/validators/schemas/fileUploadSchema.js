export default {
  // Загрузка файлов
  upload: {
    file: {
      type: 'object',
      required: true,
      validate: (value) => {
        if (!value.originalname || !value.buffer || !value.mimetype || !value.size) {
          return 'Invalid file object';
        }
        
        // Проверка размера файла (макс 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (value.size > maxSize) {
          return `File size exceeds ${maxSize} bytes`;
        }
        
        // Проверка MIME типа
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (!allowedMimes.includes(value.mimetype)) {
          return `Unsupported file type: ${value.mimetype}`;
        }
      }
    },
    purpose: {
      type: 'string',
      required: true,
      enum: ['avatar', 'document', 'image', 'attachment', 'logo']
    },
    maxDimensions: {
      type: 'object',
      required: false,
      validate: (value) => {
        if (value && (value.width || value.height)) {
          if (value.width && (typeof value.width !== 'number' || value.width > 5000)) {
            return 'Invalid width dimension';
          }
          if (value.height && (typeof value.height !== 'number' || value.height > 5000)) {
            return 'Invalid height dimension';
          }
        }
      }
    },
    allowedExtensions: {
      type: 'array',
      required: false,
      items: {
        type: 'string',
        pattern: /^[a-zA-Z0-9]{1,5}$/
      }
    }
  },

  // Загрузка изображений (специфичная схема)
  image: {
    file: {
      type: 'object',
      required: true,
      validate: (value) => {
        const allowedImageTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml'
        ];
        
        if (!allowedImageTypes.includes(value.mimetype)) {
          return 'File must be an image (JPEG, PNG, GIF, WebP, SVG)';
        }
        
        // Проверка на вредоносные изображения
        const signature = value.buffer.slice(0, 4).toString('hex');
        const validSignatures = {
          'ffd8ffe0': 'jpg',
          '89504e47': 'png',
          '47494638': 'gif',
          '52494646': 'webp',
          '3c737667': 'svg'
        };
        
        if (!Object.keys(validSignatures).some(sig => signature.startsWith(sig))) {
          return 'Invalid image file signature';
        }
      }
    },
    maxWidth: {
      type: 'number',
      required: false,
      min: 1,
      max: 5000,
      default: 1920
    },
    maxHeight: {
      type: 'number',
      required: false,
      min: 1,
      max: 5000,
      default: 1080
    },
    maxFileSize: {
      type: 'number',
      required: false,
      min: 1024, // 1KB
      max: 10485760, // 10MB
      default: 5242880 // 5MB
    },
    compress: {
      type: 'boolean',
      required: false,
      default: true
    },
    maintainAspectRatio: {
      type: 'boolean',
      required: false,
      default: true
    }
  },

  // Загрузка документов
  document: {
    file: {
      type: 'object',
      required: true,
      validate: (value) => {
        const allowedDocTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv'
        ];
        
        if (!allowedDocTypes.includes(value.mimetype)) {
          return 'Unsupported document type';
        }
        
        // Дополнительная проверка для PDF
        if (value.mimetype === 'application/pdf') {
          const pdfHeader = value.buffer.slice(0, 5).toString();
          if (pdfHeader !== '%PDF-') {
            return 'Invalid PDF file';
          }
        }
        
        // Проверка на макросы в Office файлах
        if (value.mimetype.includes('msword') || value.mimetype.includes('excel')) {
          const macroPattern = /Macro|VBA|VBProject/i;
          if (macroPattern.test(value.buffer.toString('utf8', 0, 1000))) {
            return 'File contains macros which are not allowed';
          }
        }
      }
    },
    maxPages: {
      type: 'number',
      required: false,
      min: 1,
      max: 100,
      default: 50
    },
    passwordProtected: {
      type: 'boolean',
      required: false,
      validate: (value, data) => {
        if (value === true) {
          return 'Password protected documents are not allowed';
        }
      }
    }
  },

  // Аватар пользователя
  avatar: {
    file: {
      type: 'object',
      required: true,
      validate: (value) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(value.mimetype)) {
          return 'Avatar must be JPEG, PNG, GIF or WebP';
        }
        
        if (value.size > 2 * 1024 * 1024) { // 2MB
          return 'Avatar size must be less than 2MB';
        }
        
        // Базовые проверки на содержимое
        const buffer = value.buffer;
        if (buffer.length < 100) {
          return 'File is too small to be a valid image';
        }
      }
    },
    crop: {
      type: 'object',
      required: false,
      validate: (value) => {
        if (value) {
          const { x, y, width, height } = value;
          if (typeof x !== 'number' || typeof y !== 'number' || 
              typeof width !== 'number' || typeof height !== 'number') {
            return 'Invalid crop parameters';
          }
          
          if (width <= 0 || height <= 0) {
            return 'Crop dimensions must be positive';
          }
          
          if (width < 50 || height < 50) {
            return 'Crop dimensions too small (min 50x50)';
          }
          
          if (width > 1000 || height > 1000) {
            return 'Crop dimensions too large (max 1000x1000)';
          }
        }
      }
    },
    square: {
      type: 'boolean',
      required: false,
      default: true
    }
  }
};