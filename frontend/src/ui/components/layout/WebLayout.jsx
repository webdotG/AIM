
import { Outlet } from 'react-router-dom';
import { useLanguage } from '@/layers/language';
import { useTheme } from '@/layers/theme';
import WebNavigation from './WebNavigation';
import Header from '@/ui/components/layout/Header';
import './WebLayout.css';

const WebLayout = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="web-layout" data-theme={theme}>
      {/* Навигация */}
      {/* <WebNavigation /> */}
      
      {/* Основной контент */}
      <main className="page-content">
        {/* Автоматически скрываем Header на мобильных устройствах */}
        <div className="mobile-header">
          <Header />
        </div>
        
        {/* Контейнер для контента */}
        <div className="content-container">
          <Outlet />
        </div>
        
        {/* Футер */}
        <footer className="page-footer">
          <div className="footer-content">
            <div className="footer-info">
              <span className="footer-text">
                © {new Date().getFullYear()} AIM. {t('common.allRightsReserved')}
              </span>
              <div className="footer-links">
                <a href="/privacy" className="footer-link">
                  {t('settings.about.privacyPolicy')}
                </a>
                <a href="/terms" className="footer-link">
                  {t('settings.about.termsOfService')}
                </a>
                <a href="/help" className="footer-link">
                  {t('settings.about.support')}
                </a>
              </div>
            </div>
            <div className="footer-version">
              <span className="version-text">
                {t('settings.about.version')}: 0.1.0
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default WebLayout;