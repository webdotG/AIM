import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { usePlatform } from '@/layers/platform';
import { useLanguage } from '@/layers/language';
import './TelegramLayout.css';

/**
 * TelegramLayout - Layout специально для Telegram Mini App
 * НЕ использует react-router компоненты
 */
const TelegramLayout = observer(({ children, navigate, currentRoute }) => {
  const { utils, telegramUser } = usePlatform();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Настройка главной кнопки Telegram
    if (window.Telegram?.WebApp?.MainButton) {
      const mainButton = window.Telegram.WebApp.MainButton;
      
      // Показываем кнопку на определенных экранах
      if (currentRoute === 'home') {
        mainButton.setText(t('entries.form.submit') || 'Создать запись');
        mainButton.show();
        mainButton.onClick(() => {
          // Логика создания записи
          console.log('Create entry clicked');
        });
      } else {
        mainButton.hide();
      }
    }

    // BackButton для Telegram
    if (window.Telegram?.WebApp?.BackButton) {
      const backButton = window.Telegram.WebApp.BackButton;
      
      if (currentRoute !== 'home') {
        backButton.show();
        backButton.onClick(() => navigate('home'));
      } else {
        backButton.hide();
      }
    }
  }, [currentRoute, navigate, t]);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
    utils.hapticFeedback('light');
  };

  const handleNavigate = (route) => {
    navigate(route);
    setShowMenu(false);
    utils.hapticFeedback('light');
  };

  return (
    <div className="telegram-layout">
      {/* Header */}
      <header className="tg-header">
        <div className="tg-header-content">
          <button 
            className="tg-menu-button"
            onClick={handleMenuToggle}
            aria-label="Menu"
          >
            ☰
          </button>
          
          <h1 className="tg-title">AIM Journal</h1>
          
          {telegramUser && (
            <div className="tg-user-badge">
              {telegramUser.firstName}
            </div>
          )}
        </div>
      </header>

      {/* Side Menu */}
      {showMenu && (
        <>
          <div 
            className="tg-overlay" 
            onClick={() => setShowMenu(false)}
          />
          <nav className="tg-menu">
            <div className="tg-menu-header">
              <h2>{t('common.menu') || 'Меню'}</h2>
              <button 
                className="tg-menu-close"
                onClick={() => setShowMenu(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            
            <div className="tg-menu-items">
              <button 
                className={`tg-menu-item ${currentRoute === 'home' ? 'active' : ''}`}
                onClick={() => handleNavigate('home')}
              >
                <span className="tg-menu-icon">📝</span>
                <span>{t('navigation.entries') || 'Создать запись'}</span>
              </button>
              
              <button 
                className={`tg-menu-item ${currentRoute === 'analytics' ? 'active' : ''}`}
                onClick={() => handleNavigate('analytics')}
              >
                <span className="tg-menu-icon">📊</span>
                <span>{t('navigation.analytics') || 'Аналитика'}</span>
              </button>
              
              <button 
                className={`tg-menu-item ${currentRoute === 'settings' ? 'active' : ''}`}
                onClick={() => handleNavigate('settings')}
              >
                <span className="tg-menu-icon">⚙️</span>
                <span>{t('navigation.settings') || 'Настройки'}</span>
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Main Content */}
      <main className="tg-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="tg-bottom-nav">
        <button 
          className={`tg-nav-item ${currentRoute === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigate('home')}
        >
          <span className="tg-nav-icon">📝</span>
          <span className="tg-nav-label">{t('navigation.entries') || 'Записи'}</span>
        </button>
        
        <button 
          className={`tg-nav-item ${currentRoute === 'analytics' ? 'active' : ''}`}
          onClick={() => handleNavigate('analytics')}
        >
          <span className="tg-nav-icon">📊</span>
          <span className="tg-nav-label">{t('navigation.analytics') || 'Аналитика'}</span>
        </button>
        
        <button 
          className={`tg-nav-item ${currentRoute === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavigate('settings')}
        >
          <span className="tg-nav-icon">⚙️</span>
          <span className="tg-nav-label">{t('navigation.settings') || 'Настройки'}</span>
        </button>
      </nav>
    </div>
  );
});

export default TelegramLayout;