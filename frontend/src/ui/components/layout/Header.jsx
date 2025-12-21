import React, { useState } from 'react';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import './Header.css';

const Header = () => {
  const { theme, setTheme, themes: availableThemes } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Поиск:', searchQuery);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">AIM</h1>
        <span className="header-version">v0.1.0</span>
        
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={t('common.search') || 'Поиск...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
      </div>

      <div className="header-right">
        {/* Theme Switcher - теперь 3 темы */}
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
                {themeOption.name === 'light' && 'L'}
                {themeOption.name === 'dark' && 'D'}
                {themeOption.name === 'darling' && 'LD'}
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
              ru
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`language-button ${language === 'en' ? 'active' : ''}`}
            >
              en
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`language-button ${language === 'fr' ? 'active' : ''}`}
            >
              fr
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;