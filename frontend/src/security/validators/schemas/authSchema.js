export default {
  // Регистрация пользователя
  register: {
    username: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9_\-\.]+$/,
      validate: (value) => {
        if (value.includes('admin') || value.includes('root')) {
          return 'Username cannot contain reserved words';
        }
      }
    },
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 100,
      validate: async (value) => {
        // Можно добавить проверку на disposable email
        const disposableDomains = ['temp-mail.org', 'guerrillamail.com'];
        const domain = value.split('@')[1];
        if (disposableDomains.includes(domain)) {
          return 'Disposable email addresses are not allowed';
        }
      }
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
      maxLength: 100,
      validate: (value) => {
        const errors = [];
        
        if (!/[A-Z]/.test(value)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(value)) {
          errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(value)) {
          errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.push('Password must contain at least one special character');
        }
        
        // Проверка на common passwords
        const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
        if (commonPasswords.includes(value.toLowerCase())) {
          errors.push('Password is too common');
        }
        
        return errors.length > 0 ? errors : null;
      }
    },
    confirmPassword: {
      type: 'string',
      required: true,
      validate: (value, data) => {
        if (value !== data.password) {
          return 'Passwords do not match';
        }
      }
    },
    firstName: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/
    },
    lastName: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/
    },
    agreeToTerms: {
      type: 'boolean',
      required: true,
      validate: (value) => {
        if (!value) {
          return 'You must agree to the terms and conditions';
        }
      }
    }
  },

  // Логин
  login: {
    usernameOrEmail: {
      type: 'string',
      required: true,
      maxLength: 100
    },
    password: {
      type: 'string',
      required: true,
      maxLength: 100
    },
    rememberMe: {
      type: 'boolean',
      required: false,
      default: false
    }
  },

  // Сброс пароля
  resetPassword: {
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    token: {
      type: 'string',
      required: true,
      pattern: /^[a-f0-9]{32}$/
    },
    newPassword: {
      type: 'string',
      required: true,
      minLength: 8,
      maxLength: 100
    },
    confirmPassword: {
      type: 'string',
      required: true,
      validate: (value, data) => {
        if (value !== data.newPassword) {
          return 'Passwords do not match';
        }
      }
    }
  },

  // Смена пароля
  changePassword: {
    currentPassword: {
      type: 'string',
      required: true,
      maxLength: 100
    },
    newPassword: {
      type: 'string',
      required: true,
      minLength: 8,
      maxLength: 100,
      validate: (value, data) => {
        if (value === data.currentPassword) {
          return 'New password must be different from current password';
        }
      }
    },
    confirmPassword: {
      type: 'string',
      required: true,
      validate: (value, data) => {
        if (value !== data.newPassword) {
          return 'Passwords do not match';
        }
      }
    }
  },

  // Обновление профиля
  updateProfile: {
    firstName: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/
    },
    lastName: {
      type: 'string',
      required: false,
      maxLength: 50,
      pattern: /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/
    },
    email: {
      type: 'string',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      validate: async (value) => {
        if (value) {
          // Проверка на изменение email
          // Может потребовать подтверждение
        }
      }
    },
    bio: {
      type: 'string',
      required: false,
      maxLength: 500
    },
    avatar: {
      type: 'string',
      required: false,
      pattern: /^data:image\/(png|jpeg|jpg|gif);base64,/
    }
  },

  // JWT токены
  jwt: {
    accessToken: {
      type: 'string',
      required: true,
      pattern: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
    },
    refreshToken: {
      type: 'string',
      required: true,
      pattern: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
    }
  }
};