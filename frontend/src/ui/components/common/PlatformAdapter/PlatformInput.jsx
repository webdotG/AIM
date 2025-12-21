import React, { useState } from 'react';
import { usePlatform } from '@/layers/platform';
import { useTheme } from '@/layers/theme';
import './PlatformAdapter.css';

const PlatformInput = ({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  label = '',
  error = '',
  disabled = false,
  required = false,
  icon = null,
  maxLength = null,
  autoFocus = false,
  onBlur = null,
  onFocus = null,
  variant = 'default',
  size = 'medium',
  className = '',
  ...props
}) => {
  const { isTelegram, utils } = usePlatform();
  const { themeData } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('light');
    }
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  
  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };
  
  const inputClass = `platform-input ${variant} ${size} ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} ${isTelegram ? 'telegram' : 'web'} ${className}`;
  
  return (
    <div className="platform-input-wrapper">
      {label && (
        <label className="platform-input-label">
          {label}
          {required && <span className="required-marker">*</span>}
        </label>
      )}
      
      <div className="platform-input-container">
        {icon && (
          <div className="platform-input-icon">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputClass}
          {...props}
        />
      </div>
      
      {error && (
        <div className="platform-input-error">
          {error}
        </div>
      )}
      
      {maxLength && !error && (
        <div className="platform-input-counter">
          {(value?.length || 0)} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default PlatformInput;
