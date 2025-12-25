import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/layers/language';
// import './Switcher.css';
import './Header.css';


const AVAILABLE_LANGUAGES = [
  { code: 'ru', label: 'Русский', shortLabel: 'RU' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' }
];

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Получаем короткую метку текущего языка
  const getCurrentLanguageLabel = () => {
    const current = AVAILABLE_LANGUAGES.find(lang => lang.code === language);
    return current?.shortLabel || language.toUpperCase();
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
  
  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };
  
  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('settings.language.title') || 'Язык'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="switcher-button-label">
          {getCurrentLanguageLabel()}
        </span>
        <span className="switcher-button-arrow">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="switcher-dropdown">
          {AVAILABLE_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`dropdown-option ${language === lang.code ? 'selected' : ''}`}
              aria-current={language === lang.code ? 'true' : 'false'}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;