import { useLanguage } from '@/layers/language';
import styles from './LanguageSwitcher.module.css';

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div className={styles.switcher}>
      <label className={styles.label}>
        {t('settings.language.title')}
      </label>
      
      <div className={styles.options}>
        <button
          className={language === 'ru' ? styles.active : ''}
          onClick={() => setLanguage('ru')}
        >
          {t('settings.language.ru')}
        </button>
        
        <button
          className={language === 'en' ? styles.active : ''}
          onClick={() => setLanguage('en')}
        >
          {t('settings.language.en')}
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;