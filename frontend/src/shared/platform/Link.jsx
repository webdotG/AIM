import { usePlatform } from '@/layers/platform';
import { NavLink } from 'react-router-dom';

export default function Link({ to, children, className = '', onClick, ...rest }) {
  const { platform } = usePlatform();

  if (platform === 'telegram') {
    const { navigate } = require('@/shared/platform/useNavigator').useNavigator();

    const handleClick = (e) => {
      e.preventDefault();
      if (onClick) onClick(e);
      navigate(to);
    };

    return (
      <a
        href={to}
        onClick={handleClick}
        className={`link ${className}`}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${className}${isActive ? ' active' : ''}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </NavLink>
  );
}