import { Platform, View, Text, StyleSheet } from 'react-native';

export const usePlatform = () => {
  return {
    platform: Platform.OS,
    isWeb: Platform.OS === 'web',
    isMobile: Platform.OS === 'ios' || Platform.OS === 'android',
    isTelegram: !!(globalThis.Telegram?.WebApp?.initDataUnsafe?.user || Platform.OS === 'web'),
  };
};