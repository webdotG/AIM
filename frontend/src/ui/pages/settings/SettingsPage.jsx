// src/ui/pages/settings/SettingsPage.jsx
import React from 'react';
import { useLanguage } from '@/layers/language';
import { useTheme } from '@/layers/theme';
// import { useStore } from '@/store/StoreContext';
import Header from '@/ui/components/layout/Header';
import ThemeSwitcher from '@/ui/components/layout/ThemeSwitcher';
import LanguageSwitcher from '@/ui/components/layout/LanguageSwitcher';
import Button from '@/ui/components/common/Button/Button';
import './SettingsPage.css';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  // const authStore = useStore(state => state.auth);
  
  const handleLogout = () => {
    authStore.logout();
    window.location.href = '/login';
  };
  
  const handleExport = () => {
    alert(t('settings.export_coming_soon'));
  };
  
  const handleClearCache = () => {
    if (confirm(t('settings.clear_cache_confirm'))) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  return (
    <div className="settings-page" data-theme={currentTheme.name}>
      <Header 
        title={t('settings.title')}
        showBack={true}
      />
      
      <main className="settings-content">
        <div className="settings-section">
          <h2>{t('settings.appearance')}</h2>
          <div className="settings-group">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
        
        <div className="settings-section">
          <h2>{t('settings.data')}</h2>
          <div className="settings-group">
            <Button 
              onClick={handleExport}
              variant="outline"
              fullWidth
            >
              {t('settings.export_data')}
            </Button>
            
            <Button 
              onClick={handleClearCache}
              variant="outline"
              fullWidth
            >
              {t('settings.clear_cache')}
            </Button>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>{t('settings.account')}</h2>
          <div className="settings-group">
            <Button 
              onClick={handleLogout}
              variant="danger"
              fullWidth
            >
              {t('settings.logout')}
            </Button>
          </div>
        </div>
        
        <div className="settings-footer">
          <p className="version">AIM v1.0.0</p>
          <p className="copyright">© 2025 AIM Journal</p>
        </div>
      </main>
    </div>
  );
}