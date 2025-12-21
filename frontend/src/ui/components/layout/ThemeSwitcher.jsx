import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import './ThemeSwitcher.css';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  
  return (
    <div className="theme-switcher">
      <label className="theme-switcher-label">
        {t('settings.theme.title')}
      </label>
      
      <div className="theme-switcher-options">
        <button
          className={`theme-option ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
        >
          {t('settings.theme.light')}
        </button>
        
        <button
          className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          {t('settings.theme.dark')}
        </button>
      </div>
    </div>
  );
}

export default ThemeSwitcher;