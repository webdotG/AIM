// src/ui/layouts/Header/Header.jsx
import React from 'react';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';

const Header = () => {
  const { theme, setTheme, currentTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header style={{
      padding: '20px',
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <h1 style={{ 
          margin: 0,
          color: 'var(--color-primary)',
          fontSize: '24px'
        }}>
          AIM
        </h1>
        <span style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          padding: '4px 8px',
          backgroundColor: 'var(--color-background)',
          borderRadius: '4px'
        }}>
          v0.1.0
        </span>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {t('settings.theme.title')}:
          </span>
          <div style={{ 
            display: 'flex',
            backgroundColor: 'var(--color-background)',
            borderRadius: '20px',
            padding: '4px',
            border: '1px solid var(--color-border)'
          }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: 'none',
                background: theme === 'light' ? 'var(--color-primary)' : 'transparent',
                color: theme === 'light' ? 'white' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ☀️ {t('settings.theme.light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: 'none',
                background: theme === 'dark' ? 'var(--color-primary)' : 'transparent',
                color: theme === 'dark' ? 'white' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🌙 {t('settings.theme.dark')}
            </button>
          </div>
        </div>

        {/* Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {t('settings.language.title')}:
          </span>
          <div style={{ 
            display: 'flex',
            backgroundColor: 'var(--color-background)',
            borderRadius: '20px',
            padding: '4px',
            border: '1px solid var(--color-border)'
          }}>
            <button
              onClick={() => setLanguage('ru')}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: 'none',
                background: language === 'ru' ? 'var(--color-primary)' : 'transparent',
                color: language === 'ru' ? 'white' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🇷🇺 {t('settings.language.ru')}
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: 'none',
                background: language === 'en' ? 'var(--color-primary)' : 'transparent',
                color: language === 'en' ? 'white' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🇺🇸 {t('settings.language.en')}
            </button>
            <button
              onClick={() => setLanguage('fr')}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: 'none',
                background: language === 'fr' ? 'var(--color-primary)' : 'transparent',
                color: language === 'fr' ? 'white' : 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🇫🇷 {t('settings.language.fr')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;