LAYERS_DOC.md — Система прослоек приложения
Версия: 0x0001
Дата: December 17, 2025
Статус: DRAFT

Оглавление

Концепция прослоек
Архитектура
Theme Layer (Темы)
Language Layer (i18n)
Структура папок
Интеграция с компонентами
Добавление новых прослоек
Примеры использования


Концепция прослоек
Что такое прослойка?
Прослойка (Layer) — это независимый функциональный слой, который накладывается на всё приложение и изменяет его поведение/внешний вид.
Принципы

Независимость — каждая прослойка работает отдельно
Композиция — прослойки можно комбинировать
Контекст-based — используем React Context API
Глобальность — прослойка влияет на всё приложение
Персистентность — настройки сохраняются (localStorage)

Текущие прослойки

ThemeLayer — переключение светлой/тёмной темы
LanguageLayer — переключение языков (ru/en)

Будущие прослойки (заложены)

AccessibilityLayer — настройки доступности (размер шрифта, контраст)
PlatformLayer — адаптация под web/telegram
FeatureFlagsLayer — включение/выключение фич


Архитектура
src/
├── layers/                    # Прослойки
│   ├── theme/
│   │   ├── ThemeContext.jsx   # Context + Provider
│   │   ├── ThemeProvider.jsx  # Обёртка с логикой
│   │   ├── useTheme.js        # Hook для компонентов
│   │   ├── themes/
│   │   │   ├── light.js       # Светлая тема
│   │   │   ├── dark.js        # Тёмная тема
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── language/
│   │   ├── LanguageContext.jsx
│   │   ├── LanguageProvider.jsx
│   │   ├── useLanguage.js
│   │   ├── translations/
│   │   │   ├── ru.js
│   │   │   ├── en.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   └── LayersProvider.jsx     # Композитор всех прослоек
│
├── ui/
│   └── components/
│       └── settings/
│           ├── ThemeSwitcher/
│           └── LanguageSwitcher/
│
└── platforms/
    └── web/
        └── App.jsx            # Главный компонент

Theme Layer (Темы)
Структура
layers/theme/
├── ThemeContext.jsx      # React Context
├── ThemeProvider.jsx     # Provider с логикой
├── useTheme.js           # Hook
├── themes/
│   ├── light.js          # Светлая тема
│   ├── dark.js           # Тёмная тема
│   └── index.js
└── index.js

ThemeContext.jsx
jsx// layers/theme/ThemeContext.jsx

import React from 'react';

const ThemeContext = React.createContext({
  theme: 'light',
  currentTheme: {},
  setTheme: () => {},
  toggleTheme: () => {}
});

export default ThemeContext;

ThemeProvider.jsx
jsx// layers/theme/ThemeProvider.jsx

import React, { useState, useEffect, useMemo } from 'react';
import ThemeContext from './ThemeContext';
import themes from './themes';

/**
 * ThemeProvider — управление темами приложения
 * 
 * Функции:
 * - Хранение текущей темы
 * - Переключение тем
 * - Сохранение в localStorage
 * - Применение CSS переменных
 */
