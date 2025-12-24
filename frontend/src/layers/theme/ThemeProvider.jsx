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

    // ok.css автоматически применит нужные переменные
    document.documentElement.setAttribute('data-theme', themeName);
    
    // класс для body (опционально, для дополнительной стилизации)
    document.body.className = `theme-${themeName}`;
    
    console.log(`Тема "${currentTheme.label}" (${themeName}) применена`);
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