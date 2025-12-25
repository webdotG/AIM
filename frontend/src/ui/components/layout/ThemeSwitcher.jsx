import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
// import './Switcher.css';
import './Header.css';

const ThemeSwitcher = () => {
  const { theme, setTheme, themes: availableThemes } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Получаем метку текущей темы
  const getCurrentThemeLabel = () => {
    const currentTheme = availableThemes.find(t => t.name === theme);
    return currentTheme?.label || theme.toUpperCase();
  };
  
  // Обработчик клика вне дропдауна
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleThemeSelect = (themeName) => {
    setTheme(themeName);
    setIsOpen(false);
  };
  
  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button
        className="switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('settings.theme.title') || 'Тема'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="switcher-button-label">
          {getCurrentThemeLabel()}
        </span>
        <span className="switcher-button-arrow">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="switcher-dropdown">
          {availableThemes.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => handleThemeSelect(themeOption.name)}
              className={`dropdown-option ${theme === themeOption.name ? 'selected' : ''}`}
              aria-current={theme === themeOption.name ? 'true' : 'false'}
            >
              {themeOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;