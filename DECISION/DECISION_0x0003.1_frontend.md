Система прослоек приложения
Версия: 0x0001
Дата: December 17, 2025
Статус: DRAFT

Текущие прослойки

ThemeLayer — переключение светлой/тёмной темы
LanguageLayer — переключение языков (ru/en)
PlatformLayer — адаптация под web/telegram


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

## LayersProvider.jsx

```jsx
// layers/LayersProvider.jsx

import React from 'react';
import ThemeProvider from './theme/ThemeProvider';
import LanguageProvider from './language/LanguageProvider';

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

### 1: Компонент с темой и переводами
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