function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setThemeState] = useState(() => {
    // Пытаемся загрузить из localStorage
    const saved = localStorage.getItem('app_theme');
    return saved || defaultTheme;
  });
  
  // Применяем CSS переменные
  useEffect(() => {
    const currentTheme = themes[theme] || themes.light;
    
    // Применяем каждую CSS переменную
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    
    // Устанавливаем data-theme атрибут (для CSS селекторов)
    document.documentElement.setAttribute('data-theme', theme);
    
  }, [theme]);
  
  // Сохраняем в localStorage
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };
  
  // Переключение между темами
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  const value = useMemo(() => ({
    theme,
    currentTheme: themes[theme] || themes.light,
    setTheme,
    toggleTheme
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;

useTheme.js
jsx// layers/theme/useTheme.js

import { useContext } from 'react';
import ThemeContext from './ThemeContext';

/**
 * Hook для работы с темой в компонентах
 */
function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}

export default useTheme;

themes/light.js
javascript// layers/theme/themes/light.js

const light = {
  name: 'light',
  displayName: 'Светлая',
  colors: {
    // Primary
    'primary': '#007bff',
    'primary-dark': '#0056b3',
    'primary-light': '#66b2ff',
    
    // Background
    'background': '#ffffff',
    'background-secondary': '#f8f9fa',
    'surface': '#ffffff',
    'surface-hover': '#f5f5f5',
    
    // Text
    'text': '#212121',
    'text-secondary': '#757575',
    'text-disabled': '#bdbdbd',
    'text-inverse': '#ffffff',
    
    // Border
    'border': '#e0e0e0',
    'border-hover': '#bdbdbd',
    
    // Emotions
    'positive': '#4CAF50',
    'negative': '#F44336',
    'neutral': '#9E9E9E',
    
    // Entry types
    'dream': '#9C27B0',
    'memory': '#FF9800',
    'thought': '#2196F3',
    'plan': '#4CAF50',
    
    // Status
    'success': '#4CAF50',
    'error': '#F44336',
    'warning': '#FF9800',
    'info': '#2196F3',
    
    // Shadow
    'shadow': 'rgba(0, 0, 0, 0.1)',
    'shadow-hover': 'rgba(0, 0, 0, 0.2)'
  },
  
  // Дополнительные параметры темы
  spacing: {
    unit: 8 // 8px базовый unit
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  },
  
  shadows: {
    small: '0 2px 4px var(--color-shadow)',
    medium: '0 4px 8px var(--color-shadow)',
    large: '0 8px 16px var(--color-shadow)'
  }
};

export default light;

themes/dark.js
javascript// layers/theme/themes/dark.js

const dark = {
  name: 'dark',
  displayName: 'Тёмная',
  colors: {
    // Primary
    'primary': '#66b2ff',
    'primary-dark': '#3d8aff',
    'primary-light': '#99ccff',
    
    // Background
    'background': '#121212',
    'background-secondary': '#1e1e1e',
    'surface': '#1e1e1e',
    'surface-hover': '#2a2a2a',
    
    // Text
    'text': '#ffffff',
    'text-secondary': '#b0b0b0',
    'text-disabled': '#757575',
    'text-inverse': '#121212',
    
    // Border
    'border': '#333333',
    'border-hover': '#4a4a4a',
    
    // Emotions (более приглушённые в тёмной теме)
    'positive': '#66bb6a',
    'negative': '#ef5350',
    'neutral': '#bdbdbd',
    
    // Entry types
    'dream': '#ba68c8',
    'memory': '#ffb74d',
    'thought': '#64b5f6',
    'plan': '#81c784',
    
    // Status
    'success': '#66bb6a',
    'error': '#ef5350',
    'warning': '#ffb74d',
    'info': '#64b5f6',
    
    // Shadow
    'shadow': 'rgba(0, 0, 0, 0.3)',
    'shadow-hover': 'rgba(0, 0, 0, 0.5)'
  },
  
  spacing: {
    unit: 8
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  },
  
  shadows: {
    small: '0 2px 4px var(--color-shadow)',
    medium: '0 4px 8px var(--color-shadow)',
    large: '0 8px 16px var(--color-shadow)'
  }
};

export default dark;

themes/index.js
javascript// layers/theme/themes/index.js

import light from './light';
import dark from './dark';

const themes = {
  light,
  dark
};

export default themes;

// Для добавления новой темы:
// 1. Создай файл newTheme.js
// 2. Импортируй здесь
// 3. Добавь в объект themes
```

---

## Language Layer (i18n)

### Структура
```
layers/language/
├── LanguageContext.jsx
├── LanguageProvider.jsx
├── useLanguage.js
├── translations/
│   ├── ru.js
│   ├── en.js
│   └── index.js
└── index.js

LanguageContext.jsx
jsx// layers/language/LanguageContext.jsx

import React from 'react';

const LanguageContext = React.createContext({
  language: 'ru',
  translations: {},
  setLanguage: () => {},
  t: () => {}
});

export default LanguageContext;

LanguageProvider.jsx
jsx// layers/language/LanguageProvider.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LanguageContext from './LanguageContext';
import translations from './translations';

/**
 * LanguageProvider — управление языками приложения
 * 
 * Функции:
 * - Хранение текущего языка
 * - Переключение языков
 * - Сохранение в localStorage
 * - Функция перевода t()
 */
function LanguageProvider({ children, defaultLanguage = 'ru' }) {
  const [language, setLanguageState] = useState(() => {
    // Пытаемся загрузить из localStorage
    const saved = localStorage.getItem('app_language');
    return saved || defaultLanguage;
  });
  
  // Сохраняем в localStorage
  const setLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguageState(newLanguage);
      localStorage.setItem('app_language', newLanguage);
      
      // Устанавливаем lang атрибут для HTML
      document.documentElement.setAttribute('lang', newLanguage);
    } else {
      console.warn(`Language "${newLanguage}" not found`);
    }
  };
  
  // Функция перевода
  const t = useCallback((key, params = {}) => {
    const currentTranslations = translations[language] || translations.ru;
    
    // Поддержка вложенных ключей: "auth.login.title"
    const keys = key.split('.');
    let value = currentTranslations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    // Если перевод не найден, возвращаем ключ
    if (value === undefined) {
      console.warn(`Translation not found: ${key}`);
      return key;
    }
    
    // Поддержка параметров: "Hello, {name}!"
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }
    
    return value;
  }, [language]);
  
  const value = useMemo(() => ({
    language,
    translations: translations[language] || translations.ru,
    setLanguage,
    t
  }), [language, t]);
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;

