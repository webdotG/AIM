import React from 'react';
import { useNavigation } from '@/layers/platform/PlatformNavigator';

const TelegramLayout = ({ children, currentScreen, canGoBack, onBack, platformConfig }) => {
  const { navigate } = useNavigation();

  const getTitle = () => {
    switch(currentScreen) {
      case 'timeline': return 'Лента';
      case 'create-entry': return 'Новая запись';
      case 'entry-detail': return 'Запись';
      case 'analytics': return 'Аналитика';
      case 'settings': return 'Настройки';
      default: return 'AI Journal';
    }
  };

  const handleNavClick = (screen) => {
    if (screen !== currentScreen) {
      navigate(screen);
    }
  };

  // Inline стили для Telegram
  const styles = {
    layout: {
      minHeight: '100vh',
      background: platformConfig.styles.backgroundColor || '#ffffff',
      color: platformConfig.styles.textColor || '#000000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 0,
      margin: 0
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: platformConfig.styles.backgroundColor || '#ffffff',
      borderBottom: '1px solid var(--tg-theme-secondary-bg-color, #f0f0f0)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      minHeight: '56px',
      boxSizing: 'border-box'
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: platformConfig.styles.buttonColor || '#2481cc',
      fontSize: '16px',
      padding: '8px',
      marginRight: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    title: {
      fontSize: '17px',
      fontWeight: 600,
      flex: 1,
      textAlign: 'center',
      color: platformConfig.styles.textColor || '#000000'
    },
    content: {
      padding: '72px 16px 80px',
      minHeight: 'calc(100vh - 152px)',
      overflowY: 'auto',
      boxSizing: 'border-box'
    },
    navbar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: platformConfig.styles.backgroundColor || '#ffffff',
      borderTop: '1px solid var(--tg-theme-secondary-bg-color, #f0f0f0)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0',
      zIndex: 1000
    },
    navButton: {
      background: 'none',
      border: 'none',
      padding: '12px 16px',
      color: 'var(--tg-theme-hint-color, #999999)',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      flex: 1,
      transition: 'color 0.2s'
    },
    navButtonActive: {
      color: platformConfig.styles.buttonColor || '#2481cc'
    }
  };

  return (
    <div style={styles.layout}>
      {/* Header */}
      <header style={styles.header}>
        {canGoBack && (
          <button 
            style={styles.backButton} 
            onClick={onBack}
            disabled={!canGoBack}
          >
            ← Назад
          </button>
        )}
        <h1 style={styles.title}>{getTitle()}</h1>
      </header>

      {/* Main content */}
      <main style={styles.content}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav style={styles.navbar}>
        <button 
          style={{
            ...styles.navButton,
            ...(currentScreen === 'timeline' ? styles.navButtonActive : {})
          }}
          onClick={() => handleNavClick('timeline')}
        >
          <span style={{ fontSize: '20px' }}>📝</span>
          <span style={{ fontSize: '12px' }}>Лента</span>
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(currentScreen === 'analytics' ? styles.navButtonActive : {})
          }}
          onClick={() => handleNavClick('analytics')}
        >
          <span style={{ fontSize: '20px' }}>📊</span>
          <span style={{ fontSize: '12px' }}>Аналитика</span>
        </button>
        <button 
          style={{
            ...styles.navButton,
            ...(currentScreen === 'settings' ? styles.navButtonActive : {})
          }}
          onClick={() => handleNavClick('settings')}
        >
          <span style={{ fontSize: '20px' }}>⚙️</span>
          <span style={{ fontSize: '12px' }}>Настройки</span>
        </button>
      </nav>
    </div>
  );
};

export default TelegramLayout;