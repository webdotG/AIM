import { useLanguage } from "../../../layers/language";
import { useTheme } from "../../../layers/theme";


export default function SettingsPage() {
  const { t } = useLanguage();
  const { currentTheme, setTheme, themes } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="settings-page">
      
      <div className="settings-container">
        <section className="settings-section">
          <h2>{t('settings.profile.title')}</h2>
          <div className="settings-item">
            <label>{t('settings.profile.login')}</label>
            <span>{user.login}</span>
          </div>
        </section>

        <section className="settings-section">
          <h2>{t('settings.interface.title')}</h2>
          {/* Тема */}
          {/* Язык */}
        </section>

        <section className="settings-section">
          <h2>{t('settings.data.title')}</h2>
          {/* Статистика через /api/v1/analytics/stats */}
        </section>
      </div>
    </div>
  );
}