import { useState } from "react";

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

  const textareaStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: `2px solid ${error ? 'var(--color-error, #F44336)' : isFocused ? 'var(--color-primary, #007bff)' : 'var(--color-border, #e0e0e0)'}`,
    borderRadius: '8px',
    background: disabled ? 'var(--color-surface-hover, #f5f5f5)' : 'var(--color-surface, white)',
    color: 'var(--color-text, #212121)',
    transition: 'all 0.2s',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: `${rows * 24}px`
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

  return (
    <div style={wrapperStyle}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--color-error, #F44336)' }}> *</span>}
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
        style={textareaStyle}
      />
      
      {error && <div style={errorStyle}>{error}</div>}
      
      {maxLength && !error && (
        <div style={counterStyle}>
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}

export default Textarea