// src/layers/platform/PlatformProvider.jsx
import React, { useEffect, useState } from 'react'; // ← Добавь useState
import PlatformContext from './PlatformContext';
import { NavigationProvider } from './PlatformNavigator';

const PlatformProvider = ({ children }) => { // ← УБРАТЬ platform из пропсов!
  const [platform, setPlatform] = useState('web');
  
  // Стили и конфигурацию для каждой платформы
  const platformConfig = {
    web: {
      layout: 'MainLayout',
      styles: {},
      navigation: 'stack'
    },
    telegram: {
      layout: 'TelegramLayout',
      styles: {
        backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
        textColor: 'var(--tg-theme-text-color, #000000)',
        buttonColor: 'var(--tg-theme-button-color, #2481cc)'
      },
      navigation: 'bottom-tabs'
    },
    native: {
      layout: 'NativeLayout',
      styles: {},
      navigation: 'native-stack'
    }
  };
  
  useEffect(() => {
    // Функция определения платформы
    const detectPlatform = () => {
      // 1. Проверка Telegram Web App
      if (window.Telegram?.WebApp?.initData || 
          window.Telegram?.WebApp?.initDataUnsafe?.user) {
        console.log('Обнаружен Telegram Web App');
        return 'telegram';
      }
      
      // 2. Проверка по URL параметрам
      if (window.location.search.includes('tgWebApp') ||
          window.location.hash.includes('tgWebApp')) {
        console.log('Обнаружен Telegram по URL параметрам');
        return 'telegram';
      }
      
      // 3. Проверка User Agent
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('telegram')) {
        console.log('Обнаружен Telegram по User Agent');
        return 'telegram';
      }
      
      // 4. По умолчанию web
      console.log('Платформа по умолчанию: web');
      return 'web';
    };
    
    const detectedPlatform = detectPlatform();
    console.log('PlatformProvider: определена платформа =', detectedPlatform);
    console.log('User Agent:', navigator.userAgent);
    setPlatform(detectedPlatform);
  }, []);
  
  const config = platformConfig[platform] || platformConfig.web;
  
  return (
    <PlatformContext.Provider value={{ platform, config }}>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </PlatformContext.Provider>
  );
};

export default PlatformProvider;