import React from 'react';
import PlatformContext from './PlatformContext';
import { NavigationProvider } from './PlatformNavigator';

const PlatformProvider = ({ children, platform }) => {
  // стили и конфигурацию для каждой платформы
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

  const config = platformConfig[platform] || platformConfig.web;
// console.log('platformConfig[platform] to:', config);
  return (
    <PlatformContext.Provider value={{ platform, config }}>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </PlatformContext.Provider>
  );
};

export default PlatformProvider;