import './Button.css';

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
  const buttonClasses = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    disabled ? 'button--disabled' : '',
    loading ? 'button--loading' : '',
    fullWidth ? 'button--full-width' : ''
  ].filter(Boolean).join(' ');

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
      className={buttonClasses}
    >
      {loading ? (
        <Spinner size={size} />
      ) : icon ? (
        <span className="button__icon">{icon}</span>
      ) : null}
      {children && <span className="button__text">{children}</span>}
    </button>
  );
}

function Spinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'spinner--small',
    medium: 'spinner--medium',
    large: 'spinner--large'
  };

  return (
    <div className={`spinner ${sizeClasses[size]}`} />
  );
}

export default Button;