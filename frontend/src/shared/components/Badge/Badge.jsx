import clsx from 'clsx';

export default function Badge({
  children,
  variant = 'default',
  className = '',
  onClick,
}) {
  const classes = clsx('badge', `badge--${variant}`, className);

  if (onClick) {
    return (
      <span className={classes} onClick={onClick}>
        {children}
      </span>
    );
  }

  return <span className={classes}>{children}</span>;
}