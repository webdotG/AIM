import React from 'react';
import { usePlatform } from '@/layers/platform';
import './PlatformAdapter.css';

const PlatformButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  haptic = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const { isTelegram, utils } = usePlatform();
  
  const handleClick = (e) => {
    if (disabled || loading) return;
    
    if (isTelegram && haptic && utils.hapticFeedback) {
      utils.hapticFeedback('light');
    }
    
    if (onClick) onClick(e);
  };
  
  const buttonClass = `platform-button ${variant} ${size} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''} ${fullWidth ? 'full-width' : ''} ${isTelegram ? 'telegram' : 'web'} ${className}`;
  
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={buttonClass}
      {...props}
    >
      {loading && <div className="button-spinner" />}
      <span className="button-content">{children}</span>
    </button>
  );
};

export default PlatformButton;
