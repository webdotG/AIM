import { useState } from 'react';

export default function Card({
  children,
  onClick,
  className = '',
  variant = 'default',
  noPadding = false,
}) {
  const classes = [
    'card',
    `card--${variant}`,
    noPadding ? 'card--no-padding' : '',
    className,
  ].filter(Boolean).join(' ');

  if (onClick) {
    return (
      <div className={classes} onClick={onClick}>
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}