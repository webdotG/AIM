import { useContext } from 'react';
import LanguageContext from './LanguageContext';

function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  
  // Добавьте для дебага
  if (process.env.NODE_ENV === 'development') {
    console.log('useLanguage context:', {
      language: context.language,
      hasT: !!context.t,
      translationKeys: Object.keys(context.translations || {})
    });
  }
  
  return context;
}
export default useLanguage;