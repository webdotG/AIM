import { createContext } from 'react';

const PlatformContext = createContext({
  platform: 'web',
  config: {
    layout: 'MainLayout',
    styles: {},
    navigation: 'stack',
  },
  telegramUser: null,
  utils: {
    hapticFeedback: (type) => {},
    showAlert: (message) => alert(message),
    expand: () => {},
  },
  isTelegram: false,
});

export default PlatformContext;