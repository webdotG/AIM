import React, { useEffect } from 'react';
import { useLanguage } from '@/layers/language';
import './Modal.css';

function Modal({
  isOpen,
  onClose,
  title = '',
  children,
  
  // Размер и поведение
  size = 'medium',
  closeOnOverlay = true,
  showCloseButton = true,
  
  // Кастомный header
  header = null,
  
  // Кастомный footer
  footer = null,
  
  // Стилизация
  overlayClassName = '',
  modalClassName = '',
  headerClassName = '',
  titleClassName = '',
  bodyClassName = '',
  footerClassName = '',
  
  // CSS стили
  overlayStyle = {},
  modalStyle = {},
  headerStyle = {},
  titleStyle = {},
  bodyStyle = {},
  footerStyle = {},
  
  // Кнопка закрытия
  closeButtonContent = '×',
  closeButtonClassName = '',
  closeButtonStyle = {},
  
  // Анимации
  animationType = 'slide-up', // 'slide-up', 'fade', 'scale', 'none'
  animationDuration = 300,
  
  // Дополнительные опции
  disableBodyScroll = true,
  disableEscapeClose = false,
  hideHeader = false,
  hideFooter = true, // по умолчанию скрываем, если не переданы footer
  
  // Вспомогательные функции
  onOpen = () => {},
  onCloseStart = () => {},
  
  // Префиксы для CSS классов
  classNamePrefix = 'modal'
}) {
  const { t } = useLanguage();
  
  useEffect(() => {
    if (!isOpen) return;
    
    onOpen();
    
    if (disableBodyScroll) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      if (disableBodyScroll) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, disableBodyScroll, onOpen]);

  useEffect(() => {
    if (disableEscapeClose || !isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCloseStart();
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, onCloseStart, disableEscapeClose]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onCloseStart();
      onClose();
    }
  };

  const handleCloseClick = () => {
    onCloseStart();
    onClose();
  };

  if (!isOpen) return null;

  // Размеры
  const sizes = {
    xs: '320px',
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
    fullscreen: '95vw'
  };

  const width = sizes[size] || size;

  // Анимации
  const getAnimationClass = () => {
    if (animationType === 'none') return '';
    return `${classNamePrefix}--${animationType}`;
  };

  // CSS переменные для анимации
  const cssVariables = {
    '--modal-animation-duration': `${animationDuration}ms`
  };

  return (
    <>
      {/* Динамические стили */}
      <style>
        {`
          .${classNamePrefix}--slide-up {
            animation: ${classNamePrefix}SlideUp var(--modal-animation-duration) ease-out;
          }
          
          .${classNamePrefix}--fade {
            animation: ${classNamePrefix}FadeIn var(--modal-animation-duration) ease-out;
          }
          
          .${classNamePrefix}--scale {
            animation: ${classNamePrefix}Scale var(--modal-animation-duration) ease-out;
          }
          
          @keyframes ${classNamePrefix}SlideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes ${classNamePrefix}FadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes ${classNamePrefix}Scale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      {/* Overlay */}
      <div
        className={`${classNamePrefix}__overlay ${overlayClassName}`}
        style={{
          ...cssVariables,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
          animation: `${classNamePrefix}FadeIn var(--modal-animation-duration) ease-out`,
          ...overlayStyle
        }}
        onClick={handleOverlayClick}
      >
        {/* Модальное окно */}
        <div
          className={`${classNamePrefix} ${modalClassName} ${getAnimationClass()}`}
          style={{
            background: 'var(--color-surface, white)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: width,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            ...modalStyle
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - кастомный или дефолтный */}
          {!hideHeader && (header || title || showCloseButton) && (
            <div
              className={`${classNamePrefix}__header ${headerClassName}`}
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border, #e0e0e0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                ...headerStyle
              }}
            >
              {header || (
                <>
                  {title && (
                    <h2
                      className={`${classNamePrefix}__title ${titleClassName}`}
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--color-text, #212121)',
                        margin: 0,
                        flex: 1,
                        ...titleStyle
                      }}
                    >
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={handleCloseClick}
                      className={`${classNamePrefix}__close-button ${closeButtonClassName}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        color: 'var(--color-text-secondary, #757575)',
                        cursor: 'pointer',
                        padding: '4px',
                        lineHeight: 1,
                        transition: 'color 0.2s',
                        marginLeft: '16px',
                        ...closeButtonStyle
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--color-text, #212121)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary, #757575)'}
                      aria-label={t('common.close') || 'Close'}
                    >
                      {closeButtonContent}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Body */}
          <div
            className={`${classNamePrefix}__body ${bodyClassName}`}
            style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
              ...bodyStyle
            }}
          >
            {children}
          </div>

          {/* Footer - кастомный или дефолтный */}
          {!hideFooter && footer && (
            <div
              className={`${classNamePrefix}__footer ${footerClassName}`}
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-border, #e0e0e0)',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                flexShrink: 0,
                ...footerStyle
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// HOC для удобного создания модалок с дефолтными кнопками
export const withDefaultFooter = (ModalComponent, defaultFooterProps = {}) => {
  return function ModalWithDefaultFooter({
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    showCancel = true,
    showConfirm = true,
    confirmButtonProps = {},
    cancelButtonProps = {},
    footerAlign = 'right',
    ...props
  }) {
    const { t } = useLanguage();
    
    const defaultFooter = (
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: footerAlign === 'center' ? 'center' : 
                      footerAlign === 'left' ? 'flex-start' : 'flex-end',
        width: '100%'
      }}>
        {showCancel && (
          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              else if (props.onClose) props.onClose();
            }}
            style={{
              padding: '10px 20px',
              background: 'var(--color-secondary, #6c757d)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              ...cancelButtonProps.style
            }}
            {...cancelButtonProps}
          >
            {cancelText || t('common.cancel')}
          </button>
        )}
        
        {showConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: 'var(--color-primary, #007bff)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              ...confirmButtonProps.style
            }}
            {...confirmButtonProps}
          >
            {confirmText || t('common.confirm')}
          </button>
        )}
      </div>
    );

    return (
      <ModalComponent
        {...props}
        hideFooter={false}
        footer={defaultFooter}
      />
    );
  };
};

// Предварительно сконфигурированные модалки
export const ConfirmModal = withDefaultFooter(Modal, {
  title: 'Подтверждение',
  size: 'sm'
});

export const AlertModal = withDefaultFooter(Modal, {
  title: 'Уведомление',
  size: 'sm',
  showCancel: false,
  confirmText: 'OK'
});

export const FormModal = withDefaultFooter(Modal, {
  title: 'Форма',
  size: 'md'
});

// Хук для управления состоянием модалки
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    modalProps: {
      isOpen,
      onClose: close
    }
  };
};

export default Modal;