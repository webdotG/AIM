import React, { useRef, useCallback, useEffect } from 'react';
import HCaptchaComponent from '@hcaptcha/react-hcaptcha';
import './HCaptcha.css';

export default function HCaptcha({ 
  onVerify, 
  onError,
  onExpire,
  theme = 'light',
  isDevMode = import.meta.env.DEV
}) {
  const captchaRef = useRef(null);
  const wrapperRef = useRef(null);
  
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001';

  // Хук для стилизации внутренних элементов hCaptcha
  useEffect(() => {
    if (!wrapperRef.current) return;
    
    const styleHCaptchaElements = () => {
      // Ждем загрузки hCaptcha
      setTimeout(() => {
        const container = wrapperRef.current;
        if (!container) return;
        
        // 1. Стилизация iframe
        const iframes = container.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          iframe.style.borderRadius = '8px';
          iframe.style.border = '1px solid #ddd';
          iframe.style.overflow = 'hidden';
        });
        
        // 2. Стилизация текстовых элементов (вне iframe)
        // Ищем все div с текстом
        const allDivs = container.querySelectorAll('div');
        allDivs.forEach(div => {
          const text = div.textContent || '';
          
          // Варнинги (обычно красные)
          if (text.includes('Упс') || 
              text.includes('Oops') || 
              text.includes('error') || 
              text.includes('ошибка') ||
              div.style.color.includes('rgb(204, 0, 0)') ||
              div.style.color.includes('#cc0000')) {
            
            console.log('Found warning element:', text);
            div.style.position = 'relative';
            div.style.bottom = '25px';
            div.style.fontSize = '12px';
            div.style.padding = '5px';
            div.style.borderRadius = '4px';
            div.style.background = 'rgba(255, 107, 107, 0.1)';
            div.style.border = '1px solid #ff6b6b';
          }
          
          // Инфо/статус сообщения (обычно синие/зеленые)
          if (text.includes('Verifying') || 
              text.includes('Проверка') ||
              text.includes('complete') ||
              text.includes('выполнено') ||
              div.style.color.includes('rgb(0, 128, 0)') ||
              div.style.color.includes('#008000')) {
            
            console.log('Found status element:', text);
            div.style.position = 'relative';
            div.style.bottom = '25px';
            div.style.fontSize = '12px';
            div.style.padding = '5px';
            div.style.borderRadius = '4px';
            div.style.background = 'rgba(81, 207, 102, 0.1)';
            div.style.border = '1px solid #51cf66';
          }
        });
        
        // 3. Стилизация label и span элементов
        const labelsAndSpans = container.querySelectorAll('label, span');
        labelsAndSpans.forEach(el => {
          const text = el.textContent || '';
          if (text.includes('hCaptcha') || text.includes('Privacy') || text.includes('Terms')) {
            el.style.fontSize = '10px';
            el.style.opacity = '0.7';
            el.style.marginTop = '5px';
          }
        });
      }, 1500); // Даем время на загрузку hCaptcha
    };
    
    styleHCaptchaElements();
    
    // Отслеживаем изменения DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          styleHCaptchaElements();
        }
      });
    });
    
    observer.observe(wrapperRef.current, { 
      childList: true, 
      subtree: true,
      attributes: true 
    });
    
    return () => observer.disconnect();
  }, []);

  // Обработчик верификации - в dev режиме всегда пропускаем
  const handleVerify = useCallback((token) => {
    // console.log('=== hCaptcha Verification ===');
    // console.log('Token received:', token ? 'YES' : 'NO');
    // console.log('Token value (first 10 chars):', token ? token.substring(0, 10) + '...' : 'null');
    // console.log('Environment:', isDevMode ? 'DEV' : 'PROD');
    // console.log('============================');
    
    if (isDevMode) {
      // console.log('DEV MODE: Bypassing hCaptcha verification');
      // В dev режиме всегда вызываем onVerify, даже если токен пустой
      const finalToken = token || 'dev-bypass-token-' + Date.now();
      onVerify(finalToken);
    } else {
      // В production режиме только с валидным токеном
      if (token && onVerify) {
        onVerify(token);
      }
    }
  }, [onVerify, isDevMode]);

  // Обработчик ошибок - в dev режиме игнорируем
  const handleError = useCallback((error) => {
    console.error('hCaptcha error:', error);
    
    if (isDevMode) {
      // console.log('DEV MODE: Ignoring hCaptcha error, auto-verifying');
      // В dev режиме при ошибке все равно пропускаем
      handleVerify('dev-error-bypass-' + Date.now());
    } else if (onError) {
      onError(error);
    }
  }, [onError, isDevMode, handleVerify]);

  // Обработчик истечения токена
  const handleExpire = useCallback(() => {
    console.warn('hCaptcha token expired');
    
    if (isDevMode) {
      // console.log('DEV MODE: Auto-renewing expired token');
      // В dev режиме сразу даем новый токен
      handleVerify('dev-renewed-token-' + Date.now());
    } else if (onExpire) {
      onExpire();
    }
  }, [onExpire, isDevMode, handleVerify]);

  // В dev режиме дополнительно: автоматическая верификация через 3 секунды
  // useEffect(() => {
  //   if (!isDevMode) return;
    
  //   const autoVerifyTimer = setTimeout(() => {
  //     // console.log('DEV MODE: Auto-verifying in 3 seconds...');
      
  //     // Если капча еще не была верифицирована
  //     if (captchaRef.current) {
  //       // Пытаемся выполнить капчу автоматически
  //       try {
  //         // Этот код выполнится только если hCaptcha загрузилась
  //         console.log('DEV: Trying to auto-solve hCaptcha');
  //       } catch (err) {
  //         console.log('DEV: Could not auto-solve, using fallback');
  //         handleVerify('dev-auto-token-' + Date.now());
  //       }
  //     }
  //   }, 3000);
    
  //   return () => clearTimeout(autoVerifyTimer);
  // }, [isDevMode, handleVerify]);

  // Если нет siteKey (даже в dev режиме используем тестовый)
  const actualSiteKey = siteKey || '10000000-ffff-ffff-ffff-000000000001';

  return (
    <div ref={wrapperRef} className="hcaptcha-wrapper">
      
      <HCaptchaComponent
        ref={captchaRef}
        sitekey={actualSiteKey}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        theme={theme}
        size="normal"
      />
      
      {/* Кастомные подсказки */}
      <div style={{
        fontSize: '11px',
        color: '#666',
        marginTop: '8px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        gap: '15px'
      }}>
        <span>Security check</span>
        {isDevMode && <span style={{color: 'BLACK'}}> Dev bypass active</span>}
      </div>
    </div>
  );
}