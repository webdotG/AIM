import React, { useState } from 'react';
import { usePlatform } from '@/layers/platform';
import { useTheme } from '@/layers/theme';
import './PlatformAdapter.css';

const PlatformTextArea = ({
  value,
  onChange,
  placeholder = '',
  label = '',
  error = '',
  disabled = false,
  required = false,
  rows = 3,
  maxLength = null,
  autoFocus = false,
  onBlur = null,
  onFocus = null,
  resize = 'vertical',
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
  
  const textareaClass = `platform-textarea ${isFocused ? 'focused' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} ${isTelegram ? 'telegram' : 'web'} ${className}`;
  
  return (
    <div className="platform-textarea-wrapper">
      {label && (
        <label className="platform-textarea-label">
          {label}
          {required && <span className="required-marker">*</span>}
        </label>
      )}
      
      <textarea
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        rows={rows}
        className={textareaClass}
        style={{ resize }}
        {...props}
      />
      
      <div className="platform-textarea-footer">
        {error && (
          <div className="platform-textarea-error">
            {error}
          </div>
        )}
        
        {maxLength && (
          <div className="platform-textarea-counter">
            {(value?.length || 0)} / {maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformTextArea;