useLanguage.js
jsx// layers/language/useLanguage.js

import { useContext } from 'react';
import LanguageContext from './LanguageContext';

/**
 * Hook для работы с переводами в компонентах
 */
function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  
  return context;
}

export default useLanguage;

translations/ru.js
javascript// layers/language/translations/ru.js

const ru = {
  // Common
  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    back: 'Назад',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    confirm: 'Подтвердить',
    search: 'Поиск',
    filter: 'Фильтр',
    noResults: 'Ничего не найдено',
    clearAll: 'Очистить всё'
  },
  
  // Auth
  auth: {
    login: {
      title: 'Вход',
      loginLabel: 'Логин',
      passwordLabel: 'Пароль',
      loginButton: 'Войти',
      registerLink: 'Нет аккаунта? Зарегистрироваться',
      recoverLink: 'Забыли пароль?'
    },
    register: {
      title: 'Регистрация',
      loginLabel: 'Логин',
      passwordLabel: 'Пароль',
      confirmPasswordLabel: 'Повторите пароль',
      registerButton: 'Зарегистрироваться',
      loginLink: 'Уже есть аккаунт? Войти',
      backupCodeInfo: 'Сохраните этот код для восстановления пароля',
      backupCode: 'Backup-код'
    },
    recover: {
      title: 'Восстановление пароля',
      loginLabel: 'Логин',
      backupCodeLabel: 'Backup-код',
      newPasswordLabel: 'Новый пароль',
      recoverButton: 'Восстановить',
      loginLink: 'Вспомнили пароль? Войти'
    }
  },
  
  // Entries
  entries: {
    types: {
      dream: 'Сон',
      memory: 'Воспоминание',
      thought: 'Мысль',
      plan: 'План'
    },
    form: {
      title: 'Создать запись',
      editTitle: 'Редактировать запись',
      typeLabel: 'Тип записи',
      contentLabel: 'Содержание',
      contentPlaceholder: 'Опишите свою мысль, сон или воспоминание...',
      dateLabel: 'Дата события',
      deadlineLabel: 'Дедлайн',
      emotionsLabel: 'Эмоции',
      peopleLabel: 'Люди',
      tagsLabel: 'Теги',
      submit: 'Сохранить',
      cancel: 'Отмена'
    },
    list: {
      title: 'Записи',
      emptyState: 'У вас пока нет записей',
      createFirst: 'Создать первую запись',
      filterByType: 'Фильтр по типу',
      filterByDate: 'Фильтр по дате',
      search: 'Поиск по записям'
    },
    detail: {
      createdAt: 'Создано',
      updatedAt: 'Обновлено',
      emotions: 'Эмоции',
      people: 'Люди',
      tags: 'Теги',
      relations: 'Связи',
      incomingRelations: 'Входящие связи',
      outgoingRelations: 'Исходящие связи',
      noRelations: 'Нет связей',
      createRelation: 'Создать связь'
    }
  },
  
  // Relations
  relations: {
    types: {
      led_to: 'Привело к',
      reminded_of: 'Напомнило о',
      inspired_by: 'Вдохновлено',
      caused_by: 'Вызвано',
      related_to: 'Связано с',
      resulted_in: 'Привело к результату'
    },
    modal: {
      title: 'Создать связь',
      fromEntry: 'От записи',
      toEntry: 'К записи',
      typeLabel: 'Тип связи',
      descriptionLabel: 'Описание',
      descriptionPlaceholder: 'Опишите связь между записями...',
      submit: 'Создать',
      cancel: 'Отмена'
    }
  },
  
  // Emotions
  emotions: {
    categories: {
      positive: 'Позитивные',
      negative: 'Негативные',
      neutral: 'Нейтральные'
    },
    picker: {
      title: 'Выберите эмоции',
      search: 'Поиск эмоций',
      intensity: 'Интенсивность',
      noEmotions: 'Эмоции не выбраны',
      maxEmotions: 'Максимум {max} эмоций'
    },
    list: {
      admiration: 'Восхищение',
      adoration: 'Обожание',
      aesthetic_appreciation: 'Эстетическое наслаждение',
      amusement: 'Веселье',
      anger: 'Гнев',
      anxiety: 'Тревога',
      awe: 'Благоговение',
      awkwardness: 'Неловкость',
      boredom: 'Скука',
      calmness: 'Спокойствие',
      confusion: 'Замешательство',
      craving: 'Жажда',
      disgust: 'Отвращение',
      empathic_pain: 'Эмпатическая боль',
      entrancement: 'Завороженность',
      excitement: 'Возбуждение',
      fear: 'Страх',
      horror: 'Ужас',
      interest: 'Интерес',
      joy: 'Радость',
      nostalgia: 'Ностальгия',
      relief: 'Облегчение',
      romance: 'Романтика',
      sadness: 'Грусть',
      satisfaction: 'Удовлетворение',
      sexual_desire: 'Сексуальное влечение',
      surprise: 'Удивление'
    }
  },
  
  // People
  people: {
    categories: {
      family: 'Родные',
      friends: 'Друзья',
      acquaintances: 'Знакомые',
      strangers: 'Случайные'
    },
    form: {
      nameLabel: 'Имя',
      namePlaceholder: 'Введите имя',
      categoryLabel: 'Категория',
      relationshipLabel: 'Отношение',
      relationshipPlaceholder: 'Кто для вас этот человек',
      birthDateLabel: 'Дата рождения',
      bioLabel: 'Биография',
      bioPlaceholder: 'Краткая информация о человеке',
      notesLabel: 'Заметки',
      notesPlaceholder: 'Ваши заметки'
    }
  },
  
  // Settings
  settings: {
    title: 'Настройки',
    theme: {
      title: 'Тема',
      light: 'Светлая',
      dark: 'Тёмная'
    },
    language: {
      title: 'Язык',
      ru: 'Русский',
      en: 'English'
    },
    account: {
      title: 'Аккаунт',
      logout: 'Выйти'
    }
  }
};

