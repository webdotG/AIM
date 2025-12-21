import { useCallback } from 'react';
import { usePlatform } from '@/layers/platform';

export const usePlatformNotification = () => {
  const { isTelegram, utils } = usePlatform();
  
  return useCallback((message, type = 'info') => {
    console.log(`Notification [${type}]: ${message}`);
    
    if (isTelegram) {
      // В Telegram можно показать alert
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(message);
      }
      
      if (utils.hapticFeedback) {
        const hapticType = type === 'error' ? 'error' : 
                          type === 'success' ? 'success' : 'light';
        utils.hapticFeedback(hapticType);
      }
    } else {
      // В Web просто в консоль
      console.log(message);
    }
  }, [isTelegram, utils]);
};
