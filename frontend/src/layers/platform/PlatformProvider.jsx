import React, { useEffect, useState, useCallback } from 'react';
import PlatformContext from './PlatformContext';
import { NavigationProvider } from './PlatformNavigator';

const PlatformProvider = ({ children }) => {
  const [platform, setPlatform] = useState('web');
  const [telegramUser, setTelegramUser] = useState(null);
  const [utils, setUtils] = useState({
    hapticFeedback: (type) => {},
    showAlert: (message) => alert(message),
    expand: () => {},
  });

  const platformConfig = {
    web: {
      layout: 'MainLayout',
      styles: {},
      navigation: 'stack',
    },
    telegram: {
      layout: 'TelegramLayout',
      styles: {
        backgroundColor: 'var(--tg-theme-bg-color, #fff)',
        textColor: 'var(--tg-theme-text-color, #000)',
        buttonColor: 'var(--tg-theme-button-color, #2481cc)',
      },
      navigation: 'bottom-tabs',
    },
    native: {
      layout: 'NativeLayout',
      styles: {},
      navigation: 'native-stack',
    },
  };

  useEffect(() => {
    const detectPlatform = () => {
      if (window.Telegram?.WebApp?.initData) {
        console.log('Обнаружен Telegram Web App');
        return 'telegram';
      }

      if (window.location.search.includes('tgWebApp') ||
          window.location.hash.includes('tgWebApp')) {
        console.log('Обнаружен Telegram по URL параметрам');
        return 'telegram';
      }

      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('telegram')) {
        console.log('Обнаружен Telegram по User Agent');
        return 'telegram';
      }

      console.log('Платформа по умолчанию: web');
      return 'web';
    };

    const detectedPlatform = detectPlatform();
    console.log('PlatformProvider: определена платформа =', detectedPlatform);
    setPlatform(detectedPlatform);

    if (detectedPlatform === 'telegram' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setTelegramUser(tg.initDataUnsafe?.user || null);
      setUtils({
        hapticFeedback: (type) => {
          try {
            tg.HapticFeedback?.notificationOccurred?.(type) ||
              tg.HapticFeedback?.impactOccurred?.('light');
          } catch (e) {
            console.warn('hapticFeedback error:', e);
          }
        },
        showAlert: (message) => tg.showAlert?.(message) || alert(message),
        expand: () => tg.expand?.(),
      });
      tg.ready?.();
      tg.expand?.();
    }
  }, []);

  const config = platformConfig[platform] || platformConfig.web;
  const isTelegram = platform === 'telegram';

  return (
    <PlatformContext.Provider value={{ platform, config, telegramUser, utils, isTelegram }}>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </PlatformContext.Provider>
  );
};

export default PlatformProvider;