export default ru;

translations/en.js
javascript// layers/language/translations/en.js

const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    noResults: 'No results found',
    clearAll: 'Clear all'
  },
  
  // Auth
  auth: {
    login: {
      title: 'Login',
      loginLabel: 'Login',
      passwordLabel: 'Password',
      loginButton: 'Log in',
      registerLink: "Don't have an account? Register",
      recoverLink: 'Forgot password?'
    },
    register: {
      title: 'Register',
      loginLabel: 'Login',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm password',
      registerButton: 'Register',
      loginLink: 'Already have an account? Log in',
      backupCodeInfo: 'Save this code for password recovery',
      backupCode: 'Backup code'
    },
    recover: {
      title: 'Password recovery',
      loginLabel: 'Login',
      backupCodeLabel: 'Backup code',
      newPasswordLabel: 'New password',
      recoverButton: 'Recover',
      loginLink: 'Remember password? Log in'
    }
  },
  
  // Entries
  entries: {
    types: {
      dream: 'Dream',
      memory: 'Memory',
      thought: 'Thought',
      plan: 'Plan'
    },
    form: {
      title: 'Create entry',
      editTitle: 'Edit entry',
      typeLabel: 'Entry type',
      contentLabel: 'Content',
      contentPlaceholder: 'Describe your thought, dream or memory...',
      dateLabel: 'Event date',
      deadlineLabel: 'Deadline',
      emotionsLabel: 'Emotions',
      peopleLabel: 'People',
      tagsLabel: 'Tags',
      submit: 'Save',
      cancel: 'Cancel'
    },
    list: {
      title: 'Entries',
      emptyState: 'You have no entries yet',
      createFirst: 'Create first entry',
      filterByType: 'Filter by type',
      filterByDate: 'Filter by date',
      search: 'Search entries'
    },
    detail: {
      createdAt: 'Created',
      updatedAt: 'Updated',
      emotions: 'Emotions',
      people: 'People',
      tags: 'Tags',
      relations: 'Relations',
      incomingRelations: 'Incoming relations',
      outgoingRelations: 'Outgoing relations',
      noRelations: 'No relations',
      createRelation: 'Create relation'
    }
  },
  
  // Relations
  relations: {
    types: {
      led_to: 'Led to',
      reminded_of: 'Reminded of',
      inspired_by: 'Inspired by',
      caused_by: 'Caused by',
      related_to: 'Related to',
      resulted_in: 'Resulted in'
    },
    modal: {
      title: 'Create relation',
      fromEntry: 'From entry',
      toEntry: 'To entry',
      typeLabel: 'Relation type',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Describe the relation between entries...',
      submit: 'Create',
      cancel: 'Cancel'
    }
  },
  
  // Emotions
  emotions: {
    categories: {
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral'
    },
    picker: {
      title: 'Select emotions',
      search: 'Search emotions',
      intensity: 'Intensity',
      noEmotions: 'No emotions selected',
      maxEmotions: 'Maximum {max} emotions'
    },
    list: {
      admiration: 'Admiration',
      adoration: 'Adoration',
      aesthetic_appreciation: 'Aesthetic appreciation',
      amusement: 'Amusement',
      anger: 'Anger',
      anxiety: 'Anxiety',
      awe: 'Awe',
      awkwardness: 'Awkwardness',
      boredom: 'Boredom',
      calmness: 'Calmness',
      confusion: 'Confusion',
      craving: 'Craving',
      disgust: 'Disgust',
      empathic_pain: 'Empathic pain',
      entrancement: 'Entrancement',
      excitement: 'Excitement',
      fear: 'Fear',
      horror: 'Horror',
      interest: 'Interest',
      joy: 'Joy',
      nostalgia: 'Nostalgia',
      relief: 'Relief',
      romance: 'Romance',
      sadness: 'Sadness',
      satisfaction: 'Satisfaction',
      sexual_desire: 'Sexual desire',
      surprise: 'Surprise'
    }
  },
  
  // People
  people: {
    categories: {
      family: 'Family',
      friends: 'Friends',
      acquaintances: 'Acquaintances',
      strangers: 'Strangers'
    },
    form: {
      nameLabel: 'Name',
      namePlaceholder: 'Enter name',
      categoryLabel: 'Category',
      relationshipLabel: 'Relationship',
      relationshipPlaceholder: 'Who is this person to you',
      birthDateLabel: 'Birth date',
      bioLabel: 'Biography',
      bioPlaceholder: 'Brief information about the person',
      notesLabel: 'Notes',
      notesPlaceholder: 'Your notes'
    }
  },
  
  // Settings
  settings: {
    title: 'Settings',
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark'
    },
    language: {
      title: 'Language',
      ru: 'Русский',
      en: 'English'
    },
    account: {
      title: 'Account',
      logout: 'Log out'
    }
  }
};

