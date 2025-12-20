import React from 'react';
import { usePlatform } from '@/layers/platform/usePlatform';
import { useNavigation } from '@/layers/platform/PlatformNavigator';
import MainLayout from './MainLayout';
import TelegramLayout from './TelegramLayout';

const PlatformLayout = ({ children }) => {
  const { platform, config } = usePlatform();
  const { currentRoute, canGoBack, goBack } = useNavigation();

  const layoutProps = {
    currentScreen: currentRoute.screen,
    canGoBack,
    onBack: goBack,
    platformConfig: config
  };

  switch (platform) {
    case 'telegram':
      return (
        <TelegramLayout {...layoutProps}>
          {children}
        </TelegramLayout>
      );
    case 'native':
      // TODO: Добавить NativeLayout когда будет поддержка React Native
      return (
        <MainLayout {...layoutProps}>
          {children}
        </MainLayout>
      );
    case 'web':
    default:
      return (
        <MainLayout {...layoutProps}>
          {children}
        </MainLayout>
      );
  }
};

export default PlatformLayout;