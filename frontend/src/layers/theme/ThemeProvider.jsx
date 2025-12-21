import React, { useState, useEffect } from 'react';
import ThemeContext from './ThemeContext';
import themes from './themes';

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const currentTheme = themes[themeName] || themes.light;

  useEffect(() => {

    localStorage.setItem('theme', themeName);
    
    const root = document.documentElement;
    
    // Очищаем предыдущие переменные
    Object.keys(themes).forEach(theme => {
      const themeColors = themes[theme].colors;
      Object.keys(themeColors).forEach(color => {
        root.style.removeProperty(color);
      });
    });
    
    // Устанавливаем новые переменные
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Добавляем класс темы для body (опционально)
    document.body.className = `theme-${themeName}`;
    
    console.log(`Тема "${currentTheme.label}" применена`);
  }, [themeName, currentTheme]);

  const setTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
    } else {
      console.warn(`Тема "${name}" не найдена, используем "light"`);
      setThemeName('light');
    }
  };

  const value = {
    theme: themeName,
    themeData: currentTheme,
    setTheme,
    themes: Object.values(themes).map(t => ({ 
      name: t.name, 
      label: t.label 
    }))
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};