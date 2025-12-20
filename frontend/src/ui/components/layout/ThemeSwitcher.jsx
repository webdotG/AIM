import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import styles from './ThemeSwitcher.module.css';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div className={styles.switcher}>
      <label className={styles.label}>
        {t('settings.theme.title')}
      </label>
      
      <div className={styles.options}>
        <button
          className={theme === 'light' ? styles.active : ''}
          onClick={() => setTheme('light')}
        >
          {t('settings.theme.light')}
        </button>
        
        <button
          className={theme === 'dark' ? styles.active : ''}
          onClick={() => setTheme('dark')}
        >
          {t('settings.theme.dark')}
        </button>
      </div>
    </div>
  );
}

export default ThemeSwitcher;