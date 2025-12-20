
function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  fullWidth = false,
  type = 'button'
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit'
  };

  const variants = {
    primary: {
      background: 'var(--color-primary, #007bff)',
      color: 'white',
      ':hover': {
        background: 'var(--color-primary-dark, #0056b3)'
      }
    },
    secondary: {
      background: '#6c757d',
      color: 'white',
      ':hover': {
        background: '#5a6268'
      }
    },
    danger: {
      background: 'var(--color-error, #F44336)',
      color: 'white',
      ':hover': {
        background: '#d32f2f'
      }
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text, #212121)',
      border: '1px solid var(--color-border, #e0e0e0)',
      ':hover': {
        background: 'var(--color-surface-hover, #f5f5f5)'
      }
    },
    success: {
      background: 'var(--color-success, #4CAF50)',
      color: 'white',
      ':hover': {
        background: '#388e3c'
      }
    }
  };

  const sizes = {
    small: {
      padding: '6px 12px',
      fontSize: '13px',
      minHeight: '32px'
    },
    medium: {
      padding: '10px 20px',
      fontSize: '14px',
      minHeight: '40px'
    },
    large: {
      padding: '14px 28px',
      fontSize: '16px',
      minHeight: '48px'
    }
  };

  const buttonStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.target.style, variants[variant][':hover']);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.target.style.background = variants[variant].background;
        }
      }}
    >
      {loading ? (
        <Spinner size={size} />
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

export default Button

function Spinner({ size = 'medium' }) {
  const sizes = {
    small: 14,
    medium: 16,
    large: 20
  };

  const spinnerSize = sizes[size];

  return (
    <div
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}
    />
  );
}
