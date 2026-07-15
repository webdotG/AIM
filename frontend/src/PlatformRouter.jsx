import { Platform, View, StyleSheet } from 'react-native';
import { usePlatform } from '@/layers/platform';
import WebRouter from '@/platforms/web/router';
import TelegramRouter from '@/platforms/telegram/router';

const PlatformRouter = () => {
  const { isTelegram } = usePlatform();

  if (isTelegram) {
    return <TelegramRouter />;
  }

  return <WebRouter />;
};

export default PlatformRouter;