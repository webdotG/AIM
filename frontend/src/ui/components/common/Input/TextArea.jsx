import { useState } from "react";
import './Textarea.css';

function Textarea({
  value,
  onChange,
  placeholder = '',
  label = '',
  error = '',
  disabled = false,
  required = false,
  maxLength = null,
  rows = 4,
  autoFocus = false
}) {
  const [isFocused, setIsFocused] = useState(false);

  const wrapperClasses = [
    'textarea-wrapper',
    error ? 'has-error' : '',
    isFocused ? 'is-focused' : '',
    disabled ? 'is-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="textarea-field"
        rows={rows}
      />
      
      {error && <div className="textarea-error">{error}</div>}
      
      {maxLength && !error && (
        <div className="textarea-counter">
          {value?.length || 0} / {maxLength}
        </div>
      )}
    </div>
  );
}

export default Textarea;