export default en;

translations/index.js
javascript// layers/language/translations/index.js

import ru from './ru';
import en from './en';

const translations = {
  ru,
  en
};

export default translations;

// Для добавления нового языка:
// 1. Создай файл fr.js (например)
// 2. Импортируй здContinue11:22 PMесь
// 3. Добавь в объект translations

---

## LayersProvider.jsx

### Композитор всех прослоек
```jsx
// layers/LayersProvider.jsx

import React from 'react';
import ThemeProvider from './theme/ThemeProvider';
import LanguageProvider from './language/LanguageProvider';

/**
 * LayersProvider — композитор всех прослоек
 * 
 * Оборачивает приложение всеми необходимыми прослойками.
 * Порядок важен: более общие прослойки снаружи.
 */
function LayersProvider({ children }) {
  return (
    <LanguageProvider defaultLanguage="ru">
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default LayersProvider;
```

---

## Интеграция с компонентами

### ThemeSwitcher
```jsx
// ui/components/settings/ThemeSwitcher/ThemeSwitcher.jsx

import React from 'react';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import styles from './ThemeSwitcher.module.css';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div className={styles.switcher}>
      <label className={styles.label}>
        {t('settings.theme.title')}
      </label>
      
      <div className={styles.options}>
        <button
          className={theme === 'light' ? styles.active : ''}
          onClick={() => setTheme('light')}
        >
          {t('settings.theme.light')}
        </button>
        
        <button
          className={theme === 'dark' ? styles.active : ''}
          onClick={() => setTheme('dark')}
        >
          {t('settings.theme.dark')}
        </button>
      </div>
    </div>
  );
}

export default ThemeSwitcher;
```

