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