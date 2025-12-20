import React from 'react';

const LanguageContext = React.createContext({
  language: 'ru',
  translations: {},
  setLanguage: () => {},
  t: () => {}
});

export default LanguageContext;