---

### LanguageSwitcher
```jsx
// ui/components/settings/LanguageSwitcher/LanguageSwitcher.jsx

import React from 'react';
import { useLanguage } from '@/layers/language';
import styles from './LanguageSwitcher.module.css';

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className={styles.switcher}>
      <label className={styles.label}>
        {t('settings.language.title')}
      </label>
      
      <div className={styles.options}>
        <button
          className={language === 'ru' ? styles.active : ''}
          onClick={() => setLanguage('ru')}
        >
          {t('settings.language.ru')}
        </button>
        
        <button
          className={language === 'en' ? styles.active : ''}
          onClick={() => setLanguage('en')}
        >
          {t('settings.language.en')}
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
```

---

## Примеры использования

### Пример 1: Компонент с темой и переводами
```jsx
// ui/components/entries/EntryCard/EntryCard.jsx

import React from 'react';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import styles from './EntryCard.module.css';

function EntryCard({ entry, onClick }) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div 
      className={styles.card}
      onClick={onClick}
      style={{
        backgroundColor: `var(--color-surface)`,
        borderColor: `var(--color-${entry.type})`
      }}
    >
      <div className={styles.header}>
        <span className={styles.type}>
          {t(`entries.types.${entry.type}`)}
        </span>
        <span className={styles.date}>
          {entry.createdAt.toLocaleDateString()}
        </span>
      </div>
      
      <div className={styles.content}>
        {entry.content}
      </div>
      
      {entry.emotions.length > 0 && (
        <div className={styles.emotions}>
          {entry.emotions.map(({ emotion, intensity }) => (
            <span 
              key={emotion.id}
              className={styles.emotion}
              style={{
                backgroundColor: `var(--color-${emotion.category})`
              }}
            >
              {t(`emotions.list.${emotion.nameEn}`)} ({intensity}/10)
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default EntryCard;
```

---

### Пример 2: Использование в App.jsx
```jsx
// platforms/web/App.jsx

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import LayersProvider from '@/layers/LayersProvider';
import MainLayout from '@/ui/layouts/MainLayout';
import TimelinePage from '@/ui/pages/entries/TimelinePage';

function App() {
  return (
    <LayersProvider>
      <BrowserRouter>
        <MainLayout>
          <TimelinePage />
        </MainLayout>
      </BrowserRouter>
    </LayersProvider>
  );
}

export default App;
```

---

## Добавление новых прослоек

### Шаблон новой прослойки
layers/newLayer/
├── NewLayerContext.jsx
├── NewLayerProvider.jsx
├── useNewLayer.js
└── index.js

### Пример: AccessibilityLayer
```jsx
// layers/accessibility/AccessibilityProvider.jsx

function AccessibilityProvider({ children }) {
  const [fontSize, setFontSize] = useState('medium'); // small/medium/large
  const [highContrast, setHighContrast] = useState(false);
  
  useEffect(() => {
    // Применяем настройки
    document.documentElement.style.setProperty(
      '--base-font-size',
      fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'
    );
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [fontSize, highContrast]);
  
  // ...
}
```

### Добавление в LayersProvider
```jsx
// layers/LayersProvider.jsx

function LayersProvider({ children }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
```

---

## Чеклист для новой прослойки

- [ ] Создать Context
- [ ] Создать Provider с логикой
- [ ] Создать hook (useLayerName)
- [ ] Добавить сохранение в localStorage
- [ ] Добавить в LayersProvider
- [ ] Создать компонент настроек (Switcher)
- [ ] Задокументировать

