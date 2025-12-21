// src/ui/components/layout/Header.jsx
import React, { useState } from 'react';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import SearchBar from './SearchBar'; // ← НОВЫЙ ИМПОРТ
import './Header.css';

const Header = () => {
  const { theme, setTheme, themes: availableThemes } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-brand">
          <h1 className="header-title">AIM</h1>
          <span className="header-version">v0.1.0</span>
        </div>
        
        {/* ПОИСК - добавляем вместо старого поиска */}
        <SearchBar />
      </div>

      <div className="header-right">
        {/* Theme Switcher */}
        <div className="theme-switcher">
          <span className="switcher-label">
            {t('settings.theme.title')}:
          </span>
          <div className="switcher-buttons">
            {availableThemes.map((themeOption) => (
              <button
                key={themeOption.name}
                onClick={() => setTheme(themeOption.name)}
                className={`theme-button ${theme === themeOption.name ? 'active' : ''}`}
                title={themeOption.label}
              >
                {themeOption.name === 'light' && '🌞'}
                {themeOption.name === 'dark' && '🌙'}
                {themeOption.name === 'darling' && '❤️'}
              </button>
            ))}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="language-switcher">
          <span className="switcher-label">
            {t('settings.language.title')}:
          </span>
          <div className="switcher-buttons">
            <button
              onClick={() => setLanguage('ru')}
              className={`language-button ${language === 'ru' ? 'active' : ''}`}
            >
              🇷🇺
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`language-button ${language === 'en' ? 'active' : ''}`}
            >
              🇺🇸
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`language-button ${language === 'fr' ? 'active' : ''}`}
            >
              🇫🇷
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;