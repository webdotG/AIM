// src/ui/components/common/Input/Input.jsx
import { useState } from "react";

function Input({
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
  onFocus = null
}) {
  const [isFocused, setIsFocused] = useState(false);

  const wrapperStyle = {
    marginBottom: '16px',
    width: '100%'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: error ? 'var(--color-error, #F44336)' : 'var(--color-text, #212121)'
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: icon ? '10px 12px 10px 40px' : '10px 12px',
    fontSize: '14px',
    border: `2px solid ${error ? 'var(--color-error, #F44336)' : isFocused ? 'var(--color-primary, #007bff)' : 'var(--color-border, #e0e0e0)'}`,
    borderRadius: '8px',
    background: disabled ? 'var(--color-surface-hover, #f5f5f5)' : 'var(--color-surface, white)',
    color: 'var(--color-text, #212121)',
    transition: 'all 0.2s',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    color: error ? 'var(--color-error, #F44336)' : 'var(--color-text-secondary, #757575)',
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    pointerEvents: 'none'
  };

  const errorStyle = {
    marginTop: '4px',
    fontSize: '12px',
    color: 'var(--color-error, #F44336)'
  };

  const counterStyle = {
    marginTop: '4px',
    fontSize: '12px',
    color: 'var(--color-text-secondary, #757575)',
    textAlign: 'right'
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // ИСПРАВЛЯЕМ: onChange должен передавать value, а не событие
  const handleChange = (e) => {
    console.log('Input handleChange:', {
      value: e.target.value,
      event: e.type,
      shouldCallOnChange: !!onChange,
      onChangeType: typeof onChange
    });
    
    if (onChange && typeof onChange === 'function') {
      // Передаем значение, а не событие
      onChange(e.target.value);
    }
  };

  return (
    <div style={wrapperStyle}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--color-error, #F44336)' }}> *</span>}
        </label>
      )}
      
      <div style={inputWrapperStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        
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
          style={inputStyle}
        />
      </div>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      {maxLength && !error && (
        <div style={counterStyle}>
          {(value?.length || 0)} / {maxLength}
        </div>
      )}
    </div>
  );
}

export default Input;