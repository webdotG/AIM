import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LanguageContext from './LanguageContext';
import translations from './translations';

function LanguageProvider({ children, defaultLanguage = 'ru' }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('app_language');
    return saved || defaultLanguage;
  });
  
  // Инициализация при монтировании
  useEffect(() => {
    console.log('LanguageProvider mounted, language:', language);
    document.documentElement.setAttribute('lang', language);
  }, []); // Только при монтировании
  
  const setLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      console.log('Setting language to:', newLanguage);
      setLanguageState(newLanguage);
      localStorage.setItem('app_language', newLanguage);
      document.documentElement.setAttribute('lang', newLanguage);
    } else {
      console.warn(`Language "${newLanguage}" not found`);
    }
  }, []);

  const t = useCallback((key, params = {}) => {
  console.log(`t() called with key: "${key}", language: ${language}`);
  
  // Ищем перевод в текущем языке
  const currentTranslations = translations[language] || translations.ru;
  const keys = key.split('.');
  let value = currentTranslations;
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }
  
  // Если не нашли, ищем в русском как fallback
  if (value === undefined && language !== 'ru') {
    console.log(`Key "${key}" not found in ${language}, trying ru...`);
    let ruValue = translations.ru;
    for (const k of keys) {
      if (ruValue && typeof ruValue === 'object') {
        ruValue = ruValue[k];
      } else {
        ruValue = undefined;
        break;
      }
    }
    value = ruValue;
  }
  
  // Если все еще не нашли
  if (value === undefined) {
    console.warn(`Translation key "${key}" not found in any language`);
    return params.fallback || key.split('.').pop(); // возвращаем последнюю часть ключа
  }
  
  // Заменяем параметры
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }
  
  return value;
}, [language]);

  const value = useMemo(() => ({
    language,
    translations: translations[language] || translations.ru,
    setLanguage,
    t
  }), [language, setLanguage, t]);
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;