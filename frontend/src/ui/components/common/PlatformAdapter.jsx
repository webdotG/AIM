import React from 'react';
import { usePlatform } from '@/layers/platform';
import { useNavigate } from 'react-router-dom';

/**
 * usePlatformNavigation - универсальный хук навигации
 * Работает в обеих платформах
 */
export const usePlatformNavigation = () => {
  const { isTelegram } = usePlatform();
  
  // Для Web используем react-router
  const webNavigate = isTelegram ? null : useNavigate();
  
  // Для Telegram получаем функцию навигации из контекста
  // (передается через props в TelegramRouter)
  const [telegramNavigate, setTelegramNavigate] = React.useState(null);
  
  React.useEffect(() => {
    if (isTelegram && window.__TELEGRAM_NAVIGATE__) {
      setTelegramNavigate(() => window.__TELEGRAM_NAVIGATE__);
    }
  }, [isTelegram]);
  
  return React.useCallback((path, params) => {
    if (isTelegram && telegramNavigate) {
      // Telegram навигация
      telegramNavigate(path, params);
    } else if (webNavigate) {
      // Web навигация
      if (typeof path === 'object') {
        webNavigate(path);
      } else {
        webNavigate(path);
      }
    }
  }, [isTelegram, telegramNavigate, webNavigate]);
};

/**
 * PlatformButton - адаптивная кнопка
 * В Telegram использует вибрацию
 */
export const PlatformButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  haptic = true,
  ...props 
}) => {
  const { utils } = usePlatform();
  
  const handleClick = (e) => {
    if (haptic) {
      utils.hapticFeedback('light');
    }
    onClick?.(e);
  };
  
  return (
    <button
      className={`platform-button platform-button-${variant}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * PlatformModal - адаптивная модалка
 * В Telegram может использовать нативные попапы
 */
export const PlatformModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}) => {
  const { isTelegram, utils } = usePlatform();
  
  const handleClose = () => {
    utils.hapticFeedback('light');
    onClose?.();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={`platform-modal platform-modal-${size}`}>
      <div className="platform-modal-overlay" onClick={handleClose} />
      <div className={`platform-modal-content ${isTelegram ? 'telegram' : 'web'}`}>
        <div className="platform-modal-header">
          <h3>{title}</h3>
          <button 
            className="platform-modal-close"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
        <div className="platform-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * PlatformLink - универсальная ссылка
 */
export const PlatformLink = ({ to, children, external = false, ...props }) => {
  const { utils } = usePlatform();
  const navigate = usePlatformNavigation();
  
  const handleClick = (e) => {
    e.preventDefault();
    utils.hapticFeedback('light');
    
    if (external) {
      utils.openLink(to);
    } else {
      navigate(to);
    }
  };
  
  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

/**
 * PlatformConfirm - универсальное подтверждение
 */
export const usePlatformConfirm = () => {
  const { utils } = usePlatform();
  
  return React.useCallback((message) => {
    return utils.showConfirm(message);
  }, [utils]);
};

/**
 * PlatformNotification - универсальные уведомления
 */
export const usePlatformNotification = () => {
  const { utils } = usePlatform();
  
  return React.useCallback((message, type = 'info') => {
    utils.showNotification(message, type);
  }, [utils]);
};

/**
 * PlatformShare - универсальная кнопка "Поделиться"
 */
export const PlatformShareButton = ({ data, children }) => {
  const { utils, capabilities } = usePlatform();
  
  const handleShare = async () => {
    utils.hapticFeedback('light');
    await utils.share(data);
  };
  
  if (!capabilities.hasShare) {
    return null; // Не показываем если нет поддержки
  }
  
  return (
    <button 
      className="platform-share-button"
      onClick={handleShare}
    >
      {children || '📤 Поделиться'}
    </button>
  );
};