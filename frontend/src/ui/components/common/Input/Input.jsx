import { useState } from "react";
import './Input.css';

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

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (onChange && typeof onChange === 'function') {
      onChange(e.target.value);
    }
  };

  const wrapperClasses = [
    'input-wrapper',
    error ? 'has-error' : '',
    isFocused ? 'is-focused' : '',
    disabled ? 'is-disabled' : '',
    icon ? 'has-icon' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}
      
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        
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
          className="input-field"
        />
      </div>
      
      {error && <div className="input-error">{error}</div>}
      
      {maxLength && !error && (
        <div className="input-counter">
          {(value?.length || 0)} / {maxLength}
        </div>
      )}
    </div>
  );
}

export default Input;