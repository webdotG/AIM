import React, { useState, useEffect, useMemo } from 'react';
import ThemeContext from './ThemeContext';
import themes from './themes';

function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved || defaultTheme;
  });
  
  // CSS переменные
  useEffect(() => {
    const currentTheme = themes[theme] || themes.light;
    
    // все цвета как CSS переменные
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        // Вложенные объекты (text, brand)
        Object.entries(value).forEach(([subKey, subValue]) => {
          document.documentElement.style.setProperty(
            `--color-${key}-${subKey}`,
            subValue
          );
        });
      } else {
        // Простые значения
        document.documentElement.style.setProperty(`--color-${key}`, value);
      }
    });
    
    // Устанавливаем data-theme атрибут
    document.documentElement.setAttribute('data-theme', theme);
    
  }, [theme]);
  
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };
  
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