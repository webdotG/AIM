import { useLanguage } from '@/layers/language';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className="language-switcher">
      <label className="language-switcher-label">
        {t('settings.language.title')}
      </label>
      
      <div className="language-switcher-options">
        <button
          className={`language-option ${language === 'ru' ? 'active' : ''}`}
          onClick={() => setLanguage('ru')}
        >
          {t('settings.language.ru')}
        </button>
        
        <button
          className={`language-option ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          {t('settings.language.en')}
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;