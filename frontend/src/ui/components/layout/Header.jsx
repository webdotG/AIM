import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import './Header.css';
import WebNavigation from './WebNavigation';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">AIM</h1>
        <span className="header-version">v0.1.0</span>

      <WebNavigation/>
      </div>


      <div className="header-right">
        {/* Theme Switcher */}
        <div className="theme-switcher">
          <span className="switcher-label">
            {t('settings.theme.title')}:
          </span>
          <div className="switcher-buttons">
            <button
              onClick={() => setTheme('light')}
              className={`theme-button ${theme === 'light' ? 'active' : ''}`}
            >
            {t('settings.theme.light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
            >
              {t('settings.theme.dark')}
            </button>
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
              {t('settings.language.ru')}
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`language-button ${language === 'en' ? 'active' : ''}`}
            >
              {t('settings.language.en')}
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`language-button ${language === 'fr' ? 'active' : ''}`}
            >
              {t('settings.language.fr')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;