import React from 'react';
import { usePlatform } from '@/layers/platform';
import './PlatformAdapter.css';

const PlatformModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
  showCloseButton = true,
  ...props 
}) => {
  const { isTelegram, utils } = usePlatform();
  
  const handleClose = () => {
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('light');
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  const modalClass = `platform-modal ${size} ${isTelegram ? 'telegram' : 'web'}`;
  
  return (
    <div className="platform-modal-overlay" onClick={handleClose}>
      <div className={modalClass} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="platform-modal-header">
            <h3>{title}</h3>
            {showCloseButton && (
              <button className="platform-modal-close" onClick={handleClose}>
                ✕
              </button>
            )}
          </div>
        )}
        <div className="platform-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PlatformModal;
